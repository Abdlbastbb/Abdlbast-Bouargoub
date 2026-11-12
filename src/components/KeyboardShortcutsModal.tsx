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
  { key: 'ESC', desc: 'Close open modal or exit Fullscreen' },
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
      <div className="relative w-full max-w-md bg-[#141920] border border-[rgba(197,203,210,0.14)] rounded-2xl shadow-2xl overflow-hidden p-6 text-[#F1F0EA]">
        <div className="flex items-start justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF704F]/10 border border-[#FF704F]/30 flex items-center justify-center text-[#FF704F]">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 id="shortcuts-modal-title" className="text-lg font-bold font-['Syne',sans-serif] tracking-tight text-[#F1F0EA]">
                Cinematic Navigation Shortcuts
              </h2>
              <p className="text-xs text-[#C5CBD2]/75">Direct keyboard control over NEXUS ONE.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-[#C5CBD2]/60 hover:text-[#F1F0EA] transition-colors"
            aria-label="Close shortcuts modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="divide-y divide-white/5 my-4">
          {SHORTCUTS.map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2.5 text-xs">
              <span className="text-[#C5CBD2]/85">{item.desc}</span>
              <kbd className="px-2.5 py-1 bg-[#080A0D] border border-[rgba(197,203,210,0.18)] rounded font-mono text-[11px] text-[#FF704F] font-semibold">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#FF704F] text-white text-xs font-semibold rounded-lg hover:bg-[#FF704F]/90 transition-colors shadow-lg shadow-[#FF704F]/20"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
