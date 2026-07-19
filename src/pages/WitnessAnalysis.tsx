import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, AlertTriangle, ShieldAlert, Tag, CheckCircle } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useSuraagStore } from '../store/useSuraagStore';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const WitnessAnalysis: React.FC = () => {
  const { selectedCaseId } = useSuraagStore();

  const { data: witnesses = [], isLoading } = useQuery({
    queryKey: ['witnesses', selectedCaseId],
    queryFn: () => apiClient.witnesses.getAll(selectedCaseId),
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              NATURAL LANGUAGE ENTITY PARSING & CREDIBILITY SCORING
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            Witness Statements & NLP Entity Extraction
          </h1>
        </div>

        <Badge variant="routine">{witnesses.length} TESTIMONIES INGESTED</Badge>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={2} height="h-40" />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {witnesses.map((w) => {
            const isLowCred = w.credibilityScore < 60;
            return (
              <GlassCard key={w.id} glow={isLowCred} className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/30">
                  <div>
                    <div className="flex items-center gap-2 mb-1 font-tactical-data text-xs">
                      <span className="text-primary font-bold">{w.role || 'Eyewitness'}</span>
                      <span>// Statement Date: {new Date(w.statementDate).toISOString().split('T')[0]}</span>
                    </div>
                    <h3 className="font-display-lg font-bold text-2xl uppercase text-on-surface">
                      {w.witnessName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-tactical-data text-on-surface-variant">CREDIBILITY INDEX:</span>
                    <Badge variant={isLowCred ? 'critical' : 'active'} pulse={isLowCred}>
                      {w.credibilityScore}% CREDIBLE
                    </Badge>
                  </div>
                </div>

                <div className="p-4 rounded bg-surface-container-low border border-outline-variant/40 italic font-body-md text-sm text-on-surface-variant/90 leading-relaxed">
                  "{w.statementText}"
                </div>

                {/* NLP Extracted Entities */}
                {w.aiExtraction && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-tactical-data uppercase tracking-widest text-on-surface-variant block">
                      AI NLP EXTRACTED ENTITY CLAIMS:
                    </span>
                    <div className="flex flex-wrap gap-2 font-tactical-data text-xs">
                      {w.aiExtraction.entities?.map((ent, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded bg-surface-container border border-primary/40 text-primary font-bold flex items-center gap-1.5">
                          <Tag className="w-3 h-3" />
                          <span>{ent}</span>
                        </span>
                      ))}
                      {w.aiExtraction.locationClaims?.map((loc, idx) => (
                        <span key={`loc-${idx}`} className="px-2.5 py-1 rounded bg-secondary-container text-primary font-bold">
                          Claimed Loc: {loc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contradiction warning if any */}
                {w.contradictions && w.contradictions.length > 0 && (
                  <div className="p-3.5 rounded bg-secondary-container/80 border border-primary text-xs font-tactical-data space-y-1 mt-3">
                    <span className="text-primary font-bold block flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 animate-pulse" />
                      CRITICAL CONTRADICTION DETECTED BY 3D RAYCAST MATH
                    </span>
                    <p className="text-on-surface-variant font-body-md text-xs leading-relaxed">
                      {w.contradictions[0].reason}
                    </p>
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
