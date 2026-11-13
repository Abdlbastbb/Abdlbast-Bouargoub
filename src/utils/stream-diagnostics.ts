import { inspectJwtToken, isHlsStreamSource } from './player-math';

export interface StreamProbeResult {
  reachable: boolean;
  status?: number;
  contentType?: string;
  corsOrNetworkError?: boolean;
  offline?: boolean;
}

export interface DiagnosedPlaybackError {
  title: string;
  message: string;
  codeLabel: string;
  technicalDetail: string;
}

const VALID_HLS_MIME_HINTS = [
  'application/vnd.apple.mpegurl',
  'application/x-mpegurl',
  'audio/mpegurl',
  'audio/x-mpegurl',
  'application/octet-stream',
  'text/plain', // some CDNs serve .m3u8 as text/plain; still valid if #EXTM3U
];

/**
 * Verify whether the current browser supports playback for the given stream MIME type.
 */
export function checkBrowserPlaybackSupport(
  streamUrl: string,
  streamType: string
): { supported: boolean; reason?: string } {
  if (typeof document === 'undefined') {
    return { supported: true };
  }

  const isHls = isHlsStreamSource(streamUrl, streamType);
  const testVideo = document.createElement('video');

  if (isHls) {
    const canNativeHls = Boolean(
      testVideo.canPlayType('application/vnd.apple.mpegurl') ||
        testVideo.canPlayType('application/x-mpegurl')
    );
    const hasMse =
      typeof MediaSource !== 'undefined' &&
      typeof MediaSource.isTypeSupported === 'function' &&
      (MediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E, mp4a.40.2"') ||
        MediaSource.isTypeSupported('video/mp4; codecs="avc1.4d401e, mp4a.40.2"'));

    if (!canNativeHls && !hasMse) {
      return {
        supported: false,
        reason:
          'This browser does not support HLS playback or Media Source Extensions (MSE) for H.264/AAC.',
      };
    }
    return { supported: true };
  }

  if (streamType && typeof testVideo.canPlayType === 'function') {
    const canPlay = testVideo.canPlayType(streamType);
    if (canPlay === '') {
      return {
        supported: false,
        reason: `Browser reported no playback support for MIME type "${streamType}".`,
      };
    }
  }

  return { supported: true };
}

/**
 * Check whether an HLS/Mux URL has an expired signed token before or after failure.
 */
export function checkUrlTokenExpiration(streamUrl: string): {
  expired: boolean;
  expiresAt?: number;
} {
  try {
    const parsed = new URL(streamUrl);
    const token = parsed.searchParams.get('token');
    if (!token) return { expired: false };
    const info = inspectJwtToken(token);
    return { expired: info.expired, expiresAt: info.expiresAt };
  } catch {
    return { expired: false };
  }
}

/**
 * Lightweight post-error HTTP/CORS diagnostic probe (runs only when playback actually fails).
 * Never alters or bypasses CORS; only inspects status/MIME to give accurate feedback.
 */
export async function probeStreamFailure(
  url: string,
  timeoutMs = 4000
): Promise<StreamProbeResult> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { reachable: false, offline: true };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response = await fetch(url, {
      method: 'HEAD',
      mode: 'cors',
      signal: controller.signal,
    });

    // Some media origins disallow HEAD (405); probe first byte safely
    if (response.status === 405) {
      response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: { Range: 'bytes=0-1' },
        signal: controller.signal,
      });
    }

    return {
      reachable: response.ok,
      status: response.status,
      contentType: (response.headers.get('content-type') || '').toLowerCase(),
    };
  } catch {
    return {
      reachable: false,
      corsOrNetworkError: true,
      offline: typeof navigator !== 'undefined' && navigator.onLine === false,
    };
  } finally {
    clearTimeout(timer);
  }
}

export interface HlsJsErrorInput {
  type?: string;
  details?: string;
  httpStatus?: number;
  reason?: string;
}

/**
 * Translate native HTMLMediaError, hls.js fatal errors, Video.js SPF SVTA errors, and HTTP/CORS probes into clear diagnostics.
 */
