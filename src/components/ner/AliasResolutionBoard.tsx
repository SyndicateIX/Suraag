import React, { useState } from 'react';
import {
  GitMerge,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Phone,
  MapPin,
  Users,
  Clock,
  Layers,
  Cpu,
  RefreshCw,
  Search,
  Check,
  Split
} from 'lucide-react';
import { AliasMergeCandidate, CanonicalIdentity } from '../../types';

interface AliasResolutionBoardProps {
  candidates: AliasMergeCandidate[];
  canonicalIdentities: CanonicalIdentity[];
  onApproveMerge: (candidateId: string, targetIdentityId: string, aliasName: string) => Promise<void>;
  onRejectMerge: (candidateId: string) => Promise<void>;
  onTriggerResolution: () => Promise<void>;
  isResolving?: boolean;
}

export const AliasResolutionBoard: React.FC<AliasResolutionBoardProps> = ({
  candidates,
  canonicalIdentities,
  onApproveMerge,
  onRejectMerge,
  onTriggerResolution,
  isResolving = false,
}) => {
  const [filterAction, setFilterAction] = useState<'ALL' | 'MERGE' | 'FLAG_REVIEW' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedCandidate, setSelectedCandidate] = useState<AliasMergeCandidate | null>(
    candidates.length > 0 ? candidates[0] : null
  );
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  const filteredCandidates = candidates.filter((c) => {
    if (filterAction === 'ALL') return true;
    if (filterAction === 'MERGE') return c.suggestedAction === 'MERGE' && c.status === 'PENDING_REVIEW';
    if (filterAction === 'FLAG_REVIEW') return c.suggestedAction === 'FLAG_REVIEW' && c.status === 'PENDING_REVIEW';
    if (filterAction === 'APPROVED') return c.status === 'APPROVED';
    if (filterAction === 'REJECTED') return c.status === 'REJECTED';
    return true;
  });

  const handleApprove = async (cand: AliasMergeCandidate) => {
    setActionInProgressId(cand.id);
    try {
      await onApproveMerge(cand.id, cand.targetIdentity.id, cand.sourceEntity.textValue);
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleReject = async (cand: AliasMergeCandidate) => {
    setActionInProgressId(cand.id);
    try {
      await onRejectMerge(cand.id);
    } finally {
      setActionInProgressId(null);
    }
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 85) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold shadow-[0_0_8px_rgba(16,185,129,0.3)]">
          {score}% High Confidence
        </span>
      );
    }
    if (score >= 65) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold shadow-[0_0_8px_rgba(245,158,11,0.3)]">
          {score}% Probable Match
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold">
        {score}% Ambiguous
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* HUD Header Banner */}
      <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-4 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/20 border border-primary/40 rounded-xl text-primary shadow-[0_0_15px_rgba(255,84,76,0.3)]">
            <GitMerge className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-tactical-data uppercase tracking-wider flex items-center gap-2">
              <span>Cross-Document Alias Resolution Engine</span>
              <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-mono text-emerald-400">
                Stage 1-3 Pipeline Active
              </span>
            </h2>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">
              Merging disparate name mentions across multiple case files into unified Canonical Master Profiles via Jaro-Winkler, Double Metaphone & Gemini LLM Co-occurrence.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onTriggerResolution}
            disabled={isResolving}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:to-primary text-on-primary font-tactical-data font-bold text-xs rounded-lg transition-all shadow-[0_0_15px_rgba(255,84,76,0.3)] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResolving ? 'animate-spin' : ''}`} />
            <span>{isResolving ? 'Executing Pipeline...' : 'Run Alias Resolution Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-950 border border-zinc-800 rounded-xl">
          {[
            { id: 'ALL', label: 'All Candidates', count: candidates.length },
            {
              id: 'MERGE',
              label: 'AI Recommended Merges',
              count: candidates.filter((c) => c.suggestedAction === 'MERGE' && c.status === 'PENDING_REVIEW').length,
            },
            {
              id: 'FLAG_REVIEW',
              label: 'Flagged for Review',
              count: candidates.filter((c) => c.suggestedAction === 'FLAG_REVIEW' && c.status === 'PENDING_REVIEW').length,
            },
            {
              id: 'APPROVED',
              label: 'Approved Merges',
              count: candidates.filter((c) => c.status === 'APPROVED').length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterAction(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-tactical-data font-semibold transition-all flex items-center gap-1.5 ${
                filterAction === tab.id
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded bg-zinc-900 text-[10px] font-mono text-zinc-300">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-zinc-400">
          Showing <span className="text-white font-bold">{filteredCandidates.length}</span> alias merge candidate pairs
        </div>
      </div>

      {/* Main Resolution Board: Left Candidates List + Right Detailed Comparison Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[600px]">
        {/* LEFT: Candidate Cards List */}
        <div className="lg:col-span-5 space-y-3 max-h-[700px] overflow-y-auto custom-scrollbar pr-1">
          {filteredCandidates.length === 0 ? (
            <div className="p-8 text-center bg-zinc-950/60 border border-zinc-800 rounded-xl text-zinc-500 font-mono text-xs">
              No alias merge candidates matching the current filter.
            </div>
          ) : (
            filteredCandidates.map((cand) => {
              const isSelected = selectedCandidate?.id === cand.id;
              const isApproved = cand.status === 'APPROVED';
              const isRejected = cand.status === 'REJECTED';

              return (
                <div
                  key={cand.id}
                  onClick={() => setSelectedCandidate(cand)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-zinc-900/90 border-primary/70 shadow-[0_0_20px_rgba(255,84,76,0.15)] ring-1 ring-primary/40'
                      : 'bg-zinc-950/70 border-zinc-800/80 hover:bg-zinc-900/60 hover:border-zinc-700'
                  }`}
                >
                  {/* Status ribbon if already processed */}
                  {isApproved && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                      <span>Approved</span>
                    </div>
                  )}
                  {isRejected && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-mono text-rose-400 bg-rose-950/80 border border-rose-500/40 px-2 py-0.5 rounded-full">
                      <XCircle className="w-3 h-3" />
                      <span>Rejected</span>
                    </div>
                  )}

                  {/* Header: Raw Mention -> Canonical Master */}
                  <div className="flex items-center gap-2 mb-2 pr-16">
                    <span className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/40 rounded text-xs font-mono font-bold text-teal-300">
                      "{cand.sourceEntity.textValue}"
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/40 rounded text-xs font-tactical-data font-bold text-emerald-300 truncate">
                      {cand.targetIdentity.primaryName}
                    </span>
                  </div>

                  {/* Match Badges & Confidence */}
                  <div className="flex flex-wrap items-center gap-2 mb-2.5">
                    {getConfidenceBadge(cand.overallConfidence)}
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-cyan-300">
                      {cand.matchType.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Co-occurrence Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-zinc-400 mb-3">
                    {cand.soundexMatch && (
                      <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-amber-300">
                        ⚡ Double Metaphone Soundex Match
                      </span>
                    )}
                    {cand.coOccurrenceFactors.sharedPhoneNumbers.length > 0 && (
                      <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-blue-300 flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" />
                        {cand.coOccurrenceFactors.sharedPhoneNumbers[0]}
                      </span>
                    )}
                    {cand.coOccurrenceFactors.sharedLocations.length > 0 && (
                      <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-cyan-300 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        {cand.coOccurrenceFactors.sharedLocations[0]}
                      </span>
                    )}
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(cand);
                      }}
                      disabled={actionInProgressId === cand.id || isApproved}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs font-tactical-data font-bold transition-all disabled:opacity-40"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isApproved ? 'Approved' : 'Approve Merge'}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(cand);
                      }}
                      disabled={actionInProgressId === cand.id || isRejected}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-rose-300 text-xs font-tactical-data transition-all disabled:opacity-40"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT: Deep Forensic Comparison & Co-occurrence Matrix */}
        <div className="lg:col-span-7">
          {selectedCandidate ? (
            <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-5 shadow-2xl backdrop-blur-md space-y-5">
              {/* Header Details */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                    Forensic Merge Disambiguation Dossier
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <h3 className="text-base font-bold text-white font-tactical-data">
                      Merge Mention "{selectedCandidate.sourceEntity.textValue}" →{' '}
                      {selectedCandidate.targetIdentity.primaryName}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getConfidenceBadge(selectedCandidate.overallConfidence)}
                </div>
              </div>

              {/* Multi-Tier Similarity Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg">
                  <span className="text-[10px] font-mono text-zinc-400 block mb-1">Jaro-Winkler Metric</span>
                  <span className="text-base font-bold text-white font-mono">
                    {Math.round(selectedCandidate.fuzzyScore * 100)}%
                  </span>
                </div>
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg">
                  <span className="text-[10px] font-mono text-zinc-400 block mb-1">Double Metaphone</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    [{selectedCandidate.doubleMetaphoneKeys.source.join('/')}] ↔ [
                    {selectedCandidate.doubleMetaphoneKeys.target.join('/')}]
                  </span>
                </div>
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg">
                  <span className="text-[10px] font-mono text-zinc-400 block mb-1">Co-occurrence Factor</span>
                  <span className="text-base font-bold text-cyan-400 font-mono">
                    {Math.round(selectedCandidate.coOccurrenceScore * 100)}%
                  </span>
                </div>
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg">
                  <span className="text-[10px] font-mono text-zinc-400 block mb-1">Match Category</span>
                  <span className="text-xs font-bold text-purple-300 font-tactical-data truncate block">
                    {selectedCandidate.matchType}
                  </span>
                </div>
              </div>

              {/* Context Snippet Comparison */}
              <div className="space-y-2">
                <h4 className="text-xs font-tactical-data uppercase tracking-wider text-zinc-400 font-bold">
                  Side-by-Side Document Context Snippets
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-lg">
                    <span className="text-[10px] font-mono text-teal-400 font-bold block mb-1.5">
                      Source Mention Snippet ({selectedCandidate.sourceEntity.metadata?.documentTitle || 'Case File'})
                    </span>
                    <p className="text-xs font-mono text-zinc-300 leading-relaxed bg-zinc-950 p-2.5 rounded border border-zinc-800/50">
                      "{selectedCandidate.sourceEntity.contextSnippet}"
                    </p>
                  </div>
                  <div className="p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-lg">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-1.5">
                      Canonical Master Profile ({selectedCandidate.targetIdentity.primaryName})
                    </span>
                    <p className="text-xs font-mono text-zinc-300 leading-relaxed bg-zinc-950 p-2.5 rounded border border-zinc-800/50">
                      "{selectedCandidate.targetIdentity.notes || 'Master Identity Record in Case Vault.'}"
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Disambiguation Reasoning Statement */}
              <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-tactical-data font-bold text-primary">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Gemini 1.5 Pro Forensic Disambiguation Verdict</span>
                </div>
                <p className="text-xs font-mono text-zinc-300 leading-relaxed">
                  {selectedCandidate.llmDisambiguationReasoning}
                </p>

                {/* Co-occurrence evidence badges */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800/60 text-[11px] font-mono">
                  {selectedCandidate.coOccurrenceFactors.sharedPhoneNumbers.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded"
                    >
                      📞 Verified CDR Intercept: {p}
                    </span>
                  ))}
                  {selectedCandidate.coOccurrenceFactors.sharedLocations.map((l, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded"
                    >
                      📍 Co-located Cell Sector: {l}
                    </span>
                  ))}
                  {selectedCandidate.coOccurrenceFactors.sharedAssociates.map((a, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded"
                    >
                      👤 Common Associate: {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tactical Actions Toolbar */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  onClick={() => handleReject(selectedCandidate)}
                  disabled={actionInProgressId === selectedCandidate.id}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-tactical-data text-rose-300 font-bold transition-all"
                >
                  Reject Suggestion
                </button>
                <button
                  onClick={() => handleApprove(selectedCandidate)}
                  disabled={actionInProgressId === selectedCandidate.id}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs font-tactical-data rounded-lg shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Merge Alias to Master Identity</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-12 bg-zinc-950/60 border border-zinc-800 rounded-xl text-zinc-500 font-mono text-xs">
              Select an alias merge candidate from the list to inspect forensic comparison.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
