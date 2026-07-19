import React, { useState } from 'react';
import { AlertTriangle, MapPin, Radio, ShieldAlert, Sparkles, CheckCircle2, Search, ArrowUpRight } from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const MissingEvidence: React.FC = () => {
  const [selectedGrid, setSelectedGrid] = useState<string | null>(null);

  const predictions = [
    {
      title: 'Missing CCTV Camera #4 Raw Buffer',
      area: 'Grid Sector C-4 (Ventilation Duct North)',
      boost: '+14.2%',
      confidence: 94.8,
      reason: 'Graph gap between 23:14:02 frame freezing and physical keycard swipe suggests local sector memory cache holds uncompressed frame dump.',
    },
    {
      title: 'Secondary Weapon Fingerprint Smear',
      area: 'Cleanroom Airlock Keypad Overlay',
      boost: '+8.5%',
      confidence: 91.2,
      reason: 'Keypad thermal traces show two distinct palm impressions. Re-dusting overlay with cyanoacrylate will isolate second operative.',
    },
    {
      title: 'Matte Black SUV Toll Transponder Log',
      area: 'Highway 101 North Checkpoint Plaza',
      boost: '+6.1%',
      confidence: 88.5,
      reason: 'Vehicle departed perimeter exactly 3 minutes post-blackout. Toll array RF ping logs will provide license plate and vehicle velocity.',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              GRAPH CORRELATION GAP INFERENCE & PREDICTION QUEUE
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            Missing Evidence Predictor
          </h1>
        </div>

        <Badge variant="active" pulse>AI BAYESIAN PREDICTOR ACTIVE</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {predictions.map((pred, idx) => (
          <GlassCard key={idx} className="p-6 flex flex-col justify-between border-outline-variant/60 hover:border-primary transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <Badge variant="critical" className="text-[10px]">PREDICTION #{idx + 1}</Badge>
                <span className="font-tactical-data text-xs text-emerald-400 font-bold">Boost: {pred.boost}</span>
              </div>
              <h3 className="font-display-lg text-xl font-bold uppercase text-on-surface mb-2">
                {pred.title}
              </h3>
              <div className="p-3 rounded bg-surface-container border border-outline-variant/40 space-y-1 font-tactical-data text-xs mb-4">
                <div className="flex items-center gap-1.5 text-primary font-bold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Search Area: {pred.area}</span>
                </div>
                <div className="text-on-surface-variant text-[11px]">Prediction Conf: {pred.confidence}%</div>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed font-body-md">
                {pred.reason}
              </p>
            </div>

            <button
              onClick={() => setSelectedGrid(pred.area)}
              className="mt-6 w-full py-2.5 rounded bg-primary/20 hover:bg-primary text-primary hover:text-on-primary border border-primary/50 transition-all font-tactical-data text-xs font-bold uppercase flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(255,84,76,0.2)]"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Triangulate Search Sector</span>
            </button>
          </GlassCard>
        ))}
      </div>

      <Modal
        isOpen={!!selectedGrid}
        onClose={() => setSelectedGrid(null)}
        title="Tactical Grid Sector Triangulation"
      >
        <div className="space-y-4 font-tactical-data text-xs">
          <Badge variant="critical">DEPLOYING SEARCH TEAM DISPATCH</Badge>
          <h3 className="font-display-lg text-xl font-bold uppercase text-on-surface">
            Target Grid: {selectedGrid}
          </h3>
          <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
            Sector coordinate boundary localized to sub-floor ventilation and ductwork. Thermal sensor arrays show no hazards. Search team dispatch recommended immediately to preserve forensic chain of custody.
          </p>
          <div className="p-4 rounded bg-surface-container border border-primary/50 text-primary font-bold">
            ESTIMATED RECOVERY WINDOW: &lt; 45 MINUTES BEFORE DEGRADATION
          </div>
        </div>
      </Modal>
    </div>
  );
};
