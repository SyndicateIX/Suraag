import React from 'react';
import { Sparkles, Cpu, ShieldAlert, CheckCircle2, Crosshair, Tag, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

export const AIReasoning: React.FC = () => {
  const reasoningChains = [
    {
      title: 'Attacker Coordinate Triangulation & Stance Estimation',
      confidence: '99.4%',
      summary: 'Shooter fired from elevated maintenance catwalk at exact coordinates [X: -2.4m, Y: 1.7m, Z: 3.1m] while standing in a modified isosceles stance.',
      evidenceIds: ['EV-1 (Glock 19 Pistol)', 'EV-2 (Blood Spatter)', 'TL-3 (Acoustic Sensor)'],
      physicsMath: 'Calculated using inverse raycasting from Wall B bullet entry scar (34.2° entry angle) and parabolic drop formula over 3.5m flight distance.',
      rejectedHypothesis: 'Rejected Floor-Level Firing Hypothesis: Firing from floor plane [Z = 0.0m] would require bullet to penetrate solid structural Server Rack #4, which shows 0% ballistic damage.',
    },
    {
      title: 'Witness Statement Downgrade (Dr. Julian Vance)',
      confidence: '100.0% Refutation',
      summary: 'Eyewitness credibility downgraded from 85% to 42.5%. High probability of intentional statement fabrication to conceal credential leakage.',
      evidenceIds: ['WS-1 (Vance Testimony)', 'CCTV-4 (Loop Injection)', 'THERMAL-B (Sensor Log)'],
      physicsMath: '3D line-of-sight cone projected from Vance claimed coordinate [-8.0m, 1.7m, 0.0m] proves Server Rack #4 blocks 100% of visual access to vault lock.',
      rejectedHypothesis: 'Rejected Misidentification Hypothesis: Corridor thermal sensors record 0.0°C deviation at Wall B during exact 23:14:00 timestamp, proving Vance was not present.',
    },
    {
      title: 'Scenario A Dominance (Premeditated Insider Ambush)',
      confidence: '78.4% Probability',
      summary: 'Breach executed by Viktor Krell utilizing Dr. Vance keycard credentials during a 42-second EMP surge and CCTV loop injection.',
      evidenceIds: ['SUSP-1 (Krell Telemetry)', 'LOG-88 (Keycard Swipe)', 'RF-9 (Satellite Ping)'],
      physicsMath: 'Bayesian belief network synthesis across 18 independent evidence nodes confirms chronological and spatial alignment.',
      rejectedHypothesis: 'Rejected External Assault Hypothesis (Scenario B): Perimeter gate shock sensors and fiber intrusion loops recorded no physical forced entry signatures during the window.',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              TRANSPARENT CHAIN OF CUSTODY & MATHEMATICAL EXPLAINABILITY
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            Explainable AI Reasoning Engine
          </h1>
        </div>

        <Badge variant="confidence" pulse>EXPLAINABILITY SCORE: 100% TRANSPARENT</Badge>
      </div>

      <div className="space-y-6">
        {reasoningChains.map((chain, idx) => (
          <GlassCard key={idx} glow={idx === 0} className="p-6 border-primary/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-3">
                <Badge variant="critical">INFERENCE CHAIN #{idx + 1}</Badge>
                <h3 className="font-display-lg font-bold text-2xl uppercase text-on-surface">
                  {chain.title}
                </h3>
              </div>
              <Badge variant="active" pulse>{chain.confidence}</Badge>
            </div>

            <p className="text-sm font-body-md text-on-surface leading-relaxed p-3 rounded bg-surface-container-low border border-outline-variant/40">
              <strong>AI Conclusion Summary:</strong> {chain.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-4 rounded bg-surface-container border border-outline-variant/50 space-y-2">
                <span className="text-[10px] font-tactical-data uppercase tracking-wider text-primary font-bold block flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5" />
                  SUPPORTING GEOMETRIC & PHYSICS MATH
                </span>
                <p className="text-xs font-body-md text-on-surface-variant leading-relaxed">
                  {chain.physicsMath}
                </p>
                <div className="pt-2 flex flex-wrap gap-1.5 font-tactical-data text-[10px]">
                  {chain.evidenceIds.map((eid, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-secondary-container text-primary border border-primary/30">
                      Link: {eid}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded bg-secondary-container/40 border border-primary/40 space-y-2">
                <span className="text-[10px] font-tactical-data uppercase tracking-wider text-amber-400 font-bold block flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  REJECTED ALTERNATIVE HYPOTHESIS & WHY
                </span>
                <p className="text-xs font-body-md text-on-surface-variant leading-relaxed italic">
                  {chain.rejectedHypothesis}
                </p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
