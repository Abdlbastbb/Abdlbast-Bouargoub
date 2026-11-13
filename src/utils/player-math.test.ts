import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTime,
  calculateBufferPercentage,
  resolveStreamSource,
  isLikelyMuxAssetId,
  isHlsStreamSource,
  inspectJwtToken,
  getChapterForTime,
  getAspectRatioFactor,
  clampVolume,
  clampPlaybackRate,
  Chapter,
} from './player-math';
import { formatPlaybackDiagnostics } from './stream-diagnostics';

function createFakeJwt(expSeconds: number): string {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub: 'abc', exp: expSeconds })).toString('base64url');
  return `${header}.${payload}.signature`;
}

test('formatTime formats seconds accurately into MM:SS and HH:MM:SS', () => {
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(9), '00:09');
  assert.equal(formatTime(65), '01:05');
  assert.equal(formatTime(599), '09:59');
  assert.equal(formatTime(3600), '01:00:00');
  assert.equal(formatTime(3665), '01:01:05');
  assert.equal(formatTime(-10), '00:00');
  assert.equal(formatTime(NaN), '00:00');
});

test('calculateBufferPercentage handles boundaries and calculation', () => {
  assert.equal(calculateBufferPercentage(0, 100), 0);
  assert.equal(calculateBufferPercentage(50, 100), 50);
  assert.equal(calculateBufferPercentage(75.55, 100), 75.6);
  assert.equal(calculateBufferPercentage(120, 100), 100);
  assert.equal(calculateBufferPercentage(50, 0), 0);
});

test('resolveStreamSource detects raw Mux Playback IDs, signed tokens, and rejects Asset IDs', () => {
  const muxIdResult = resolveStreamSource('A30101xAaCwQjvq4aWmCdOPdaovab100xAn');
  assert.equal(muxIdResult.valid, true);
  assert.equal(muxIdResult.isMux, true);
  assert.equal(muxIdResult.url, 'https://stream.mux.com/A30101xAaCwQjvq4aWmCdOPdaovab100xAn.m3u8');
  assert.equal(muxIdResult.type, 'application/x-mpegURL');

  // Reject UUID Mux Asset ID
  const assetUuidResult = resolveStreamSource('123e4567-e89b-12d3-a456-426614174000');
  assert.equal(assetUuidResult.valid, false);
  assert.equal(assetUuidResult.isAssetId, true);
  assert.ok(assetUuidResult.error?.includes('Asset ID'));
  assert.equal(isLikelyMuxAssetId('123e4567-e89b-12d3-a456-426614174000'), true);
  assert.equal(isLikelyMuxAssetId('uNbxnGLKJ00yfbijDO8COxTOyVKT01xpxW'), false);

  // Valid future signed token on Mux Playback ID
  const futureToken = createFakeJwt(Math.floor(Date.now() / 1000) + 3600);
  const signedMux = resolveStreamSource('uNbxnGLKJ00yfbijDO8COxTOyVKT01xpxW', futureToken);
  assert.equal(signedMux.valid, true);
  assert.equal(signedMux.isMux, true);
  assert.ok(signedMux.url.includes(`token=${futureToken}`));

  // Expired signed token is rejected cleanly
  const expiredToken = createFakeJwt(Math.floor(Date.now() / 1000) - 3600);
  const expiredMux = resolveStreamSource(`uNbxnGLKJ00yfbijDO8COxTOyVKT01xpxW?token=${expiredToken}`);
  assert.equal(expiredMux.valid, false);
  assert.equal(expiredMux.tokenExpired, true);
  assert.equal(inspectJwtToken(expiredToken).expired, true);

  // HLS URL with query parameters
  const hlsResult = resolveStreamSource('https://example.com/live/playlist.m3u8?cdn=fastly');
  assert.equal(hlsResult.valid, true);
  assert.equal(hlsResult.isMux, false);
  assert.equal(hlsResult.type, 'application/x-mpegURL');
  assert.equal(isHlsStreamSource(hlsResult.url, hlsResult.type), true);

  // MP4 URL
  const mp4Result = resolveStreamSource('https://media.w3.org/2010/05/bunny/trailer.mp4');
  assert.equal(mp4Result.valid, true);
  assert.equal(mp4Result.type, 'video/mp4');
  assert.equal(mp4Result.isMux, false);
  assert.equal(isHlsStreamSource(mp4Result.url, mp4Result.type), false);

  // Unsupported formats and protocols rejected
  const mkvResult = resolveStreamSource('https://example.com/movie.mkv');
  assert.equal(mkvResult.valid, false);
  assert.ok(mkvResult.error?.includes('Unsupported media format'));

  const badProtoResult = resolveStreamSource('javascript:alert(1)');
  assert.equal(badProtoResult.valid, false);
});