export function formatPlaybackDiagnostics(params: {
  mediaError?: MediaError | null;
  spfError?: { code?: number; message?: string; data?: any } | null;
  hlsError?: HlsJsErrorInput | null;
  streamUrl: string;
  streamType: string;
  probe?: StreamProbeResult | null;
}): DiagnosedPlaybackError {
  const { mediaError, spfError, hlsError, streamUrl, streamType, probe } = params;
  const isHls = isHlsStreamSource(streamUrl, streamType);

  // 1. Check expired signed token first
  const tokenCheck = checkUrlTokenExpiration(streamUrl);
  if (tokenCheck.expired && tokenCheck.expiresAt) {
    return {
      title: 'Signed Playback URL Expired',
      message: `Your signed stream token expired on ${new Date(
        tokenCheck.expiresAt
      ).toLocaleString()}. Request a fresh playback token and reload.`,
      codeLabel: 'TOKEN_EXPIRED',
      technicalDetail: `JWT exp=${tokenCheck.expiresAt} < now`,
    };
  }

  // 2. Check HTTP status from either post-failure probe or hls.js response
  const httpStatus = probe?.status || hlsError?.httpStatus;

  if (probe?.offline || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
    return {
      title: 'Network Connection Lost',
      message: 'Your device appears to be offline. Reconnect to the internet and retry playback.',
      codeLabel: 'NETWORK_OFFLINE',
      technicalDetail: 'navigator.onLine === false',
    };
  }

  if (httpStatus === 401 || httpStatus === 403) {
    return {
      title: 'Stream Access Denied (HTTP ' + httpStatus + ')',
      message:
        'The stream server rejected access (HTTP ' +
        httpStatus +
        '). For signed Mux streams, verify that your playback token is valid and not expired.',
      codeLabel: `HTTP_${httpStatus}`,
      technicalDetail: `HTTP ${httpStatus} from ${streamUrl}`,
    };
  }

  if (httpStatus === 404) {
    return {
      title: 'Stream Not Found (HTTP 404)',
      message:
        'No media stream was found at this address (HTTP 404). Verify the Mux Playback ID or stream URL.',
      codeLabel: 'HTTP_404',
      technicalDetail: `HTTP 404 for ${streamUrl}`,
    };
  }

  if (httpStatus && httpStatus >= 500) {
    return {
      title: `Streaming Server Error (HTTP ${httpStatus})`,
      message:
        'The media CDN or origin server returned a temporary error. Please wait a moment and retry.',
      codeLabel: `HTTP_${httpStatus}`,
      technicalDetail: `Upstream HTTP ${httpStatus} at ${streamUrl}`,
    };
  }

  // Detect invalid MIME response (e.g. HTML error page returned with 200 OK)
  if (probe?.reachable && probe.contentType) {
    if (probe.contentType.includes('text/html') || probe.contentType.includes('application/json')) {
      return {
        title: 'Invalid Stream MIME Type',
        message: `The URL returned "${probe.contentType}" instead of a playable video or HLS manifest.`,
        codeLabel: 'INVALID_MIME_TYPE',
        technicalDetail: `Expected ${streamType}, received ${probe.contentType}`,
      };
    }
    if (
      isHls &&
      probe.contentType &&
      !VALID_HLS_MIME_HINTS.some((hint) => probe.contentType!.includes(hint)) &&
      !probe.contentType.startsWith('video/')
    ) {
      return {
        title: 'Unexpected Manifest MIME Type',
        message: `Expected an HLS playlist (.m3u8), but server responded with "${probe.contentType}".`,
        codeLabel: 'INVALID_HLS_MIME',
        technicalDetail: `Content-Type=${probe.contentType}`,
      };
    }
  }

  if (probe?.corsOrNetworkError) {
    return {
      title: isHls ? 'HLS Network or CORS Restriction' : 'Stream Unreachable or Blocked',
      message:
        'Unable to fetch the media stream. The server may be unreachable, the connection interrupted, or cross-origin (CORS) headers are not enabled on the host.',
      codeLabel: 'CORS_OR_NETWORK',
      technicalDetail: `Fetch failed for ${streamUrl}`,
    };
  }

  // 3. hls.js fatal error mappings
  if (hlsError) {
    const details = hlsError.details || '';
    if (details === 'manifestLoadError' || details === 'manifestLoadTimeOut') {
      return {
        title: 'HLS Manifest Failed to Load',
        message:
          'Unable to download the HLS playlist (.m3u8). Check that the Mux Playback ID or URL is valid, reachable, and allows CORS.',
        codeLabel: `HLS_${details.toUpperCase()}`,
        technicalDetail: hlsError.reason || details,
      };
    }
    if (details === 'manifestParsingError' || details === 'manifestIncompatibleCodecsError') {
      return {
        title:
          details === 'manifestIncompatibleCodecsError'
            ? 'Unsupported HLS Codec'
            : 'Invalid HLS Manifest',
        message:
          details === 'manifestIncompatibleCodecsError'
            ? 'The browser Media Source Extensions (MSE) do not support the codecs declared in this HLS stream.'
            : 'The server response could not be parsed as a valid HLS (.m3u8) playlist.',
        codeLabel: `HLS_${details.toUpperCase()}`,
        technicalDetail: hlsError.reason || details,
      };
    }
    if (details === 'keyLoadError' || details === 'keyLoadTimeOut' || details === 'keySystemLicenseRequestFailed') {
      return {
        title: 'Encrypted or Protected Stream Error',
        message:
          'Unable to load the decryption key or license required for this protected HLS stream.',
        codeLabel: `HLS_${details.toUpperCase()}`,
        technicalDetail: hlsError.reason || details,
      };
    }
    if (details === 'bufferAddCodecError' || details === 'bufferAppendError') {
      return {
        title: 'Browser MSE Buffer / Codec Error',
        message:
          'This device could not initialize a media buffer for the video/audio codecs in this stream.',
        codeLabel: `HLS_${details.toUpperCase()}`,
        technicalDetail: hlsError.reason || details,
      };
    }
    if (hlsError.type === 'networkError' || details.includes('LoadError') || details.includes('TimeOut')) {
      return {
        title: 'HLS Network Transfer Error',
        message:
          'A network error or timeout interrupted downloading HLS playlist segments. Check your connection and retry.',
        codeLabel: `HLS_${(details || 'NETWORK_ERROR').toUpperCase()}`,
        technicalDetail: hlsError.reason || details || 'hls.js networkError',
      };
    }
    return {
      title: 'HLS Stream Playback Error',
      message: hlsError.reason || 'An unexpected error prevented HLS adaptive playback.',
      codeLabel: `HLS_${(details || 'FATAL_ERROR').toUpperCase()}`,
      technicalDetail: `${hlsError.type || 'unknown'}:${details}:${hlsError.reason || ''}`,
    };
  }

  // 4. Video.js SPF / SVTA error codes for HLS streams
  if (spfError?.code) {
    const code = spfError.code;
    if (code === 1001) {
      return {
        title: 'HLS Manifest Failed to Load',
        message:
          'Could not load the HLS playlist (.m3u8). Check that the Mux Playback ID or manifest URL is accessible and allows CORS.',
        codeLabel: `SVTA_${code}`,
        technicalDetail: `SPF SVTA ${code}: ${spfError.message || 'Primary manifest load error'}`,
      };
    }
    if (code === 99408 || (code >= 4000 && code < 5000)) {
      return {
        title: 'Encrypted or DRM-Protected Stream',
        message:
          'This stream uses encryption or DRM licensing that cannot be decrypted with the current configuration.',
        codeLabel: `SVTA_${code}`,
        technicalDetail: `SPF SVTA ${code}: ${spfError.message || 'Content protection error'}`,
      };
    }
    if (code === 99001 || code === 1004 || code === 1005 || code === 2011 || code === 2012) {
      return {
        title: 'Unsupported Media Codec or Track',
        message:
          'This browser could not find a compatible video or audio codec track in the HLS stream.',
        codeLabel: `SVTA_${code}`,
        technicalDetail: `SPF SVTA ${code}: ${spfError.message || 'Unsupported playback feature'}`,
      };
    }
    return {
      title: 'HLS Stream Playback Error',
      message:
        spfError.message ||
        'An error occurred while loading or segmenting the adaptive HLS stream.',
      codeLabel: `SVTA_${code}`,
      technicalDetail: `SPF SVTA ${code}: ${JSON.stringify(spfError.data || {})}`,
    };
  }

  // 5. Standard HTMLMediaElement MediaError fallback
  if (mediaError) {
    switch (mediaError.code) {
      case 1:
        return {
          title: 'Playback Aborted',
          message: 'Media loading was interrupted before playback could start.',
          codeLabel: 'MEDIA_ERR_ABORTED',
          technicalDetail: mediaError.message || 'MediaError.code=1',
        };
      case 2:
        return {
          title: 'Network Interruption',
          message:
            'A network error interrupted downloading the video stream. Check your connection and retry.',
          codeLabel: 'MEDIA_ERR_NETWORK',
          technicalDetail: mediaError.message || 'MediaError.code=2',
        };
      case 3:
        return {
          title: 'Video Decode Error',
          message:
            'The video stream appears corrupted or uses an unsupported codec profile for this device.',
          codeLabel: 'MEDIA_ERR_DECODE',
          technicalDetail: mediaError.message || 'MediaError.code=3',
        };
      case 4:
        return {
          title: 'Media Source Not Supported',
          message:
            'No supported video source or codec was found for this stream URL. Verify that it is a valid MP4 (H.264/AAC), WebM, or HLS (.m3u8) stream.',
          codeLabel: 'MEDIA_ERR_SRC_NOT_SUPPORTED',
          technicalDetail: mediaError.message || `MediaError.code=4 (${streamType})`,
        };
      default:
        break;
    }
  }

  return {
    title: 'Unable to Play Video Stream',
    message: 'An unexpected media error prevented playback. Retry or choose another stream.',
    codeLabel: 'UNKNOWN_MEDIA_ERROR',
    technicalDetail: `url=${streamUrl}, type=${streamType}`,
  };
}
