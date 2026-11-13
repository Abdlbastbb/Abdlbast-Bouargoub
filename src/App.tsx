import React, { useState, useEffect, useCallback } from 'react';
import { CINEMA_REELS, FilmReel } from './data/cinemaReels';
import { AspectRatio } from './utils/player-math';
import { CinemaHeader } from './components/CinemaHeader';
import { NexusVideoPlayer } from './components/NexusVideoPlayer';
import { FilmSelectorStrip } from './components/FilmSelectorStrip';
import { CinematicFeaturesSection } from './components/CinematicFeaturesSection';
import { MuxStreamModal } from './components/MuxStreamModal';
import { TechnicalInspectorModal } from './components/TechnicalInspectorModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { NexusBrandMark } from './components/NexusBrandMark';

const COLOR_LOOKS: { value: 'pristine' | 'celluloid' | 'noir' | 'vermilion'; label: string }[] = [
  { value: 'pristine', label: 'Natural' },
  { value: 'celluloid', label: 'Film' },
  { value: 'noir', label: 'Monochrome' },
  { value: 'vermilion', label: 'Cobalt' },
];

export default function App() {
  const [activeFilm, setActiveFilm] = useState<FilmReel>(CINEMA_REELS[0]);
  const [ambientAuraActive, setAmbientAuraActive] = useState(true);
  const [cinemaDimActive, setCinemaDimActive] = useState(false);
  const [activeAspectRatio, setActiveAspectRatio] = useState<AspectRatio>(CINEMA_REELS[0].aspectRatio);
  const [activeColorGrade, setActiveColorGrade] = useState<'pristine' | 'celluloid' | 'noir' | 'vermilion'>('pristine');

  // Modal States (Logo replacement UI permanently removed)
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [isInspectorModalOpen, setIsInspectorModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [autoPlayToken, setAutoPlayToken] = useState(0);

  // Real-time telemetry from Video.js player
  const [videoTelemetry, setVideoTelemetry] = useState<any>({
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    playbackRate: 1,
    bufferedEnd: 0,
    videoWidth: 0,
    videoHeight: 0,
    isWaiting: false,
    isPaused: true,
    videoJsVersion: '10.3.0',
  });

  // Global '?' shortcut to open Keyboard Shortcuts Guide & 'Escape' to close modals
  useEffect(() => {
    const onQuestionShortcut = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsStreamModalOpen(false);
        setIsInspectorModalOpen(false);
        setIsShortcutsModalOpen(false);
      }
    };
    window.addEventListener('keydown', onQuestionShortcut);
    return () => window.removeEventListener('keydown', onQuestionShortcut);
  }, []);

  const handleSelectFilm = useCallback((film: FilmReel) => {
    setActiveFilm(film);
    setActiveAspectRatio(film.aspectRatio);
    setActiveColorGrade(film.colorGrade);
    setAutoPlayToken((n) => n + 1);
  }, []);

  const handleLoadCustomStream = useCallback((customFilm: FilmReel) => {
    setActiveFilm(customFilm);
    setActiveAspectRatio(customFilm.aspectRatio);
    setAutoPlayToken((n) => n + 1);
  }, []);

  const handleToggleAmbientAura = useCallback(() => {
    setAmbientAuraActive((prev) => !prev);
  }, []);

  const handleToggleCinemaDim = useCallback(() => {
    setCinemaDimActive((prev) => !prev);
  }, []);

  const handleOpenStreamManager = useCallback(() => {
    setIsStreamModalOpen(true);
  }, []);

  const handleCloseStreamManager = useCallback(() => {
    setIsStreamModalOpen(false);
  }, []);

  const handleOpenInspector = useCallback(() => {
    setIsInspectorModalOpen(true);
  }, []);

  const handleCloseInspector = useCallback(() => {
    setIsInspectorModalOpen(false);
  }, []);

  const handleOpenShortcuts = useCallback(() => {
    setIsShortcutsModalOpen(true);
  }, []);

  const handleCloseShortcuts = useCallback(() => {
    setIsShortcutsModalOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#05070B] text-[#FFFFFF] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#67D4FF]/25 selection:text-[#FFFFFF] overflow-x-clip">
      {/* Subtle Light Electric Blue top atmospheric wash */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_75%_45%_at_50%_0%,rgba(103,212,255,0.065),transparent)]" />

      {/* Top Navigation */}
      <CinemaHeader
        onOpenStreamManager={handleOpenStreamManager}
        onOpenShortcuts={handleOpenShortcuts}
        cinemaDimActive={cinemaDimActive}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Cinema Stage Section */}
        <section id="cinema-stage" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 sm:pt-9 md:pt-11 pb-8">
          {/* Editorial Stage Header (No FPS/Resolution clutter) */}
          <div
            className={`transition-all duration-500 mb-6 sm:mb-7 flex flex-col lg:flex-row lg:items-end justify-between gap-5 ${
              cinemaDimActive ? 'opacity-20 hover:opacity-100' : 'opacity-100'
            }`}
          >
            <div>
              <span className="text-xs font-medium tracking-[0.16em] text-[#67D4FF] uppercase block mb-2">
                The Living Frame
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-[52px] font-extrabold font-['Syne',sans-serif] tracking-[-0.025em] text-[#FFFFFF] leading-[1.06] text-balance">
                Beyond Watching.
                <br />
                <span className="text-[#67D4FF]">Into Feeling.</span>
              </h1>
            </div>

            {/* Clean Stage Controls: Cinema Dim & Color Look */}
            <div className="flex items-center flex-wrap gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => setCinemaDimActive(!cinemaDimActive)}
                className={`px-3.5 py-2 rounded-xl border font-medium transition-all cursor-pointer ${
                  cinemaDimActive
                    ? 'bg-[#67D4FF] text-[#05070B] border-[#67D4FF] shadow-md shadow-[#67D4FF]/20 font-semibold'
                    : 'cinema-glass border-[rgba(226,232,240,0.14)] text-[#CBD5E1] hover:text-[#FFFFFF] hover:border-[rgba(103,212,255,0.4)]'
                }`}
                title="Dim surrounding interface for cinema focus (C)"
              >
                {cinemaDimActive ? 'Cinema Dim: On' : 'Cinema Dim'}
              </button>

              {/* Color Look Segmented Selector */}
              <div
                className="flex items-center rounded-xl cinema-glass border border-[rgba(226,232,240,0.14)] p-1 gap-0.5"
                role="group"
                aria-label="Color Grade Look"
              >
                {COLOR_LOOKS.map((look) => (
                  <button
                    type="button"
                    key={look.value}
                    onClick={() => setActiveColorGrade(look.value)}
                    aria-pressed={activeColorGrade === look.value}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      activeColorGrade === look.value
                        ? 'bg-[#67D4FF] text-[#05070B] font-semibold'
                        : 'text-[#CBD5E1]/75 hover:text-[#FFFFFF]'
                    }`}
                  >
                    {look.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* The Living Frame Player */}
          <NexusVideoPlayer
            film={activeFilm}
            autoPlayToken={autoPlayToken}
            ambientAuraActive={ambientAuraActive}
            cinemaDimActive={cinemaDimActive}
            activeAspectRatio={activeAspectRatio}
            activeColorGrade={activeColorGrade}
            onToggleAmbientAura={handleToggleAmbientAura}
            onToggleCinemaDim={handleToggleCinemaDim}
            onAspectRatioChange={setActiveAspectRatio}
            onColorGradeChange={setActiveColorGrade}
            onOpenInspector={handleOpenInspector}
            onOpenStreamManager={handleOpenStreamManager}
            onVideoStateUpdate={setVideoTelemetry}
          />

          {/* Clean Active Film Details Strip */}
          <div
            className={`mt-6 p-5 sm:p-6 rounded-2xl cinema-glass border border-[rgba(226,232,240,0.1)] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-opacity duration-500 ${
              cinemaDimActive ? 'opacity-20 hover:opacity-100' : 'opacity-100'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center flex-wrap gap-2">
                <span className="font-['Syne',sans-serif] font-bold text-base text-[#FFFFFF]">
                  {activeFilm.title}
                </span>
                <span className="text-[#94A3B8]/40" aria-hidden="true">·</span>
                <span className="text-xs font-medium text-[#67D4FF]">{activeFilm.director}</span>
                <span className="text-[#94A3B8]/40" aria-hidden="true">·</span>
                <span className="text-xs font-mono text-[#94A3B8]">{activeAspectRatio}</span>
              </div>
              <p className="text-xs sm:text-[13px] text-[#CBD5E1]/80 max-w-2xl leading-relaxed">
                {activeFilm.synopsis}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
              <button
                type="button"
                onClick={handleOpenInspector}
                className="px-3.5 py-2 rounded-xl border border-[rgba(226,232,240,0.16)] hover:border-[#67D4FF]/45 text-xs font-medium text-[#CBD5E1] hover:text-[#FFFFFF] bg-white/[0.03] transition-colors cursor-pointer"
              >
                Inspect Telemetry
              </button>
              <button
                type="button"
                onClick={handleOpenStreamManager}
                className="px-4 py-2 rounded-xl bg-[#67D4FF] text-[#05070B] text-xs font-semibold hover:bg-[#8CE0FF] transition-colors shadow-md shadow-[#67D4FF]/15 cursor-pointer"
              >
                Switch Stream
              </button>
            </div>
          </div>
        </section>

        {/* Master Film Library */}
        <FilmSelectorStrip
          reels={CINEMA_REELS}
          activeFilm={activeFilm}
          onSelectFilm={handleSelectFilm}
          cinemaDimActive={cinemaDimActive}
        />

        {/* Architecture Showcase */}
        <CinematicFeaturesSection
          onOpenInspector={handleOpenInspector}
          onOpenStreamManager={handleOpenStreamManager}
          cinemaDimActive={cinemaDimActive}
        />
      </main>

      {/* Quiet Editorial Footer */}
      <footer
        className={`w-full border-t border-[rgba(226,232,240,0.1)] bg-[#05070B] py-8 transition-opacity duration-500 ${
          cinemaDimActive ? 'opacity-20 hover:opacity-100' : 'opacity-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <div className="flex items-center flex-wrap justify-center gap-3">
            <NexusBrandMark variant="emblem" size="sm" />
            <span className="font-['Syne',sans-serif] font-bold text-[#FFFFFF]">NEXUS ONE</span>
            <span aria-hidden="true">·</span>
            <span>Beyond Watching. Into Feeling.</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Video.js Cinema Engine</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleOpenShortcuts}
              className="text-[#67D4FF] hover:underline cursor-pointer"
            >
              Shortcuts Guide (?)
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pt-5 border-t border-[rgba(226,232,240,0.06)] text-center">
          <p className="text-[11px] sm:text-xs tracking-[0.04em] text-[#CBD5E1]/70">
            © 2026 NEXUS ONE — by Abdelbast Bouargoub
          </p>
        </div>
      </footer>

      {/* Modals */}
      <MuxStreamModal
        isOpen={isStreamModalOpen}
        onClose={handleCloseStreamManager}
        activeFilm={activeFilm}
        onSelectFilm={handleSelectFilm}
        onLoadCustomStream={handleLoadCustomStream}
      />

      <TechnicalInspectorModal
        isOpen={isInspectorModalOpen}
        onClose={handleCloseInspector}
        film={activeFilm}
        videoState={videoTelemetry}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={handleCloseShortcuts}
      />
    </div>
  );
}
