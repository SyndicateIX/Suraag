import React from 'react';

export const ScanlineOverlay: React.FC<{ laser?: boolean }> = ({ laser = true }) => {
  return (
    <>
      <div className="scanline pointer-events-none z-50 fixed inset-0" />
      {laser && (
        <div className="pointer-events-none fixed top-0 left-0 w-full z-50">
          <div className="laser-line w-full" />
        </div>
      )}
    </>
  );
};
