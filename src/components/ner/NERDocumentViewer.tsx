import React, { useState } from 'react';
import {
  FileText,
  Search,
  Sparkles,
  ShieldAlert,
  MapPin,
  Clock,
  Car,
  Crosshair,
  Phone,
  Layers,
  ChevronRight,
  Info,
  CheckCircle2,
  Filter,
  Plus,
  Play
} from 'lucide-react';
import { ExtractedEntity, ExtractedEntityType, NERDocument, LegalPenalCode } from '../../types';

interface NERDocumentViewerProps {
  documents: NERDocument[];
  selectedDocId: string;
  onSelectDoc: (id: string) => void;
  onExtractCustomText: (text: string, title: string, type: string) => Promise<void>;
  onInspectPenalCode: (code: LegalPenalCode) => void;
  isExtracting?: boolean;
}

export const NERDocumentViewer: React.FC<NERDocumentViewerProps> = ({
  documents,
  selectedDocId,
  onSelectDoc,
  onExtractCustomText,
  onInspectPenalCode,
  isExtracting = false,
}) => {
  const [activeFilterTypes, setActiveFilterTypes] = useState<Record<ExtractedEntityType, boolean>>({
    PERSON: true,
    ALIAS: true,
    PENAL_CODE: true,
    LOCATION: true,
    VEHICLE: true,
    WEAPON: true,
    TIMESTAMP: true,
    PHONE: true,
    ORGANIZATION: true,
    FINANCIAL: true,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<ExtractedEntity | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customText, setCustomText] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customType, setCustomType] = useState('FIR');

  const currentDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  const toggleFilter = (type: ExtractedEntityType) => {
    setActiveFilterTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const getEntityStyle = (type: ExtractedEntityType) => {
    switch (type) {
      case 'PERSON':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.25)]';
      case 'ALIAS':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/50 hover:bg-teal-500/30 shadow-[0_0_10px_rgba(20,184,166,0.25)]';
      case 'PENAL_CODE':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50 hover:bg-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse-slow cursor-pointer';
      case 'LOCATION':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.25)]';
      case 'TIMESTAMP':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.25)]';
      case 'WEAPON':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50 hover:bg-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.25)]';
      case 'VEHICLE':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 hover:bg-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.25)]';
      case 'PHONE':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50 hover:bg-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.25)]';
      default:
        return 'bg-zinc-500/20 text-zinc-300 border-zinc-500/50 hover:bg-zinc-500/30';
    }
  };

  const getEntityIcon = (type: ExtractedEntityType) => {
    switch (type) {
      case 'PERSON':
      case 'ALIAS':
        return <Sparkles className="w-3 h-3 inline mr-1" />;
      case 'PENAL_CODE':
        return <ShieldAlert className="w-3 h-3 inline mr-1 text-rose-400" />;
      case 'LOCATION':
        return <MapPin className="w-3 h-3 inline mr-1 text-cyan-400" />;
      case 'TIMESTAMP':
        return <Clock className="w-3 h-3 inline mr-1 text-amber-400" />;
      case 'WEAPON':
        return <Crosshair className="w-3 h-3 inline mr-1 text-purple-400" />;
      case 'VEHICLE':
        return <Car className="w-3 h-3 inline mr-1 text-indigo-400" />;
      case 'PHONE':
        return <Phone className="w-3 h-3 inline mr-1 text-blue-400" />;
      default:
        return <Info className="w-3 h-3 inline mr-1" />;
    }
  };

  // Render annotated text with highlighted spans
  const renderHighlightedDocument = () => {
    if (!currentDoc || !currentDoc.rawText) return null;

    const text = currentDoc.rawText;
    const entities = (currentDoc.entities || [])
      .filter((e) => activeFilterTypes[e.entityType])
      .sort((a, b) => a.startIndex - b.startIndex);

    // Build non-overlapping spans
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      if (entity.startIndex < lastIndex) continue; // Skip overlaps

      // Text before entity
      if (entity.startIndex > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`}>
            {text.substring(lastIndex, entity.startIndex)}
          </span>
        );
      }

      // Entity highlighted tag
      const entitySubstring = text.substring(entity.startIndex, entity.endIndex);
      const isSelected = selectedEntity?.id === entity.id;

      elements.push(
        <mark
          key={`entity-${entity.id}-${i}`}
          onClick={() => {
            setSelectedEntity(entity);
            if (entity.entityType === 'PENAL_CODE' && entity.metadata?.penalCodeDetails) {
              onInspectPenalCode(entity.metadata.penalCodeDetails);
            }
          }}
          className={`inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded border text-xs font-mono font-medium transition-all cursor-pointer ${getEntityStyle(
            entity.entityType
          )} ${isSelected ? 'ring-2 ring-white scale-105 z-10' : ''}`}
          title={`${entity.entityType}: ${entity.textValue} (Confidence: ${Math.round(
            (entity.confidenceScore || 0.9) * 100
          )}%)`}
        >
          {getEntityIcon(entity.entityType)}
          <span>{entitySubstring || entity.textValue}</span>
          {entity.entityType === 'PENAL_CODE' && (
            <span className="ml-1 px-1 py-0.2 bg-rose-950/80 border border-rose-500/40 rounded text-[9px] text-rose-300 font-bold uppercase">
              {entity.metadata?.penalCodeDetails?.statute || 'IPC'}
            </span>
          )}
        </mark>
      );

      lastIndex = entity.endIndex;
    }

    // Trailing text
    if (lastIndex < text.length) {
      elements.push(<span key={`text-end`}>{text.substring(lastIndex)}</span>);
    }

    return elements;
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    await onExtractCustomText(customText, customTitle || 'Custom Legal Brief', customType);
    setShowCustomModal(false);
    setCustomText('');
    setCustomTitle('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[720px]">
      {/* LEFT COLUMN: Document Index & Live Extractor Button */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-tactical-data uppercase tracking-widest text-zinc-300 font-bold">
                Source Document Vault
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">
              {documents.length} Dossiers
            </span>
          </div>

          {/* Quick Search */}
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search case files & exhibits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-900/90 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-primary transition-colors font-tactical-data"
            />
          </div>

          {/* Document list cards */}
          <div className="space-y-2 max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
            {documents
              .filter(
                (d) =>
                  !searchQuery ||
                  d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  d.documentType.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((doc) => {
                const isSelected = doc.id === currentDoc?.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => onSelectDoc(doc.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-zinc-900/90 border-primary/60 shadow-[0_0_15px_rgba(255,84,76,0.15)] ring-1 ring-primary/40'
                        : 'bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-900/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4
                        className={`text-xs font-tactical-data font-bold truncate ${
                          isSelected ? 'text-primary' : 'text-zinc-200 group-hover:text-white'
                        }`}
                      >
                        {doc.title}
                      </h4>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono shrink-0 uppercase ${
                          doc.documentType === 'FIR'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : doc.documentType === 'CHARGE_SHEET'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : doc.documentType === 'WITNESS_STATEMENT'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        {doc.documentType}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <span>{new Date(doc.processedDate).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400">
                          {doc.entitiesCount || (doc.entities && doc.entities.length) || 0} entities
                        </span>
                        <span className="text-rose-400 font-semibold">
                          {doc.penalCodesCount || 0} charges
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Ingestion Trigger Button */}
          <button
            onClick={() => setShowCustomModal(true)}
            className="w-full mt-3 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent hover:from-primary/30 border border-primary/40 rounded-lg text-xs font-tactical-data text-primary font-bold transition-all shadow-[0_0_12px_rgba(255,84,76,0.2)]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ingest & Extract New Legal Brief</span>
          </button>
        </div>

        {/* Category Filter Toggle Palette */}
        <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-tactical-data uppercase tracking-widest text-zinc-300 font-bold">
                Entity Highlight Layers
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">Live Overlay</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-tactical-data">
            {[
              { type: 'PERSON' as ExtractedEntityType, label: 'Persons & Accused', color: 'emerald' },
              { type: 'ALIAS' as ExtractedEntityType, label: 'Monikers / Aliases', color: 'teal' },
              { type: 'PENAL_CODE' as ExtractedEntityType, label: 'IPC / BNS Sections', color: 'rose' },
              { type: 'LOCATION' as ExtractedEntityType, label: 'Locations & Towers', color: 'cyan' },
              { type: 'TIMESTAMP' as ExtractedEntityType, label: 'Timestamps & Dates', color: 'amber' },
              { type: 'WEAPON' as ExtractedEntityType, label: 'Weapons & Toxins', color: 'purple' },
              { type: 'VEHICLE' as ExtractedEntityType, label: 'Vehicle Registrations', color: 'indigo' },
              { type: 'PHONE' as ExtractedEntityType, label: 'Phone & Intercepts', color: 'blue' },
            ].map((item) => {
              const active = activeFilterTypes[item.type];
              return (
                <button
                  key={item.type}
                  onClick={() => toggleFilter(item.type)}
                  className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
                    active
                      ? 'bg-zinc-900 border-zinc-700 text-zinc-200 shadow-sm'
                      : 'bg-zinc-950/50 border-zinc-900 text-zinc-600'
                  }`}
                >
                  <span className="truncate text-[11px]">{item.label}</span>
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      active ? `bg-${item.color}-400 shadow-[0_0_6px_currentColor]` : 'bg-zinc-800'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Document Highlight Viewer & Entity Details */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-5 shadow-2xl backdrop-blur-md flex-1 flex flex-col">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <h2 className="text-base font-bold text-white font-tactical-data tracking-wide">
                  {currentDoc?.title || 'Legal Text Dossier'}
                </h2>
              </div>
              <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                Case File ID: <span className="text-zinc-300">{currentDoc?.caseId}</span> • Ingested:{' '}
                {new Date(currentDoc?.processedDate || Date.now()).toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isExtracting && (
                <div className="flex items-center gap-2 px-2.5 py-1 bg-primary/10 border border-primary/30 rounded-lg text-primary text-xs font-tactical-data animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Gemini LLM Extracting...</span>
                </div>
              )}
              <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs font-mono text-zinc-300">
                {currentDoc?.entities?.length || 0} Entities Extracted
              </span>
            </div>
          </div>

          {/* Interactive Document Body */}
          <div className="flex-1 bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-5 overflow-y-auto max-h-[500px] custom-scrollbar text-zinc-300 font-mono text-xs leading-relaxed whitespace-pre-wrap selection:bg-primary/30 selection:text-white">
            {renderHighlightedDocument()}
          </div>

          {/* Selected Entity Inspector Banner */}
          {selectedEntity && (
            <div className="mt-4 p-3 bg-zinc-900/90 border border-zinc-800 rounded-lg flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${getEntityStyle(selectedEntity.entityType)}`}>
                  {getEntityIcon(selectedEntity.entityType)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-tactical-data">
                      {selectedEntity.textValue}
                    </span>
                    <span className="px-1.5 py-0.2 bg-zinc-800 rounded text-[10px] font-mono text-zinc-400">
                      {selectedEntity.entityType}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      Confidence: {Math.round(selectedEntity.confidenceScore * 100)}%
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-400 truncate max-w-md mt-0.5">
                    Context: "{selectedEntity.contextSnippet}"
                  </p>
                </div>
              </div>

              {selectedEntity.entityType === 'PENAL_CODE' && selectedEntity.metadata?.penalCodeDetails && (
                <button
                  onClick={() => onInspectPenalCode(selectedEntity.metadata!.penalCodeDetails!)}
                  className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-tactical-data rounded-lg transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Inspect Penal Code Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Ingest Custom Document */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-tactical-data font-bold text-white uppercase tracking-wider">
                  Ingest Legal Document & Extract Entities
                </h3>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-zinc-500 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-tactical-data text-zinc-400 mb-1">
                    Document Title / Exhibit No.
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Interrogation Log - Suspect 02"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-primary font-tactical-data"
                  />
                </div>
                <div>
                  <label className="block text-xs font-tactical-data text-zinc-400 mb-1">
                    Document Classification
                  </label>
                  <select
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-primary font-tactical-data"
                  >
                    <option value="FIR">First Information Report (FIR)</option>
                    <option value="CHARGE_SHEET">Police Charge Sheet</option>
                    <option value="WITNESS_STATEMENT">Witness Statement (Sec 161)</option>
                    <option value="INTERCEPT_TRANSCRIPT">Telecom Audio Intercept</option>
                    <option value="FORENSIC_REPORT">CFSL Forensic / Ballistics</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-tactical-data text-zinc-400 mb-1">
                  Raw Document Text / Verbatim Transcript
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder="Paste police FIR, witness statement, or intercept transcript here. The engine will extract Persons, IPC sections, weapons, vehicles, timestamps, and locations automatically..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-primary leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-tactical-data text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isExtracting}
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs font-tactical-data rounded-lg shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isExtracting ? 'Extracting...' : 'Run NER Extraction Engine'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
