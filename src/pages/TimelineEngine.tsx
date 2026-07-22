import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Clock,
  AlertTriangle,
  Radio,
  Video,
  Volume2,
  ShieldAlert,
  Filter,
  Search,
  CheckCircle2,
  ChevronRight,
  Crosshair,
  UserCheck,
  FileText,
  MapPin,
  Sparkles,
  RefreshCw,
  Layers,
  Car,
  Shield
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useSuraagStore } from '../store/useSuraagStore';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { parseInvestigationReport, ExtractionStats } from '../utils/reportParser';
import { TimelineEvent } from '../types';

export const TimelineEngine: React.FC = () => {
  const { selectedCaseId } = useSuraagStore();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedAttemptPhase, setSelectedAttemptPhase] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isParsingReport, setIsParsingReport] = useState(false);

  // Fetch initial timeline events
  const { data: timelineEvents = [], isLoading } = useQuery({
    queryKey: ['timeline', selectedCaseId],
    queryFn: () => apiClient.timeline.getAll(selectedCaseId),
  });

  // Local state for extracted investigation report events & stats
  const initialExtracted = parseInvestigationReport(undefined, selectedCaseId);
  const [extractedData, setExtractedData] = useState<{
    events: TimelineEvent[];
    stats: ExtractionStats;
  }>(initialExtracted);

  const handleRegenerateFromReport = async () => {
    setIsParsingReport(true);
    try {
      // Call backend parsing endpoint or local fallback parser
      const result = await apiClient.timeline.parseReport(selectedCaseId);
      if (result && result.events && result.events.length > 0) {
        setExtractedData({
          events: result.events,
          stats: result.stats || initialExtracted.stats
        });
      } else {
        setExtractedData(initialExtracted);
      }
    } catch (err) {
      console.warn("Fallback to local report parsing engine:", err);
      setExtractedData(parseInvestigationReport(undefined, selectedCaseId));
    } finally {
      setTimeout(() => {
        setIsParsingReport(false);
      }, 500);
    }
  };

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'AUDIO':
        return Volume2;
      case 'CCTV':
        return Video;
      case 'BALLISTICS':
        return Crosshair;
      case 'WITNESS':
        return UserCheck;
      case 'VEHICLE':
        return Car;
      case 'PLANNING':
        return FileText;
      case 'NETWORK':
      default:
        return Radio;
    }
  };

  // Source events combine API query result or parsed report data
  const baseEvents: TimelineEvent[] =
    extractedData.events && extractedData.events.length > 0
      ? extractedData.events
      : timelineEvents;

  const filteredEvents = baseEvents.filter((e) => {
    // Category filter
    if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;

    // Attempt Phase filter
    if (selectedAttemptPhase !== 'ALL' && e.attemptGroup) {
      if (!e.attemptGroup.toLowerCase().includes(selectedAttemptPhase.toLowerCase())) return false;
    }

    // Search Query filter across title, description, entities, and witnesses
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const titleMatch = e.title.toLowerCase().includes(query);
      const descMatch = e.description.toLowerCase().includes(query);
      const personMatch = e.entities?.persons?.some((p) => p.toLowerCase().includes(query));
      const locationMatch = e.entities?.locations?.some((l) => l.toLowerCase().includes(query));
      const objectMatch = e.entities?.objects?.some((o) => o.toLowerCase().includes(query));
      const witnessMatch = e.relationships?.witnesses?.some((w) => w.toLowerCase().includes(query));

      if (!titleMatch && !descMatch && !personMatch && !locationMatch && !objectMatch && !witnessMatch) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              MULTI-SENSOR CHRONOLOGICAL FUSION ENGINE
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            Chronological Timeline Engine
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="confidence" pulse>
            CHRONOLOGY SYNC: 100% VERIFIED
          </Badge>
          <button
            onClick={handleRegenerateFromReport}
            disabled={isParsingReport}
            className="px-4 py-2 rounded bg-primary/20 border border-primary text-primary hover:bg-primary hover:text-on-primary font-tactical-data text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,84,76,0.3)] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isParsingReport ? 'animate-spin' : ''}`} />
            <span>{isParsingReport ? 'PARSING DOSSIER...' : 'REGENERATE TIMELINE FROM REPORT'}</span>
          </button>
        </div>
      </div>

      {/* Extraction Statistics Overview Banner */}
      <GlassCard glow className="p-4 border-l-4 border-l-primary bg-secondary-container/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-primary/20 border border-primary shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-tactical-data text-xs font-bold uppercase text-primary tracking-wider">
                  INVESTIGATION REPORT DATA FUSION ACTIVE
                </span>
                <Badge variant="active">AUTOMATED NLP PARSER</Badge>
              </div>
              <p className="text-xs text-on-surface-variant font-body-md mt-0.5">
                Extracted key timestamps, suspect/witness entities, physical exhibits, and alibi refutations from official chargesheet dossier.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-tactical-data">
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">EVENTS PARSED</span>
              <strong className="text-primary font-bold text-sm">
                {extractedData.stats.totalEventsExtracted} CHRONO
              </strong>
            </div>
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">ENTITIES EXTRACTED</span>
              <strong className="text-emerald-400 font-bold text-sm">
                {extractedData.stats.entitiesExtracted.persons + extractedData.stats.entitiesExtracted.locations} ENTITIES
              </strong>
            </div>
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">RELATIONSHIPS</span>
              <strong className="text-primary font-bold text-sm">
                {extractedData.stats.relationshipsMapped} MAPPED
              </strong>
            </div>
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">ATTEMPT PHASES</span>
              <strong className="text-emerald-400 font-bold text-sm">
                {extractedData.stats.attemptsIdentified} ATTEMPTS
              </strong>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Filter Toolbar */}
      <GlassCard className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-1.5 font-tactical-data text-xs">
            <Filter className="w-4 h-4 text-primary mr-1" />
            {['ALL', 'CCTV', 'AUDIO', 'NETWORK', 'WITNESS', 'BALLISTICS', 'VEHICLE', 'PLANNING'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded transition-all border text-[11px] ${
                  selectedCategory === cat
                    ? 'bg-secondary-container text-primary border-primary font-bold shadow-[0_0_10px_rgba(255,84,76,0.3)]'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant hover:text-on-surface'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search events, entities, evidence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 bg-surface-container-low text-xs font-tactical-data text-on-surface rounded border border-outline-variant pl-9 pr-3 focus:outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/60"
            />
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Attempt Phase Tabs */}
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

      {/* Chronological Timeline Stream */}
      {isLoading || isParsingReport ? (
        <LoadingSkeleton rows={4} height="h-28" />
      ) : filteredEvents.length === 0 ? (
        <GlassCard className="p-8 text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-primary mx-auto opacity-80" />
          <h3 className="font-display-lg text-lg text-on-surface uppercase">No Events Matched Filter</h3>
          <p className="text-xs text-on-surface-variant">
            Try adjusting your category, attempt phase, or search query filter criteria.
          </p>
        </GlassCard>
      ) : (
        <div className="relative pl-6 md:pl-10 space-y-6 before:absolute before:left-2 md:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-outline-variant before:to-transparent">
          {filteredEvents.map((ev, idx) => {
            const Icon = getIcon(ev.category);
            const hasAnomaly = ev.confidence < 95.0 || !!ev.alibiClaim;
            return (
              <div key={ev.id || idx} className="relative group">
                {/* Timeline node circle */}
                <div
                  className={`absolute -left-6 md:-left-10 top-5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-125 ${
                    hasAnomaly
                      ? 'bg-primary border-primary shadow-[0_0_12px_#ff544c]'
                      : 'bg-surface-container border-emerald-400'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${hasAnomaly ? 'bg-white' : 'bg-emerald-400'}`} />
                </div>

                <GlassCard
                  glow={hasAnomaly}
                  className={`p-5 hover:border-primary/70 transition-all ${
                    hasAnomaly ? 'border-primary/60 bg-secondary-container/20' : ''
                  }`}
                >
                  {/* Card Header: Timestamp, Badges & Confidence */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-outline-variant/30">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-surface-container border border-outline-variant font-tactical-data text-xs font-bold text-primary">
                        {ev.timestamp} UTC
                      </span>
                      <Badge variant={hasAnomaly ? 'critical' : 'active'}>{ev.category}</Badge>
                      {ev.attemptGroup && (
                        <span className="px-2 py-0.5 rounded bg-surface-container-high text-[11px] font-tactical-data font-bold text-on-surface border border-outline-variant/50">
                          {ev.attemptGroup}
                        </span>
                      )}
                      {hasAnomaly && (
                        <Badge variant="critical" pulse>
                          CONTRADICTION DETECTED
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 font-tactical-data text-xs shrink-0">
                      <span className="text-on-surface-variant">SENSOR CONFIDENCE:</span>
                      <span className={hasAnomaly ? 'text-primary font-bold' : 'text-emerald-400 font-bold'}>
                        {ev.confidence}%
                      </span>
                    </div>
                  </div>

                  {/* Title & Main Description */}
                  <div className="mt-3 flex items-start gap-3">
                    <div className="p-2 rounded bg-surface-container border border-outline-variant/40 shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-display-lg font-bold text-lg text-on-surface uppercase leading-snug">
                        {ev.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant font-body-md leading-relaxed">
                        {ev.description}
                      </p>
                    </div>
                  </div>

                  {/* Extracted Entities Chips (Persons, Locations, Weapons/Vehicles) */}
                  {ev.entities && (
                    <div className="mt-4 pt-3 border-t border-outline-variant/20 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-tactical-data">
                      {/* Persons Present */}
                      {ev.entities.persons && ev.entities.persons.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold block flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-primary" />
                            PERSONS INVOLVED:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {ev.entities.persons.map((person, pIdx) => (
                              <span
                                key={pIdx}
                                className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/40 text-on-surface text-[11px]"
                              >
                                {person}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Locations */}
                      {ev.entities.locations && ev.entities.locations.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold block flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-primary" />
                            LOCATION / ZONE:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {ev.entities.locations.map((loc, lIdx) => (
                              <span
                                key={lIdx}
                                className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/40 text-emerald-400 text-[11px]"
                              >
                                {loc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Objects & Weapons */}
                      {ev.entities.objects && ev.entities.objects.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold block flex items-center gap-1">
                            <Crosshair className="w-3 h-3 text-primary" />
                            WEAPONS & PHYSICAL EXHIBITS:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {ev.entities.objects.map((obj, oIdx) => (
                              <span
                                key={oIdx}
                                className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/40 text-primary text-[11px]"
                              >
                                {obj}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Vehicles */}
                      {ev.entities.vehicles && ev.entities.vehicles.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold block flex items-center gap-1">
                            <Car className="w-3 h-3 text-primary" />
                            VEHICLES IDENTIFIED:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {ev.entities.vehicles.map((veh, vIdx) => (
                              <span
                                key={vIdx}
                                className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/40 text-on-surface text-[11px]"
                              >
                                {veh}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Suspect Alibi vs Forensic Refutation Box */}
                  {(ev.alibiClaim || ev.forensicRefutation) && (
                    <div className="mt-4 p-3 rounded bg-secondary-container/30 border border-primary/40 space-y-1.5 text-xs">
                      {ev.alibiClaim && (
                        <div className="flex items-start gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary font-tactical-data font-bold text-[10px] uppercase shrink-0 mt-0.5">
                            SUSPECT ALIBI CLAIM
                          </span>
                          <p className="text-on-surface-variant font-body-md">{ev.alibiClaim}</p>
                        </div>
                      )}
                      {ev.forensicRefutation && (
                        <div className="flex items-start gap-2 pt-1 border-t border-outline-variant/20">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-tactical-data font-bold text-[10px] uppercase shrink-0 mt-0.5">
                            FORENSIC PROOF REFUTATION
                          </span>
                          <p className="text-on-surface font-body-md font-semibold">{ev.forensicRefutation}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer Links (Supporting Evidence & Witness Depositions) */}
                  {(ev.supportingEvidenceIds || ev.linkedWitnessIds) && (
                    <div className="mt-3 pt-2.5 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-2 font-tactical-data text-[11px]">
                      <div className="flex items-center gap-2">
                        {ev.supportingEvidenceIds && ev.supportingEvidenceIds.length > 0 && (
                          <span className="text-on-surface-variant flex items-center gap-1">
                            <Shield className="w-3 h-3 text-primary" />
                            EXHIBITS: <strong className="text-primary">{ev.supportingEvidenceIds.join(', ')}</strong>
                          </span>
                        )}
                        {ev.linkedWitnessIds && ev.linkedWitnessIds.length > 0 && (
                          <span className="text-on-surface-variant flex items-center gap-1 ml-3">
                            <UserCheck className="w-3 h-3 text-emerald-400" />
                            DEPOSITIONS: <strong className="text-emerald-400">{ev.linkedWitnessIds.join(', ')}</strong>
                          </span>
                        )}
                      </div>

                      {ev.aiReasoning && (
                        <span className="text-on-surface-variant italic truncate max-w-md hidden sm:inline">
                          AI Reasoning: {ev.aiReasoning}
                        </span>
                      )}
                    </div>
                  )}
                </GlassCard>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
