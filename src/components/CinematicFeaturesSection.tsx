import React from 'react';
import {
  Sparkles,
  Cpu,
  Radio,
  Upload,
  Layers,
  ArrowUpRight,
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
        <span className="text-[10px] font-mono tracking-[0.22em] text-[#FF704F] uppercase block mb-2">
          CINEMATIC INTELLIGENCE · ARCHITECTURAL SYSTEM
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-['Syne',sans-serif] text-[#F1F0EA] tracking-tight text-balance">
          A New Visual Language for Experiencing Cinema
        </h2>
        <p className="text-sm md:text-base text-[#C5CBD2]/75 mt-3 leading-relaxed">
          NEXUS ONE departs radically from generic streaming templates. Built upon the official Video.js v10 media engine, it unifies edge-reactive specular illumination, precision time scrubbing, and instant Mux adaptive streaming into an uncompromised cinematic stage.
        </p>
      </div>

      {/* Feature Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: The Living Frame Specular Bleed */}
        <div className="md:col-span-2 rounded-2xl bg-[#141920] border border-[rgba(197,203,210,0.12)] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-[rgba(197,203,210,0.25)] transition-all">
          <div className="space-y-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#FF704F]/10 border border-[#FF704F]/25 flex items-center justify-center text-[#FF704F]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg md:text-xl font-bold font-['Syne',sans-serif] text-[#F1F0EA]">
              01. The Living Frame Specular Bleed
            </h3>
            <p className="text-xs md:text-sm text-[#C5CBD2]/75 leading-relaxed max-w-xl">
              Rather than boxing cinema inside rigid borders, the Living Frame bleeds dynamic specular light directly into the Obsidian Black backdrop (#080A0D). When Cinema Dim mode is active, the interface vanishes into deep darkness, letting luminance and emotion command your visual field.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-3 text-xs font-mono text-[#C5CBD2]/50">
            <span>Adaptive Specular Light</span>
            <span>·</span>
            <span>Cinema Dim Immersion</span>
            <span>·</span>
            <span>Compositor Accelerated</span>
          </div>
        </div>

        {/* Card 2: Dedicated Brand Architecture */}
        <div className="rounded-2xl bg-[#141920] border border-[rgba(197,203,210,0.12)] p-6 md:p-8 flex flex-col justify-between hover:border-[rgba(197,203,210,0.25)] transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF704F]/10 border border-[#FF704F]/25 flex items-center justify-center text-[#FF704F]">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-lg md:text-xl font-bold font-['Syne',sans-serif] text-[#F1F0EA]">
              02. Brand Identity Architecture
            </h3>
            <p className="text-xs md:text-sm text-[#C5CBD2]/75 leading-relaxed">
              Designed with a dedicated logo integration area. You can upload and test your custom brand logo asset (PNG, SVG, WebP) with live scale, opacity, and blend mode calibration.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5">
            <button
              onClick={onOpenLogoManager}
              className="text-xs font-mono text-[#FF704F] hover:text-[#FF704F]/80 flex items-center gap-1 font-semibold group"
            >
              <span>Integrate Bespoke Logo</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Card 3: Video.js v10 Framework Engine */}
        <div className="rounded-2xl bg-[#141920] border border-[rgba(197,203,210,0.12)] p-6 md:p-8 flex flex-col justify-between hover:border-[rgba(197,203,210,0.25)] transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF704F]/10 border border-[#FF704F]/25 flex items-center justify-center text-[#FF704F]">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg md:text-xl font-bold font-['Syne',sans-serif] text-[#F1F0EA]">
              03. Video.js v10 Engine
            </h3>
            <p className="text-xs md:text-sm text-[#C5CBD2]/75 leading-relaxed">
              Powered by actual Video.js v10.3.0 runtime. Lifecycle-managed React hooks ensure zero memory leaks, true HLS buffer metrics, hardware decoding, and instant time synchronization.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 text-xs font-mono text-[#C5CBD2]/70 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF704F]" />
            <span>Official Video.js v10 Runtime</span>
          </div>
        </div>

        {/* Card 4: Mux Video Infrastructure Integration */}
        <div className="md:col-span-2 rounded-2xl bg-[#141920] border border-[rgba(197,203,210,0.12)] p-6 md:p-8 flex flex-col justify-between hover:border-[rgba(197,203,210,0.25)] transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF704F]/10 border border-[#FF704F]/25 flex items-center justify-center text-[#FF704F]">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="text-lg md:text-xl font-bold font-['Syne',sans-serif] text-[#F1F0EA]">
              04. Mux Video Infrastructure Ready
            </h3>
            <p className="text-xs md:text-sm text-[#C5CBD2]/75 leading-relaxed max-w-xl">
              Architected for instant deployment with Mux. Enter any public Mux Playback ID to stream adaptive multi-bitrate HLS directly through the custom Video.js v10 player engine without external dependencies.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs font-mono text-[#C5CBD2]/50 truncate">
              https://stream.mux.com/&#123;PLAYBACK_ID&#125;.m3u8
            </div>
            <button
              onClick={onOpenStreamManager}
              className="text-xs font-mono text-[#FF704F] hover:text-[#FF704F]/80 font-semibold flex items-center gap-1 group shrink-0"
            >
              <span>Test Mux Stream</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
