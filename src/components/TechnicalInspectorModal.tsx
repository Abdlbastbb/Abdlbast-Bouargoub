import React from 'react';
import { X, Activity, Cpu, ShieldCheck, Monitor, Volume2, Film } from 'lucide-react';
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-[#141920] border border-[rgba(197,203,210,0.14)] rounded-2xl shadow-2xl overflow-hidden p-6 text-[#F1F0EA]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF704F]/10 border border-[#FF704F]/30 flex items-center justify-center text-[#FF704F]">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 id="inspector-modal-title" className="text-lg font-bold font-['Syne',sans-serif] tracking-tight text-[#F1F0EA]">
                Cinematic Engine & Video.js v10 Telemetry
              </h2>
              <p className="text-xs text-[#C5CBD2]/75">
                Real-time media pipeline diagnostics and hardware stream metrics.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-[#C5CBD2]/60 hover:text-[#F1F0EA] transition-colors"
            aria-label="Close inspector modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-2 gap-3 my-5">
          {/* Framework Spec */}
          <div className="bg-[#080A0D] p-3.5 rounded-xl border border-white/5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-[#FF704F] uppercase mb-1">
              <Cpu className="w-3 h-3" />
              <span>CORE RUNTIME</span>
            </div>
            <div className="text-sm font-semibold text-[#F1F0EA]">Video.js v{videoState.videoJsVersion || '10.3.0'}</div>
            <div className="text-[11px] text-[#C5CBD2]/50 font-mono mt-0.5">Official React Skin Engine</div>
          </div>

          {/* Buffer Pipeline */}
          <div className="bg-[#080A0D] p-3.5 rounded-xl border border-white/5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-[#FF704F] uppercase mb-1">
              <Activity className="w-3 h-3" />
              <span>BUFFER HEALTH</span>
            </div>
            <div className="text-sm font-semibold text-[#F1F0EA] tabular-nums">
              +{bufferSecondsAhead.toFixed(1)}s ahead
            </div>
            <div className="text-[11px] text-[#C5CBD2]/50 font-mono mt-0.5">
              Buffered to {formatTime(videoState.bufferedEnd)}
            </div>
          </div>

          {/* Visual Canvas Dimensions */}
          <div className="bg-[#080A0D] p-3.5 rounded-xl border border-white/5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-[#FF704F] uppercase mb-1">
              <Monitor className="w-3 h-3" />
              <span>NATIVE DIMENSIONS</span>
            </div>
            <div className="text-sm font-semibold text-[#F1F0EA] tabular-nums">
              {videoState.videoWidth > 0 ? `${videoState.videoWidth} × ${videoState.videoHeight}` : film.specs.resolution}
            </div>
            <div className="text-[11px] text-[#C5CBD2]/50 font-mono mt-0.5">
              Aspect Ratio {film.aspectRatio}
            </div>
          </div>

          {/* Audio Master */}
          <div className="bg-[#080A0D] p-3.5 rounded-xl border border-white/5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-[#FF704F] uppercase mb-1">
              <Volume2 className="w-3 h-3" />
              <span>AUDIO PIPELINE</span>
            </div>
            <div className="text-sm font-semibold text-[#F1F0EA]">
              {videoState.muted ? 'Muted' : `${Math.round(videoState.volume * 100)}% Master`}
            </div>
            <div className="text-[11px] text-[#C5CBD2]/50 font-mono mt-0.5 truncate">
              {film.specs.audio}
            </div>
          </div>
        </div>

        {/* Master Film Specifications */}
        <div className="bg-[#080A0D] p-4 rounded-xl border border-white/5 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#C5CBD2]/50 uppercase tracking-widest pb-1 border-b border-white/5">
            <Film className="w-3.5 h-3.5 text-[#FF704F]" />
            <span>ENCODING & COLOR PROFILE</span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-[#C5CBD2]/70">Master Codec:</span>
            <span className="font-mono text-[#F1F0EA]">{film.specs.codec}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-[#C5CBD2]/70">Color Space:</span>
            <span className="font-mono text-[#F1F0EA]">{film.specs.colorSpace}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-[#C5CBD2]/70">Framerate:</span>
            <span className="font-mono text-[#F1F0EA]">{film.specs.fps}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-[#C5CBD2]/70">Stream Transport:</span>
            <span className="font-mono text-[#FF704F]">
              {film.isMux ? 'Mux Adaptive HLS (v4)' : film.streamType}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-[#C5CBD2]/70">Living Frame Aura:</span>
            <span className="font-mono text-[#FF704F] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Active Specular Sampling
            </span>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-[#F1F0EA] text-xs font-medium rounded-lg transition-colors"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}
