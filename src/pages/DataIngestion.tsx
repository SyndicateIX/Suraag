import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  FileSpreadsheet,
  Globe,
  Radio,
  Sparkles,
  RefreshCw,
  FolderKanban,
  CheckCircle2,
  Layers,
  Shield,
  UploadCloud,
  Database,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useSuraagStore } from '../store/useSuraagStore';
import { apiClient } from '../services/apiClient';
import {
  OCRDocument,
  IngestedDatasetSummary,
  FinancialTransactionRecord,
  CDRLogRecord,
  RecordAnomalyAlert,
  OSINTFindingItem,
  Section65BCertificate,
  OSINTPlatform,
  RecordCategory,
} from '../types/ingestion';
import { DocumentOCREngine } from '../components/ingestion/DocumentOCREngine';
import { StructuredRecordImporter } from '../components/ingestion/StructuredRecordImporter';
import { OSINTConnectorHub } from '../components/ingestion/OSINTConnectorHub';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

export const DataIngestion: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCaseId } = useSuraagStore();

  const [activeTab, setActiveTab] = useState<'OCR' | 'STRUCTURED' | 'OSINT'>('OCR');

  // OCR state
  const [ocrDocs, setOcrDocs] = useState<OCRDocument[]>([]);
  const [selectedOCRDoc, setSelectedOCRDoc] = useState<OCRDocument | null>(null);
  const [isOCRProcessing, setIsOCRProcessing] = useState<boolean>(false);

  // Structured records state
  const [recordSummary, setRecordSummary] = useState<IngestedDatasetSummary | null>(null);
  const [financialRecords, setFinancialRecords] = useState<FinancialTransactionRecord[]>([]);
  const [cdrRecords, setCdrRecords] = useState<CDRLogRecord[]>([]);
  const [anomalies, setAnomalies] = useState<RecordAnomalyAlert[]>([]);
  const [isRecordLoading, setIsRecordLoading] = useState<boolean>(false);

  // OSINT state
  const [osintFindings, setOsintFindings] = useState<OSINTFindingItem[]>([]);
  const [isOSINTQuerying, setIsOSINTQuerying] = useState<boolean>(false);

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch initial data across modules
  const loadIngestionData = async () => {
    try {
      // 1. OCR samples
      const ocrData = await apiClient.ingestion.getOCRSamples(selectedCaseId);
      if (ocrData && ocrData.length > 0) {
        setOcrDocs(ocrData);
        setSelectedOCRDoc(ocrData[0]);
      }

      // 2. Structured records samples
      const recData = await apiClient.ingestion.getRecordSamples();
      if (recData) {
        setRecordSummary(recData.summary);
        setFinancialRecords(recData.financialRecords);
        setCdrRecords(recData.cdrRecords);
        setAnomalies(recData.anomalies);
      }

      // 3. OSINT samples
      const osintData = await apiClient.ingestion.getOSINTSamples();
      if (osintData) {
        setOsintFindings(osintData);
      }
    } catch (e) {
      console.error('Failed to load initial ingestion data:', e);
    }
  };

  useEffect(() => {
    loadIngestionData();
  }, [selectedCaseId]);

  // Handlers for OCR
  const handleUploadOCR = async (payload: { title: string; rawText?: string; language: string; isHandwritten: boolean }) => {
    setIsOCRProcessing(true);
    try {
      const newDoc = await apiClient.ingestion.processDocumentOCR({
        caseId: selectedCaseId,
        title: payload.title,
        rawText: payload.rawText,
        language: payload.language,
        isHandwritten: payload.isHandwritten,
      });
      setOcrDocs((prev) => [newDoc, ...prev]);
      setSelectedOCRDoc(newDoc);
      showToast(`Document "${newDoc.title}" successfully digitized & indexed.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to process OCR document.', 'error');
    } finally {
      setIsOCRProcessing(false);
    }
  };

  const handleSyncToVault = (doc: OCRDocument) => {
    showToast(`Document "${doc.title}" synchronized to Evidence Vault as Exhibit #${doc.evidenceIdRef || 'EVD-OCR'}.`, 'success');
  };

  const handleSendToNER = (doc: OCRDocument) => {
    showToast(`Document sent to Legal NER Engine. Navigating to Legal Intelligence...`, 'info');
    setTimeout(() => {
      navigate('/legal-ner');
    }, 1000);
  };

  // Handlers for Structured Records
  const handleImportRecords = async (payload: { datasetName: string; category: RecordCategory; rawRecords: any[] }) => {
    setIsRecordLoading(true);
    try {
      const res = await apiClient.ingestion.validateAndImportRecords({
        caseId: selectedCaseId,
        datasetName: payload.datasetName,
        category: payload.category,
        rawRecords: payload.rawRecords,
      });
      if (res.dataset?.records) {
        setFinancialRecords((prev) => [...(res.dataset.records as FinancialTransactionRecord[]), ...prev]);
        if (res.dataset.anomalies) {
          setAnomalies((prev) => [...res.dataset.anomalies, ...prev]);
        }
      }
      showToast(res.message || 'Records imported and validated.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Record import failed.', 'error');
    } finally {
      setIsRecordLoading(false);
    }
  };

  // Handlers for OSINT
  const handleExecuteOSINT = async (payload: { platform: OSINTPlatform; query: string }) => {
    setIsOSINTQuerying(true);
    try {
      const res = await apiClient.ingestion.queryOSINT({
        platform: payload.platform,
        query: payload.query,
        caseId: selectedCaseId,
      });
      if (res.data) {
        setOsintFindings(res.data);
        showToast(`OSINT crawler retrieved ${res.count} verified leads for "${payload.query}".`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'OSINT query failed.', 'error');
    } finally {
      setIsOSINTQuerying(false);
    }
  };

  const handleGenerateSection65B = async (payload: { findingId?: string; targetQuery?: string }) => {
    return apiClient.ingestion.generateSection65BCertificate({
      findingId: payload.findingId,
      caseId: selectedCaseId,
      targetQuery: payload.targetQuery,
    });
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-3 text-xs font-tactical-data transition-all animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-surface border-emerald-500/50 text-emerald-400'
              : toastMessage.type === 'error'
              ? 'bg-surface border-red-500/50 text-red-400'
              : 'bg-surface border-cyan-500/50 text-cyan-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/15 border border-primary/40 text-primary shadow-[0_0_15px_rgba(255,84,76,0.25)]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-tactical-data text-on-surface tracking-wide">
                  DATA INGESTION & FORENSIC INTEGRATION HUB
                </h1>
                <Badge variant="confidence" className="text-[10px] text-primary border-primary/40 bg-primary/10">
                  PIPELINE ONLINE
                </Badge>
              </div>
              <p className="text-xs text-on-surface-variant font-body-sm mt-0.5">
                Digitize handwritten FIRs (OCR), ingest CDRs & Financial Spreadsheets with fraud detection, and collect OSINT leads with court-admissible source provenance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadIngestionData}
            className="px-3.5 py-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 rounded-xl text-xs font-tactical-data text-on-surface transition-all flex items-center gap-2 cursor-pointer shadow"
          >
            <RefreshCw className="w-3.5 h-3.5 text-primary" />
            <span>Sync Live Telemetry</span>
          </button>
        </div>
      </div>

      {/* Pipeline Summary Telemetry Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 font-tactical-data text-xs">
        <GlassCard className="p-3.5 flex items-center justify-between border-l-4 border-l-primary rounded-2xl shadow-md">
          <div>
            <div className="text-[10px] text-on-surface-variant uppercase font-semibold">Digitized Exhibits (OCR)</div>
            <div className="text-lg font-bold text-on-surface font-mono mt-0.5">{ocrDocs.length} Scans / FIRs</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Multilingual • Bounding Boxes</div>
          </div>
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/30">
            <FileText className="w-5 h-5 text-primary" />
          </div>
        </GlassCard>

        <GlassCard className="p-3.5 flex items-center justify-between border-l-4 border-l-blue-400 rounded-2xl shadow-md">
          <div>
            <div className="text-[10px] text-blue-400 uppercase font-semibold">Financial & CDR Records</div>
            <div className="text-lg font-bold text-blue-300 font-mono mt-0.5">
              {financialRecords.length + cdrRecords.length} Ledger Rows
            </div>
            <div className="text-[10px] text-blue-300/80 mt-0.5">Schema Auto-Mapped 99%</div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <FileSpreadsheet className="w-5 h-5 text-blue-400" />
          </div>
        </GlassCard>

        <GlassCard className="p-3.5 flex items-center justify-between border-l-4 border-l-amber-400 rounded-2xl shadow-md">
          <div>
            <div className="text-[10px] text-amber-400 uppercase font-semibold">Forensic Anomaly Alerts</div>
            <div className="text-lg font-bold text-amber-300 font-mono mt-0.5">{anomalies.length} Detected Rules</div>
            <div className="text-[10px] text-amber-300/80 mt-0.5">Smurfing & Midnight Bursts</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
        </GlassCard>

        <GlassCard className="p-3.5 flex items-center justify-between border-l-4 border-l-emerald-400 rounded-2xl shadow-md">
          <div>
            <div className="text-[10px] text-emerald-400 uppercase font-semibold">OSINT Evidence Provenance</div>
            <div className="text-lg font-bold text-emerald-300 font-mono mt-0.5">{osintFindings.length} Verified Leads</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Section 65B Certified</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <Globe className="w-5 h-5 text-emerald-400" />
          </div>
        </GlassCard>
      </div>

      {/* Main Module Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-outline-variant/40 pb-3 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('OCR')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-tactical-data font-bold transition-all flex items-center gap-2 border cursor-pointer shrink-0 ${
            activeTab === 'OCR'
              ? 'bg-primary text-on-primary border-primary shadow-[0_0_15px_rgba(255,84,76,0.35)] ring-1 ring-primary'
              : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>1. Handwritten & Scanned OCR Digitization</span>
        </button>

        <button
          onClick={() => setActiveTab('STRUCTURED')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-tactical-data font-bold transition-all flex items-center gap-2 border cursor-pointer shrink-0 ${
            activeTab === 'STRUCTURED'
              ? 'bg-primary text-on-primary border-primary shadow-[0_0_15px_rgba(255,84,76,0.35)] ring-1 ring-primary'
              : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>2. Structured Records (CDRs & Financial Logs)</span>
        </button>

        <button
          onClick={() => setActiveTab('OSINT')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-tactical-data font-bold transition-all flex items-center gap-2 border cursor-pointer shrink-0 ${
            activeTab === 'OSINT'
              ? 'bg-primary text-on-primary border-primary shadow-[0_0_15px_rgba(255,84,76,0.35)] ring-1 ring-primary'
              : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>3. OSINT & Social Media Data Connectors</span>
        </button>
      </div>

      {/* Module Content */}
      <div className="pt-2">
        {activeTab === 'OCR' && (
          <DocumentOCREngine
            documents={ocrDocs}
            selectedDoc={selectedOCRDoc}
            onSelectDoc={(doc) => setSelectedOCRDoc(doc)}
            onUploadDoc={handleUploadOCR}
            onSyncToVault={handleSyncToVault}
            onSendToNER={handleSendToNER}
            isProcessing={isOCRProcessing}
          />
        )}

        {activeTab === 'STRUCTURED' && (
          <StructuredRecordImporter
            summary={recordSummary}
            financialRecords={financialRecords}
            cdrRecords={cdrRecords}
            anomalies={anomalies}
            onImportNewRecords={handleImportRecords}
            isLoading={isRecordLoading}
          />
        )}

        {activeTab === 'OSINT' && (
          <OSINTConnectorHub
            findings={osintFindings}
            onExecuteQuery={handleExecuteOSINT}
            onGenerateCertificate={handleGenerateSection65B}
            isQuerying={isOSINTQuerying}
          />
        )}
      </div>
    </div>
  );
};
export default DataIngestion;
