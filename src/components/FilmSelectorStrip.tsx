import React, { useState } from 'react';
import { FilmReel } from '../data/cinemaReels';
import { Play, Check, Film } from 'lucide-react';

interface FilmSelectorStripProps {
  reels: FilmReel[];
  activeFilm: FilmReel;
  onSelectFilm: (film: FilmReel) => void;
  cinemaDimActive: boolean;
}

export function FilmSelectorStrip({
  reels,
  activeFilm,
  onSelectFilm,
  cinemaDimActive,
}: FilmSelectorStripProps) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  return (
    <section
      id="film-vault"
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 transition-opacity duration-500 ${
        cinemaDimActive ? 'opacity-20 hover:opacity-100' : 'opacity-100'
      }`}
    >
      {/* Editorial Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-7 pb-4 border-b border-[rgba(226,232,240,0.1)]">
        <div>
          <span className="text-xs font-medium tracking-[0.14em] text-[#67D4FF] uppercase block mb-1.5">
            Cinema Library
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-['Syne',sans-serif] text-[#FFFFFF] tracking-tight">
            Curated Master Reels
          </h2>
        </div>
        <p className="text-xs text-[#94A3B8]">
          Select any film to stream instantly inside The Living Frame
        </p>
      </div>

      {/* Consistent 16:9 Film Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {reels.map((reel) => {
          const isActive = activeFilm.id === reel.id;
          const imgFailed = failedImages[reel.id];

          return (
            <button
              type="button"
              key={reel.id}
              onClick={() => onSelectFilm(reel)}
              className={`group text-left rounded-2xl p-3 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#67D4FF] ${
                isActive
                  ? 'border-[#67D4FF] bg-[#0B0F17] shadow-[0_14px_34px_-14px_rgba(103,212,255,0.28)]'
                  : 'border-[rgba(226,232,240,0.1)] bg-[#090D14] hover:border-[rgba(103,212,255,0.45)] hover:bg-[#0E1420] hover:-translate-y-0.5'
              }`}
              aria-label={`Select and stream ${reel.title} (${reel.durationString})`}
              aria-pressed={isActive}
            >
              {/* Clean 16:9 Cover Frame */}
              <div className="aspect-video w-full rounded-xl overflow-hidden relative mb-3.5 bg-[#05070B] border border-white/5">
                {!imgFailed ? (
                  <img
                    src={reel.thumbnail}
                    alt={`${reel.title} — ${reel.subtitle}`}
                    loading="lazy"
                    onError={() =>
                      setFailedImages((prev) => ({ ...prev, [reel.id]: true }))
                    }
                    className="w-full h-full object-cover object-center group-hover:scale-[1.035] transition-transform duration-500 ease-out"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0B0F17] via-[#111826] to-[#05070B] text-[#CBD5E1]/70 p-4">
                    <Film className="w-6 h-6 text-[#67D4FF] mb-1.5" />
                    <span className="text-xs font-['Syne',sans-serif] font-bold text-[#FFFFFF] text-center truncate w-full">
                      {reel.title}
                    </span>
                  </div>
                )}

                {/* Measured Scrim for Crisp Duration Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#05070B]/90 via-transparent to-transparent pointer-events-none" />

                {/* Top-Right Active / Hover Cue */}
                <div className="absolute top-2.5 right-2.5">
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-[#67D4FF] text-[#05070B] px-2 py-0.5 rounded-md font-semibold shadow-md">
                      <Check className="w-3 h-3 stroke-[2.75]" />
                      <span>Playing</span>
                    </span>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#0B0F17]/75 backdrop-blur-md border border-[#67D4FF]/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105 shadow-lg">
                      <Play className="w-3.5 h-3.5 text-[#67D4FF] fill-current ml-0.5" />
                    </div>
                  )}
                </div>

                {/* Bottom Duration & Scene Count */}
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-[#FFFFFF]">
                  <span className="text-[#CBD5E1] font-medium">{reel.chapters.length} Scenes</span>
                  <span className="font-mono text-[#67D4FF] font-semibold tabular-nums">
                    {reel.durationString}
                  </span>
                </div>
              </div>

              {/* Clean Title & Unboxed Editorial Metadata */}
              <div className="space-y-1.5 flex-1 flex flex-col justify-between px-0.5">
                <div>
                  <h3 className="font-['Syne',sans-serif] font-bold text-sm text-[#FFFFFF] group-hover:text-[#67D4FF] transition-colors truncate">
                    {reel.title}
                  </h3>
                  <p className="text-xs text-[#CBD5E1]/80 line-clamp-1 mt-0.5">
                    {reel.subtitle}
                  </p>
                </div>

                <div className="text-[11px] text-[#94A3B8] pt-2.5 mt-1 border-t border-white/5 flex items-center justify-between gap-2">
                  <span className="truncate">{reel.director}</span>
                  <span className="font-mono shrink-0 text-[#CBD5E1]/75">{reel.aspectRatio}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
