import React from 'react';
import { Compass, Crosshair, ShieldAlert, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

export const TrajectoryLab: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              ADVANCED BALLISTIC RICOCHET & SPATTER VECTOR LAB
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            Ballistic Trajectory & Ricochet Laboratory
          </h1>
        </div>

        <Badge variant="critical">PRECISION VECTOR MATH VERIFIED</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Primary Vector Simulation',
            angle: '34.2° Downward Angle',
            speed: '340 m/s Subsonic',
            desc: 'Calculated from entry hole ellipticity (Ratio 1.42) on Wall B and laser alignment back to Server Room walkway.',
          },
          {
            title: 'Ricochet Deflection Angle',
            angle: '12.4° Azimuth East',
            speed: '190 m/s Post-Impact',
            desc: 'Upon striking concrete reinforced pillar C-2, bullet lost 48% kinetic energy and deflected into north ceiling duct.',
          },
          {
            title: 'Arterial Blood Spatter Origin',
            angle: 'Launch Angle: 28.5° Upward',
            speed: '420 Droplets Segmented',
            desc: 'Elliptical stains on doorway reveal victim was standing precisely 0.8m south of lock when struck at 23:15:10.',
          },
        ].map((lab, idx) => (
          <GlassCard key={idx} className="p-6 flex flex-col justify-between border-outline-variant/60 hover:border-primary transition-all">
            <div>
              <Badge variant="active" className="mb-3">VECTOR #{idx + 1}</Badge>
              <h3 className="font-display-lg text-xl font-bold uppercase text-on-surface mb-2">
                {lab.title}
              </h3>
              <div className="p-3 rounded bg-surface-container border border-outline-variant/40 space-y-1 font-tactical-data text-xs mb-4">
                <div className="text-primary font-bold">{lab.angle}</div>
                <div className="text-on-surface-variant">{lab.speed}</div>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed font-body-md">
                {lab.desc}
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-outline-variant/30 text-xs font-tactical-data text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>MATHEMATICALLY CORRELATED</span>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-6 border-primary/50 bg-secondary-container/20">
        <div className="flex items-start gap-4">
          <ShieldAlert className="w-8 h-8 text-primary shrink-0 mt-1 animate-pulse" />
          <div>
            <h3 className="font-display-lg text-lg font-bold uppercase text-on-surface">
              Forensic Trajectory Synthesis Brief
            </h3>
            <p className="text-xs text-on-surface-variant font-body-md mt-1 leading-relaxed">
              By combining the primary impact angle (34.2°) with the secondary ricochet scar on Pillar C-2, our engine confirms that only an operative firing from the elevated maintenance walkway (`Z = 3.1m`) could have achieved this exact geometry without striking Server Rack #4.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
