export type AspectRatio = '16:9' | '21:9' | '2.39:1' | '1.43:1' | 'auto';

export interface Chapter {
  id: string;
  time: number; // in seconds
  title: string;
  description?: string;
  thumbnail?: string;
}

export interface StreamResolutionResult {
  url: string;
  type: string;
  isMux: boolean;
  valid: boolean;
  playbackId?: string;
  token?: string;
  tokenExpired?: boolean;
  isAssetId?: boolean;
  error?: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MUX_PLAYBACK_ID_REGEX = /^[A-Za-z0-9]{8,64}$/;
const UNSUPPORTED_EXTENSIONS = new Set([
  '.mkv',
  '.avi',
  '.wmv',
  '.flv',
  '.mov',
  '.ts',
  '.mpd',
  '.html',
  '.htm',
  '.json',
  '.txt',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.svg',
]);

/**
 * Format seconds into cinematic HH:MM:SS or MM:SS
 */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Calculate buffer load percentage safely (0 - 100)
 */
export function calculateBufferPercentage(bufferedEnd: number, duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  if (!Number.isFinite(bufferedEnd) || bufferedEnd <= 0) return 0;
  const pct = (bufferedEnd / duration) * 100;
  return Math.min(100, Math.max(0, Math.round(pct * 10) / 10));
}

/**
 * Safely inspect a JWT token payload (client-side only, without secrets) to detect expiration.
 */
export function inspectJwtToken(token: string): {
  looksLikeJwt: boolean;
  expired: boolean;
  expiresAt?: number;
} {
  const clean = (token || '').trim();
  const parts = clean.split('.');
  if (parts.length !== 3) {
    return { looksLikeJwt: false, expired: false };
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const jsonStr =
      typeof atob === 'function'
        ? atob(padded)
        : Buffer.from(padded, 'base64').toString('utf8');
    const payload = JSON.parse(jsonStr);
    if (typeof payload?.exp === 'number') {
      const expiresAt = payload.exp * 1000;
      return {
        looksLikeJwt: true,
        expired: expiresAt <= Date.now(),
        expiresAt,
      };
    }
    return { looksLikeJwt: true, expired: false };
  } catch {
    return { looksLikeJwt: false, expired: false };
  }
}

/**
 * Check whether an identifier looks like a Mux Asset ID instead of a Playback ID.
 */
export function isLikelyMuxAssetId(value: string): boolean {
  const trimmed = (value || '').trim();
  if (!trimmed) return false;
  if (UUID_REGEX.test(trimmed)) return true;
  if (/^asset_[A-Za-z0-9_-]+$/i.test(trimmed)) return true;
  return false;
}

/**
 * Validate and resolve a Mux Playback ID (with optional signed token) or direct stream URL.
 */
export function resolveStreamSource(
  input: string,
  optionalToken?: string
): StreamResolutionResult {
  const trimmed = (input || '').trim();
  const cleanOptionalToken = (optionalToken || '').trim();

  if (!trimmed) {
    return {
      url: '',
      type: 'video/mp4',
      isMux: false,
      valid: false,
      error: 'Please enter a valid Mux Playback ID or video stream URL.',
    };
  }

  // Reject whitespace inside raw IDs or URLs
  if (/\s/.test(trimmed)) {
    return {
      url: '',
      type: 'video/mp4',
      isMux: false,
      valid: false,
      error: 'Input contains spaces. Enter a clean Playback ID or full stream URL.',
    };
  }

  // Reject Mux Asset IDs cleanly before treating them as Playback IDs
  if (isLikelyMuxAssetId(trimmed)) {
    return {
      url: '',
      type: 'application/x-mpegURL',
      isMux: true,
      valid: false,
      isAssetId: true,
      error:
        'This looks like a Mux Asset ID (UUID), not a Playback ID. Please copy the Playback ID from your Mux Asset playback settings.',
    };
  }

  // Check if input is a raw Playback ID (optionally followed by ?token=...)
  const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed);
  if (!hasProtocol && !trimmed.includes('/')) {
    const [rawId, rawQuery = ''] = trimmed.split('?');
    if (isLikelyMuxAssetId(rawId)) {
      return {
        url: '',
        type: 'application/x-mpegURL',
        isMux: true,
        valid: false,
        isAssetId: true,
        error:
          'This looks like a Mux Asset ID (UUID), not a Playback ID. Please copy the Playback ID from your Mux Asset playback settings.',
      };
    }

    if (MUX_PLAYBACK_ID_REGEX.test(rawId)) {
      const params = new URLSearchParams(rawQuery);
      if (cleanOptionalToken && !params.has('token')) {
        params.set('token', cleanOptionalToken);
      }

      const tokenVal = params.get('token') || undefined;
      if (tokenVal) {
        const jwtInfo = inspectJwtToken(tokenVal);
        if (jwtInfo.expired) {
          return {
            url: '',
            type: 'application/x-mpegURL',
            isMux: true,
            valid: false,
            playbackId: rawId,
            token: tokenVal,
            tokenExpired: true,
            error: `Signed Mux playback token expired on ${new Date(
              jwtInfo.expiresAt!
            ).toLocaleString()}. Generate a new token and try again.`,
          };
        }
      }

      const queryString = params.toString();
      const resolvedUrl = `https://stream.mux.com/${rawId}.m3u8${
        queryString ? `?${queryString}` : ''
      }`;

      return {
        url: resolvedUrl,
        type: 'application/x-mpegURL',
        isMux: true,
        valid: true,
        playbackId: rawId,
        token: tokenVal,
      };
    }

    return {
      url: '',
      type: 'video/mp4',
      isMux: false,
      valid: false,
      error:
        'Invalid Playback ID or URL. Enter an alphanumeric Mux Playback ID or an https:// stream URL (.m3u8, .mp4, or .webm).',
    };
  }

