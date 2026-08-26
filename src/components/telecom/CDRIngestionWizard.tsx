import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Database,
  Radio,
  Clock,
  MapPin,
  PhoneCall,
  Hash,
  ShieldAlert,
  Loader2,
  FileText,
} from 'lucide-react';
import { ColumnMapping, UploadPreviewResponse, SampleTemplateInfo } from '../../types/telecom';
import { uploadPreview, ingestCDR, getSampleTemplates } from '../../services/telecomService';

interface CDRIngestionWizardProps {
  caseId: string;
  onIngestSuccess: (datasetId: string) => void;
  onClose?: () => void;
}

export const CDRIngestionWizard: React.FC<CDRIngestionWizardProps> = ({
  caseId,
  onIngestSuccess,
  onClose,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileBase64, setFileBase64] = useState<string>('');
  const [operatorName, setOperatorName] = useState<string>('Bharti Airtel');
  const [targetNumber, setTargetNumber] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [previewData, setPreviewData] = useState<UploadPreviewResponse | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    callingNumber: '',
    calledNumber: '',
    timestamp: '',
    durationSeconds: '',
    callType: '',
    cellTowerId: '',
    lac: '',
    latitude: '',
    longitude: '',
    azimuth: '',
    imeiCalling: '',
    imeiCalled: '',
    firstLocation: '',
  });

  const [sampleTemplates, setSampleTemplates] = useState<Record<string, SampleTemplateInfo>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSampleTemplates()
      .then(res => setSampleTemplates(res.templates))
      .catch(() => {});
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    processFile(selectedFile);
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setError(null);
    setLoading(true);

    const isExcel = selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const result = ev.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(result);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        setFileBase64(base64);
        setFileContent('');

        try {
          const res = await uploadPreview({
            fileName: selectedFile.name,
            fileBase64: base64,
          });
          setPreviewData(res);
          setOperatorName(res.detectedOperator);
          applyAutoMapping(res);
          setStep(2);
        } catch (err: any) {
          setError(err.message || 'Failed to preview file');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      // CSV or TXT
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const text = ev.target?.result as string;
        setFileContent(text);
        setFileBase64('');

        try {
          const res = await uploadPreview({
            fileName: selectedFile.name,
            fileContent: text,
          });
          setPreviewData(res);
          setOperatorName(res.detectedOperator);
          applyAutoMapping(res);
          setStep(2);
        } catch (err: any) {
          setError(err.message || 'Failed to preview file');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const loadPresetSample = (presetKey: string) => {
    const template = sampleTemplates[presetKey];
    if (!template) return;

    setError(null);
    setLoading(true);
    setFileName(`${presetKey.toUpperCase()}_DUMP.csv`);
    setFileContent(template.csvText);
    setFileBase64('');
    setOperatorName(template.operator);

    uploadPreview({
      fileName: `${presetKey.toUpperCase()}_DUMP.csv`,
      fileContent: template.csvText,
    })
      .then(res => {
        setPreviewData(res);
        setOperatorName(template.operator);
        applyAutoMapping(res);
        setStep(2);
      })
      .catch(err => {
        setError(err.message || 'Failed to parse preset template');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const applyAutoMapping = (res: UploadPreviewResponse) => {
    const s = res.suggestedMapping;
    setColumnMapping({
      callingNumber: s.callingNumber || res.headers[0] || '',
      calledNumber: s.calledNumber || res.headers[1] || '',
      timestamp: s.timestamp || res.headers[2] || '',
      durationSeconds: s.durationSeconds || '',
      callType: s.callType || '',
      cellTowerId: s.cellTowerId || '',
      lac: s.lac || '',
      latitude: s.latitude || '',
      longitude: s.longitude || '',
      azimuth: s.azimuth || '',
      imeiCalling: s.imeiCalling || '',
      imeiCalled: s.imeiCalled || '',
      firstLocation: s.firstLocation || '',
    });
  };

  const handleExecuteIngest = async () => {
    if (!columnMapping.callingNumber || !columnMapping.calledNumber || !columnMapping.timestamp) {
      setError('Please select mappings for Caller MSISDN, Receiver MSISDN, and Timestamp.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await ingestCDR({
        caseId,
        fileName: fileName || 'TELECOM_CDR_DATA.csv',
        operatorName,
        targetNumber,
        mapping: columnMapping,
        fileContent: fileContent || undefined,
        fileBase64: fileBase64 || undefined,
      });

      if (res.success) {
        setStep(3);
        setTimeout(() => {
          onIngestSuccess(res.datasetId);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Ingestion failed');
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-950/95 border border-zinc-800 rounded-xl shadow-2xl p-6 text-zinc-100 max-w-5xl mx-auto backdrop-blur-xl">
      {/* Wizard Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
              Telecommunication CDR Ingestion Wizard
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                MULTI-OPERATOR ENGINE
              </span>
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Parses CSV, XLSX, and TXT telecom dumps with automated column matching & sector normalization.
            </p>
          </div>
        </div>

        {/* Stepper indicator */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className={`px-2.5 py-1 rounded ${step === 1 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-zinc-900 text-zinc-500'}`}>
            1. Upload
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className={`px-2.5 py-1 rounded ${step === 2 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-zinc-900 text-zinc-500'}`}>
            2. Schema Map
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className={`px-2.5 py-1 rounded ${step === 3 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-zinc-900 text-zinc-500'}`}>
            3. Processed
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3.5 bg-red-950/40 border border-red-800/60 rounded-lg text-red-300 text-xs font-mono flex items-center gap-3">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: FILE UPLOAD & PRESET TEMPLATES */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Drag & Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-700 hover:border-emerald-500/60 rounded-xl p-8 text-center cursor-pointer transition-all bg-zinc-900/40 hover:bg-zinc-900/70 group relative overflow-hidden"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="p-4 rounded-full bg-zinc-800/80 group-hover:bg-emerald-500/20 text-zinc-400 group-hover:text-emerald-400 transition-colors border border-zinc-700 group-hover:border-emerald-500/40">
                {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
              </div>
              <div>
                <h3 className="font-semibold text-sm text-zinc-200">
                  {loading ? 'Analyzing Telecom Dump Structure...' : 'Drop CDR / IPDR / Tower Dump File Here'}
                </h3>
                <p className="text-xs text-zinc-500 font-mono mt-1">
                  Supports .CSV, .XLSX, .XLS, .TXT (Airtel, Reliance Jio, Vi, BSNL, AT&T, Vodafone)
                </p>
              </div>
            </div>
          </div>

          {/* Forensic Preset Dumps for Instant Demonstration */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                Quick Load Forensic CDR Presets (1-Click Test)
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => loadPresetSample('airtel_lohegaon')}
                disabled={loading}
                className="flex flex-col text-left p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 transition-all group"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="text-xs font-bold text-zinc-200 group-hover:text-emerald-400 font-mono">
                    Bharti Airtel
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                    Doomed Triangle
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  Lohegaon Hill & Kalyani Nagar sector dump capturing Diya & Chetany coordination.
                </p>
              </button>

              <button
                type="button"
                onClick={() => loadPresetSample('jio_standard')}
                disabled={loading}
                className="flex flex-col text-left p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800 hover:border-blue-500/50 hover:bg-blue-950/20 transition-all group"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="text-xs font-bold text-zinc-200 group-hover:text-blue-400 font-mono">
                    Reliance Jio
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 font-mono">
                    IPDR Standard
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  A_PARTY / B_PARTY schema with cell tower lat/lng & duration breakdown.
                </p>
              </button>

              <button
                type="button"
                onClick={() => loadPresetSample('vi_cdr')}
                disabled={loading}
                className="flex flex-col text-left p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800 hover:border-amber-500/50 hover:bg-amber-950/20 transition-all group"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="text-xs font-bold text-zinc-200 group-hover:text-amber-400 font-mono">
                    Vodafone Idea (Vi)
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono">
                    Azimuth Dump
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  Originating/Terminating logs with antenna azimuth angles and rapid burn pings.
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: SCHEMA & COLUMN MAPPING */}
      {step === 2 && previewData && (
        <div className="space-y-6">
          {/* File Metadata Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 font-mono text-xs">
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase">File Name</span>
              <span className="text-zinc-200 font-semibold truncate block">{fileName}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase">Detected Operator</span>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-emerald-400 text-xs w-full focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase">Est. Records</span>
              <span className="text-emerald-400 font-bold">{previewData.totalRowsEst} rows</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase">Target MSISDN (Optional)</span>
              <input
                type="text"
                placeholder="+91..."
                value={targetNumber}
                onChange={(e) => setTargetNumber(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-zinc-200 text-xs w-full focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Interactive Mapping Grid */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Database className="w-4 h-4" /> Column Mapping Matrix
              </h3>
              <span className="text-[11px] text-zinc-400 font-mono">
                Auto-matched using Suraag Telecom Heuristics
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              {/* Caller MSISDN */}
              <div className="space-y-1.5 bg-zinc-950/70 p-3 rounded-lg border border-zinc-800">
                <label className="text-zinc-300 font-semibold flex items-center gap-1.5 text-[11px]">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" /> Caller MSISDN (Calling Party) *
                </label>
                <select
                  value={columnMapping.callingNumber}
                  onChange={(e) => setColumnMapping({ ...columnMapping, callingNumber: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded px-2.5 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">-- Select Header --</option>
                  {previewData.headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Receiver MSISDN */}
              <div className="space-y-1.5 bg-zinc-950/70 p-3 rounded-lg border border-zinc-800">
                <label className="text-zinc-300 font-semibold flex items-center gap-1.5 text-[11px]">
                  <PhoneCall className="w-3.5 h-3.5 text-cyan-400" /> Receiver MSISDN (Called Party) *
                </label>
                <select
                  value={columnMapping.calledNumber}
                  onChange={(e) => setColumnMapping({ ...columnMapping, calledNumber: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded px-2.5 py-1.5 text-xs focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">-- Select Header --</option>
                  {previewData.headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Timestamp */}
              <div className="space-y-1.5 bg-zinc-950/70 p-3 rounded-lg border border-zinc-800">
                <label className="text-zinc-300 font-semibold flex items-center gap-1.5 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Call Date & Time *
                </label>
                <select
                  value={columnMapping.timestamp}
                  onChange={(e) => setColumnMapping({ ...columnMapping, timestamp: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded px-2.5 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
                >
                  <option value="">-- Select Header --</option>
                  {previewData.headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div className="space-y-1.5 bg-zinc-950/70 p-3 rounded-lg border border-zinc-800">
                <label className="text-zinc-300 font-semibold flex items-center gap-1.5 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" /> Call Duration (Seconds)
                </label>
                <select
                  value={columnMapping.durationSeconds || ''}
                  onChange={(e) => setColumnMapping({ ...columnMapping, durationSeconds: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded px-2.5 py-1.5 text-xs focus:border-zinc-500 focus:outline-none"
                >
                  <option value="">-- (Optional / Default 0) --</option>
                  {previewData.headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Cell Tower ID */}
              <div className="space-y-1.5 bg-zinc-950/70 p-3 rounded-lg border border-zinc-800">
                <label className="text-zinc-300 font-semibold flex items-center gap-1.5 text-[11px]">
                  <Radio className="w-3.5 h-3.5 text-indigo-400" /> Cell Tower / Sector ID
                </label>
                <select
                  value={columnMapping.cellTowerId || ''}
                  onChange={(e) => setColumnMapping({ ...columnMapping, cellTowerId: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded px-2.5 py-1.5 text-xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">-- (Optional) --</option>
                  {previewData.headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Call Type */}
              <div className="space-y-1.5 bg-zinc-950/70 p-3 rounded-lg border border-zinc-800">
                <label className="text-zinc-300 font-semibold flex items-center gap-1.5 text-[11px]">
                  <Hash className="w-3.5 h-3.5 text-zinc-400" /> Call Type (VOICE, SMS, DATA)
                </label>
                <select
                  value={columnMapping.callType || ''}
                  onChange={(e) => setColumnMapping({ ...columnMapping, callType: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded px-2.5 py-1.5 text-xs focus:border-zinc-500 focus:outline-none"
                >
                  <option value="">-- (Optional / Default VOICE) --</option>
                  {previewData.headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Latitude */}
              <div className="space-y-1.5 bg-zinc-950/70 p-3 rounded-lg border border-zinc-800">
                <label className="text-zinc-300 font-semibold flex items-center gap-1.5 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" /> Tower Latitude
                </label>
                <select
                  value={columnMapping.latitude || ''}
                  onChange={(e) => setColumnMapping({ ...columnMapping, latitude: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded px-2.5 py-1.5 text-xs focus:border-rose-500 focus:outline-none"
                >
                  <option value="">-- (Optional) --</option>
                  {previewData.headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Longitude */}
              <div className="space-y-1.5 bg-zinc-950/70 p-3 rounded-lg border border-zinc-800">
                <label className="text-zinc-300 font-semibold flex items-center gap-1.5 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" /> Tower Longitude
                </label>
                <select
                  value={columnMapping.longitude || ''}
                  onChange={(e) => setColumnMapping({ ...columnMapping, longitude: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded px-2.5 py-1.5 text-xs focus:border-rose-500 focus:outline-none"
                >
                  <option value="">-- (Optional) --</option>
                  {previewData.headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* IMEI Calling */}
              <div className="space-y-1.5 bg-zinc-950/70 p-3 rounded-lg border border-zinc-800">
                <label className="text-zinc-300 font-semibold flex items-center gap-1.5 text-[11px]">
                  <Hash className="w-3.5 h-3.5 text-purple-400" /> IMEI (Calling Device)
                </label>
                <select
                  value={columnMapping.imeiCalling || ''}
                  onChange={(e) => setColumnMapping({ ...columnMapping, imeiCalling: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded px-2.5 py-1.5 text-xs focus:border-purple-500 focus:outline-none"
                >
                  <option value="">-- (Optional) --</option>
                  {previewData.headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Raw Preview Table (Top 5 rows) */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-xs font-mono uppercase text-zinc-400 mb-2.5 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Source File Sample Rows (Top 5)
            </h4>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-[11px] font-mono text-left text-zinc-300">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/80 text-zinc-400">
                    {previewData.headers.slice(0, 7).map(h => (
                      <th key={h} className="px-3 py-2 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.previewRows.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="border-b border-zinc-800/40 hover:bg-zinc-900/40">
                      {previewData.headers.slice(0, 7).map(h => (
                        <td key={h} className="px-3 py-1.5 whitespace-nowrap text-zinc-300 truncate max-w-[150px]">
                          {String(row[h] || '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono flex items-center gap-2 transition-colors border border-zinc-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Upload
            </button>

            <button
              type="button"
              onClick={handleExecuteIngest}
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Ingesting & Calculating Topology...
                </>
              ) : (
                <>
                  Execute Ingestion & Compute Graphs <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SUCCESS STATE */}
      {step === 3 && (
        <div className="text-center py-10 space-y-4 font-mono">
          <div className="inline-flex p-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-base font-bold text-zinc-100 uppercase tracking-wider">
            CDR Metadata Successfully Ingested
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Topology network computed, centrality indices assigned, and spatial-temporal co-presence calculated. Redirecting to Crime Noir Telecom Dashboard...
          </p>
        </div>
      )}
    </div>
  );
};
