import React from 'react';
import { NexusBrandMark } from './NexusBrandMark';

interface BrandLogoSlotProps {
  className?: string;
  compact?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'header';
}

/**
 * Permanently Fixed Brand Identity Slot
 * Preserves the original NEXUS ONE brand mark without modification or replacement controls.
 */
export function BrandLogoSlot({
  className = '',
  compact = false,
  size,
}: BrandLogoSlotProps) {
  const resolvedSize = size ?? (compact ? 'sm' : 'header');

  return (
    <div className={`flex items-center ${className}`}>
      <NexusBrandMark
        variant={compact ? 'emblem' : 'signature'}
        size={resolvedSize}
      />
    </div>
  );
}
