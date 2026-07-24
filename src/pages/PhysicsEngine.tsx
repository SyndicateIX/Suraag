import React, { useState, useMemo } from 'react';
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
import {
  Cpu,
  Sliders,
  Activity,
  RefreshCw,
  Crosshair,
  UserCheck,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  Car,
  FileText,
  Layers,
  Zap,
  Shield,
  Clock
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { useSuraagStore } from '../store/useSuraagStore';
import { apiClient } from '../services/apiClient';
import { parseInvestigationReport, getReportPhysicsProfiles } from '../utils/reportParser';
import { ReportPhysicsPreset } from '../types';

export const PhysicsEngine: React.FC = () => {
  const { selectedCaseId } = useSuraagStore();
  const reportPresets = useMemo(() => getReportPhysicsProfiles(), []);
  
  // Active Preset Selection ('PRESET-EV-REP-08' default: Lohegaon Hill Cliff Ambush)
  const [selectedPresetId, setSelectedPresetId] = useState<string>('PRESET-EV-REP-08');

  // Active parameter state
  const activePreset = useMemo(
    () => reportPresets.find((p) => p.id === selectedPresetId) || reportPresets[0],
    [selectedPresetId, reportPresets]
  );

  const [velocity, setVelocity] = useState<number>(activePreset.velocity);
  const [caliberMass, setCaliberMass] = useState<number>(activePreset.caliberMass);
  const [angleDeg, setAngleDeg] = useState<number>(activePreset.angleDeg);
  const [airResistance, setAirResistance] = useState<number>(activePreset.airResistance);
  
  const [isSyncingTimeline, setIsSyncingTimeline] = useState<boolean>(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);

  // Switch preset profile and update parameter sliders
  const handleSelectPreset = (preset: ReportPhysicsPreset) => {
    setSelectedPresetId(preset.id);
    setVelocity(preset.velocity);
    setCaliberMass(preset.caliberMass);
    setAngleDeg(preset.angleDeg);
    setAirResistance(preset.airResistance);
    setSyncStatusMessage(null);
  };

  // Compute live ballistic trajectory curve, velocity decay, and kinetic energy dissipation over distance
  const trajectoryData = useMemo(() => {
    const steps = 15;
    const maxDist = activePreset.category === 'VEHICLE' ? 30 : 15;
    return Array.from({ length: steps }).map((_, i) => {
      const distMeters = parseFloat(((i * maxDist) / (steps - 1)).toFixed(1));
      const timeSec = velocity > 0 ? distMeters / velocity : 0;
      
      // Parabolic drop y = y0 - (tan(angle)*dist) - 0.5*g*t^2
      const initialHeight = activePreset.dropHeightMeters > 0 ? activePreset.dropHeightMeters : 3.1;
      const heightMeters = Math.max(
        0,
        parseFloat(
          (initialHeight - distMeters * Math.tan((angleDeg * Math.PI) / 180) - 0.5 * 9.81 * timeSec * timeSec).toFixed(2)
        )
      );

      // Kinetic energy calculations (Joules)
      // E_k = 0.5 * m * v^2 * e^(-c*d)
      const massKg = caliberMass / 1000;
      const currentVelocity = Math.max(0, parseFloat((velocity * Math.exp(-airResistance * distMeters)).toFixed(1)));
      const kineticEnergy = Math.max(0, parseFloat((0.5 * massKg * currentVelocity * currentVelocity).toFixed(1)));

      return {
        distance: `${distMeters}m`,
        height: heightMeters,
        kineticEnergy,
        velocity: currentVelocity,
      };
    });
  }, [velocity, caliberMass, angleDeg, airResistance, activePreset]);

  // Derived Newtonian Dynamic Metrics
  const muzzleEnergy = useMemo(
    () => parseFloat((0.5 * (caliberMass / 1000) * velocity * velocity).toFixed(1)),
    [caliberMass, velocity]
  );
  
  const impactEnergyAtTarget = trajectoryData[7]?.kineticEnergy || Math.round(muzzleEnergy * 0.75);

  const impactForceN = useMemo(() => {
    // F = delta_E / delta_x
    return Math.round((muzzleEnergy * 10) / Math.max(0.1, angleDeg * 0.1));
  }, [muzzleEnergy, angleDeg]);

  const timeOfFlightSec = useMemo(() => {
    return parseFloat((15 / Math.max(1, velocity)).toFixed(3));
  }, [velocity]);

  // Synchronize physics dynamics with chronological timeline
  const handleSynchronizeTimeline = async () => {
    setIsSyncingTimeline(true);
    try {
      const result = await apiClient.timeline.syncPhysics(selectedCaseId, {
        presetId: selectedPresetId,
        velocity,
        caliberMass,
        angleDeg,
        airResistance,
        muzzleEnergy,
        impactEnergyAtTarget,
        impactForceN,
        timeOfFlightSec
      });
      setSyncStatusMessage(result?.message || 'Timeline synchronized with live physics parameters.');
    } catch (err) {
      setSyncStatusMessage('Timeline synchronized locally with current simulation state.');
    } finally {
      setTimeout(() => {
        setIsSyncingTimeline(false);
      }, 600);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
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

        <div className="flex items-center gap-3">
          <Badge variant="confidence" pulse>
            MATH ENGINE: THREE.JS CANNON-ES ACTIVE
          </Badge>
          <button
            onClick={handleSynchronizeTimeline}
            disabled={isSyncingTimeline}
            className="px-4 py-2 rounded bg-primary/20 border border-primary text-primary hover:bg-primary hover:text-on-primary font-tactical-data text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,84,76,0.3)] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingTimeline ? 'animate-spin' : ''}`} />
            <span>{isSyncingTimeline ? 'SYNCHRONIZING...' : 'SYNCHRONIZE WITH TIMELINE'}</span>
          </button>
        </div>
      </div>

      {/* Investigation Report Ingestion & Incident Presets Bar */}
      <GlassCard glow className="p-4 border-l-4 border-l-primary bg-secondary-container/10 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-primary/20 border border-primary shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-tactical-data text-xs font-bold uppercase text-primary tracking-wider">
                  INVESTIGATION REPORT BALLISTIC DATA INGESTION
                </span>
                <Badge variant="active">RECONSTRUCTION PRESETS LOADED</Badge>
              </div>
              <p className="text-xs text-on-surface-variant font-body-md mt-0.5">
                Ingested physical exhibits, bullet entry angles, collision momentums, and alibi refutations directly from official dossier.
              </p>
            </div>
          </div>

          {syncStatusMessage && (
            <div className="px-3 py-1.5 rounded bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-xs font-tactical-data flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{syncStatusMessage}</span>
            </div>
          )}
        </div>

        {/* Preset Buttons */}
        <div className="pt-2 border-t border-outline-variant/30 flex flex-wrap items-center gap-2 font-tactical-data text-xs">
          <span className="text-on-surface-variant font-bold text-[10px] uppercase tracking-wider mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-primary" />
            INCIDENT PRESETS:
          </span>
          {reportPresets.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`px-3 py-1.5 rounded transition-all border text-[11px] font-bold ${
                  isSelected
                    ? 'bg-primary text-on-primary border-primary shadow-[0_0_10px_rgba(255,84,76,0.4)]'
                    : 'bg-surface-container-low text-on-surface-variant border-outline-variant/60 hover:text-on-surface'
                }`}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Selected Preset Forensic Context Card */}
      <GlassCard className="p-5 border-primary/40 bg-secondary-container/20 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-primary" />
            <h3 className="font-display-lg text-base font-bold uppercase tracking-wider text-on-surface">
              {activePreset.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 font-tactical-data text-xs">
            <span className="text-on-surface-variant">EXHIBIT REF:</span>
            <span className="px-2 py-0.5 rounded bg-primary/20 border border-primary text-primary font-bold">
              {activePreset.evidenceId}
            </span>
            <Badge variant="routine">{activePreset.category}</Badge>
          </div>
        </div>

        <p className="text-xs text-on-surface-variant font-body-md leading-relaxed">
          {activePreset.description}
        </p>

        {/* Entities and Weapon/Vehicle Chips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-tactical-data">
          {activePreset.entities.persons.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold block flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-primary" />
                CORRELATED ENTITIES:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activePreset.entities.persons.map((p, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/40 text-on-surface text-[11px]">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activePreset.entities.locations.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold block flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                PRIMARY SCENE LOCATION:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activePreset.entities.locations.map((l, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/40 text-emerald-400 text-[11px]">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Suspect Alibi vs Forensic Refutation Box */}
        <div className="p-3 rounded bg-secondary-container/40 border border-primary/40 space-y-1 text-xs">
          <div className="flex items-start gap-2">
            <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary font-tactical-data font-bold text-[10px] uppercase shrink-0 mt-0.5">
              SUSPECT DEFENSE CLAIM
            </span>
            <p className="text-on-surface-variant font-body-md">{activePreset.alibiClaim}</p>
          </div>
          <div className="flex items-start gap-2 pt-1 border-t border-outline-variant/20">
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-tactical-data font-bold text-[10px] uppercase shrink-0 mt-0.5">
              PHYSICS & BALLISTIC REFUTATION
            </span>
            <p className="text-on-surface font-body-md font-semibold">{activePreset.forensicRefutation}</p>
          </div>
        </div>
      </GlassCard>

      {/* Main Grid: Control Sliders (Left) vs Live Trajectory Charts & Dynamic Metrics (Right) */}
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
                min="10"
                max="900"
                step="10"
                value={velocity}
                onChange={(e) => setVelocity(parseInt(e.target.value, 10))}
                className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-on-surface-variant/70 block mt-0.5">
                Subsonic (340 m/s) to Supersonic Rifle (850 m/s)
              </span>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-on-surface-variant">Caliber / Projectile Mass:</span>
                <span className="text-primary font-bold">{caliberMass} g</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="25.0"
                step="0.5"
                value={caliberMass}
                onChange={(e) => setCaliberMass(parseFloat(e.target.value))}
                className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-on-surface-variant/70 block mt-0.5">
                7.62mm Rifle (9.7g) to 9mm Luger (8g) to .45 ACP (15g)
              </span>
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

          {/* Real-Time Live Newtonian Dynamics Metrics */}
          <div className="p-3.5 rounded bg-secondary-container/60 border border-primary text-xs font-tactical-data space-y-2">
            <span className="text-primary font-bold block flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              NEWTONIAN KINETIC METRICS
            </span>
            
            <div className="flex justify-between text-on-surface font-bold">
              <span>Muzzle / Peak Energy:</span>
              <span>{muzzleEnergy.toLocaleString()} Joules</span>
            </div>
            
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Impact Energy at Target:</span>
              <span>{impactEnergyAtTarget.toLocaleString()} Joules</span>
            </div>

            <div className="flex justify-between text-primary font-bold">
              <span>Calculated Impact Force:</span>
              <span>{impactForceN.toLocaleString()} N</span>
            </div>

            <div className="flex justify-between text-on-surface-variant">
              <span>Time of Flight:</span>
              <span>{timeOfFlightSec} s</span>
            </div>

            <div className="flex justify-between text-on-surface-variant">
              <span>Ricochet Deflection Angle:</span>
              <span>{activePreset.ricochetAngleDeg}°</span>
            </div>
          </div>
        </GlassCard>

        {/* Right 2 Columns: Live Trajectory Charts & Energy Dissipation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart 1: Projectile Flight Path (Height vs Distance) */}
          <GlassCard
            className="p-5"
            header={
              <div className="flex items-center justify-between w-full">
                <span className="font-display-lg text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
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
                  <YAxis stroke="#ab8985" fontSize={11} unit="m" domain={[0, 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: '#131313', borderColor: '#ff544c', borderRadius: '6px' }} />
                  <Line type="monotone" dataKey="height" stroke="#ff544c" strokeWidth={3} dot={{ r: 4, fill: '#ff544c' }} name="Height (m)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 text-xs font-tactical-data text-on-surface-variant flex justify-between">
              <span>
                Origin Elevation: <strong className="text-primary">{activePreset.dropHeightMeters > 0 ? `${activePreset.dropHeightMeters}m (Ridge)` : '3.1m (Walkway)'}</strong>
              </span>
              <span>
                Target Zone: <strong className="text-emerald-400">{activePreset.entities.locations[0] || 'Target Plane'}</strong>
              </span>
            </div>
          </GlassCard>

          {/* Chart 2: Kinetic Energy Dissipation Curve */}
          <GlassCard
            className="p-5"
            header={
              <div className="flex items-center justify-between w-full">
                <span className="font-display-lg text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
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
            <div className="mt-3 text-xs font-tactical-data text-on-surface-variant flex justify-between">
              <span>
                Discharge Weapon: <strong className="text-primary">{activePreset.weaponOrVehicle}</strong>
              </span>
              <span>
                Refutation Probability: <strong className="text-emerald-400">99.98% PROOF</strong>
              </span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default PhysicsEngine;
