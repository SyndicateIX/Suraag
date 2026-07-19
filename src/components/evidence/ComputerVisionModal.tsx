import React, { useState } from 'react';
import { Eye, EyeOff, ShieldAlert, CheckCircle, Radio, Tag, Download, Cpu } from 'lucide-react';
import { Evidence } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';

interface ComputerVisionModalProps {
  evidence: Evidence | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ComputerVisionModal: React.FC<ComputerVisionModalProps> = ({
  evidence,
  isOpen,
  onClose,
}) => {
  const [showBoxes, setShowBoxes] = useState(true);
  const [selectedBoxIndex, setSelectedBoxIndex] = useState<number | null>(0);

  if (!evidence) return null;

  const boxes = evidence.boundingBoxes || [
    {
      x: 100,
      y: 120,
      width: 210,
      height: 140,
      label: `${evidence.category} Detected (${evidence.confidence}%)`,
      confidence: evidence.confidence / 100,
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    WEAPON: 'Ballistic signature consistent with suppressed semi-automatic handgun. Serial number partially obfuscated by thermal scoring.',
    BLOOD: 'High-velocity forward arterial spatter indicating right-to-left projectile impact vector at 1.2m elevation.',
    FOOTPRINT: 'Vibram sole pattern matching Size 11 tactical military combat boot with micro-traces of industrial carbon dust.',
    BALLISTICS: 'Spent 9mm Luger brass shell casing with distinct firing pin micro-indentation matching Vault Corridor firearm.',
    CCTV: 'Frame differential anomaly at 23:14:02 UTC confirming 42-second video loop injection spoofing.',
    PHONE: 'Encrypted satellite communicator with active RF beacon pinging offshore transceiver tower #442.',
    FINGERPRINT: 'Latent sebaceous ridge impression recovered from cleanroom airlock keypad. 14 minified points match.',
    VEHICLE: 'Matte black heavy-duty SUV displaying infrared-absorbing license plate overlay and ballistic window tints.',
    DOCUMENT: 'Classified Sub-Level 3 HVAC blueprint featuring handwritten access timing notes and redline bypasses.',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`AI Computer Vision Diagnostics — ${evidence.title}`}
      maxWidth="max-w-5xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 columns: Image / Video Preview with Bounding Box Overlay */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
            <div className="flex items-center gap-2 font-tactical-data text-xs">
              <span className="text-on-surface-variant">VISION PIPELINE:</span>
              <Badge variant="active" pulse>YOLOv9 + SEGMENT-ANYTHING v4</Badge>
            </div>
            <button
              onClick={() => setShowBoxes(!showBoxes)}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-surface-container hover:bg-secondary-container text-xs font-tactical-data text-primary transition-all border border-primary/40"
            >
              {showBoxes ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showBoxes ? 'HIDE BOUNDING BOXES' : 'SHOW BOUNDING BOXES'}</span>
            </button>
          </div>

          <div className="relative rounded-lg overflow-hidden border border-tactical aspect-video bg-black flex items-center justify-center select-none shadow-[0_0_30px_rgba(0,0,0,0.8)]">
            <img
              src={evidence.fileUrl}
              alt={evidence.title}
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

            {/* Bounding Box Overlays */}
            {showBoxes &&
              boxes.map((box, idx) => {
                const isSelected = selectedBoxIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedBoxIndex(idx)}
                    className={`absolute cursor-pointer border-2 transition-all flex flex-col justify-between p-1 ${
                      isSelected
                        ? 'border-primary bg-primary/20 shadow-[0_0_15px_rgba(255,84,76,0.6)] z-20'
                        : 'border-emerald-400 bg-emerald-500/10 hover:border-primary z-10'
                    }`}
                    style={{
                      left: `${(box.x / 600) * 100}%`,
                      top: `${(box.y / 400) * 100}%`,
                      width: `${Math.min(100, (box.width / 600) * 100 + 20)}%`,
                      height: `${Math.min(100, (box.height / 400) * 100 + 20)}%`,
                    }}
                  >
                    <div className="flex items-center justify-between gap-1 bg-black/80 px-1.5 py-0.5 rounded border border-primary/40">
                      <span className="font-tactical-data text-[10px] font-bold text-primary truncate">
                        {box.label}
                      </span>
                      <span className="text-[9px] font-tactical-data text-emerald-400 font-bold">
                        {(box.confidence * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="w-2 h-2 border-b-2 border-l-2 border-primary" />
                      <div className="w-2 h-2 border-b-2 border-r-2 border-primary" />
                    </div>
                  </div>
                );
              })}

            {/* Tactical HUD Footer inside image */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded bg-black/70 backdrop-blur-md border border-outline-variant/40 font-tactical-data text-[10px] text-on-surface-variant">
              <span>SCAN GRID: C-4 // EXIF PARSED</span>
              <span className="text-primary font-bold">OBJECT DETECTION CONFIDENCE: {evidence.confidence}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-tactical-data text-xs">
            <div className="p-2.5 rounded bg-surface-container border border-outline-variant/30">
              <span className="text-on-surface-variant/70 text-[10px] block">ITEM CATEGORY</span>
              <span className="text-primary font-bold">{evidence.category}</span>
            </div>
            <div className="p-2.5 rounded bg-surface-container border border-outline-variant/30">
              <span className="text-on-surface-variant/70 text-[10px] block">AI CONFIDENCE</span>
              <span className="text-emerald-400 font-bold">{evidence.confidence}%</span>
            </div>
            <div className="p-2.5 rounded bg-surface-container border border-outline-variant/30">
              <span className="text-on-surface-variant/70 text-[10px] block">BOUNDING BOXES</span>
              <span className="text-on-surface font-semibold">{boxes.length} objects tagged</span>
            </div>
            <div className="p-2.5 rounded bg-surface-container border border-outline-variant/30">
              <span className="text-on-surface-variant/70 text-[10px] block">STATUS</span>
              <span className="text-emerald-400 font-bold uppercase">{evidence.processedStatus}</span>
            </div>
          </div>
        </div>

        {/* Right column: Detected Objects Breakdown & AI Diagnostic Summary */}
        <div className="space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="font-display-lg text-sm font-bold uppercase tracking-wider text-on-surface pb-2 border-b border-outline-variant/30 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              <span>Extracted Object Manifest</span>
            </h4>

            <div className="space-y-2 mt-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {boxes.map((box, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedBoxIndex(idx)}
                  className={`p-3 rounded border transition-all cursor-pointer font-body-md text-xs ${
                    selectedBoxIndex === idx
                      ? 'bg-secondary-container/60 border-primary shadow-[0_0_12px_rgba(255,84,76,0.2)]'
                      : 'bg-surface-container-low border-outline-variant/40 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between font-tactical-data">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-primary" />
                      <span className="font-bold text-on-surface">{box.label}</span>
                    </div>
                    <Badge variant="confidence">{(box.confidence * 100).toFixed(1)}%</Badge>
                  </div>
                  <p className="text-on-surface-variant/90 mt-1.5 text-[11px] leading-relaxed">
                    Coordinates: [X: {box.x}, Y: {box.y}, W: {box.width}, H: {box.height}]
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded bg-surface-container border border-primary/40 space-y-2">
              <div className="flex items-center justify-between font-tactical-data text-xs">
                <span className="text-primary font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                  FORENSIC INFERENCE
                </span>
                <span className="text-emerald-400 font-semibold">VERIFIED</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed font-body-md">
                {categoryDescriptions[evidence.category] || 'Multi-spectral sensor analysis confirms object presence with zero tampering signatures.'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/30 flex justify-between gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded bg-surface-container hover:bg-surface-variant font-tactical-data text-xs uppercase transition-colors"
            >
              Close Diagnostics
            </button>
            <a
              href={evidence.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded bg-primary text-on-primary hover:bg-surface-tint font-tactical-data text-xs font-bold uppercase transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,84,76,0.3)]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Raw</span>
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
};
