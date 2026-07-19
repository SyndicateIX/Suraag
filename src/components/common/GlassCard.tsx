import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  active?: boolean;
  tacticalCorners?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  glow = false,
  active = false,
  tacticalCorners = true,
  header,
  footer,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'glass-panel relative rounded-lg overflow-hidden transition-all duration-300 border border-outline-variant/40 bg-surface/80 backdrop-blur-xl',
          glow && 'glow-red border-primary/60 shadow-[0_0_20px_rgba(255,84,76,0.25)]',
          active && 'border-primary shadow-[0_0_15px_rgba(255,84,76,0.3)] bg-surface-container/90',
          className
        )
      )}
      {...props}
    >
      {tacticalCorners && (
        <>
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary/70 pointer-events-none z-10" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary/70 pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary/70 pointer-events-none z-10" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary/70 pointer-events-none z-10" />
        </>
      )}

      {header && (
        <div className="px-4 py-3 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-high/40">
          {header}
        </div>
      )}

      <div className="p-4">{children}</div>

      {footer && (
        <div className="px-4 py-3 border-t border-outline-variant/30 bg-surface-container-lowest/50">
          {footer}
        </div>
      )}
    </div>
  );
};
