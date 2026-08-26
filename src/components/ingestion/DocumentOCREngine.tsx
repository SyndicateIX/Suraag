import React, { useState } from 'react';
import {
  FileText,
  Upload,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Download,
  Copy,
  Languages,
  Eye,
  RefreshCw,
  Search,
  Scale,
  FolderPlus,
  Scan,
  Check,
  Shield,
  FileCheck,
  Tag,
  UserCheck,
  MapPin,
  Calendar,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { OCRDocument, OCRBoundingBox, DocumentLanguage } from '../../types/ingestion';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';

interface DocumentOCREngineProps {
  documents: OCRDocument[];
  selectedDoc: OCRDocument | null;
  onSelectDoc: (doc: OCRDocument) => void;
  onUploadDoc: (payload: { title: string; rawText?: string; language: string; isHandwritten: boolean }) => Promise<void>;
  onSyncToVault: (doc: OCRDocument) => void;
  onSendToNER: (doc: OCRDocument) => void;
  isProcessing?: boolean;
}

export const DocumentOCREngine: React.FC<DocumentOCREngineProps> = ({
  documents,
  selectedDoc,
  onSelectDoc,
  onUploadDoc,
  onSyncToVault,
  onSendToNER,
  isProcessing = false,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showConfidenceTags, setShowConfidenceTags] = useState<boolean>(true);
  const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'TEXT' | 'METADATA' | 'JSON'>('TEXT');
  const [selectedLanguage, setSelectedLanguage] = useState<DocumentLanguage>('auto');
  const [isHandwrittenMode, setIsHandwrittenMode] = useState<boolean>(true);
  const [customTextPrompt, setCustomTextPrompt] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [isScanningAnim, setIsScanningAnim] = useState<boolean>(false);

  const activeDoc = selectedDoc || documents[0] || null;

  const handleCopyText = () => {
    if (!activeDoc) return;
    navigator.clipboard.writeText(activeDoc.rawText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleExportJSON = () => {
    if (!activeDoc) return;
    const blob = new Blob([JSON.stringify(activeDoc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDoc.title.replace(/[^a-zA-Z0-9]/g, '_')}_OCR_Export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const triggerRescan = () => {
    setIsScanningAnim(true);
    setTimeout(() => setIsScanningAnim(false), 1500);
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-surface-container-low/90 border border-outline-variant/40 p-3 rounded-2xl backdrop-blur-md shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Script selection */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-xl border border-outline-variant/30 text-xs font-tactical-data text-on-surface">
            <Languages className="w-3.5 h-3.5 text-primary" />
            <span className="text-on-surface-variant font-medium">Script:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as DocumentLanguage)}
              className="bg-transparent text-primary font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value="auto" className="bg-surface">Auto-Detect (EN / HI / MR)</option>
              <option value="en" className="bg-surface">English (Legal Standard)</option>
              <option value="hi" className="bg-surface">Hindi (Devanagari)</option>
              <option value="mr" className="bg-surface">Marathi (State Police Format)</option>
            </select>
          </div>

          {/* Confidence tags toggle */}
          <button
            onClick={() => setShowConfidenceTags(!showConfidenceTags)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-tactical-data transition-all flex items-center gap-1.5 cursor-pointer ${
              showConfidenceTags
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-surface-container border-outline-variant/30 text-on-surface-variant'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>OCR Confidence Tags: {showConfidenceTags ? 'SHOWN' : 'HIDDEN'}</span>
          </button>

          {/* Handwritten mode */}
          <button
            onClick={() => setIsHandwrittenMode(!isHandwrittenMode)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-tactical-data transition-all flex items-center gap-1.5 cursor-pointer ${
              isHandwrittenMode
                ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(255,84,76,0.25)]'
                : 'bg-surface-container border-outline-variant/30 text-on-surface-variant'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Handwritten OCR: {isHandwrittenMode ? 'ACTIVE' : 'OFF'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <button
            onClick={triggerRescan}
            className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 rounded-xl text-xs font-tactical-data text-on-surface transition-all flex items-center gap-1.5 cursor-pointer"
            title="Re-run Vision OCR pipeline"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanningAnim ? 'animate-spin text-primary' : ''}`} />
            <span>AI Re-Scan</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-1.5 bg-primary text-on-primary rounded-xl text-xs font-tactical-data font-bold uppercase tracking-wider hover:bg-primary-dark transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,84,76,0.3)] cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left: Clean Interactive Document Sheet (7 cols) */}
        <div className="xl:col-span-7 space-y-3">
          {/* Preloaded Document Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <span className="text-[10px] font-tactical-data text-on-surface-variant/80 uppercase font-semibold whitespace-nowrap">
              EVIDENCE EXHIBITS:
            </span>
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => {
                  onSelectDoc(doc);
                  setSelectedFieldKey(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-tactical-data whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
                  activeDoc?.id === doc.id
                    ? 'bg-primary text-on-primary border-primary font-bold shadow-[0_0_12px_rgba(255,84,76,0.35)]'
                    : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{doc.title.length > 32 ? `${doc.title.slice(0, 32)}...` : doc.title}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-black/40 text-white font-mono font-bold">
                  {doc.ocrConfidence}%
                </span>
              </button>
            ))}
          </div>

          {/* Clean Document Viewport */}
          <GlassCard className="relative overflow-hidden flex flex-col h-[620px] border border-outline-variant/40 rounded-2xl shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-outline-variant/30 bg-surface-container/90 shrink-0">
              <div className="flex items-center gap-2.5">
                <Badge variant="confidence" className="text-[10px] text-primary border-primary/40 bg-primary/10">
                  {activeDoc?.documentType || 'DOCUMENT'}
                </Badge>
                <span className="text-xs font-tactical-data font-bold text-on-surface truncate max-w-sm">
                  {activeDoc?.title || 'No Document Selected'}
                </span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-surface-container rounded-lg border border-outline-variant/40 text-xs">
                  <button
                    onClick={() => setZoomLevel((prev) => Math.max(prev - 15, 70))}
                    className="p-1 hover:text-primary transition-colors cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 font-mono text-[10px] text-on-surface-variant font-bold">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel((prev) => Math.min(prev + 15, 140))}
                    className="p-1 hover:text-primary transition-colors cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(100)}
                    className="p-1 border-l border-outline-variant/30 hover:text-primary transition-colors cursor-pointer"
                    title="Reset Zoom"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Document Content Scroll View */}
            <div className="flex-1 overflow-auto p-5 bg-[#0e1117] relative flex items-start justify-center custom-scrollbar">
              {/* Scanning Animation */}
              {isScanningAnim && (
                <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_20px_#ff544c] animate-pulse absolute top-1/3 transition-all duration-700" />
                </div>
              )}

              {activeDoc ? (
                <div
                  className="w-full max-w-2xl bg-[#141820] border border-neutral-700/80 rounded-xl shadow-2xl p-6 space-y-4 text-xs font-mono transition-transform duration-150 origin-top"
                  style={{ transform: `scale(${zoomLevel / 100})` }}
                >
                  {/* Official Header */}
                  <div className="text-center border-b border-neutral-700 pb-3 relative">
                    <div className="text-[10px] uppercase tracking-widest text-primary font-tactical-data font-bold">
                      MAHARASHTRA POLICE DEPARTMENT • STATE CRIME INVESTIGATION BRANCH
                    </div>
                    <div className="text-sm font-bold text-neutral-100 font-tactical-data uppercase tracking-wider mt-1">
                      {activeDoc.title}
                    </div>
                    <div className="text-[9px] text-neutral-400 font-mono mt-0.5">
                      ELECTRONIC POLICE DIARY & FIRST INFORMATION REPORT • SEC. 154 CR.P.C.
                    </div>
                    {showConfidenceTags && (
                      <span className="absolute top-0 right-0 text-[8px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        OCR: {activeDoc.ocrConfidence}%
                      </span>
                    )}
                  </div>

                  {/* Field 1: FIR No & Police Station */}
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setSelectedFieldKey('firNumber')}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                        selectedFieldKey === 'firNumber'
                          ? 'border-primary bg-primary/15 ring-1 ring-primary'
                          : 'border-neutral-700/80 bg-neutral-900/50 hover:border-neutral-500'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-neutral-400">
                        <span>1. FIR NUMBER</span>
                        {showConfidenceTags && <span className="text-emerald-400 font-mono">97.8%</span>}
                      </div>
                      <div className="text-xs font-bold text-primary mt-1">
                        {activeDoc.structuredFields?.firNumber || '248/2026'}
                      </div>
                    </div>

                    <div
                      onClick={() => setSelectedFieldKey('policeStation')}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                        selectedFieldKey === 'policeStation'
                          ? 'border-blue-400 bg-blue-500/15 ring-1 ring-blue-400'
                          : 'border-neutral-700/80 bg-neutral-900/50 hover:border-neutral-500'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-neutral-400">
                        <span>2. POLICE STATION</span>
                        {showConfidenceTags && <span className="text-emerald-400 font-mono">98.2%</span>}
                      </div>
                      <div className="text-xs font-semibold text-neutral-200 mt-1 truncate">
                        {activeDoc.structuredFields?.policeStation || 'Kotwali Police Station, Pune'}
                      </div>
                    </div>
                  </div>

                  {/* Field 2: Acts & Sections */}
                  <div
                    onClick={() => setSelectedFieldKey('actsAndSections')}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer space-y-1.5 ${
                      selectedFieldKey === 'actsAndSections'
                        ? 'border-amber-400 bg-amber-500/15 ring-1 ring-amber-400'
                        : 'border-neutral-700/80 bg-neutral-900/50 hover:border-neutral-500'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-neutral-400">
                      <span>3. APPLICABLE ACTS & PENAL SECTIONS</span>
                      {showConfidenceTags && <span className="text-emerald-400 font-mono">95.4%</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeDoc.structuredFields?.actsAndSections?.map((sec, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Field 3: Accused Individuals */}
                  <div
                    onClick={() => setSelectedFieldKey('accusedNames')}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer space-y-1.5 ${
                      selectedFieldKey === 'accusedNames'
                        ? 'border-red-500 bg-red-500/20 ring-1 ring-red-500'
                        : 'border-red-900/40 bg-red-950/20 hover:border-red-700/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-red-400 font-bold">
                      <span>4. ACCUSED / SUSPECTED INDIVIDUALS</span>
                      {showConfidenceTags && <span className="text-emerald-400 font-mono font-normal">94.7%</span>}
                    </div>
                    <div className="text-xs font-semibold text-neutral-100 flex flex-wrap gap-2">
                      {activeDoc.structuredFields?.accusedNames?.map((acc, idx) => (
                        <span key={idx} className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-900/40 border border-red-500/40 text-red-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          <span>{acc}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Field 4: Occurrence Date/Time & Location */}
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setSelectedFieldKey('dateOfOccurrence')}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                        selectedFieldKey === 'dateOfOccurrence'
                          ? 'border-cyan-400 bg-cyan-500/15 ring-1 ring-cyan-400'
                          : 'border-neutral-700/80 bg-neutral-900/50 hover:border-neutral-500'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-neutral-400">
                        <span>5. DATE & TIME OF OFFENCE</span>
                        {showConfidenceTags && <span className="text-emerald-400 font-mono">96.8%</span>}
                      </div>
                      <div className="text-xs font-semibold text-neutral-200 mt-1">
                        {activeDoc.structuredFields?.dateOfOccurrence} ({activeDoc.structuredFields?.timeOfOccurrence})
                      </div>
                    </div>

                    <div
                      onClick={() => setSelectedFieldKey('placeOfOccurrence')}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                        selectedFieldKey === 'placeOfOccurrence'
                          ? 'border-cyan-400 bg-cyan-500/15 ring-1 ring-cyan-400'
                          : 'border-neutral-700/80 bg-neutral-900/50 hover:border-neutral-500'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-neutral-400">
                        <span>6. PLACE OF OCCURRENCE</span>
                        {showConfidenceTags && <span className="text-emerald-400 font-mono">95.9%</span>}
                      </div>
                      <div className="text-xs font-semibold text-cyan-300 mt-1 truncate">
                        {activeDoc.structuredFields?.placeOfOccurrence}
                      </div>
                    </div>
                  </div>

                  {/* Field 5: Recovered Exhibits */}
                  <div
                    onClick={() => setSelectedFieldKey('recoveredItems')}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer space-y-1 ${
                      selectedFieldKey === 'recoveredItems'
                        ? 'border-purple-400 bg-purple-500/15 ring-1 ring-purple-400'
                        : 'border-neutral-700/80 bg-neutral-900/50 hover:border-neutral-500'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-neutral-400">
                      <span>7. SEIZED EXHIBITS & FORENSIC ARTICLES</span>
                      {showConfidenceTags && <span className="text-emerald-400 font-mono">94.1%</span>}
                    </div>
                    <div className="text-xs text-neutral-300 space-y-0.5">
                      {activeDoc.structuredFields?.recoveredItems?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-purple-400" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Field 6: Narrative Excerpt & Stamp */}
                  <div className="relative p-3 rounded-lg bg-black/40 border border-neutral-800 space-y-1">
                    <div className="text-[10px] text-neutral-400 font-bold uppercase">
                      8. INVESTIGATING OFFICER'S RECORDED NARRATIVE:
                    </div>
                    <p className="text-neutral-300 font-serif italic text-[11px] leading-relaxed pr-24">
                      "{activeDoc.rawText.slice(0, 220)}..."
                    </p>

                    {/* Official Stamp Hologram */}
                    <div className="absolute bottom-2 right-2 border border-red-500/50 rounded-full w-20 h-20 flex flex-col items-center justify-center text-[7px] font-mono text-red-400 rotate-[-10deg] pointer-events-none uppercase tracking-tighter text-center bg-red-950/20">
                      <span>PUNE POLICE</span>
                      <span className="font-bold text-[8px] text-red-300">DIGITIZED</span>
                      <span>SEC 65B</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-on-surface-variant font-tactical-data my-auto">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-40 text-primary" />
                  <p>No document selected</p>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="px-4 py-2.5 border-t border-outline-variant/30 bg-surface-container/95 flex flex-wrap items-center justify-between gap-3 text-xs font-tactical-data">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>OCR Accuracy: <strong className="font-mono">{activeDoc?.ocrConfidence || 96}%</strong></span>
                </span>
                <span className="text-on-surface-variant/40">|</span>
                <span className="text-on-surface-variant">
                  Digitized Fields: <strong className="text-primary font-mono">8 Structured Segments</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => activeDoc && onSyncToVault(activeDoc)}
                  className="px-3 py-1.5 rounded-xl bg-secondary-container hover:bg-secondary text-on-secondary text-xs font-tactical-data font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Index to Vault</span>
                </button>
                <button
                  onClick={() => activeDoc && onSendToNER(activeDoc)}
                  className="px-3 py-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 text-xs font-tactical-data font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Extract Legal NER</span>
                </button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right: Digitized Intelligence & FIR Extraction (5 cols) */}
        <div className="xl:col-span-5 space-y-3">
          <GlassCard className="h-[655px] flex flex-col overflow-hidden border border-outline-variant/40 rounded-2xl shadow-xl">
            {/* Header Tabs */}
            <div className="flex items-center justify-between p-3 border-b border-outline-variant/30 bg-surface-container shrink-0">
              <div className="flex items-center gap-1 bg-surface-container-high p-1 rounded-xl border border-outline-variant/30">
                <button
                  onClick={() => setActiveTab('TEXT')}
                  className={`px-3 py-1 rounded-lg text-xs font-tactical-data font-bold transition-all cursor-pointer ${
                    activeTab === 'TEXT'
                      ? 'bg-primary text-on-primary shadow'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Digitized Text
                </button>
                <button
                  onClick={() => setActiveTab('METADATA')}
                  className={`px-3 py-1 rounded-lg text-xs font-tactical-data font-bold transition-all cursor-pointer ${
                    activeTab === 'METADATA'
                      ? 'bg-primary text-on-primary shadow'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Police FIR Fields
                </button>
                <button
                  onClick={() => setActiveTab('JSON')}
                  className={`px-3 py-1 rounded-lg text-xs font-tactical-data font-bold transition-all cursor-pointer ${
                    activeTab === 'JSON'
                      ? 'bg-primary text-on-primary shadow'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  JSON Schema
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopyText}
                  className="px-2 py-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-primary transition-colors text-xs flex items-center gap-1 font-tactical-data cursor-pointer"
                  title="Copy Text to Clipboard"
                >
                  {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copySuccess ? 'COPIED!' : 'COPY'}</span>
                </button>
                <button
                  onClick={handleExportJSON}
                  className="p-1.5 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-primary transition-colors text-xs flex items-center gap-1 font-tactical-data cursor-pointer"
                  title="Download JSON Payload"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {activeTab === 'TEXT' && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-on-surface-variant" />
                    <input
                      type="text"
                      placeholder="Search keywords in digitized text..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl pl-9 pr-3 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary font-mono"
                    />
                  </div>

                  <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4 font-mono text-xs leading-relaxed min-h-[480px] whitespace-pre-wrap text-neutral-200">
                    {activeDoc?.rawText || 'No text extracted.'}
                  </div>
                </div>
              )}

              {activeTab === 'METADATA' && (
                <div className="space-y-3 font-tactical-data text-xs">
                  <div className="bg-primary/10 border border-primary/30 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase text-primary font-bold">
                        Criminal Procedure & FIR Extractor
                      </div>
                      <div className="text-xs text-neutral-200 mt-0.5">
                        Aligned with Bharatiya Sakshya Adhiniyam & IPC
                      </div>
                    </div>
                    <Badge variant="active" className="text-xs text-emerald-400 border-emerald-500/40 bg-emerald-500/10">
                      PARSED OK
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl">
                      <div className="text-[10px] text-on-surface-variant uppercase">FIR Number</div>
                      <div className="text-sm font-bold text-primary font-mono mt-0.5">
                        {activeDoc?.structuredFields?.firNumber || 'N/A'}
                      </div>
                    </div>
                    <div className="p-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl">
                      <div className="text-[10px] text-on-surface-variant uppercase">Police Station</div>
                      <div className="text-xs font-semibold text-neutral-200 mt-1 truncate">
                        {activeDoc?.structuredFields?.policeStation || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Acts & Sections */}
                  <div className="p-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl space-y-2">
                    <div className="text-[10px] text-on-surface-variant uppercase flex items-center justify-between">
                      <span>Charged Acts & Sections</span>
                      <span className="text-amber-400 font-mono font-bold">
                        {activeDoc?.structuredFields?.actsAndSections?.length || 0} SECTIONS
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeDoc?.structuredFields?.actsAndSections?.map((sec, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/40 rounded-lg text-amber-300 font-mono text-[11px] font-semibold"
                        >
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Accused & Complainant */}
                  <div className="space-y-2">
                    <div className="p-3 bg-surface-container-lowest border border-red-500/30 rounded-xl">
                      <div className="text-[10px] text-red-400 uppercase font-bold">
                        Accused / Named Suspects
                      </div>
                      <div className="mt-1.5 space-y-1">
                        {activeDoc?.structuredFields?.accusedNames?.map((name, idx) => (
                          <div key={idx} className="text-xs font-semibold text-neutral-100 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-400" />
                            <span>{name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl">
                      <div className="text-[10px] text-on-surface-variant uppercase">
                        Complainant / Reporting Officer
                      </div>
                      <div className="text-xs font-semibold text-neutral-200 mt-1">
                        {activeDoc?.structuredFields?.complainantName || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Recovered Items */}
                  <div className="p-3 bg-surface-container-lowest border border-purple-500/30 rounded-xl">
                    <div className="text-[10px] text-purple-300 uppercase font-bold">
                      Recovered Exhibits & Physical Seizures
                    </div>
                    <div className="mt-1.5 space-y-1">
                      {activeDoc?.structuredFields?.recoveredItems?.map((item, idx) => (
                        <div key={idx} className="text-xs text-neutral-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'JSON' && (
                <pre className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                  {JSON.stringify(activeDoc, null, 2)}
                </pre>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface border border-outline-variant/60 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-on-surface font-tactical-data">
                  Upload Scanned Document / FIR Memo
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-on-surface-variant hover:text-on-surface text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-tactical-data text-on-surface-variant uppercase">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Pune Crime Branch FIR No. 249/2026"
                  className="w-full bg-surface-container border border-outline-variant/40 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary mt-1"
                  id="doc-upload-title"
                />
              </div>

              <div>
                <label className="text-xs font-tactical-data text-on-surface-variant uppercase">
                  Paste OCR Text or Raw Transcript (Optional AI Vision Simulation)
                </label>
                <textarea
                  rows={5}
                  value={customTextPrompt}
                  onChange={(e) => setCustomTextPrompt(e.target.value)}
                  placeholder="Paste text or leave blank for multi-modal simulation..."
                  className="w-full bg-surface-container border border-outline-variant/40 rounded-xl p-3 text-xs text-on-surface focus:outline-none focus:border-primary mt-1 font-mono"
                />
              </div>

              <div className="border-2 border-dashed border-outline-variant/60 rounded-2xl p-6 text-center hover:border-primary/60 transition-colors cursor-pointer bg-surface-container-low">
                <Upload className="w-8 h-8 mx-auto mb-2 text-primary opacity-80" />
                <p className="text-xs font-tactical-data text-on-surface font-semibold">
                  Drag & Drop Scanned PDF, TIFF, or Image files here
                </p>
                <p className="text-[10px] text-on-surface-variant mt-1">Supports up to 50MB (PDF, PNG, JPG, TIFF)</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/30">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-tactical-data text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isProcessing}
                onClick={async () => {
                  const titleInput = (document.getElementById('doc-upload-title') as HTMLInputElement)?.value;
                  await onUploadDoc({
                    title: titleInput || 'Digitized Police FIR Record',
                    rawText: customTextPrompt || undefined,
                    language: selectedLanguage,
                    isHandwritten: isHandwrittenMode,
                  });
                  setShowUploadModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-tactical-data font-bold uppercase tracking-wider hover:bg-primary-dark transition-all flex items-center gap-2 cursor-pointer"
              >
                {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Execute Digitization Pipeline</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
