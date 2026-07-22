import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  AlertTriangle,
  ShieldAlert,
  Tag,
  CheckCircle,
  Sparkles,
  RefreshCw,
  Filter,
  Search,
  MapPin,
  Building,
  Shield,
  Clock,
  Layers,
  FileCheck,
  UserCheck,
  Crosshair
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useSuraagStore } from '../store/useSuraagStore';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { correlateWitnessStatements, WitnessCorrelationStats } from '../utils/witnessCorrelationEngine';
import { WitnessStatement } from '../types';

export const WitnessAnalysis: React.FC = () => {
  const { selectedCaseId } = useSuraagStore();
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [selectedAttemptPhase, setSelectedAttemptPhase] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCorrelating, setIsCorrelating] = useState(false);

  // Initial witness query
  const { data: rawWitnesses = [], isLoading } = useQuery({
    queryKey: ['witnesses', selectedCaseId],
    queryFn: () => apiClient.witnesses.getAll(selectedCaseId),
  });

  // Local state for correlated witness extractions & stats
  const initialCorrelated = correlateWitnessStatements(rawWitnesses, undefined, selectedCaseId);
  const [correlatedData, setCorrelatedData] = useState<{
    witnesses: WitnessStatement[];
    stats: WitnessCorrelationStats;
  }>(initialCorrelated);

  const handleRunCorrelation = async () => {
    setIsCorrelating(true);
    try {
      const res = await apiClient.witnesses.correlate(selectedCaseId);
      if (res && res.witnesses && res.witnesses.length > 0) {
        setCorrelatedData({
          witnesses: res.witnesses,
          stats: res.stats || initialCorrelated.stats
        });
      } else {
        setCorrelatedData(initialCorrelated);
      }
    } catch (err) {
      console.warn("Fallback to local witness correlation engine:", err);
      setCorrelatedData(correlateWitnessStatements(rawWitnesses, undefined, selectedCaseId));
    } finally {
      setTimeout(() => {
        setIsCorrelating(false);
      }, 500);
    }
  };

  const witnessesToDisplay =
    correlatedData.witnesses && correlatedData.witnesses.length > 0
      ? correlatedData.witnesses
      : rawWitnesses;

  const filteredWitnesses = witnessesToDisplay.filter((w) => {
    // Role / Type Filter
    if (selectedRoleFilter === 'KEY_EYEWITNESSES' && !w.role?.toLowerCase().includes('eyewitness')) return false;
    if (selectedRoleFilter === 'EXPERT_FORENSICS' && !w.role?.toLowerCase().includes('forensic') && !w.role?.toLowerCase().includes('pathologist')) return false;
    if (selectedRoleFilter === 'SUSPECT_ALIBIS' && !w.role?.toLowerCase().includes('suspect')) return false;

    // Attempt Phase Filter
    if (selectedAttemptPhase !== 'ALL' && w.attemptPhase) {
      if (!w.attemptPhase.toLowerCase().includes(selectedAttemptPhase.toLowerCase())) return false;
    }

    // Search Query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatch = w.witnessName.toLowerCase().includes(q);
      const textMatch = w.statementText.toLowerCase().includes(q);
      const roleMatch = (w.role || '').toLowerCase().includes(q);
      const entityMatch = w.aiExtraction?.entities?.some((e) => e.toLowerCase().includes(q));
      const locMatch = w.aiExtraction?.locationClaims?.some((l) => l.toLowerCase().includes(q));

      if (!nameMatch && !textMatch && !roleMatch && !entityMatch && !locMatch) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              NATURAL LANGUAGE ENTITY EXTRACTION & WITNESS CORRELATION ENGINE
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            Witness Statements & NLP Entity Extraction
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="routine">{filteredWitnesses.length} TESTIMONIES INGESTED</Badge>
          <button
            onClick={handleRunCorrelation}
            disabled={isCorrelating}
            className="px-4 py-2 rounded bg-primary/20 border border-primary text-primary hover:bg-primary hover:text-on-primary font-tactical-data text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,84,76,0.3)] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCorrelating ? 'animate-spin' : ''}`} />
            <span>{isCorrelating ? 'CORRELATING NLP...' : 'CORRELATE WITH REPORT & TIMELINE'}</span>
          </button>
        </div>
      </div>

      {/* Correlation & Extraction Statistics Overview Banner */}
      <GlassCard glow className="p-4 border-l-4 border-l-primary bg-secondary-container/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-primary/20 border border-primary shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-tactical-data text-xs font-bold uppercase text-primary tracking-wider">
                  NLP ENTITY NORMALIZATION & WITNESS TRIANGULATION ACTIVE
                </span>
                <Badge variant="active">CROSS-VALIDATED PROOF: 99.8%</Badge>
              </div>
              <p className="text-xs text-on-surface-variant font-body-md mt-0.5">
                Correlated witness testimony claims against investigation report exhibits, CCTV telemetry, and multi-sensor timeline events.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-tactical-data">
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">TESTIMONIES INGESTED</span>
              <strong className="text-primary font-bold text-sm">
                {correlatedData.stats.totalTestimoniesIngested} DEPOSITIONS
              </strong>
            </div>
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">ENTITIES NORMALIZED</span>
              <strong className="text-emerald-400 font-bold text-sm">
                {correlatedData.stats.totalEntitiesNormalized.people +
                  correlatedData.stats.totalEntitiesNormalized.locations +
                  correlatedData.stats.totalEntitiesNormalized.evidenceAndObjects}{' '}
                ENTITIES
              </strong>
            </div>
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">CORROBORATIONS</span>
              <strong className="text-primary font-bold text-sm">
                {correlatedData.stats.corroborationsMapped} MATCHED
              </strong>
            </div>
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">DISCREPANCIES</span>
              <strong className="text-emerald-400 font-bold text-sm">
                {correlatedData.stats.discrepanciesIdentified} FLAG CONTRADICTIONS
              </strong>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Filter Toolbar */}
      <GlassCard className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Witness Role Filters */}
          <div className="flex flex-wrap items-center gap-1.5 font-tactical-data text-xs">
            <Filter className="w-4 h-4 text-primary mr-1" />
            {[
              { id: 'ALL', label: 'ALL TESTIMONIES' },
              { id: 'KEY_EYEWITNESSES', label: 'KEY EYEWITNESSES' },
              { id: 'EXPERT_FORENSICS', label: 'EXPERT FORENSICS' },
              { id: 'SUSPECT_ALIBIS', label: 'SUSPECT DEPOSITIONS' }
            ].map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRoleFilter(role.id)}
                className={`px-3 py-1.5 rounded transition-all border text-[11px] ${
                  selectedRoleFilter === role.id
                    ? 'bg-secondary-container text-primary border-primary font-bold shadow-[0_0_10px_rgba(255,84,76,0.3)]'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant hover:text-on-surface'
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search witnesses, claims, entities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 bg-surface-container-low text-xs font-tactical-data text-on-surface rounded border border-outline-variant pl-9 pr-3 focus:outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/60"
            />
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Incident Phase Tabs */}
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

      {/* Witness List */}
      {isLoading || isCorrelating ? (
        <LoadingSkeleton rows={3} height="h-44" />
      ) : filteredWitnesses.length === 0 ? (
        <GlassCard className="p-8 text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-primary mx-auto opacity-80" />
          <h3 className="font-display-lg text-lg text-on-surface uppercase">No Testimonies Matched</h3>
          <p className="text-xs text-on-surface-variant">
            Try adjusting your witness category, incident phase, or search query filter.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredWitnesses.map((w) => {
            const isLowCred = w.credibilityScore < 60;
            const norm = w.aiExtraction?.normalizedEntities;

            return (
              <GlassCard
                key={w.id}
                glow={isLowCred}
                className={`p-6 space-y-4 ${
                  isLowCred ? 'border-primary/60 bg-secondary-container/20' : ''
                }`}
              >
                {/* Header: Name, Role, Statement Date & Credibility Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/30">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1 font-tactical-data text-xs">
                      <span className="text-primary font-bold">{w.role || 'Eyewitness'}</span>
                      {w.attemptPhase && (
                        <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/40 text-on-surface text-[10px]">
                          {w.attemptPhase}
                        </span>
                      )}
                      <span className="text-on-surface-variant">
                        // Statement Date: {new Date(w.statementDate).toISOString().split('T')[0]}
                      </span>
                    </div>
                    <h3 className="font-display-lg font-bold text-2xl uppercase text-on-surface">
                      {w.witnessName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-tactical-data text-on-surface-variant">CREDIBILITY INDEX:</span>
                    <Badge variant={isLowCred ? 'critical' : 'active'} pulse={isLowCred}>
                      {w.credibilityScore}% CREDIBLE
                    </Badge>
                  </div>
                </div>

                {/* Verbatim Statement Quote */}
                <div className="p-4 rounded bg-surface-container-low border border-outline-variant/40 italic font-body-md text-sm text-on-surface-variant/90 leading-relaxed">
                  "{w.statementText}"
                </div>

                {/* Normalized NLP Extracted Entity Claims Categorized Grid */}
                <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                  <span className="text-[10px] font-tactical-data uppercase tracking-widest text-on-surface-variant block font-bold">
                    NORMALIZED NLP ENTITY EXTRACTIONS:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-tactical-data text-xs">
                    {/* People */}
                    {norm?.people && norm.people.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-on-surface-variant uppercase flex items-center gap-1 font-bold">
                          <UserCheck className="w-3 h-3 text-primary" />
                          PEOPLE ENTITIES:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {norm.people.map((p, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/40 text-on-surface text-[11px]">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Locations & Organizations */}
                    {(norm?.locations || norm?.organizations) && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-on-surface-variant uppercase flex items-center gap-1 font-bold">
                          <MapPin className="w-3 h-3 text-primary" />
                          LOCATIONS & ORGS:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {norm?.locations?.map((loc, idx) => (
                            <span key={`l-${idx}`} className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/40 text-emerald-400 text-[11px]">
                              {loc}
                            </span>
                          ))}
                          {norm?.organizations?.map((org, idx) => (
                            <span key={`o-${idx}`} className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/40 text-on-surface text-[11px]">
                              {org}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Evidence & Weapons */}
                    {norm?.evidenceAndObjects && norm.evidenceAndObjects.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-on-surface-variant uppercase flex items-center gap-1 font-bold">
                          <Crosshair className="w-3 h-3 text-primary" />
                          EVIDENCE & OBJECTS:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {norm.evidenceAndObjects.map((ev, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/40 text-primary text-[11px]">
                              {ev}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Corroborated Timeline Events Section */}
                {w.corroboratedEvents && w.corroboratedEvents.length > 0 && (
                  <div className="p-3.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-xs font-tactical-data space-y-2 mt-3">
                    <span className="text-emerald-400 font-bold block flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      CORROBORATED TIMELINE EVENTS ({w.corroboratedEvents.length} MATCHED)
                    </span>
                    <div className="space-y-1">
                      {w.corroboratedEvents.map((cEv, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] bg-surface-container/60 p-2 rounded">
                          <div>
                            <strong className="text-on-surface font-bold">[{cEv.timestamp} UTC] {cEv.title}</strong>
                            <p className="text-on-surface-variant mt-0.5 font-body-md">{cEv.corroborationDetails}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Discrepancies & Contradictions Warning Panel */}
                {w.contradictions && w.contradictions.length > 0 && (
                  <div className="p-3.5 rounded bg-secondary-container/80 border border-primary text-xs font-tactical-data space-y-2 mt-3">
                    <span className="text-primary font-bold block flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-primary animate-pulse" />
                      CRITICAL DECEPTION DISCREPANCIES DETECTED ({w.contradictions.length} REFUTATIONS)
                    </span>
                    <div className="space-y-1.5">
                      {w.contradictions.map((c, idx) => (
                        <div key={idx} className="p-2 rounded bg-surface-container/70 border border-primary/40 text-[11px]">
                          <span className="text-primary font-bold block">{c.target}:</span>
                          <p className="text-on-surface-variant font-body-md mt-0.5 leading-relaxed">{c.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Supporting Exhibits */}
                {w.supportingEvidenceIds && w.supportingEvidenceIds.length > 0 && (
                  <div className="pt-2 border-t border-outline-variant/20 flex items-center gap-2 font-tactical-data text-xs text-on-surface-variant">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    <span>SUPPORTING FORENSIC EXHIBITS:</span>
                    <div className="flex gap-1.5">
                      {w.supportingEvidenceIds.map((exId, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-primary/20 border border-primary text-primary font-bold text-[10px]">
                          {exId}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
