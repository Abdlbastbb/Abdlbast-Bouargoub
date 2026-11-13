import React from 'react';
import { Radio, HelpCircle } from 'lucide-react';
import { BrandLogoSlot } from './BrandLogoManager';

interface CinemaHeaderProps {
  onOpenStreamManager: () => void;
  onOpenShortcuts: () => void;
  cinemaDimActive: boolean;
}

export function CinemaHeader({
  onOpenStreamManager,
  onOpenShortcuts,
  cinemaDimActive,
}: CinemaHeaderProps) {
  return (
    <header
      className={`w-full border-b border-[rgba(226,232,240,0.1)] bg-[#05070B]/82 backdrop-blur-xl sticky top-0 z-40 transition-opacity duration-500 ${
        cinemaDimActive ? 'opacity-20 hover:opacity-100' : 'opacity-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-[68px] sm:h-[76px] flex items-center justify-between gap-2 sm:gap-4 md:gap-8">
        {/* Zone 1: Permanently Fixed Original Brand Logo */}
        <a
          href="#cinema-stage"
          className="flex items-center py-1.5 pr-1 sm:pr-2 min-w-0 shrink rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#67D4FF]"
          aria-label="NEXUS ONE Home"
        >
          <BrandLogoSlot size="header" />
        </a>

        {/* Zone 2: Clean Editorial Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-xs font-medium text-[#CBD5E1] tracking-wide"
        >
          <a
            href="#cinema-stage"
            className="hover:text-[#FFFFFF] hover:underline decoration-[#67D4FF] underline-offset-8 transition-colors whitespace-nowrap shrink-0 py-2"
          >
            The Living Frame
          </a>
          <a
            href="#film-vault"
            className="hover:text-[#FFFFFF] hover:underline decoration-[#67D4FF] underline-offset-8 transition-colors whitespace-nowrap shrink-0 py-2"
          >
            Cinema Library
          </a>
          <a
            href="#architecture"
            className="hover:text-[#FFFFFF] hover:underline decoration-[#67D4FF] underline-offset-8 transition-colors whitespace-nowrap shrink-0 py-2"
          >
            Architecture
          </a>
          <button
            type="button"
            onClick={onOpenShortcuts}
            className="hover:text-[#FFFFFF] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-2 cursor-pointer"
            aria-label="Open keyboard shortcuts guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#67D4FF]" />
            <span>Shortcuts</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenShortcuts}
            className="md:hidden p-2 rounded-lg border border-[rgba(226,232,240,0.14)] text-[#CBD5E1] hover:text-[#FFFFFF] hover:border-[#67D4FF]/50 transition-colors cursor-pointer"
            aria-label="Open keyboard shortcuts guide"
          >
            <HelpCircle className="w-4 h-4 text-[#67D4FF]" />
          </button>

          <button
            type="button"
            onClick={onOpenStreamManager}
            className="px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold text-[#05070B] bg-[#67D4FF] rounded-lg hover:bg-[#8CE0FF] transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-[0_0_20px_rgba(103,212,255,0.22)] cursor-pointer active:scale-[0.98]"
            aria-label="Load Mux Stream or Select Cinema Reel"
          >
            <Radio className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Load Mux Stream</span>
            <span className="sm:hidden">Streams</span>
          </button>
        </div>
      </div>
    </header>
  );
}
