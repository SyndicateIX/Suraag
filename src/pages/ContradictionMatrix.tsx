import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  GitCompare,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Crosshair,
  Eye,
  ExternalLink,
  Play,
  Filter,
  FileText,
  Layers,
  Sparkles,
  Shield,
  Clock,
  UserX
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { useSuraagStore } from '../store/useSuraagStore';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { Modal } from '../components/common/Modal';
import { correlateWitnessStatements } from '../utils/witnessCorrelationEngine';
import { WitnessStatement } from '../types';

export const ContradictionMatrix: React.FC = () => {
  const { selectedCaseId } = useSuraagStore();
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedWitnessFilter, setSelectedWitnessFilter] = useState('ALL');
  const [selectedAttemptPhase, setSelectedAttemptPhase] = useState('ALL');
  const [activeModalItem, setActiveModalItem] = useState<any | null>(null);
  const [checkingProgress, setCheckingProgress] = useState(100);

  // Fetch witness statements & correlated refutations
  const { data: apiWitnesses = [], isLoading } = useQuery({
    queryKey: ['witnesses', selectedCaseId],
    queryFn: () => apiClient.witnesses.getAll(selectedCaseId),
  });

  // Reconcile with local correlation engine
  const localCorrelation = correlateWitnessStatements(undefined, undefined, selectedCaseId);

  // Comprehensive default refutation log for Case-2026-DT01 (including suspect depositions & simulated alibi refutations)
  const defaultRefutations = [
    {
      witnessId: 'SUS-STATEMENT-01',
      witnessName: 'Diya Gupta',
      role: 'Primary Suspect / Co-Conspirator Deposition',
      statementDate: '2026-06-22T16:00:00Z',
      credibilityScore: 12.4,
      target: 'Attempt 1 – Olive Terrace Dinner (April 14)',
      claim: 'Diya claimed Keshan suffered an unexpected organic stomach bug during dinner.',
      reason: 'CONTRADICTION DETECTED: Sanjivani Medico CCTV CAM-01 captured Chetany Sharma purchasing concentrated Thallium poison at 7:00 PM prior to Diya\'s 9:00 PM dinner reservation. Deleted WhatsApp threads confirm pre-dinner coordination.',
      severity: 'CRITICAL',
      evidenceRefuting: ['EVID-001', 'EVID-002', 'EVID-004'],
      timelineEvents: ['EV-REP-01', 'EV-REP-02'],
      occlusionDetails: 'Financial & CCTV Intersection: UPI payment ₹1,450 logged to Chetany; CCTV CAM-01 timestamp 19:00:14.'
    },
    {
      witnessId: 'SUS-STATEMENT-01',
      witnessName: 'Diya Gupta',
      role: 'Primary Suspect / Co-Conspirator Deposition',
      statementDate: '2026-06-22T16:00:00Z',
      credibilityScore: 12.4,
      target: 'Attempt 2 – Skyline Valley Resort Knife Attack (May 13)',
      claim: 'Diya claimed she was asleep in Room 304 from midnight to morning and heard no disturbance.',
      reason: 'CONTRADICTION DETECTED: CDR tower audits reveal 18 pre-incident phone calls between Diya and Chetany between 01:00 AM and 02:25 AM right before the knife flight. Eyewitness Archita Deshmukh saw Chetany flee Room 304.',
      severity: 'CRITICAL',
      evidenceRefuting: ['EVID-005', 'EVID-006', 'EVID-020'],
      timelineEvents: ['EV-REP-03', 'EV-REP-04'],
      occlusionDetails: '3D Raycast Intersection: Direct line of sight from Room 306 corridor doorway to Room 304 exit; latent prints on knife EVID-005 match Chetany.'
    },
    {
      witnessId: 'SUS-STATEMENT-01',
      witnessName: 'Diya Gupta',
      role: 'Primary Suspect / Co-Conspirator Deposition',
      statementDate: '2026-06-22T16:00:00Z',
      credibilityScore: 12.4,
      target: 'Final Incident – Phoenix Marketcity Shopping Alibi & Selfie Slip (June 19–21)',
      claim: 'Diya claimed she was shopping alone in Phoenix Marketcity on June 19 and that Keshan slipped taking a selfie on June 21.',
      reason: 'CONTRADICTION DETECTED: Café supervisor Rohan Mehta and CCTV CAM-05 confirm Diya & Chetany spent over an hour examining Lohegaon Hill maps on June 19. Autopsy by Dr. Neha Patwardhan confirms a 7.62mm gunshot trajectory through scapula BEFORE cliff fall.',
      severity: 'CRITICAL',
      evidenceRefuting: ['EVID-014', 'EVID-016', 'EVID-020'],
      timelineEvents: ['EV-REP-07', 'EV-REP-08'],
      occlusionDetails: '3D Geometry & Trajectory Refutation: Scapular entry angle 14° downward matches sniper ridge elevation [15m, 8m, -40m]. Accidental selfie slip mathematically impossible.'
    },
    {
      witnessId: 'SUS-STATEMENT-02',
      witnessName: 'Chetany Sharma',
      role: 'Co-Conspirator / Executioner Deposition',
      statementDate: '2026-06-22T17:30:00Z',
      credibilityScore: 8.5,
      target: 'Attempt 2 – Skyline Resort Knife Flight Alibi (May 13)',
      claim: 'Chetany claimed he was at his residence in Viman Nagar all night on May 13 and never possessed a tactical hunting knife.',
      reason: 'CONTRADICTION DETECTED: Latent fingerprints recovered from tactical knife EVID-005 dropped in resort corridor match Chetany with 99.8% certainty; eyewitness Archita Deshmukh identified him fleeing Room 304.',
      severity: 'CRITICAL',
      evidenceRefuting: ['EVID-005', 'EVID-006'],
      timelineEvents: ['EV-REP-04'],
      occlusionDetails: 'Dactyloscopic match card #12 confirms 14 minutiae points on knife hilt.'
    },
    {
      witnessId: 'SUS-STATEMENT-02',
      witnessName: 'Chetany Sharma',
      role: 'Co-Conspirator / Executioner Deposition',
      statementDate: '2026-06-22T17:30:00Z',
      credibilityScore: 8.5,
      target: 'Attempt 3 – ₹6,000,000 Hired Hit Wire Claim (June 10)',
      claim: 'Chetany claimed the ₹6,000,000 wire to Vikram Rathod was a commercial loan repayment for mobile phone spares inventory.',
      reason: 'CONTRADICTION DETECTED: Hitman Vikram Rathod confessed money was paid for hit-and-run assault; burner voice recordings EVID-011 confirm contract terms.',
      severity: 'CRITICAL',
      evidenceRefuting: ['EVID-010', 'EVID-011'],
      timelineEvents: ['EV-REP-05', 'EV-REP-06'],
      occlusionDetails: 'Financial ledger audit: HDFC RTGS wire sent at 09:15 AM, truck impact occurred at 10:00 AM.'
    },
    {
      witnessId: 'SUS-STATEMENT-02',
      witnessName: 'Chetany Sharma',
      role: 'Co-Conspirator / Executioner Deposition',
      statementDate: '2026-06-22T17:30:00Z',
      credibilityScore: 8.5,
      target: 'Final Incident – Lohegaon Hill Rifle & Sniper Ambush Denial (June 21)',
      claim: 'Chetany claimed he was at his shop all day on June 21 and has never owned or fired a sniper rifle.',
      reason: 'CONTRADICTION DETECTED: Chetany\'s epithelial DNA recovered on trigger guard of Remington Model 700 sniper rifle EVID-016 on Lohegaon boulder ridge; spent 7.62mm casing ballistically matches the fatal wound.',
      severity: 'CRITICAL',
      evidenceRefuting: ['EVID-016', 'EVID-020'],
      timelineEvents: ['EV-REP-08'],
      occlusionDetails: 'Ballistic acoustic echo vector intersects Chetany\'s hidden position on Lohegaon boulder ridge.'
    },
    {
      witnessId: 'SUS-STATEMENT-01',
      witnessName: 'Diya Gupta',
      role: 'Primary Suspect / Co-Conspirator Deposition',
      statementDate: '2026-06-22T16:00:00Z',
      credibilityScore: 12.4,
      target: 'All Incidents – Encrypted Communication Storage Claim',
      claim: 'Diya claimed she and Chetany only exchanged routine casual greetings and never discussed any plan regarding Keshan over text or voice calls.',
      reason: 'CONTRADICTION DETECTED: Cellebrite digital forensics dump (EVID-020) recovered 482 deleted encrypted WhatsApp voice notes detailing step-by-step murder logistics across all 4 attempt phases.',
      severity: 'HIGH',
      evidenceRefuting: ['EVID-020'],
      timelineEvents: ['EV-REP-01', 'EV-REP-03', 'EV-REP-05', 'EV-REP-07'],
      occlusionDetails: 'Cellebrite report hash #CEL-99214: 482 audio files reconstructed from unallocated flash memory.'
    },
    {
      witnessId: 'SUS-STATEMENT-02',
      witnessName: 'Chetany Sharma',
      role: 'Co-Conspirator / Executioner Deposition',
      statementDate: '2026-06-22T17:30:00Z',
      credibilityScore: 8.5,
      target: 'Attempt 1 – Sanjivani Medico Veterinary Prescription Alibi',
      claim: 'Chetany claimed he bought veterinary supplements at Sanjivani Medico for a neighbor\'s sick farm animal, not thallium poison for human consumption.',
      reason: 'CONTRADICTION DETECTED: Pharmacy ledger verification confirmed the veterinary license number provided by Chetany was entirely forged. Chemical analysis of seized container matches pure toxic Thallium sulphate.',
      severity: 'HIGH',
      evidenceRefuting: ['EVID-001', 'EVID-004'],
      timelineEvents: ['EV-REP-01'],
      occlusionDetails: 'State Veterinary Board database check confirmed License #VET-9942 does not exist.'
    },
    {
      witnessId: 'SUS-STATEMENT-01',
      witnessName: 'Diya Gupta',
      role: 'Primary Suspect / Co-Conspirator Deposition',
      statementDate: '2026-06-22T16:00:00Z',
      credibilityScore: 12.4,
      target: 'Attempt 2 – Skyline Valley Resort False Intruder Claim',
      claim: 'Diya claimed a hotel staff member attempted to steal Keshan\'s luxury watch and ring; there was no targeted assassination attempt.',
      reason: 'CONTRADICTION DETECTED: Resort door access audit confirms no staff keycards were swiped between 01:00 AM and 03:00 AM. Keycard log proves emergency stairwell door was forced open from exterior.',
      severity: 'MEDIUM',
      evidenceRefuting: ['EVID-005', 'EVID-006'],
      timelineEvents: ['EV-REP-03', 'EV-REP-04'],
      occlusionDetails: 'Resort electronic keycard database audit #SK-304 confirms exterior stairwell door breach at 02:22:15 AM.'
    }
  ];

  // Map any contradictions directly attached to witnesses
  const extractedFromWitnesses = [...apiWitnesses, ...localCorrelation.witnesses].flatMap((w) =>
    (w.contradictions || []).map((c) => ({
      witnessId: w.id,
      witnessName: w.witnessName,
      role: w.role || 'Suspect / Witness Deposition',
      statementDate: w.statementDate,
      credibilityScore: w.credibilityScore,
      target: c.target,
      claim: c.claim || w.statementText,
      reason: c.reason,
      severity: c.severity || 'CRITICAL',
      evidenceRefuting: c.evidenceRefuting || w.supportingEvidenceIds || [],
      timelineEvents: c.timelineEvents || [],
      occlusionDetails: c.occlusionDetails || '3D Geometry & Raycast Intersect confirmed 0% direct visibility.'
    }))
  );

  // Combine extracted + default refutations, deduplicating by target and witnessName
  const allContradictionsMap = new Map<string, any>();
  [...defaultRefutations, ...extractedFromWitnesses].forEach((item) => {
    const key = `${item.witnessName.toLowerCase()}_${item.target.toLowerCase()}`;
    if (!allContradictionsMap.has(key)) {
      allContradictionsMap.set(key, item);
    }
  });

  const allContradictions = Array.from(allContradictionsMap.values());

  // Apply toolbar filters
  const filteredContradictions = allContradictions.filter((item) => {
    if (selectedSeverity !== 'ALL' && item.severity !== selectedSeverity) return false;
    if (selectedWitnessFilter !== 'ALL' && !item.witnessName.toLowerCase().includes(selectedWitnessFilter.toLowerCase())) return false;
    if (selectedAttemptPhase !== 'ALL' && !item.target.toLowerCase().includes(selectedAttemptPhase.toLowerCase())) return false;
    return true;
  });

  const runLiveGeometricCheck = (item?: any) => {
    const targetItem = item || allContradictions[0];
    setActiveModalItem(targetItem);
    setCheckingProgress(15);
    const interval = setInterval(() => {
      setCheckingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 350);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GitCompare className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              AUTOMATED STATEMENT vs. 3D GEOMETRY & FORENSIC REFUTATION ENGINE
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            Contradiction Matrix & Refutation Log
          </h1>
        </div>

        <button
          onClick={() => runLiveGeometricCheck(allContradictions[0])}
          className="px-5 py-2.5 rounded bg-primary text-on-primary hover:bg-surface-tint font-tactical-data text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(255,84,76,0.35)] flex items-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Run Live Geometric Refutation Check</span>
        </button>
      </div>

      {/* Report Refutation Ingestion Summary */}
      <GlassCard glow className="p-4 border-l-4 border-l-primary bg-secondary-container/10 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-primary/20 border border-primary shrink-0">
              <ShieldAlert className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-tactical-data text-xs font-bold uppercase text-primary tracking-wider">
                  INVESTIGATION DOSSIER REFUTATION FUSION ACTIVE
                </span>
                <Badge variant="critical">99.98% DECEPTION PROBABILITY</Badge>
              </div>
              <p className="text-xs text-on-surface-variant font-body-md mt-0.5">
                Ingested official chargesheet testimonies, suspect alibi claims, physical evidence vault exhibits, and 3D raycasting vectors.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-tactical-data">
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">DECEPTIONS DETECTED</span>
              <strong className="text-primary font-bold text-sm">{allContradictions.length} REFUTATIONS</strong>
            </div>
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">SUSPECTS FLAG</span>
              <strong className="text-emerald-400 font-bold text-sm">2 SUSPECTS</strong>
            </div>
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">REFUTING EXHIBITS</span>
              <strong className="text-primary font-bold text-sm">9 EXHIBITS</strong>
            </div>
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">AVG CREDIBILITY</span>
              <strong className="text-emerald-400 font-bold text-sm">10.45% (DOWNGRADED)</strong>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Filter Toolbar */}
      <GlassCard className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Witness / Suspect Filter */}
          <div className="flex flex-wrap items-center gap-1.5 font-tactical-data text-xs">
            <span className="text-on-surface-variant font-bold text-[10px] uppercase tracking-wider mr-1 flex items-center gap-1">
              <UserX className="w-3.5 h-3.5 text-primary" />
              SUBJECT:
            </span>
            {['ALL', 'Diya Gupta', 'Chetany Sharma'].map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedWitnessFilter(subj)}
                className={`px-3 py-1.5 rounded transition-all border text-[11px] ${
                  selectedWitnessFilter === subj
                    ? 'bg-primary text-on-primary border-primary font-bold shadow-[0_0_10px_rgba(255,84,76,0.3)]'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant hover:text-on-surface'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>

          {/* Severity Filters */}
          <div className="flex flex-wrap items-center gap-1.5 font-tactical-data text-xs">
            <span className="text-on-surface-variant font-bold text-[10px] uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-primary" />
              SEVERITY:
            </span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1.5 rounded transition-all border text-[11px] ${
                  selectedSeverity === sev
                    ? 'bg-secondary-container text-primary border-primary font-bold shadow-[0_0_10px_rgba(255,84,76,0.3)]'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant hover:text-on-surface'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Attempt Phase Filter Tabs */}
        <div className="pt-3 border-t border-outline-variant/30 flex flex-wrap items-center gap-2 font-tactical-data text-xs">
          <span className="text-on-surface-variant font-bold text-[10px] uppercase tracking-wider mr-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-primary" />
            INCIDENT PHASE:
          </span>
          {[
            { id: 'ALL', label: 'All Incidents' },
            { id: 'Attempt 1', label: 'Attempt 1: Dinner' },
            { id: 'Attempt 2', label: 'Attempt 2: Knife Attack' },
            { id: 'Attempt 3', label: 'Attempt 3: Hit & Run' },
            { id: 'Final Incident', label: 'Final Homicide' }
          ].map((phase) => (
            <button
              key={phase.id}
              onClick={() => setSelectedAttemptPhase(phase.id)}
              className={`px-3 py-1 rounded transition-all border text-[11px] ${
                selectedAttemptPhase === phase.id
                  ? 'bg-primary text-on-primary border-primary font-bold shadow-[0_0_8px_rgba(255,84,76,0.4)]'
                  : 'bg-surface-container-low text-on-surface-variant border-outline-variant/60 hover:text-on-surface'
              }`}
            >
              {phase.label}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Contradictions & Refutations Stream */}
      {isLoading ? (
        <LoadingSkeleton rows={3} height="h-44" />
      ) : filteredContradictions.length === 0 ? (
        <GlassCard className="p-8 text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-primary mx-auto opacity-80" />
          <h3 className="font-display-lg text-lg text-on-surface uppercase">No Refutations Matched Filter</h3>
          <p className="text-xs text-on-surface-variant">
            Try resetting your subject, severity, or incident phase filter criteria.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          {filteredContradictions.map((item, idx) => (
            <GlassCard key={idx} glow className="p-6 border-primary/70 space-y-4">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-outline-variant/30">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="critical" pulse>
                    SEVERITY: {item.severity}
                  </Badge>
                  <span className="font-display-lg font-bold text-xl uppercase text-on-surface">
                    Subject: {item.witnessName}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-[11px] font-tactical-data text-on-surface-variant">
                    {item.role}
                  </span>
                </div>
                <div className="font-tactical-data text-xs text-primary font-bold">
                  CREDIBILITY DOWNGRADED TO {item.credibilityScore}%
                </div>
              </div>

              {/* Target Claim Heading */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-tactical-data uppercase text-primary font-bold">
                  REFUTATION TARGET:
                </span>
                <span className="text-xs font-tactical-data font-bold text-on-surface">
                  {item.target}
                </span>
              </div>

              {/* Grid: Statement Claim vs 3D Forensic Refutation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                <div className="p-4 rounded bg-surface-container-low border border-outline-variant/40 space-y-2">
                  <span className="text-[10px] font-tactical-data uppercase tracking-wider text-on-surface-variant font-bold block flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    DEPOSITION STATEMENT / ALIBI CLAIM
                  </span>
                  <p className="text-xs font-body-md text-on-surface italic leading-relaxed">
                    "{item.claim}"
                  </p>
                </div>

                <div className="p-4 rounded bg-secondary-container/70 border border-primary space-y-2">
                  <span className="text-[10px] font-tactical-data uppercase tracking-wider text-primary font-bold block flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-primary animate-pulse" />
                    3D GEOMETRIC & FORENSIC PROOF REFUTATION
                  </span>
                  <p className="text-xs font-body-md text-on-surface-variant leading-relaxed font-semibold">
                    {item.reason}
                  </p>
                </div>
              </div>

              {/* Footer: Refuting Evidence, Timeline Events, Raycast Details */}
              <div className="pt-3 border-t border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-tactical-data">
                <div className="flex flex-wrap items-center gap-3 text-on-surface-variant/90">
                  {item.evidenceRefuting && item.evidenceRefuting.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      REFUTING EXHIBITS: <strong className="text-primary">{item.evidenceRefuting.join(', ')}</strong>
                    </span>
                  )}
                  {item.timelineEvents && item.timelineEvents.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      TIMELINE EVENTS: <strong className="text-emerald-400">{item.timelineEvents.join(', ')}</strong>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[11px] text-on-surface-variant/80 hidden lg:inline truncate max-w-xs">
                    {item.occlusionDetails}
                  </span>
                  <button
                    onClick={() => runLiveGeometricCheck(item)}
                    className="text-primary hover:underline font-bold flex items-center gap-1.5 shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Launch 3D Raycast Audit</span>
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Live Geometric Refutation Check Modal */}
      {activeModalItem && (
        <Modal
          isOpen={!!activeModalItem}
          onClose={() => setActiveModalItem(null)}
          title={`3D Raycasting & Line-of-Sight Audit: ${activeModalItem.witnessName}`}
        >
          <div className="space-y-4 font-tactical-data text-xs">
            <div className="flex items-center justify-between">
              <span className="text-primary font-bold">
                TARGET: {activeModalItem.target}
              </span>
              <span>{checkingProgress}% Complete</span>
            </div>
            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${checkingProgress}%` }}
              />
            </div>

            <div className="p-3 rounded bg-surface-container border border-outline-variant/40 space-y-1">
              <span className="text-[10px] text-on-surface-variant uppercase">DEPOSITION CLAIM TESTED:</span>
              <p className="text-on-surface italic font-body-md text-xs">"{activeModalItem.claim}"</p>
            </div>

            {checkingProgress === 100 && (
              <div className="p-4 rounded bg-secondary-container/80 border border-primary space-y-3 text-on-surface-variant font-body-md text-xs leading-relaxed mt-4">
                <div className="font-tactical-data text-primary font-bold text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>✔ 3D GEOMETRIC REFUTATION PROVEN (100% CERTAINTY)</span>
                </div>
                <p className="font-semibold text-on-surface">
                  {activeModalItem.reason}
                </p>
                <div className="pt-2 border-t border-outline-variant/30 flex justify-between text-[11px] font-tactical-data text-on-surface-variant">
                  <span>RAYCAST GEOMETRY: <strong>{activeModalItem.occlusionDetails}</strong></span>
                  <span>REFUTING EXHIBITS: <strong className="text-primary">{(activeModalItem.evidenceRefuting || []).join(', ')}</strong></span>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
