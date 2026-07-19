import React, { useState } from 'react';
import { GitBranch, Sliders, ShieldAlert, CheckCircle2, Activity } from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

export const ScenarioSimulator: React.FC = () => {
  const [insiderWeight, setInsiderWeight] = useState(78.4);
  const [cyberWeight, setCyberWeight] = useState(18.1);
  const [accidentWeight, setAccidentWeight] = useState(3.5);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GitBranch className="w-4 h-4 text-primary" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              MULTI-SCENARIO PROBABILITY SIMULATOR
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            Probable Crime Scenario Laboratory
          </h1>
        </div>

        <Badge variant="confidence" pulse>BAYESIAN PROBABILITY ACTIVE</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          {
            id: 'SCENARIO-A',
            title: 'Premeditated Insider-Assisted Ambush',
            probability: insiderWeight,
            setter: setInsiderWeight,
            evidence: 18,
            desc: 'Suspect Viktor Krell utilized compromised credentials from Dr. Vance to bypass exterior airlock alarms while external EMP disabled sensor transmission.',
          },
          {
            id: 'SCENARIO-B',
            title: 'External Cyber-Kinetic Drone Swarm Assault',
            probability: cyberWeight,
            setter: setCyberWeight,
            evidence: 6,
            desc: 'Automated micro-drones disabled perimeter fiber telemetry while two external operatives forced physical entry via ventilation shaft.',
          },
          {
            id: 'SCENARIO-C',
            title: 'Accidental Containment Pressure Failure',
            probability: accidentWeight,
            setter: setAccidentWeight,
            evidence: 2,
            desc: 'Internal biological valve rupture caused sudden overpressure blast, triggering automated lockdown and sensor blackout.',
          },
        ].map((scen, idx) => (
          <GlassCard key={idx} glow={idx === 0} className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant={idx === 0 ? 'critical' : 'routine'}>{scen.id}</Badge>
                <span className="font-display-lg text-3xl font-bold text-primary">{scen.probability.toFixed(1)}%</span>
              </div>
              <h3 className="font-display-lg text-xl font-bold uppercase text-on-surface mb-2">
                {scen.title}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed font-body-md mb-4">
                {scen.desc}
              </p>

              <div className="space-y-2 font-tactical-data text-xs">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Adjust Bayesian Weight:</span>
                  <span className="text-primary font-bold">{scen.probability.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={scen.probability}
                  onChange={(e) => scen.setter(parseFloat(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-outline-variant/30 flex justify-between text-xs font-tactical-data text-on-surface-variant">
              <span>SUPPORTING EVIDENCE:</span>
              <strong className="text-emerald-400">{scen.evidence} verified links</strong>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
