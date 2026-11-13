import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'Space / K', desc: 'Toggle Playback (Play / Pause)' },
  { key: '← / →', desc: 'Seek Backward 10s / Forward 10s' },
  { key: '↑ / ↓', desc: 'Adjust Volume Up / Down 10%' },
  { key: 'M', desc: 'Toggle Mute / Unmute' },
  { key: 'F', desc: 'Toggle Fullscreen Mode' },
  { key: 'C', desc: 'Toggle Cinema Dim Mode' },
  { key: 'A', desc: 'Toggle Living Frame Ambient Bleed' },
  { key: '0 - 9', desc: 'Jump to 0% - 90% of timeline' },
  { key: 'ESC', desc: 'Close modal or exit Fullscreen' },
  { key: '?', desc: 'Toggle Keyboard Shortcuts Guide' },
];

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/82 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md cinema-glass border border-[rgba(226,232,240,0.16)] rounded-2xl shadow-2xl overflow-hidden p-6 text-[#FFFFFF]">
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#67D4FF]/10 border border-[#67D4FF]/30 flex items-center justify-center text-[#67D4FF]">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 id="shortcuts-modal-title" className="text-lg font-bold font-['Syne',sans-serif] tracking-tight text-[#FFFFFF]">
                Keyboard Shortcuts
              </h2>
              <p className="text-xs text-[#CBD5E1]/80">Direct cinema transport controls.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-[#94A3B8] hover:text-[#FFFFFF] transition-colors cursor-pointer"
            aria-label="Close shortcuts modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="divide-y divide-white/5 my-4">
          {SHORTCUTS.map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2.5 text-xs">
              <span className="text-[#CBD5E1]">{item.desc}</span>
              <kbd className="px-2.5 py-1 bg-[#05070B] border border-[rgba(226,232,240,0.18)] rounded font-mono text-[11px] text-[#67D4FF] font-semibold">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#67D4FF] text-[#05070B] text-xs font-semibold rounded-lg hover:bg-[#8CE0FF] transition-colors shadow-lg shadow-[#67D4FF]/20 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
