import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  GitBranch,
  Sliders,
  ShieldAlert,
  CheckCircle2,
  Activity,
  Sparkles,
  Shield,
  Clock,
  Layers,
  Search,
  RotateCcw,
  ArrowUpRight,
  FileText,
  AlertTriangle,
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { useSuraagStore } from '../store/useSuraagStore';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Scenario } from '../types';

export const ScenarioSimulator: React.FC = () => {
  const { selectedCaseId } = useSuraagStore();
  const [selectedScenarioModal, setSelectedScenarioModal] = useState<Scenario | null>(null);

  // Ingested Investigation Report Crime Scenarios
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: 'SCENARIO-A',
      name: 'Premeditated Multi-Attempt Conspiracy & Staged Selfie Fall',
      title: 'Premeditated Multi-Attempt Conspiracy & Staged Selfie Fall',
      probability: 92.4,
      description: 'Diya Gupta (Primary Mastermind) and Chetany Sharma (Co-Conspirator) executed a 3-month multi-attempt conspiracy to eliminate Keshan Malhotra for ₹45,000,000 insurance. After failed poisoning (April 14), knife assault (May 13), and hit-and-run (June 10), Chetany ambushed Keshan from a sniper ridge on Lohegaon Hill while Diya staged the scene as an accidental selfie fall.',
      evidenceCount: 18,
      category: 'PREMEDITATED_CONSPIRACY',
      supportingEvidenceIds: ['EVID-001', 'EVID-005', 'EVID-010', 'EVID-011', 'EVID-014', 'EVID-016', 'EVID-020'],
      linkedTimelineEventIds: ['EV-REP-01', 'EV-REP-03', 'EV-REP-05', 'EV-REP-07', 'EV-REP-08'],
      suspectClaims: 'Diya claimed she was shopping in Phoenix Marketcity mall on June 19 and that Keshan slipped while taking a selfie on June 21.',
      refutedAlibis: [
        'Brew & Bean CCTV CAM-05 proves Diya & Chetany sat at Table 4 planning ambush on June 19.',
        'Dr. Neha Patwardhan autopsy confirms 7.62mm bullet trajectory through shoulder blade BEFORE cliff fall.',
        'Cellebrite dump EVID-020 contains 482 encrypted voice notes detailing payment milestones.'
      ],
      forensicVerdict: 'DOMINANT HYPOTHESIS – 100% Corroborated by Ballistics, DNA, Autopsy, and Digital Intercepts.'
    },
    {
      id: 'SCENARIO-B',
      name: 'Isolated Hired Hitman Vehicular Assault Hypothesis',
      title: 'Isolated Hired Hitman Vehicular Assault Hypothesis',
      probability: 5.8,
      description: 'Hypothesis that hitman Vikram Rathod acted as an independent rogue driver without mastermind backing. Partially corroborated by RTGS transfer EVID-010, but fails to explain Thallium poisoning in April, resort knife attack in May, or 7.62mm rifle recovery at Lohegaon Hill.',
      evidenceCount: 4,
      category: 'HIRED_HITMAN_SOLO',
      supportingEvidenceIds: ['EVID-010', 'EVID-011', 'EVID-012'],
      linkedTimelineEventIds: ['EV-REP-05', 'EV-REP-06'],
      suspectClaims: 'Vikram Rathod initially claimed the Kharadi crossing accident was an unintended steering failure.',
      refutedAlibis: [
        'Vikram Rathod confessed under interrogation that Chetany Sharma wired ₹6,000,000 for the hit.',
        'Fails to account for 7.62mm Remington rifle recovered at Lohegaon Hill with Chetany DNA.'
      ],
      forensicVerdict: 'REJECTED AS SOLE CAUSE – Accounts for Attempt 3 only; fails holistic multi-attempt timeline.'
    },
    {
      id: 'SCENARIO-C',
      name: 'Accidental Cliff Edge Slip & Structural Fall Defense Claim',
      title: 'Accidental Cliff Edge Slip & Structural Fall Defense Claim',
      probability: 1.8,
      description: 'Diya Gupta\'s emergency 112 defense claim that Keshan lost footing while taking a selfie at Sunset Point. Fully refuted by Dr. Neha Patwardhan\'s autopsy confirming 7.62mm scapular bullet wound inflicted PRIOR to fall and rifle EVID-016 DNA match.',
      evidenceCount: 1,
      category: 'ACCIDENTAL_FALL',
      supportingEvidenceIds: ['EVID-017'],
      linkedTimelineEventIds: ['EV-REP-08'],
      suspectClaims: 'Diya dialed 112 at 17:18 PM reporting an accidental selfie slip on loose cliff gravel.',
      refutedAlibis: [
        'Autopsy recovered 7.62mm bullet core embedded in thoracic tissue prior to impact trauma.',
        'Concealed sniper position identified on boulder ridge 42.8m above Sunset Point.'
      ],
      forensicVerdict: 'REFUTED DEFENSE CLAIM – Contradicted by physical autopsy evidence and ballistic raycasting.'
    }
  ]);

  // Adjust weights and normalize probabilities to 100%
  const handleAdjustWeight = (index: number, newWeight: number) => {
    setScenarios((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], probability: newWeight };
      
      // Calculate total sum of remaining weights
      const otherIndices = [0, 1, 2].filter((i) => i !== index);
      const remainingSum = updated[otherIndices[0]].probability + updated[otherIndices[1]].probability;
      const targetRemainingSum = Math.max(0, 100 - newWeight);

      if (remainingSum > 0) {
        updated[otherIndices[0]].probability = Math.round(((updated[otherIndices[0]].probability / remainingSum) * targetRemainingSum) * 10) / 10;
        updated[otherIndices[1]].probability = Math.round((targetRemainingSum - updated[otherIndices[0]].probability) * 10) / 10;
      } else {
        updated[otherIndices[0]].probability = Math.round((targetRemainingSum / 2) * 10) / 10;
        updated[otherIndices[1]].probability = Math.round((targetRemainingSum / 2) * 10) / 10;
      }

      return updated;
    });
  };

  const handleResetWeights = () => {
    setScenarios([
      { ...scenarios[0], probability: 92.4 },
      { ...scenarios[1], probability: 5.8 },
      { ...scenarios[2], probability: 1.8 }
    ]);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GitBranch className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              MULTI-SCENARIO PROBABILITY SIMULATOR & SCENARIO EVALUATION ENGINE
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            Probable Crime Scenario Laboratory
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="confidence" pulse>BAYESIAN PROBABILITY ACTIVE</Badge>
          <button
            onClick={handleResetWeights}
            className="px-4 py-2 rounded bg-surface-container hover:bg-secondary-container text-on-surface-variant hover:text-primary border border-outline-variant transition-all font-tactical-data text-xs font-bold uppercase flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Weights</span>
          </button>
        </div>
      </div>

      {/* Overview Dossier Ingestion Banner */}
      <GlassCard glow className="p-4 border-l-4 border-l-primary bg-secondary-container/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-primary/20 border border-primary shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-tactical-data text-xs font-bold uppercase text-primary tracking-wider">
                  INVESTIGATION DOSSIER SCENARIO EVALUATION ACTIVE
                </span>
                <Badge variant="active">3 HYPOTHESES EVALUATED</Badge>
              </div>
              <p className="text-xs text-on-surface-variant font-body-md mt-0.5">
                Correlated official chargesheet evidence items against timeline events to rank plausible crime scenarios.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-tactical-data">
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">HYPOTHESES EVALUATED</span>
              <strong className="text-primary font-bold text-sm">3 SCENARIOS</strong>
            </div>
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">TOP RANKED PROBABILITY</span>
              <strong className="text-emerald-400 font-bold text-sm">{scenarios[0].probability.toFixed(1)}% (A)</strong>
            </div>
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">VERIFIED EVIDENCE LINKS</span>
              <strong className="text-primary font-bold text-sm">23 EXHIBITS</strong>
            </div>
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">REFUTED DEFENSE ALIBIS</span>
              <strong className="text-emerald-400 font-bold text-sm">4 CLAIMS</strong>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Main Grid: 3 Scenario Probability Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {scenarios.map((scen, idx) => (
          <GlassCard
            key={scen.id}
            glow={idx === 0}
            className={`p-6 flex flex-col justify-between transition-all space-y-4 ${
              idx === 0
                ? 'border-primary/80 shadow-[0_0_25px_rgba(255,84,76,0.25)]'
                : 'border-outline-variant/60 hover:border-primary/50'
            }`}
          >
            <div className="space-y-4">
              {/* Header: ID Badge & Probability % */}
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant={idx === 0 ? 'critical' : idx === 1 ? 'active' : 'routine'}>
                    {scen.id}
                  </Badge>
                  {scen.category && (
                    <span className="text-[10px] font-tactical-data font-bold uppercase text-on-surface-variant px-2 py-0.5 rounded bg-surface-container border border-outline-variant">
                      {scen.category.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-display-lg text-3xl font-bold text-primary block leading-none">
                    {scen.probability.toFixed(1)}%
                  </span>
                  <span className="text-[9px] font-tactical-data text-on-surface-variant/80 uppercase">
                    BAYESIAN WEIGHT
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-display-lg text-xl font-bold uppercase text-on-surface leading-snug">
                {scen.name}
              </h3>

              {/* Description */}
              <p className="text-xs text-on-surface-variant leading-relaxed font-body-md">
                {scen.description}
              </p>

              {/* Interactive Weight Slider */}
              <div className="p-3 rounded bg-surface-container border border-outline-variant/40 space-y-2 font-tactical-data text-xs">
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-primary" />
                    ADJUST BAYESIAN WEIGHT:
                  </span>
                  <strong className="text-primary font-bold text-sm">{scen.probability.toFixed(1)}%</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={scen.probability}
                  onChange={(e) => handleAdjustWeight(idx, parseFloat(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
                />
              </div>

              {/* Verdict Summary */}
              {scen.forensicVerdict && (
                <div className="p-2.5 rounded bg-secondary-container/40 border border-primary/40 text-[11px] font-tactical-data text-on-surface">
                  <strong className="text-primary block font-bold text-[10px] uppercase">FORENSIC VERDICT:</strong>
                  <span>{scen.forensicVerdict}</span>
                </div>
              )}
            </div>

            {/* Footer Buttons & Evidence Links */}
            <div className="space-y-3 pt-3 border-t border-outline-variant/30 font-tactical-data text-xs">
              <div className="flex justify-between items-center text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  SUPPORTING EVIDENCE:
                </span>
                <strong className="text-emerald-400 font-bold">{scen.evidenceCount} verified links</strong>
              </div>

              <button
                onClick={() => setSelectedScenarioModal(scen)}
                className="w-full py-2.5 rounded bg-primary/20 hover:bg-primary text-primary hover:text-on-primary border border-primary/50 transition-all font-tactical-data text-xs font-bold uppercase flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(255,84,76,0.2)]"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Inspect Evidence & Timeline Links</span>
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Scenario Deep-Dive Audit Modal */}
      {selectedScenarioModal && (
        <Modal
          isOpen={!!selectedScenarioModal}
          onClose={() => setSelectedScenarioModal(null)}
          title={`Scenario Audit Breakdown: ${selectedScenarioModal.id}`}
        >
          <div className="space-y-4 font-tactical-data text-xs">
            <div className="flex items-center justify-between">
              <Badge variant={selectedScenarioModal.id === 'SCENARIO-A' ? 'critical' : 'active'}>
                {selectedScenarioModal.id} DETAILS
              </Badge>
              <span className="text-primary font-bold text-sm">BAYESIAN PROBABILITY: {selectedScenarioModal.probability.toFixed(1)}%</span>
            </div>

            <h3 className="font-display-lg text-xl font-bold uppercase text-on-surface">
              {selectedScenarioModal.name}
            </h3>

            <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
              {selectedScenarioModal.description}
            </p>

            {/* Suspect Claims vs Forensic Refutations */}
            {selectedScenarioModal.suspectClaims && (
              <div className="p-3 rounded bg-surface-container border border-outline-variant/40 space-y-1">
                <span className="text-[10px] text-primary font-bold uppercase">SUSPECT DEFENSE CLAIM:</span>
                <p className="font-body-md text-xs text-on-surface italic">
                  "{selectedScenarioModal.suspectClaims}"
                </p>
              </div>
            )}

            {selectedScenarioModal.refutedAlibis && selectedScenarioModal.refutedAlibis.length > 0 && (
              <div className="p-3 rounded bg-secondary-container/80 border border-primary space-y-2">
                <span className="text-[10px] text-primary font-bold uppercase flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-primary" />
                  FORENSIC CORROBORATION & REFUTATION POINTS:
                </span>
                <ul className="space-y-1 font-body-md text-xs text-on-surface list-disc pl-4">
                  {selectedScenarioModal.refutedAlibis.map((point, pIdx) => (
                    <li key={pIdx}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ingested Exhibits & Timeline Events Links */}
            <div className="pt-2 border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-3 text-[11px]">
              <div>
                <span className="text-on-surface-variant block">SUPPORTING EXHIBITS:</span>
                <strong className="text-primary">{(selectedScenarioModal.supportingEvidenceIds || []).join(', ')}</strong>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/evidence" className="text-primary hover:underline font-bold flex items-center gap-1">
                  <span>Evidence Vault</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <Link to="/timeline" className="text-emerald-400 hover:underline font-bold flex items-center gap-1">
                  <span>Timeline Engine</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
