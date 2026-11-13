import React, { useState } from 'react';
import { X, Play, Radio, Check, Film } from 'lucide-react';
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
  const [muxToken, setMuxToken] = useState('');
  const [customStreamUrl, setCustomStreamUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleApplyMux = (e: React.FormEvent) => {
    e.preventDefault();
    const resolved = resolveStreamSource(muxPlaybackId, muxToken);
    if (!resolved.valid || !resolved.url) {
      setStatusMessage(
        resolved.error || 'Please enter a valid Mux Playback ID or Mux HLS stream URL.'
      );
      return;
    }

    const displayId = resolved.playbackId || muxPlaybackId.trim();
    const newFilm: FilmReel = {
      id: `mux-${Date.now()}`,
      title: customTitle.trim() || 'Mux Hosted Cinema',
      subtitle: displayId
        ? `Mux Playback ID: ${displayId.slice(0, 18)}${resolved.token ? ' (Signed)' : ''}`
        : 'Mux Adaptive Stream',
      director: 'Mux Video Infrastructure',
      durationString: 'Live / VOD',
      aspectRatio: '16:9',
      colorGrade: 'pristine',
      ambientGlowColor: 'rgba(103, 212, 255, 0.22)',
      thumbnail: '',
      streamUrl: resolved.url,
      streamType: resolved.type,
      isMux: true,
      muxPlaybackId: displayId,
      synopsis:
        'Adaptive bitrate stream provisioned through Mux Video infrastructure and rendered inside NEXUS ONE The Living Frame.',
      specs: {
        resolution: 'Adaptive Multi-Bitrate HLS',
        codec: 'H.264 / AAC (HLS)',
        audio: 'Stereo Master 48kHz',
        fps: 'Native Stream',
        colorSpace: 'Rec.709',
      },
      chapters: [
        { id: 'm1', time: 0, title: 'Stream Start', description: 'Stream initialized via Mux Video.' },
      ],
    };

    setStatusMessage(null);
    onLoadCustomStream(newFilm);
    onClose();
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const resolved = resolveStreamSource(customStreamUrl);
    if (!resolved.valid || !resolved.url) {
      setStatusMessage(
        resolved.error || 'Please enter a valid video stream URL (.mp4, .m3u8, or .webm).'
      );
      return;
    }

    const urlSlug = resolved.url.split('?')[0].split('/').pop() || 'Custom Feed';
    const newFilm: FilmReel = {
      id: `custom-${Date.now()}`,
      title: customTitle.trim() || 'External Cinematic Stream',
      subtitle: urlSlug,
      director: 'External Stream',
      durationString: 'Stream',
      aspectRatio: '16:9',
      colorGrade: 'pristine',
      ambientGlowColor: 'rgba(103, 212, 255, 0.22)',
      thumbnail: '',
      streamUrl: resolved.url,
      streamType: resolved.type,
      isMux: resolved.isMux,
      muxPlaybackId: resolved.playbackId,
      synopsis: 'Custom user-provided video stream initialized through the Video.js cinema player.',
      specs: {
        resolution: resolved.type === 'application/x-mpegURL' ? 'Adaptive HLS Stream' : 'Direct Web Stream',
        codec: resolved.type,
        audio: 'Web Audio Standard',
        fps: 'Native Stream',
        colorSpace: 'Rec.709',
      },
      chapters: [
        { id: 'c1', time: 0, title: 'Stream Start', description: 'Direct stream playback.' },
      ],
    };

    setStatusMessage(null);
    onLoadCustomStream(newFilm);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="stream-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/82 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl cinema-glass border border-[rgba(226,232,240,0.16)] rounded-2xl shadow-2xl overflow-hidden p-6 text-[#FFFFFF] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div>
            <span className="text-xs font-medium text-[#67D4FF] block mb-1">
              Stream Switcher
            </span>
            <h2 id="stream-modal-title" className="text-xl font-bold font-['Syne',sans-serif] tracking-tight text-[#FFFFFF]">
              Select Film or Connect Stream
            </h2>
            <p className="text-xs text-[#CBD5E1]/80 mt-1">
              Choose a curated master reel, paste a Mux Playback ID, or load a direct HLS/MP4 stream.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-[#94A3B8] hover:text-[#FFFFFF] transition-colors cursor-pointer"
            aria-label="Close stream selector modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-1.5 p-1 bg-[#05070B] rounded-xl my-4 border border-white/10">
          <button
            type="button"
            onClick={() => { setActiveTab('catalog'); setStatusMessage(null); }}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-[#67D4FF] text-[#05070B] shadow-lg shadow-[#67D4FF]/15 font-semibold'
                : 'text-[#CBD5E1] hover:text-[#FFFFFF]'
            }`}
          >
            Cinema Library
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('mux'); setStatusMessage(null); }}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'mux'
                ? 'bg-[#67D4FF] text-[#05070B] shadow-lg shadow-[#67D4FF]/15 font-semibold'
                : 'text-[#CBD5E1] hover:text-[#FFFFFF]'
            }`}
          >
            Mux Playback ID
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('custom'); setStatusMessage(null); }}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-[#67D4FF] text-[#05070B] shadow-lg shadow-[#67D4FF]/15 font-semibold'
                : 'text-[#CBD5E1] hover:text-[#FFFFFF]'
            }`}
          >
            Custom Stream URL
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          {activeTab === 'catalog' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {CINEMA_REELS.map((film) => {
                const isSelected = activeFilm.id === film.id;
                const imgFailed = failedImages[film.id];
                return (
                  <button
                    type="button"
                    key={film.id}
                    onClick={() => {
                      setStatusMessage(null);
                      onSelectFilm(film);
                      onClose();
                    }}
                    className={`cursor-pointer rounded-xl p-3 border transition-all text-left relative group overflow-hidden ${
                      isSelected
                        ? 'border-[#67D4FF] bg-[#67D4FF]/10'
                        : 'border-white/10 bg-[#05070B]/80 hover:border-[#67D4FF]/45 hover:bg-[#111826]'
                    }`}
                  >
                    <div className="aspect-video w-full rounded-lg overflow-hidden relative mb-2.5 bg-black">
                      {!imgFailed ? (
                        <img
                          src={film.thumbnail}
                          alt={film.title}
                          onError={() =>
                            setFailedImages((prev) => ({ ...prev, [film.id]: true }))
                          }
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#0B0F17]">
                          <Film className="w-5 h-5 text-[#67D4FF]" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#05070B]/90 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-mono text-[#FFFFFF]">
                        <span className="text-[#CBD5E1]">{film.aspectRatio}</span>
                        <span className="text-[#67D4FF] font-semibold tabular-nums">{film.durationString}</span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-[#67D4FF] text-[#05070B] p-1 rounded-full shadow-lg">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <h3 className="font-['Syne',sans-serif] font-bold text-sm text-[#FFFFFF] group-hover:text-[#67D4FF] transition-colors truncate">
                      {film.title}
                    </h3>
                    <p className="text-xs text-[#CBD5E1]/75 line-clamp-1 mt-0.5">{film.subtitle}</p>
                    <p className="text-[11px] text-[#94A3B8] mt-1 truncate">
                      {film.director}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'mux' && (
            <form onSubmit={handleApplyMux} noValidate className="space-y-4">
              <div className="p-4 rounded-xl bg-[#05070B] border border-white/10 text-xs text-[#CBD5E1]/80 space-y-2">
                <div className="flex items-center gap-2 text-[#67D4FF] font-semibold text-sm">
                  <Radio className="w-4 h-4" />
                  <span>Mux Adaptive HLS Streaming</span>
                </div>
                <p>
                  Paste a Mux Playback ID (not an Asset ID) or full <span className="font-mono text-[#FFFFFF]">stream.mux.com</span> HLS URL. Signed streams are supported via an optional playback JWT token.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#94A3B8]">
                  <span>Sample Playback ID:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMuxPlaybackId('uNbxnGLKJ00yfbijDO8COxTOyVKT01xpxW');
                      setStatusMessage(null);
                    }}
                    className="font-mono text-[#67D4FF] hover:underline cursor-pointer"
                  >
                    uNbxnGLKJ00yfbijDO8COxTOyVKT01xpxW (Use sample)
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="mux-id-input" className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                  Mux Playback ID or Stream URL
                </label>
                <input
                  id="mux-id-input"
                  type="text"
                  value={muxPlaybackId}
                  onChange={(e) => {
                    setMuxPlaybackId(e.target.value);
                    if (statusMessage) setStatusMessage(null);
                  }}
                  placeholder="e.g. uNbxnGLKJ00yfbijDO8COxTOyVKT01xpxW"
                  className="w-full bg-[#05070B] border border-white/15 focus:border-[#67D4FF] rounded-xl px-4 py-2.5 text-sm font-mono text-[#FFFFFF] placeholder:text-[#94A3B8]/40 outline-none transition-colors"
                />
              </div>

              <div>
                <label htmlFor="mux-token-input" className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                  Signed Playback Token (Optional JWT)
                </label>
                <input
                  id="mux-token-input"
                  type="text"
                  value={muxToken}
                  onChange={(e) => {
                    setMuxToken(e.target.value);
                    if (statusMessage) setStatusMessage(null);
                  }}
                  placeholder="Paste signed JWT token for private/signed Mux assets"
                  className="w-full bg-[#05070B] border border-white/15 focus:border-[#67D4FF] rounded-xl px-4 py-2 text-xs font-mono text-[#FFFFFF] placeholder:text-[#94A3B8]/40 outline-none transition-colors"
                />
              </div>

              <div>
                <label htmlFor="mux-title-input" className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                  Stream Title (Optional)
                </label>
                <input
                  id="mux-title-input"
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Master Cinema Stream"
                  className="w-full bg-[#05070B] border border-white/15 focus:border-[#67D4FF] rounded-xl px-4 py-2 text-sm text-[#FFFFFF] placeholder:text-[#94A3B8]/40 outline-none transition-colors"
                />
              </div>

              {statusMessage && (
                <p role="alert" className="text-xs text-[#FCA5A5] bg-[#7F1D1D]/30 border border-[#EF4444]/35 rounded-lg px-3 py-2 font-medium">
                  {statusMessage}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#67D4FF] text-[#05070B] font-semibold text-xs rounded-xl hover:bg-[#8CE0FF] transition-all shadow-lg shadow-[#67D4FF]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Load Mux Stream</span>
              </button>
            </form>
          )}

          {activeTab === 'custom' && (
            <form onSubmit={handleApplyCustomUrl} noValidate className="space-y-4">
              <div className="p-4 rounded-xl bg-[#05070B] border border-white/10 text-xs text-[#CBD5E1]/80 space-y-1">
                <p className="font-semibold text-sm text-[#FFFFFF]">Direct Media Stream</p>
                <p>Supports HTTP/HTTPS .m3u8 (Adaptive HLS), .mp4 (H.264/AAC), and .webm streams.</p>
              </div>

              <div>
                <label htmlFor="custom-url-input" className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                  Direct Video Stream URL
                </label>
                <input
                  id="custom-url-input"
                  type="url"
                  value={customStreamUrl}
                  onChange={(e) => {
                    setCustomStreamUrl(e.target.value);
                    if (statusMessage) setStatusMessage(null);
                  }}
                  placeholder="https://example.com/stream/video.m3u8"
                  className="w-full bg-[#05070B] border border-white/15 focus:border-[#67D4FF] rounded-xl px-4 py-2.5 text-sm font-mono text-[#FFFFFF] placeholder:text-[#94A3B8]/40 outline-none transition-colors"
                />
              </div>

              <div>
                <label htmlFor="custom-title-input" className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                  Film Title (Optional)
                </label>
                <input
                  id="custom-title-input"
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Symphony of the Spheres"
                  className="w-full bg-[#05070B] border border-white/15 focus:border-[#67D4FF] rounded-xl px-4 py-2 text-sm text-[#FFFFFF] placeholder:text-[#94A3B8]/40 outline-none transition-colors"
                />
              </div>

              {statusMessage && (
                <p role="alert" className="text-xs text-[#FCA5A5] bg-[#7F1D1D]/30 border border-[#EF4444]/35 rounded-lg px-3 py-2 font-medium">
                  {statusMessage}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#67D4FF] text-[#05070B] font-semibold text-xs rounded-xl hover:bg-[#8CE0FF] transition-all shadow-lg shadow-[#67D4FF]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Load Stream</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
