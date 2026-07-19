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
  ShieldAlert,
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useSuraagStore } from '../store/useSuraagStore';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { Scene3DCanvas } from '../components/reconstruction/Scene3DCanvas';

export const CrimeScene3D: React.FC = () => {
  const { selectedCaseId, simulation, setSimulationState, togglePlayback, resetPlayback } = useSuraagStore();
  const [selectedObjectInfo, setSelectedObjectInfo] = useState<{
    id: string;
    label: string;
    details: string;
  } | null>({
    id: 'ATTACKER_NODE',
    label: 'Attacker Estimated Coordinate',
    details: '[X: -2.4m, Y: 1.7m, Z: 3.1m] Elev: +1.7m above floor plane. Suppressed 9mm discharge point.',
  });

  const { data: reconData } = useQuery({
    queryKey: ['reconstruction', selectedCaseId],
    queryFn: () => apiClient.reconstruction.getByCaseId(selectedCaseId),
  });

  const handleSelectObject = (id: string, label: string, details: string) => {
    setSelectedObjectInfo({ id, label, details });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Lighting/Camera Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              THREE.JS / FIBER BALLISTIC & SPATTER RECONSTRUCTION
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            3D Crime Scene & Physics Simulation Lab
          </h1>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center gap-3">
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

          {/* Multi-Spectral Lighting Toggle */}
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

          {/* Toggles: Grid and Visibility Cone */}
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

          <button
            onClick={() => setSimulationState({ showVisibilityCone: !simulation.showVisibilityCone })}
            className={`px-3 py-1.5 rounded font-tactical-data text-xs uppercase flex items-center gap-1.5 transition-all border ${
              simulation.showVisibilityCone
                ? 'bg-primary text-on-primary border-primary font-bold shadow-[0_0_12px_rgba(255,84,76,0.3)]'
                : 'bg-surface-container text-on-surface-variant border-outline-variant'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Occlusion Ray ({simulation.showVisibilityCone ? 'ACTIVE' : 'OFF'})</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 3D Canvas + Right Panel Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Columns: 3D Canvas + Bottom Playback Scrubber */}
        <div className="lg:col-span-3 space-y-4">
          <div className="h-[580px] w-full relative">
            <Scene3DCanvas simulationState={simulation} onSelectObject={handleSelectObject} />

            {/* Floating HUD overlay inside 3D Canvas */}
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-4 py-3 rounded-lg border border-primary/50 pointer-events-none space-y-1 z-10 shadow-[0_0_20px_rgba(0,0,0,0.8)] font-tactical-data text-xs">
              <div className="flex items-center justify-between gap-4 text-primary font-bold">
                <span>SIMULATION PRESET: {simulation.cameraPreset}</span>
                <span className="animate-pulse">● LIVE MATH ENGINE</span>
              </div>
              <div className="text-[11px] text-on-surface-variant/90 space-y-0.5">
                <div>ATTACKER VECTOR: [-2.4m, 1.7m, 3.1m]</div>
                <div>IMPACT VECTOR: [1.8m, 1.2m, 0.5m] (Angle: 34.2°)</div>
                <div>OCCLUSION OBSTACLE: Server Rack #4 (100% block)</div>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded border border-outline-variant/40 pointer-events-none font-tactical-data text-[11px] text-on-surface-variant">
              <span>ORBIT CONTROLS: Left Click + Drag to Rotate // Scroll to Zoom</span>
            </div>
          </div>

          {/* Chronological Timeline Ballistic Scrubber */}
          <GlassCard className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-outline-variant/60">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlayback}
                className="px-5 py-2 rounded bg-primary text-on-primary hover:bg-surface-tint font-tactical-data text-xs font-bold uppercase transition-all shadow-[0_0_15px_rgba(255,84,76,0.35)] flex items-center gap-2"
              >
                {simulation.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{simulation.isPlaying ? 'Pause Ballistic Flight' : 'Simulate Trajectory'}</span>
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
              <span className="text-xs font-tactical-data text-on-surface-variant">0 ms</span>
              <input
                type="range"
                min="0"
                max="100"
                value={simulation.currentTime % 100}
                onChange={(e) => setSimulationState({ currentTime: parseInt(e.target.value, 10) })}
                className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
              />
              <span className="text-xs font-tactical-data text-primary font-bold">12 ms (Impact)</span>
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
                    SELECTED NODE
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
                    BALLISTIC CALCULATIONS
                  </span>
                  <div className="flex justify-between p-2 rounded bg-surface-container border border-outline-variant/30">
                    <span className="text-on-surface-variant">Impact Velocity:</span>
                    <span className="text-on-surface font-bold">340 m/s (Subsonic)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-surface-container border border-outline-variant/30">
                    <span className="text-on-surface-variant">Kinetic Energy:</span>
                    <span className="text-on-surface font-bold">485 Joules</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-surface-container border border-outline-variant/30">
                    <span className="text-on-surface-variant">Ricochet Vector:</span>
                    <span className="text-primary font-bold">Azimuth 12.4° East</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center font-tactical-data text-xs text-on-surface-variant">
                <span>Click any 3D node or trajectory ray inside the canvas to inspect mathematical vectors.</span>
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
              { id: 'SCEN-A', name: 'Insider-Assisted Ambush', probability: 78.4, evidenceCount: 18 },
              { id: 'SCEN-B', name: 'External Cyber-Kinetic Assault', probability: 18.1, evidenceCount: 6 },
              { id: 'SCEN-C', name: 'Accidental Containment Failure', probability: 3.5, evidenceCount: 2 },
            ]).map((scen, idx) => (
              <div key={idx} className="p-3 rounded bg-surface-container border border-outline-variant/40 space-y-1.5">
                <div className="flex items-center justify-between font-tactical-data text-xs">
                  <span className="font-bold text-on-surface truncate max-w-[150px]">{scen.name}</span>
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
