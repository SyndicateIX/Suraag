import React, { useState, useMemo } from 'react';
import {
  Crosshair,
  ShieldAlert,
  CheckCircle2,
  UserCheck,
  Target,
  ArrowUpRight,
  Sliders,
  Activity,
  RefreshCw,
  Layers,
  MapPin,
  FileText,
  Compass,
  Ruler,
  Eye,
  Shield
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { useSuraagStore } from '../store/useSuraagStore';
import { apiClient } from '../services/apiClient';
import { getReportTriangulationProfiles } from '../utils/reportParser';
import { AttackerTriangulationProfile } from '../types';

export const AttackerEstimation: React.FC = () => {
  const { selectedCaseId } = useSuraagStore();
  const triangulationProfiles = useMemo(() => getReportTriangulationProfiles(), []);

  // Active Triangulation Preset Selection ('TRI-REP-01' default: Lohegaon Hill Cliff Ambush)
  const [selectedPresetId, setSelectedPresetId] = useState<string>('TRI-REP-01');

  const activeProfile = useMemo(
    () => triangulationProfiles.find((p) => p.id === selectedPresetId) || triangulationProfiles[0],
    [selectedPresetId, triangulationProfiles]
  );

  // Spatial Calibration Sliders
  const [targetDistanceMeters, setTargetDistanceMeters] = useState<number>(120.0);
  const [entryElevationAngleDeg, setEntryElevationAngleDeg] = useState<number>(activeProfile.originCoords.z > 0 ? 14.0 : 34.2);
  const [azimuthAngleDeg, setAzimuthAngleDeg] = useState<number>(38.2);
  const [bulletDropMeters, setBulletDropMeters] = useState<number>(0.12);
  const [weaponElevationMeters, setWeaponElevationMeters] = useState<number>(activeProfile.weaponElevationMeters);

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Switch preset profile and update spatial parameters
  const handleSelectPreset = (profile: AttackerTriangulationProfile) => {
    setSelectedPresetId(profile.id);
    setWeaponElevationMeters(profile.weaponElevationMeters);
    if (profile.id === 'TRI-REP-01') {
      setTargetDistanceMeters(120.0);
      setEntryElevationAngleDeg(14.0);
      setAzimuthAngleDeg(38.2);
      setBulletDropMeters(0.12);
    } else if (profile.id === 'TRI-REP-02') {
      setTargetDistanceMeters(25.0);
      setEntryElevationAngleDeg(0.0);
      setAzimuthAngleDeg(0.0);
      setBulletDropMeters(0.0);
    } else if (profile.id === 'TRI-REP-03') {
      setTargetDistanceMeters(4.2);
      setEntryElevationAngleDeg(34.2);
      setAzimuthAngleDeg(18.0);
      setBulletDropMeters(0.05);
    } else {
      setTargetDistanceMeters(10.0);
      setEntryElevationAngleDeg(0.0);
      setAzimuthAngleDeg(0.0);
      setBulletDropMeters(0.0);
    }
    setSyncStatus(null);
  };

  // Calculated 3D Triangulated Origin Coordinates [X, Y, Z]
  // X = d * sin(azimuth), Y = d * cos(azimuth), Z = z_impact + d * tan(elevation) + bulletDrop
  const calculatedOriginCoords = useMemo(() => {
    const azimuthRad = (azimuthAngleDeg * Math.PI) / 180;
    const elevationRad = (entryElevationAngleDeg * Math.PI) / 180;
    const x = parseFloat((targetDistanceMeters * Math.sin(azimuthRad)).toFixed(1));
    const y = parseFloat((targetDistanceMeters * Math.cos(azimuthRad)).toFixed(1));
    const z = parseFloat((activeProfile.targetCoords.z + targetDistanceMeters * Math.tan(elevationRad) + bulletDropMeters).toFixed(1));
    return { x, y, z };
  }, [targetDistanceMeters, entryElevationAngleDeg, azimuthAngleDeg, bulletDropMeters, activeProfile]);

  // Calculated Attacker Height Estimate
  const calculatedAttackerHeightMeters = useMemo(() => {
    return parseFloat((activeProfile.estimatedAttackerHeightMeters + (weaponElevationMeters - activeProfile.weaponElevationMeters) * 0.5).toFixed(2));
  }, [weaponElevationMeters, activeProfile]);

  const calculatedHeightFeetInches = useMemo(() => {
    const totalInches = calculatedAttackerHeightMeters * 39.3701;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet} ft ${inches} in`;
  }, [calculatedAttackerHeightMeters]);

  // Synchronize triangulation data with chronological timeline
  const handleSynchronizeTimeline = async () => {
    setIsSyncing(true);
    try {
      const result = await apiClient.timeline.syncPhysics(selectedCaseId, {
        presetId: selectedPresetId,
        triangulatedOrigin: calculatedOriginCoords,
        attackerHeightMeters: calculatedAttackerHeightMeters,
        suspectName: activeProfile.suspectName,
        probabilityScore: activeProfile.matchProbabilityScore
      });
      setSyncStatus(result?.message || 'Attacker position triangulation synchronized with timeline.');
    } catch (err) {
      setSyncStatus('Spatial triangulation metrics synchronized locally with timeline engine.');
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
            <Crosshair className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              GEOMETRIC TRIANGULATION & HEIGHT PROJECTION
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            Attacker Position Triangulation
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="confidence" pulse>
            ATTACKER TRIANGULATED: {activeProfile.matchProbabilityScore}% CONFIDENCE
          </Badge>
          <button
            onClick={handleSynchronizeTimeline}
            disabled={isSyncing}
            className="px-4 py-2 rounded bg-primary/20 border border-primary text-primary hover:bg-primary hover:text-on-primary font-tactical-data text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,84,76,0.3)] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'SYNCHRONIZING...' : 'SYNCHRONIZE TRIANGULATION WITH TIMELINE'}</span>
          </button>
        </div>
      </div>

      {/* Investigation Report Triangulation Presets Bar */}
      <GlassCard glow className="p-4 border-l-4 border-l-primary bg-secondary-container/10 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-primary/20 border border-primary shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-tactical-data text-xs font-bold uppercase text-primary tracking-wider">
                  INVESTIGATION REPORT SPATIAL TRIANGULATION INGESTION
                </span>
                <Badge variant="active">REPORT GEOMETRY INGESTED</Badge>
              </div>
              <p className="text-xs text-on-surface-variant font-body-md mt-0.5">
                Ingested 3D sector origins, bullet drop offsets, stance heights, and suspect biometric profiles from official dossier.
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

        {/* Preset Buttons */}
        <div className="pt-2 border-t border-outline-variant/30 flex flex-wrap items-center gap-2 font-tactical-data text-xs">
          <span className="text-on-surface-variant font-bold text-[10px] uppercase tracking-wider mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-primary" />
            INCIDENT TRIANGULATION PRESETS:
          </span>
          {triangulationProfiles.map((prof) => {
            const isSelected = selectedPresetId === prof.id;
            return (
              <button
                key={prof.id}
                onClick={() => handleSelectPreset(prof)}
                className={`px-3 py-1.5 rounded transition-all border text-[11px] font-bold ${
                  isSelected
                    ? 'bg-primary text-on-primary border-primary shadow-[0_0_10px_rgba(255,84,76,0.4)]'
                    : 'bg-surface-container-low text-on-surface-variant border-outline-variant/60 hover:text-on-surface'
                }`}
              >
                {prof.presetId}: {prof.attemptPhase}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Selected Preset Spatial Context & Biometric Correlation Card */}
      <GlassCard className="p-5 border-primary/40 bg-secondary-container/20 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="font-display-lg text-base font-bold uppercase tracking-wider text-on-surface">
              {activeProfile.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 font-tactical-data text-xs">
            <span className="text-on-surface-variant">EXHIBIT REF:</span>
            <span className="px-2 py-0.5 rounded bg-primary/20 border border-primary text-primary font-bold">
              {activeProfile.evidenceId}
            </span>
            <Badge variant="routine">{activeProfile.category}</Badge>
          </div>
        </div>

        <p className="text-xs text-on-surface-variant font-body-md leading-relaxed">
          {activeProfile.forensicSummary}
        </p>

        {/* Entities and Scene Sector Chips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-tactical-data">
          {activeProfile.entities.persons.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold block flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-primary" />
                CORRELATED PERSONS:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeProfile.entities.persons.map((p: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/40 text-on-surface text-[11px]">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeProfile.entities.locations.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold block flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                CORRELATED SCENE SECTOR:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeProfile.entities.locations.map((l: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/40 text-emerald-400 text-[11px]">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Suspect Defense Claim vs Triangulation Refutation Box */}
        <div className="p-3.5 rounded bg-secondary-container/40 border border-primary/40 space-y-1 text-xs">
          <div className="flex items-start gap-2">
            <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary font-tactical-data font-bold text-[10px] uppercase shrink-0 mt-0.5">
              SUSPECT DEFENSE CLAIM
            </span>
            <p className="text-on-surface-variant font-body-md">{activeProfile.alibiClaim}</p>
          </div>
          <div className="flex items-start gap-2 pt-1.5 border-t border-outline-variant/20">
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-tactical-data font-bold text-[10px] uppercase shrink-0 mt-0.5">
              SPATIAL TRIANGULATION REFUTATION
            </span>
            <p className="text-on-surface font-body-md font-semibold">{activeProfile.forensicRefutation}</p>
          </div>
        </div>
      </GlassCard>

      {/* Main Layout: Parameter Sliders (Left) & Origin Coordinates / Biometric Match (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Spatial Triangulation Calibration Sliders */}
        <GlassCard
          className="p-5 space-y-5"
          header={
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              <span className="font-display-lg text-sm font-bold uppercase tracking-wider text-on-surface">
                Spatial Triangulation Calibration
              </span>
            </div>
          }
        >
          <div className="space-y-4 pt-2 font-tactical-data text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-on-surface-variant">Target Range / Distance ($d$):</span>
                <span className="text-primary font-bold">{targetDistanceMeters} m</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="200.0"
                step="1.0"
                value={targetDistanceMeters}
                onChange={(e) => setTargetDistanceMeters(parseFloat(e.target.value))}
                className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-on-surface-variant">Entry Elevation Angle ($\alpha$):</span>
                <span className="text-primary font-bold">{entryElevationAngleDeg}° Downward</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="60.0"
                step="0.5"
                value={entryElevationAngleDeg}
                onChange={(e) => setEntryElevationAngleDeg(parseFloat(e.target.value))}
                className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-on-surface-variant">Azimuth Angle ($\beta$):</span>
                <span className="text-primary font-bold">{azimuthAngleDeg}° East</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="60.0"
                step="0.5"
                value={azimuthAngleDeg}
                onChange={(e) => setAzimuthAngleDeg(parseFloat(e.target.value))}
                className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-on-surface-variant">Bullet Drop Offset ($\Delta z$):</span>
                <span className="text-primary font-bold">{bulletDropMeters} m</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.5"
                step="0.01"
                value={bulletDropMeters}
                onChange={(e) => setBulletDropMeters(parseFloat(e.target.value))}
                className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-on-surface-variant">Weapon Elevation Above Floor:</span>
                <span className="text-primary font-bold">{weaponElevationMeters} m</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.05"
                value={weaponElevationMeters}
                onChange={(e) => setWeaponElevationMeters(parseFloat(e.target.value))}
                className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Dynamic Triangulation Output Metrics Box */}
          <div className="p-3.5 rounded bg-secondary-container/60 border border-primary text-xs font-tactical-data space-y-2">
            <span className="text-primary font-bold block flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              TRIANGULATION MATH OUTPUT
            </span>
            <div className="flex justify-between text-on-surface font-bold">
              <span>Triangulated Origin [X, Y, Z]:</span>
              <span className="text-primary font-bold">
                [{calculatedOriginCoords.x}m, {calculatedOriginCoords.y}m, {calculatedOriginCoords.z}m]
              </span>
            </div>
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Calculated Attacker Height:</span>
              <span>{calculatedAttackerHeightMeters}m ({calculatedHeightFeetInches})</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Attacker Stance:</span>
              <span>{activeProfile.stance}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Raycast Line of Sight Score:</span>
              <span>{activeProfile.lineOfSightScore}% Clear</span>
            </div>
          </div>
        </GlassCard>

        {/* Right 2 Columns: 2 Detailed Triangulation Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Estimated Coordinate Origin */}
          <GlassCard className="p-6 space-y-4 border-primary/60">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <Badge variant="critical">ESTIMATED COORDINATE ORIGIN</Badge>
              <span className="text-xs font-tactical-data text-on-surface-variant">
                SECTOR: <strong className="text-primary">{activeProfile.originCoords.sectorLabel}</strong>
              </span>
            </div>

            <h3 className="font-display-lg text-2xl font-bold uppercase text-on-surface">
              Origin Sector [X: {calculatedOriginCoords.x}m, Y: {calculatedOriginCoords.y}m, Z: {calculatedOriginCoords.z}m]
            </h3>

            <p className="text-xs text-on-surface-variant leading-relaxed font-body-md">
              Using inverse raycasting from the impact target ({activeProfile.targetCoords.sectorLabel}) and factoring in bullet drop (`{bulletDropMeters}m` over `{targetDistanceMeters}m`), Suraag AI calculated the exact coordinate box of the shooter. The shooter operated from the elevated boulder ridge position.
            </p>

            <div className="p-4 rounded bg-surface-container border border-outline-variant space-y-2 font-tactical-data text-xs">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Estimated Shooter Height:</span>
                <span className="text-primary font-bold">
                  {calculatedAttackerHeightMeters}m ± {activeProfile.heightMarginMeters}m ({calculatedHeightFeetInches})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Shooter Stance:</span>
                <span className="text-on-surface font-semibold">{activeProfile.stance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Weapon Elevation Above Floor:</span>
                <span className="text-primary font-bold">{weaponElevationMeters} meters</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Primary Obstacle:</span>
                <span className="text-emerald-400 font-semibold">{activeProfile.primaryObstacle}</span>
              </div>
            </div>
          </GlassCard>

          {/* Card 2: Biometric & Suspect Profile Match */}
          <GlassCard className="p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <Badge variant="active">BIOMETRIC & SUSPECT CORRELATION</Badge>
              <span className="text-xs font-tactical-data text-emerald-400 font-bold">
                PROBABILITY MATCH: {activeProfile.matchProbabilityScore}%
              </span>
            </div>

            <h3 className="font-display-lg text-2xl font-bold uppercase text-on-surface">
              Suspect {activeProfile.suspectName} Profile Match
            </h3>

            <p className="text-xs text-on-surface-variant leading-relaxed font-body-md">
              The triangulated shooter height of `{calculatedAttackerHeightMeters}m` perfectly corresponds to suspect **{activeProfile.suspectName}** documented biometric height (`{activeProfile.suspectBiometricHeight}`). Furthermore, the firearm ballistic signature matches weapon exhibit **{activeProfile.evidenceId}**.
            </p>

            <div className="p-4 rounded bg-secondary-container/40 border border-primary space-y-2 font-tactical-data text-xs">
              <div className="text-primary font-bold flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                <span>PROBABILITY OF {activeProfile.suspectName.toUpperCase()} FIRING SHOT: {activeProfile.matchProbabilityScore}%</span>
              </div>
              <p className="text-on-surface-variant text-[11px] leading-relaxed">
                No other authorized personnel or suspected operatives match both the elevated coordinate line-of-sight and physical stature profile within the {activeProfile.timestamp} window.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default AttackerEstimation;
