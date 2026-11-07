import React, { useState, useEffect, useRef } from 'react';
import { Upload, Sliders, X, Check, Image, RotateCcw } from 'lucide-react';

export interface LogoConfig {
  customLogoUrl: string | null;
  logoName: string;
  opacity: number; // 0.1 to 1.0
  scale: number; // 0.6 to 1.6
  position: 'top-left' | 'top-right' | 'bezel-center';
  blendMode: 'normal' | 'screen' | 'overlay';
}

const STORAGE_KEY = 'nexus_one_custom_logo';

const DEFAULT_CONFIG: LogoConfig = {
  customLogoUrl: null,
  logoName: 'Default Typographic Anchor',
  opacity: 0.9,
  scale: 1.0,
  position: 'top-left',
  blendMode: 'normal',
};

interface BrandLogoSlotProps {
  onOpenManager?: () => void;
  className?: string;
  compact?: boolean;
}

export function useBrandLogo() {
  const [config, setConfig] = useState<LogoConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_CONFIG;
  });

  const updateConfig = (newConfig: Partial<LogoConfig>) => {
    setConfig((prev) => {
      const merged = { ...prev, ...newConfig };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch {
        // ignore
      }
      return merged;
    });
  };

  const resetToDefault = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setConfig(DEFAULT_CONFIG);
  };

  return { config, updateConfig, resetToDefault };
}

/**
 * Dedicated Brand Logo Anchor Slot in the Living Frame & Header
 */
