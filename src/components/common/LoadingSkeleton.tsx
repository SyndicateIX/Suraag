import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number; height?: string }> = ({ rows = 3, height = 'h-16' }) => {
  return (
    <div className="space-y-3 w-full animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`w-full ${height} bg-surface-container-high/60 border border-outline-variant/30 rounded flex items-center px-4 justify-between`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-surface-variant/70" />
            <div className="space-y-1.5">
              <div className="w-32 h-3 rounded bg-surface-variant" />
              <div className="w-24 h-2 rounded bg-surface-variant/60" />
            </div>
          </div>
          <div className="w-16 h-4 rounded bg-primary/20" />
        </div>
      ))}
    </div>
  );
};
