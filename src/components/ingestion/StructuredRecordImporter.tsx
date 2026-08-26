import React, { useState } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Search,
  Filter,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  ShieldAlert,
  Zap,
  TrendingUp,
  Download,
  Sparkles,
  PhoneCall,
  Clock,
  MapPin,
  RefreshCw,
  ArrowRight,
  CreditCard,
  Building2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import {
  IngestedDatasetSummary,
  FinancialTransactionRecord,
  CDRLogRecord,
  RecordAnomalyAlert,
  RecordCategory,
} from '../../types/ingestion';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';

interface StructuredRecordImporterProps {
  summary: IngestedDatasetSummary | null;
  financialRecords: FinancialTransactionRecord[];
  cdrRecords: CDRLogRecord[];
  anomalies: RecordAnomalyAlert[];
  onImportNewRecords: (payload: { datasetName: string; category: RecordCategory; rawRecords: any[] }) => Promise<void>;
  isLoading?: boolean;
}

export const StructuredRecordImporter: React.FC<StructuredRecordImporterProps> = ({
  summary,
  financialRecords,
  cdrRecords,
  anomalies,
  onImportNewRecords,
  isLoading = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'FINANCIAL' | 'CDR' | 'FLAGGED_ONLY'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAnomaly, setSelectedAnomaly] = useState<RecordAnomalyAlert | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransactionRecord | null>(null);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [isSimulatingImport, setIsSimulatingImport] = useState<boolean>(false);

  // Compute aggregate statistics
  const totalFinancialVolume = financialRecords.reduce((sum, r) => sum + (r.amount || 0), 0);
  const flaggedFinancialCount = financialRecords.filter((r) => r.isFlaggedSuspicious).length;
  const flaggedCDRCount = cdrRecords.filter((r) => r.isFlaggedSuspicious).length;
  const totalFlaggedCount = flaggedFinancialCount + flaggedCDRCount;

  // Filtered lists
  const filteredFinancial = financialRecords.filter((r) => {
    if (activeCategory === 'CDR') return false;
    if (activeCategory === 'FLAGGED_ONLY' && !r.isFlaggedSuspicious) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.transactionId.toLowerCase().includes(q) ||
      r.senderName.toLowerCase().includes(q) ||
      r.receiverName.toLowerCase().includes(q) ||
      r.narration?.toLowerCase().includes(q)
    );
  });

  const filteredCDR = cdrRecords.filter((r) => {
    if (activeCategory === 'FINANCIAL') return false;
    if (activeCategory === 'FLAGGED_ONLY' && !r.isFlaggedSuspicious) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.callingNumber.toLowerCase().includes(q) ||
      r.calledNumber.toLowerCase().includes(q) ||
      r.locationName?.toLowerCase().includes(q) ||
      r.cellTowerId?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top High-Impact Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 font-tactical-data">
        <GlassCard className="p-4 border-l-4 border-l-primary rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Total Ingested Volume</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xl font-bold text-on-surface mt-1 font-mono">
            ₹{totalFinancialVolume.toLocaleString()}
          </div>
          <div className="text-[10px] text-on-surface-variant mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Multi-Bank Reconciliation Active</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-l-4 border-l-red-500 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-red-400 uppercase font-semibold">Suspicious Flagged Records</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-xl font-bold text-red-400 mt-1 font-mono">
            {totalFlaggedCount} Entries
          </div>
          <div className="text-[10px] text-red-300/80 mt-1">
            {flaggedFinancialCount} Financial • {flaggedCDRCount} Telecom
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-l-4 border-l-amber-400 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-amber-400 uppercase font-semibold">Forensic Anomaly Triggers</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-300 mt-1 font-mono">
            {anomalies.length} Rule Alerts
          </div>
          <div className="text-[10px] text-amber-300/80 mt-1">
            Smurfing, Round-Trip, Midnight Bursts
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-l-4 border-l-cyan-400 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cyan-300 uppercase font-semibold">Schema Auto-Mapper</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-300 mt-1 font-mono">
            99.2% Match
          </div>
          <div className="text-[10px] text-cyan-300/80 mt-1">
            Auto-Detects Airtel, Jio, SBI, HDFC, ICICI
          </div>
        </GlassCard>
      </div>

      {/* Visual Capital Trail Flow Bar */}
      <GlassCard className="p-4 rounded-2xl border border-outline-variant/40 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold font-tactical-data text-on-surface uppercase tracking-wider">
              Forensic Fund Layering & Extraction Trail (Automated Reconstruction)
            </span>
          </div>
          <Badge variant="confidence" className="text-[10px] text-primary border-primary/40 bg-primary/10">
            CONFIRMED MONEY TRAIL
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-tactical-data">
          <div className="px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 flex flex-col">
            <span className="text-[10px] text-on-surface-variant">Victim Account</span>
            <span className="font-bold text-neutral-100">Keshan Malhotra (HDFC)</span>
          </div>

          <div className="flex items-center gap-1 text-red-400 font-mono text-[11px] font-bold px-2 py-1 bg-red-950/30 rounded-lg border border-red-500/30">
            <span>₹45,00,000 (RTGS)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>

          <div className="px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 flex flex-col">
            <span className="text-[10px] text-on-surface-variant">Shell Corporate Entity</span>
            <span className="font-bold text-primary">D-Nexus Global Corp</span>
          </div>

          <div className="flex items-center gap-1 text-red-400 font-mono text-[11px] font-bold px-2 py-1 bg-red-950/30 rounded-lg border border-red-500/30">
            <span>₹15,00,000 (IMPS)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>

          <div className="px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 flex flex-col">
            <span className="text-[10px] text-on-surface-variant">Primary Co-Conspirator</span>
            <span className="font-bold text-neutral-100">Chetany Sharma (SBI)</span>
          </div>

          <div className="flex items-center gap-1 text-amber-400 font-mono text-[11px] font-bold px-2 py-1 bg-amber-950/30 rounded-lg border border-amber-500/30">
            <span>₹8,50,000</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>

          <div className="px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/40 flex flex-col">
            <span className="text-[10px] text-purple-300">Offshore Hawala Extraction</span>
            <span className="font-bold text-purple-200">Dubai Node [#DH-994]</span>
          </div>
        </div>
      </GlassCard>

      {/* Forensic Anomalies Alert Strip */}
      {anomalies.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-tactical-data uppercase tracking-wider text-amber-400 font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Automated Forensic Pattern Detections ({anomalies.length})</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {anomalies.map((anom) => (
              <div
                key={anom.id}
                onClick={() => setSelectedAnomaly(anom)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-md ${
                  anom.severity === 'CRITICAL'
                    ? 'bg-red-950/20 border-red-500/40 hover:border-red-400 hover:bg-red-950/30'
                    : 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400 hover:bg-amber-950/30'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant={anom.severity === 'CRITICAL' ? 'critical' : 'high'}
                    className={`text-[10px] font-mono ${
                      anom.severity === 'CRITICAL'
                        ? 'border-red-500 text-red-300 bg-red-500/10'
                        : 'border-amber-400 text-amber-300 bg-amber-500/10'
                    }`}
                  >
                    {anom.type.replace('_', ' ')}
                  </Badge>
                  <span className="text-[10px] font-tactical-data text-on-surface-variant font-mono">
                    {anom.totalVolumeOrFrequency}
                  </span>
                </div>
                <div className="text-xs font-bold text-neutral-100 mt-2">{anom.title}</div>
                <p className="text-[11px] text-neutral-300 line-clamp-2 mt-1 leading-snug">{anom.description}</p>
                <div className="mt-2.5 text-[10px] text-primary font-tactical-data flex items-center justify-between border-t border-white/10 pt-2">
                  <span className="truncate max-w-[200px]">Entities: {anom.involvedEntities.join(', ')}</span>
                  <span className="text-amber-400 underline font-bold shrink-0 ml-1">View Insight →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Table & Filter Controls */}
      <GlassCard className="p-4 space-y-4 rounded-2xl shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border-b border-outline-variant/30 pb-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 bg-surface-container p-1 rounded-xl border border-outline-variant/30 text-xs font-tactical-data overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeCategory === 'ALL'
                  ? 'bg-primary text-on-primary font-bold shadow'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All Ingested ({financialRecords.length + cdrRecords.length})
            </button>
            <button
              onClick={() => setActiveCategory('FINANCIAL')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'FINANCIAL'
                  ? 'bg-primary text-on-primary font-bold shadow'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Financial Logs ({financialRecords.length})</span>
            </button>
            <button
              onClick={() => setActiveCategory('CDR')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'CDR'
                  ? 'bg-primary text-on-primary font-bold shadow'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Telecom CDRs ({cdrRecords.length})</span>
            </button>
            <button
              onClick={() => setActiveCategory('FLAGGED_ONLY')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'FLAGGED_ONLY'
                  ? 'bg-red-500 text-white font-bold shadow'
                  : 'text-red-400 hover:text-red-300'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Suspicious Only ({totalFlaggedCount})</span>
            </button>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search account, MSISDN, name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl pl-9 pr-3 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary font-mono"
              />
            </div>

            <button
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-1.5 bg-primary text-on-primary text-xs font-tactical-data font-bold uppercase rounded-xl hover:bg-primary-dark transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-[0_0_12px_rgba(255,84,76,0.3)]"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Import CSV / Excel</span>
            </button>
          </div>
        </div>

        {/* Unified Records Table */}
        <div className="overflow-x-auto custom-scrollbar max-h-[500px]">
          <table className="w-full text-left font-tactical-data text-xs border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/40 bg-surface-container-high/60 text-on-surface-variant uppercase text-[10px] tracking-wider sticky top-0 backdrop-blur-md">
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Reference / ID</th>
                <th className="py-2.5 px-3">Timestamp (UTC/IST)</th>
                <th className="py-2.5 px-3">Source / Sender</th>
                <th className="py-2.5 px-3">Destination / Receiver</th>
                <th className="py-2.5 px-3">Amount / Duration</th>
                <th className="py-2.5 px-3">Channel / Tower</th>
                <th className="py-2.5 px-3">Forensic Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {/* Financial Rows */}
              {filteredFinancial.map((rec) => (
                <tr
                  key={rec.id}
                  onClick={() => setSelectedTransaction(rec)}
                  className={`hover:bg-surface-container/60 transition-colors cursor-pointer ${
                    rec.isFlaggedSuspicious ? 'bg-red-950/15' : ''
                  }`}
                >
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-blue-500/15 text-blue-300 border border-blue-500/30">
                      FINANCIAL
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-neutral-200">{rec.transactionId}</td>
                  <td className="py-3 px-3 text-on-surface-variant font-mono text-[11px]">
                    {new Date(rec.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-neutral-100">{rec.senderName}</div>
                    <div className="text-[10px] text-on-surface-variant font-mono">{rec.accountNumber}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-neutral-100">{rec.receiverName}</div>
                    <div className="text-[10px] text-on-surface-variant font-mono">{rec.receiverAccount}</div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-neutral-100">
                    <span className={rec.amount > 1000000 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                      ₹{rec.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-on-surface-variant">{rec.bankOrChannel}</td>
                  <td className="py-3 px-3">
                    {rec.isFlaggedSuspicious ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/15 px-2 py-0.5 rounded-md border border-red-500/30">
                        <AlertTriangle className="w-3 h-3" />
                        FLAGGED (Score: {rec.anomalyScore}%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        CLEAN
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {/* CDR Rows */}
              {filteredCDR.map((rec) => (
                <tr
                  key={rec.id}
                  className={`hover:bg-surface-container/60 transition-colors ${
                    rec.isFlaggedSuspicious ? 'bg-amber-950/15' : ''
                  }`}
                >
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      TELECOM CDR
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-neutral-200">{rec.id}</td>
                  <td className="py-3 px-3 text-on-surface-variant font-mono text-[11px]">
                    {new Date(rec.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-neutral-100">{rec.callingNumber}</td>
                  <td className="py-3 px-3 font-mono font-semibold text-neutral-100">{rec.calledNumber}</td>
                  <td className="py-3 px-3 font-mono text-cyan-300">
                    {rec.durationSeconds}s ({rec.callType})
                  </td>
                  <td className="py-3 px-3 text-on-surface-variant">
                    <div className="font-mono text-xs font-semibold">{rec.cellTowerId || 'TOW-AUTO'}</div>
                    <div className="text-[10px] text-neutral-400 truncate max-w-xs">{rec.locationName}</div>
                  </td>
                  <td className="py-3 px-3">
                    {rec.isFlaggedSuspicious ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30">
                        <AlertTriangle className="w-3 h-3" />
                        SUSPICIOUS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        CLEAN
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface border border-outline-variant/60 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold text-on-surface font-tactical-data">
                  Forensic Transaction Inspection
                </h3>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-on-surface-variant hover:text-on-surface text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-tactical-data text-xs">
              <div className="p-3 bg-surface-container rounded-2xl border border-outline-variant/30 flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-on-surface-variant uppercase">Transaction Amount</div>
                  <div className="text-lg font-bold text-primary font-mono mt-0.5">
                    ₹{selectedTransaction.amount.toLocaleString()}
                  </div>
                </div>
                <Badge variant={selectedTransaction.isFlaggedSuspicious ? 'critical' : 'active'}>
                  {selectedTransaction.isFlaggedSuspicious ? 'FLAGGED ANOMALY' : 'CLEAN'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/30">
                  <div className="text-[10px] text-on-surface-variant uppercase">Sender Entity</div>
                  <div className="font-bold text-neutral-100 mt-0.5">{selectedTransaction.senderName}</div>
                  <div className="text-[10px] text-on-surface-variant font-mono">{selectedTransaction.accountNumber}</div>
                </div>
                <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/30">
                  <div className="text-[10px] text-on-surface-variant uppercase">Beneficiary</div>
                  <div className="font-bold text-neutral-100 mt-0.5">{selectedTransaction.receiverName}</div>
                  <div className="text-[10px] text-on-surface-variant font-mono">{selectedTransaction.receiverAccount}</div>
                </div>
              </div>

              <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 space-y-1">
                <div className="text-[10px] text-on-surface-variant uppercase">Banking Narration / Remarks</div>
                <div className="text-neutral-200 italic font-serif">"{selectedTransaction.narration || 'N/A'}"</div>
              </div>

              {selectedTransaction.isFlaggedSuspicious && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl space-y-1">
                  <div className="text-[10px] text-red-400 font-bold uppercase">Anomaly Trigger Rationale</div>
                  <div className="text-neutral-200 text-[11px] leading-relaxed">
                    {selectedTransaction.suspicionReason}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-outline-variant/30">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="px-5 py-2 rounded-xl text-xs font-tactical-data bg-primary text-on-primary font-bold uppercase tracking-wider"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Anomaly Detail Modal */}
      {selectedAnomaly && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface border border-outline-variant/60 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-bold text-on-surface font-tactical-data">
                  Forensic Anomaly Intelligence
                </h3>
              </div>
              <button
                onClick={() => setSelectedAnomaly(null)}
                className="text-on-surface-variant hover:text-on-surface text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-tactical-data">
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl">
                <div className="text-[10px] text-red-400 uppercase font-bold">Anomaly Alert Title</div>
                <div className="text-sm font-bold text-neutral-100 mt-0.5">{selectedAnomaly.title}</div>
              </div>

              <div>
                <span className="text-[10px] text-on-surface-variant uppercase">Detection Description</span>
                <p className="text-neutral-200 mt-1 leading-relaxed bg-surface-container p-3 rounded-xl border border-outline-variant/30">
                  {selectedAnomaly.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/30">
                  <div className="text-[10px] text-on-surface-variant uppercase">Involved Entities</div>
                  <div className="text-xs font-semibold text-primary mt-1">
                    {selectedAnomaly.involvedEntities.join(', ')}
                  </div>
                </div>
                <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/30">
                  <div className="text-[10px] text-on-surface-variant uppercase">Volume / Frequency</div>
                  <div className="text-xs font-mono font-bold text-neutral-100 mt-1">
                    {selectedAnomaly.totalVolumeOrFrequency}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <div className="text-[10px] text-amber-400 uppercase font-bold">Recommended Action</div>
                <div className="text-xs text-neutral-200 mt-1 font-semibold">
                  {selectedAnomaly.recommendedAction}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-outline-variant/30">
              <button
                onClick={() => setSelectedAnomaly(null)}
                className="px-5 py-2 rounded-xl text-xs font-tactical-data bg-primary text-on-primary font-bold uppercase tracking-wider"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface border border-outline-variant/60 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-on-surface font-tactical-data">
                  Structured CDR & Financial Importer Wizard
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-on-surface-variant hover:text-on-surface text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-tactical-data">
              <div className="border-2 border-dashed border-outline-variant/60 rounded-2xl p-6 text-center hover:border-primary/60 transition-colors bg-surface-container-low cursor-pointer">
                <UploadCloud className="w-8 h-8 mx-auto mb-2 text-primary opacity-80" />
                <p className="text-xs font-semibold text-on-surface">
                  Drop Bank Statement (CSV/XLSX) or CDR Dump here
                </p>
                <p className="text-[10px] text-on-surface-variant mt-1">
                  Supported formats: Airtel, Jio, Vi, SBI, HDFC, ICICI, UPI Ledgers
                </p>
              </div>

              <div className="p-3 bg-primary/10 border border-primary/30 rounded-xl">
                <div className="text-[10px] text-primary uppercase font-bold">Automated Schema Mapping</div>
                <div className="text-[11px] text-neutral-300 mt-1">
                  Columns like <code>MSISDN_ORIG</code>, <code>TXN_VAL_INR</code>, <code>CALL_AZIMUTH</code> are automatically aligned with Suraag standard data models.
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/30">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-tactical-data text-on-surface-variant hover:bg-surface-container"
              >
                Cancel
              </button>
              <button
                disabled={isSimulatingImport}
                onClick={async () => {
                  setIsSimulatingImport(true);
                  await onImportNewRecords({
                    datasetName: 'Pune SIT Forensic Bank Ledger Batch B',
                    category: 'BANK_STATEMENT',
                    rawRecords: [
                      { TxnRef: 'TXN-IMP-882101', Value_Date_Time: '2026-06-19T02:25:00Z', From_Account: 'ICICI-****-8810 (Diya Gupta)', To_Account: 'AXIS-****-9921', Amount: 49800, Remarks: 'Covert Logistics Package 3' },
                      { TxnRef: 'TXN-IMP-882102', Value_Date_Time: '2026-06-19T02:29:00Z', From_Account: 'ICICI-****-8810 (Diya Gupta)', To_Account: 'AXIS-****-9921', Amount: 49400, Remarks: 'Covert Logistics Package 4' },
                    ],
                  });
                  setIsSimulatingImport(false);
                  setShowImportModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-tactical-data font-bold uppercase tracking-wider hover:bg-primary-dark transition-all flex items-center gap-2"
              >
                {isSimulatingImport ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Auto-Map & Ingest Records</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
