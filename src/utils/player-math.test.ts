import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTime,
  calculateBufferPercentage,
  resolveStreamSource,
  getChapterForTime,
  getAspectRatioFactor,
  clampVolume,
  clampPlaybackRate,
  Chapter,
} from './player-math';

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

test('resolveStreamSource detects raw Mux ID, HLS URLs, and MP4s', () => {
  const muxIdResult = resolveStreamSource('A30101xAaCwQjvq4aWmCdOPdaovab100xAn');
  assert.equal(muxIdResult.isMux, true);
  assert.equal(muxIdResult.url, 'https://stream.mux.com/A30101xAaCwQjvq4aWmCdOPdaovab100xAn.m3u8');
  assert.equal(muxIdResult.type, 'application/x-mpegURL');

  const hlsResult = resolveStreamSource('https://example.com/live/playlist.m3u8');
  assert.equal(hlsResult.isMux, false);
  assert.equal(hlsResult.type, 'application/x-mpegURL');

  const mp4Result = resolveStreamSource('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  assert.equal(mp4Result.type, 'video/mp4');
  assert.equal(mp4Result.isMux, false);
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
