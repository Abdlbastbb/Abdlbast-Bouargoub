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
import { Sparkles, Sliders, Radio, Film, Layers, Bookmark } from 'lucide-react';

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
    <div className="min-h-screen bg-[#090B0F] text-[#F2F0E9] flex flex-col font-['Space_Grotesk',sans-serif] selection:bg-[#FF5638]/30 selection:text-[#F2F0E9]">
      {/* Ambient background wash */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,86,56,0.07),rgba(255,255,255,0))]" />

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
        <section id="cinema-stage" className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 md:pt-10 pb-8">
          {/* Header Tagline & Brand Concept */}
          <div
            className={`transition-all duration-500 mb-4 sm:mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 ${
              cinemaDimActive ? 'opacity-20 hover:opacity-100' : 'opacity-100'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-[#FF5638] uppercase">
                  THE LIVING FRAME · VIDEO.JS V10
                </span>
                <span className="text-[#F2F0E9]/30">·</span>
                <span className="text-[10px] sm:text-[11px] font-mono text-[#F2F0E9]/50 uppercase">
                  {activeFilm.specs.resolution.split(' ')[0]} {activeFilm.specs.fps.split(' ')[0]} FPS
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold font-['Syne',sans-serif] tracking-tight text-[#F2F0E9] uppercase leading-tight">
                BEYOND WATCHING.<br />
                <span className="text-[#FF5638]">INTO FEELING.</span>
              </h1>
            </div>

            {/* Quick Cinema Controls Strip */}
            <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
              <button
                onClick={() => setCinemaDimActive(!cinemaDimActive)}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  cinemaDimActive
                    ? 'bg-[#FF5638] text-white border-[#FF5638] shadow-md shadow-[#FF5638]/20'
                    : 'bg-[#0F1218] border-white/10 text-[#F2F0E9]/70 hover:text-white hover:border-white/20'
                }`}
                title="Dim outer lights for complete immersion"
              >
                Cinema Dim: {cinemaDimActive ? 'Active' : 'Off'}
              </button>

              <button
                onClick={() => setAmbientAuraActive(!ambientAuraActive)}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  ambientAuraActive
                    ? 'bg-[#FF5638]/20 border-[#FF5638] text-[#FF5638]'
                    : 'bg-[#0F1218] border-white/10 text-[#F2F0E9]/70 hover:text-white hover:border-white/20'
                }`}
                title="Toggle reactive ambient light bleed"
              >
                Aura: {ambientAuraActive ? 'On' : 'Off'}
              </button>

              {/* Color grading filter selector */}
              <div className="flex items-center rounded-lg bg-[#0F1218] border border-white/10 p-0.5">
                {(['pristine', 'celluloid', 'noir', 'vermilion'] as const).map((grade) => (
                  <button
                    key={grade}
                    onClick={() => setActiveColorGrade(grade)}
                    className={`px-2 py-1 rounded text-[11px] font-mono uppercase transition-colors ${
                      activeColorGrade === grade
                        ? 'bg-[#FF5638] text-white font-bold'
                        : 'text-[#F2F0E9]/60 hover:text-white'
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
            className={`mt-6 p-5 rounded-2xl bg-[#0F1218] border border-[rgba(242,240,233,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-opacity duration-500 ${
              cinemaDimActive ? 'opacity-20 hover:opacity-100' : 'opacity-100'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-['Syne',sans-serif] font-bold text-base text-[#F2F0E9]">
                  {activeFilm.title}
                </span>
                <span className="text-[#F2F0E9]/40">·</span>
                <span className="text-xs font-mono text-[#FF5638]">{activeFilm.director}</span>
              </div>
              <p className="text-xs text-[#F2F0E9]/70 max-w-2xl leading-relaxed">
                {activeFilm.synopsis}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
              <button
                onClick={() => setIsInspectorModalOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 text-xs font-mono text-[#F2F0E9]/80 hover:text-white bg-white/5 transition-colors"
              >
                Inspect Telemetry
              </button>
              <button
                onClick={() => setIsStreamModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-[#FF5638] text-white text-xs font-semibold hover:bg-[#FF5638]/90 transition-colors shadow-md shadow-[#FF5638]/20"
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
        className={`w-full border-t border-[rgba(242,240,233,0.08)] bg-[#090B0F] py-8 transition-opacity duration-500 ${
          cinemaDimActive ? 'opacity-20 hover:opacity-100' : 'opacity-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#F2F0E9]/50">
          <div className="flex items-center gap-2">
            <span className="font-['Syne',sans-serif] font-bold text-[#F2F0E9]">NEXUS ONE</span>
            <span>·</span>
            <span>THE LIVING FRAME</span>
            <span>·</span>
            <span>BEYOND WATCHING. INTO FEELING.</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Powered by Video.js v10.3.0</span>
            <span>·</span>
            <button
              onClick={() => setIsShortcutsModalOpen(true)}
              className="text-[#FF5638] hover:underline"
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
