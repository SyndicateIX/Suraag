import React, { useState, useEffect } from 'react';
import {
  Radio,
  Network,
  Clock,
  BarChart3,
  Database,
  Sparkles,
  Upload,
  RefreshCw,
  FolderKanban,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  CDRDataset,
  CDRRecord,
  CDRAnalytics,
  NetworkGraphData,
  CoOccurrenceEvent,
  AITelecomInsightsResponse,
  MasterCellTower,
  NetworkNode,
} from '../types/telecom';
import {
  getCaseDatasets,
  getCaseRecords,
  getCaseAnalytics,
  getCaseNetworkGraph,
  getCoOccurrences,
  getAITelecomInsights,
  getSampleTemplates,
  syncSuspectMapping,
} from '../services/telecomService';
import { CDRIngestionWizard } from '../components/telecom/CDRIngestionWizard';
import { SuspectNetworkGraph } from '../components/telecom/SuspectNetworkGraph';
import { CellTowerTimeline } from '../components/telecom/CellTowerTimeline';
import { CDRAnalyticsView } from '../components/telecom/CDRAnalyticsView';
import { AITelecomInsightsPanel } from '../components/telecom/AITelecomInsightsPanel';

export const TelecomIntelligence: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-dt01');
  const [datasets, setDatasets] = useState<CDRDataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'GRAPH' | 'TOWERS' | 'ANALYTICS' | 'RAW' | 'AI'>('GRAPH');
  const [showIngestionWizard, setShowIngestionWizard] = useState<boolean>(false);

  // Data states
  const [graphData, setGraphData] = useState<NetworkGraphData | null>(null);
  const [analytics, setAnalytics] = useState<CDRAnalytics | null>(null);
  const [coOccurrences, setCoOccurrences] = useState<CoOccurrenceEvent[]>([]);
  const [aiInsights, setAiInsights] = useState<AITelecomInsightsResponse | null>(null);
  const [cellTowers, setCellTowers] = useState<MasterCellTower[]>([]);

  // Raw Records Table state
  const [rawRecords, setRawRecords] = useState<CDRRecord[]>([]);
  const [rawTotal, setRawTotal] = useState<number>(0);
  const [rawPage, setRawPage] = useState<number>(1);
  const [rawSearch, setRawSearch] = useState<string>('');
  const [rawCallType, setRawCallType] = useState<string>('ALL');

  // Loading states
  const [loadingDatasets, setLoadingDatasets] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [timeWindowMinutes, setTimeWindowMinutes] = useState<number>(15);

  // Available cases list for quick switching
  const availableCases = [
    { id: 'case-dt01', number: 'CASE-2026-DT01', title: 'The Doomed Triangle (Kalyani Nagar / Lohegaon)' },
    { id: 'case-1', number: 'CASE-2026-884A', title: 'Project Genesis Breach (Zurich Facility)' },
    { id: 'case-2', number: 'CASE-2026-712B', title: 'Orbital Uplink Sabotage (Nevada Array)' },
  ];

  // Load datasets when selectedCaseId changes
  useEffect(() => {
    loadDatasets();
    getSampleTemplates().then(res => setCellTowers(res.cellTowers)).catch(() => {});
  }, [selectedCaseId]);

  // Load main data when dataset or case changes
  useEffect(() => {
    loadAllTelecomData();
  }, [selectedCaseId, selectedDatasetId, timeWindowMinutes]);

  // Load paginated raw records
  useEffect(() => {
    if (activeTab === 'RAW') {
      loadRawRecords();
    }
  }, [selectedCaseId, selectedDatasetId, rawPage, rawSearch, rawCallType, activeTab]);

  const loadDatasets = async () => {
    setLoadingDatasets(true);
    try {
      const list = await getCaseDatasets(selectedCaseId);
      setDatasets(list);
      if (list.length > 0 && !selectedDatasetId) {
        setSelectedDatasetId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load datasets:', err);
    } finally {
      setLoadingDatasets(false);
    }
  };

  const loadAllTelecomData = async () => {
    setLoadingData(true);
    try {
      const [gRes, aRes, coRes] = await Promise.all([
        getCaseNetworkGraph(selectedCaseId, { datasetId: selectedDatasetId || undefined }),
        getCaseAnalytics(selectedCaseId, selectedDatasetId || undefined),
        getCoOccurrences(selectedCaseId, timeWindowMinutes, selectedDatasetId || undefined),
      ]);
      setGraphData(gRes);
      setAnalytics(aRes);
      setCoOccurrences(coRes.coOccurrences);
    } catch (err) {
      console.error('Failed to load telecom data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const loadAiInsights = async () => {
    setLoadingAi(true);
    try {
      const res = await getAITelecomInsights(selectedCaseId, selectedDatasetId || undefined);
      setAiInsights(res);
    } catch (err) {
      console.error('Failed to generate AI insights:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  const loadRawRecords = async () => {
    try {
      const res = await getCaseRecords(selectedCaseId, {
        datasetId: selectedDatasetId || undefined,
        search: rawSearch || undefined,
        callType: rawCallType,
        page: rawPage,
        limit: 25,
      });
      setRawRecords(res.records);
      setRawTotal(res.total);
    } catch (err) {
      console.error('Failed to load raw records:', err);
    }
  };

  const handleSyncSuspect = async (node: NetworkNode) => {
    try {
      await syncSuspectMapping(selectedCaseId, {
        phoneNumber: node.phoneNumber,
        name: node.name,
        role: node.role,
        riskScore: node.riskScore,
        alias: node.alias,
        avatar: node.avatar,
      });
      loadAllTelecomData();
    } catch (err) {
      console.error('Failed to sync suspect:', err);
    }
  };

  const exportRawCSV = () => {
    if (!rawRecords.length) return;
    const headers = 'Calling,Called,Timestamp,Duration(s),Type,TowerID,Location\n';
    const rows = rawRecords.map(r => 
      `"${r.callingNumber}","${r.calledNumber}","${r.timestamp}",${r.durationSeconds},"${r.callType}","${r.cellTowerId || ''}","${r.firstLocation || ''}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SURAAG_CDR_EXPORT_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-6 space-y-6 font-mono">
      {/* Top Header Command Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
              Telecommunication & CDR Intelligence Engine
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-bold">
                FORENSIC SPATIAL-TEMPORAL
              </span>
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Call Detail Records (CDRs), Cell Tower Spatial Co-Presence & Dynamic Suspect Network Graph
            </p>
          </div>
        </div>

        {/* Case & Dataset Selectors + Ingest Trigger */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active Case Selector */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs">
            <FolderKanban className="w-3.5 h-3.5 text-emerald-400 mr-2 shrink-0" />
            <select
              value={selectedCaseId}
              onChange={(e) => {
                setSelectedCaseId(e.target.value);
                setSelectedDatasetId('');
              }}
              className="bg-transparent text-zinc-200 focus:outline-none cursor-pointer"
            >
              {availableCases.map(c => (
                <option key={c.id} value={c.id} className="bg-zinc-900">
                  {c.number} - {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Dataset Selector */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs">
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400 mr-2 shrink-0" />
            <select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
              className="bg-transparent text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-zinc-900">All Case Datasets</option>
              {datasets.map(d => (
                <option key={d.id} value={d.id} className="bg-zinc-900">
                  {d.fileName} ({d.operatorName})
                </option>
              ))}
            </select>
          </div>

          {/* Ingestion Wizard Button */}
          <button
            type="button"
            onClick={() => setShowIngestionWizard(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <Upload className="w-4 h-4" /> Ingest CDR File
          </button>
        </div>
      </div>

      {/* Ingestion Wizard Modal Modal */}
      {showIngestionWizard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <CDRIngestionWizard
              caseId={selectedCaseId}
              onIngestSuccess={(newDatasetId) => {
                setShowIngestionWizard(false);
                loadDatasets();
                setSelectedDatasetId(newDatasetId);
                loadAllTelecomData();
              }}
              onClose={() => setShowIngestionWizard(false)}
            />
          </div>
        </div>
      )}

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5">
          <span className="text-zinc-500 uppercase text-[10px] block font-semibold">Total Call Logs</span>
          <span className="text-xl font-bold text-zinc-100 mt-1 block">
            {analytics?.totalRecords || 0}
          </span>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5">
          <span className="text-zinc-500 uppercase text-[10px] block font-semibold">Suspect Nodes</span>
          <span className="text-xl font-bold text-emerald-400 mt-1 block">
            {graphData?.totalNodes || 0}
          </span>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5">
          <span className="text-zinc-500 uppercase text-[10px] block font-semibold">Bridge Brokers</span>
          <span className="text-xl font-bold text-amber-400 mt-1 block">
            {graphData?.bridgeNodes.length || 0}
          </span>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5">
          <span className="text-zinc-500 uppercase text-[10px] block font-semibold">Co-Presence Alerts</span>
          <span className="text-xl font-bold text-red-400 mt-1 block">
            {coOccurrences.length}
          </span>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5 col-span-2 md:col-span-1">
          <span className="text-zinc-500 uppercase text-[10px] block font-semibold">Night-Owl Ratio</span>
          <span className="text-xl font-bold text-purple-400 mt-1 block">
            {Math.round((analytics?.nightCallRatio || 0) * 100)}%
          </span>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto custom-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('GRAPH')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'GRAPH'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Network className="w-4 h-4" /> Suspect Network Graph
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TOWERS')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'TOWERS'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Radio className="w-4 h-4" /> Spatial Co-Presence & Towers ({coOccurrences.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ANALYTICS')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'ANALYTICS'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.2)]'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Burst & Frequency Metrics
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('AI');
            if (!aiInsights) loadAiInsights();
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'AI'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-400" /> Gemini AI Forensic Intel
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('RAW')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'RAW'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Database className="w-4 h-4" /> Raw CDR Vault ({analytics?.totalRecords || 0})
        </button>
      </div>

      {/* TAB 1: SUSPECT NETWORK GRAPH */}
      {activeTab === 'GRAPH' && (
        <SuspectNetworkGraph
          caseId={selectedCaseId}
          graphData={graphData}
          loading={loadingData}
          onSyncSuspect={handleSyncSuspect}
          onFilterChange={({ minWeight, callType }) => {
            getCaseNetworkGraph(selectedCaseId, {
              datasetId: selectedDatasetId || undefined,
              minWeight,
              callType,
            }).then(setGraphData);
          }}
        />
      )}

      {/* TAB 2: SPATIAL CO-PRESENCE & CELL TOWERS */}
      {activeTab === 'TOWERS' && (
        <CellTowerTimeline
          caseId={selectedCaseId}
          coOccurrences={coOccurrences}
          records={rawRecords.length > 0 ? rawRecords : (graphData?.nodes ? [] : [])}
          cellTowers={cellTowers}
          timeWindowMinutes={timeWindowMinutes}
          onTimeWindowChange={(w) => setTimeWindowMinutes(w)}
          onRefresh={loadAllTelecomData}
        />
      )}

      {/* TAB 3: BURST & FREQUENCY ANALYTICS */}
      {activeTab === 'ANALYTICS' && (
        <CDRAnalyticsView
          analytics={analytics}
          loading={loadingData}
        />
      )}

      {/* TAB 4: GEMINI AI FORENSIC INTEL */}
      {activeTab === 'AI' && (
        <AITelecomInsightsPanel
          caseId={selectedCaseId}
          insights={aiInsights}
          loading={loadingAi}
          onRefresh={loadAiInsights}
        />
      )}

      {/* TAB 5: RAW CDR VAULT & QUERY SEARCH */}
      {activeTab === 'RAW' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-2xl">
          {/* Table Search & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-[240px]">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search caller, receiver, tower ID, IMEI..."
                  value={rawSearch}
                  onChange={(e) => {
                    setRawSearch(e.target.value);
                    setRawPage(1);
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={rawCallType}
                onChange={(e) => {
                  setRawCallType(e.target.value);
                  setRawPage(1);
                }}
                className="bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Event Types</option>
                <option value="VOICE">VOICE Only</option>
                <option value="SMS">SMS Only</option>
                <option value="DATA">DATA Only</option>
              </select>
            </div>

            <button
              type="button"
              onClick={exportRawCSV}
              className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs flex items-center gap-2 border border-zinc-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export Filtered CSV
            </button>
          </div>

          {/* Records Table */}
          <div className="overflow-x-auto custom-scrollbar border border-zinc-800 rounded-lg">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/90 text-zinc-400 uppercase text-[10px] border-b border-zinc-800">
                <tr>
                  <th className="px-3.5 py-2.5">Caller MSISDN</th>
                  <th className="px-3.5 py-2.5">Receiver MSISDN</th>
                  <th className="px-3.5 py-2.5">Date & Time (UTC)</th>
                  <th className="px-3.5 py-2.5">Duration</th>
                  <th className="px-3.5 py-2.5">Type</th>
                  <th className="px-3.5 py-2.5">Cell Tower ID</th>
                  <th className="px-3.5 py-2.5">Sector Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                {rawRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                      No CDR logs found matching query filters.
                    </td>
                  </tr>
                ) : (
                  rawRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="px-3.5 py-2 font-semibold text-emerald-400">{r.callingNumber}</td>
                      <td className="px-3.5 py-2 font-semibold text-cyan-400">{r.calledNumber}</td>
                      <td className="px-3.5 py-2 text-zinc-400">
                        {new Date(r.timestamp).toLocaleString()}
                      </td>
                      <td className="px-3.5 py-2 text-zinc-300">
                        {r.durationSeconds > 0 ? `${r.durationSeconds}s` : '0s'}
                      </td>
                      <td className="px-3.5 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          r.callType === 'VOICE' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                          r.callType === 'SMS' ? 'bg-blue-950 text-blue-400 border-blue-800' :
                          'bg-amber-950 text-amber-400 border-amber-800'
                        }`}>
                          {r.callType}
                        </span>
                      </td>
                      <td className="px-3.5 py-2 text-zinc-400">{r.cellTowerId || 'N/A'}</td>
                      <td className="px-3.5 py-2 text-zinc-400 truncate max-w-[200px]">
                        {r.firstLocation || 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
            <span>
              Showing {rawRecords.length} of {rawTotal} records (Page {rawPage})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRawPage(prev => Math.max(1, prev - 1))}
                disabled={rawPage <= 1}
                className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 border border-zinc-800 flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <button
                type="button"
                onClick={() => setRawPage(prev => prev + 1)}
                disabled={rawRecords.length < 25}
                className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 border border-zinc-800 flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
