import React from 'react';
import { FilmReel } from '../data/cinemaReels';
import { Play, Sparkles, Check } from 'lucide-react';

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
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-opacity duration-500 ${
        cinemaDimActive ? 'opacity-20 hover:opacity-100' : 'opacity-100'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-[#FF5638] uppercase block">
            CINEMATIC MASTER ARCHIVE
          </span>
          <h2 className="text-xl md:text-2xl font-bold font-['Syne',sans-serif] text-[#F2F0E9] tracking-tight mt-0.5">
            Curated 4K High-Dynamic-Range Reels
          </h2>
        </div>
        <div className="text-xs font-mono text-[#F2F0E9]/50 hidden sm:block">
          Select to load instant master stream
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reels.map((reel) => {
          const isActive = activeFilm.id === reel.id;
          return (
            <button
              key={reel.id}
              onClick={() => onSelectFilm(reel)}
              className={`group text-left rounded-2xl p-3 border transition-all relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'border-[#FF5638] bg-[#0F1218] shadow-[0_0_25px_rgba(255,86,56,0.2)]'
                  : 'border-white/10 bg-[#090B0F] hover:border-white/30 hover:bg-[#0F1218]'
              }`}
              aria-label={`Load ${reel.title} (${reel.durationString})`}
            >
              {/* Thumbnail Container */}
              <div className="aspect-video w-full rounded-xl overflow-hidden relative mb-3 bg-black">
                <img
                  src={reel.thumbnail}
                  alt={reel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Top badges */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                  <span className="text-[10px] font-mono bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[#F2F0E9] border border-white/10">
                    {reel.aspectRatio}
                  </span>
                  {isActive ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono bg-[#FF5638] text-white px-2 py-0.5 rounded-full font-bold shadow-md">
                      <Check className="w-2.5 h-2.5" /> ACTIVE
                    </span>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-black/60 border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-3 h-3 text-white fill-current ml-0.5" />
                    </div>
                  )}
                </div>

                {/* Bottom metrics */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-mono text-[#F2F0E9]">
                  <span className="text-white/70">{reel.chapters.length} Scenes</span>
                  <span className="text-[#FF5638] font-bold">{reel.durationString}</span>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="space-y-1">
                <h3 className="font-['Syne',sans-serif] font-bold text-sm text-[#F2F0E9] group-hover:text-[#FF5638] transition-colors truncate">
                  {reel.title}
                </h3>
                <p className="text-xs text-[#F2F0E9]/60 line-clamp-1">{reel.subtitle}</p>
                <div className="text-[10px] font-mono text-[#F2F0E9]/40 pt-1 border-t border-white/5 flex items-center justify-between">
                  <span>{reel.specs.resolution.split(' ')[0]}</span>
                  <span>{reel.specs.fps.split(' ')[0]} fps</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
