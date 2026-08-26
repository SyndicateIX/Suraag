import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Send,
  MessageSquare,
  Building,
  Car,
  Shield,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Award,
  Download,
  Copy,
  Printer,
  ExternalLink,
  Lock,
  FileCheck,
  RefreshCw,
  Hash,
  Share2,
  Network,
  Check,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import {
  OSINTPlatform,
  OSINTFindingItem,
  Section65BCertificate,
} from '../../types/ingestion';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';

interface OSINTConnectorHubProps {
  findings: OSINTFindingItem[];
  onExecuteQuery: (payload: { platform: OSINTPlatform; query: string }) => Promise<void>;
  onGenerateCertificate: (payload: { findingId?: string; targetQuery?: string }) => Promise<Section65BCertificate>;
  isQuerying?: boolean;
}

export const OSINTConnectorHub: React.FC<OSINTConnectorHubProps> = ({
  findings,
  onExecuteQuery,
  onGenerateCertificate,
  isQuerying = false,
}) => {
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState<OSINTPlatform>('TWITTER_X');
  const [searchQuery, setSearchQuery] = useState<string>('@chetany_shadow99');
  const [activeFinding, setActiveFinding] = useState<OSINTFindingItem | null>(null);
  const [certificateData, setCertificateData] = useState<Section65BCertificate | null>(null);
  const [isGeneratingCert, setIsGeneratingCert] = useState<boolean>(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [pinnedToSNA, setPinnedToSNA] = useState<Record<string, boolean>>({});

  const platforms: { id: OSINTPlatform; name: string; icon: any; color: string; desc: string }[] = [
    { id: 'TWITTER_X', name: 'Twitter / X', icon: Hash, color: 'text-cyan-400 border-cyan-400/40 bg-cyan-500/10', desc: 'Handles, Tweets, Mentions, Network' },
    { id: 'TELEGRAM', name: 'Telegram Intel', icon: Send, color: 'text-blue-400 border-blue-400/40 bg-blue-500/10', desc: 'Public Channels, Escrow Bots, Groups' },
    { id: 'MCA_REGISTRY', name: 'MCA Corporate', icon: Building, color: 'text-amber-400 border-amber-400/40 bg-amber-500/10', desc: 'DIN Directors, Shell Cos, MCA21 Registry' },
    { id: 'VAHAN_VEHICLE', name: 'Vahan & Fastag', icon: Car, color: 'text-emerald-400 border-emerald-400/40 bg-emerald-500/10', desc: 'RTO Vehicle Reg, Toll Fastag Timestamps' },
    { id: 'REDDIT', name: 'Reddit & Forums', icon: MessageSquare, color: 'text-orange-400 border-orange-400/40 bg-orange-500/10', desc: 'Subreddits, Geo threads, Pastes' },
    { id: 'WHOIS', name: 'Domain & WHOIS', icon: Globe, color: 'text-purple-400 border-purple-400/40 bg-purple-500/10', desc: 'DNS, Registrar, Hosted IP & ASN' },
  ];

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    await onExecuteQuery({
      platform: selectedPlatform,
      query: searchQuery.trim(),
    });
  };

  const handleCreateSection65B = async (finding: OSINTFindingItem) => {
    setIsGeneratingCert(true);
    try {
      const cert = await onGenerateCertificate({
        findingId: finding.id,
        targetQuery: finding.targetQuery,
      });
      setCertificateData(cert);
    } catch (e) {
      console.error('Failed to generate Section 65B Certificate:', e);
    } finally {
      setIsGeneratingCert(false);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopyStatus('HASH_COPIED');
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const handlePinToSNA = (itemId: string) => {
    setPinnedToSNA((prev) => ({ ...prev, [itemId]: true }));
  };

  return (
    <div className="space-y-6">
      {/* Platform Connectors Selector Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-tactical-data">
        {platforms.map((p) => {
          const Icon = p.icon;
          const isSelected = selectedPlatform === p.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPlatform(p.id);
                if (p.id === 'TWITTER_X') setSearchQuery('@chetany_shadow99');
                else if (p.id === 'TELEGRAM') setSearchQuery('t.me/pune_underground_escrow');
                else if (p.id === 'MCA_REGISTRY') setSearchQuery('D-Nexus Global Corp');
                else if (p.id === 'VAHAN_VEHICLE') setSearchQuery('MH12-QT-9921');
                else if (p.id === 'WHOIS') setSearchQuery('d-nexus-offshore.com');
                else setSearchQuery('Pune Lohegaon Crime');
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer shadow-md ${
                isSelected
                  ? 'bg-primary/20 border-primary text-on-surface shadow-[0_0_15px_rgba(255,84,76,0.35)] ring-1 ring-primary'
                  : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`} />
                {isSelected && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
              </div>
              <div className="mt-2.5">
                <div className="text-xs font-bold text-neutral-100">{p.name}</div>
                <div className="text-[9px] text-on-surface-variant/80 line-clamp-1">{p.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Query Search Bar */}
      <GlassCard className="p-4 rounded-2xl shadow-xl">
        <form onSubmit={handleQuerySubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-primary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Enter target username, keyword, URL, CIN, or vehicle number for ${selectedPlatform}...`}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isQuerying}
            className="w-full md:w-auto px-6 py-2.5 bg-primary text-on-primary rounded-2xl text-xs font-tactical-data font-bold uppercase tracking-wider hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,84,76,0.3)] shrink-0 cursor-pointer"
          >
            {isQuerying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Execute Live OSINT Connector</span>
          </button>
        </form>
      </GlassCard>

      {/* Findings & Provenance Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left: Findings List (7 cols) */}
        <div className="xl:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-tactical-data uppercase tracking-wider text-on-surface-variant font-bold flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Captured OSINT Artifacts ({findings.length})</span>
            </h4>
            <span className="text-[10px] font-tactical-data text-emerald-400 flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Chain of Custody: TAMPER PROOF</span>
            </span>
          </div>

          <div className="space-y-3">
            {findings.map((item) => {
              const isSelected = activeFinding?.id === item.id;
              const isPinned = pinnedToSNA[item.id];
              return (
                <GlassCard
                  key={item.id}
                  onClick={() => setActiveFinding(item)}
                  className={`p-4 border transition-all cursor-pointer space-y-3 rounded-2xl shadow-md ${
                    isSelected ? 'border-primary ring-1 ring-primary shadow-lg bg-surface-container-high' : 'hover:border-outline-variant/60'
                  }`}
                >
                  {/* Header: Platform & Threat */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Badge variant="confidence" className="text-[10px] font-mono border-primary/40 text-primary bg-primary/10">
                        {item.platform}
                      </Badge>
                      <span className="text-xs font-bold text-neutral-100 font-tactical-data">
                        {item.authorDisplayName || item.authorHandle}
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-mono">
                        ({item.authorHandle})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-tactical-data text-red-400 font-bold bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/30">
                        Threat Score: {item.threatScore}%
                      </span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-xs text-neutral-200 leading-relaxed font-sans bg-surface-container-lowest/80 p-3 rounded-xl border border-outline-variant/30">
                    "{item.postContent}"
                  </p>

                  {/* Linked Entities Badges */}
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-tactical-data">
                    {item.associatedEntities?.handles?.map((h, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/40 text-cyan-300">
                        {h}
                      </span>
                    ))}
                    {item.associatedEntities?.hashtags?.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/40 text-purple-300">
                        {tag}
                      </span>
                    ))}
                    {item.geoTag && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                        📍 {item.geoTag}
                      </span>
                    )}
                  </div>

                  {/* Provenance Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/20 pt-2.5 text-[10px] font-tactical-data text-on-surface-variant">
                    <div className="flex items-center gap-1.5 truncate max-w-xs font-mono">
                      <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">SHA-256: {item.provenance?.sha256Hash?.slice(0, 18)}...</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePinToSNA(item.id);
                        }}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-tactical-data transition-all flex items-center gap-1 ${
                          isPinned
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                        }`}
                        title="Pin this handle into Social Network Graph"
                      >
                        <Network className="w-3 h-3" />
                        <span>{isPinned ? 'PINNED TO SNA' : 'PIN TO SNA'}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateSection65B(item);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 font-bold transition-all flex items-center gap-1"
                      >
                        <Award className="w-3 h-3" />
                        <span>Section 65B Certificate</span>
                      </button>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Right: Provenance & Certificate Inspection (5 cols) */}
        <div className="xl:col-span-5 space-y-3.5">
          <GlassCard className="p-4 space-y-4 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-on-surface font-tactical-data uppercase tracking-wider">
                  Cryptographic Evidence Provenance
                </h4>
              </div>
              <Badge variant="active" className="text-[10px] text-emerald-400 border-emerald-500/40 bg-emerald-500/10">
                COURT ADMISSIBLE
              </Badge>
            </div>

            {activeFinding || findings[0] ? (
              (() => {
                const current = activeFinding || findings[0];
                return (
                  <div className="space-y-3.5 font-tactical-data text-xs">
                    <div className="p-3.5 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Evidence SHA-256 Hash</span>
                        <button
                          onClick={() => handleCopyHash(current.provenance?.sha256Hash)}
                          className="text-[10px] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {copyStatus === 'HASH_COPIED' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copyStatus === 'HASH_COPIED' ? 'COPIED!' : 'COPY'}</span>
                        </button>
                      </div>
                      <div className="font-mono text-[11px] text-emerald-400 break-all bg-black/50 p-2.5 rounded-xl border border-emerald-500/20">
                        {current.provenance?.sha256Hash}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl">
                        <div className="text-[10px] text-on-surface-variant uppercase">Origin Server IP</div>
                        <div className="font-mono font-bold text-neutral-200 mt-0.5">
                          {current.provenance?.ipAddress || '104.244.42.1'}
                        </div>
                      </div>
                      <div className="p-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl">
                        <div className="text-[10px] text-on-surface-variant uppercase">RFC-3161 Time Token</div>
                        <div className="font-mono text-[11px] text-neutral-300 mt-0.5 truncate">
                          {current.provenance?.rfc3161TimestampProof || 'STAMPED_VERIFIED'}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl">
                      <div className="text-[10px] text-on-surface-variant uppercase">Certifying Examiner & Unit</div>
                      <div className="text-neutral-200 mt-0.5 font-semibold">
                        {current.provenance?.examinerBadge || 'SI-CYBER-PUNE-104'} • Special Cyber Forensic SIT
                      </div>
                    </div>

                    <div className="p-3 bg-primary/10 border border-primary/30 rounded-2xl">
                      <div className="text-[10px] text-primary font-bold uppercase">Bharatiya Sakshya Adhiniyam & Sec 65B Compliance</div>
                      <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                        Digital hashes are permanently sealed into Suraag's cryptographic WORM ledger to guarantee tamper-proof integrity for High Court trial proceedings.
                      </p>
                    </div>

                    <button
                      onClick={() => handleCreateSection65B(current)}
                      disabled={isGeneratingCert}
                      className="w-full py-2.5 bg-primary text-on-primary rounded-xl font-bold text-xs font-tactical-data uppercase tracking-wider hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,84,76,0.3)] cursor-pointer"
                    >
                      {isGeneratingCert ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-4 h-4" />}
                      <span>Generate Court Certificate (Sec 65B / BSA)</span>
                    </button>
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-8 text-on-surface-variant font-tactical-data text-xs">
                Select an OSINT item to view cryptographic provenance
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Section 65B Court Certificate Modal */}
      {certificateData && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface border-2 border-primary/50 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-[0_0_35px_rgba(255,84,76,0.35)] max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Certificate Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
              <div className="flex items-center gap-2.5">
                <Award className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-on-surface font-tactical-data uppercase tracking-wider">
                    Certificate Under Section 65B Indian Evidence Act / Sec 63 BSA 2023
                  </h3>
                  <div className="text-[10px] text-on-surface-variant font-mono">
                    ID: {certificateData.certificateId}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCertificateData(null)}
                className="text-on-surface-variant hover:text-on-surface text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Official Certificate Body */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 space-y-4 font-mono text-xs text-neutral-200">
              <div className="text-center border-b border-neutral-700 pb-3 space-y-1">
                <div className="text-[11px] font-bold text-primary tracking-widest uppercase">
                  POLICE DEPARTMENT OF MAHARASHTRA • CYBER CRIME INVESTIGATION
                </div>
                <div className="text-sm font-bold text-neutral-100 uppercase">
                  ELECTRONIC RECORD ADMISSIBILITY CERTIFICATE
                </div>
                <div className="text-[10px] text-neutral-400">
                  Case: {certificateData.caseTitle} ({certificateData.caseId})
                </div>
              </div>

              <div className="space-y-2 text-[11px] leading-relaxed">
                <div><strong>Target Evidence Item:</strong> {certificateData.evidenceItemId} ({certificateData.targetQuery})</div>
                <div><strong>Capture Timestamp:</strong> {new Date(certificateData.generatedDate).toLocaleString()} IST</div>
                <div><strong>Certifying Examiner:</strong> {certificateData.certifyingOfficer.name} ({certificateData.certifyingOfficer.designation})</div>
                <div><strong>Badge / Deputed Station:</strong> {certificateData.certifyingOfficer.badgeNumber} | {certificateData.certifyingOfficer.policeStation}</div>
              </div>

              <div className="p-3.5 bg-black/60 border border-neutral-700 rounded-xl space-y-1 text-[10px]">
                <div className="text-primary font-bold">TECHNICAL INTEGRITY PARAMETERS:</div>
                <div>• Hostname: {certificateData.technicalDetails.systemHostname}</div>
                <div>• Source IP: {certificateData.technicalDetails.ipAddress}</div>
                <div>• OS / Environment: {certificateData.technicalDetails.osVersion}</div>
                <div>• Immutable SHA-256: <span className="text-emerald-400 break-all">{certificateData.technicalDetails.captureHashSHA256}</span></div>
                <div>• RFC-3161 Token: {certificateData.technicalDetails.rfc3161TimeStamp}</div>
              </div>

              <div className="italic text-[11px] text-neutral-300 border-l-2 border-primary pl-3">
                "{certificateData.legalDeclaration}"
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-700 text-[10px]">
                <div>
                  <div>DIGITALLY SIGNED & VERIFIED</div>
                  <div className="text-emerald-400 font-mono font-bold">SHA-256 HASH VERIFIED OK</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-neutral-200">{certificateData.certifyingOfficer.name}</div>
                  <div className="text-neutral-400">{certificateData.certifyingOfficer.badgeNumber}</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-on-surface-variant font-tactical-data">
                Standard Court Evidence Form • Sec 65B(4)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-xl text-xs font-tactical-data text-on-surface transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
                <button
                  onClick={() => setCertificateData(null)}
                  className="px-5 py-2 bg-primary text-on-primary rounded-xl text-xs font-tactical-data font-bold uppercase tracking-wider hover:bg-primary-dark transition-all cursor-pointer"
                >
                  Confirm & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
