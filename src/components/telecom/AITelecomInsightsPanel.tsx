import React, { useState } from 'react';
import {
  AITelecomInsightsResponse,
  TelecomAnomaly,
} from '../../types/telecom';
import {
  Sparkles,
  Bot,
  ShieldAlert,
  AlertTriangle,
  Flame,
  Radio,
  Clock,
  PhoneCall,
  CheckCircle2,
  Send,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import { syncToDossier } from '../../services/telecomService';

interface AITelecomInsightsPanelProps {
  caseId: string;
  insights: AITelecomInsightsResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

export const AITelecomInsightsPanel: React.FC<AITelecomInsightsPanelProps> = ({
  caseId,
  insights,
  loading,
  onRefresh,
}) => {
  const [syncedMap, setSyncedMap] = useState<Record<number, boolean>>({});
  const [syncingIndex, setSyncingIndex] = useState<number | null>(null);

  const handleSyncAnomaly = async (anomaly: TelecomAnomaly, idx: number) => {
    setSyncingIndex(idx);
    try {
      await syncToDossier(caseId, {
        title: `AI Telecom Anomaly: ${anomaly.title}`,
        description: `${anomaly.description} [Confidence: ${anomaly.confidence}%]`,
        category: 'NETWORK',
        timestamp: new Date().toISOString(),
        confidence: anomaly.confidence,
      });
      setSyncedMap(prev => ({ ...prev, [idx]: true }));
    } catch (err) {
      console.error('Failed to sync anomaly:', err);
    } finally {
      setSyncingIndex(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-12 text-center text-zinc-400 font-mono text-xs space-y-3">
        <Sparkles className="w-8 h-8 animate-spin mx-auto text-emerald-400" />
        <p className="text-zinc-200 font-bold">
          Gemini 1.5 Forensic Neural Engine analyzing telecommunication vectors...
        </p>
        <p className="text-zinc-500 text-[11px]">
          Correlating burner phone lifespans, post-crime communication silences, and co-location meetings.
        </p>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500 font-mono text-xs">
        No telecommunication telemetry loaded for analysis.
      </div>
    );
  }

  const getCategoryIcon = (cat: TelecomAnomaly['category']) => {
    switch (cat) {
      case 'BURNER_PHONE':
        return <PhoneCall className="w-4 h-4 text-amber-400" />;
      case 'CO_PRESENCE':
        return <Radio className="w-4 h-4 text-red-400" />;
      case 'RADIO_SILENCE':
        return <Clock className="w-4 h-4 text-purple-400" />;
      case 'MIDNIGHT_SPIKE':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'BRIDGE_NODE':
        return <AlertTriangle className="w-4 h-4 text-emerald-400" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-6 font-mono text-zinc-100">
      {/* AI Engine Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900/90 to-zinc-950 border border-emerald-500/30 rounded-xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-500/20 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                Gemini 1.5 Forensic Telecom Intelligence
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  REAL-TIME ANOMALY DETECTOR
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Automated heuristic & LLM behavioral reconstruction of conspiracy communication channels.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs flex items-center gap-2 border border-zinc-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Re-Analyze Data
          </button>
        </div>

        {/* Executive Summary */}
        <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 p-4 rounded-lg border border-zinc-800/80">
          {insights.summary}
        </p>
      </div>

      {/* Critical Anomalies Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Detected Forensic Anomalies ({insights.criticalAnomalies.length})
          </h3>
          <span className="text-[11px] text-zinc-500">
            Validated against Crime Noir baseline thresholds
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.criticalAnomalies.map((anomaly, idx) => {
            const isSynced = syncedMap[idx];
            const isSyncing = syncingIndex === idx;

            return (
              <div
                key={idx}
                className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 space-y-3 relative overflow-hidden backdrop-blur-xl group transition-all"
              >
                {/* Severity Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-zinc-950 border border-zinc-800">
                      {getCategoryIcon(anomaly.category)}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        anomaly.severity === 'CRITICAL'
                          ? 'bg-red-950 text-red-400 border-red-800'
                          : 'bg-amber-950 text-amber-400 border-amber-800'
                      }`}
                    >
                      {anomaly.severity}
                    </span>
                  </div>

                  <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
                    {anomaly.confidence}% Confidence
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className="text-xs font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                    {anomaly.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    {anomaly.description}
                  </p>
                </div>

                {/* Involved Entities */}
                {anomaly.involvedEntities && anomaly.involvedEntities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {anomaly.involvedEntities.map((ent, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-zinc-950 text-cyan-400 border border-cyan-900 font-mono"
                      >
                        {ent}
                      </span>
                    ))}
                  </div>
                )}

                {/* Sync Action */}
                <div className="pt-2 border-t border-zinc-800/60 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSyncAnomaly(anomaly, idx)}
                    disabled={isSynced || isSyncing}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSynced
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 cursor-default'
                        : 'bg-zinc-950 hover:bg-emerald-600 hover:text-zinc-950 text-zinc-300 border border-zinc-700 shadow-sm'
                    }`}
                  >
                    {isSynced ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Synced to Timeline
                      </>
                    ) : isSyncing ? (
                      'Syncing...'
                    ) : (
                      <>
                        <Send className="w-3 h-3" /> Sync to Case Dossier
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tactical Forensic Recommendations */}
      {insights.tacticalRecommendations && insights.tacticalRecommendations.length > 0 && (
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-zinc-800 pb-2.5">
            <FileCheck className="w-4 h-4" /> Recommended Investigatory Steps (CrPC & Telecom Directives)
          </div>
          <div className="space-y-2">
            {insights.tacticalRecommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 text-xs text-zinc-300 bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/60"
              >
                <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
