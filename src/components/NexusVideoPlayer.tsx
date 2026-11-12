import React, { useEffect, useRef, useState, useCallback } from 'react';
import { VideoPlayer, VideoSkin, Video } from '@videojs/react/video';
import { VERSION as VIDEOJS_VERSION } from '@videojs/react';
import '@videojs/react/video/skin.css';
import { AlertTriangle, RefreshCw, Radio } from 'lucide-react';
import { FilmReel } from '../data/cinemaReels';
import { AspectRatio, clampVolume, clampPlaybackRate } from '../utils/player-math';
import { LivingFrameHUD } from './LivingFrameHUD';

interface NexusVideoPlayerProps {
  film: FilmReel;
  ambientAuraActive: boolean;
  cinemaDimActive: boolean;
  activeAspectRatio: AspectRatio;
  activeColorGrade: string;
  onToggleAmbientAura: () => void;
  onToggleCinemaDim: () => void;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onColorGradeChange: (grade: any) => void;
  onOpenInspector: () => void;
  onOpenStreamManager: () => void;
  onOpenLogoManager: () => void;
  onVideoStateUpdate?: (state: any) => void;
}

export function NexusVideoPlayer({
  film,
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
  onOpenLogoManager,
  onVideoStateUpdate,
}: NexusVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const hideControlsTimerRef = useRef<any>(null);

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
  const [videoError, setVideoError] = useState<string | null>(null);

  const triggerFeedback = (text: string) => {
    setPlaybackFeedback(text);
    setTimeout(() => setPlaybackFeedback(null), 800);
  };

  // Ref callback to capture the native HTMLVideoElement rendered by Video.js v10
  const handleVideoRef = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    setVideoElement(el);
  }, []);

  // Wire HTMLVideoElement listeners registered within Video.js v10 Player
  useEffect(() => {
    const video = videoElement;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime || 0);
    const onDurationChange = () => setDuration(video.duration || 0);
    const onPlay = () => {
      setIsPaused(false);
      setIsBuffering(false);
      setVideoError(null);
    };
    const onPause = () => setIsPaused(true);
    const onVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const onRateChange = () => setPlaybackRate(video.playbackRate);
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => {
      setIsBuffering(false);
      setIsPaused(false);
    };
    const onCanPlay = () => setIsBuffering(false);
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
      setDuration(video.duration || 0);
      setVideoError(null);
    };
    const onError = () => {
      const err = video.error;
      let msg = 'Failed to load video stream.';
      if (err) {
        switch (err.code) {
          case 1:
            msg = 'Playback aborted by user or system.';
            break;
          case 2:
            msg = 'Network error: Failed to download media stream.';
            break;
          case 3:
            msg = 'Decoding error: Media corrupted or format unsupported.';
            break;
          case 4:
            msg = 'Source format or codec not supported by this browser.';
            break;
          default:
            msg = err.message || 'Unknown media playback error.';
        }
      }
      console.error('Video.js v10 HTMLVideoElement Error:', err, msg);
      setVideoError(msg);
      setIsBuffering(false);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('volumechange', onVolumeChange);
    video.addEventListener('ratechange', onRateChange);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('progress', onProgress);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('error', onError);

    // Initial sync
    if (video.readyState >= 1) {
      setDuration(video.duration || 0);
      setVideoDimensions({
        width: video.videoWidth || 0,
        height: video.videoHeight || 0,
      });
    }

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('volumechange', onVolumeChange);
      video.removeEventListener('ratechange', onRateChange);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('progress', onProgress);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('error', onError);
    };
  }, [videoElement]);

  // Update stream when film source changes
  useEffect(() => {
    const video = videoElement;
    if (!video) return;

    setVideoError(null);
    setCurrentTime(0);
    setBufferedEnd(0);
    setIsPaused(true);

    if (video.src !== film.streamUrl) {
      video.src = film.streamUrl;
      video.load();
    }
  }, [film.streamUrl, videoElement]);

  // Fullscreen change listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Sync Telemetry
  useEffect(() => {
    if (onVideoStateUpdate) {
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
    }
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
  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      setVideoError(null);
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            triggerFeedback('PLAY');
          })
          .catch((err) => {
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
                  setVideoError(
                    `Autoplay restricted by browser: ${retryErr?.message || 'Click to play'}`
                  );
                });
            } else {
              setVideoError(err?.message || 'Playback could not be started.');
            }
          });
      }
    } else {
      video.pause();
      triggerFeedback('PAUSE');
    }
    wakeControls();
  };

  const handleSeek = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const dur = duration || video.duration || 0;
    const target = Math.max(0, Math.min(seconds, dur));
    video.currentTime = target;
    setCurrentTime(target);
    wakeControls();
  };

  const handleSeekRelative = (offsetSeconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const current = video.currentTime || 0;
    const dur = duration || video.duration || 0;
    const target = Math.max(0, Math.min(current + offsetSeconds, dur));
    video.currentTime = target;
    setCurrentTime(target);
    triggerFeedback(offsetSeconds > 0 ? `+${offsetSeconds}s` : `${offsetSeconds}s`);
    wakeControls();
  };

  const handleVolumeChange = (newVol: number) => {
    const video = videoRef.current;
    if (!video) return;
    const clamped = clampVolume(newVol);
    video.volume = clamped;
    if (clamped > 0 && video.muted) {
      video.muted = false;
    }
    setVolume(clamped);
    wakeControls();
  };

  const handleToggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    triggerFeedback(video.muted ? 'MUTED' : 'UNMUTED');
    wakeControls();
  };

  const handlePlaybackRateChange = (newRate: number) => {
    const video = videoRef.current;
    if (!video) return;
    const clamped = clampPlaybackRate(newRate);
    video.playbackRate = clamped;
    setPlaybackRate(clamped);
    triggerFeedback(`${clamped}x`);
    wakeControls();
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleRetryVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    setVideoError(null);
    video.src = film.streamUrl;
    video.load();
    video.play().catch((err) => {
      setVideoError(err?.message || 'Playback retry failed.');
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.code) {
        case 'Space':
        case 'KeyK':
          e.preventDefault();
          handleTogglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleSeekRelative(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSeekRelative(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(volume + 0.1);
          triggerFeedback(`${Math.round(clampVolume(volume + 0.1) * 100)}%`);
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(volume - 0.1);
          triggerFeedback(`${Math.round(clampVolume(volume - 0.1) * 100)}%`);
          break;
        case 'KeyM':
          e.preventDefault();
          handleToggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          handleToggleFullscreen();
          break;
        case 'KeyC':
          e.preventDefault();
          onToggleCinemaDim();
          break;
        case 'KeyA':
          e.preventDefault();
          onToggleAmbientAura();
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
          if (duration > 0) {
            e.preventDefault();
            const pct = parseInt(e.key) * 0.1;
            handleSeek(duration * pct);
            triggerFeedback(`${Math.round(pct * 100)}%`);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, duration, onToggleCinemaDim, onToggleAmbientAura]);

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
        return 'contrast-110 saturate-95 sepia-[0.10]';
      case 'noir':
        return 'contrast-125 saturate-70 brightness-95';
      case 'vermilion':
        return 'contrast-105 saturate-110 hue-rotate-[-8deg]';
      case 'pristine':
      default:
        return '';
    }
  };

  return (
    <VideoPlayer>
      <div
        ref={containerRef}
        onMouseMove={wakeControls}
        onTouchStart={wakeControls}
        className={`relative w-full rounded-2xl md:rounded-3xl overflow-hidden bg-[#080A0D] border border-[rgba(197,203,210,0.12)] transition-all duration-700 living-frame-aura ${
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
            className="absolute -inset-8 opacity-50 blur-3xl pointer-events-none transition-all duration-1000 -z-10"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${film.ambientGlowColor} 0%, transparent 65%)`,
            }}
          />
        )}

        {/* Frame Container with strict Matte Ratio */}
        <div
          className={`relative w-full ${getAspectRatioClasses()} bg-black flex items-center justify-center transition-all duration-500 overflow-hidden select-none`}
        >
          {/* Video.js v10 VideoSkin wrapping Video component */}
          <VideoSkin className="w-full h-full relative flex items-center justify-center">
            <div
              className={`w-full h-full flex items-center justify-center cursor-pointer ${getColorGradeStyle()}`}
              onClick={handleTogglePlay}
              onDoubleClick={handleToggleFullscreen}
            >
              <Video
                ref={handleVideoRef}
                src={film.streamUrl}
                playsInline
                preload="auto"
                className="w-full h-full object-contain"
                aria-label={`${film.title} - Video.js v10 Cinema Player`}
              />
            </div>
          </VideoSkin>

          {/* Visible Error Notification Card */}
          {videoError && (
            <div className="absolute inset-0 bg-[#080A0D]/90 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 text-center text-[#F1F0EA] animate-in fade-in duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#FF704F]/15 border border-[#FF704F]/35 flex items-center justify-center mb-3 text-[#FF704F] shadow-lg shadow-[#FF704F]/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono tracking-widest text-[#FF704F] uppercase mb-1">
                STREAM RECEPTION NOTICE
              </span>
              <h3 className="font-['Syne',sans-serif] text-base md:text-lg font-bold text-[#F1F0EA] mb-2 max-w-md">
                Unable to play stream for {film.title}
              </h3>
              <p className="text-xs text-[#C5CBD2]/75 max-w-md mb-5 font-mono">
                {videoError}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleRetryVideo}
                  className="px-4 py-2 rounded-xl bg-[#FF704F] text-white text-xs font-semibold hover:bg-[#FF704F]/90 transition-all flex items-center gap-2 shadow-lg shadow-[#FF704F]/25"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reload Film</span>
                </button>
                <button
                  onClick={onOpenStreamManager}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-[#F1F0EA] transition-all flex items-center gap-2"
                >
                  <Radio className="w-3.5 h-3.5 text-[#FF704F]" />
                  <span>Choose Another Stream</span>
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

          {/* Transient Action Feedback Pill (e.g. "+10s", "Play", "Pause") */}
          {playbackFeedback && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-[#141920]/90 backdrop-blur-md border border-[#FF704F]/40 shadow-2xl pointer-events-none z-40 animate-out fade-out zoom-out duration-700">
              <span className="font-mono text-sm font-bold text-[#F1F0EA] tracking-wider">
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
            onOpenLogoManager={onOpenLogoManager}
          />
        </div>
      </div>
    </VideoPlayer>
  );
}
