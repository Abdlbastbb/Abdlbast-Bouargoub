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
  { key: 'C', desc: 'Toggle Cinema Dim / Theater Mode' },
  { key: 'A', desc: 'Toggle Living Frame Ambient Bleed' },
  { key: '0 - 9', desc: 'Jump to 0% - 90% of film timeline' },
  { key: 'ESC', desc: 'Close any open drawer or exit Fullscreen' },
  { key: '?', desc: 'Toggle Keyboard Shortcuts Guide' },
];

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-[#0F1218] border border-[rgba(242,240,233,0.12)] rounded-2xl shadow-2xl overflow-hidden p-6 text-[#F2F0E9]">
        <div className="flex items-start justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF5638]/10 border border-[#FF5638]/30 flex items-center justify-center text-[#FF5638]">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 id="shortcuts-modal-title" className="text-lg font-bold font-['Syne',sans-serif] tracking-tight">
                Cinematic Navigation Shortcuts
              </h2>
              <p className="text-xs text-[#F2F0E9]/60">Complete keyboard control over NEXUS ONE.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-[#F2F0E9]/60 hover:text-[#F2F0E9] transition-colors"
            aria-label="Close shortcuts modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="divide-y divide-white/5 my-4">
          {SHORTCUTS.map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2 text-xs">
              <span className="text-[#F2F0E9]/80">{item.desc}</span>
              <kbd className="px-2 py-1 bg-[#090B0F] border border-white/15 rounded font-mono text-[11px] text-[#FF5638] font-semibold">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#FF5638] text-white text-xs font-medium rounded-lg hover:bg-[#FF5638]/90 transition-colors shadow-lg shadow-[#FF5638]/20"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
