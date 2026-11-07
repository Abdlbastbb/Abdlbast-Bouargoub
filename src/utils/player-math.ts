export type AspectRatio = '16:9' | '21:9' | '2.39:1' | '1.43:1' | 'auto';

export interface Chapter {
  id: string;
  time: number; // in seconds
  title: string;
  description?: string;
  thumbnail?: string;
}

/**
 * Format seconds into cinematic HH:MM:SS or MM:SS
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
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
  if (!duration || isNaN(duration) || duration <= 0) return 0;
  if (!bufferedEnd || isNaN(bufferedEnd) || bufferedEnd <= 0) return 0;
  const pct = (bufferedEnd / duration) * 100;
  return Math.min(100, Math.max(0, Math.round(pct * 10) / 10));
}

/**
 * Standardize Mux Playback ID or Direct Stream URL
 */
export function resolveStreamSource(input: string): { url: string; type: string; isMux: boolean } {
  const trimmed = (input || '').trim();
  if (!trimmed) {
    return { url: '', type: 'video/mp4', isMux: false };
  }

  // If user pasted a Mux playback ID alone (alphanumeric ID usually 10-40 chars, no slashes or protocols)
  if (!trimmed.includes('/') && !trimmed.includes('.') && trimmed.length >= 8) {
    return {
      url: `https://stream.mux.com/${trimmed}.m3u8`,
      type: 'application/x-mpegURL',
      isMux: true,
    };
  }

  // If already an HLS URL (.m3u8)
  if (trimmed.includes('.m3u8')) {
    return {
      url: trimmed,
      type: 'application/x-mpegURL',
      isMux: trimmed.includes('mux.com'),
    };
  }

  // WebM
  if (trimmed.includes('.webm')) {
    return {
      url: trimmed,
      type: 'video/webm',
      isMux: false,
    };
  }

  // Default MP4 or direct video stream
  return {
    url: trimmed,
    type: 'video/mp4',
    isMux: trimmed.includes('mux.com'),
  };
}

/**
 * Determine active chapter from current time
 */
export function getChapterForTime(currentTime: number, chapters: Chapter[]): Chapter | null {
  if (!chapters || chapters.length === 0) return null;
  // sort chapters by time ascending
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
      return 21 / 9; // ~2.333
    case '1.43:1':
      return 1.43; // IMAX 70mm
    case '16:9':
    default:
      return 16 / 9; // ~1.777
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
