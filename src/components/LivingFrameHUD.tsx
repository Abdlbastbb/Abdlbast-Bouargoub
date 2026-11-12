import React, { useState, useRef } from 'react';
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
  Sun,
  Moon,
  Info,
  Radio,
} from 'lucide-react';
import { FilmReel } from '../data/cinemaReels';
import { Chapter, formatTime, AspectRatio, getChapterForTime } from '../utils/player-math';
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
  onOpenLogoManager: () => void;
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
  cinemaDimActive,
  activeAspectRatio,
  activeColorGrade,
  onTogglePlay,
  onSeek,
  onSeekRelative,
  onVolumeChange,
  onToggleMute,
  onPlaybackRateChange,
  onToggleFullscreen,
  onToggleAmbientAura,
  onToggleCinemaDim,
  onAspectRatioChange,
  onColorGradeChange,
  onOpenInspector,
  onOpenStreamManager,
  onOpenLogoManager,
}: LivingFrameHUDProps) {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [aspectMenuOpen, setAspectMenuOpen] = useState(false);
  const [chaptersMenuOpen, setChaptersMenuOpen] = useState(false);
  const [gradesMenuOpen, setGradesMenuOpen] = useState(false);

  const activeChapter = getChapterForTime(currentTime, film.chapters);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferPercent = duration > 0 ? (bufferedEnd / duration) * 100 : 0;

  // Handle timeline mouse/touch scrubbing
  const calculateScrubTime = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!progressBarRef.current || duration <= 0) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
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
    const newTime = calculateScrubTime(e);
    onSeek(newTime);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const scrubTime = calculateScrubTime(moveEvent);
      onSeek(scrubTime);
    };

    const onMouseUp = () => {
      setIsScrubbing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      className={`absolute inset-0 pointer-events-none flex flex-col justify-between transition-opacity duration-300 z-30 ${
        isControlsVisible || isPaused || speedMenuOpen || aspectMenuOpen || chaptersMenuOpen || gradesMenuOpen
          ? 'opacity-100'
          : 'opacity-0'
      }`}
    >
      {/* Top Bar HUD: Brand, Title, Logo Slot, Mode Toggles */}
      <div className="pointer-events-auto p-3 sm:p-5 md:p-6 bg-gradient-to-b from-[#080A0D]/90 via-[#080A0D]/50 to-transparent flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Brand Logo Placement Slot & Film Information */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          <div className="hidden sm:block">
            <BrandLogoSlot onOpenManager={onOpenLogoManager} compact />
          </div>
          <div className="hidden sm:block h-3.5 w-px bg-white/15" />
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold font-['Syne',sans-serif] text-[#F1F0EA] tracking-tight truncate">
              {film.title}
            </h1>
            {activeChapter && (
              <p className="text-[10px] sm:text-[11px] font-mono text-[#FF704F] truncate flex items-center gap-1">
                <Bookmark className="w-2.5 h-2.5 inline shrink-0" />
                <span className="truncate">{activeChapter.title}</span>
              </p>
            )}
          </div>
        </div>

        {/* Right: Quick Action Modifiers */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Cinema Dim Toggle */}
          <button
            onClick={onToggleCinemaDim}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors border ${
              cinemaDimActive
                ? 'bg-[#FF704F]/20 border-[#FF704F] text-[#FF704F]'
                : 'bg-[#080A0D]/80 border-white/10 text-[#C5CBD2]/75 hover:text-white hover:border-white/20'
            }`}
            aria-label={cinemaDimActive ? 'Exit Cinema Dim' : 'Enter Cinema Dim'}
            title="Toggle Cinema Dim (C)"
          >
            {cinemaDimActive ? <Moon className="w-3.5 h-3.5 text-[#FF704F]" /> : <Sun className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">CINEMA DIM</span>
          </button>

          {/* Stream Selector / Mux Switcher */}
          <button
            onClick={onOpenStreamManager}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors border bg-[#080A0D]/80 border-white/10 text-[#C5CBD2]/75 hover:text-white hover:border-[#FF704F]/40"
            aria-label="Open Stream Source & Mux Manager"
            title="Switch Film or Stream Mux Video"
          >
            <Radio className="w-3.5 h-3.5 text-[#FF704F]" />
            <span className="hidden md:inline">STREAM / MUX</span>
          </button>

          {/* Technical Diagnostics */}
          <button
            onClick={onOpenInspector}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors border bg-[#080A0D]/80 border-white/10 text-[#C5CBD2]/75 hover:text-white hover:border-white/20"
            aria-label="Open Technical Inspector"
            title="Video.js v10 Telemetry & Hardware Engine"
          >
            <Info className="w-3.5 h-3.5 text-[#C5CBD2]" />
          </button>
        </div>
      </div>

      {/* Middle Stage: Buffering indicator */}
      <div className="flex-1 flex items-center justify-center pointer-events-none">
        {isBuffering && (
          <div className="pointer-events-auto flex flex-col items-center justify-center p-6 rounded-2xl bg-[#080A0D]/90 backdrop-blur-md border border-[#FF704F]/35 shadow-2xl animate-pulse">
            <div className="w-10 h-10 rounded-full border-2 border-[#FF704F] border-t-transparent animate-spin mb-2.5" />
            <span className="text-xs font-mono tracking-widest text-[#F1F0EA] uppercase">
              LIVING FRAME BUFFERING
            </span>
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="pointer-events-auto p-3 sm:p-5 md:p-6 bg-gradient-to-t from-[#080A0D]/95 via-[#080A0D]/75 to-transparent space-y-2.5 sm:space-y-3">
        {/* Living Timeline Bar */}
        <div
          ref={progressBarRef}
          onMouseMove={handleTimelineMouseMove}
          onMouseLeave={handleTimelineMouseLeave}
          onMouseDown={handleTimelineMouseDown}
          className="relative h-6 flex items-center cursor-pointer group"
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
              className="absolute top-0 bottom-0 left-0 bg-[#FF704F] rounded-full transition-all duration-75 relative shadow-[0_0_12px_rgba(255,112,79,0.7)]"
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
                  className="absolute top-1/2 -translate-y-1/2 w-1 h-3 rounded-full bg-white/50 hover:bg-[#FF704F] hover:scale-150 transition-all z-10"
                  style={{ left: `${chPercent}%` }}
                  title={`${ch.title} (${formatTime(ch.time)})`}
                />
              );
            })}

          {/* Scrubber Playhead Handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#FF704F] shadow-[0_0_8px_rgba(255,112,79,0.85)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ left: `calc(${progressPercent}% - 7px)` }}
          />

          {/* Hover Scrub Preview Bubble */}
          {hoverPosition !== null && hoverTime !== null && (
            <div
              className="absolute -top-12 -translate-x-1/2 px-2.5 py-1 rounded bg-[#141920]/95 border border-[rgba(197,203,210,0.18)] shadow-xl pointer-events-none text-center z-20"
              style={{ left: `${hoverPosition}%` }}
            >
              <div className="font-mono text-[11px] font-bold text-[#F1F0EA] tabular-nums">
                {formatTime(hoverTime)}
              </div>
              {getChapterForTime(hoverTime, film.chapters) && (
                <div className="text-[10px] text-[#FF704F] max-w-[130px] truncate font-mono">
                  {getChapterForTime(hoverTime, film.chapters)?.title}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tactile Control Buttons Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 text-[#F1F0EA]">
          {/* Left Group: Play/Pause, Seek, Volume, Time */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Play/Pause Button (Signature Solar Orange) */}
            <button
              onClick={onTogglePlay}
              className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-[#FF704F] hover:bg-[#FF704F]/90 text-white flex items-center justify-center transition-all shadow-[0_0_16px_rgba(255,112,79,0.3)] hover:scale-105 active:scale-95"
              aria-label={isPaused ? 'Play Film (Space)' : 'Pause Film (Space)'}
              title={isPaused ? 'Play' : 'Pause'}
            >
              {isPaused ? (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5 fill-current" />
              ) : (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              )}
            </button>

            {/* Seek Backward 10s */}
            <button
              onClick={() => onSeekRelative(-10)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-[#C5CBD2]/75 hover:text-white transition-colors"
              aria-label="Seek Backward 10 seconds (←)"
              title="Seek Backward 10s"
            >
              <RotateCcw className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* Seek Forward 10s */}
            <button
              onClick={() => onSeekRelative(10)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-[#C5CBD2]/75 hover:text-white transition-colors"
              aria-label="Seek Forward 10 seconds (→)"
              title="Seek Forward 10s"
            >
              <RotateCw className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-1 group/vol relative">
              <button
                onClick={onToggleMute}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-[#C5CBD2]/75 hover:text-white transition-colors"
                aria-label={isMuted ? 'Unmute Audio (M)' : 'Mute Audio (M)'}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#FF704F]" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                ) : (
                  <Volume2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                )}
              </button>
              <div className="w-0 group-hover/vol:w-16 sm:w-16 md:w-20 overflow-hidden transition-all duration-200 flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-14 sm:w-16 h-1 accent-[#FF704F] bg-white/20 rounded cursor-pointer"
                  aria-label="Audio Volume Slider"
                />
              </div>
            </div>

            {/* Playback Time Display (Tabular) */}
            <div className="font-mono text-[11px] sm:text-xs text-[#C5CBD2]/80 tabular-nums ml-1">
              <span className="text-[#F1F0EA] font-medium">{formatTime(currentTime)}</span>
              <span className="text-white/30 mx-1">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Group: Scenes, Speed, Mattes, Aura, Fullscreen */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Chapters Jump Popover */}
            {film.chapters && film.chapters.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => {
                    setChaptersMenuOpen(!chaptersMenuOpen);
                    setSpeedMenuOpen(false);
                    setAspectMenuOpen(false);
                    setGradesMenuOpen(false);
                  }}
                  className={`px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-all ${
                    chaptersMenuOpen
                      ? 'bg-[#FF704F] text-white border-[#FF704F]'
                      : 'bg-[#080A0D]/80 text-[#C5CBD2]/75 border-white/10 hover:text-white'
                  }`}
                  aria-label="Open Chapters Menu"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">SCENES</span>
                </button>

                {chaptersMenuOpen && (
                  <div className="absolute bottom-11 right-0 w-64 bg-[#141920] border border-[rgba(197,203,210,0.18)] rounded-xl p-2 shadow-2xl z-40 max-h-60 overflow-y-auto">
                    <span className="text-[10px] font-mono text-[#C5CBD2]/50 uppercase tracking-widest px-2 py-1 block">
                      SCENE INDEX
                    </span>
                    {film.chapters.map((ch, idx) => (
                      <button
                        key={ch.id}
                        onClick={() => {
                          onSeek(ch.time);
                          setChaptersMenuOpen(false);
                        }}
                        className={`w-full text-left px-2 py-2 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                          activeChapter?.id === ch.id
                            ? 'bg-[#FF704F]/20 text-[#FF704F] font-bold'
                            : 'text-[#C5CBD2]/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span className="truncate pr-2">
                          {idx + 1}. {ch.title}
                        </span>
                        <span className="tabular-nums text-[11px] text-[#C5CBD2]/40">{formatTime(ch.time)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Playback Speed Popover */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => {
                  setSpeedMenuOpen(!speedMenuOpen);
                  setAspectMenuOpen(false);
                  setChaptersMenuOpen(false);
                  setGradesMenuOpen(false);
                }}
                className={`px-2 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                  speedMenuOpen
                    ? 'bg-[#FF704F] text-white border-[#FF704F]'
                    : 'bg-[#080A0D]/80 text-[#C5CBD2]/75 border-white/10 hover:text-white'
                }`}
                aria-label={`Playback Speed: ${playbackRate}x`}
              >
                {playbackRate}x
              </button>

              {speedMenuOpen && (
                <div className="absolute bottom-11 right-0 w-32 bg-[#141920] border border-[rgba(197,203,210,0.18)] rounded-xl p-1.5 shadow-2xl z-40">
                  <span className="text-[10px] font-mono text-[#C5CBD2]/50 uppercase tracking-widest px-2 py-1 block">
                    SPEED
                  </span>
                  {PLAYBACK_RATES.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        onPlaybackRateChange(rate);
                        setSpeedMenuOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs font-mono transition-colors ${
                        playbackRate === rate
                          ? 'bg-[#FF704F] text-white font-bold'
                          : 'text-[#C5CBD2]/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Aspect Ratio Mattes Popover */}
            <div className="relative">
              <button
                onClick={() => {
                  setAspectMenuOpen(!aspectMenuOpen);
                  setSpeedMenuOpen(false);
                  setChaptersMenuOpen(false);
                  setGradesMenuOpen(false);
                }}
                className={`px-2 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1 border transition-all ${
                  aspectMenuOpen
                    ? 'bg-[#FF704F] text-white border-[#FF704F]'
                    : 'bg-[#080A0D]/80 text-[#C5CBD2]/75 border-white/10 hover:text-white'
                }`}
                aria-label={`Aspect Ratio: ${activeAspectRatio}`}
                title="Change Matte Aspect Ratio"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{activeAspectRatio}</span>
              </button>

              {aspectMenuOpen && (
                <div className="absolute bottom-11 right-0 w-48 bg-[#141920] border border-[rgba(197,203,210,0.18)] rounded-xl p-2 shadow-2xl z-40">
                  <span className="text-[10px] font-mono text-[#C5CBD2]/50 uppercase tracking-widest px-2 py-1 block">
                    MATTE RATIOS
                  </span>
                  {ASPECT_RATIOS.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => {
                        onAspectRatioChange(item.value);
                        setAspectMenuOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                        activeAspectRatio === item.value
                          ? 'bg-[#FF704F]/20 text-[#FF704F] font-bold'
                          : 'text-[#C5CBD2]/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] text-[#C5CBD2]/40">{item.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Ambient Aura Toggle */}
            <button
              onClick={onToggleAmbientAura}
              className={`p-1.5 sm:p-2 rounded-lg text-xs font-mono transition-colors border ${
                ambientAuraActive
                  ? 'bg-[#FF704F]/20 text-[#FF704F] border-[#FF704F]/40'
                  : 'bg-[#080A0D]/80 border-white/10 text-[#C5CBD2]/60 hover:text-white'
              }`}
              aria-label={ambientAuraActive ? 'Disable Ambient Light Bleed (A)' : 'Enable Ambient Light Bleed (A)'}
              title="Toggle Ambient Light Bleed (A)"
            >
              <div className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center">
                <div className={`w-1.5 h-1.5 rounded-full ${ambientAuraActive ? 'bg-[#FF704F]' : 'bg-transparent'}`} />
              </div>
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={onToggleFullscreen}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-[#C5CBD2]/75 hover:text-white transition-colors"
              aria-label={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
              title="Fullscreen (F)"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              ) : (
                <Maximize className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
