import React, { useState } from 'react';
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
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useSuraagStore } from '../store/useSuraagStore';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const MissionControl: React.FC = () => {
  const { selectedCaseId, missionControlFilters, setMissionControlFilters } = useSuraagStore();
  const [activeNotificationTab, setActiveNotificationTab] = useState<'ALL' | 'CRITICAL' | 'AI'>('ALL');

  const { data: activeCase, isLoading: caseLoading } = useQuery({
    queryKey: ['case', selectedCaseId],
    queryFn: () => apiClient.cases.getById(selectedCaseId),
  });

  const { data: evidenceList, isLoading: evidenceLoading } = useQuery({
    queryKey: ['evidence', selectedCaseId],
    queryFn: () => apiClient.evidence.getAll({ caseId: selectedCaseId }),
  });

  const { data: timelineList } = useQuery({
    queryKey: ['timeline', selectedCaseId],
    queryFn: () => apiClient.timeline.getAll(selectedCaseId),
  });

  const timelineConfidenceData = [
    { time: '23:10', confidence: 91, anomalies: 2 },
    { time: '23:12', confidence: 93, anomalies: 1 },
    { time: '23:14', confidence: 98, anomalies: 8 },
    { time: '23:15', confidence: 96, anomalies: 6 },
    { time: '23:18', confidence: 94, anomalies: 4 },
    { time: '23:22', confidence: 95, anomalies: 1 },
  ];

  const aiRadarData = [
    { metric: 'Physics & Ballistics', value: 98 },
    { metric: 'CCTV & Vision', value: 99 },
    { metric: 'Timeline Consistency', value: 94 },
    { metric: 'Witness Credibility', value: 85 },
    { metric: 'Line of Sight', value: 97 },
    { metric: 'Entity Correlation', value: 92 },
  ];

  const evidencePieData = [
    { name: 'Weapons & Ballistics', value: 14, color: '#ff544c' },
    { name: 'Blood & Biology', value: 10, color: '#e53935' },
    { name: 'CCTV & Digital', value: 12, color: '#ffb4ac' },
    { name: 'Footprints & Trace', value: 8, color: '#93000a' },
    { name: 'Documents & Keys', value: 6, color: '#5b403d' },
  ];

  const notifications = [
    {
      id: 'notif-1',
      type: 'CRITICAL',
      title: 'Contradiction Detected in Witness #1 Statement',
      description: 'Dr. Julian Vance claimed Wall B visibility. 3D line-of-sight math confirms 0% visibility.',
      time: '2 mins ago',
      link: '/contradiction-matrix',
    },
    {
      id: 'notif-2',
      type: 'AI',
      title: 'Missing CCTV Angle Identified',
      description: 'AI Predictor recommends querying Corridor C-4 cache for 42-second loop injection differential.',
      time: '14 mins ago',
      link: '/missing-evidence',
    },
    {
      id: 'notif-3',
      type: 'ROUTINE',
      title: 'Computer Vision Scan Complete',
      description: 'YOLOv9 segmented 4 high-velocity blood spatter droplets on Vault Doorway.',
      time: '28 mins ago',
      link: '/evidence',
    },
    {
      id: 'notif-4',
      type: 'CRITICAL',
      title: 'Suspect Krell Satellite Phone Triangulated',
      description: 'Mobile tower #442 ping matched within 180m of breach exactly 12s before EMP surge.',
      time: '45 mins ago',
      link: '/suspects',
    },
  ];

  const filteredNotifs = notifications.filter(n => {
    if (activeNotificationTab === 'ALL') return true;
    if (activeNotificationTab === 'CRITICAL') return n.type === 'CRITICAL';
    if (activeNotificationTab === 'AI') return n.type === 'AI';
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Dashboard Title & Diagnostic Strip */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping shrink-0" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest break-words">
              MISSION COMMAND & CONTROL TERMINAL
            </span>
          </div>
          <h1 className="font-display-lg text-2xl sm:text-3xl font-bold uppercase tracking-tight text-on-surface flex flex-wrap items-center gap-2 sm:gap-3">
            <span>Tactical Overview:</span>
            <span className="text-primary glow-red break-all">{selectedCaseId}</span>
          </h1>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/reconstruction"
            className="px-4 py-2 rounded bg-primary/20 hover:bg-primary text-primary hover:text-on-primary border border-primary/50 transition-all font-tactical-data text-xs font-bold uppercase flex items-center gap-2 shadow-[0_0_12px_rgba(255,84,76,0.2)]"
          >
            <Crosshair className="w-4 h-4" />
            <span>3D Crime Scene</span>
          </Link>
          <Link
            to="/ai-assistant"
            className="px-4 py-2 rounded bg-surface-container-high hover:bg-secondary-container text-on-surface hover:text-primary border border-outline-variant transition-all font-tactical-data text-xs uppercase flex items-center gap-2"
          >
            <Radio className="w-4 h-4 text-primary animate-pulse" />
            <span>AI Assistant Chat</span>
          </Link>
          <Link
            to="/report"
            className="px-4 py-2 rounded bg-surface-container-high hover:bg-secondary-container text-on-surface hover:text-primary border border-outline-variant transition-all font-tactical-data text-xs uppercase flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-primary" />
            <span>Export Report</span>
          </Link>
        </div>
      </div>

      {/* Top Summary Diagnostic Cards Grid */}
      {caseLoading || evidenceLoading ? (
        <LoadingSkeleton rows={1} height="h-32" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Active Case Intelligence */}
          <GlassCard glow className="p-4 flex flex-col justify-between">
            <div className="flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-tactical-data text-on-surface-variant uppercase tracking-widest mt-1">
                  ACTIVE CASE STATUS
                </span>
                <Badge variant="critical" className="shrink-0">{activeCase?.status || 'CRITICAL'}</Badge>
              </div>
              <h3 className="font-display-lg text-base font-bold text-on-surface mt-1.5 leading-snug break-words">
                {activeCase?.title || 'The Doomed Triangle'}
              </h3>
            </div>
            <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs font-tactical-data">
              <span className="text-on-surface-variant/80">ASSIGNED:</span>
              <span className="text-primary font-bold truncate max-w-[140px]">{activeCase?.assignedTo || 'Agent Jenkins'}</span>
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
                    {activeCase?.confidenceScore || 94.2}%
                  </span>
                  <span className="text-xs font-tactical-data text-emerald-400 font-bold">▲ +2.4%</span>
                </div>
              </div>
              <div className="p-2 rounded bg-primary/10 border border-primary/30">
                <Activity className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[94.2%] shadow-[0_0_8px_#ff544c]" />
            </div>
          </GlassCard>

          {/* Card 3: Evidence Vault Scans */}
          <GlassCard className="p-4 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-tactical-data text-on-surface-variant uppercase tracking-widest">
                  EVIDENCE VAULT INGESTION
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display-lg text-3xl font-bold text-on-surface">
                    {evidenceList?.length || 50}
                  </span>
                  <span className="text-xs font-tactical-data text-on-surface-variant">ITEMS SCANNED</span>
                </div>
              </div>
              <div className="p-2 rounded bg-surface-container border border-outline-variant/40">
                <Database className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs font-tactical-data">
              <span className="text-on-surface-variant">VISION DETECTIONS:</span>
              <span className="text-emerald-400 font-bold">100% BOUNDING BOXED</span>
            </div>
          </GlassCard>

          {/* Card 4: Contradiction & Missing Alert Summary */}
          <GlassCard className="p-4 flex flex-col justify-between bg-secondary-container/30 border-primary/50">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-tactical-data text-primary uppercase tracking-widest font-bold">
                  TACTICAL CONTRADICTIONS
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display-lg text-3xl font-bold text-primary">4</span>
                  <span className="text-xs font-tactical-data text-on-surface-variant">FLAGGED CLAIMS</span>
                </div>
              </div>
              <div className="p-2 rounded bg-primary/20 border border-primary animate-pulse">
                <AlertTriangle className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs font-tactical-data">
              <span className="text-on-surface-variant">LINE OF SIGHT:</span>
              <span className="text-primary font-bold">1 GEOMETRIC REFUTATION</span>
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
                  Chronological Timeline Confidence & Anomaly Spikes
                </span>
              </div>
              <Badge variant="confidence">MULTI-SENSOR BAYESIAN</Badge>
            </div>
          }
        >
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineConfidenceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff544c" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#ff544c" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                <XAxis dataKey="time" stroke="#ab8985" fontStyle="italic" fontSize={11} />
                <YAxis stroke="#ab8985" fontSize={11} domain={[80, 100]} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#131313', borderColor: '#ff544c', borderRadius: '6px' }}
                  labelStyle={{ color: '#ffb4ac', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="confidence" stroke="#ff544c" strokeWidth={2} fillOpacity={1} fill="url(#colorConf)" name="Confidence %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs font-tactical-data text-on-surface-variant">
            <span>PEAK BREACH TIMESTAMPS: <strong className="text-primary">23:14:02 - 23:15:45 UTC</strong></span>
            <Link to="/timeline" className="text-primary hover:underline flex items-center gap-1 font-bold">
              <span>Launch Timeline Engine</span>
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
                AI Reasoning Weights
              </span>
            </div>
          }
        >
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={aiRadarData}>
                <PolarGrid stroke="#2A2A2A" />
                <PolarAngleAxis dataKey="metric" stroke="#ab8985" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#353534" fontSize={9} />
                <Radar name="Confidence Weight" dataKey="value" stroke="#ff544c" fill="#ff544c" fillOpacity={0.4} />
                <Tooltip contentStyle={{ backgroundColor: '#131313', borderColor: '#ff544c', borderRadius: '6px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs font-tactical-data text-on-surface-variant">
            <span>LOWEST WEIGHT: <strong className="text-amber-400">Witnesses (85%)</strong></span>
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
                Evidence Categories
              </span>
              <Badge variant="neutral">50 ITEMS</Badge>
            </div>
          }
        >
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={evidencePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {evidencePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#131313" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#131313', borderColor: '#ff544c', borderRadius: '6px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 pt-2 border-t border-outline-variant/30 font-tactical-data text-xs">
            {evidencePieData.map((e, idx) => (
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
                Live Tactical Notifications & Diagnostic Alerts
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