export function BrandLogoSlot({ onOpenManager, className = '', compact = false }: BrandLogoSlotProps) {
  const { config } = useBrandLogo();

  if (config.customLogoUrl) {
    return (
      <button
        onClick={onOpenManager}
        className={`group relative flex items-center gap-2 p-1 rounded transition-opacity hover:opacity-100 ${className}`}
        style={{
          opacity: config.opacity,
          transform: `scale(${config.scale})`,
          transformOrigin: 'left center',
          mixBlendMode: config.blendMode,
        }}
        aria-label="Custom NEXUS ONE logo active. Click to adjust logo integration settings."
        title="NEXUS ONE Custom Logo. Click to configure."
      >
        <img
          src={config.customLogoUrl}
          alt={config.logoName || 'NEXUS ONE Brand Logo'}
          className="h-6 w-auto object-contain max-w-[140px]"
          referrerPolicy="no-referrer"
        />
        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono tracking-wider text-[#FF5638] bg-[#090B0F]/90 px-1.5 py-0.5 rounded border border-[#FF5638]/30">
          ADJUST
        </span>
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1.5">
        <span className="font-['Syne',sans-serif] text-base md:text-lg font-extrabold tracking-tight text-[#F2F0E9] uppercase">
          NEXUS<span className="text-[#FF5638] ml-1">ONE</span>
        </span>
      </div>

      {onOpenManager && !compact && (
        <button
          onClick={onOpenManager}
          className="group flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider text-[#F2F0E9]/60 hover:text-[#F2F0E9] hover:bg-white/5 border border-dashed border-[#F2F0E9]/20 hover:border-[#FF5638]/50 transition-colors"
          aria-label="Open logo integration panel to upload your existing NEXUS ONE logo"
          title="Upload or integrate your existing NEXUS ONE logo"
        >
          <Upload className="w-2.5 h-2.5 text-[#FF5638] group-hover:scale-110 transition-transform" />
          <span>LOGO SLOT</span>
        </button>
      )}
    </div>
  );
}

/**
 * Dedicated Logo Integration Modal
 */
interface LogoIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogoIntegrationModal({ isOpen, onClose }: LogoIntegrationModalProps) {
  const { config, updateConfig, resetToDefault } = useBrandLogo();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (SVG, PNG, WebP, or JPG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Logo file exceeds 5MB limit. Please upload a smaller vector or optimized raster.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateConfig({
          customLogoUrl: result,
          logoName: file.name,
        });
        setErrorMsg(null);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read logo file.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logo-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-[#0F1218] border border-[rgba(242,240,233,0.12)] rounded-2xl shadow-2xl overflow-hidden p-6 text-[#F2F0E9]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/5">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-[#FF5638] uppercase block mb-1">
              SPECIFICATION 8 · BRAND INTEGRATION
            </span>
            <h2 id="logo-modal-title" className="text-xl font-bold font-['Syne',sans-serif] tracking-tight">
              Dedicated Brand Logo Placement
            </h2>
            <p className="text-xs text-[#F2F0E9]/65 mt-1">
              Upload your official NEXUS ONE logo asset to integrate it directly into The Living Frame bezel and navigation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-[#F2F0E9]/60 hover:text-[#F2F0E9] transition-colors"
            aria-label="Close logo integration modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State / Live Preview Stage */}
        <div className="my-5 p-4 rounded-xl bg-[#090B0F] border border-white/10">
          <span className="text-[10px] font-mono tracking-widest text-[#F2F0E9]/50 uppercase block mb-2">
            LIVE FRAME BEZEL PREVIEW
          </span>
          <div className="h-16 flex items-center justify-center border border-dashed border-white/15 rounded-lg bg-black/40 p-2">
            {config.customLogoUrl ? (
              <img
                src={config.customLogoUrl}
                alt="Uploaded Logo Preview"
                className="max-h-12 w-auto object-contain transition-all"
                style={{
                  opacity: config.opacity,
                  transform: `scale(${config.scale})`,
                  mixBlendMode: config.blendMode,
                }}
              />
            ) : (
              <div className="flex items-center gap-3">
                <span className="font-['Syne',sans-serif] text-lg font-extrabold tracking-tight text-[#F2F0E9] uppercase">
                  NEXUS<span className="text-[#FF5638] ml-1">ONE</span>
                </span>
                <span className="text-[11px] font-mono text-[#F2F0E9]/50">
                  (Default Typographic Anchor · Ready for Upload)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Upload Zone */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#F2F0E9]/80 mb-2">
              Select Logo Asset (PNG, SVG, WebP, JPG)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-white/15 hover:border-[#FF5638]/60 hover:bg-[#FF5638]/5 rounded-xl p-4 text-center transition-all group"
            >
              <Upload className="w-6 h-6 mx-auto mb-2 text-[#FF5638] group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-[#F2F0E9]">Click or drag your logo file here</p>
              <p className="text-xs text-[#F2F0E9]/50 mt-1">Preserves transparency and crisp vectors</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/png,image/svg+xml,image/webp,image/jpeg"
              className="hidden"
            />
            {errorMsg && (
              <p className="text-xs text-[#FF5638] mt-2 font-mono">{errorMsg}</p>
            )}
          </div>

          {/* Controls if logo uploaded */}
          {config.customLogoUrl && (
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#F2F0E9]/70">Scale: {Math.round(config.scale * 100)}%</span>
                <input
                  type="range"
                  min="0.6"
                  max="1.5"
                  step="0.05"
                  value={config.scale}
                  onChange={(e) => updateConfig({ scale: parseFloat(e.target.value) })}
                  className="w-32 accent-[#FF5638]"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#F2F0E9]/70">Opacity: {Math.round(config.opacity * 100)}%</span>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={config.opacity}
                  onChange={(e) => updateConfig({ opacity: parseFloat(e.target.value) })}
                  className="w-32 accent-[#FF5638]"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#F2F0E9]/70">Blend Mode</span>
                <div className="flex gap-1">
                  {(['normal', 'screen', 'overlay'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateConfig({ blendMode: mode })}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase transition-colors ${
                        config.blendMode === mode
                          ? 'bg-[#FF5638] text-white'
                          : 'bg-white/5 text-[#F2F0E9]/60 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => {
              resetToDefault();
              setErrorMsg(null);
            }}
            className="flex items-center gap-1.5 text-xs text-[#F2F0E9]/60 hover:text-[#FF5638] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Typographic Slot</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#FF5638] text-white font-medium text-xs rounded-lg hover:bg-[#FF5638]/90 transition-colors shadow-lg shadow-[#FF5638]/20"
          >
            Apply & View in Frame
          </button>
        </div>
      </div>
    </div>
  );
}
