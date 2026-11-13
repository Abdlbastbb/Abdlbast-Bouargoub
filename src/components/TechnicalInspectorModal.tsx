import React from 'react';
import { X, Activity, Cpu, Monitor, Volume2, Film } from 'lucide-react';
import { FilmReel } from '../data/cinemaReels';
import { formatTime } from '../utils/player-math';

interface TechnicalInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  film: FilmReel;
  videoState: {
    currentTime: number;
    duration: number;
    volume: number;
    muted: boolean;
    playbackRate: number;
    bufferedEnd: number;
    videoWidth: number;
    videoHeight: number;
    isWaiting: boolean;
    isPaused: boolean;
    videoJsVersion: string;
  };
}

export function TechnicalInspectorModal({
  isOpen,
  onClose,
  film,
  videoState,
}: TechnicalInspectorModalProps) {
  if (!isOpen) return null;

  const bufferSecondsAhead = Math.max(0, videoState.bufferedEnd - videoState.currentTime);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inspector-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/82 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl cinema-glass border border-[rgba(226,232,240,0.16)] rounded-2xl shadow-2xl overflow-hidden p-6 text-[#FFFFFF]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#67D4FF]/10 border border-[#67D4FF]/30 flex items-center justify-center text-[#67D4FF]">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 id="inspector-modal-title" className="text-lg font-bold font-['Syne',sans-serif] tracking-tight text-[#FFFFFF]">
                Stream Telemetry & Video.js Engine
              </h2>
              <p className="text-xs text-[#CBD5E1]/80">
                Real-time playback diagnostics and active stream profile.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-[#94A3B8] hover:text-[#FFFFFF] transition-colors cursor-pointer"
            aria-label="Close inspector modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
          {/* Core Engine */}
          <div className="bg-[#05070B] p-3.5 rounded-xl border border-white/10">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#67D4FF] mb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>Player Runtime</span>
            </div>
            <div className="text-sm font-semibold text-[#FFFFFF]">
              Video.js v{videoState.videoJsVersion || '10.3.0'}
            </div>
            <div className="text-xs text-[#94A3B8] mt-0.5">React Skin Architecture</div>
          </div>

          {/* Buffer Pipeline */}
          <div className="bg-[#05070B] p-3.5 rounded-xl border border-white/10">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#67D4FF] mb-1">
              <Activity className="w-3.5 h-3.5" />
              <span>Buffer Ahead</span>
            </div>
            <div className="text-sm font-semibold text-[#FFFFFF] tabular-nums">
              +{bufferSecondsAhead.toFixed(1)}s buffered
            </div>
            <div className="text-xs text-[#94A3B8] font-mono tabular-nums mt-0.5">
              Loaded to {formatTime(videoState.bufferedEnd)}
            </div>
          </div>

          {/* Visual Canvas Dimensions */}
          <div className="bg-[#05070B] p-3.5 rounded-xl border border-white/10">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#67D4FF] mb-1">
              <Monitor className="w-3.5 h-3.5" />
              <span>Decoded Resolution</span>
            </div>
            <div className="text-sm font-semibold text-[#FFFFFF] tabular-nums">
              {videoState.videoWidth > 0 ? `${videoState.videoWidth} × ${videoState.videoHeight}` : film.specs.resolution}
            </div>
            <div className="text-xs text-[#94A3B8] mt-0.5">
              Frame Ratio {film.aspectRatio}
            </div>
          </div>

          {/* Audio Master */}
          <div className="bg-[#05070B] p-3.5 rounded-xl border border-white/10">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#67D4FF] mb-1">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Audio Output</span>
            </div>
            <div className="text-sm font-semibold text-[#FFFFFF] tabular-nums">
              {videoState.muted ? 'Muted' : `${Math.round(videoState.volume * 100)}% Volume`}
            </div>
            <div className="text-xs text-[#94A3B8] mt-0.5 truncate">
              {film.specs.audio}
            </div>
          </div>
        </div>

        {/* Stream Profile */}
        <div className="bg-[#05070B] p-4 rounded-xl border border-white/10 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#CBD5E1] pb-1.5 border-b border-white/10">
            <Film className="w-3.5 h-3.5 text-[#67D4FF]" />
            <span>Stream Profile</span>
          </div>
          <div className="flex justify-between gap-4 py-1 border-b border-white/5">
            <span className="text-[#94A3B8]">Codec</span>
            <span className="font-mono text-[#FFFFFF] text-right">{film.specs.codec}</span>
          </div>
          <div className="flex justify-between gap-4 py-1 border-b border-white/5">
            <span className="text-[#94A3B8]">Color Space</span>
            <span className="font-mono text-[#FFFFFF] text-right">{film.specs.colorSpace}</span>
          </div>
          <div className="flex justify-between gap-4 py-1">
            <span className="text-[#94A3B8]">Transport</span>
            <span className="font-mono text-[#67D4FF] text-right">
              {film.isMux ? 'Mux Adaptive HLS' : film.streamType}
            </span>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#67D4FF] hover:bg-[#8CE0FF] text-[#05070B] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
