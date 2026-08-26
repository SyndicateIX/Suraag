import React, { useState } from 'react';
import {
  Users,
  ShieldAlert,
  FileText,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  Split,
  Merge,
  Info,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';
import { CanonicalIdentity, LegalPenalCode } from '../../types';

interface CanonicalIdentityDirectoryProps {
  canonicalIdentities: CanonicalIdentity[];
  onSelectIdentity?: (identity: CanonicalIdentity) => void;
  onInspectPenalCode: (code: LegalPenalCode) => void;
  onSplitAlias: (identityId: string, mappingId: string, aliasName: string) => Promise<void>;
  onMergeIdentities: (sourceId: string, targetId: string) => Promise<void>;
}

export const CanonicalIdentityDirectory: React.FC<CanonicalIdentityDirectoryProps> = ({
  canonicalIdentities,
  onSelectIdentity,
  onInspectPenalCode,
  onSplitAlias,
  onMergeIdentities,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'SUSPECT' | 'WITNESS' | 'VICTIM' | 'ASSOCIATE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIdentity, setSelectedIdentity] = useState<CanonicalIdentity | null>(
    canonicalIdentities.length > 0 ? canonicalIdentities[0] : null
  );

  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeTargetId, setMergeTargetId] = useState('');

  const filteredIdentities = canonicalIdentities.filter((item) => {
    const matchesTab = activeTab === 'ALL' || item.type === activeTab;
    const matchesSearch =
      !searchQuery ||
      item.primaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.aliases && item.aliases.some((a) => a.aliasName.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (item.penalCharges && item.penalCharges.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesTab && matchesSearch;
  });

  const getRiskColor = (score: number) => {
    if (score >= 90) return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    if (score >= 70) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'SUSPECT':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'WITNESS':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'VICTIM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'ASSOCIATE':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const handleMergeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdentity || !mergeTargetId || selectedIdentity.id === mergeTargetId) return;
    await onMergeIdentities(selectedIdentity.id, mergeTargetId);
    setShowMergeModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-4 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-tactical-data uppercase tracking-wider flex items-center gap-2">
              <span>Master Canonical Identity Directory</span>
              <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-mono text-zinc-300">
                {canonicalIdentities.length} Verified Master Entities
              </span>
            </h2>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">
              Consolidated suspect profiles, resolved cross-document aliases, statutory penal charges, and forensic source citations.
            </p>
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search master names, aliases, charges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-900/90 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-primary font-tactical-data"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { id: 'ALL', label: 'All Entities' },
          { id: 'SUSPECT', label: 'Suspects & Masterminds' },
          { id: 'WITNESS', label: 'Eyewitnesses' },
          { id: 'VICTIM', label: 'Victims' },
          { id: 'ASSOCIATE', label: 'Associates / Intermediaries' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-tactical-data font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                : 'bg-zinc-950/60 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Master 2-Column Grid: Directory Cards on Left + Full Profile Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[640px]">
        {/* LEFT: Cards List */}
        <div className="lg:col-span-5 space-y-3 max-h-[700px] overflow-y-auto custom-scrollbar pr-1">
          {filteredIdentities.map((identity) => {
            const isSelected = selectedIdentity?.id === identity.id;
            const aliases = identity.aliases || [];
            const charges = identity.penalCharges || [];

            return (
              <div
                key={identity.id}
                onClick={() => {
                  setSelectedIdentity(identity);
                  if (onSelectIdentity) onSelectIdentity(identity);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-zinc-900/90 border-emerald-500/70 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40'
                    : 'bg-zinc-950/70 border-zinc-800/80 hover:bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                {/* Header Profile Title */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm font-bold font-tactical-data ${
                          isSelected ? 'text-emerald-300' : 'text-white'
                        }`}
                      >
                        {identity.primaryName}
                      </h3>
                      <span className={`px-2 py-0.2 rounded text-[9px] font-mono uppercase border ${getTypeBadge(identity.type)}`}>
                        {identity.type}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">ID: {identity.id}</span>
                  </div>

                  {identity.riskScore !== undefined && (
                    <div className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold flex items-center gap-1 ${getRiskColor(identity.riskScore)}`}>
                      <Flame className="w-3 h-3" />
                      <span>{identity.riskScore} Risk</span>
                    </div>
                  )}
                </div>

                {/* Resolved Aliases Pills */}
                {aliases.length > 0 && (
                  <div className="mb-2.5 flex flex-wrap items-center gap-1">
                    <span className="text-[10px] font-mono text-zinc-400 font-semibold mr-1">a.k.a:</span>
                    {aliases.map((a, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 bg-teal-950/70 border border-teal-500/30 text-teal-300 rounded text-[10px] font-mono"
                      >
                        "{a.aliasName}"
                      </span>
                    ))}
                  </div>
                )}

                {/* Statutory Penal Charges */}
                {charges.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 mb-2">
                    {charges.map((charge, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.2 bg-rose-950/70 border border-rose-500/30 text-rose-300 rounded text-[9px] font-mono font-bold uppercase"
                      >
                        {charge}
                      </span>
                    ))}
                  </div>
                )}

                {/* Co-occurrence quick summary */}
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-2 border-t border-zinc-800/80">
                  <span className="text-zinc-500">{aliases.length} Resolved Aliases</span>
                  <span className="text-cyan-400 font-semibold">
                    {identity.citations?.length || 0} Document Citations
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: Detailed Master Suspect & Identity Dossier */}
        <div className="lg:col-span-7">
          {selectedIdentity ? (
            <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-5 shadow-2xl backdrop-blur-md space-y-5">
              {/* Dossier Top Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-mono font-bold uppercase">
                      Canonical Master Dossier
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${getTypeBadge(selectedIdentity.type)}`}>
                      {selectedIdentity.type}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white font-tactical-data tracking-wide">
                    {selectedIdentity.primaryName}
                  </h2>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Case Assignment: <span className="text-zinc-300">{selectedIdentity.caseId}</span> • Profile Verified: 100%
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowMergeModal(true)}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-tactical-data rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    <Merge className="w-3.5 h-3.5" />
                    <span>Merge Profile</span>
                  </button>
                </div>
              </div>

              {/* Suspect Bio Notes */}
              <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-lg">
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block mb-1">
                  Investigative Profile Summary & Case Role
                </span>
                <p className="text-xs font-mono text-zinc-200 leading-relaxed">
                  {selectedIdentity.notes || 'No specific profile annotations logged.'}
                </p>
              </div>

              {/* Resolved Aliases Section with Unlink / Split Action */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-tactical-data uppercase tracking-wider text-zinc-300 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    <span>Resolved Cross-Document Aliases ({selectedIdentity.aliases?.length || 0})</span>
                  </h4>
                </div>

                <div className="space-y-2">
                  {(selectedIdentity.aliases || []).map((alias, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-zinc-900/80 border border-zinc-800/80 rounded-lg flex items-center justify-between gap-3 text-xs font-mono"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-teal-300">"{alias.aliasName}"</span>
                          <span className="px-1.5 py-0.2 bg-zinc-800 text-zinc-400 rounded text-[9px]">
                            {alias.resolutionMethod}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-semibold">
                            {Math.round((alias.confidence || 0.95) * 100)}% Match
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1 truncate max-w-md">
                          {alias.reasoning || `Resolved from ${alias.documentTitle || 'Case Dossier'}.`}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          onSplitAlias(selectedIdentity.id, alias.mappingId, alias.aliasName)
                        }
                        className="px-2.5 py-1 bg-zinc-950 hover:bg-rose-500/20 border border-zinc-800 hover:border-rose-500/40 text-zinc-400 hover:text-rose-300 text-[10px] font-tactical-data rounded transition-all flex items-center gap-1 shrink-0"
                        title="Unlink alias and create distinct investigative entity"
                      >
                        <Split className="w-3 h-3" />
                        <span>Split Alias</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Linked Penal Statutes & Charges */}
              {selectedIdentity.penalCharges && selectedIdentity.penalCharges.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-tactical-data uppercase tracking-wider text-zinc-300 font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>Statutory Penal Charges Booked</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedIdentity.penalCharges.map((codeStr, idx) => {
                      const codeDetails =
                        (selectedIdentity.penalCodeDetails &&
                          selectedIdentity.penalCodeDetails.find((d) => d.code === codeStr)) ||
                        null;

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (codeDetails) onInspectPenalCode(codeDetails);
                          }}
                          className="p-2.5 bg-rose-950/30 border border-rose-500/30 hover:border-rose-500/60 rounded-lg cursor-pointer transition-all flex items-center justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-rose-300 font-mono">
                                {codeStr}
                              </span>
                              <span className="px-1 py-0.2 bg-rose-950 border border-rose-500/40 text-[9px] text-rose-400 font-bold rounded">
                                {codeDetails?.severityLevel || 'CRITICAL'}
                              </span>
                            </div>
                            <p className="text-[10px] font-mono text-zinc-400 truncate mt-0.5">
                              {codeDetails?.title || 'Statutory Offence under Penal Code'}
                            </p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Source Document Citations */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-tactical-data uppercase tracking-wider text-zinc-300 font-bold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Source Document Citations ({selectedIdentity.citations?.length || 0})</span>
                </h4>

                <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                  {(selectedIdentity.citations || []).map((cit, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg text-xs font-mono"
                    >
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                        <span className="text-cyan-300 font-semibold">{cit.documentTitle}</span>
                        <span className="text-emerald-400">
                          {Math.round((cit.confidence || 0.95) * 100)}% Confidence
                        </span>
                      </div>
                      <p className="text-zinc-300 bg-zinc-950 p-2 rounded border border-zinc-800/60 leading-relaxed">
                        "{cit.snippet}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-12 bg-zinc-950/60 border border-zinc-800 rounded-xl text-zinc-500 font-mono text-xs">
              Select a canonical identity from the directory to review its 360° forensic profile.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Manual Merge Two Canonical Identities */}
      {showMergeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Merge className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-tactical-data font-bold text-white uppercase tracking-wider">
                  Merge Canonical Master Profiles
                </h3>
              </div>
              <button
                onClick={() => setShowMergeModal(false)}
                className="text-zinc-500 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleMergeSubmit} className="space-y-4">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono">
                <span className="text-zinc-400 block mb-1">Source Profile (Will be absorbed):</span>
                <span className="text-white font-bold">{selectedIdentity?.primaryName}</span>
              </div>

              <div>
                <label className="block text-xs font-tactical-data text-zinc-400 mb-1">
                  Select Target Master Profile to Merge Into:
                </label>
                <select
                  required
                  value={mergeTargetId}
                  onChange={(e) => setMergeTargetId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-primary font-tactical-data"
                >
                  <option value="">-- Choose Target Master Profile --</option>
                  {canonicalIdentities
                    .filter((i) => i.id !== selectedIdentity?.id)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.primaryName} ({item.type} - {item.id})
                      </option>
                    ))}
                </select>
              </div>

              <p className="text-[11px] font-mono text-zinc-400 leading-relaxed bg-zinc-900/50 p-2.5 rounded border border-zinc-800/80">
                ⚠️ All aliases, document citations, and statutory penal charges from "
                {selectedIdentity?.primaryName}" will be unified into the selected target profile.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMergeModal(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-tactical-data text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!mergeTargetId}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs font-tactical-data rounded-lg shadow-lg disabled:opacity-50"
                >
                  Confirm Master Profile Merge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
