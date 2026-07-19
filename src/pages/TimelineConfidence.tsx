import React from 'react';
import { Gauge, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

export const TimelineConfidence: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Gauge className="w-4 h-4 text-primary" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              CHRONOLOGICAL FIDELITY AUDIT
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            Timeline Confidence & Bayesian Synchronization
          </h1>
        </div>

        <Badge variant="confidence">CHRONOLOGY METRICS VERIFIED</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { metric: 'Network & Drone Telemetry', confidence: '98.5%', status: 'HIGH FIDELITY', desc: 'RF emissions and micro-drone ping timestamps perfectly match external gate loop alarms.' },
          { metric: 'CCTV Frame Differential', confidence: '99.2%', status: 'VERIFIED SPOOF', desc: 'Sub-Level 3 Camera #4 loop injection verified to within 4 milliseconds of fiber splice.' },
          { metric: 'Acoustic Gunshot Signature', confidence: '96.4%', status: 'BALLISTIC SYNC', desc: 'Acoustic shockwave velocity confirms subsonic 9mm discharge occurred precisely at 23:15:10.' },
        ].map((item, idx) => (
          <GlassCard key={idx} className="p-6 space-y-3">
            <Badge variant="active">{item.status}</Badge>
            <h3 className="font-display-lg font-bold text-xl uppercase text-on-surface">{item.metric}</h3>
            <div className="font-display-lg text-3xl font-bold text-primary">{item.confidence}</div>
            <p className="text-xs text-on-surface-variant leading-relaxed font-body-md">{item.desc}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
