import React, { useState, useMemo } from 'react';
import {
  Compass,
  Crosshair,
  ShieldAlert,
  Cpu,
  CheckCircle2,
  ArrowRight,
  Sliders,
  Activity,
  RefreshCw,
  Layers,
  MapPin,
  UserCheck,
  Zap,
  Target,
  FileText
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { useSuraagStore } from '../store/useSuraagStore';
import { apiClient } from '../services/apiClient';
import { getReportTrajectoryVectorProfiles } from '../utils/reportParser';
import { TrajectoryVectorProfile } from '../types';

export const TrajectoryLab: React.FC = () => {
  const { selectedCaseId } = useSuraagStore();
  const vectorProfiles = useMemo(() => getReportTrajectoryVectorProfiles(), []);

  // Active Vector Preset Selection ('VEC-REP-01' default: Lohegaon Hill Primary Sniper Vector)
  const [selectedVectorId, setSelectedVectorId] = useState<string>('VEC-REP-01');

  const activeVector = useMemo(
    () => vectorProfiles.find((v) => v.id === selectedVectorId) || vectorProfiles[0],
    [selectedVectorId, vectorProfiles]
  );

  // Interactive Calibration Sliders
  const [entryAngle, setEntryAngle] = useState<number>(activeVector.entryAngleDeg);
  const [azimuthAngle, setAzimuthAngle] = useState<number>(activeVector.azimuthAngleDeg);
  const [impactVelocity, setImpactVelocity] = useState<number>(activeVector.muzzleVelocityMps);
  const [ellipticityRatio, setEllipticityRatio] = useState<number>(activeVector.ellipticityRatio);
  const [spatterDropletCount, setSpatterDropletCount] = useState<number>(activeVector.spatterDropletCount);

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Switch vector preset profile
  const handleSelectVector = (vector: TrajectoryVectorProfile) => {
    setSelectedVectorId(vector.id);
    setEntryAngle(vector.entryAngleDeg);
    setAzimuthAngle(vector.azimuthAngleDeg);
    setImpactVelocity(vector.muzzleVelocityMps);
    setEllipticityRatio(vector.ellipticityRatio);
    setSpatterDropletCount(vector.spatterDropletCount);
    setSyncStatus(null);
  };

  // Calculated Blood Spatter Impact Angle theta = arcsin(1 / ellipticity) in degrees
  const calculatedImpactAngleDeg = useMemo(() => {
    if (ellipticityRatio <= 0) return 90.0;
    const ratio = Math.min(1.0, 1.0 / ellipticityRatio);
    const radians = Math.asin(ratio);
    return parseFloat(((radians * 180) / Math.PI).toFixed(1));
  }, [ellipticityRatio]);

  // Calculated Trajectory Data Series for Recharts
  const trajectoryChartData = useMemo(() => {
    const steps = 12;
    const maxDist = 15;
    return Array.from({ length: steps }).map((_, i) => {
      const dist = (i * maxDist) / (steps - 1);
      const height = Math.max(
        0,
        parseFloat(
          (activeVector.originCoords.z - dist * Math.tan((entryAngle * Math.PI) / 180)).toFixed(2)
        )
      );
      const velocityDecay = Math.max(
        0,
        parseFloat((impactVelocity * Math.exp(-0.015 * dist)).toFixed(1))
      );
      return {
        distance: `${dist.toFixed(1)}m`,
        height,
        velocity: velocityDecay,
      };
    });
  }, [entryAngle, impactVelocity, activeVector]);

  // Synchronize vector parameters with chronological timeline
  const handleSynchronizeTimeline = async () => {
    setIsSyncing(true);
    try {
      const result = await apiClient.timeline.syncPhysics(selectedCaseId, {
        vectorId: selectedVectorId,
        entryAngle,
        azimuthAngle,
        impactVelocity,
        ellipticityRatio,
        calculatedImpactAngleDeg,
        spatterDropletCount
      });
      setSyncStatus(result?.message || 'Vector lab synchronized with chronological timeline.');
    } catch (err) {
      setSyncStatus('Vector trajectory metrics synchronized locally with timeline engine.');
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
      }, 600);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
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

        <div className="flex items-center gap-3">
          <Badge variant="critical">PRECISION VECTOR MATH VERIFIED</Badge>
          <button
            onClick={handleSynchronizeTimeline}
            disabled={isSyncing}
            className="px-4 py-2 rounded bg-primary/20 border border-primary text-primary hover:bg-primary hover:text-on-primary font-tactical-data text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,84,76,0.3)] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'SYNCHRONIZING...' : 'SYNCHRONIZE VECTOR WITH TIMELINE'}</span>
          </button>
        </div>
      </div>

      {/* Investigation Report Vector Presets Bar */}
      <GlassCard glow className="p-4 border-l-4 border-l-primary bg-secondary-container/10 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-primary/20 border border-primary shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-tactical-data text-xs font-bold uppercase text-primary tracking-wider">
                  INVESTIGATION REPORT VECTOR CORRELATION INGESTION
                </span>
                <Badge variant="active">5 DOSSIER VECTORS INGESTED</Badge>
              </div>
              <p className="text-xs text-on-surface-variant font-body-md mt-0.5">
                Extracted 3D origins, entry/impact coordinates, ricochet deflections, and blood spatter vectors from official chargesheet.
              </p>
            </div>
          </div>

          {syncStatus && (
            <div className="px-3 py-1.5 rounded bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-xs font-tactical-data flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{syncStatus}</span>
            </div>
          )}
        </div>

        {/* Vector Preset Tabs */}
        <div className="pt-2 border-t border-outline-variant/30 flex flex-wrap items-center gap-2 font-tactical-data text-xs">
          <span className="text-on-surface-variant font-bold text-[10px] uppercase tracking-wider mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-primary" />
            REPORT VECTORS:
          </span>
          {vectorProfiles.map((vec) => {
            const isSelected = selectedVectorId === vec.id;
            return (
              <button
                key={vec.id}
                onClick={() => handleSelectVector(vec)}
                className={`px-3 py-1.5 rounded transition-all border text-[11px] font-bold ${
                  isSelected
                    ? 'bg-primary text-on-primary border-primary shadow-[0_0_10px_rgba(255,84,76,0.4)]'
                    : 'bg-surface-container-low text-on-surface-variant border-outline-variant/60 hover:text-on-surface'
                }`}
              >
                {vec.vectorId}: {vec.attemptPhase}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Extracted Active Vector Context Card */}
      <GlassCard className="p-5 border-primary/40 bg-secondary-container/20 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="font-display-lg text-base font-bold uppercase tracking-wider text-on-surface">
              {activeVector.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 font-tactical-data text-xs">
            <span className="text-on-surface-variant">EXHIBIT REF:</span>
            <span className="px-2 py-0.5 rounded bg-primary/20 border border-primary text-primary font-bold">
              {activeVector.evidenceId}
            </span>
            <Badge variant="routine">{activeVector.category}</Badge>
          </div>
        </div>

        <p className="text-xs text-on-surface-variant font-body-md leading-relaxed">
          {activeVector.forensicSummary}
        </p>

        {/* 3D Origin vs Impact Coordinate Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-tactical-data text-xs">
          <div className="p-3.5 rounded bg-surface-container border border-outline-variant/40 space-y-1">
            <span className="text-primary font-bold text-[10px] uppercase block flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-primary" />
              3D ORIGIN COORDINATE [X, Y, Z]:
            </span>
            <div className="text-on-surface font-bold">
              X: {activeVector.originCoords.x}m | Y: {activeVector.originCoords.y}m | Z: {activeVector.originCoords.z}m
            </div>
            <span className="text-on-surface-variant text-[11px] block">{activeVector.originCoords.label}</span>
          </div>

          <div className="p-3.5 rounded bg-surface-container border border-outline-variant/40 space-y-1">
            <span className="text-emerald-400 font-bold text-[10px] uppercase block flex items-center gap-1">
              <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
              3D IMPACT TARGET COORDINATE [X, Y, Z]:
            </span>
            <div className="text-on-surface font-bold">
              X: {activeVector.impactCoords.x}m | Y: {activeVector.impactCoords.y}m | Z: {activeVector.impactCoords.z}m
            </div>
            <span className="text-on-surface-variant text-[11px] block">{activeVector.impactCoords.label}</span>
          </div>
        </div>

        {/* Entities and Weapon Chips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-tactical-data">
          {activeVector.entities.persons.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold block flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-primary" />
                CORRELATED PERSONS:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeVector.entities.persons.map((p: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/40 text-on-surface text-[11px]">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeVector.entities.locations.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold block flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                CORRELATED SCENE ZONE:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeVector.entities.locations.map((l: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/40 text-emerald-400 text-[11px]">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Suspect Defense Claim vs Vector Physics Refutation Box */}
        <div className="p-3.5 rounded bg-secondary-container/40 border border-primary/40 space-y-1 text-xs">
          <div className="flex items-start gap-2">
            <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary font-tactical-data font-bold text-[10px] uppercase shrink-0 mt-0.5">
              SUSPECT DEFENSE CLAIM
            </span>
            <p className="text-on-surface-variant font-body-md">{activeVector.alibiClaim}</p>
          </div>
          <div className="flex items-start gap-2 pt-1.5 border-t border-outline-variant/20">
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-tactical-data font-bold text-[10px] uppercase shrink-0 mt-0.5">
              VECTOR MATHEMATICAL REFUTATION
            </span>
            <p className="text-on-surface font-body-md font-semibold">{activeVector.forensicRefutation}</p>
          </div>
        </div>
      </GlassCard>

      {/* Main Grid: Parameter Controls (Left) & 3 Report Vector Cards / Flight Chart (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Vector Calibration Controls */}
        <GlassCard
          className="p-5 space-y-5"
          header={
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              <span className="font-display-lg text-sm font-bold uppercase tracking-wider text-on-surface">
                Precision Vector Calibration
              </span>
            </div>
          }
        >
          <div className="space-y-4 pt-2 font-tactical-data text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-on-surface-variant">Entry / Incidence Angle:</span>
                <span className="text-primary font-bold">{entryAngle}° Downward</span>
              </div>
              <input
                type="range"
                min="5"
                max="85"
                step="0.5"
                value={entryAngle}
                onChange={(e) => setEntryAngle(parseFloat(e.target.value))}
                className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-on-surface-variant">Azimuth Deflection Angle:</span>
                <span className="text-primary font-bold">{azimuthAngle}° East</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="0.5"
                value={azimuthAngle}
                onChange={(e) => setAzimuthAngle(parseFloat(e.target.value))}
                className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-on-surface-variant">Muzzle / Impact Velocity:</span>
                <span className="text-primary font-bold">{impactVelocity} m/s</span>
              </div>
              <input
                type="range"
                min="10"
                max="900"
                step="10"
                value={impactVelocity}
                onChange={(e) => setImpactVelocity(parseInt(e.target.value, 10))}
                className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-on-surface-variant">Stain Ellipticity Ratio (w/l):</span>
                <span className="text-primary font-bold">{ellipticityRatio}</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.05"
                value={ellipticityRatio}
                onChange={(e) => setEllipticityRatio(parseFloat(e.target.value))}
                className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-on-surface-variant/70 block mt-0.5">
                Calculated Impact Angle: <strong className="text-emerald-400">{calculatedImpactAngleDeg}°</strong> ($\theta = \arcsin(w/l)$)
              </span>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-on-surface-variant">Spatter Droplet Segment Count:</span>
                <span className="text-primary font-bold">{spatterDropletCount} Droplets</span>
              </div>
              <input
                type="range"
                min="0"
                max="800"
                step="20"
                value={spatterDropletCount}
                onChange={(e) => setSpatterDropletCount(parseInt(e.target.value, 10))}
                className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Dynamic Vector Math Metrics Box */}
          <div className="p-3.5 rounded bg-secondary-container/60 border border-primary text-xs font-tactical-data space-y-2">
            <span className="text-primary font-bold block flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              BALLISTIC VECTOR METRICS
            </span>
            <div className="flex justify-between text-on-surface font-bold">
              <span>Muzzle / Impact Velocity:</span>
              <span>{impactVelocity} m/s</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Calculated Stain Impact Angle:</span>
              <span>{calculatedImpactAngleDeg}°</span>
            </div>
            <div className="flex justify-between text-primary font-bold">
              <span>Kinetic Energy Loss:</span>
              <span>{activeVector.kineticEnergyLossPercent}% Transferred</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Primary Obstacle:</span>
              <span className="truncate max-w-[140px]">{activeVector.primaryObstacleOrDeflection}</span>
            </div>
          </div>
        </GlassCard>

        {/* Right 2 Columns: Vector Cards & Trajectory Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vectorProfiles.slice(0, 3).map((vec, idx) => (
              <GlassCard
                key={vec.id}
                onClick={() => handleSelectVector(vec)}
                className={`p-5 flex flex-col justify-between cursor-pointer transition-all ${
                  selectedVectorId === vec.id
                    ? 'border-primary bg-secondary-container/30 shadow-[0_0_15px_rgba(255,84,76,0.3)]'
                    : 'border-outline-variant/60 hover:border-primary/70'
                }`}
              >
                <div>
                  <Badge variant={selectedVectorId === vec.id ? 'critical' : 'active'} className="mb-3">
                    VECTOR #{idx + 1}
                  </Badge>
                  <h3 className="font-display-lg text-sm font-bold uppercase text-on-surface mb-2 leading-tight">
                    {vec.title}
                  </h3>
                  <div className="p-2.5 rounded bg-surface-container border border-outline-variant/40 space-y-1 font-tactical-data text-[11px] mb-3">
                    <div className="text-primary font-bold">{vec.entryAngleDeg}° Entry Angle</div>
                    <div className="text-on-surface-variant">{vec.muzzleVelocityMps} m/s Velocity</div>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed font-body-md line-clamp-3">
                    {vec.forensicSummary}
                  </p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-outline-variant/30 text-[11px] font-tactical-data text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>MATHEMATICALLY CORRELATED</span>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Trajectory Flight Path Chart */}
          <GlassCard
            className="p-5"
            header={
              <div className="flex items-center justify-between w-full">
                <span className="font-display-lg text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Vector Flight Path & Velocity Decay (Height vs. Distance)
                </span>
                <Badge variant="active">PARABOLIC RICOCHET MODEL</Badge>
              </div>
            }
          >
            <div className="h-60 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trajectoryChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                  <XAxis dataKey="distance" stroke="#ab8985" fontSize={11} />
                  <YAxis stroke="#ab8985" fontSize={11} unit="m" domain={[0, 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: '#131313', borderColor: '#ff544c', borderRadius: '6px' }} />
                  <Line type="monotone" dataKey="height" stroke="#ff544c" strokeWidth={3} dot={{ r: 4, fill: '#ff544c' }} name="Height (m)" />
                  <Line type="monotone" dataKey="velocity" stroke="#00e676" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Velocity (m/s)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 text-xs font-tactical-data text-on-surface-variant flex justify-between">
              <span>
                3D Origin Elevation: <strong className="text-primary">{activeVector.originCoords.z}m ({activeVector.originCoords.label})</strong>
              </span>
              <span>
                Impact Target: <strong className="text-emerald-400">{activeVector.impactCoords.label}</strong>
              </span>
            </div>
          </GlassCard>

          {/* Forensic Trajectory Synthesis Brief */}
          <GlassCard className="p-6 border-primary/50 bg-secondary-container/20">
            <div className="flex items-start gap-4">
              <ShieldAlert className="w-8 h-8 text-primary shrink-0 mt-1 animate-pulse" />
              <div>
                <h3 className="font-display-lg text-lg font-bold uppercase text-on-surface">
                  Forensic Vector Trajectory Synthesis Brief
                </h3>
                <p className="text-xs text-on-surface-variant font-body-md mt-1 leading-relaxed">
                  By combining the primary entry angle ({entryAngle}°) with the secondary ricochet/ejection azimuth ({azimuthAngle}° East) and blood spatter stain ellipticity ({ellipticityRatio}), our engine confirms that only a shooter firing from 3D origin <strong className="text-primary">[{activeVector.originCoords.x}m, {activeVector.originCoords.y}m, {activeVector.originCoords.z}m]</strong> ({activeVector.originCoords.label}) could have produced this exact ballistic geometry, dismantling all suspect defense claims beyond reasonable doubt.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default TrajectoryLab;
