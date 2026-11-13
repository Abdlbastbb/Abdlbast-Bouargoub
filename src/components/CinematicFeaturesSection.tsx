import React from 'react';
import {
  Sparkles,
  Cpu,
  Radio,
  Sliders,
  ArrowUpRight,
} from 'lucide-react';

interface CinematicFeaturesSectionProps {
  onOpenInspector: () => void;
  onOpenStreamManager: () => void;
  cinemaDimActive: boolean;
}

export function CinematicFeaturesSection({
  onOpenInspector,
  onOpenStreamManager,
  cinemaDimActive,
}: CinematicFeaturesSectionProps) {
  return (
    <section
      id="architecture"
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18 transition-opacity duration-500 ${
        cinemaDimActive ? 'opacity-20 hover:opacity-100' : 'opacity-100'
      }`}
    >
      {/* Editorial Headline */}
      <div className="max-w-3xl mb-10 sm:mb-12">
        <span className="text-xs font-medium tracking-[0.14em] text-[#67D4FF] uppercase block mb-2">
          Architecture
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-['Syne',sans-serif] text-[#FFFFFF] tracking-tight text-balance">
          A New Visual Language for Experiencing Cinema
        </h2>
        <p className="text-sm md:text-base text-[#CBD5E1]/80 mt-3 leading-relaxed">
          NEXUS ONE pairs ambient edge illumination with frame-accurate scrubbing, cinema matte proportions, and adaptive Mux streaming on top of Video.js.
        </p>
      </div>

      {/* Editorial Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1 */}
        <div className="md:col-span-2 rounded-2xl cinema-glass border border-[rgba(226,232,240,0.1)] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden hover:border-[rgba(103,212,255,0.35)] transition-all">
          <div className="space-y-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#67D4FF]/10 border border-[#67D4FF]/25 flex items-center justify-center text-[#67D4FF]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg md:text-xl font-bold font-['Syne',sans-serif] text-[#FFFFFF]">
              01. The Living Frame Specular Bleed
            </h3>
            <p className="text-xs md:text-sm text-[#CBD5E1]/80 leading-relaxed max-w-xl">
              Instead of confining cinema inside harsh borders, The Living Frame extends soft, calibrated ambient light into the surrounding darkness. Activate Cinema Dim to fade peripheral controls away while watching.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center gap-3 text-xs text-[#94A3B8]">
            <span>Adaptive Specular Light</span>
            <span aria-hidden="true">·</span>
            <span>Cinema Dim Immersion</span>
            <span aria-hidden="true">·</span>
            <span>Compositor Accelerated</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl cinema-glass border border-[rgba(226,232,240,0.1)] p-6 md:p-8 flex flex-col justify-between hover:border-[rgba(103,212,255,0.35)] transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#67D4FF]/10 border border-[#67D4FF]/25 flex items-center justify-center text-[#67D4FF]">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-lg md:text-xl font-bold font-['Syne',sans-serif] text-[#FFFFFF]">
              02. Anamorphic Framing & Diagnostics
            </h3>
            <p className="text-xs md:text-sm text-[#CBD5E1]/80 leading-relaxed">
              Switch seamlessly between 2.39:1 Scope, 21:9 Ultrawide, 16:9 Theatrical, and 1.43:1 IMAX mattes while inspecting live buffer health and decode dimensions.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onOpenInspector}
              className="text-xs text-[#67D4FF] hover:text-[#8CE0FF] flex items-center gap-1 font-semibold group cursor-pointer"
            >
              <span>Inspect Stream Telemetry</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl cinema-glass border border-[rgba(226,232,240,0.1)] p-6 md:p-8 flex flex-col justify-between hover:border-[rgba(103,212,255,0.35)] transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#67D4FF]/10 border border-[#67D4FF]/25 flex items-center justify-center text-[#67D4FF]">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg md:text-xl font-bold font-['Syne',sans-serif] text-[#FFFFFF]">
              03. Video.js Cinema Engine
            </h3>
            <p className="text-xs md:text-sm text-[#CBD5E1]/80 leading-relaxed">
              Built on the Video.js React Skin architecture with lifecycle-managed refs for clean stream switching, responsive keyboard controls, and accurate time sync.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 text-xs text-[#94A3B8]">
            Hardware-Accelerated HTML5 Playback
          </div>
        </div>

        {/* Card 4 */}
        <div className="md:col-span-2 rounded-2xl cinema-glass border border-[rgba(226,232,240,0.1)] p-6 md:p-8 flex flex-col justify-between hover:border-[rgba(103,212,255,0.35)] transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#67D4FF]/10 border border-[#67D4FF]/25 flex items-center justify-center text-[#67D4FF]">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="text-lg md:text-xl font-bold font-['Syne',sans-serif] text-[#FFFFFF]">
              04. Adaptive Mux HLS Streaming
            </h3>
            <p className="text-xs md:text-sm text-[#CBD5E1]/80 leading-relaxed max-w-xl">
              Enter any public Mux Playback ID or direct media URL to stream adaptive multi-bitrate HLS and MP4 video directly inside The Living Frame.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-[#94A3B8]">
              Supports Mux HLS manifests and direct MP4/WebM feeds
            </span>
            <button
              type="button"
              onClick={onOpenStreamManager}
              className="text-xs text-[#67D4FF] hover:text-[#8CE0FF] font-semibold flex items-center gap-1 group shrink-0 cursor-pointer"
            >
              <span>Load Mux Stream</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
