import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Eye,
  Crosshair,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sliders,
  Sparkles,
  Shield,
  Clock,
  Play,
  RotateCcw,
  Compass,
  FileText,
  MapPin,
  Check,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { useSuraagStore } from '../store/useSuraagStore';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { RaycastProfile } from '../types';

export const LineOfSight: React.FC = () => {
  const { selectedCaseId } = useSuraagStore();

  // Ingested Investigation Report Raycast Scenarios
  const reportRaycastProfiles: RaycastProfile[] = [
    {
      id: 'RAY-REP-01',
      title: 'Olive Terrace Table 4 Ingestion FOV Audit',
      phase: 'Attempt 1 – Dinner and Deception (April 14)',
      subjectName: 'Diya Gupta & Keshan Malhotra',
      origin: { x: -5.2, y: 1.2, z: -2.1, label: 'Table 4 Corner Seat' },
      target: { x: 3.5, y: 1.1, z: 4.0, label: 'Beverage Preparation Counter' },
      horizontalFov: 60,
      verticalFov: 45,
      maxDistance: 12.0,
      visibilityScore: 12.5,
      isOccluded: true,
      primaryObstacle: 'Mahogany Booth Partition & High Staff Traffic',
      intersectDistanceMeters: 1.8,
      forensicSummary: 'Line of sight from Table 4 to kitchen pass was continuously occluded by high booth backs (1.6m height) and active waitstaff. Continuous seated presence prevented covert poison dropper insertion without detection.',
      supportingEvidenceIds: ['EVID-001', 'EVID-002', 'EVID-004'],
      linkedTimelineEventIds: ['EV-REP-01', 'EV-REP-02']
    },
    {
      id: 'RAY-REP-02',
      title: 'Skyline Resort Room 306 Eyewitness Flight Corridor',
      phase: 'Attempt 2 – Birthday Resort Knife Attack (May 13)',
      subjectName: 'Archita Deshmukh (Witness WIT-001)',
      origin: { x: -7.5, y: 1.7, z: -2.0, label: 'Room 306 Doorway (Witness Standing)' },
      target: { x: 2.0, y: 1.6, z: 8.5, label: 'Emergency Stairwell Door (Flight Path)' },
      horizontalFov: 75,
      verticalFov: 50,
      maxDistance: 25.0,
      visibilityScore: 98.2,
      isOccluded: false,
      primaryObstacle: 'None (Unobstructed Resort Carpet Corridor)',
      intersectDistanceMeters: 14.2,
      forensicSummary: 'Direct, clear line of sight along Corridor 300. Archita Deshmukh had 100% unobstructed visibility of Chetany Sharma fleeing Room 304 in a dark hoodie and dropping the tactical hunting knife (EVID-005) at 02:30 AM.',
      supportingEvidenceIds: ['EVID-005', 'EVID-006'],
      linkedTimelineEventIds: ['EV-REP-03', 'EV-REP-04']
    },
    {
      id: 'RAY-REP-03',
      title: 'Apex Tech IT Park Kharadi Truck Steering Trajectory',
      phase: 'Attempt 3 – Blood on the Streets (June 10)',
      subjectName: 'Vikram Rathod (Hitman WIT-004)',
      origin: { x: -12.0, y: 2.2, z: 6.0, label: 'Tata 407 Truck Driver Cabin' },
      target: { x: 0.0, y: 0.0, z: 0.0, label: 'Pedestrian Crosswalk Crossing Zone' },
      horizontalFov: 90,
      verticalFov: 60,
      maxDistance: 45.0,
      visibilityScore: 100.0,
      isOccluded: false,
      primaryObstacle: 'None (Clear Pedestrian Approach Corridor)',
      intersectDistanceMeters: 28.5,
      forensicSummary: 'CCTV telemetry proves driver cabin had 100% unobstructed visibility of Keshan crossing the street. Truck trajectory modeling confirms deliberate steering vector adjustment directly into pedestrian zone at 10:00 AM.',
      supportingEvidenceIds: ['EVID-010', 'EVID-011'],
      linkedTimelineEventIds: ['EV-REP-05', 'EV-REP-06']
    },
    {
      id: 'RAY-REP-04',
      title: 'Brew & Bean Café Table 4 Ambush Planning FOV',
      phase: 'Final Incident – Ambush Planning Session (June 19)',
      subjectName: 'Rohan Mehta (Café Supervisor WIT-005)',
      origin: { x: 6.0, y: 1.6, z: 4.0, label: 'Barista Service Counter' },
      target: { x: -3.0, y: 1.1, z: -1.5, label: 'Table 4 Corner (Suspects Meeting)' },
      horizontalFov: 80,
      verticalFov: 55,
      maxDistance: 15.0,
      visibilityScore: 99.1,
      isOccluded: false,
      primaryObstacle: 'None (Clear Ambient Coffee Shop Intersect)',
      intersectDistanceMeters: 7.2,
      forensicSummary: 'Supervisor Rohan Mehta had unobstructed line-of-sight view of Table 4 for over an hour. CCTV CAM-05 and order receipt EVID-014 confirm Diya & Chetany intensely studying printed topographical maps of Lohegaon Hill.',
      supportingEvidenceIds: ['EVID-014'],
      linkedTimelineEventIds: ['EV-REP-07']
    },
    {
      id: 'RAY-REP-05',
      title: 'Lohegaon Hill Cliff Sniper Ridge & Scapular Raycast',
      phase: 'Final Incident – Lohegaon Hill Cliff Ambush (June 21)',
      subjectName: 'Chetany Sharma (Sniper shooter) & Dr. Neha Patwardhan (WIT-008)',
      origin: { x: 15.0, y: 8.0, z: -40.0, label: 'Boulder Ridge Sniper Concealment' },
      target: { x: 0.0, y: 1.6, z: 0.0, label: 'Sunset Point Viewpoint (Victim Back)' },
      horizontalFov: 40,
      verticalFov: 30,
      maxDistance: 75.0,
      visibilityScore: 100.0,
      isOccluded: false,
      primaryObstacle: 'None (Clear Suppressed Ballistic Sightline Downward)',
      intersectDistanceMeters: 42.8,
      forensicSummary: 'Suppressed 7.62mm Remington Model 700 rifle trajectory. 14° downward scapular entry angle matches sniper ridge elevation (+8m) relative to victim standing at cliff edge before 45m fall.',
      supportingEvidenceIds: ['EVID-016', 'EVID-020'],
      linkedTimelineEventIds: ['EV-REP-08']
    }
  ];

  const [selectedProfileId, setSelectedProfileId] = useState<string>(reportRaycastProfiles[1].id);
  const [horizontalFov, setHorizontalFov] = useState<number>(75);
  const [verticalFov, setVerticalFov] = useState<number>(50);
  const [maxDistance, setMaxDistance] = useState<number>(25);
  const [observerHeight, setObserverHeight] = useState<number>(1.7);
  const [isAuditing, setIsAuditing] = useState(false);

  const activeProfile = reportRaycastProfiles.find(p => p.id === selectedProfileId) || reportRaycastProfiles[0];

  // Dynamic calculations based on scrubbers
  const dynamicVisibilityScore = activeProfile.isOccluded
    ? Math.max(0, Math.min(100, Math.round(activeProfile.visibilityScore * (horizontalFov / activeProfile.horizontalFov))))
    : Math.max(90, Math.min(100, Math.round(activeProfile.visibilityScore)));

  const handleSelectProfile = (profile: RaycastProfile) => {
    setSelectedProfileId(profile.id);
    setHorizontalFov(profile.horizontalFov);
    setVerticalFov(profile.verticalFov);
    setMaxDistance(profile.maxDistance);
  };

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              AUTOMATED CHRONOLOGICAL REPORT & 3D RAYCASTING VISIBILITY AUDIT ENGINE
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            3D Raycasting & Line-of-Sight Analysis
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={activeProfile.isOccluded ? 'critical' : 'active'} pulse>
            {activeProfile.isOccluded ? 'OCCLUSION DETECTED' : '100% CLEAR LINE-OF-SIGHT'}
          </Badge>
          <button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="px-5 py-2.5 rounded bg-primary text-on-primary hover:bg-surface-tint font-tactical-data text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(255,84,76,0.35)] flex items-center gap-2 disabled:opacity-50"
          >
            <Play className={`w-4 h-4 fill-current ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'CALCULATING RAY VECTORS...' : 'RE-CALCULATE 3D RAYCAST'}</span>
          </button>
        </div>
      </div>

      {/* Investigation Dossier Ingestion Overview Banner */}
      <GlassCard glow className="p-4 border-l-4 border-l-primary bg-secondary-container/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-primary/20 border border-primary shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-tactical-data text-xs font-bold uppercase text-primary tracking-wider">
                  REPORT DOSSIER RAYCASTING FUSION ACTIVE
                </span>
                <Badge variant="active">5 SCENARIO PROFILES INGESTED</Badge>
              </div>
              <p className="text-xs text-on-surface-variant font-body-md mt-0.5">
                Correlated witness standing locations, CCTV camera optical axes, vehicle trajectory vectors, and sniper elevation raycasts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-tactical-data">
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">ACTIVE PROFILES</span>
              <strong className="text-primary font-bold text-sm">5 SCENARIOS</strong>
            </div>
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">UNOBSTRUCTED VECTORS</span>
              <strong className="text-emerald-400 font-bold text-sm">4 VECTORS</strong>
            </div>
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">STRUCTURAL BLOCKS</span>
              <strong className="text-primary font-bold text-sm">1 OBSTACLE</strong>
            </div>
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">MAX RAYCAST RANGE</span>
              <strong className="text-emerald-400 font-bold text-sm">75 METERS</strong>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Scenario Profile Selection Tabs */}
      <GlassCard className="p-4 space-y-3">
        <span className="text-on-surface-variant font-tactical-data font-bold text-xs uppercase tracking-wider block flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-primary" />
          SELECT INVESTIGATION REPORT RAYCAST SCENARIO PROFILE:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 font-tactical-data text-xs">
          {reportRaycastProfiles.map((profile) => {
            const isSelected = profile.id === selectedProfileId;
            return (
              <button
                key={profile.id}
                onClick={() => handleSelectProfile(profile)}
                className={`p-3 rounded-lg text-left transition-all border flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-secondary-container/80 text-on-surface border-primary font-bold shadow-[0_0_15px_rgba(255,84,76,0.3)]'
                    : 'bg-surface-container-low text-on-surface-variant border-outline-variant/50 hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase text-primary font-bold">{profile.phase.split('–')[0]}</span>
                  <Badge variant={profile.isOccluded ? 'critical' : 'active'} className="text-[9px] px-1.5 py-0">
                    {profile.isOccluded ? 'OCCLUDED' : 'CLEAR'}
                  </Badge>
                </div>
                <div className="text-xs font-semibold line-clamp-2 leading-snug">{profile.title}</div>
                <div className="text-[10px] text-on-surface-variant/80 truncate">Subject: {profile.subjectName}</div>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Main Grid: Active Raycast Profile Breakdown + FOV Scrubbers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Detailed Raycast Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard glow className="p-6 border-primary/70 space-y-6">
            {/* Header: Title, Subject, Visibility Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/30">
              <div className="space-y-1">
                <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest block">
                  {activeProfile.phase}
                </span>
                <h2 className="font-display-lg text-2xl font-bold uppercase text-on-surface">
                  {activeProfile.title}
                </h2>
                <span className="text-xs text-on-surface-variant font-body-md block">
                  Subject / Witness: <strong>{activeProfile.subjectName}</strong>
                </span>
              </div>

              <div className="p-4 rounded-lg bg-surface-container border border-outline-variant shrink-0 text-center font-tactical-data">
                <span className="text-[10px] uppercase text-on-surface-variant block">VISIBILITY SCORE</span>
                <strong className={`text-2xl font-bold ${activeProfile.isOccluded ? 'text-primary' : 'text-emerald-400'}`}>
                  {dynamicVisibilityScore}%
                </strong>
                <span className="text-[10px] block text-on-surface-variant/80 mt-0.5">
                  {activeProfile.isOccluded ? 'OCCLUSION INTERSECT' : 'DIRECT LINE-OF-SIGHT'}
                </span>
              </div>
            </div>

            {/* Vector Coordinates Grid: Origin vs Target */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-tactical-data">
              {/* Ray Origin */}
              <div className="p-4 rounded bg-surface-container-low border border-outline-variant/40 space-y-2">
                <span className="text-[10px] uppercase text-primary font-bold block flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-primary" />
                  RAYCAST ORIGIN COORDINATE [X, Y, Z]
                </span>
                <div className="text-sm font-bold text-on-surface font-mono">
                  [{activeProfile.origin.x}m, {activeProfile.origin.y}m, {activeProfile.origin.z}m]
                </div>
                <div className="text-xs text-on-surface-variant italic">{activeProfile.origin.label}</div>
              </div>

              {/* Ray Target */}
              <div className="p-4 rounded bg-surface-container-low border border-outline-variant/40 space-y-2">
                <span className="text-[10px] uppercase text-emerald-400 font-bold block flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
                  TARGET INTERSECTION VECTOR [X, Y, Z]
                </span>
                <div className="text-sm font-bold text-on-surface font-mono">
                  [{activeProfile.target.x}m, {activeProfile.target.y}m, {activeProfile.target.z}m]
                </div>
                <div className="text-xs text-on-surface-variant italic">{activeProfile.target.label}</div>
              </div>
            </div>

            {/* Occlusion Obstacle & Intersect Distance Box */}
            <div className="p-4 rounded bg-secondary-container/40 border border-primary space-y-2 font-tactical-data text-xs">
              <div className="flex items-center justify-between text-primary font-bold border-b border-outline-variant/30 pb-2">
                <span className="uppercase flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-primary" />
                  STRUCTURAL OCCLUSION ANALYSIS:
                </span>
                <span>INTERSECT DISTANCE: {activeProfile.intersectDistanceMeters}m</span>
              </div>
              <p className="text-on-surface-variant font-body-md text-xs leading-relaxed pt-1">
                <strong>Primary Obstacle:</strong> {activeProfile.primaryObstacle}
              </p>
              <p className="text-on-surface font-body-md text-xs leading-relaxed font-semibold">
                {activeProfile.forensicSummary}
              </p>
            </div>

            {/* Ingested Evidence Exhibits & Linked Timeline Events */}
            <div className="pt-2 border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-4 font-tactical-data text-xs">
              <div className="flex flex-wrap items-center gap-3">
                {activeProfile.supportingEvidenceIds && (
                  <span className="flex items-center gap-1 text-on-surface-variant">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    INGESTED EXHIBITS: <strong className="text-primary">{activeProfile.supportingEvidenceIds.join(', ')}</strong>
                  </span>
                )}
                {activeProfile.linkedTimelineEventIds && (
                  <span className="flex items-center gap-1 text-on-surface-variant ml-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    TIMELINE EVENTS: <strong className="text-emerald-400">{activeProfile.linkedTimelineEventIds.join(', ')}</strong>
                  </span>
                )}
              </div>

              <Link
                to="/reconstruction"
                className="text-primary hover:underline font-bold flex items-center gap-1 text-xs shrink-0"
              >
                <span>Launch in 3D Crime Scene Canvas</span>
                <Crosshair className="w-3.5 h-3.5" />
              </Link>
            </div>
          </GlassCard>
        </div>

        {/* Right 1 Column: Interactive FOV Visibility Cone Scrubber Controls */}
        <div className="space-y-6">
          <GlassCard className="p-5 space-y-5 border-primary/50">
            <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3">
              <Sliders className="w-4 h-4 text-primary" />
              <span className="font-display-lg text-sm font-bold uppercase tracking-wider text-on-surface">
                Visibility Cone FOV Parameters
              </span>
            </div>

            {/* Horizontal FOV Slider */}
            <div className="space-y-2 font-tactical-data text-xs">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">HORIZONTAL FOV CONE:</span>
                <strong className="text-primary font-bold">{horizontalFov}°</strong>
              </div>
              <input
                type="range"
                min="30"
                max="120"
                value={horizontalFov}
                onChange={(e) => setHorizontalFov(parseInt(e.target.value, 10))}
                className="w-full accent-primary h-1.5 bg-surface-container-high rounded cursor-pointer"
              />
              <span className="text-[10px] text-on-surface-variant/70 block">
                Standard human peripheral vision field of view.
              </span>
            </div>

            {/* Vertical FOV Slider */}
            <div className="space-y-2 font-tactical-data text-xs pt-2 border-t border-outline-variant/20">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">VERTICAL FOV ANGLE:</span>
                <strong className="text-primary font-bold">{verticalFov}°</strong>
              </div>
              <input
                type="range"
                min="20"
                max="90"
                value={verticalFov}
                onChange={(e) => setVerticalFov(parseInt(e.target.value, 10))}
                className="w-full accent-primary h-1.5 bg-surface-container-high rounded cursor-pointer"
              />
              <span className="text-[10px] text-on-surface-variant/70 block">
                Vertical pitch elevation angle cone.
              </span>
            </div>

            {/* Maximum Distance Slider */}
            <div className="space-y-2 font-tactical-data text-xs pt-2 border-t border-outline-variant/20">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">MAX RAYCAST RANGE:</span>
                <strong className="text-emerald-400 font-bold">{maxDistance}m</strong>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value, 10))}
                className="w-full accent-primary h-1.5 bg-surface-container-high rounded cursor-pointer"
              />
              <span className="text-[10px] text-on-surface-variant/70 block">
                Maximum effective raycasting vector distance.
              </span>
            </div>

            {/* Observer Eye Height Slider */}
            <div className="space-y-2 font-tactical-data text-xs pt-2 border-t border-outline-variant/20">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">OBSERVER EYE HEIGHT:</span>
                <strong className="text-emerald-400 font-bold">{observerHeight}m</strong>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.1"
                value={observerHeight}
                onChange={(e) => setObserverHeight(parseFloat(e.target.value))}
                className="w-full accent-primary h-1.5 bg-surface-container-high rounded cursor-pointer"
              />
              <span className="text-[10px] text-on-surface-variant/70 block">
                Eye-level elevation relative to floor plane.
              </span>
            </div>

            {/* Reset Controls Button */}
            <button
              onClick={() => handleSelectProfile(activeProfile)}
              className="w-full py-2 rounded bg-surface-container hover:bg-secondary-container text-on-surface-variant hover:text-primary font-tactical-data text-xs font-bold uppercase transition-all border border-outline-variant flex items-center justify-center gap-2 mt-4"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset FOV Controls to Preset</span>
            </button>
          </GlassCard>

          {/* Real-time Math Engine Audit Box */}
          <GlassCard className="p-4 bg-surface-container-high/60 space-y-2 font-tactical-data text-xs">
            <div className="flex items-center justify-between text-primary font-bold">
              <span>● MATH ENGINE RAYCAST VERDICT</span>
              <span className="text-[10px] text-emerald-400 font-normal">RAY VECTOR READY</span>
            </div>
            <p className="text-on-surface-variant text-[11px] leading-relaxed">
              Mathematical raycast projection confirms line-of-sight analysis for scenario: <strong>{activeProfile.title}</strong>.
            </p>
            <div className="pt-2 border-t border-outline-variant/30 text-[10px] text-on-surface flex justify-between">
              <span>FOV CONE VOLUME: <strong>{(horizontalFov * verticalFov * maxDistance * 0.01).toFixed(1)} m³</strong></span>
              <span>VERDICT: <strong className={activeProfile.isOccluded ? 'text-primary' : 'text-emerald-400'}>{activeProfile.isOccluded ? 'REFUTED' : 'CORROBORATED'}</strong></span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