test('formatPlaybackDiagnostics translates HTTP, CORS, expired token, SPF, and MediaError codes accurately', () => {
  const err404 = formatPlaybackDiagnostics({
    streamUrl: 'https://stream.mux.com/invalid123456.m3u8',
    streamType: 'application/x-mpegURL',
    probe: { reachable: false, status: 404 },
  });
  assert.equal(err404.codeLabel, 'HTTP_404');

  const err403 = formatPlaybackDiagnostics({
    streamUrl: 'https://stream.mux.com/private123456.m3u8',
    streamType: 'application/x-mpegURL',
    probe: { reachable: false, status: 403 },
  });
  assert.equal(err403.codeLabel, 'HTTP_403');

  const errMime = formatPlaybackDiagnostics({
    streamUrl: 'https://example.com/not-a-video.mp4',
    streamType: 'video/mp4',
    probe: { reachable: true, status: 200, contentType: 'text/html; charset=utf-8' },
  });
  assert.equal(errMime.codeLabel, 'INVALID_MIME_TYPE');

  const errSpf = formatPlaybackDiagnostics({
    streamUrl: 'https://stream.mux.com/test123456.m3u8',
    streamType: 'application/x-mpegURL',
    spfError: { code: 1001, message: 'Manifest load error' },
  });
  assert.equal(errSpf.codeLabel, 'SVTA_1001');

  const errHls404 = formatPlaybackDiagnostics({
    streamUrl: 'https://stream.mux.com/missing12345.m3u8',
    streamType: 'application/x-mpegURL',
    hlsError: { type: 'networkError', details: 'manifestLoadError', httpStatus: 404 },
  });
  assert.equal(errHls404.codeLabel, 'HTTP_404');

  const errHlsManifest = formatPlaybackDiagnostics({
    streamUrl: 'https://example.com/bad.m3u8',
    streamType: 'application/x-mpegURL',
    hlsError: { type: 'networkError', details: 'manifestLoadError' },
  });
  assert.equal(errHlsManifest.codeLabel, 'HLS_MANIFESTLOADERROR');

  const errHlsKey = formatPlaybackDiagnostics({
    streamUrl: 'https://example.com/drm.m3u8',
    streamType: 'application/x-mpegURL',
    hlsError: { type: 'networkError', details: 'keyLoadError' },
  });
  assert.equal(errHlsKey.codeLabel, 'HLS_KEYLOADERROR');
});

test('getChapterForTime finds the correct active chapter', () => {
  const chapters: Chapter[] = [
    { id: '1', time: 0, title: 'Prologue: The Awakening' },
    { id: '2', time: 45, title: 'Act I: Orbital Descent' },
    { id: '3', time: 120, title: 'Act II: The Monolith' },
  ];

  assert.equal(getChapterForTime(10, chapters)?.title, 'Prologue: The Awakening');
  assert.equal(getChapterForTime(45, chapters)?.title, 'Act I: Orbital Descent');
  assert.equal(getChapterForTime(60, chapters)?.title, 'Act I: Orbital Descent');
  assert.equal(getChapterForTime(150, chapters)?.title, 'Act II: The Monolith');
});

test('getAspectRatioFactor returns correct values', () => {
  assert.equal(getAspectRatioFactor('16:9'), 16 / 9);
  assert.equal(getAspectRatioFactor('2.39:1'), 2.39);
  assert.equal(getAspectRatioFactor('21:9'), 21 / 9);
  assert.equal(getAspectRatioFactor('1.43:1'), 1.43);
});

test('clampVolume and clampPlaybackRate constrain values cleanly', () => {
  assert.equal(clampVolume(-0.5), 0);
  assert.equal(clampVolume(1.5), 1);
  assert.equal(clampVolume(0.7), 0.7);

  assert.equal(clampPlaybackRate(0.1), 0.25);
  assert.equal(clampPlaybackRate(3.0), 2.0);
  assert.equal(clampPlaybackRate(1.25), 1.25);
});
