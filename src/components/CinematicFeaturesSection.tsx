import React from 'react';
import {
  Sparkles,
  Cpu,
  Layers,
  Radio,
  Sliders,
  ShieldCheck,
  Eye,
  Keyboard,
  Upload,
} from 'lucide-react';

interface CinematicFeaturesSectionProps {
  onOpenLogoManager: () => void;
  onOpenStreamManager: () => void;
  cinemaDimActive: boolean;
}

export function CinematicFeaturesSection({
  onOpenLogoManager,
  onOpenStreamManager,
  cinemaDimActive,
}: CinematicFeaturesSectionProps) {
  return (
    <section
      id="architecture"
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 transition-opacity duration-500 ${
        cinemaDimActive ? 'opacity-20 hover:opacity-100' : 'opacity-100'
      }`}
    >
      {/* Editorial Headline */}
      <div className="max-w-3xl mb-12">
        <span className="text-[11px] font-mono tracking-widest text-[#FF5638] uppercase block mb-1">
          DESIGN PHILOSOPHY & ENGINEERING
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-['Syne',sans-serif] text-[#F2F0E9] tracking-tight text-balance">
          The Living Frame: An Architecture Engineered for Feeling
        </h2>
        <p className="text-sm md:text-base text-[#F2F0E9]/70 mt-3 leading-relaxed">
          NEXUS ONE departs radically from ordinary web video players. Built upon the latest Video.js v10 foundation, it merges edge-reactive ambient illumination, precision timeline scrubbing, and frictionless Mux stream integration into an uncompromised cinematic stage.
        </p>
      </div>

      {/* Feature Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: The Living Frame Ambient Aura */}
        <div className="md:col-span-2 rounded-2xl bg-[#0F1218] border border-[rgba(242,240,233,0.08)] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group">
          <div className="space-y-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#FF5638]/10 border border-[#FF5638]/30 flex items-center justify-center text-[#FF5638]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold font-['Syne',sans-serif] text-[#F2F0E9]">
              01. The Living Frame Aura
            </h3>
            <p className="text-xs md:text-sm text-[#F2F0E9]/70 leading-relaxed max-w-xl">
              Rather than boxing cinema inside rigid borders, the Living Frame bleeds dynamic specular light directly into the Obsidian Black backdrop (#090B0F). When Cinema Dim mode is active, the interface vanishes into deep darkness, letting luminance and emotion command your visual field.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-4 text-xs font-mono text-[#F2F0E9]/50">
            <span>Adaptive Light Bleed</span>
            <span>·</span>
            <span>Zero-Distraction Cinema Dim</span>
            <span>·</span>
            <span>Compositor-Accelerated</span>
          </div>
        </div>

        {/* Card 2: Dedicated Brand Logo Slot */}
        <div className="rounded-2xl bg-[#0F1218] border border-[rgba(242,240,233,0.08)] p-6 md:p-8 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5638]/10 border border-[#FF5638]/30 flex items-center justify-center text-[#FF5638]">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold font-['Syne',sans-serif] text-[#F2F0E9]">
              02. Dedicated Brand Logo Slot
            </h3>
            <p className="text-xs md:text-sm text-[#F2F0E9]/70 leading-relaxed">
              Designed with a dedicated logo integration area. You can upload and test your separately designed NEXUS ONE logo asset (PNG, SVG, WebP) with live scale and opacity controls.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5">
            <button
              onClick={onOpenLogoManager}
              className="text-xs font-mono text-[#FF5638] hover:text-[#FF5638]/80 flex items-center gap-1 font-semibold"
            >
              <span>Open Logo Integration Panel →</span>
            </button>
          </div>
        </div>

        {/* Card 3: Video.js v10 Framework Engine */}
        <div className="rounded-2xl bg-[#0F1218] border border-[rgba(242,240,233,0.08)] p-6 md:p-8 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5638]/10 border border-[#FF5638]/30 flex items-center justify-center text-[#FF5638]">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold font-['Syne',sans-serif] text-[#F2F0E9]">
              03. Video.js v10 Engine
            </h3>
            <p className="text-xs md:text-sm text-[#F2F0E9]/70 leading-relaxed">
              Powered by actual Video.js v10.3.0 runtime. Lifecycle-managed React hooks ensure zero memory leaks, true HLS buffer metrics, hardware decoding, and instant time synchronization.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 text-xs font-mono text-emerald-400">
            Official Video.js v10.3.0 Verified
          </div>
        </div>

        {/* Card 4: Mux Video Infrastructure Integration */}
        <div className="md:col-span-2 rounded-2xl bg-[#0F1218] border border-[rgba(242,240,233,0.08)] p-6 md:p-8 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5638]/10 border border-[#FF5638]/30 flex items-center justify-center text-[#FF5638]">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold font-['Syne',sans-serif] text-[#F2F0E9]">
              04. Mux Video Infrastructure Ready
            </h3>
            <p className="text-xs md:text-sm text-[#F2F0E9]/70 leading-relaxed max-w-xl">
              Architected for instant deployment with Mux. Enter any public Mux Playback ID to stream adaptive multi-bitrate HLS directly through the custom Video.js v10 player engine without external dependencies.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="text-xs font-mono text-[#F2F0E9]/50">
              `https://stream.mux.com/&#123;PLAYBACK_ID&#125;.m3u8`
            </div>
            <button
              onClick={onOpenStreamManager}
              className="text-xs font-mono text-[#FF5638] hover:text-[#FF5638]/80 font-semibold"
            >
              Test Mux Stream →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
