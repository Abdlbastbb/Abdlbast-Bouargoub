import React, { useState } from 'react';
import { CINEMA_REELS, FilmReel } from './data/cinemaReels';
import { AspectRatio } from './utils/player-math';
import { CinemaHeader } from './components/CinemaHeader';
import { NexusVideoPlayer } from './components/NexusVideoPlayer';
import { FilmSelectorStrip } from './components/FilmSelectorStrip';
import { CinematicFeaturesSection } from './components/CinematicFeaturesSection';
import { LogoIntegrationModal } from './components/BrandLogoManager';
import { MuxStreamModal } from './components/MuxStreamModal';
import { TechnicalInspectorModal } from './components/TechnicalInspectorModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { NexusBrandMark } from './components/NexusBrandMark';

export default function App() {
  const [activeFilm, setActiveFilm] = useState<FilmReel>(CINEMA_REELS[0]);
  const [ambientAuraActive, setAmbientAuraActive] = useState(true);
  const [cinemaDimActive, setCinemaDimActive] = useState(false);
  const [activeAspectRatio, setActiveAspectRatio] = useState<AspectRatio>(CINEMA_REELS[0].aspectRatio);
  const [activeColorGrade, setActiveColorGrade] = useState<'pristine' | 'celluloid' | 'noir' | 'vermilion'>('pristine');

  // Modal States
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [isInspectorModalOpen, setIsInspectorModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

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

  const handleSelectFilm = (film: FilmReel) => {
    setActiveFilm(film);
    setActiveAspectRatio(film.aspectRatio);
    setActiveColorGrade(film.colorGrade);
  };

  const handleLoadCustomStream = (customFilm: FilmReel) => {
    setActiveFilm(customFilm);
    setActiveAspectRatio(customFilm.aspectRatio);
  };

  return (
    <div className="min-h-screen bg-[#080A0D] text-[#F1F0EA] flex flex-col font-['Space_Grotesk',sans-serif] selection:bg-[#FF704F]/30 selection:text-[#F1F0EA]">
      {/* Subtle ambient specular light wash */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(255,112,79,0.06),transparent)]" />

      {/* Top Navigation */}
      <CinemaHeader
        onOpenStreamManager={() => setIsStreamModalOpen(true)}
        onOpenLogoManager={() => setIsLogoModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        cinemaDimActive={cinemaDimActive}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Cinema Stage Section */}
        <section id="cinema-stage" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 md:pt-10 pb-8">
          {/* Header Tagline & Brand Concept */}
          <div
            className={`transition-all duration-500 mb-5 sm:mb-7 flex flex-col md:flex-row md:items-end justify-between gap-4 ${
              cinemaDimActive ? 'opacity-20 hover:opacity-100' : 'opacity-100'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.22em] text-[#FF704F] uppercase">
                  CINEMATIC INTELLIGENCE · THE LIVING FRAME
                </span>
                <span className="text-[#C5CBD2]/30">·</span>
                <span className="text-[10px] sm:text-[11px] font-mono text-[#C5CBD2]/60 uppercase">
                  {activeFilm.specs.resolution.split(' ')[0]} {activeFilm.specs.fps.split(' ')[0]} FPS
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black font-['Syne',sans-serif] tracking-tight text-[#F1F0EA] uppercase leading-tight">
                BEYOND WATCHING.<br />
                <span className="text-[#FF704F]">INTO FEELING.</span>
              </h1>
            </div>

            {/* Quick Cinema Controls Strip */}
            <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
              <button
                onClick={() => setCinemaDimActive(!cinemaDimActive)}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  cinemaDimActive
                    ? 'bg-[#FF704F] text-white border-[#FF704F] shadow-md shadow-[#FF704F]/25 font-semibold'
                    : 'bg-[#141920] border-[rgba(197,203,210,0.14)] text-[#C5CBD2]/80 hover:text-white hover:border-[rgba(197,203,210,0.3)]'
                }`}
                title="Dim outer lights for complete immersion"
              >
                Cinema Dim: {cinemaDimActive ? 'Active' : 'Off'}
              </button>

              <button
                onClick={() => setAmbientAuraActive(!ambientAuraActive)}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  ambientAuraActive
                    ? 'bg-[#FF704F]/20 border-[#FF704F] text-[#FF704F] font-semibold'
                    : 'bg-[#141920] border-[rgba(197,203,210,0.14)] text-[#C5CBD2]/80 hover:text-white hover:border-[rgba(197,203,210,0.3)]'
                }`}
                title="Toggle reactive ambient light bleed"
              >
                Aura: {ambientAuraActive ? 'On' : 'Off'}
              </button>

              {/* Color grading filter selector */}
              <div className="flex items-center rounded-lg bg-[#141920] border border-[rgba(197,203,210,0.14)] p-0.5">
                {(['pristine', 'celluloid', 'noir', 'vermilion'] as const).map((grade) => (
                  <button
                    key={grade}
                    onClick={() => setActiveColorGrade(grade)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase transition-colors ${
                      activeColorGrade === grade
                        ? 'bg-[#FF704F] text-white font-bold'
                        : 'text-[#C5CBD2]/65 hover:text-white'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* The Living Frame Player */}
          <NexusVideoPlayer
            film={activeFilm}
            ambientAuraActive={ambientAuraActive}
            cinemaDimActive={cinemaDimActive}
            activeAspectRatio={activeAspectRatio}
            activeColorGrade={activeColorGrade}
            onToggleAmbientAura={() => setAmbientAuraActive(!ambientAuraActive)}
            onToggleCinemaDim={() => setCinemaDimActive(!cinemaDimActive)}
            onAspectRatioChange={setActiveAspectRatio}
            onColorGradeChange={setActiveColorGrade}
            onOpenInspector={() => setIsInspectorModalOpen(true)}
            onOpenStreamManager={() => setIsStreamModalOpen(true)}
            onOpenLogoManager={() => setIsLogoModalOpen(true)}
            onVideoStateUpdate={setVideoTelemetry}
          />

          {/* Film Details & Metadata Strip */}
          <div
            className={`mt-6 p-5 rounded-2xl bg-[#141920] border border-[rgba(197,203,210,0.12)] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-opacity duration-500 ${
              cinemaDimActive ? 'opacity-20 hover:opacity-100' : 'opacity-100'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-['Syne',sans-serif] font-bold text-base text-[#F1F0EA]">
                  {activeFilm.title}
                </span>
                <span className="text-[#C5CBD2]/30">·</span>
                <span className="text-xs font-mono text-[#FF704F]">{activeFilm.director}</span>
              </div>
              <p className="text-xs text-[#C5CBD2]/75 max-w-2xl leading-relaxed">
                {activeFilm.synopsis}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
              <button
                onClick={() => setIsInspectorModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg border border-[rgba(197,203,210,0.18)] hover:border-[rgba(197,203,210,0.35)] text-xs font-mono text-[#C5CBD2] hover:text-[#F1F0EA] bg-white/[0.03] transition-colors"
              >
                Inspect Telemetry
              </button>
              <button
                onClick={() => setIsStreamModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#FF704F] text-white text-xs font-semibold hover:bg-[#FF704F]/90 transition-colors shadow-md shadow-[#FF704F]/20"
              >
                Switch Stream
              </button>
            </div>
          </div>
        </section>

        {/* Master Film Vault Strip */}
        <FilmSelectorStrip
          reels={CINEMA_REELS}
          activeFilm={activeFilm}
          onSelectFilm={handleSelectFilm}
          cinemaDimActive={cinemaDimActive}
        />

        {/* Cinematic Features Bento */}
        <CinematicFeaturesSection
          onOpenLogoManager={() => setIsLogoModalOpen(true)}
          onOpenStreamManager={() => setIsStreamModalOpen(true)}
          cinemaDimActive={cinemaDimActive}
        />
      </main>

      {/* Quiet Competition Footer */}
      <footer
        className={`w-full border-t border-[rgba(197,203,210,0.1)] bg-[#080A0D] py-8 transition-opacity duration-500 ${
          cinemaDimActive ? 'opacity-20 hover:opacity-100' : 'opacity-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#C5CBD2]/55">
          <div className="flex items-center gap-3">
            <NexusBrandMark variant="emblem" size="sm" />
            <span className="font-['Syne',sans-serif] font-bold text-[#F1F0EA]">NEXUS ONE</span>
            <span>·</span>
            <span>CINEMATIC INTELLIGENCE</span>
            <span>·</span>
            <span>BEYOND WATCHING. INTO FEELING.</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Powered by Video.js v10.3.0</span>
            <span>·</span>
            <button
              onClick={() => setIsShortcutsModalOpen(true)}
              className="text-[#FF704F] hover:underline"
            >
              Shortcuts Guide (?)
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LogoIntegrationModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
      />

      <MuxStreamModal
        isOpen={isStreamModalOpen}
        onClose={() => setIsStreamModalOpen(false)}
        activeFilm={activeFilm}
        onSelectFilm={handleSelectFilm}
        onLoadCustomStream={handleLoadCustomStream}
      />

      <TechnicalInspectorModal
        isOpen={isInspectorModalOpen}
        onClose={() => setIsInspectorModalOpen(false)}
        film={activeFilm}
        videoState={videoTelemetry}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
}
