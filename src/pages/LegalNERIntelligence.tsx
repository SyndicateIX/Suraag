import React, { useState, useEffect } from 'react';
import {
  FileText,
  GitMerge,
  Users,
  ShieldAlert,
  Sparkles,
  Scale,
  Activity,
  Layers,
  Search,
  CheckCircle2,
  RefreshCw,
  FolderKanban,
  Cpu
} from 'lucide-react';
import { useSuraagStore } from '../store/useSuraagStore';
import { NERDocumentViewer } from '../components/ner/NERDocumentViewer';
import { AliasResolutionBoard } from '../components/ner/AliasResolutionBoard';
import { CanonicalIdentityDirectory } from '../components/ner/CanonicalIdentityDirectory';
import { PenalCodeCatalogModal } from '../components/ner/PenalCodeCatalogModal';
import {
  NERDocument,
  CanonicalIdentity,
  AliasMergeCandidate,
  LegalPenalCode,
} from '../types';

export const LegalNERIntelligence: React.FC = () => {
  const { selectedCaseId } = useSuraagStore();

  const [activeView, setActiveView] = useState<'NER_VIEWER' | 'ALIAS_BOARD' | 'IDENTITY_DIRECTORY'>('NER_VIEWER');
  const [documents, setDocuments] = useState<NERDocument[]>([]);
  const [canonicalIdentities, setCanonicalIdentities] = useState<CanonicalIdentity[]>([]);
  const [candidates, setCandidates] = useState<AliasMergeCandidate[]>([]);
  const [allPenalCodes, setAllPenalCodes] = useState<LegalPenalCode[]>([]);

  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [inspectedCode, setInspectedCode] = useState<LegalPenalCode | null>(null);
  const [showCatalogModal, setShowCatalogModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch initial data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const caseId = selectedCaseId || 'CASE-2026-DT01';

      // 1. Fetch Documents
      const docsRes = await fetch(`/api/ner/documents/${caseId}`).catch(() => null);
      if (docsRes && docsRes.ok) {
        const docsData = await docsRes.json();
        setDocuments(docsData.data || []);
        if (docsData.data && docsData.data.length > 0 && !selectedDocId) {
          setSelectedDocId(docsData.data[0].id);
        }
      }

      // 2. Fetch Canonical Identities
      const idRes = await fetch(`/api/ner/cases/${caseId}/canonical-identities`).catch(() => null);
      if (idRes && idRes.ok) {
        const idData = await idRes.json();
        setCanonicalIdentities(idData.data || []);
      }

      // 3. Fetch Alias Merge Candidates
      const candRes = await fetch(`/api/ner/cases/${caseId}/candidates`).catch(() => null);
      if (candRes && candRes.ok) {
        const candData = await candRes.json();
        setCandidates(candData.data || []);
      }

      // 4. Fetch Penal Codes Catalog
      const codesRes = await fetch('/api/ner/penal-codes').catch(() => null);
      if (codesRes && codesRes.ok) {
        const codesData = await codesRes.json();
        setAllPenalCodes(codesData.data || []);
      }
    } catch (err) {
      console.warn('[NER Page] Could not fetch live data from server:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCaseId]);

  // Extract Custom Document
  const handleExtractCustomText = async (text: string, title: string, type: string) => {
    setIsExtracting(true);
    try {
      const res = await fetch('/api/ner/extract-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: text,
          documentTitle: title,
          documentType: type,
          caseId: selectedCaseId || 'CASE-2026-DT01',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDocuments((prev) => [data.document, ...prev.filter((d) => d.id !== data.document.id)]);
        setSelectedDocId(data.document.id);
        showToast(`Successfully extracted ${data.entities.length} entities from "${title}"!`, 'success');
        // Refresh candidates
        triggerResolution();
      } else {
        showToast('Failed to extract document entities', 'error');
      }
    } catch (err: any) {
      showToast(`Extraction failed: ${err.message}`, 'error');
    } finally {
      setIsExtracting(false);
    }
  };

  // Trigger Alias Resolution Pipeline
  const triggerResolution = async () => {
    setIsResolving(true);
    try {
      const caseId = selectedCaseId || 'CASE-2026-DT01';
      const res = await fetch(`/api/ner/resolve-aliases/${caseId}`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates || []);
        if (data.canonicalIdentities) {
          setCanonicalIdentities(data.canonicalIdentities);
        }
        showToast(
          `Alias resolution completed! Evaluated ${data.candidatesCount} candidate merges across all case files.`,
          'success'
        );
      }
    } catch (err: any) {
      showToast(`Alias resolution error: ${err.message}`, 'error');
    } finally {
      setIsResolving(false);
    }
  };

  // Approve Merge Action
  const handleApproveMerge = async (candidateId: string, targetIdentityId: string, aliasName: string) => {
    try {
      const res = await fetch('/api/ner/alias-mapping/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          canonicalIdentityId: targetIdentityId,
          aliasName,
          action: 'APPROVE',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCanonicalIdentities(data.canonicalIdentities || canonicalIdentities);
        setCandidates((prev) =>
          prev.map((c) => (c.id === candidateId ? { ...c, status: 'APPROVED' as const } : c))
        );
        showToast(`Alias "${aliasName}" successfully mapped and merged to master record!`, 'success');
      }
    } catch (err: any) {
      showToast(`Merge approval failed: ${err.message}`, 'error');
    }
  };

  // Reject Merge Action
  const handleRejectMerge = async (candidateId: string) => {
    try {
      const res = await fetch('/api/ner/alias-mapping/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          action: 'REJECT',
        }),
      });

      if (res.ok) {
        setCandidates((prev) =>
          prev.map((c) => (c.id === candidateId ? { ...c, status: 'REJECTED' as const } : c))
        );
        showToast('Merge proposal rejected.', 'info');
      }
    } catch (err: any) {
      showToast(`Action failed: ${err.message}`, 'error');
    }
  };

  // Split / Unlink Alias
  const handleSplitAlias = async (identityId: string, mappingId: string, aliasName: string) => {
    try {
      const res = await fetch('/api/ner/split-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canonicalIdentityId: identityId,
          mappingId,
          aliasName,
          createNewIdentity: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCanonicalIdentities(data.canonicalIdentities || canonicalIdentities);
        showToast(`Unlinked alias "${aliasName}" and created distinct suspect inquiry record.`, 'success');
      }
    } catch (err: any) {
      showToast(`Split alias failed: ${err.message}`, 'error');
    }
  };

  // Merge Two Canonical Identities
  const handleMergeIdentities = async (sourceId: string, targetId: string) => {
    try {
      const res = await fetch('/api/ner/merge-identities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceIdentityId: sourceId,
          targetIdentityId: targetId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCanonicalIdentities(data.canonicalIdentities || canonicalIdentities);
        showToast('Master profiles successfully consolidated.', 'success');
      }
    } catch (err: any) {
      showToast(`Merge identities failed: ${err.message}`, 'error');
    }
  };

  // Compute Tactical HUD Metrics
  const totalEntitiesCount = documents.reduce((sum, d) => sum + (d.entitiesCount || d.entities?.length || 0), 0);
  const totalAliasesCount = canonicalIdentities.reduce((sum, i) => sum + (i.aliases?.length || 0), 0);
  const totalChargesCount = canonicalIdentities.reduce((sum, i) => sum + (i.penalCharges?.length || 0), 0);

  return (
    <div className="space-y-5 pb-12">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl border shadow-2xl backdrop-blur-md flex items-center gap-3 transition-all duration-300 font-tactical-data text-xs ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              : notification.type === 'info'
              ? 'bg-blue-950/90 border-blue-500/50 text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Banner / HUD Overview */}
      <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 text-[10px] font-tactical-data uppercase font-bold tracking-widest flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,84,76,0.25)]">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                <span>Forensic Intelligence Core • Phase 2</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">
                Case: {selectedCaseId || 'CASE-2026-DT01'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white font-tactical-data tracking-tight uppercase">
              Legal NER & Cross-Document Alias Resolution
            </h1>
            <p className="text-xs font-mono text-zinc-400 max-w-3xl mt-1 leading-relaxed">
              Automated named entity extraction for FIRs, charge sheets & witness transcripts with multi-tier phonetic matching (Jaro-Winkler &gt; 0.85, Double Metaphone) and Gemini 1.5 Pro contextual disambiguation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setInspectedCode(allPenalCodes[0] || null);
                setShowCatalogModal(true);
              }}
              className="px-4 py-2.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 text-xs font-tactical-data font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg hover:border-zinc-500"
            >
              <Scale className="w-4 h-4 text-rose-400" />
              <span>IPC / BNS Legal Concordance</span>
            </button>

            <button
              onClick={triggerResolution}
              disabled={isResolving}
              className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-on-primary text-xs font-tactical-data font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isResolving ? 'animate-spin' : ''}`} />
              <span>{isResolving ? 'Resolving Aliases...' : 'Run Resolution Engine'}</span>
            </button>
          </div>
        </div>

        {/* Tactical Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-4 border-t border-zinc-800/80">
          <div className="p-3 bg-zinc-900/40 border border-zinc-800/60 rounded-xl">
            <span className="text-[10px] font-mono text-zinc-400 block mb-1">Documents Ingested</span>
            <span className="text-xl font-black text-white font-mono">{documents.length} Dossiers</span>
          </div>

          <div className="p-3 bg-zinc-900/40 border border-zinc-800/60 rounded-xl">
            <span className="text-[10px] font-mono text-zinc-400 block mb-1">Entities Extracted</span>
            <span className="text-xl font-black text-emerald-400 font-mono">{totalEntitiesCount} Mentions</span>
          </div>

          <div className="p-3 bg-zinc-900/40 border border-zinc-800/60 rounded-xl">
            <span className="text-[10px] font-mono text-zinc-400 block mb-1">Master Identities</span>
            <span className="text-xl font-black text-cyan-400 font-mono">{canonicalIdentities.length} Verified</span>
          </div>

          <div className="p-3 bg-zinc-900/40 border border-zinc-800/60 rounded-xl">
            <span className="text-[10px] font-mono text-zinc-400 block mb-1">Resolved Aliases</span>
            <span className="text-xl font-black text-teal-400 font-mono">{totalAliasesCount} Merged</span>
          </div>

          <div className="p-3 bg-zinc-900/40 border border-zinc-800/60 rounded-xl col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono text-zinc-400 block mb-1">IPC / BNS Charges</span>
            <span className="text-xl font-black text-rose-400 font-mono">{totalChargesCount} Booked</span>
          </div>
        </div>
      </div>

      {/* Main Module Tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-zinc-950 border border-zinc-800 rounded-2xl w-fit">
        {[
          {
            id: 'NER_VIEWER',
            label: 'NER Highlight Viewer',
            icon: FileText,
            badge: `${documents.length} Files`,
          },
          {
            id: 'ALIAS_BOARD',
            label: 'Alias Resolution Workspace',
            icon: GitMerge,
            badge: `${candidates.length} Merge Pairs`,
          },
          {
            id: 'IDENTITY_DIRECTORY',
            label: 'Canonical Master Directory',
            icon: Users,
            badge: `${canonicalIdentities.length} Dossiers`,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-tactical-data font-bold transition-all ${
                isActive
                  ? 'bg-zinc-800 text-primary border border-primary/40 shadow-[0_0_15px_rgba(255,84,76,0.2)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-zinc-400'}`} />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                  isActive ? 'bg-primary/20 text-primary' : 'bg-zinc-900 text-zinc-500'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      {activeView === 'NER_VIEWER' && (
        <NERDocumentViewer
          documents={documents}
          selectedDocId={selectedDocId}
          onSelectDoc={(id) => setSelectedDocId(id)}
          onExtractCustomText={handleExtractCustomText}
          onInspectPenalCode={(code) => {
            setInspectedCode(code);
            setShowCatalogModal(true);
          }}
          isExtracting={isExtracting}
        />
      )}

      {activeView === 'ALIAS_BOARD' && (
        <AliasResolutionBoard
          candidates={candidates}
          canonicalIdentities={canonicalIdentities}
          onApproveMerge={handleApproveMerge}
          onRejectMerge={handleRejectMerge}
          onTriggerResolution={triggerResolution}
          isResolving={isResolving}
        />
      )}

      {activeView === 'IDENTITY_DIRECTORY' && (
        <CanonicalIdentityDirectory
          canonicalIdentities={canonicalIdentities}
          onInspectPenalCode={(code) => {
            setInspectedCode(code);
            setShowCatalogModal(true);
          }}
          onSplitAlias={handleSplitAlias}
          onMergeIdentities={handleMergeIdentities}
        />
      )}

      {/* Legal Penal Codes Reference Catalog Modal */}
      <PenalCodeCatalogModal
        isOpen={showCatalogModal}
        onClose={() => setShowCatalogModal(false)}
        inspectedCode={inspectedCode}
        allPenalCodes={allPenalCodes}
      />
    </div>
  );
};
