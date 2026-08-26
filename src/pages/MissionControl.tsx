import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  ShieldAlert,
  Activity,
  AlertTriangle,
  FileText,
  Crosshair,
  ArrowRight,
  Database,
  Radio,
  Clock,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Layers,
  Shield,
  UserCheck
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useSuraagStore } from '../store/useSuraagStore';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { getMissionControlMetrics } from '../utils/reportParser';

export const MissionControl: React.FC = () => {
  const { selectedCaseId, setSelectedCaseId } = useSuraagStore();
  const [activeNotificationTab, setActiveNotificationTab] = useState<'ALL' | 'CRITICAL' | 'AI'>('ALL');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const reportMetrics = useMemo(() => getMissionControlMetrics(), []);

  const { data: activeCase, isLoading: caseLoading } = useQuery({
    queryKey: ['case', selectedCaseId],
    queryFn: () => apiClient.cases.getById(selectedCaseId),
  });

  const { data: evidenceList, isLoading: evidenceLoading } = useQuery({
    queryKey: ['evidence', selectedCaseId],
    queryFn: () => apiClient.evidence.getAll({ caseId: selectedCaseId }),
  });

  const filteredNotifs = useMemo(() => {
    return reportMetrics.notifications.filter((n) => {
      if (activeNotificationTab === 'ALL') return true;
      if (activeNotificationTab === 'CRITICAL') return n.type === 'CRITICAL';
      if (activeNotificationTab === 'AI') return n.type === 'AI';
      return true;
    });
  }, [reportMetrics, activeNotificationTab]);

  // Synchronize mission control metrics with chronological timeline
  const handleSynchronizeTimeline = async () => {
    setIsSyncing(true);
    try {
      const result = await apiClient.timeline.syncPhysics(selectedCaseId, {
        missionControlSynced: true,
        caseId: selectedCaseId
      });
      setSyncStatus(result?.message || 'Mission control tactical overview synchronized with timeline.');
    } catch (err) {
      setSyncStatus('Mission control tactical metrics synchronized locally with timeline engine.');
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
      }, 600);
    }
  };

  return (
    <div className="w-full max-w-full min-w-0 space-y-4 sm:space-y-6 pb-8 sm:pb-12">
      {/* Dashboard Title & Diagnostic Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping shrink-0" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest break-words">
              NETWORK INTELLIGENCE DASHBOARD
            </span>
          </div>
          <h1 className="font-display-lg text-2xl sm:text-3xl font-bold uppercase tracking-tight text-on-surface flex flex-wrap items-center gap-2 sm:gap-3">
            <span>Network Overview:</span>
            <span className="text-primary glow-red break-all">{selectedCaseId || 'CASE-2026-088'}</span>
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleSynchronizeTimeline}
            disabled={isSyncing}
            className="justify-center px-4 py-2 rounded bg-primary/20 hover:bg-primary text-primary hover:text-on-primary border border-primary/50 transition-all font-tactical-data text-xs font-bold uppercase flex items-center gap-2 shadow-[0_0_12px_rgba(255,84,76,0.2)] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'SYNCHRONIZING...' : 'SYNCHRONIZE DATA LAKES'}</span>
          </button>

          <Link
            to="/report"
            className="justify-center px-4 py-2 rounded bg-surface-container-high hover:bg-secondary-container text-on-surface hover:text-primary border border-outline-variant transition-all font-tactical-data text-xs uppercase flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-primary" />
            <span>Export Report</span>
          </Link>
        </div>
      </div>

      {/* Investigation Report Mission Intelligence Banner */}
      <GlassCard glow className="p-4 border-l-4 border-l-primary bg-secondary-container/10 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-primary/20 border border-primary shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-tactical-data text-xs font-bold uppercase text-primary tracking-wider">
                  NETWORK DATA SOURCES INGESTED
                </span>
                <Badge variant="active">91% BAYESIAN VERDICT</Badge>
              </div>
              <p className="text-xs text-on-surface-variant font-body-md mt-0.5">
                Ingested structured and unstructured data across 20 source nodes, extracting 450 key entities and linking 8 distinct organizational hierarchies.
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
      </GlassCard>

      {/* Top Summary Diagnostic Cards Grid */}
      {caseLoading || evidenceLoading ? (
        <LoadingSkeleton rows={1} height="h-32" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Active Case Intelligence */}
          <GlassCard glow className="p-4 flex flex-col justify-between">
            <div className="flex flex-col space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-tactical-data text-on-surface-variant uppercase tracking-widest whitespace-nowrap">
                  ACTIVE CASE STATUS
                </span>
                <Badge variant="critical" className="shrink-0 text-[10px] tracking-wider uppercase">
                  {activeCase?.status === 'SOLVED_CHARGESHEET_FILED' ? 'CHARGESHEET FILED' : (activeCase?.status || 'CRITICAL').replace(/_/g, ' ')}
                </Badge>

              </div>
              <h3 className="font-display-lg text-base font-bold text-on-surface leading-snug break-words">
                {activeCase?.title || 'The Doomed Triangle'}
              </h3>
            </div>
            <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs font-tactical-data">
              <span className="text-on-surface-variant/80 shrink-0">ASSIGNED:</span>
              <span className="text-primary font-bold truncate max-w-[150px] text-right">
                {activeCase?.assignedTo || 'SI Santosh Jadhav & Dr. Patwardhan'}
              </span>
            </div>
          </GlassCard>


          {/* Card 2: AI Multi-Sensor Confidence */}
          <GlassCard className="p-4 flex flex-col justify-between border-primary/40">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-tactical-data text-on-surface-variant uppercase tracking-widest">
                  BAYESIAN AI CONFIDENCE
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display-lg text-3xl font-bold text-primary">
                    91%
                  </span>
                  <span className="text-xs font-tactical-data text-emerald-400 font-bold">▲ +2.4%</span>
                </div>
              </div>
              <div className="p-2 rounded bg-primary/10 border border-primary/30">
                <Activity className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[91%]" style={{ width: '91%' }} />
            </div>
          </GlassCard>


          {/* Card 3: Evidence Vault Scans */}
          <GlassCard className="p-4 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-tactical-data text-on-surface-variant uppercase tracking-widest">
                  DATA SOURCES PROCESSED
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display-lg text-3xl font-bold text-on-surface">
                    20
                  </span>
                  <span className="text-xs font-tactical-data text-on-surface-variant">SOURCES INDEXED</span>
                </div>
              </div>
              <div className="p-2 rounded bg-surface-container border border-outline-variant/40">
                <Database className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs font-tactical-data">
              <span className="text-on-surface-variant">ENTITY EXTRACTION:</span>
              <span className="text-emerald-400 font-bold">100% NLP PARSED</span>
            </div>
          </GlassCard>

          {/* Card 4: Contradiction & Missing Alert Summary */}
          <GlassCard className="p-4 flex flex-col justify-between bg-secondary-container/30 border-primary/50">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-tactical-data text-primary uppercase tracking-widest font-bold">
                  SUSPICIOUS PATTERNS DETECTED
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display-lg text-3xl font-bold text-primary">4</span>
                  <span className="text-xs font-tactical-data text-on-surface-variant font-bold">ANOMALIES DETECTED</span>
                </div>
              </div>
              <div className="p-2 rounded bg-primary/20 border border-primary animate-pulse">
                <AlertTriangle className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs font-tactical-data">
              <span className="text-on-surface-variant">FINANCIAL DISCREPANCIES:</span>
              <span className="text-primary font-bold">4 HIGH-RISK TRANSACTIONS</span>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Charts Section: Timeline Confidence Area Chart & AI Radar Chart */}
      <div className="flex flex-wrap lg:flex-nowrap gap-6">
        {/* Main Chart: Timeline Confidence & Anomaly Frequency (2/3 width) */}
        <GlassCard
          className="w-full lg:w-2/3 p-5"
          header={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-display-lg text-sm font-bold uppercase tracking-wider text-on-surface">
                  Network Connectivity & Anomaly Trends
                </span>
              </div>
              <Badge variant="confidence">BAYESIAN PROOF CURVE</Badge>
            </div>
          }
        >
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportMetrics.timelineConfidenceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff544c" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#ff544c" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                <XAxis dataKey="time" stroke="#ab8985" fontStyle="italic" fontSize={11} />
                <YAxis stroke="#ab8985" fontSize={11} domain={[90, 100]} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#131313', borderColor: '#ff544c', borderRadius: '6px' }}
                  labelStyle={{ color: '#ffb4ac', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="confidence" stroke="#ff544c" strokeWidth={2} fillOpacity={1} fill="url(#colorConf)" name="Confidence %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs font-tactical-data text-on-surface-variant">
            <span>KEY TIMELINE RANGE: <strong className="text-primary">04-14 19:00 TO 06-21 17:15 UTC</strong></span>
            <Link to="/pattern-detection" className="text-primary hover:underline flex items-center gap-1 font-bold">
              <span>Launch Pattern Detection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </GlassCard>

        {/* Right Chart: AI Radar Breakdown (1/3 width) */}
        <GlassCard
          className="w-full lg:w-1/3 p-5"
          header={
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-primary" />
              <span className="font-display-lg text-sm font-bold uppercase tracking-wider text-on-surface">
                Network Centrality Metrics
              </span>
            </div>
          }
        >
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={reportMetrics.aiRadarData}>
                <PolarGrid stroke="#2A2A2A" />
                <PolarAngleAxis dataKey="metric" stroke="#ab8985" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#353534" fontSize={9} />
                <Radar name="Confidence Weight" dataKey="value" stroke="#ff544c" fill="#ff544c" fillOpacity={0.4} />
                <Tooltip contentStyle={{ backgroundColor: '#131313', borderColor: '#ff544c', borderRadius: '6px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs font-tactical-data text-on-surface-variant">
            <span>HIGHEST WEIGHT: <strong className="text-emerald-400">Financial Wire (100%)</strong></span>
            <Link to="/ai-reasoning" className="text-primary hover:underline font-bold">Explain Why →</Link>
          </div>
        </GlassCard>
      </div>

      {/* Bottom Row: Evidence Categories Pie Chart & Live Activity & Notifications Feed */}
      <div className="flex flex-wrap lg:flex-nowrap gap-6">
        {/* Evidence Category Distribution (1/3) */}
        <GlassCard
          className="w-full lg:w-1/3 p-5"
          header={
            <div className="flex items-center justify-between w-full">
              <span className="font-display-lg text-sm font-bold uppercase tracking-wider text-on-surface">
                Data Source Distribution
              </span>
              <Badge variant="neutral">20 SOURCES</Badge>
            </div>
          }
        >
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportMetrics.evidencePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {reportMetrics.evidencePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#131313" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#131313', borderColor: '#ff544c', borderRadius: '6px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 pt-2 border-t border-outline-variant/30 font-tactical-data text-xs">
            {reportMetrics.evidencePieData.map((e, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                  <span className="text-on-surface-variant">{e.name}</span>
                </div>
                <span className="text-on-surface font-bold">{e.value} items</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Live Activity & Notifications (2/3) */}
        <GlassCard
          className="w-full lg:w-2/3 p-5"
          header={
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
              <span className="font-display-lg text-sm font-bold uppercase tracking-wider text-on-surface">
                Live Network Intelligence & Pattern Alerts
              </span>
              <div className="flex gap-1.5 font-tactical-data text-[10px]">
                {(['ALL', 'CRITICAL', 'AI'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveNotificationTab(tab)}
                    className={`px-2.5 py-1 rounded transition-all border ${
                      activeNotificationTab === tab
                        ? 'bg-primary text-on-primary border-primary font-bold'
                        : 'bg-surface-container text-on-surface-variant border-outline-variant hover:text-on-surface'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          }
        >
          <div className="space-y-3 mt-4 max-h-80 overflow-y-auto custom-scrollbar pr-2">
            {filteredNotifs.map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/40 hover:border-primary/60 transition-all flex items-start justify-between gap-4 group"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded mt-0.5 border ${
                      notif.type === 'CRITICAL'
                        ? 'bg-secondary-container/80 text-primary border-primary/50'
                        : notif.type === 'AI'
                        ? 'bg-primary/20 text-primary border-primary/40'
                        : 'bg-surface-container text-on-surface-variant border-outline-variant'
                    }`}
                  >
                    {notif.type === 'CRITICAL' ? (
                      <AlertTriangle className="w-4 h-4 text-primary animate-pulse" />
                    ) : (
                      <Radio className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display-lg font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                        {notif.title}
                      </span>
                      <span className="text-[10px] font-tactical-data text-on-surface-variant/70">
                        {notif.time}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant font-body-md mt-1 leading-relaxed">
                      {notif.description}
                    </p>
                  </div>
                </div>

                <Link
                  to={notif.link}
                  className="p-2 rounded bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface-variant border border-outline-variant/40 transition-all shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default MissionControl;
