import React from 'react';
import { Crosshair, ShieldAlert, CheckCircle2, UserCheck, Target, ArrowUpRight } from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

export const AttackerEstimation: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crosshair className="w-4 h-4 text-primary" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              GEOMETRIC TRIANGULATION & HEIGHT PROJECTION
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            Attacker Position Triangulation
          </h1>
        </div>

        <Badge variant="confidence" pulse>ATTACKER TRIANGULATED: 99.4% CONFIDENCE</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6 space-y-4 border-primary/60">
          <Badge variant="critical">ESTIMATED COORDINATE ORIGIN</Badge>
          <h3 className="font-display-lg text-2xl font-bold uppercase text-on-surface">
            Walkway Sector 4-East [X: -2.4m, Y: 1.7m, Z: 3.1m]
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed font-body-md">
            Using inverse raycasting from the Wall B entry hole and factoring in bullet drop (`0.12m` over `3.5m`), Suraag AI calculated the exact coordinate box of the shooter. The shooter stood on the maintenance catwalk right above Server Rack #4.
          </p>
          <div className="p-4 rounded bg-surface-container border border-outline-variant space-y-2 font-tactical-data text-xs">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Estimated Shooter Height:</span>
              <span className="text-primary font-bold">1.82m ± 0.04m (5 ft 11 in)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Shooter Stance:</span>
              <span className="text-on-surface font-semibold">Standing / Modified Isosceles</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Weapon Elevation Above Floor:</span>
              <span className="text-primary font-bold">1.70 meters</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-4">
          <Badge variant="active">BIOMETRIC & SUSPECT CORRELATION</Badge>
          <h3 className="font-display-lg text-2xl font-bold uppercase text-on-surface">
            Suspect Viktor Krell Profile Match
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed font-body-md">
            The triangulated shooter height of `1.82m` perfectly corresponds to suspect **Viktor "Shadow" Krell's** documented biometric height (`1.83m`). Furthermore, the suppressed subsonic 9mm profile matches his registered Swiss tactical firearm.
          </p>
          <div className="p-4 rounded bg-secondary-container/40 border border-primary space-y-2 font-tactical-data text-xs">
            <div className="text-primary font-bold flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              <span>PROBABILITY OF KRELL FIRING SHOT: 89.4%</span>
            </div>
            <p className="text-on-surface-variant text-[11px] leading-relaxed">
              No other authorized personnel or suspected operatives match both the elevated coordinate line-of-sight and physical stature profile within the 23:14 to 23:16 window.
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
