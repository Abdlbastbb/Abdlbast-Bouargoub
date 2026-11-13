import React, { useEffect, useRef, useState, useCallback } from 'react';
import { VideoPlayer, VideoSkin, Video } from '@videojs/react/video';
import { VERSION as VIDEOJS_VERSION } from '@videojs/react';
import Hls from 'hls.js';
import '@videojs/react/video/skin.css';
import { AlertTriangle, RefreshCw, Radio } from 'lucide-react';
import { FilmReel } from '../data/cinemaReels';
import {
  AspectRatio,
  clampVolume,
  clampPlaybackRate,
  isHlsStreamSource,
} from '../utils/player-math';
import {
  checkBrowserPlaybackSupport,
  checkUrlTokenExpiration,
  probeStreamFailure,
  formatPlaybackDiagnostics,
  type DiagnosedPlaybackError,
  type HlsJsErrorInput,
} from '../utils/stream-diagnostics';
import { LivingFrameHUD } from './LivingFrameHUD';

interface PlayerErrorBoundaryProps {
  resetKey: string;
  onError: (err: Error) => void;
  children: React.ReactNode;
}

class PlayerErrorBoundary extends React.Component<
  PlayerErrorBoundaryProps,
  { hasError: boolean }
> {
  constructor(props: PlayerErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  componentDidUpdate(prevProps: PlayerErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

interface NexusVideoPlayerProps {
  film: FilmReel;
  autoPlayToken?: number;
  ambientAuraActive: boolean;
  cinemaDimActive: boolean;
  activeAspectRatio: AspectRatio;
  activeColorGrade: string;
  onToggleAmbientAura: () => void;
  onToggleCinemaDim: () => void;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onColorGradeChange: (grade: 'pristine' | 'celluloid' | 'noir' | 'vermilion') => void;
  onOpenInspector: () => void;
  onOpenStreamManager: () => void;
  onVideoStateUpdate?: (state: any) => void;
}

export function NexusVideoPlayer({
  film,
  autoPlayToken = 0,
  ambientAuraActive,
  cinemaDimActive,
  activeAspectRatio,
  activeColorGrade,
  onToggleAmbientAura,
  onToggleCinemaDim,
  onAspectRatioChange,
  onColorGradeChange,
  onOpenInspector,
  onOpenStreamManager,
  onVideoStateUpdate,
}: NexusVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsInstanceRef = useRef<Hls | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  const hideControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bufferWatchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTelemetrySyncRef = useRef<number>(0);
  const streamSessionRef = useRef<number>(0);
  const pendingAutoPlayKeyRef = useRef<string | null>(null);
  const retryRequestedRef = useRef<boolean>(false);
  const prevAutoPlayTokenRef = useRef<number>(autoPlayToken);
  const [retryNonce, setRetryNonce] = useState(0);

  const playerKey = `${film.id}::${film.streamUrl}::${retryNonce}`;

  if (autoPlayToken !== prevAutoPlayTokenRef.current) {
    prevAutoPlayTokenRef.current = autoPlayToken;
    if (autoPlayToken > 0) {
      pendingAutoPlayKeyRef.current = playerKey;
    }
  }
  if (retryRequestedRef.current) {
    retryRequestedRef.current = false;
    pendingAutoPlayKeyRef.current = playerKey;
  }

  // Playback State
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const [playbackFeedback, setPlaybackFeedback] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<DiagnosedPlaybackError | null>(null);
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);

  const isHls = isHlsStreamSource(film.streamUrl, film.streamType);
  const useHlsJs = isHls && Hls.isSupported();

  const triggerFeedback = useCallback((text: string) => {
    setPlaybackFeedback(text);
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    feedbackTimerRef.current = setTimeout(() => {
      setPlaybackFeedback(null);
      feedbackTimerRef.current = null;
    }, 800);
  }, []);

  // Cleanup all active timers on unmount
  useEffect(() => {
    return () => {
      if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      if (bufferWatchdogRef.current) clearTimeout(bufferWatchdogRef.current);
    };
  }, []);

  // Ref callback to capture the native HTMLVideoElement rendered by Video.js v10
  const handleVideoRef = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    setVideoElement(el);
  }, []);

  // Unified structured error reporter with post-failure HTTP/CORS/MIME diagnostics
  const reportedSessionRef = useRef<number>(-1);
  const reportPlaybackFailure = useCallback(
    (params: {
      mediaError?: MediaError | null;
      hlsError?: HlsJsErrorInput | null;
      spfError?: { code?: number; message?: string; data?: any } | null;
    }) => {
      const session = streamSessionRef.current;
      if (reportedSessionRef.current === session) return;
      reportedSessionRef.current = session;

      const initialDiag = formatPlaybackDiagnostics({
        mediaError: params.mediaError,
        hlsError: params.hlsError,
        spfError: params.spfError,
        streamUrl: film.streamUrl,
        streamType: film.streamType,
      });

      console.error('[NEXUS ONE Playback Error]', {
        filmId: film.id,
        title: film.title,
        streamUrl: film.streamUrl,
        streamType: film.streamType,
        isHls,
        codeLabel: initialDiag.codeLabel,
        technicalDetail: initialDiag.technicalDetail,
        mediaError: params.mediaError
          ? { code: params.mediaError.code, message: params.mediaError.message }
          : null,
        hlsError: params.hlsError || null,
        spfError: params.spfError || null,
      });

      setVideoError(initialDiag);
      setIsBuffering(false);
      setIsPaused(true);

      // Run lightweight HTTP/CORS/offline diagnostic probe only if HTTP status isn't already known
      if (!film.streamUrl || params.hlsError?.httpStatus) return;
      void probeStreamFailure(film.streamUrl).then((probe) => {
        if (streamSessionRef.current !== session) return;
        const refinedDiag = formatPlaybackDiagnostics({
          mediaError: params.mediaError,
          hlsError: params.hlsError,
          spfError: params.spfError,
          streamUrl: film.streamUrl,
          streamType: film.streamType,
          probe,
        });
        if (refinedDiag.codeLabel !== initialDiag.codeLabel) {
          console.error('[NEXUS ONE Refined Stream Diagnostics]', {
            streamUrl: film.streamUrl,
            probe,
            codeLabel: refinedDiag.codeLabel,
            technicalDetail: refinedDiag.technicalDetail,
          });
          setVideoError(refinedDiag);
        }
      });
    },
    [film.id, film.title, film.streamUrl, film.streamType, isHls]
  );

  const reportPlaybackFailureRef = useRef(reportPlaybackFailure);
  reportPlaybackFailureRef.current = reportPlaybackFailure;

  // Reset playback state and validate source when film changes or retry is triggered
  useEffect(() => {
    streamSessionRef.current += 1;
    if (bufferWatchdogRef.current) {
      clearTimeout(bufferWatchdogRef.current);
      bufferWatchdogRef.current = null;
    }

    setVideoError(null);
    setCurrentTime(0);
    setDuration(0);
    setBufferedEnd(0);
    setIsPaused(true);
    setIsBuffering(false);
    setHasStartedPlayback(false);
    setVideoDimensions({ width: 0, height: 0 });
    setIsControlsVisible(true);

    if (!film.streamUrl) {
      setVideoError({
        title: 'Missing Stream Source',
        message: 'No playable stream URL is configured for this reel.',
        codeLabel: 'EMPTY_STREAM_URL',
        technicalDetail: `filmId=${film.id}`,
      });
      return;
    }

    const tokenStatus = checkUrlTokenExpiration(film.streamUrl);
    if (tokenStatus.expired && tokenStatus.expiresAt) {
      const diag: DiagnosedPlaybackError = {
        title: 'Signed Playback URL Expired',
        message: `Your signed stream token expired on ${new Date(
          tokenStatus.expiresAt
        ).toLocaleString()}. Request a fresh playback token and reload.`,
        codeLabel: 'TOKEN_EXPIRED',
        technicalDetail: `JWT exp=${tokenStatus.expiresAt} < now`,
      };
      console.error('[NEXUS ONE Pre-flight Token Validation]', diag);
      setVideoError(diag);
      return;
    }

    const browserSupport = checkBrowserPlaybackSupport(film.streamUrl, film.streamType);
    if (!browserSupport.supported) {
      const diag: DiagnosedPlaybackError = {
        title: 'Browser Playback Unsupported',
        message:
          browserSupport.reason ||
          'This browser lacks required codec or Media Source Extensions support for this stream.',
        codeLabel: 'BROWSER_UNSUPPORTED',
        technicalDetail: `streamType=${film.streamType}, isHls=${isHls}`,
      };
      console.error('[NEXUS ONE Pre-flight Capability Check]', diag);
      setVideoError(diag);
    }
  }, [film.id, film.streamUrl, film.streamType, isHls, retryNonce]);

  // If user re-selects an already-loaded paused reel, start playback immediately
  useEffect(() => {
    const video = videoRef.current;
    if (
      autoPlayToken > 0 &&
      video &&
      video.dataset.playerKey === pendingAutoPlayKeyRef.current &&
      video.readyState >= 3 &&
      video.paused &&
      !videoError
    ) {
      pendingAutoPlayKeyRef.current = null;
      video.play().catch((err) => {
        if (err?.name === 'NotAllowedError') {
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
        }
      });
    }
  }, [autoPlayToken, videoError]);

  // Attach hls.js onto Video.js v10 <Video> for Mux/HLS streams in MSE browsers
  useEffect(() => {
    const video = videoElement;
    if (!video || !useHlsJs || !film.streamUrl) return;
    if (
      videoError?.codeLabel === 'TOKEN_EXPIRED' ||
      videoError?.codeLabel === 'BROWSER_UNSUPPORTED' ||
      videoError?.codeLabel === 'EMPTY_STREAM_URL'
    ) {
      return;
    }

    let destroyed = false;
    let mediaRecoverAttempts = 0;

    const hls = new Hls({
      enableWorker: false,
      lowLatencyMode: false,
      backBufferLength: 30,
      maxBufferLength: 30,
      manifestLoadingMaxRetry: 1,
      levelLoadingMaxRetry: 1,
    });
    hlsInstanceRef.current = hls;

    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      if (!destroyed) {
        hls.loadSource(film.streamUrl);
      }
    });

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (destroyed) return;
      setIsBuffering(false);
      setVideoError(null);
      const elKey = video.dataset.playerKey;
      if (elKey && pendingAutoPlayKeyRef.current === elKey) {
        pendingAutoPlayKeyRef.current = null;
        video.play().catch((err) => {
          if (err?.name === 'NotAllowedError') {
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {});
          }
        });
      }
    });

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (destroyed || !data.fatal) return;

      if (data.type === Hls.ErrorTypes.MEDIA_ERROR && mediaRecoverAttempts < 1) {
        mediaRecoverAttempts += 1;
        console.warn('[NEXUS ONE HLS] Attempting single media error recovery:', data.details);
        hls.recoverMediaError();
        return;
      }

      hls.destroy();
      if (hlsInstanceRef.current === hls) {
        hlsInstanceRef.current = null;
      }

      reportPlaybackFailureRef.current({
        hlsError: {
          type: data.type,
          details: data.details,
          httpStatus: data.response?.code,
          reason:
            data.reason ||
            (data.error instanceof Error ? data.error.message : undefined),
        },
      });
    });

    const attachTimer = setTimeout(() => {
      if (!destroyed) {
        hls.attachMedia(video);
      }
    }, 0);

    return () => {
      destroyed = true;
      clearTimeout(attachTimer);
      hls.destroy();
      if (hlsInstanceRef.current === hls) {
        hlsInstanceRef.current = null;
      }
    };
  }, [
    videoElement,
    useHlsJs,
    film.streamUrl,
    retryNonce,
    videoError?.codeLabel,
  ]);

  // Wire HTMLVideoElement listeners registered within Video.js v10 Player
  useEffect(() => {
    const video = videoElement;
    if (!video) return;

    // Apply persisted audio & speed preferences on newly mounted stream elements
    video.volume = volume;
    video.muted = isMuted;
    video.playbackRate = playbackRate;

    const clearWatchdog = () => {
      if (bufferWatchdogRef.current) {
        clearTimeout(bufferWatchdogRef.current);
        bufferWatchdogRef.current = null;
      }
    };

    const onTimeUpdate = () => setCurrentTime(video.currentTime || 0);
    const onDurationChange = () => {
      if (Number.isFinite(video.duration)) {
        setDuration(video.duration || 0);
      }
    };
    const onPlay = () => {
      setIsPaused(false);
      setVideoError(null);
      setHasStartedPlayback(true);
    };
    const onPause = () => {
      setIsPaused(true);
      clearWatchdog();
    };
    const onEnded = () => {
      setIsPaused(true);
      setIsBuffering(false);
      setIsControlsVisible(true);
      clearWatchdog();
    };
    const onVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const onRateChange = () => setPlaybackRate(video.playbackRate);
    const onWaiting = () => {
      if (!video.error) setIsBuffering(true);
    };
    const onStalled = () => {
      if (!video.paused && !video.error) setIsBuffering(true);
    };
    const onPlaying = () => {
      clearWatchdog();
      setIsBuffering(false);
      setIsPaused(false);
      setHasStartedPlayback(true);
    };
    const tryConsumeAutoPlay = () => {
      const elKey = video.dataset.playerKey;
      if (elKey && pendingAutoPlayKeyRef.current === elKey) {
        pendingAutoPlayKeyRef.current = null;
        video.play().catch((err) => {
          if (err?.name === 'NotAllowedError') {
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {});
          }
        });
      }
    };

    const onCanPlay = () => {
      clearWatchdog();
      setIsBuffering(false);
      tryConsumeAutoPlay();
    };
    const onProgress = () => {
      if (video.buffered && video.buffered.length > 0) {
        setBufferedEnd(video.buffered.end(video.buffered.length - 1));
      }
    };
    const onLoadedMetadata = () => {
      setVideoDimensions({
        width: video.videoWidth || 0,
        height: video.videoHeight || 0,
      });
      if (Number.isFinite(video.duration)) {
        setDuration(video.duration || 0);
      }
      setVideoError(null);
    };
    const onError = () => {
      clearWatchdog();
      reportPlaybackFailureRef.current({
        mediaError: video.error,
      });
    };
    const onWebkitEndFs = () => {
      setIsFullscreen(false);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);
    video.addEventListener('volumechange', onVolumeChange);
    video.addEventListener('ratechange', onRateChange);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('stalled', onStalled);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('progress', onProgress);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('error', onError);
    video.addEventListener('webkitendfullscreen', onWebkitEndFs);

    if (video.readyState >= 1) {
      if (Number.isFinite(video.duration)) {
        setDuration(video.duration || 0);
      }
      setVideoDimensions({
        width: video.videoWidth || 0,
        height: video.videoHeight || 0,
      });
    }

    if (video.readyState >= 3) {
      tryConsumeAutoPlay();
    }

    return () => {
      clearWatchdog();
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('volumechange', onVolumeChange);
      video.removeEventListener('ratechange', onRateChange);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('stalled', onStalled);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('progress', onProgress);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('error', onError);
      video.removeEventListener('webkitendfullscreen', onWebkitEndFs);
    };
  }, [videoElement]);

  // Watchdog for stalled/hung buffering + offline browser detection
  useEffect(() => {
    if (bufferWatchdogRef.current) {
      clearTimeout(bufferWatchdogRef.current);
      bufferWatchdogRef.current = null;
    }

    if (!isBuffering || videoError || isPaused) return;

    const session = streamSessionRef.current;
    bufferWatchdogRef.current = setTimeout(() => {
      if (streamSessionRef.current !== session) return;
      void probeStreamFailure(film.streamUrl, 4000).then((probe) => {
        if (streamSessionRef.current !== session) return;
        if (!probe.reachable) {
          const diag = formatPlaybackDiagnostics({
            streamUrl: film.streamUrl,
            streamType: film.streamType,
            probe,
          });
          console.error('[NEXUS ONE Buffering Stall Diagnostics]', diag);
          setVideoError(diag);
          setIsBuffering(false);
          setIsPaused(true);
        }
      });
    }, 15000);

    return () => {
      if (bufferWatchdogRef.current) {
        clearTimeout(bufferWatchdogRef.current);
        bufferWatchdogRef.current = null;
      }
    };
  }, [isBuffering, isPaused, videoError, film.streamUrl, film.streamType]);

  // Listen to browser offline transitions while attempting playback
  useEffect(() => {
    const onOffline = () => {
      if (!isPaused || isBuffering) {
        setVideoError({
          title: 'Network Connection Lost',
          message:
            'Your internet connection dropped while streaming. Reconnect and click Retry Stream.',
          codeLabel: 'NETWORK_OFFLINE',
          technicalDetail: 'window offline event',
        });
        setIsBuffering(false);
      }
    };
    window.addEventListener('offline', onOffline);
    return () => window.removeEventListener('offline', onOffline);
  }, [isPaused, isBuffering]);

  // Fullscreen change listener (standard + WebKit prefix)
  useEffect(() => {
    const onFsChange = () => {
      const fsEl =
        document.fullscreenElement || (document as any).webkitFullscreenElement || null;
      setIsFullscreen(!!fsEl);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  // Throttled Telemetry Sync (prevents 10Hz full-App re-renders during playback)
  useEffect(() => {
    if (!onVideoStateUpdate) return;
    const now = performance.now();
    const isDiscreteZero = currentTime === 0 || isPaused || !!videoError;
    if (!isDiscreteZero && now - lastTelemetrySyncRef.current < 400) {
      return;
    }
    lastTelemetrySyncRef.current = now;

    onVideoStateUpdate({
      currentTime,
      duration,
      volume,
      muted: isMuted,
      playbackRate,
      bufferedEnd,
      videoWidth: videoDimensions.width,
      videoHeight: videoDimensions.height,
      isWaiting: isBuffering,
      isPaused,
      videoJsVersion: VIDEOJS_VERSION,
      hasError: !!videoError,
    });
  }, [
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    bufferedEnd,
    videoDimensions,
    isBuffering,
    isPaused,
    videoError,
    onVideoStateUpdate,
  ]);

  // Wake and Auto-hide controls
  const wakeControls = useCallback(() => {
    setIsControlsVisible(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    hideControlsTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setIsControlsVisible(false);
      }
    }, 3500);
  }, []);

  // Controls Handlers
  const handleTogglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || videoError) return;

    if (video.paused) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            triggerFeedback('PLAY');
          })
          .catch((err) => {
            if (err?.name === 'AbortError') return;
            console.error('Video.js v10 playback attempt failed:', err);
            if (err?.name === 'NotAllowedError') {
              video.muted = true;
              setIsMuted(true);
              video
                .play()
                .then(() => {
                  triggerFeedback('PLAY (MUTED)');
                })
                .catch((retryErr) => {
                  setVideoError({
                    title: 'Autoplay Restricted',
                    message:
                      retryErr?.message ||
                      'Browser autoplay policies blocked playback. Click Play again to start.',
                    codeLabel: 'AUTOPLAY_BLOCKED',
                    technicalDetail: String(retryErr?.name || retryErr),
                  });
                });
            } else {
              reportPlaybackFailure({
                mediaError: video.error,
                hlsError: isHls
                  ? {
                      details: 'playbackStartFailed',
                      reason: err?.message || 'Playback could not be started.',
                    }
                  : null,
              });
            }
          });
      }
    } else {
      video.pause();
      triggerFeedback('PAUSE');
    }
    wakeControls();
  }, [videoError, triggerFeedback, wakeControls, reportPlaybackFailure, isHls]);

  const handleSeek = useCallback(
    (seconds: number) => {
      const video = videoRef.current;
      if (!video) return;
      const dur = duration || (Number.isFinite(video.duration) ? video.duration : 0);
      if (dur <= 0) return;
      const target = Math.max(0, Math.min(seconds, dur));
      video.currentTime = target;
      setCurrentTime(target);
      if (target > 0) setHasStartedPlayback(true);
      wakeControls();
    },
    [duration, wakeControls]
  );

  const handleSeekRelative = useCallback(
    (offsetSeconds: number) => {
      const video = videoRef.current;
      if (!video) return;
      const current = video.currentTime || 0;
      const dur = duration || (Number.isFinite(video.duration) ? video.duration : 0);
      if (dur <= 0) return;
      const target = Math.max(0, Math.min(current + offsetSeconds, dur));
      video.currentTime = target;
      setCurrentTime(target);
      if (target > 0) setHasStartedPlayback(true);
      triggerFeedback(offsetSeconds > 0 ? `+${offsetSeconds}s` : `${offsetSeconds}s`);
      wakeControls();
    },
    [duration, triggerFeedback, wakeControls]
  );

  const handleVolumeChange = useCallback(
    (newVol: number) => {
      const video = videoRef.current;
      if (!video) return;
      const clamped = clampVolume(newVol);
      video.volume = clamped;
      if (clamped > 0 && video.muted) {
        video.muted = false;
        setIsMuted(false);
      }
      setVolume(clamped);
      wakeControls();
    },
    [wakeControls]
  );

  const handleToggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    triggerFeedback(video.muted ? 'MUTED' : 'UNMUTED');
    wakeControls();
  }, [triggerFeedback, wakeControls]);

  const handlePlaybackRateChange = useCallback(
    (newRate: number) => {
      const video = videoRef.current;
      if (!video) return;
      const clamped = clampPlaybackRate(newRate);
      video.playbackRate = clamped;
      setPlaybackRate(clamped);
      triggerFeedback(`${clamped}x`);
      wakeControls();
    },
    [triggerFeedback, wakeControls]
  );

  const handleToggleFullscreen = useCallback(() => {
    const container = containerRef.current as any;
    const video = videoRef.current as any;
    const fsElement =
      document.fullscreenElement || (document as any).webkitFullscreenElement;

    if (!fsElement) {
      if (container?.requestFullscreen) {
        container.requestFullscreen().catch(() => {
          if (video?.webkitEnterFullscreen) {
            video.webkitEnterFullscreen();
            setIsFullscreen(true);
          }
        });
      } else if (container?.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (video?.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  }, []);

  const handleRetryVideo = useCallback(() => {
    retryRequestedRef.current = true;
    setVideoError(null);
    setRetryNonce((n) => n + 1);
  }, []);

  // Keep latest handlers in a ref so the keyboard listener never suffers stale closures
  const actionsRef = useRef({
    handleTogglePlay,
    handleSeek,
    handleSeekRelative,
    handleVolumeChange,
    handleToggleMute,
    handleToggleFullscreen,
    onToggleCinemaDim,
    onToggleAmbientAura,
    triggerFeedback,
    volume,
    duration,
  });

  actionsRef.current = {
    handleTogglePlay,
    handleSeek,
    handleSeekRelative,
    handleVolumeChange,
    handleToggleMute,
    handleToggleFullscreen,
    onToggleCinemaDim,
    onToggleAmbientAura,
    triggerFeedback,
    volume,
    duration,
  };

  // Global keyboard navigation (bound once, skips inputs & Space-on-button double toggles)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName || '';
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName) || target?.isContentEditable) {
        return;
      }

      // Prevent Space from both firing a focused button's click handler and toggling playback
      if (
        e.code === 'Space' &&
        target?.closest('button, a, [role="button"], summary')
      ) {
        return;
      }

      const actions = actionsRef.current;

      switch (e.code) {
        case 'Space':
        case 'KeyK':
          e.preventDefault();
          actions.handleTogglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          actions.handleSeekRelative(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          actions.handleSeekRelative(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          actions.handleVolumeChange(actions.volume + 0.1);
          actions.triggerFeedback(`${Math.round(clampVolume(actions.volume + 0.1) * 100)}%`);
          break;
        case 'ArrowDown':
          e.preventDefault();
          actions.handleVolumeChange(actions.volume - 0.1);
          actions.triggerFeedback(`${Math.round(clampVolume(actions.volume - 0.1) * 100)}%`);
          break;
        case 'KeyM':
          e.preventDefault();
          actions.handleToggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          actions.handleToggleFullscreen();
          break;
        case 'KeyC':
          e.preventDefault();
          actions.onToggleCinemaDim();
          break;
        case 'KeyA':
          e.preventDefault();
          actions.onToggleAmbientAura();
          break;
        case 'Digit0':
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
        case 'Digit9':
          if (actions.duration > 0) {
            e.preventDefault();
            const pct = parseInt(e.key, 10) * 0.1;
            actions.handleSeek(actions.duration * pct);
            actions.triggerFeedback(`${Math.round(pct * 100)}%`);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getAspectRatioClasses = () => {
    switch (activeAspectRatio) {
      case '2.39:1':
        return 'aspect-[2.39/1]';
      case '21:9':
        return 'aspect-[21/9]';
      case '1.43:1':
        return 'aspect-[1.43/1]';
      case '16:9':
      default:
        return 'aspect-video';
    }
  };

  const getColorGradeStyle = () => {
    switch (activeColorGrade) {
      case 'celluloid':
        return 'contrast-110 saturate-95 sepia-[0.08]';
      case 'noir':
        return 'contrast-125 saturate-0 brightness-95';
      case 'vermilion':
        return 'contrast-105 saturate-115 hue-rotate-[18deg]';
      case 'pristine':
      default:
        return '';
    }
  };

  const canRenderMediaElement = Boolean(
    film.streamUrl &&
      videoError?.codeLabel !== 'TOKEN_EXPIRED' &&
      videoError?.codeLabel !== 'BROWSER_UNSUPPORTED' &&
      videoError?.codeLabel !== 'EMPTY_STREAM_URL'
  );

  return (
    <VideoPlayer>
      <div
        ref={containerRef}
        onMouseMove={wakeControls}
        onTouchStart={wakeControls}
        className={`relative w-full rounded-2xl md:rounded-3xl overflow-hidden bg-[#05070B] border border-[rgba(226,232,240,0.14)] transition-all duration-700 living-frame-aura ${
          ambientAuraActive ? 'glow-active' : ''
        }`}
        style={
          {
            '--glow-color': film.ambientGlowColor,
          } as React.CSSProperties
        }
      >
        {/* Dynamic Specular Light Bleed (Restrained & Soft) */}
        {ambientAuraActive && (
          <div
            className="absolute -inset-8 opacity-45 blur-3xl pointer-events-none transition-all duration-1000 -z-10"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${film.ambientGlowColor} 0%, transparent 65%)`,
            }}
          />
        )}

        {/* Frame Container with strict Matte Ratio + comfortable mobile minimum height */}
        <div
          className={`relative w-full min-h-[240px] sm:min-h-0 ${getAspectRatioClasses()} bg-black flex items-center justify-center transition-all duration-500 overflow-hidden select-none`}
        >
          {/* Video.js v10 VideoSkin wrapping Video component (with hls.js MSE for HLS/Mux) */}
          <VideoSkin className="w-full h-full relative flex items-center justify-center">
            <div
              className={`w-full h-full flex items-center justify-center cursor-pointer ${getColorGradeStyle()}`}
              onClick={handleTogglePlay}
              onDoubleClick={handleToggleFullscreen}
            >
              {canRenderMediaElement && (
                <PlayerErrorBoundary
                  resetKey={playerKey}
                  onError={(err) => {
                    reportPlaybackFailureRef.current({
                      hlsError: isHls
                        ? {
                            details: 'adapterInitError',
                            reason:
                              err?.message ||
                              'Video.js media player failed to initialize for this stream.',
                          }
                        : null,
                    });
                  }}
                >
                  <Video
                    key={playerKey}
                    data-player-key={playerKey}
                    ref={handleVideoRef}
                    src={useHlsJs ? undefined : film.streamUrl}
                    poster={film.thumbnail || undefined}
                    playsInline
                    preload="auto"
                    className="w-full h-full object-contain"
                    aria-label={`${film.title} - Video.js v10 Cinema Player`}
                  />
                </PlayerErrorBoundary>
              )}
            </div>
          </VideoSkin>

          {/* Idle Cinematic Poster Cover (prevents blank/white initial frame before playback starts) */}
          {!hasStartedPlayback && isPaused && currentTime === 0 && !videoError && (
            <div
              onClick={handleTogglePlay}
              className="absolute inset-0 z-10 cursor-pointer bg-[#05070B] overflow-hidden group/idle"
            >
              {film.thumbnail ? (
                <img
                  src={film.thumbnail}
                  alt={`${film.title} cover still`}
                  className={`w-full h-full object-cover object-center transition-transform duration-700 group-hover/idle:scale-[1.02] ${getColorGradeStyle()}`}
                />
              ) : (
                <div
                  className="w-full h-full bg-[#05070B]"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 50% 45%, rgba(103, 212, 255, 0.14) 0%, rgba(11, 15, 23, 0.92) 55%, #05070B 100%)',
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070B]/88 via-[#05070B]/20 to-[#05070B]/70" />
              {/* Centered Glass Play Cue */}
              {!isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#0B0F17]/65 backdrop-blur-xl border border-[#67D4FF]/45 flex items-center justify-center shadow-[0_0_40px_rgba(103,212,255,0.28)] group-hover/idle:scale-105 group-hover/idle:border-[#67D4FF] transition-all duration-300">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-7 h-7 sm:w-8 sm:h-8 text-[#67D4FF] fill-current ml-1"
                      aria-hidden="true"
                    >
                      <polygon points="6 4 20 12 6 20 6 4" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Visible Error Notification Card */}
          {videoError && (
            <div
              role="alert"
              className="absolute inset-0 bg-[#05070B]/92 backdrop-blur-xl z-40 flex flex-col items-center justify-center p-6 text-center text-[#FFFFFF] animate-in fade-in duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#67D4FF]/15 border border-[#67D4FF]/35 flex items-center justify-center mb-3 text-[#67D4FF] shadow-lg shadow-[#67D4FF]/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono tracking-wider text-[#67D4FF] mb-1 uppercase">
                {videoError.codeLabel.replace(/_/g, ' ')}
              </span>
              <h3 className="font-['Syne',sans-serif] text-base md:text-lg font-bold text-[#FFFFFF] mb-2 max-w-md">
                {videoError.title}
              </h3>
              <p className="text-xs text-[#CBD5E1]/85 max-w-md mb-5 leading-relaxed">
                {videoError.message}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleRetryVideo}
                  className="px-4 py-2 rounded-xl bg-[#67D4FF] text-[#05070B] text-xs font-semibold hover:bg-[#8CE0FF] transition-all flex items-center gap-2 shadow-lg shadow-[#67D4FF]/20 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Stream</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenStreamManager}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-[#FFFFFF] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5 text-[#67D4FF]" />
                  <span>Choose Another Film</span>
                </button>
              </div>
            </div>
          )}

          {/* Film Grain Texture Emulation (Celluloid Mode) */}
          {activeColorGrade === 'celluloid' && (
            <div className="absolute inset-0 pointer-events-none film-grain opacity-35 z-10" />
          )}

          {/* Cinematic Letterbox Matte Lines (Guides for Filmmakers) */}
          <div className="absolute inset-0 pointer-events-none border border-white/5 z-20" />

          {/* Transient Action Feedback Indicator */}
          {playbackFeedback && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-[#0B0F17]/90 backdrop-blur-xl border border-[#67D4FF]/40 shadow-2xl pointer-events-none z-40">
              <span className="font-mono text-sm font-semibold text-[#FFFFFF] tracking-wider">
                {playbackFeedback}
              </span>
            </div>
          )}

          {/* The Living Frame HUD: Custom Video.js v10 Controls */}
          <LivingFrameHUD
            film={film}
            currentTime={currentTime}
            duration={duration}
            bufferedEnd={bufferedEnd}
            isPaused={isPaused}
            volume={volume}
            isMuted={isMuted}
            playbackRate={playbackRate}
            isFullscreen={isFullscreen}
            isBuffering={isBuffering}
            isControlsVisible={isControlsVisible}
            ambientAuraActive={ambientAuraActive}
            cinemaDimActive={cinemaDimActive}
            activeAspectRatio={activeAspectRatio}
            activeColorGrade={activeColorGrade}
            onTogglePlay={handleTogglePlay}
            onSeek={handleSeek}
            onSeekRelative={handleSeekRelative}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
            onPlaybackRateChange={handlePlaybackRateChange}
            onToggleFullscreen={handleToggleFullscreen}
            onToggleAmbientAura={onToggleAmbientAura}
            onToggleCinemaDim={onToggleCinemaDim}
            onAspectRatioChange={onAspectRatioChange}
            onColorGradeChange={onColorGradeChange}
            onOpenInspector={onOpenInspector}
            onOpenStreamManager={onOpenStreamManager}
          />
        </div>
      </div>
    </VideoPlayer>
  );
}
