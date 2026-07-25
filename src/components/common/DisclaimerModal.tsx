import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

const STORAGE_KEY = 'suraag_disclaimer_dismissed';

export const DisclaimerModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const okButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Check sessionStorage to see if user has already dismissed disclaimer in this session
    const isDismissed = sessionStorage.getItem(STORAGE_KEY) === 'true';
    if (!isDismissed) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Prevent background scrolling while modal is active
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Focus OK button on open
      const timer = setTimeout(() => {
        okButtonRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleDismiss();
        } else if (e.key === 'Tab') {
          // Trap keyboard focus inside modal (OK button is the primary interactive element)
          e.preventDefault();
          okButtonRef.current?.focus();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
        clearTimeout(timer);
      };
    }
  }, [isOpen]);

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
    // Restore previous focus
    if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
      previousFocusRef.current.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
      aria-describedby="disclaimer-desc"
    >
      <div className="w-full max-w-lg bg-surface-container/90 border border-outline-variant/60 backdrop-blur-md rounded-xl p-6 shadow-2xl space-y-4 text-on-surface relative transition-all">
        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-3">
          <div className="p-2 rounded bg-primary/20 border border-primary/50 text-primary shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 id="disclaimer-title" className="font-display-lg text-lg font-bold uppercase tracking-wider text-on-surface">
              System Notice
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-tactical-data uppercase tracking-widest text-primary font-bold">
                Augmented Investigation Platform
              </span>
              <span className="text-[10px] font-tactical-data uppercase tracking-widest text-on-surface-variant/70">
                • Notice from Team Syndicate IX
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body - Exact Text as Requested */}
        <div className="py-2 space-y-3">
          <p id="disclaimer-desc" className="text-sm font-body-md text-on-surface-variant leading-relaxed">
            Disclaimer: This platform uses Augmented Investigation to assist case analysis. The generated scenarios and visualizations are predictive and illustrative, not factual determinations or legal conclusions.
          </p>
          <div className="p-2.5 rounded bg-surface-container border border-outline-variant/40 text-xs font-tactical-data text-primary font-bold flex items-center gap-2">
            <span>Notice Issued by: Team Syndicate IX</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30">
          <span className="text-[11px] font-tactical-data text-on-surface-variant/80">
            Notice from Team Syndicate IX
          </span>

          <button
            ref={okButtonRef}
            onClick={handleDismiss}
            className="px-6 py-2 rounded bg-primary text-on-primary hover:bg-surface-tint font-tactical-data font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,84,76,0.35)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
          >
            OK
          </button>
        </div>

      </div>
    </div>
  );
};
