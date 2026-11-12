import React from 'react';
import { FilmReel } from '../data/cinemaReels';
import { Play, Check } from 'lucide-react';

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
  return (
    <section
      id="film-vault"
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-opacity duration-500 ${
        cinemaDimActive ? 'opacity-20 hover:opacity-100' : 'opacity-100'
      }`}
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 pb-3 border-b border-[rgba(197,203,210,0.1)]">
        <div>
          <span className="text-[10px] font-mono tracking-[0.22em] text-[#FF704F] uppercase block mb-1">
            MASTER REEL ARCHIVE
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-['Syne',sans-serif] text-[#F1F0EA] tracking-tight">
            Curated High-Dynamic-Range Cinema
          </h2>
        </div>
        <p className="text-xs font-mono text-[#C5CBD2]/60">
          Direct stream switching · Video.js v10 media pipeline
        </p>
      </div>

      {/* Cinematic Film Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {reels.map((reel) => {
          const isActive = activeFilm.id === reel.id;
          return (
            <button
              key={reel.id}
              onClick={() => onSelectFilm(reel)}
              className={`group text-left rounded-2xl p-3 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'border-[#FF704F] bg-[#141920] shadow-[0_0_24px_rgba(255,112,79,0.18)]'
                  : 'border-[rgba(197,203,210,0.12)] bg-[#10141A] hover:border-[rgba(197,203,210,0.3)] hover:bg-[#141920]'
              }`}
              aria-label={`Select and stream ${reel.title} (${reel.durationString})`}
            >
              {/* Media Thumbnail Container */}
              <div className="aspect-video w-full rounded-xl overflow-hidden relative mb-3 bg-black/90">
                <img
                  src={reel.thumbnail}
                  alt={reel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080A0D]/90 via-[#080A0D]/30 to-transparent" />

                {/* Top State Indicators */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  {/* Clean unboxed aspect ratio indicator */}
                  <span className="text-[10px] font-mono bg-[#080A0D]/80 backdrop-blur-sm px-2 py-0.5 rounded text-[#F1F0EA] border border-white/10">
                    {reel.aspectRatio}
                  </span>

                  {isActive ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono bg-[#FF704F] text-white px-2 py-0.5 rounded font-bold shadow-md tracking-wider">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      <span>STREAMING</span>
                    </span>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#080A0D]/75 border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      <Play className="w-3 h-3 text-white fill-current ml-0.5" />
                    </div>
                  )}
                </div>

                {/* Bottom Overlay Metrics */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-mono text-[#F1F0EA]">
                  <span className="text-[#C5CBD2]/80">{reel.chapters.length} Scenes</span>
                  <span className="text-[#FF704F] font-bold tabular-nums">{reel.durationString}</span>
                </div>
              </div>

              {/* Title & Metadata Strip */}
              <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-['Syne',sans-serif] font-bold text-sm text-[#F1F0EA] group-hover:text-[#FF704F] transition-colors truncate">
                    {reel.title}
                  </h3>
                  <p className="text-xs text-[#C5CBD2]/65 line-clamp-1 mt-0.5">
                    {reel.subtitle}
                  </p>
                </div>

                {/* Unboxed Metadata with Typographic Separator */}
                <div className="text-[11px] font-mono text-[#C5CBD2]/45 pt-2 border-t border-white/5 flex items-center justify-between">
                  <span>{reel.specs.resolution.split(' ')[0]}</span>
                  <span>·</span>
                  <span>{reel.specs.fps.split(' ')[0]} fps</span>
                  <span>·</span>
                  <span className="uppercase">{reel.colorGrade}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
