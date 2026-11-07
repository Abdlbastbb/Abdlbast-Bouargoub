import React, { useState } from 'react';
import { X, Play, Radio, Check, Sparkles, ExternalLink } from 'lucide-react';
import { CINEMA_REELS, FilmReel } from '../data/cinemaReels';
import { resolveStreamSource } from '../utils/player-math';

interface MuxStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilm: FilmReel;
  onSelectFilm: (film: FilmReel) => void;
  onLoadCustomStream: (customFilm: FilmReel) => void;
}

export function MuxStreamModal({
  isOpen,
  onClose,
  activeFilm,
  onSelectFilm,
  onLoadCustomStream,
}: MuxStreamModalProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'mux' | 'custom'>('catalog');
  const [muxPlaybackId, setMuxPlaybackId] = useState('');
  const [customStreamUrl, setCustomStreamUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('Custom Stream Source');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyMux = (e: React.FormEvent) => {
    e.preventDefault();
    const resolved = resolveStreamSource(muxPlaybackId);
    if (!resolved.url) {
      setStatusMessage('Please enter a valid Mux Playback ID or Stream URL.');
      return;
    }

    const newFilm: FilmReel = {
      id: `mux-${Date.now()}`,
      title: customTitle || 'Mux Hosted Cinema',
      subtitle: `Mux Public Playback ID: ${muxPlaybackId.trim().slice(0, 16)}...`,
      director: 'Mux Video Infrastructure',
      durationString: 'Live / VOD',
      aspectRatio: '16:9',
      colorGrade: 'pristine',
      ambientGlowColor: 'rgba(255, 86, 56, 0.4)',
      thumbnail: activeFilm.thumbnail,
      streamUrl: resolved.url,
      streamType: resolved.type,
      isMux: true,
      muxPlaybackId: muxPlaybackId.trim(),
      synopsis: 'Direct high-fidelity adaptive bitrate stream provisioned through Mux Video infrastructure and rendered inside NEXUS ONE The Living Frame.',
      specs: {
        resolution: 'Adaptive Multi-Bitrate HLS',
        codec: 'H.264 / AAC (HLS v4)',
        audio: 'Stereo Master 48kHz',
        fps: 'Native Stream FPS',
        colorSpace: 'sRGB / Rec.709',
      },
      chapters: [
        { id: 'm1', time: 0, title: 'Stream Start', description: 'Stream initialized via Mux Video.' },
      ],
    };

    onLoadCustomStream(newFilm);
    onClose();
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const resolved = resolveStreamSource(customStreamUrl);
    if (!resolved.url) {
      setStatusMessage('Please enter a valid video stream URL (.mp4, .m3u8, or .webm).');
      return;
    }

    const newFilm: FilmReel = {
      id: `custom-${Date.now()}`,
      title: customTitle || 'External Cinematic Stream',
      subtitle: resolved.url.split('/').pop() || 'Custom Feed',
      director: 'External Feed',
      durationString: 'Dynamic',
      aspectRatio: '16:9',
      colorGrade: 'pristine',
      ambientGlowColor: 'rgba(255, 86, 56, 0.4)',
      thumbnail: activeFilm.thumbnail,
      streamUrl: resolved.url,
      streamType: resolved.type,
      isMux: resolved.isMux,
      synopsis: 'Custom user-provided video stream initialized through Video.js v10 media engine.',
      specs: {
        resolution: 'Direct Web Stream',
        codec: resolved.type,
        audio: 'Web Audio Standard',
        fps: 'Stream Native',
        colorSpace: 'Standard Video',
      },
      chapters: [
        { id: 'c1', time: 0, title: 'Stream Inception', description: 'User injected video feed.' },
      ],
    };

    onLoadCustomStream(newFilm);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="stream-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-[#0F1218] border border-[rgba(242,240,233,0.12)] rounded-2xl shadow-2xl overflow-hidden p-6 text-[#F2F0E9] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/5">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-[#FF5638] uppercase block mb-1">
              SPECIFICATION 9 · VIDEO & MUX INTEGRATION
            </span>
            <h2 id="stream-modal-title" className="text-xl font-bold font-['Syne',sans-serif] tracking-tight">
              Stream Source & Film Reel Selector
            </h2>
            <p className="text-xs text-[#F2F0E9]/65 mt-1">
              Switch between curated 4K cinema reels, input your public Mux Playback ID, or load custom HLS/MP4 streams.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-[#F2F0E9]/60 hover:text-[#F2F0E9] transition-colors"
            aria-label="Close stream selector modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 p-1 bg-[#090B0F] rounded-xl my-4 border border-white/5">
          <button
            onClick={() => { setActiveTab('catalog'); setStatusMessage(null); }}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'catalog'
                ? 'bg-[#FF5638] text-white shadow-lg shadow-[#FF5638]/20 font-semibold'
                : 'text-[#F2F0E9]/70 hover:text-white'
            }`}
          >
            Curated 4K Cinema Reels
          </button>
          <button
            onClick={() => { setActiveTab('mux'); setStatusMessage(null); }}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'mux'
                ? 'bg-[#FF5638] text-white shadow-lg shadow-[#FF5638]/20 font-semibold'
                : 'text-[#F2F0E9]/70 hover:text-white'
            }`}
          >
            Mux Playback ID
          </button>
          <button
            onClick={() => { setActiveTab('custom'); setStatusMessage(null); }}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'custom'
                ? 'bg-[#FF5638] text-white shadow-lg shadow-[#FF5638]/20 font-semibold'
                : 'text-[#F2F0E9]/70 hover:text-white'
            }`}
          >
            Custom Stream URL
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          {activeTab === 'catalog' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CINEMA_REELS.map((film) => {
                const isSelected = activeFilm.id === film.id;
                return (
                  <div
                    key={film.id}
                    onClick={() => {
                      onSelectFilm(film);
                      onClose();
                    }}
                    className={`cursor-pointer rounded-xl p-3 border transition-all text-left relative group overflow-hidden ${
                      isSelected
                        ? 'border-[#FF5638] bg-[#FF5638]/10'
                        : 'border-white/10 bg-[#090B0F] hover:border-white/30'
                    }`}
                  >
                    <div className="aspect-video w-full rounded-lg overflow-hidden relative mb-2.5 bg-black">
                      <img
                        src={film.thumbnail}
                        alt={film.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-mono text-[#F2F0E9]">
                        <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm border border-white/10">
                          {film.aspectRatio}
                        </span>
                        <span className="text-[#FF5638] font-bold">{film.durationString}</span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-[#FF5638] text-white p-1 rounded-full shadow-lg">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <h3 className="font-['Syne',sans-serif] font-bold text-sm text-[#F2F0E9] group-hover:text-[#FF5638] transition-colors">
                      {film.title}
                    </h3>
                    <p className="text-xs text-[#F2F0E9]/60 line-clamp-1 mt-0.5">{film.subtitle}</p>
                    <p className="text-[11px] font-mono text-[#F2F0E9]/40 mt-1">{film.specs.resolution} · {film.specs.codec}</p>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'mux' && (
            <form onSubmit={handleApplyMux} className="space-y-4">
              <div className="p-4 rounded-xl bg-[#090B0F] border border-white/10 text-xs text-[#F2F0E9]/75 space-y-2">
                <div className="flex items-center gap-2 text-[#FF5638] font-semibold text-sm">
                  <Radio className="w-4 h-4" />
                  <span>Native Mux Video Streaming</span>
                </div>
                <p>
                  Paste your public Mux Playback ID below. NEXUS ONE automatically resolves the adaptive HLS manifest (`https://stream.mux.com/&#123;PLAYBACK_ID&#125;.m3u8`) and streams via Video.js v10.
                </p>
                <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-[#F2F0E9]/50">
                  <span>Demo ID available:</span>
                  <button
                    type="button"
                    onClick={() => setMuxPlaybackId('A30101xAaCwQjvq4aWmCdOPdaovab100xAn')}
                    className="text-[#FF5638] hover:underline"
                  >
                    A30101xAaCwQjvq4aWmCdOPdaovab100xAn (Click to fill)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F2F0E9]/80 mb-1.5">
                  Mux Playback ID or Stream URL
                </label>
                <input
                  type="text"
                  value={muxPlaybackId}
                  onChange={(e) => setMuxPlaybackId(e.target.value)}
                  placeholder="e.g. A30101xAaCwQjvq4aWmCdOPdaovab100xAn"
                  className="w-full bg-[#090B0F] border border-white/15 focus:border-[#FF5638] rounded-xl px-4 py-2.5 text-sm font-mono text-[#F2F0E9] placeholder:text-[#F2F0E9]/30 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F2F0E9]/80 mb-1.5">
                  Stream Title (Optional)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Blade Runner 2049 Master Reel"
                  className="w-full bg-[#090B0F] border border-white/15 focus:border-[#FF5638] rounded-xl px-4 py-2 text-sm text-[#F2F0E9] placeholder:text-[#F2F0E9]/30 outline-none transition-colors"
                />
              </div>

              {statusMessage && (
                <p className="text-xs text-[#FF5638] font-mono">{statusMessage}</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#FF5638] text-white font-medium text-xs rounded-xl hover:bg-[#FF5638]/90 transition-all shadow-lg shadow-[#FF5638]/20 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Initialize Mux Stream into Living Frame</span>
              </button>
            </form>
          )}

          {activeTab === 'custom' && (
            <form onSubmit={handleApplyCustomUrl} className="space-y-4">
              <div className="p-4 rounded-xl bg-[#090B0F] border border-white/10 text-xs text-[#F2F0E9]/75 space-y-1">
                <p className="font-semibold text-sm text-[#F2F0E9]">Direct Media Stream</p>
                <p>Support for direct HTTP/HTTPS `.mp4`, `.m3u8` (HLS), or `.webm` video streams.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F2F0E9]/80 mb-1.5">
                  Direct Video Stream URL
                </label>
                <input
                  type="url"
                  value={customStreamUrl}
                  onChange={(e) => setCustomStreamUrl(e.target.value)}
                  placeholder="https://example.com/stream/video.mp4"
                  className="w-full bg-[#090B0F] border border-white/15 focus:border-[#FF5638] rounded-xl px-4 py-2.5 text-sm font-mono text-[#F2F0E9] placeholder:text-[#F2F0E9]/30 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F2F0E9]/80 mb-1.5">
                  Film Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Symphony of the Spheres"
                  className="w-full bg-[#090B0F] border border-white/15 focus:border-[#FF5638] rounded-xl px-4 py-2 text-sm text-[#F2F0E9] placeholder:text-[#F2F0E9]/30 outline-none transition-colors"
                />
              </div>

              {statusMessage && (
                <p className="text-xs text-[#FF5638] font-mono">{statusMessage}</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#FF5638] text-white font-medium text-xs rounded-xl hover:bg-[#FF5638]/90 transition-all shadow-lg shadow-[#FF5638]/20 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Load External Stream</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
