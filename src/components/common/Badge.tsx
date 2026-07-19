import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  variant?: 'critical' | 'high' | 'routine' | 'active' | 'archived' | 'confidence' | 'neutral';
  children: React.ReactNode;
  className?: string;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className,
  pulse = false,
}) => {
  const variantStyles = {
    critical: 'bg-secondary-container/80 text-primary border border-primary/60 font-tactical-data shadow-[0_0_10px_rgba(255,84,76,0.4)]',
    high: 'bg-amber-900/40 text-amber-300 border border-amber-500/50 font-tactical-data',
    routine: 'bg-surface-container-high text-on-surface-variant border border-outline-variant font-tactical-data',
    active: 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/50 font-tactical-data',
    archived: 'bg-surface-variant text-tertiary border border-outline-variant/40 font-tactical-data',
    confidence: 'bg-primary/20 text-primary border border-primary font-tactical-data font-bold tracking-wider',
    neutral: 'bg-surface-container text-on-surface border border-outline-variant font-label-sm',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs uppercase tracking-wider transition-all',
          variantStyles[variant],
          pulse && 'pulse-critical',
          className
        )
      )}
    >
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />}
      {children}
    </span>
  );
};
