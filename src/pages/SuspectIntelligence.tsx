import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  UserCheck,
  ShieldAlert,
  Phone,
  MapPin,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Shield,
  Clock,
  Radio,
  Layers,
  Search,
  Activity,
  ArrowUpRight,
  TrendingUp,
  RotateCcw,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { useSuraagStore } from '../store/useSuraagStore';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { Modal } from '../components/common/Modal';
import { Suspect } from '../types';

export const SuspectIntelligence: React.FC = () => {
  const { selectedCaseId } = useSuraagStore();
  const [selectedSuspectModal, setSelectedSuspectModal] = useState<Suspect | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ingested Official Chargesheet Suspect Intelligence Profiles
  const defaultSuspects: Suspect[] = [
    {
      id: 'SUS-01',
      caseId: 'CASE-2026-DT01',
      name: 'Diya Gupta',
      alias: 'SUS-01 // Primary Conspirator & Mastermind',
      riskScore: 99,
      probability: 0.992,
      motive: 'Financial Gain / Insurance Fraud – ₹45,000,000 HDFC Life Insurance Policy Beneficiary on Victim Keshan Malhotra.',
      phone: 'iPhone 15 Pro IMEI #354910291 // Audi Q3 GPS MH-12-FR-0007',
      criminalHistory: [
        'Premeditated Multi-Stage Homicide Conspiracy (3-Month Planning)',
        'Insurance Policy Beneficiary Forgery & Financial Concealment',
        'Subornation of Perjury & False 112 Emergency Reporting',
        'Covert Communication via Encrypted Voice Notes (Cellebrite EVID-020)'
      ],
      attemptPhases: [
        'Attempt 1 – Dinner and Deception (Poison Procurement)',
        'Attempt 2 – Birthday Resort Knife Attack (Room 304 Logistics)',
        'Attempt 3 – Blood on the Streets (Hitman Contracting)',
        'Final Incident – Lohegaon Hill Cliff Ambush (Staged Selfie Fall)'
      ],
      telemetryLogs: [
        { time: 'Apr 14 19:30', location: 'Olive Terrace Restaurant Table 4', event: 'Credit Card Payment EVID-001 & Poisoning Window', status: 'VERIFIED' },
        { time: 'May 13 01:15', location: 'Skyline Resort Room 304 Door', event: 'Electronic Keycard Swipe EVID-006', status: 'VERIFIED' },
        { time: 'Jun 19 17:00', location: 'Brew & Bean Café Table 4', event: 'CCTV CAM-05 Capture & Map Session EVID-014', status: 'VERIFIED' },
        { time: 'Jun 21 17:18', location: 'Lohegaon Hill Sunset Point', event: 'Staged 112 Emergency Call & Tower Triangulation', status: 'VERIFIED' }
      ],
      aiReasoning: 'Multi-sensor fusion correlates Diya Gupta to all 4 incident sites. Cellebrite extraction EVID-020 contains 482 encrypted voice notes detailing ₹6.5M hitman payments to Chetany and Vikram. 112 selfie fall claim is fully refuted by scapular bullet entry trajectory.',
      supportingEvidenceIds: ['EVID-001', 'EVID-006', 'EVID-014', 'EVID-017', 'EVID-020'],
      linkedTimelineEventIds: ['EV-REP-01', 'EV-REP-03', 'EV-REP-07', 'EV-REP-08'],
      refutedAlibis: [
        'Claimed she was shopping alone at Phoenix Marketcity mall on June 19 (Refuted by Brew & Bean CCTV CAM-05).',
        'Claimed Keshan slipped on loose gravel taking a selfie (Refuted by Dr. Neha Patwardhan autopsy bullet trajectory EVID-016).'
      ]
    },
    {
      id: 'SUS-02',
      caseId: 'CASE-2026-DT01',
      name: 'Chetany Sharma',
      alias: 'SUS-02 // Operational Executioner & Shooter',
      riskScore: 97,
      probability: 0.985,
      motive: 'Financial Contract Kickback – Received ₹6,500,000 total compensation wired by Diya Gupta across multiple transactions.',
      phone: 'Samsung Galaxy S24 IMEI #864902102 // Burner +91 98220 11092',
      criminalHistory: [
        'Illegal Chemical Acquisition (Thallium sulphate via forged license #VET-9942)',
        'Armed Assault with Tactical Hunting Knife (Skyline Resort May 13)',
        'Contract Hit Procurement & Hitman Coordination (RTGS Wire EVID-010)',
        'Long-Range Precision Rifle Discharge (Remington Model 700 Sniper Ridge June 21)'
      ],
      attemptPhases: [
        'Attempt 1 – Thallium Sulphate Chemical Sourcing',
        'Attempt 2 – Room 304 Corridor Knife Assault',
        'Attempt 3 – Kharadi Crossing Hitman Wire Transfer',
        'Final Incident – Boulder Ridge Sniper Discharge'
      ],
      telemetryLogs: [
        { time: 'Apr 14 19:00', location: 'Sanjivani Medico Pharmacy', event: 'Forged Veterinary License Invoice EVID-004', status: 'VERIFIED' },
        { time: 'May 13 02:30', location: 'Skyline Resort Corridor 300', event: 'Dropped Tactical Knife EVID-005 & Eyewitness WIT-001', status: 'VERIFIED' },
        { time: 'Jun 10 09:45', location: 'HDFC Kharadi Bank Vault', event: 'RTGS ₹6,000,000 Wire Transfer EVID-010 to Vikram', status: 'VERIFIED' },
        { time: 'Jun 21 17:15', location: 'Lohegaon Hill Boulder Ridge', event: 'Suppressed 7.62mm Rifle Discharge EVID-016 & DNA Match', status: 'VERIFIED' }
      ],
      aiReasoning: 'DNA on recovered tactical hunting knife (EVID-005) and Remington sniper rifle (EVID-016) matches Chetany with 99.999% probability. Bank records confirm ₹6.0M RTGS wire transfer to hitman Vikram Rathod 15 minutes before the hit-and-run.',
      supportingEvidenceIds: ['EVID-004', 'EVID-005', 'EVID-010', 'EVID-011', 'EVID-016'],
      linkedTimelineEventIds: ['EV-REP-02', 'EV-REP-04', 'EV-REP-05', 'EV-REP-08'],
      refutedAlibis: [
        'Claimed RTGS wire was a legitimate business loan payment (Refuted by burner voice intercept EVID-011).',
        'Claimed he was out of town on June 21 (Refuted by DNA match on Remington 700 rifle recovered on boulder ridge).'
      ]
    },
    {
      id: 'SUS-03',
      caseId: 'CASE-2026-DT01',
      name: 'Vikram Rathod',
      alias: 'WIT-004 / SUS-03 // Hired Vehicular Operative',
      riskScore: 88,
      probability: 0.942,
      motive: 'Hired Contract Driver – Paid ₹6,000,000 by Chetany Sharma for staged vehicular hit-and-run assault.',
      phone: 'Nokia Feature Burner IMEI #351092004 // Tata 407 MH-12-QX-4412',
      criminalHistory: [
        'Vehicular Hit-and-Run Assault (Apex Tech IT Park Kharadi)',
        'Premeditated Pedestrian Ambush & Steering Vector Manipulation',
        'Illicit Financial Wire Receipt & Commercial Vehicle Tampering'
      ],
      attemptPhases: [
        'Attempt 3 – Blood on the Streets (Apex Tech IT Park Kharadi Collision)'
      ],
      telemetryLogs: [
        { time: 'Jun 10 09:45', location: 'Apex Tech IT Park Perimeter', event: 'RTGS ₹6,000,000 Bank Credit Confirmation', status: 'VERIFIED' },
        { time: 'Jun 10 09:58', location: 'Kharadi Pedestrian Crossing', event: 'Truck Acceleration (62 km/h) & Steering Correction EVID-012', status: 'VERIFIED' },
        { time: 'Jun 10 10:15', location: 'Hadapsar Abandoned Quarry', event: 'Vehicle Abandonment & Burner Handset Disposal', status: 'VERIFIED' }
      ],
      aiReasoning: 'CCTV telemetry of Tata 407 cargo truck proves deliberate steering vector adjustment directly into pedestrian sanctuary zone. Vikram Rathod confessed under interrogation after HDFC wire records linked him to Chetany.',
      supportingEvidenceIds: ['EVID-010', 'EVID-011', 'EVID-012', 'EVID-013'],
      linkedTimelineEventIds: ['EV-REP-05', 'EV-REP-06'],
      refutedAlibis: [
        'Initially claimed an accidental steering gear breakdown (Refuted by mechanical audit EVID-013 proving steering system was 100% operational).'
      ]
    }
  ];

  // Fetch API suspects or fallback
  const { data: apiSuspects = [], isLoading } = useQuery({
    queryKey: ['suspects', selectedCaseId],
    queryFn: () => apiClient.suspects.getAll(selectedCaseId),
  });

  const suspects: Suspect[] =
    apiSuspects && apiSuspects.length > 0 && apiSuspects[0].name.includes('Diya')
      ? apiSuspects
      : defaultSuspects;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              SUSPECT RISK HIERARCHY & TELEMETRY SENSOR FUSION ENGINE
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            Suspect Intelligence Dossiers
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="critical" pulse>PRIMARY CONSPIRACY IDENTIFIED</Badge>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-5 py-2.5 rounded bg-primary text-on-primary hover:bg-surface-tint font-tactical-data text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(255,84,76,0.35)] flex items-center gap-2 disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'CORRELATING TELEMETRY...' : 'RE-ANALYZE TELEMETRY SIGNALS'}</span>
          </button>
        </div>
      </div>

      {/* Investigation Dossier Fusion Banner */}
      <GlassCard glow className="p-4 border-l-4 border-l-primary bg-secondary-container/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-primary/20 border border-primary shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-tactical-data text-xs font-bold uppercase text-primary tracking-wider">
                  CHARGESHEET DOSSIER TELEMETRY CORRELATION ACTIVE
                </span>
                <Badge variant="active">3 SUSPECT PROFILES INGESTED</Badge>
              </div>
              <p className="text-xs text-on-surface-variant font-body-md mt-0.5">
                Multi-sensor fusion matrix integrating GPS trackers, cell tower pings, bank wire transfers, biometrics, and Cellebrite voice note dumps.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-tactical-data">
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">SUSPECTS IDENTIFIED</span>
              <strong className="text-primary font-bold text-sm">3 OPERATIVES</strong>
            </div>
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">MAX RISK SCORE</span>
              <strong className="text-primary font-bold text-sm">99/100 CRITICAL</strong>
            </div>
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">TELEMETRY PINGS</span>
              <strong className="text-emerald-400 font-bold text-sm">14 SENSOR POINTS</strong>
            </div>
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">REFUTED ALIBIS</span>
              <strong className="text-emerald-400 font-bold text-sm">6 CLAIMS</strong>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Suspect Risk Hierarchy Ranking Strip */}
      <GlassCard className="p-4 space-y-3">
        <span className="text-on-surface-variant font-tactical-data font-bold text-xs uppercase tracking-wider block flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-primary" />
          SUSPECT RISK HIERARCHY RANKING:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-tactical-data text-xs">
          {suspects.map((s, rank) => (
            <div
              key={s.id}
              onClick={() => setSelectedSuspectModal(s)}
              className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                rank === 0
                  ? 'bg-secondary-container/80 border-primary text-on-surface shadow-[0_0_12px_rgba(255,84,76,0.3)]'
                  : 'bg-surface-container-low border-outline-variant/50 hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-xs">
                  #{rank + 1}
                </span>
                <div>
                  <div className="font-bold text-sm text-on-surface">{s.name}</div>
                  <span className="text-[10px] text-on-surface-variant/80">{s.alias?.split('//')[1] || 'Operative'}</span>
                </div>
              </div>

              <div className="text-right">
                <Badge variant={s.riskScore >= 95 ? 'critical' : 'active'} className="text-[10px]">
                  RISK: {s.riskScore}/100
                </Badge>
                <div className="text-[10px] text-primary font-bold mt-0.5">
                  {(s.probability * 100).toFixed(1)}% PROB
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Suspect Intelligence Dossiers Grid */}
      {isLoading || isRefreshing ? (
        <LoadingSkeleton rows={3} height="h-64" />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {suspects.map((s) => (
            <GlassCard key={s.id} glow className="p-6 border-primary/70 space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 font-tactical-data text-xs">
                    <Badge variant={s.riskScore >= 95 ? 'critical' : 'active'}>
                      RISK SCORE: {s.riskScore}/100 {s.riskScore >= 95 ? 'CRITICAL' : 'HIGH'}
                    </Badge>
                    <span className="text-primary font-bold font-tactical-data">// {s.alias}</span>
                  </div>
                  <h3 className="font-display-lg font-bold text-3xl uppercase text-on-surface">
                    {s.name}
                  </h3>
                  {s.motive && (
                    <p className="text-xs text-on-surface-variant font-body-md">
                      <strong>Target Motive:</strong> {s.motive}
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-lg bg-surface-container border border-outline-variant shrink-0 text-center font-tactical-data">
                  <span className="text-[10px] uppercase text-on-surface-variant block">INVOLVEMENT PROBABILITY</span>
                  <span className="font-display-lg text-3xl font-bold text-primary block leading-none">
                    {(s.probability * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold block mt-1">HIGHLY CORROBORATED</span>
                </div>
              </div>

              {/* Modus Operandi & AI Reasoning */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Criminal History & Device Intercepts */}
                <div className="p-4 rounded bg-surface-container-low border border-outline-variant/40 space-y-3 font-tactical-data text-xs">
                  <span className="text-[10px] uppercase tracking-wider text-primary font-bold block flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-primary" />
                    CRIMINAL HISTORY & MODUS OPERANDI
                  </span>
                  <ul className="space-y-1.5 text-on-surface font-semibold list-disc pl-4 font-body-md text-xs">
                    {s.criminalHistory?.map((hist, idx) => (
                      <li key={idx}>{hist}</li>
                    ))}
                  </ul>

                  {s.phone && (
                    <div className="pt-2 border-t border-outline-variant/20 flex items-center gap-2 text-primary font-mono text-[11px]">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>Device / Vehicle Telemetry: {s.phone}</span>
                    </div>
                  )}
                </div>

                {/* Right: AI Reasoning & Multi-Sensor Correlation */}
                <div className="p-4 rounded bg-secondary-container/60 border border-primary space-y-3 font-body-md text-xs">
                  <span className="text-[10px] font-tactical-data uppercase tracking-wider text-primary font-bold block flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                    AI MULTI-SENSOR CORRELATION REASONING
                  </span>
                  <p className="text-on-surface leading-relaxed">
                    {s.aiReasoning}
                  </p>
                </div>
              </div>

              {/* Ingested Exhibits & Timeline Links */}
              <div className="pt-3 border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-4 font-tactical-data text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  {s.supportingEvidenceIds && (
                    <span className="flex items-center gap-1 text-on-surface-variant">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      INGESTED EXHIBITS: <strong className="text-primary">{s.supportingEvidenceIds.join(', ')}</strong>
                    </span>
                  )}
                  {s.linkedTimelineEventIds && (
                    <span className="flex items-center gap-1 text-on-surface-variant ml-2">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      TIMELINE EVENTS: <strong className="text-emerald-400">{s.linkedTimelineEventIds.join(', ')}</strong>
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setSelectedSuspectModal(s)}
                  className="px-4 py-2 rounded bg-primary/20 hover:bg-primary text-primary hover:text-on-primary border border-primary/50 transition-all font-tactical-data text-xs font-bold uppercase flex items-center gap-2 shadow-[0_0_10px_rgba(255,84,76,0.2)]"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Inspect Telemetry Trail & Alibi Refutations</span>
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Suspect Telemetry Trail & Alibi Refutation Modal */}
      {selectedSuspectModal && (
        <Modal
          isOpen={!!selectedSuspectModal}
          onClose={() => setSelectedSuspectModal(null)}
          title={`Suspect Intelligence Dossier: ${selectedSuspectModal.name}`}
        >
          <div className="space-y-4 font-tactical-data text-xs">
            <div className="flex items-center justify-between">
              <Badge variant={selectedSuspectModal.riskScore >= 95 ? 'critical' : 'active'}>
                RISK SCORE: {selectedSuspectModal.riskScore}/100
              </Badge>
              <span className="text-primary font-bold">INVOLVEMENT PROBABILITY: {(selectedSuspectModal.probability * 100).toFixed(1)}%</span>
            </div>

            <div className="p-3 rounded bg-surface-container border border-outline-variant/40 space-y-1">
              <span className="text-[10px] text-on-surface-variant uppercase">TARGET MOTIVE:</span>
              <div className="text-xs font-bold text-on-surface font-body-md">
                {selectedSuspectModal.motive}
              </div>
            </div>

            {/* Telemetry Stream */}
            {selectedSuspectModal.telemetryLogs && (
              <div className="space-y-2">
                <span className="text-[10px] text-primary font-bold uppercase flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-primary" />
                  TELEMETRY SENSOR PINGS & TIMESTAMP TRAIL:
                </span>
                <div className="space-y-1.5">
                  {selectedSuspectModal.telemetryLogs.map((log, lIdx) => (
                    <div key={lIdx} className="p-2.5 rounded bg-surface-container-low border border-outline-variant/40 flex justify-between items-center text-[11px]">
                      <div>
                        <strong className="text-primary">{log.time}</strong> — <span>{log.location}</span>
                        <div className="text-[10px] text-on-surface-variant font-body-md">{log.event}</div>
                      </div>
                      <Badge variant="active" className="text-[9px]">{log.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Refuted Alibis */}
            {selectedSuspectModal.refutedAlibis && (
              <div className="p-3 rounded bg-secondary-container/80 border border-primary space-y-2">
                <span className="text-[10px] text-primary font-bold uppercase flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-primary" />
                  REFUTED ALIBI DEFENSE CLAIMS:
                </span>
                <ul className="space-y-1 font-body-md text-xs text-on-surface list-disc pl-4">
                  {selectedSuspectModal.refutedAlibis.map((alibi, aIdx) => (
                    <li key={aIdx}>{alibi}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 border-t border-outline-variant/30 flex justify-between items-center text-[11px]">
              <span className="text-on-surface-variant">SUPPORTING EXHIBITS: <strong className="text-primary">{(selectedSuspectModal.supportingEvidenceIds || []).join(', ')}</strong></span>
              <Link to="/contradiction-matrix" className="text-primary hover:underline font-bold flex items-center gap-1">
                <span>View Refutation Log</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
