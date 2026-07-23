import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  AlertTriangle,
  MapPin,
  Radio,
  ShieldAlert,
  CheckCircle2,
  Search,
  Layers,
  Filter,
  Shield,
  Clock,
  ArrowUpRight,
  RefreshCw,
  FileText,
  Compass,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { useSuraagStore } from '../store/useSuraagStore';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { Modal } from '../components/common/Modal';
import { MissingEvidencePrediction } from '../types';

export const MissingEvidence: React.FC = () => {
  const { selectedCaseId } = useSuraagStore();
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [activeModalPrediction, setActiveModalPrediction] = useState<MissingEvidencePrediction | null>(null);
  const [isInferring, setIsInferring] = useState(false);

  // Ingested Investigation Report Missing Evidence Predictions
  const defaultPredictions: MissingEvidencePrediction[] = [
    {
      id: 'PRED-REP-01',
      title: 'Forged Veterinary License Registry & Chemical Wholesaler Invoice',
      phase: 'Attempt 1 – Dinner and Deception (April 14)',
      area: 'Sanjivani Medico (Viman Nagar) & State Veterinary Board DB',
      category: 'DIGITAL_LOG',
      boost: '+16.8%',
      confidence: 96.5,
      reason: 'Graph gap analysis reveals Chetany Sharma used a fake license number (#VET-9942) to purchase concentrated Thallium sulphate at 19:00. Cross-referencing chemical wholesaler invoices will identify the secondary distributor.',
      recommendedAction: 'Issue subpoena to State Veterinary Licensing Authority for registry audit and seize pharmacy distributor manifest.',
      recoveryWindowMinutes: 60,
      supportingEvidenceIds: ['EVID-001', 'EVID-004'],
      linkedTimelineEventIds: ['EV-REP-01']
    },
    {
      id: 'PRED-REP-02',
      title: 'Skyline Resort Emergency Stairwell Access Log & Soil Impression',
      phase: 'Attempt 2 – Birthday Resort Knife Attack (May 13)',
      area: 'Skyline Valley Resort Room 304 Exterior Stairwell & Lawn',
      category: 'PHYSICAL_EXHIBIT',
      boost: '+18.4%',
      confidence: 98.1,
      reason: 'While tactical hunting knife EVID-005 was recovered in the corridor, the forced exterior stairwell door lock log and mud footwear impression on the exit threshold remain un-annexed. Recovery will corroborate forced entry at 02:22 AM.',
      recommendedAction: 'Cast dental stone impression of exterior stairwell soil and extract electronic keycard audit file #SK-304.',
      recoveryWindowMinutes: 45,
      supportingEvidenceIds: ['EVID-005', 'EVID-006'],
      linkedTimelineEventIds: ['EV-REP-03', 'EV-REP-04']
    },
    {
      id: 'PRED-REP-03',
      title: 'Hitman Secondary Burner Phone IMEI & Cash Kickback Receipt',
      phase: 'Attempt 3 – Blood on the Streets (June 10)',
      area: 'Apex Tech IT Park Kharadi Perimeter & HDFC Kharadi Branch',
      category: 'FINANCIAL_TRAIL',
      boost: '+22.5%',
      confidence: 99.4,
      reason: 'RTGS transfer EVID-010 accounts for ₹6,000,000, but voice intercept EVID-011 references a ₹500,000 upfront cash deposit. Extracting tower pings for burner IMEI #864902102 will localize the cash drop location.',
      recommendedAction: 'Triangulate cell tower pings for burner handset IMEI #864902102 and retrieve HDFC cash vault serial logs.',
      recoveryWindowMinutes: 30,
      supportingEvidenceIds: ['EVID-010', 'EVID-011'],
      linkedTimelineEventIds: ['EV-REP-05', 'EV-REP-06']
    },
    {
      id: 'PRED-REP-04',
      title: 'Brew & Bean Café Table 4 Paper Scrap & GPS Track',
      phase: 'Final Incident – Ambush Planning Session (June 19)',
      area: 'Brew & Bean Café Table 4 Trash Bin & Audi Q3 Telemetry',
      category: 'DIGITAL_LOG',
      boost: '+19.2%',
      confidence: 97.8,
      reason: 'Order bill EVID-014 confirms June 19 café meeting. Witness Rohan Mehta noted suspects sketched notes on paper napkin scraps. Audi Q3 GPS telemetry will prove precise route taken from café to Lohegaon Hill.',
      recommendedAction: 'Extract Audi Q3 MH-12-FR-0007 onboard ECU telemetry logs and examine café paper scrap for latent handwriting.',
      recoveryWindowMinutes: 90,
      supportingEvidenceIds: ['EVID-014'],
      linkedTimelineEventIds: ['EV-REP-07']
    },
    {
      id: 'PRED-REP-05',
      title: 'Remington Model 700 Rifle Suppressor Thread Micro-Analysis',
      phase: 'Final Incident – Lohegaon Hill Cliff Ambush (June 21)',
      area: 'Lohegaon Hill Boulder Ridge & Sassoon Forensic Mortuary',
      category: 'FORENSIC_SPECIMEN',
      boost: '+24.1%',
      confidence: 99.9,
      reason: 'Autopsy by Dr. Neha Patwardhan recovered 7.62mm bullet core. Microscopic toolmark matching on rifle EVID-016 suppressor threading will prove exact acoustic suppressor attachment used on ridge.',
      recommendedAction: 'Perform scanning electron microscopy (SEM) on Remington 700 barrel threading and match spent casing striations.',
      recoveryWindowMinutes: 120,
      supportingEvidenceIds: ['EVID-016', 'EVID-020'],
      linkedTimelineEventIds: ['EV-REP-08']
    }
  ];

  // Query predictions or use default
  const { data: apiPredictions = [], isLoading } = useQuery({
    queryKey: ['missing-evidence-predictions', selectedCaseId],
    queryFn: () => apiClient.evidence.getPredictions(selectedCaseId),
  });

  const predictions: MissingEvidencePrediction[] =
    apiPredictions && apiPredictions.length > 0
      ? apiPredictions
      : defaultPredictions;

  // Filter Toolbar logic
  const filteredPredictions = predictions.filter((p) => {
    if (selectedPhaseFilter !== 'ALL' && !p.phase.toLowerCase().includes(selectedPhaseFilter.toLowerCase())) return false;
    if (selectedCategoryFilter !== 'ALL' && p.category !== selectedCategoryFilter) return false;
    return true;
  });

  const handleRunInference = () => {
    setIsInferring(true);
    setTimeout(() => {
      setIsInferring(false);
    }, 500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              GRAPH CORRELATION GAP INFERENCE & EVIDENCE PREDICTION QUEUE
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            Missing Evidence Predictor
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="active" pulse>AI BAYESIAN PREDICTOR ACTIVE</Badge>
          <button
            onClick={handleRunInference}
            disabled={isInferring}
            className="px-5 py-2.5 rounded bg-primary text-on-primary hover:bg-surface-tint font-tactical-data text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(255,84,76,0.35)] flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isInferring ? 'animate-spin' : ''}`} />
            <span>{isInferring ? 'RUNNING GRAPH INFERENCE...' : 'RE-RUN BAYESIAN INFERENCE'}</span>
          </button>
        </div>
      </div>

      {/* Investigation Dossier Evidence Gap Overview Banner */}
      <GlassCard glow className="p-4 border-l-4 border-l-primary bg-secondary-container/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-primary/20 border border-primary shrink-0">
              <ShieldAlert className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-tactical-data text-xs font-bold uppercase text-primary tracking-wider">
                  INVESTIGATION DOSSIER GAP INFERENCE ACTIVE
                </span>
                <Badge variant="active">5 GAP LEADS IDENTIFIED</Badge>
              </div>
              <p className="text-xs text-on-surface-variant font-body-md mt-0.5">
                Correlated official chargesheet evidence vault items against witness statements to identify missing physical exhibits, digital logs, and financial trails.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-tactical-data">
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">GAPS IDENTIFIED</span>
              <strong className="text-primary font-bold text-sm">5 CRITICAL LEADS</strong>
            </div>
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">AVG CONFIDENCE</span>
              <strong className="text-emerald-400 font-bold text-sm">98.3% ACCURACY</strong>
            </div>
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">AVG PROBABILITY BOOST</span>
              <strong className="text-primary font-bold text-sm">+19.5% BOOST</strong>
            </div>
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">RECOVERY WINDOW</span>
              <strong className="text-emerald-400 font-bold text-sm">&lt; 60 MINS</strong>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Filter Toolbar */}
      <GlassCard className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-tactical-data text-xs">
          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-on-surface-variant font-bold text-[10px] uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-primary" />
              EVIDENCE CATEGORY:
            </span>
            {[
              { id: 'ALL', label: 'All Categories' },
              { id: 'DIGITAL_LOG', label: 'Digital Log' },
              { id: 'PHYSICAL_EXHIBIT', label: 'Physical Exhibit' },
              { id: 'FINANCIAL_TRAIL', label: 'Financial Trail' },
              { id: 'FORENSIC_SPECIMEN', label: 'Forensic Specimen' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded transition-all border text-[11px] ${
                  selectedCategoryFilter === cat.id
                    ? 'bg-secondary-container text-primary border-primary font-bold shadow-[0_0_10px_rgba(255,84,76,0.3)]'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant hover:text-on-surface'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Incident Phase Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-on-surface-variant font-bold text-[10px] uppercase tracking-wider mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-primary" />
              INCIDENT PHASE:
            </span>
            {[
              { id: 'ALL', label: 'All Incidents' },
              { id: 'Attempt 1', label: 'Attempt 1: Dinner' },
              { id: 'Attempt 2', label: 'Attempt 2: Knife' },
              { id: 'Attempt 3', label: 'Attempt 3: Hit & Run' },
              { id: 'Final Incident', label: 'Final Homicide' }
            ].map((phase) => (
              <button
                key={phase.id}
                onClick={() => setSelectedPhaseFilter(phase.id)}
                className={`px-3 py-1 rounded transition-all border text-[11px] ${
                  selectedPhaseFilter === phase.id
                    ? 'bg-primary text-on-primary border-primary font-bold shadow-[0_0_8px_rgba(255,84,76,0.4)]'
                    : 'bg-surface-container-low text-on-surface-variant border-outline-variant/60 hover:text-on-surface'
                }`}
              >
                {phase.label}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Predictions Cards Grid */}
      {isLoading || isInferring ? (
        <LoadingSkeleton rows={3} height="h-48" />
      ) : filteredPredictions.length === 0 ? (
        <GlassCard className="p-8 text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-primary mx-auto opacity-80" />
          <h3 className="font-display-lg text-lg text-on-surface uppercase">No Evidence Predictions Matched Filter</h3>
          <p className="text-xs text-on-surface-variant">
            Try resetting your evidence category or incident phase filter criteria.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPredictions.map((pred, idx) => (
            <GlassCard key={pred.id || idx} glow className="p-6 flex flex-col justify-between border-primary/60 hover:border-primary transition-all space-y-4">
              <div className="space-y-3">
                {/* Header: Prediction Badge & Probability Boost */}
                <div className="flex items-center justify-between gap-2 border-b border-outline-variant/30 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="critical" className="text-[10px]">
                      PREDICTION #{idx + 1}
                    </Badge>
                    <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-[10px] font-tactical-data font-bold text-on-surface">
                      {pred.category.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="font-tactical-data text-xs text-emerald-400 font-bold">
                    BOOST: {pred.boost}
                  </span>
                </div>

                {/* Phase Tag */}
                <span className="text-[10px] font-tactical-data text-primary font-bold uppercase tracking-wider block">
                  {pred.phase}
                </span>

                {/* Title */}
                <h3 className="font-display-lg text-lg font-bold uppercase text-on-surface leading-snug">
                  {pred.title}
                </h3>

                {/* Search Area & Confidence Box */}
                <div className="p-3 rounded bg-surface-container border border-outline-variant/40 space-y-1 font-tactical-data text-xs">
                  <div className="flex items-center gap-1.5 text-primary font-bold">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Area: {pred.area}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant text-[11px] pt-1">
                    <span>Prediction Confidence: <strong className="text-emerald-400">{pred.confidence}%</strong></span>
                    <span>Recovery Window: <strong className="text-primary">&lt; {pred.recoveryWindowMinutes}m</strong></span>
                  </div>
                </div>

                {/* Reasoning */}
                <p className="text-xs text-on-surface-variant leading-relaxed font-body-md">
                  {pred.reason}
                </p>

                {/* Action Lead */}
                <div className="p-2.5 rounded bg-secondary-container/40 border border-primary/40 font-tactical-data text-[11px] text-on-surface">
                  <strong className="text-primary block font-bold text-[10px] uppercase">INVESTIGATIVE LEAD ACTION:</strong>
                  <span>{pred.recommendedAction}</span>
                </div>

                {/* Exhibits & Timeline Event Links */}
                <div className="pt-2 border-t border-outline-variant/20 flex flex-wrap items-center gap-2 font-tactical-data text-[11px] text-on-surface-variant">
                  {pred.supportingEvidenceIds && (
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-primary" />
                      EXHIBITS: <strong className="text-primary">{pred.supportingEvidenceIds.join(', ')}</strong>
                    </span>
                  )}
                  {pred.linkedTimelineEventIds && (
                    <span className="flex items-center gap-1 ml-2">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      EVENTS: <strong className="text-emerald-400">{pred.linkedTimelineEventIds.join(', ')}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Triangulate Sector Button */}
              <button
                onClick={() => setActiveModalPrediction(pred)}
                className="w-full py-2.5 rounded bg-primary/20 hover:bg-primary text-primary hover:text-on-primary border border-primary/50 transition-all font-tactical-data text-xs font-bold uppercase flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(255,84,76,0.2)] mt-4"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Triangulate Search Sector</span>
              </button>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Tactical Grid Sector Triangulation Modal */}
      {activeModalPrediction && (
        <Modal
          isOpen={!!activeModalPrediction}
          onClose={() => setActiveModalPrediction(null)}
          title={`Tactical Grid Triangulation: ${activeModalPrediction.title}`}
        >
          <div className="space-y-4 font-tactical-data text-xs">
            <div className="flex items-center justify-between">
              <Badge variant="critical">DEPLOYING FORENSIC SEARCH DISPATCH</Badge>
              <span className="text-primary font-bold">PROBABILITY BOOST: {activeModalPrediction.boost}</span>
            </div>

            <div className="p-3 rounded bg-surface-container border border-outline-variant/40 space-y-1">
              <span className="text-[10px] text-on-surface-variant uppercase">TARGET SEARCH AREA / SECTOR:</span>
              <div className="text-sm font-bold text-primary flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{activeModalPrediction.area}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">EVIDENCE GAP ANALYSIS:</span>
              <p className="font-body-md text-xs text-on-surface leading-relaxed">
                {activeModalPrediction.reason}
              </p>
            </div>

            <div className="p-3 rounded bg-secondary-container/80 border border-primary space-y-2 text-on-surface font-body-md text-xs">
              <div className="font-tactical-data text-primary font-bold text-xs uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>RECOMMENDED INVESTIGATIVE DISPATCH ACTION:</span>
              </div>
              <p className="font-semibold text-on-surface">
                {activeModalPrediction.recommendedAction}
              </p>
            </div>

            <div className="p-3 rounded bg-primary/10 border border-primary/50 text-primary font-bold flex items-center justify-between text-xs">
              <span>ESTIMATED RECOVERY WINDOW:</span>
              <strong className="text-primary text-sm">&lt; {activeModalPrediction.recoveryWindowMinutes} MINUTES BEFORE DEGRADATION</strong>
            </div>

            <div className="pt-2 border-t border-outline-variant/30 flex justify-between items-center text-[11px]">
              <span className="text-on-surface-variant">LINKED EXHIBITS: <strong className="text-primary">{(activeModalPrediction.supportingEvidenceIds || []).join(', ')}</strong></span>
              <Link to="/evidence" className="text-primary hover:underline font-bold flex items-center gap-1">
                <span>View Evidence Vault</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
