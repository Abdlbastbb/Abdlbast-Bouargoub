import React from 'react';
import { Sparkles, Radio, HelpCircle, Upload } from 'lucide-react';
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
      className={`w-full border-b border-[rgba(242,240,233,0.08)] bg-[#090B0F]/90 backdrop-blur-md sticky top-0 z-40 transition-opacity duration-500 ${
        cinemaDimActive ? 'opacity-20 hover:opacity-100' : 'opacity-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-8">
        {/* Zone 1: Brand wordmark & dedicated logo slot */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <BrandLogoSlot onOpenManager={onOpenLogoManager} />
        </div>

        {/* Zone 2: Navigation Links (Single-line, unboxed) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#F2F0E9]/70 tracking-wide">
          <a
            href="#cinema-stage"
            className="hover:text-[#F2F0E9] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
          >
            The Living Frame
          </a>
          <a
            href="#film-vault"
            className="hover:text-[#F2F0E9] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
          >
            Master Reels
          </a>
          <a
            href="#architecture"
            className="hover:text-[#F2F0E9] hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
          >
            Video.js v10 Core
          </a>
          <button
            onClick={onOpenShortcuts}
            className="hover:text-[#F2F0E9] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            aria-label="Open keyboard shortcuts"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#FF5638]" />
            <span>Shortcuts (?)</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenLogoManager}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border border-white/10 hover:border-[#FF5638]/50 text-[#F2F0E9]/80 hover:text-white bg-white/5 transition-colors whitespace-nowrap shrink-0"
            aria-label="Upload custom brand logo"
          >
            <Upload className="w-3 h-3 text-[#FF5638]" />
            <span>Integrate Logo</span>
          </button>

          <button
            onClick={onOpenStreamManager}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white bg-[#FF5638] rounded-lg hover:bg-[#FF5638]/90 transition-all shadow-[0_0_15px_rgba(255,86,56,0.3)] whitespace-nowrap shrink-0 flex items-center gap-1.5"
            aria-label="Load Mux Stream or Select Cinema Reel"
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Load Mux Stream</span>
            <span className="sm:hidden">Mux Stream</span>
          </button>
        </div>
      </div>
    </header>
  );
}
