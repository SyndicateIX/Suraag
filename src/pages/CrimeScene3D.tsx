import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Crosshair,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Ruler,
  Sun,
  Camera,
  Layers,
  Compass,
  FileText,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  Radio,
  MapPin,
  Clock,
  Sparkles,
  Video
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useSuraagStore } from '../store/useSuraagStore';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { Scene3DCanvas } from '../components/reconstruction/Scene3DCanvas';
import { InvestigationScene, CinematicCameraMode } from '../types';

export const CrimeScene3D: React.FC = () => {
  const { selectedCaseId, simulation, setSimulationState, togglePlayback, resetPlayback } = useSuraagStore();
  const [activeStageIndex, setActiveStageIndex] = useState<number>(5); // Default Stage 5 (Lohegaon Hill Homicide)
  const [cinematicMode, setCinematicMode] = useState<CinematicCameraMode>('FREE_ORBIT');

  // Selected 3D Node
  const [selectedObjectInfo, setSelectedObjectInfo] = useState<{
    id: string;
    label: string;
    details: string;
  } | null>({
    id: 'CHETANY',
    label: 'Chetany Sharma (Sniper / Co-Conspirator)',
    details: 'Discharging suppressed Remington 700 sniper rifle from boulder ridge. Animation State: AIM // Scapular entry vector.',
  });

  // Fetch live reconstruction dataset
  const { data: reconData } = useQuery({
    queryKey: ['reconstruction', selectedCaseId],
    queryFn: () => apiClient.reconstruction.getByCaseId(selectedCaseId),
  });

  const scenes: InvestigationScene[] = reconData?.scenes || [];
  const currentScene = scenes.find((s) => s.stageIndex === activeStageIndex) || scenes[scenes.length - 1];

  const handleSelectObject = (id: string, label: string, details: string) => {
    setSelectedObjectInfo({ id, label, details });
  };

  const handleStageChange = (newIndex: number) => {
    if (newIndex >= 1 && newIndex <= 5) {
      setActiveStageIndex(newIndex);
      const targetScene = scenes.find((s) => s.stageIndex === newIndex);
      if (targetScene && targetScene.objects.length > 0) {
        const firstObj = targetScene.objects[0];
        setSelectedObjectInfo({ id: firstObj.id, label: firstObj.label, details: firstObj.details });
      }
    }
  };

  // Trajectory metrics
  const bulletVel = reconData?.physicsResults?.bulletTrajectory?.velocityMps || 340;
  const bulletCaliber = reconData?.physicsResults?.bulletTrajectory?.caliber || '7.62mm Suppressed Sniper Discharge';
  const bulletEnergy = reconData?.physicsResults?.bulletTrajectory?.kineticEnergyJoules || 2450;
  const attackDirection = reconData?.attackDirection || 'Azimuth 38° East, Elevation -14° Downward';

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              FULLY ANIMATED FORENSIC REPLAY ENGINE // PROCEDURAL HUMANOID RIGS
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            3D Crime Scene & Physics Simulation Lab
          </h1>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Cinematic Replay Mode Selector */}
          <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded border border-primary/60 shadow-[0_0_12px_rgba(255,84,76,0.25)]">
            <Video className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-tactical-data uppercase text-on-surface-variant">Replay Mode:</span>
            <select
              value={cinematicMode}
              onChange={(e) => setCinematicMode(e.target.value as CinematicCameraMode)}
              className="bg-transparent font-tactical-data text-xs text-primary font-bold focus:outline-none cursor-pointer"
            >
              <option value="FREE_ORBIT" className="bg-surface">Free Orbit Controls</option>
              <option value="CINEMATIC_ORBIT" className="bg-surface">Cinematic 360° Slow Orbit</option>
              <option value="SLOW_MOTION_BALLISTIC" className="bg-surface">Slow-Motion Ballistic Tracking</option>
            </select>
          </div>

          {/* Camera Presets Selector */}
          <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded border border-outline-variant/50">
            <Camera className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-tactical-data uppercase text-on-surface-variant">Camera:</span>
            <select
              value={simulation.cameraPreset}
              onChange={(e) => setSimulationState({ cameraPreset: e.target.value as any })}
              className="bg-transparent font-tactical-data text-xs text-primary font-bold focus:outline-none cursor-pointer"
            >
              <option value="ISOMETRIC" className="bg-surface">Isometric Perspective</option>
              <option value="TOP" className="bg-surface">Top-Down Blueprint View</option>
              <option value="FRONT" className="bg-surface">Front Door Elevation</option>
              <option value="BULLET_CAM" className="bg-surface">Bullet Trajectory Cam</option>
            </select>
          </div>

          {/* Spectrum Selector */}
          <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded border border-outline-variant/50">
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-tactical-data uppercase text-on-surface-variant">Spectrum:</span>
            <select
              value={simulation.lightingMode}
              onChange={(e) => setSimulationState({ lightingMode: e.target.value as any })}
              className="bg-transparent font-tactical-data text-xs text-on-surface font-bold focus:outline-none cursor-pointer"
            >
              <option value="NORMAL" className="bg-surface">Normal (Standard White)</option>
              <option value="UV" className="bg-surface">UV Blacklight (Blood Luminescence)</option>
              <option value="INFRARED" className="bg-surface">Infrared (Thermal Vectors)</option>
              <option value="WIREFRAME" className="bg-surface">Wireframe Geometry</option>
            </select>
          </div>

          {/* Grid Toggle */}
          <button
            onClick={() => setSimulationState({ showMeasurements: !simulation.showMeasurements })}
            className={`px-3 py-1.5 rounded font-tactical-data text-xs uppercase flex items-center gap-1.5 transition-all border ${
              simulation.showMeasurements
                ? 'bg-secondary-container text-primary border-primary font-bold'
                : 'bg-surface-container text-on-surface-variant border-outline-variant'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>Grid ({simulation.showMeasurements ? 'ON' : 'OFF'})</span>
          </button>
        </div>
      </div>

      {/* Investigation Stage Switcher Step Bar */}
      <GlassCard className="p-4 space-y-3">
        <div className="flex items-center justify-between font-tactical-data text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-on-surface font-bold uppercase tracking-wider">
              ANIMATED FORENSIC REPLAY SEQUENCER ("THE DOOMED TRIANGLE"):
            </span>
          </div>
          <span className="text-primary font-bold">
            STAGE {activeStageIndex} OF 5 // {currentScene?.timestamp}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 font-tactical-data text-xs">
          {[
            { idx: 1, title: 'Stage 1 – Restaurant', date: 'Apr 14 (Poison)' },
            { idx: 2, title: 'Stage 2 – Resort Attack', date: 'May 13 (Knife)' },
            { idx: 3, title: 'Stage 3 – Kharadi Hit', date: 'Jun 10 (Vehicle)' },
            { idx: 4, title: 'Stage 4 – Café Planning', date: 'Jun 19 (Logistics)' },
            { idx: 5, title: 'Stage 5 – Lohegaon Cliff', date: 'Jun 21 (Homicide)' },
          ].map((s) => (
            <button
              key={s.idx}
              onClick={() => handleStageChange(s.idx)}
              className={`p-2.5 rounded border transition-all text-left ${
                activeStageIndex === s.idx
                  ? 'bg-primary text-on-primary border-primary font-bold shadow-[0_0_15px_rgba(255,84,76,0.35)]'
                  : 'bg-surface-container text-on-surface-variant border-outline-variant hover:text-on-surface'
              }`}
            >
              <div className="text-[10px] uppercase opacity-80">Stage {s.idx}</div>
              <div className="font-bold text-xs truncate">{s.title.split('–')[1] || s.title}</div>
              <div className="text-[9px] opacity-90 mt-0.5">{s.date}</div>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Main Grid: 3D Canvas + Right Panel Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Columns: 3D Canvas + Bottom Playback Scrubber */}
        <div className="lg:col-span-3 space-y-4">
          <div className="h-[580px] w-full relative">
            <Scene3DCanvas
              simulationState={simulation}
              reconData={reconData}
              activeStageIndex={activeStageIndex}
              cinematicMode={cinematicMode}
              onSelectObject={handleSelectObject}
            />

            {/* Floating HUD overlay inside 3D Canvas */}
            <div className="absolute top-4 left-4 bg-black/85 backdrop-blur-md px-4 py-3 rounded-lg border border-primary/50 pointer-events-none space-y-1 z-10 shadow-[0_0_20px_rgba(0,0,0,0.8)] font-tactical-data text-xs max-w-[340px]">
              <div className="flex items-center justify-between gap-4 text-primary font-bold">
                <span>STAGE {activeStageIndex}: {currentScene?.locationName}</span>
                <span className="animate-pulse">● PROCEDURAL RIGS ACTIVE</span>
              </div>
              <div className="text-[11px] text-on-surface-variant/90 space-y-0.5">
                <div>TIMESTAMP: {currentScene?.timestamp}</div>
                <div>REPLAY MODE: {cinematicMode}</div>
                <div>KINEMATICS: Waypoint pathfinding & animation blending active</div>
              </div>
            </div>

            {/* Telemetry Overlays Box */}
            {currentScene?.overlays && currentScene.overlays.length > 0 && (
              <div className="absolute top-4 right-4 bg-black/85 backdrop-blur-md px-3.5 py-2.5 rounded-lg border border-emerald-500/50 pointer-events-none z-10 font-tactical-data text-xs space-y-1.5 max-w-[280px]">
                <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-400" />
                  FORENSIC TELEMETRY OVERLAY:
                </span>
                {currentScene.overlays.map((ov, oIdx) => (
                  <div key={oIdx} className="text-[10px] text-on-surface border-t border-outline-variant/30 pt-1">
                    <strong className="text-emerald-400">{ov.timestamp} [{ov.type}]:</strong> {ov.title}
                  </div>
                ))}
              </div>
            )}

            <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded border border-outline-variant/40 pointer-events-none font-tactical-data text-[11px] text-on-surface-variant">
              <span>ORBIT CONTROLS: Left Click + Drag to Rotate // Scroll to Zoom</span>
            </div>
          </div>

          {/* Chronological Timeline Ballistic & Motion Scrubber */}
          <GlassCard className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-outline-variant/60">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStageChange(activeStageIndex - 1)}
                disabled={activeStageIndex <= 1}
                className="p-2 rounded bg-surface-container hover:bg-secondary-container text-on-surface-variant hover:text-primary transition-all border border-outline-variant disabled:opacity-40"
                title="Previous Stage"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlayback}
                className="px-5 py-2 rounded bg-primary text-on-primary hover:bg-surface-tint font-tactical-data text-xs font-bold uppercase transition-all shadow-[0_0_15px_rgba(255,84,76,0.35)] flex items-center gap-2"
              >
                {simulation.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{simulation.isPlaying ? 'Pause Replay' : 'Play Kinematic Replay'}</span>
              </button>

              <button
                onClick={() => handleStageChange(activeStageIndex + 1)}
                disabled={activeStageIndex >= 5}
                className="p-2 rounded bg-surface-container hover:bg-secondary-container text-on-surface-variant hover:text-primary transition-all border border-outline-variant disabled:opacity-40"
                title="Next Stage"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={resetPlayback}
                className="p-2 rounded bg-surface-container hover:bg-secondary-container text-on-surface-variant hover:text-primary transition-all border border-outline-variant"
                title="Reset Simulation Time to 0"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Scrubber slider */}
            <div className="flex-1 w-full flex items-center gap-3">
              <span className="text-xs font-tactical-data text-on-surface-variant">0%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={simulation.currentTime % 100}
                onChange={(e) => setSimulationState({ currentTime: parseInt(e.target.value, 10) })}
                className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
              />
              <span className="text-xs font-tactical-data text-primary font-bold">
                {simulation.currentTime % 100}% Progress
              </span>
            </div>
          </GlassCard>
        </div>

        {/* Right 1 Column: Object Inspector & Physics Calculation Breakdown */}
        <div className="space-y-4 flex flex-col justify-between">
          <GlassCard
            className="p-5 space-y-4 flex-1 border-primary/40"
            header={
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-primary" />
                <span className="font-display-lg text-sm font-bold uppercase tracking-wider text-on-surface">
                  3D Object Inspector
                </span>
              </div>
            }
          >
            {selectedObjectInfo ? (
              <div className="space-y-4">
                <div>
                  <Badge variant="critical" pulse className="mb-2">
                    SELECTED RIG / OBJECT
                  </Badge>
                  <h3 className="font-display-lg font-bold text-lg text-primary uppercase">
                    {selectedObjectInfo.label}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-body-md mt-2 leading-relaxed bg-surface-container-low p-3 rounded border border-outline-variant/40">
                    {selectedObjectInfo.details}
                  </p>
                </div>

                <div className="pt-3 border-t border-outline-variant/30 space-y-2 font-tactical-data text-xs">
                  <span className="text-on-surface-variant text-[10px] uppercase tracking-wider block">
                    STAGE METRICS & KINEMATICS
                  </span>
                  <div className="flex justify-between p-2 rounded bg-surface-container border border-outline-variant/30">
                    <span className="text-on-surface-variant">Location:</span>
                    <span className="text-on-surface font-bold truncate max-w-[130px]">{currentScene?.locationName}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-surface-container border border-outline-variant/30">
                    <span className="text-on-surface-variant">Caliber / Velocity:</span>
                    <span className="text-on-surface font-bold">{bulletVel} m/s ({bulletCaliber})</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-surface-container border border-outline-variant/30">
                    <span className="text-on-surface-variant">Kinetic Energy:</span>
                    <span className="text-on-surface font-bold">{bulletEnergy} Joules</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-surface-container border border-outline-variant/30">
                    <span className="text-on-surface-variant">Trajectory Vector:</span>
                    <span className="text-primary font-bold">{attackDirection}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center font-tactical-data text-xs text-on-surface-variant">
                <span>Click any 3D node or character rig inside the canvas to inspect mathematical vectors.</span>
              </div>
            )}
          </GlassCard>

          {/* Bottom Card: Scenario A/B/C Probabilities */}
          <GlassCard
            className="p-5 space-y-3"
            header={
              <div className="flex items-center justify-between w-full">
                <span className="font-display-lg text-xs font-bold uppercase tracking-wider text-on-surface">
                  Probable Crime Scenarios
                </span>
                <Badge variant="confidence">BAYESIAN RANKED</Badge>
              </div>
            }
          >
            {(reconData?.scenarios || [
              { id: 'SCENARIO-A', name: 'Premeditated Multi-Attempt Conspiracy', probability: 92.4, evidenceCount: 18 },
              { id: 'SCENARIO-B', name: 'Isolated Hired Hitman Vehicular Assault', probability: 5.8, evidenceCount: 4 },
              { id: 'SCENARIO-C', name: 'Accidental Cliff Edge Slip Defense Claim', probability: 1.8, evidenceCount: 1 },
            ]).map((scen, idx) => (
              <div key={idx} className="p-3 rounded bg-surface-container border border-outline-variant/40 space-y-1.5">
                <div className="flex items-center justify-between font-tactical-data text-xs">
                  <span className="font-bold text-on-surface truncate max-w-[150px]">{scen.name || 'Scenario'}</span>
                  <span className="text-primary font-bold">{scen.probability}%</span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-500"
                    style={{ width: `${scen.probability}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-tactical-data text-on-surface-variant/80">
                  <span>ID: {scen.id}</span>
                  <span>{scen.evidenceCount} Supporting Evidence Links</span>
                </div>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
