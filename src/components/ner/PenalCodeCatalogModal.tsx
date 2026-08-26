import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  BookOpen,
  Scale,
  ExternalLink,
  ChevronRight,
  Gavel,
  CheckCircle2,
  Layers,
  X
} from 'lucide-react';
import { LegalPenalCode } from '../../types';

interface PenalCodeCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspectedCode?: LegalPenalCode | null;
  allPenalCodes: LegalPenalCode[];
}

export const PenalCodeCatalogModal: React.FC<PenalCodeCatalogModalProps> = ({
  isOpen,
  onClose,
  inspectedCode,
  allPenalCodes,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatute, setSelectedStatute] = useState<'ALL' | 'IPC' | 'BNS'>('ALL');
  const [activeCode, setActiveCode] = useState<LegalPenalCode | null>(
    inspectedCode || (allPenalCodes.length > 0 ? allPenalCodes[0] : null)
  );

  React.useEffect(() => {
    if (inspectedCode) {
      setActiveCode(inspectedCode);
    }
  }, [inspectedCode]);

  if (!isOpen) return null;

  const filteredCodes = allPenalCodes.filter((code) => {
    const matchesStatute = selectedStatute === 'ALL' || code.statute === selectedStatute;
    const matchesSearch =
      !searchQuery ||
      code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.sectionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatute && matchesSearch;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-tactical-data uppercase tracking-wider">
                Statutory Penal Code Catalog & Legal Reference
              </h3>
              <p className="text-xs font-mono text-zinc-400">
                Indian Penal Code (IPC 1860) & Bharatiya Nyaya Sanhita (BNS 2023) Legal Concordance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search penal section (e.g. 302, 120B, BNS 103, murder, forgery)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-primary font-tactical-data"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
            {(['ALL', 'IPC', 'BNS'] as const).map((stat) => (
              <button
                key={stat}
                onClick={() => setSelectedStatute(stat)}
                className={`px-3 py-1 rounded text-xs font-tactical-data font-bold transition-all ${
                  selectedStatute === stat
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {stat === 'ALL' ? 'All Statutes' : stat}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Catalog Browser */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Code List */}
          <div className="md:col-span-5 border-r border-zinc-800 p-3 overflow-y-auto custom-scrollbar space-y-2 max-h-[500px]">
            {filteredCodes.map((code) => {
              const isSelected = activeCode?.code === code.code;
              return (
                <div
                  key={code.code}
                  onClick={() => setActiveCode(code)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-950/40 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/40'
                      : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold font-mono text-rose-300">
                      {code.code}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase border ${getSeverityBadge(code.severityLevel)}`}>
                      {code.severityLevel}
                    </span>
                  </div>
                  <h4 className="text-xs font-tactical-data font-semibold text-zinc-200 truncate">
                    {code.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mt-1">
                    <span>{code.statute}</span>
                    <span>{code.category}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Code Details & Legal Elements */}
          <div className="md:col-span-7 p-5 overflow-y-auto custom-scrollbar space-y-4 max-h-[500px] bg-zinc-950">
            {activeCode ? (
              <>
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded text-xs font-mono font-bold">
                        {activeCode.code}
                      </span>
                      <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-xs font-mono text-zinc-300">
                        {activeCode.statute} Section {activeCode.sectionNumber}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-white font-tactical-data mt-1">
                      {activeCode.title}
                    </h2>
                  </div>

                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${getSeverityBadge(activeCode.severityLevel)}`}>
                    {activeCode.severityLevel} SEVERITY
                  </span>
                </div>

                {/* Statutory Concordance (IPC <-> BNS) */}
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Statutory Cross-Reference:</span>
                  <span className="text-cyan-300 font-bold">
                    {activeCode.statute === 'IPC'
                      ? `BNS Equivalent: ${activeCode.bnsEquivalent || 'N/A'}`
                      : `IPC Equivalent: ${activeCode.ipcEquivalent || 'N/A'}`}
                  </span>
                </div>

                {/* Legal Definition */}
                <div>
                  <h4 className="text-xs font-tactical-data uppercase tracking-wider text-zinc-400 font-bold mb-1.5">
                    Statutory Definition
                  </h4>
                  <p className="text-xs font-mono text-zinc-300 leading-relaxed bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/80">
                    {activeCode.description}
                  </p>
                </div>

                {/* Prescribed Punishment */}
                {activeCode.punishment && (
                  <div>
                    <h4 className="text-xs font-tactical-data uppercase tracking-wider text-rose-400 font-bold mb-1.5 flex items-center gap-1.5">
                      <Gavel className="w-3.5 h-3.5" />
                      <span>Prescribed Punishment</span>
                    </h4>
                    <p className="text-xs font-mono text-rose-200 bg-rose-950/30 p-3 rounded-lg border border-rose-500/30 font-semibold">
                      {activeCode.punishment}
                    </p>
                  </div>
                )}

                {/* Key Legal Elements for Prosecution */}
                {activeCode.keyElements && activeCode.keyElements.length > 0 && (
                  <div>
                    <h4 className="text-xs font-tactical-data uppercase tracking-wider text-zinc-400 font-bold mb-1.5">
                      Essential Ingredients for Prosecution
                    </h4>
                    <ul className="space-y-1.5 text-xs font-mono text-zinc-300">
                      {activeCode.keyElements.map((elem, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 bg-zinc-900/40 p-2 rounded border border-zinc-800/60"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                          <span>{elem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500 font-mono text-xs">
                Select a penal statute from the catalog to view legal definition and punishment.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>{filteredCodes.length} Penal Statutes Available</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-tactical-data font-bold rounded-lg transition-colors"
          >
            Close Catalog
          </button>
        </div>
      </div>
    </div>
  );
};
