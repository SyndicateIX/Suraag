import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Cpu, Compass, Sliders, ShieldAlert, CheckCircle, ArrowRight, Gauge, Activity } from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

export const PhysicsEngine: React.FC = () => {
  const [velocity, setVelocity] = useState(340);
  const [caliberMass, setCaliberMass] = useState(8.0); // grams for 9mm
  const [angleDeg, setAngleDeg] = useState(34.2);
  const [airResistance, setAirResistance] = useState(0.015);

  // Compute live ballistic trajectory curve and kinetic energy dissipation over distance
  const trajectoryData = Array.from({ length: 15 }).map((_, i) => {
    const distMeters = i * 0.5;
    const timeSec = distMeters / velocity;
    // Parabolic drop y = y0 - (tan(angle)*dist) - 0.5*g*t^2
    const heightMeters = Math.max(0, parseFloat((3.1 - distMeters * Math.tan((angleDeg * Math.PI) / 180) - 0.5 * 9.81 * timeSec * timeSec).toFixed(2)));
    const kineticEnergy = Math.max(0, parseFloat((0.5 * (caliberMass / 1000) * velocity * velocity * Math.exp(-airResistance * distMeters)).toFixed(1)));
    return {
      distance: `${distMeters}m`,
      height: heightMeters,
      kineticEnergy,
      velocity: Math.max(0, parseFloat((velocity * Math.exp(-airResistance * distMeters)).toFixed(1))),
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              LATTICE BALLISTIC & NEWTONIAN DYNAMICS MODULE
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            Physics Simulation & Ballistic Engine
          </h1>
        </div>

        <Badge variant="confidence" pulse>MATH ENGINE: THREE.JS CANNON-ES ACTIVE</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Parameter Sliders */}
        <GlassCard
          className="p-5 space-y-5"
          header={
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              <span className="font-display-lg text-sm font-bold uppercase tracking-wider text-on-surface">
                Ballistic Variable Calibration
              </span>
            </div>
          }
        >
          <div className="space-y-4 pt-2 font-tactical-data text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-on-surface-variant">Muzzle / Impact Velocity:</span>
                <span className="text-primary font-bold">{velocity} m/s</span>
              </div>
              <input
                type="range"
                min="200"
                max="900"
                step="10"
                value={velocity}
                onChange={(e) => setVelocity(parseInt(e.target.value, 10))}
                className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-on-surface-variant/70 block mt-0.5">Subsonic (340 m/s) to Supersonic Rifle (850 m/s)</span>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-on-surface-variant">Caliber Projectile Mass:</span>
                <span className="text-primary font-bold">{caliberMass} g</span>
              </div>
              <input
                type="range"
                min="4.0"
                max="16.0"
                step="0.5"
                value={caliberMass}
                onChange={(e) => setCaliberMass(parseFloat(e.target.value))}
                className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-on-surface-variant/70 block mt-0.5">9mm Luger (8g) to .45 ACP (15g)</span>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-on-surface-variant">Entry / Incidence Angle:</span>
                <span className="text-primary font-bold">{angleDeg}° Downward</span>
              </div>
              <input
                type="range"
                min="5"
                max="85"
                step="0.5"
                value={angleDeg}
                onChange={(e) => setAngleDeg(parseFloat(e.target.value))}
                className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-on-surface-variant">Air Drag / Drag Coefficient:</span>
                <span className="text-primary font-bold">{airResistance}</span>
              </div>
              <input
                type="range"
                min="0.005"
                max="0.05"
                step="0.005"
                value={airResistance}
                onChange={(e) => setAirResistance(parseFloat(e.target.value))}
                className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="p-3.5 rounded bg-secondary-container/60 border border-primary text-xs font-tactical-data space-y-1.5">
            <span className="text-primary font-bold block flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              SIMULATED KINETIC ENERGY
            </span>
            <div className="flex justify-between text-on-surface font-bold">
              <span>Muzzle Energy:</span>
              <span>{(0.5 * (caliberMass / 1000) * velocity * velocity).toFixed(1)} Joules</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>Impact at Wall (3.5m):</span>
              <span>{trajectoryData[7]?.kineticEnergy || 485} Joules</span>
            </div>
          </div>
        </GlassCard>

        {/* Right 2 Columns: Live Trajectory Charts */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard
            className="p-5"
            header={
              <div className="flex items-center justify-between w-full">
                <span className="font-display-lg text-sm font-bold uppercase tracking-wider text-on-surface">
                  Projectile Flight Path (Height vs. Distance)
                </span>
                <Badge variant="active">PARABOLIC DROP CURVE</Badge>
              </div>
            }
          >
            <div className="h-64 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trajectoryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                  <XAxis dataKey="distance" stroke="#ab8985" fontSize={11} />
                  <YAxis stroke="#ab8985" fontSize={11} unit="m" domain={[0, 3.5]} />
                  <Tooltip contentStyle={{ backgroundColor: '#131313', borderColor: '#ff544c', borderRadius: '6px' }} />
                  <Line type="monotone" dataKey="height" stroke="#ff544c" strokeWidth={3} dot={{ r: 4, fill: '#ff544c' }} name="Height (m)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 text-xs font-tactical-data text-on-surface-variant flex justify-between">
              <span>Origin Elevation: <strong className="text-primary">3.1m (Attacker Walkway)</strong></span>
              <span>Impact Height: <strong className="text-emerald-400">1.2m (Wall B Lock Area)</strong></span>
            </div>
          </GlassCard>

          <GlassCard
            className="p-5"
            header={
              <div className="flex items-center justify-between w-full">
                <span className="font-display-lg text-sm font-bold uppercase tracking-wider text-on-surface">
                  Kinetic Energy Dissipation Curve (Joules)
                </span>
                <Badge variant="confidence">AIR DRAG DECAY</Badge>
              </div>
            }
          >
            <div className="h-56 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trajectoryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorKe" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffb4ac" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#ffb4ac" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                  <XAxis dataKey="distance" stroke="#ab8985" fontSize={11} />
                  <YAxis stroke="#ab8985" fontSize={11} unit=" J" />
                  <Tooltip contentStyle={{ backgroundColor: '#131313', borderColor: '#ff544c', borderRadius: '6px' }} />
                  <Area type="monotone" dataKey="kineticEnergy" stroke="#ffb4ac" strokeWidth={2} fillOpacity={1} fill="url(#colorKe)" name="Energy (Joules)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
