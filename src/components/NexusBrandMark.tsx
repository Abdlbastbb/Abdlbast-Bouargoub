import React from 'react';

interface NexusBrandMarkProps {
  variant?: 'emblem' | 'full' | 'signature';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * NEXUS ONE Signature Geometric Brand Mark
 * Inspired by cinematic framing, anamorphic aperture geometry, dimensional space,
 * and digital immersion.
 */
export function NexusBrandMark({
  variant = 'full',
  className = '',
  size = 'md',
}: NexusBrandMarkProps) {
  const sizeMap = {
    sm: { icon: 20, text: 'text-xs', sub: 'text-[9px]' },
    md: { icon: 26, text: 'text-sm md:text-base', sub: 'text-[9px] md:text-[10px]' },
    lg: { icon: 34, text: 'text-lg md:text-xl', sub: 'text-[10px] md:text-[11px]' },
  };

  const currentSize = sizeMap[size];

  // Precision Geometric Emblem
  const Emblem = (
    <svg
      width={currentSize.icon}
      height={currentSize.icon}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      aria-hidden="true"
    >
      {/* Outer Anamorphic Viewfinder Framing Reticles (Titanium Silver) */}
      <path
        d="M3 10V4C4 3 5 3 10 3"
        stroke="#C5CBD2"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M26 3C31 3 32 3 33 4V10"
        stroke="#C5CBD2"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M33 26V32C32 33 31 33 26 33"
        stroke="#C5CBD2"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M10 33C5 33 4 33 3 32V26"
        stroke="#C5CBD2"
        strokeWidth="1.75"
        strokeLinecap="round"
      />

      {/* Optical Center Crosshair Ticks */}
      <line x1="18" y1="5" x2="18" y2="8" stroke="#C5CBD2" strokeWidth="1.25" strokeOpacity="0.4" />
      <line x1="18" y1="28" x2="18" y2="31" stroke="#C5CBD2" strokeWidth="1.25" strokeOpacity="0.4" />
      <line x1="5" y1="18" x2="8" y2="18" stroke="#C5CBD2" strokeWidth="1.25" strokeOpacity="0.4" />
      <line x1="28" y1="18" x2="31" y2="18" stroke="#C5CBD2" strokeWidth="1.25" strokeOpacity="0.4" />

      {/* Dimensional Nexus Monolith Structure (Titanium & Graphite Planes) */}
      <path
        d="M10 11L18 7L26 11V25L18 29L10 25V11Z"
        stroke="#C5CBD2"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="#141920"
        fillOpacity="0.75"
      />

      {/* Inner Dimensional Facets */}
      <path
        d="M18 7V29"
        stroke="#C5CBD2"
        strokeWidth="1"
        strokeOpacity="0.35"
      />
      <path
        d="M10 11L18 16L26 11"
        stroke="#C5CBD2"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />

      {/* Signature Solar Orange Focal Core (The Living Aperture) */}
      <circle
        cx="18"
        cy="18"
        r="3"
        fill="#FF704F"
      />
      {/* Central Radiance Accent */}
      <circle
        cx="18"
        cy="18"
        r="5.5"
        stroke="#FF704F"
        strokeWidth="1"
        strokeOpacity="0.5"
        strokeDasharray="2 2"
      />
    </svg>
  );

  if (variant === 'emblem') {
    return <div className={`inline-flex items-center ${className}`}>{Emblem}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
      {Emblem}

      <div className="flex flex-col justify-center">
        <div className="flex items-center tracking-tight leading-none">
          <span className={`font-['Syne',sans-serif] font-black uppercase text-[#F1F0EA] ${currentSize.text} tracking-wider`}>
            NEXUS
          </span>
          <span className={`font-['Syne',sans-serif] font-black uppercase text-[#FF704F] ${currentSize.text} tracking-wider ml-1.5`}>
            ONE
          </span>
        </div>

        {variant === 'signature' && (
          <span className={`font-mono uppercase tracking-[0.22em] text-[#C5CBD2]/60 ${currentSize.sub} mt-0.5 whitespace-nowrap`}>
            CINEMATIC INTELLIGENCE
          </span>
        )}
      </div>
    </div>
  );
}
