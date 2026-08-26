import React, { useState, useMemo } from 'react';
import {
  CoOccurrenceEvent,
  MasterCellTower,
  CDRRecord,
} from '../../types/telecom';
import {
  Radio,
  Clock,
  MapPin,
  Compass,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Send,
  Zap,
} from 'lucide-react';
import { syncToDossier } from '../../services/telecomService';

interface CellTowerTimelineProps {
  caseId: string;
  coOccurrences: CoOccurrenceEvent[];
  records: CDRRecord[];
  cellTowers: MasterCellTower[];
  timeWindowMinutes: number;
  onTimeWindowChange: (window: number) => void;
  onRefresh?: () => void;
}

export const CellTowerTimeline: React.FC<CellTowerTimelineProps> = ({
  caseId,
  coOccurrences,
  records,
  cellTowers,
  timeWindowMinutes,
  onTimeWindowChange,
  onRefresh,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<CoOccurrenceEvent | null>(
    coOccurrences.length > 0 ? coOccurrences[0] : null
  );
  const [syncedEventIds, setSyncedEventIds] = useState<Set<string>>(new Set());
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Group records by tower to compute density
  const towerStats = useMemo(() => {
    const counts: Record<string, number> = {};
    const suspectsAtTower: Record<string, Set<string>> = {};

    records.forEach(r => {
      if (r.cellTowerId) {
        counts[r.cellTowerId] = (counts[r.cellTowerId] || 0) + 1;
        if (!suspectsAtTower[r.cellTowerId]) suspectsAtTower[r.cellTowerId] = new Set();
        suspectsAtTower[r.cellTowerId].add(r.callingNumber);
      }
    });

    return { counts, suspectsAtTower };
  }, [records]);

  const handleSyncToTimeline = async (event: CoOccurrenceEvent) => {
    setSyncingId(event.id);
    try {
      await syncToDossier(caseId, {
        title: `Spatial-Temporal Co-presence: ${event.phoneA} & ${event.phoneB}`,
        description: `Physical co-location confirmed at ${event.locationName} (Tower: ${event.cellTowerId}) within ${event.timeDeltaMinutes} minutes. Potential tactical rendezvous.`,
        category: 'NETWORK',
        timestamp: event.timestampA,
        confidence: 96.0,
      });
      setSyncedEventIds(prev => new Set(prev).add(event.id));
    } catch (err) {
      console.error('Failed to sync to timeline:', err);
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="space-y-6 text-zinc-100 font-mono">
      {/* Top Banner & Window Controller */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
              Spatial-Temporal Co-Presence & Tower Movement
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/60 font-bold">
                {coOccurrences.length} CO-PRESENCE INCIDENTS DETECTED
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Correlates multiple target numbers connecting to the same cell sector antenna within sliding time delta.
            </p>
          </div>
        </div>

        {/* Sliding Window Threshold Controller */}
        <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-zinc-400">Co-location Window:</span>
          <div className="flex items-center gap-1.5">
            {[5, 10, 15, 30, 60].map(mins => (
              <button
                key={mins}
                type="button"
                onClick={() => onTimeWindowChange(mins)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  timeWindowMinutes === mins
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Co-presence Alert Cards, Right = Tower Sector Radar & Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Co-Presence Incident List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" /> Synchronized Rendezvous Events
            </span>
            <span>Sorted by Incident Time</span>
          </div>

          {coOccurrences.length === 0 ? (
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-8 text-center text-zinc-500 text-xs">
              No co-presence incidents found within the selected {timeWindowMinutes}-minute sliding window.
            </div>
          ) : (
            <div className="space-y-3 max-h-[640px] overflow-y-auto custom-scrollbar pr-1">
              {coOccurrences.map((evt) => {
                const isSelected = selectedEvent?.id === evt.id;
                const isSynced = syncedEventIds.has(evt.id);

                return (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'bg-zinc-900 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                        : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/50'
                    }`}
                  >
                    {/* Severity Indicator Stripe */}
                    <div
                      className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                        evt.riskSeverity === 'CRITICAL'
                          ? 'bg-red-500 shadow-[0_0_10px_#ef4444]'
                          : evt.riskSeverity === 'HIGH'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                    />

                    <div className="flex items-start justify-between gap-3 pl-2">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                              evt.riskSeverity === 'CRITICAL'
                                ? 'bg-red-950 text-red-400 border-red-800'
                                : evt.riskSeverity === 'HIGH'
                                ? 'bg-amber-950 text-amber-400 border-amber-800'
                                : 'bg-blue-950 text-blue-400 border-blue-800'
                            }`}
                          >
                            {evt.riskSeverity} ALERT (Δ {evt.timeDeltaMinutes} MIN)
                          </span>
                          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            {new Date(evt.timestampA).toLocaleTimeString()} - {new Date(evt.timestampB).toLocaleTimeString()}
                          </span>
                        </div>

                        {/* Location / Cell Tower */}
                        <div className="flex items-center gap-2 text-xs text-zinc-200 font-bold">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{evt.locationName}</span>
                          <span className="text-zinc-500 text-[10px]">[{evt.cellTowerId}]</span>
                        </div>

                        {/* Involved Suspects */}
                        <div className="flex items-center gap-2 text-xs pt-1 text-zinc-300">
                          <div className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-emerald-400 font-semibold">{evt.suspectAName || evt.phoneA}</span>
                          </div>
                          <span className="text-zinc-600 font-bold">↔</span>
                          <div className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-cyan-400" />
                            <span className="text-cyan-400 font-semibold">{evt.suspectBName || evt.phoneB}</span>
                          </div>
                        </div>
                      </div>

                      {/* Sync to Dossier Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSyncToTimeline(evt);
                        }}
                        disabled={isSynced || syncingId === evt.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                          isSynced
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 cursor-default'
                            : 'bg-zinc-900 hover:bg-emerald-600 hover:text-zinc-950 text-zinc-300 border border-zinc-700'
                        }`}
                      >
                        {isSynced ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Synced
                          </>
                        ) : syncingId === evt.id ? (
                          'Syncing...'
                        ) : (
                          <>
                            <Send className="w-3 h-3" /> Push to Dossier
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Tower Radar Inspector & Master Towers List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Selected Event Tactical Detail */}
          {selectedEvent ? (
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Compass className="w-4 h-4" /> Sector Antenna Geometry
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                  {selectedEvent.cellTowerId}
                </span>
              </div>

              {/* Antenna Radar Compass Visualizer */}
              <div className="relative w-44 h-44 mx-auto my-2 rounded-full border-2 border-dashed border-emerald-500/30 flex items-center justify-center bg-zinc-950/80 shadow-[inset_0_0_30px_rgba(16,185,129,0.1)]">
                {/* Concentric distance rings */}
                <div className="w-28 h-28 rounded-full border border-emerald-500/20 absolute" />
                <div className="w-16 h-16 rounded-full border border-emerald-500/20 absolute" />

                {/* Radar Sweep Needle */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent absolute transform rotate-45 animate-pulse" />

                {/* Sector Cone Highlight */}
                <div
                  className="w-16 h-16 bg-emerald-500/20 rounded-full blur-md absolute"
                  style={{ transform: 'translate(10px, -15px)' }}
                />

                {/* Tower Center Pin */}
                <div className="z-10 w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
                </div>

                <span className="absolute top-2 text-[9px] text-zinc-500">NORTH (0°)</span>
                <span className="absolute right-2 text-[9px] text-zinc-500">EAST (90°)</span>
                <span className="absolute bottom-2 text-[9px] text-zinc-500">SOUTH (180°)</span>
                <span className="absolute left-2 text-[9px] text-zinc-500">WEST (270°)</span>
              </div>

              {/* Sector Telemetry Attributes */}
              <div className="space-y-2 text-xs bg-zinc-950/70 p-3.5 rounded-lg border border-zinc-800">
                <div className="flex justify-between text-zinc-400">
                  <span>Location:</span>
                  <span className="text-zinc-200 font-bold">{selectedEvent.locationName}</span>
                </div>
                {selectedEvent.latitude && selectedEvent.longitude && (
                  <div className="flex justify-between text-zinc-400">
                    <span>GPS Coordinates:</span>
                    <span className="text-emerald-400 font-bold">{selectedEvent.latitude.toFixed(4)}, {selectedEvent.longitude.toFixed(4)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400">
                  <span>Delta Delay:</span>
                  <span className="text-amber-400 font-bold">{selectedEvent.timeDeltaMinutes} minutes apart</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Call Types:</span>
                  <span className="text-zinc-200">{selectedEvent.callTypeA} / {selectedEvent.callTypeB}</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Master Cell Towers Registry */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" /> Active Cell Tower Sectors
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {cellTowers.map(tower => {
                const count = towerStats.counts[tower.towerId] || 0;
                const uniqueTargets = towerStats.suspectsAtTower[tower.towerId]?.size || 0;

                return (
                  <div
                    key={tower.towerId}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/60 border border-zinc-800 text-[11px]"
                  >
                    <div>
                      <span className="font-semibold text-zinc-200 block">{tower.locationName}</span>
                      <span className="text-zinc-500 text-[10px]">{tower.towerId} ({tower.operator})</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-emerald-400 font-bold">{count} pings</span>
                      <span className="text-zinc-500 block text-[10px]">{uniqueTargets} targets</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
