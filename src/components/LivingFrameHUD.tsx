import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  Sliders,
  Bookmark,
  Info,
} from 'lucide-react';
import { FilmReel } from '../data/cinemaReels';
import { formatTime, AspectRatio, getChapterForTime } from '../utils/player-math';
import { BrandLogoSlot } from './BrandLogoManager';

interface LivingFrameHUDProps {
  film: FilmReel;
  currentTime: number;
  duration: number;
  bufferedEnd: number;
  isPaused: boolean;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isFullscreen: boolean;
  isBuffering: boolean;
  isControlsVisible: boolean;
  ambientAuraActive: boolean;
  cinemaDimActive: boolean;
  activeAspectRatio: AspectRatio;
  activeColorGrade: string;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onSeekRelative: (offset: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onPlaybackRateChange: (rate: number) => void;
  onToggleFullscreen: () => void;
  onToggleAmbientAura: () => void;
  onToggleCinemaDim: () => void;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onColorGradeChange: (grade: any) => void;
  onOpenInspector: () => void;
  onOpenStreamManager: () => void;
}

const PLAYBACK_RATES = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
const ASPECT_RATIOS: { label: string; value: AspectRatio; desc: string }[] = [
  { label: '2.39:1', value: '2.39:1', desc: 'Anamorphic Scope' },
  { label: '21:9', value: '21:9', desc: 'Cinematic Ultrawide' },
  { label: '16:9', value: '16:9', desc: 'Theatrical 16:9' },
  { label: '1.43:1', value: '1.43:1', desc: 'IMAX 70mm' },
];

export function LivingFrameHUD({
  film,
  currentTime,
  duration,
  bufferedEnd,
  isPaused,
  volume,
  isMuted,
  playbackRate,
  isFullscreen,
  isBuffering,
  isControlsVisible,
  ambientAuraActive,
  activeAspectRatio,
  onTogglePlay,
  onSeek,
  onSeekRelative,
  onVolumeChange,
  onToggleMute,
  onPlaybackRateChange,
  onToggleFullscreen,
  onToggleAmbientAura,
  onAspectRatioChange,
  onOpenInspector,
}: LivingFrameHUDProps) {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const menusRef = useRef<HTMLDivElement>(null);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [aspectMenuOpen, setAspectMenuOpen] = useState(false);
  const [chaptersMenuOpen, setChaptersMenuOpen] = useState(false);

  useEffect(() => {
    if (!speedMenuOpen && !aspectMenuOpen && !chaptersMenuOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (menusRef.current && !menusRef.current.contains(e.target as Node)) {
        setSpeedMenuOpen(false);
        setAspectMenuOpen(false);
        setChaptersMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSpeedMenuOpen(false);
        setAspectMenuOpen(false);
        setChaptersMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [speedMenuOpen, aspectMenuOpen, chaptersMenuOpen]);

  const activeChapter = getChapterForTime(currentTime, film.chapters);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferPercent = duration > 0 ? (bufferedEnd / duration) * 100 : 0;
  const effectiveVolumePercent = isMuted ? 0 : Math.round(volume * 100);

  // Shared clientX-to-time calculator for both mouse and touch scrubbing
  const calculateTimeFromClientX = (clientX: number) => {
    if (!progressBarRef.current || duration <= 0) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return pos * duration;
  };

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(ratio * 100);
    setHoverTime(ratio * duration);
  };

  const handleTimelineMouseLeave = () => {
    if (!isScrubbing) {
      setHoverPosition(null);
      setHoverTime(null);
    }
  };

  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    onSeek(calculateTimeFromClientX(e.clientX));

    const onMouseMove = (moveEvent: MouseEvent) => {
      onSeek(calculateTimeFromClientX(moveEvent.clientX));
    };

    const onMouseUp = () => {
      setIsScrubbing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleTimelineTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;
    setIsScrubbing(true);
    onSeek(calculateTimeFromClientX(e.touches[0].clientX));
  };

  const handleTimelineTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;
    onSeek(calculateTimeFromClientX(e.touches[0].clientX));
  };

  const handleTimelineTouchEnd = () => {
    setIsScrubbing(false);
  };

  return (
    <div
      className={`absolute inset-0 pointer-events-none flex flex-col justify-between transition-opacity duration-300 z-30 ${
        isControlsVisible || isPaused || speedMenuOpen || aspectMenuOpen || chaptersMenuOpen
          ? 'opacity-100'
          : 'opacity-0'
      }`}
    >
      {/* Top Bar HUD: Fixed Emblem, Film Title, Active Scene, Minimal Details Icon */}
      <div className="pointer-events-auto p-3 sm:p-5 md:p-6 bg-gradient-to-b from-[#05070B]/88 via-[#05070B]/40 to-transparent flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="hidden sm:block">
            <BrandLogoSlot compact />
          </div>
          <div className="hidden sm:block h-3.5 w-px bg-white/15" />
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold font-['Syne',sans-serif] text-[#FFFFFF] tracking-tight truncate">
              {film.title}
            </h2>
            {activeChapter && (
              <p className="text-[11px] font-medium text-[#67D4FF] truncate flex items-center gap-1.5 mt-0.5">
                <Bookmark className="w-2.5 h-2.5 inline shrink-0" />
                <span className="truncate">{activeChapter.title}</span>
              </p>
            )}
          </div>
        </div>

        {/* Single Quiet Stream Details Trigger */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenInspector}
            className="p-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors border bg-[#0B0F17]/75 backdrop-blur-md border-[rgba(226,232,240,0.14)] text-[#CBD5E1] hover:text-[#FFFFFF] hover:border-[#67D4FF]/50 cursor-pointer"
            aria-label="Open Technical Inspector"
            title="Stream Details"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Middle Stage: Buffering indicator */}
      <div className="flex-1 flex items-center justify-center pointer-events-none">
        {isBuffering && (
          <div className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#0B0F17]/88 backdrop-blur-xl border border-[#67D4FF]/35 shadow-2xl">
            <div className="w-4 h-4 rounded-full border-2 border-[#67D4FF] border-t-transparent animate-spin" />
            <span className="text-xs font-medium text-[#FFFFFF]">
              Loading stream...
            </span>
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="pointer-events-auto p-3 sm:p-5 md:p-6 bg-gradient-to-t from-[#05070B]/95 via-[#05070B]/70 to-transparent space-y-2 sm:space-y-3">
        {/* Living Timeline Bar (Mouse + Touch Scrubbing) */}
        <div
          ref={progressBarRef}
          onMouseMove={handleTimelineMouseMove}
          onMouseLeave={handleTimelineMouseLeave}
          onMouseDown={handleTimelineMouseDown}
          onTouchStart={handleTimelineTouchStart}
          onTouchMove={handleTimelineTouchMove}
          onTouchEnd={handleTimelineTouchEnd}
          className="relative h-6 flex items-center cursor-pointer group touch-none"
          role="slider"
          aria-label="Video Seek Timeline"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={currentTime}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') onSeekRelative(-5);
            if (e.key === 'ArrowRight') onSeekRelative(5);
          }}
        >
          {/* Background Track */}
          <div className="w-full h-1.5 group-hover:h-2 rounded-full bg-white/15 overflow-hidden transition-all relative">
            {/* Buffer Progress */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-white/25 rounded-full transition-all duration-200"
              style={{ width: `${Math.min(100, bufferPercent)}%` }}
            />
            {/* Playback Progress */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-[#67D4FF] rounded-full transition-all duration-75 shadow-[0_0_12px_rgba(103,212,255,0.65)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Chapter Markers along the timeline */}
          {duration > 0 &&
            film.chapters.map((ch) => {
              const chPercent = (ch.time / duration) * 100;
              return (
                <div
                  key={ch.id}
                  className="absolute top-1/2 -translate-y-1/2 w-1 h-2.5 rounded-full bg-white/60 hover:bg-[#67D4FF] hover:scale-150 transition-all z-10"
                  style={{ left: `${chPercent}%` }}
                  title={`${ch.title} (${formatTime(ch.time)})`}
                />
              );
            })}

          {/* Scrubber Playhead Handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#FFFFFF] border-2 border-[#67D4FF] shadow-[0_0_10px_rgba(103,212,255,0.85)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ left: `calc(${progressPercent}% - 7px)` }}
          />

          {/* Hover Scrub Preview Bubble */}
          {hoverPosition !== null && hoverTime !== null && (
            <div
              className="absolute -top-12 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#0B0F17]/95 backdrop-blur-xl border border-[rgba(226,232,240,0.2)] shadow-xl pointer-events-none text-center z-20"
              style={{ left: `${hoverPosition}%` }}
            >
              <div className="font-mono text-[11px] font-semibold text-[#FFFFFF] tabular-nums">
                {formatTime(hoverTime)}
              </div>
              {getChapterForTime(hoverTime, film.chapters) && (
                <div className="text-[10px] text-[#67D4FF] max-w-[140px] truncate font-medium">
                  {getChapterForTime(hoverTime, film.chapters)?.title}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tactile Control Buttons Row */}
        <div className="flex items-center justify-between gap-1 sm:gap-3 text-[#FFFFFF] min-w-0">
          {/* Left Group: Play/Pause, Seek, Volume, Time */}
          <div className="flex items-center gap-0.5 sm:gap-2 min-w-0">
            {/* Play/Pause Button (Light Electric Blue with Deep Midnight Icon) */}
            <button
              type="button"
              onClick={onTogglePlay}
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-[#67D4FF] hover:bg-[#8CE0FF] text-[#05070B] flex items-center justify-center transition-all shadow-[0_0_20px_rgba(103,212,255,0.3)] hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              aria-label={isPaused ? 'Play Film (Space)' : 'Pause Film (Space)'}
              title={isPaused ? 'Play (Space)' : 'Pause (Space)'}
            >
              {isPaused ? (
                <Play className="w-3.5 h-3.5 sm:w-5 sm:h-5 ml-0.5 fill-current" />
              ) : (
                <Pause className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-current" />
              )}
            </button>

            {/* Seek Backward 10s */}
            <button
              type="button"
              onClick={() => onSeekRelative(-10)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-[#CBD5E1] hover:text-[#FFFFFF] transition-colors cursor-pointer shrink-0"
              aria-label="Seek Backward 10 seconds (←)"
              title="Seek Backward 10s"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" />
            </button>

            {/* Seek Forward 10s */}
            <button
              type="button"
              onClick={() => onSeekRelative(10)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-[#CBD5E1] hover:text-[#FFFFFF] transition-colors cursor-pointer shrink-0"
              aria-label="Seek Forward 10 seconds (→)"
              title="Seek Forward 10s"
            >
              <RotateCw className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" />
            </button>

            {/* Volume Control with Light Electric Blue Track Fill */}
            <div className="flex items-center gap-1 sm:gap-1.5 group/vol relative shrink-0">
              <button
                type="button"
                onClick={onToggleMute}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-[#CBD5E1] hover:text-[#FFFFFF] transition-colors cursor-pointer shrink-0"
                aria-label={isMuted ? 'Unmute Audio (M)' : 'Mute Audio (M)'}
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px] text-[#67D4FF]" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" />
                )}
              </button>
              <div className="w-0 sm:group-hover/vol:w-16 sm:w-16 md:w-20 overflow-hidden transition-all duration-200 hidden sm:flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #67D4FF ${effectiveVolumePercent}%, rgba(255,255,255,0.2) ${effectiveVolumePercent}%)`,
                  }}
                  className="w-14 sm:w-16 h-1 rounded-full cursor-pointer"
                  aria-label="Audio Volume Slider"
                />
              </div>
            </div>

            {/* Playback Time Display (Tabular) */}
            <div className="font-mono text-[10px] sm:text-xs text-[#CBD5E1] tabular-nums ml-0.5 sm:ml-1 whitespace-nowrap">
              <span className="text-[#FFFFFF] font-medium">{formatTime(currentTime)}</span>
              <span className="text-white/30 mx-0.5 sm:mx-1">/</span>
              <span className="text-[#94A3B8]">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Group: Scenes, Speed, Aspect Matte, Aura, Fullscreen */}
          <div ref={menusRef} className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
            {/* Chapters Jump Popover */}
            {film.chapters && film.chapters.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setChaptersMenuOpen(!chaptersMenuOpen);
                    setSpeedMenuOpen(false);
                    setAspectMenuOpen(false);
                  }}
                  aria-expanded={chaptersMenuOpen}
                  className={`px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all whitespace-nowrap cursor-pointer ${
                    chaptersMenuOpen
                      ? 'bg-[#67D4FF] text-[#05070B] border-[#67D4FF] font-semibold'
                      : 'bg-[#0B0F17]/80 backdrop-blur-md text-[#CBD5E1] border-white/10 hover:text-[#FFFFFF] hover:border-white/25'
                  }`}
                  aria-label="Open Chapters Menu"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Scenes</span>
                </button>

                {chaptersMenuOpen && (
                  <div className="absolute bottom-11 right-0 w-64 bg-[#0B0F17]/95 backdrop-blur-xl border border-[rgba(226,232,240,0.18)] rounded-xl p-2 shadow-2xl z-40 max-h-60 overflow-y-auto">
                    <span className="text-[11px] font-medium text-[#94A3B8] px-2 py-1 block">
                      Scenes
                    </span>
                    {film.chapters.map((ch, idx) => (
                      <button
                        type="button"
                        key={ch.id}
                        onClick={() => {
                          onSeek(ch.time);
                          setChaptersMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          activeChapter?.id === ch.id
                            ? 'bg-[#67D4FF]/15 text-[#67D4FF] font-semibold'
                            : 'text-[#CBD5E1] hover:bg-white/5 hover:text-[#FFFFFF]'
                        }`}
                      >
                        <span className="truncate pr-2">
                          {idx + 1}. {ch.title}
                        </span>
                        <span className="font-mono tabular-nums text-[11px] text-[#94A3B8]">
                          {formatTime(ch.time)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Playback Speed Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setSpeedMenuOpen(!speedMenuOpen);
                  setAspectMenuOpen(false);
                  setChaptersMenuOpen(false);
                }}
                aria-expanded={speedMenuOpen}
                className={`px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono transition-all border whitespace-nowrap cursor-pointer ${
                  speedMenuOpen
                    ? 'bg-[#67D4FF] text-[#05070B] border-[#67D4FF] font-semibold'
                    : 'bg-[#0B0F17]/80 backdrop-blur-md text-[#CBD5E1] border-white/10 hover:text-[#FFFFFF] hover:border-white/25'
                }`}
                aria-label={`Playback Speed: ${playbackRate}x`}
              >
                {playbackRate}x
              </button>

              {speedMenuOpen && (
                <div className="absolute bottom-11 right-0 w-32 bg-[#0B0F17]/95 backdrop-blur-xl border border-[rgba(226,232,240,0.18)] rounded-xl p-1.5 shadow-2xl z-40">
                  <span className="text-[11px] font-medium text-[#94A3B8] px-2 py-1 block">
                    Speed
                  </span>
                  {PLAYBACK_RATES.map((rate) => (
                    <button
                      type="button"
                      key={rate}
                      onClick={() => {
                        onPlaybackRateChange(rate);
                        setSpeedMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                        playbackRate === rate
                          ? 'bg-[#67D4FF] text-[#05070B] font-bold'
                          : 'text-[#CBD5E1] hover:bg-white/5 hover:text-[#FFFFFF]'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Aspect Ratio Mattes Popover */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => {
                  setAspectMenuOpen(!aspectMenuOpen);
                  setSpeedMenuOpen(false);
                  setChaptersMenuOpen(false);
                }}
                aria-expanded={aspectMenuOpen}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-all whitespace-nowrap cursor-pointer ${
                  aspectMenuOpen
                    ? 'bg-[#67D4FF] text-[#05070B] border-[#67D4FF] font-semibold'
                    : 'bg-[#0B0F17]/80 backdrop-blur-md text-[#CBD5E1] border-white/10 hover:text-[#FFFFFF] hover:border-white/25'
                }`}
                aria-label={`Aspect Ratio: ${activeAspectRatio}`}
                title="Change Matte Aspect Ratio"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{activeAspectRatio}</span>
              </button>

              {aspectMenuOpen && (
                <div className="absolute bottom-11 right-0 w-52 bg-[#0B0F17]/95 backdrop-blur-xl border border-[rgba(226,232,240,0.18)] rounded-xl p-2 shadow-2xl z-40">
                  <span className="text-[11px] font-medium text-[#94A3B8] px-2 py-1 block">
                    Frame Aspect Ratio
                  </span>
                  {ASPECT_RATIOS.map((item) => (
                    <button
                      type="button"
                      key={item.value}
                      onClick={() => {
                        onAspectRatioChange(item.value);
                        setAspectMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        activeAspectRatio === item.value
                          ? 'bg-[#67D4FF]/15 text-[#67D4FF] font-semibold'
                          : 'text-[#CBD5E1] hover:bg-white/5 hover:text-[#FFFFFF]'
                      }`}
                    >
                      <span className="font-mono">{item.label}</span>
                      <span className="text-[11px] text-[#94A3B8]">{item.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Ambient Aura Toggle */}
            <button
              type="button"
              onClick={onToggleAmbientAura}
              className={`p-2 rounded-lg text-xs transition-colors border cursor-pointer hidden sm:flex items-center justify-center ${
                ambientAuraActive
                  ? 'bg-[#67D4FF]/15 text-[#67D4FF] border-[#67D4FF]/40'
                  : 'bg-[#0B0F17]/80 border-white/10 text-[#94A3B8] hover:text-[#FFFFFF]'
              }`}
              aria-label={ambientAuraActive ? 'Disable Ambient Light Bleed (A)' : 'Enable Ambient Light Bleed (A)'}
              title="Toggle Ambient Light Bleed (A)"
            >
              <div className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center">
                <div className={`w-1.5 h-1.5 rounded-full ${ambientAuraActive ? 'bg-[#67D4FF]' : 'bg-transparent'}`} />
              </div>
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="p-2 rounded-lg hover:bg-white/10 text-[#CBD5E1] hover:text-[#FFFFFF] transition-colors cursor-pointer shrink-0"
              aria-label={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
              title="Fullscreen (F)"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              ) : (
                <Maximize className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
