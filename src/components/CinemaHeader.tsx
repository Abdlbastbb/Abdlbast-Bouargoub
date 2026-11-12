import React from 'react';
import { Radio, HelpCircle, Upload } from 'lucide-react';
import { BrandLogoSlot } from './BrandLogoManager';

interface CinemaHeaderProps {
  onOpenStreamManager: () => void;
  onOpenLogoManager: () => void;
  onOpenShortcuts: () => void;
  cinemaDimActive: boolean;
}

export function CinemaHeader({
  onOpenStreamManager,
  onOpenLogoManager,
  onOpenShortcuts,
  cinemaDimActive,
}: CinemaHeaderProps) {
  return (
    <header
      className={`w-full border-b border-[rgba(197,203,210,0.1)] bg-[#080A0D]/90 backdrop-blur-md sticky top-0 z-40 transition-opacity duration-500 ${
        cinemaDimActive ? 'opacity-20 hover:opacity-100' : 'opacity-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand wordmark & dedicated geometric identity slot */}
        <div className="flex items-center gap-3 shrink-0">
          <BrandLogoSlot onOpenManager={onOpenLogoManager} />
        </div>

        {/* Zone 2: Editorial Navigation Links (Single-line, unboxed text) */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#C5CBD2]/75 tracking-wide">
          <a
            href="#cinema-stage"
            className="hover:text-[#F1F0EA] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
          >
            The Living Frame
          </a>
          <a
            href="#film-vault"
            className="hover:text-[#F1F0EA] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
          >
            Master Reels
          </a>
          <a
            href="#architecture"
            className="hover:text-[#F1F0EA] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
          >
            Cinematic Intelligence
          </a>
          <button
            onClick={onOpenShortcuts}
            className="hover:text-[#F1F0EA] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            aria-label="Open keyboard shortcuts guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#FF704F]" />
            <span>Shortcuts (?)</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Logo Integration Trigger */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenLogoManager}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border border-[rgba(197,203,210,0.18)] hover:border-[#FF704F]/50 text-[#C5CBD2] hover:text-[#F1F0EA] bg-white/[0.03] hover:bg-white/[0.06] transition-colors whitespace-nowrap shrink-0"
            aria-label="Upload custom brand logo"
          >
            <Upload className="w-3 h-3 text-[#FF704F]" />
            <span>Upload Logo</span>
          </button>

          <button
            onClick={onOpenStreamManager}
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white bg-[#FF704F] rounded-lg hover:bg-[#FF704F]/90 transition-all shadow-[0_0_16px_rgba(255,112,79,0.25)] whitespace-nowrap shrink-0 flex items-center gap-1.5"
            aria-label="Load Mux Stream or Select Cinema Reel"
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Load Mux Stream</span>
            <span className="sm:hidden">Mux Feed</span>
          </button>
        </div>
      </div>
    </header>
  );
}
