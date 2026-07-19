import React from 'react';
import { Eye, Crosshair, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

export const LineOfSight: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              3D RAYCASTING VISIBILITY CONE AUDIT
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            Line of Sight & Occlusion Analysis
          </h1>
        </div>

        <Badge variant="critical">OCCLUSION RAYCAST: 100% BLOCKED</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6 space-y-4 border-primary/60">
          <Badge variant="critical">RAYCAST PROFILE #1 (WITNESS DR. VANCE)</Badge>
          <h3 className="font-display-lg text-2xl font-bold uppercase text-on-surface">
            North Doorway Wall B → Inner Vault Lock
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed font-body-md">
            When projecting a 60° horizontal / 45° vertical field-of-view cone from the standing position of Dr. Vance (`[-8.0m, 1.7m, 0.0m]`), the ray intersects solid Server Rack #4 at `2.1 meters`.
          </p>
          <div className="p-4 rounded bg-secondary-container/60 border border-primary font-tactical-data text-xs space-y-2">
            <div className="flex justify-between text-primary font-bold">
              <span>VISIBILITY SCORE:</span>
              <span>0.0% (OCCLUDED)</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Primary Obstacle:</span>
              <span>Server Rack #4 Steel Chassis</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-4">
          <Badge variant="active">RAYCAST PROFILE #2 (ATTACKER WALKWAY)</Badge>
          <h3 className="font-display-lg text-2xl font-bold uppercase text-on-surface">
            Elevated Walkway → Primary Impact Point
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed font-body-md">
            Raycasting from the elevated catwalk coordinate (`[-2.4m, 1.7m, 3.1m]`) down towards Wall B (`[1.8m, 1.2m, 0.5m]`) demonstrates a clean, unobstructed corridor passing exactly `0.45 meters` right of the server rack.
          </p>
          <div className="p-4 rounded bg-surface-container border border-outline-variant font-tactical-data text-xs space-y-2">
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>VISIBILITY SCORE:</span>
              <span>100.0% (UNOBSTRUCTED)</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Ballistic Path:</span>
              <span>Clean line-of-sight vector</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
