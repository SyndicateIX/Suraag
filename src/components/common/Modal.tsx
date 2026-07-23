import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-3xl',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={`w-full ${maxWidth} max-w-[min(95vw,56rem)] max-h-[90vh] glass-panel rounded-lg border border-primary/50 shadow-[0_0_30px_rgba(255,84,76,0.3)] overflow-hidden`}
          >
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-surface-container-high/60 border-b border-outline-variant/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <h3 className="font-display-lg text-base sm:text-lg uppercase tracking-wider text-primary font-bold break-words">
                  {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded bg-surface-container hover:bg-secondary-container hover:text-primary transition-colors border border-outline-variant/40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 max-h-[calc(90vh-5rem)] overflow-y-auto custom-scrollbar">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