  // Full URL parsing and strict protocol validation
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      url: '',
      type: 'video/mp4',
      isMux: false,
      valid: false,
      error: 'Invalid stream URL format. Use a complete https:// URL or a Mux Playback ID.',
    };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return {
      url: '',
      type: 'video/mp4',
      isMux: false,
      valid: false,
      error: `Unsupported URL protocol (${parsed.protocol}). Only HTTP and HTTPS streams are supported.`,
    };
  }

  // Append optional signed token if provided in modal
  if (cleanOptionalToken && !parsed.searchParams.has('token')) {
    parsed.searchParams.set('token', cleanOptionalToken);
  }

  const isMuxHost = parsed.hostname === 'stream.mux.com' || parsed.hostname.endsWith('.mux.com');
  const pathname = parsed.pathname.toLowerCase();

  // Check Mux URL path for accidental Asset ID usage
  let extractedPlaybackId: string | undefined;
  if (isMuxHost) {
    const pathSlug = parsed.pathname.replace(/^\/+/, '').split('/')[0]?.replace(/\.m3u8$/i, '');
    if (pathSlug && isLikelyMuxAssetId(pathSlug)) {
      return {
        url: '',
        type: 'application/x-mpegURL',
        isMux: true,
        valid: false,
        isAssetId: true,
        error:
          'The Mux URL contains an Asset ID (UUID) instead of a Playback ID. Replace it with a valid Mux Playback ID.',
      };
    }
    if (pathSlug) {
      extractedPlaybackId = pathSlug;
    }
  }

  // Check signed token expiration if present
  const tokenParam = parsed.searchParams.get('token') || undefined;
  if (tokenParam) {
    const jwtInfo = inspectJwtToken(tokenParam);
    if (jwtInfo.expired) {
      return {
        url: '',
        type: 'application/x-mpegURL',
        isMux: isMuxHost,
        valid: false,
        playbackId: extractedPlaybackId,
        token: tokenParam,
        tokenExpired: true,
        error: `Signed playback token expired on ${new Date(
          jwtInfo.expiresAt!
        ).toLocaleString()}. Refresh the signed URL and try again.`,
      };
    }
  }

  const extMatch = pathname.match(/\.[a-z0-9]+$/i);
  const ext = extMatch ? extMatch[0].toLowerCase() : '';

  if (ext && UNSUPPORTED_EXTENSIONS.has(ext)) {
    return {
      url: '',
      type: 'video/mp4',
      isMux: isMuxHost,
      valid: false,
      error: `Unsupported media format (${ext}). Provide an HLS (.m3u8), MP4 (.mp4), or WebM (.webm) stream.`,
    };
  }

  if (ext === '.m3u8' || (isMuxHost && !ext)) {
    const finalUrl =
      isMuxHost && !ext
        ? `https://stream.mux.com/${extractedPlaybackId}.m3u8${parsed.search}`
        : parsed.toString();
    return {
      url: finalUrl,
      type: 'application/x-mpegURL',
      isMux: isMuxHost,
      valid: true,
      playbackId: extractedPlaybackId,
      token: tokenParam,
    };
  }

  if (ext === '.webm') {
    return {
      url: parsed.toString(),
      type: 'video/webm',
      isMux: false,
      valid: true,
    };
  }

  if (ext === '.ogg' || ext === '.ogv') {
    return {
      url: parsed.toString(),
      type: 'video/ogg',
      isMux: false,
      valid: true,
    };
  }

  // .mp4, .m4v, or direct CDN URL without file extension
  return {
    url: parsed.toString(),
    type: 'video/mp4',
    isMux: isMuxHost,
    valid: true,
    token: tokenParam,
  };
}

/**
 * Determine whether a stream should use the Video.js SPF HLS adapter.
 */
export function isHlsStreamSource(url: string, streamType?: string): boolean {
  if (streamType === 'application/x-mpegURL' || streamType === 'application/vnd.apple.mpegurl') {
    return true;
  }
  const cleanPath = (url || '').split('?')[0].split('#')[0].toLowerCase();
  return cleanPath.endsWith('.m3u8');
}

/**
 * Determine active chapter from current time
 */
export function getChapterForTime(currentTime: number, chapters: Chapter[]): Chapter | null {
  if (!chapters || chapters.length === 0) return null;
  const sorted = [...chapters].sort((a, b) => a.time - b.time);
  let active: Chapter | null = null;
  for (const ch of sorted) {
    if (currentTime >= ch.time) {
      active = ch;
    } else {
      break;
    }
  }
  return active || sorted[0];
}

/**
 * Aspect ratio numerical factor calculation
 */
export function getAspectRatioFactor(ratio: AspectRatio): number {
  switch (ratio) {
    case '2.39:1':
      return 2.39;
    case '21:9':
      return 21 / 9;
    case '1.43:1':
      return 1.43;
    case '16:9':
    default:
      return 16 / 9;
  }
}

/**
 * Clamp volume to valid 0 - 1 range
 */
export function clampVolume(vol: number): number {
  if (isNaN(vol)) return 1;
  return Math.min(1, Math.max(0, vol));
}

/**
 * Clamp playback rate to standard supported steps
 */
export function clampPlaybackRate(rate: number): number {
  const validRates = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
  if (validRates.includes(rate)) return rate;
  return Math.min(2.0, Math.max(0.25, rate));
}
