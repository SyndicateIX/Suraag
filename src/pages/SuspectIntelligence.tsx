import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserCheck, ShieldAlert, Phone, MapPin, AlertTriangle, ExternalLink } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useSuraagStore } from '../store/useSuraagStore';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const SuspectIntelligence: React.FC = () => {
  const { selectedCaseId } = useSuraagStore();

  const { data: suspects = [], isLoading } = useQuery({
    queryKey: ['suspects', selectedCaseId],
    queryFn: () => apiClient.suspects.getAll(selectedCaseId),
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-4 h-4 text-primary" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              SUSPECT RISK HIERARCHY & TELEMETRY CORRELATION
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            Suspect Intelligence Dossiers
          </h1>
        </div>

        <Badge variant="critical" pulse>PRIMARY SUSPECT IDENTIFIED</Badge>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={2} height="h-44" />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {suspects.map((s) => (
            <GlassCard key={s.id} glow className="p-6 border-primary/70 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/30">
                <div>
                  <div className="flex items-center gap-2 mb-1 font-tactical-data text-xs">
                    <Badge variant="critical">RISK SCORE: {s.riskScore}/100 CRITICAL</Badge>
                    <span className="text-primary font-bold">// ALIAS: {s.alias || 'V-KRELL'}</span>
                  </div>
                  <h3 className="font-display-lg font-bold text-3xl uppercase text-on-surface">
                    {s.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-tactical-data text-on-surface-variant">INVOLVEMENT PROBABILITY:</span>
                  <span className="font-display-lg text-3xl font-bold text-primary">{(s.probability * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="p-4 rounded bg-surface-container-low border border-outline-variant/40 space-y-3 font-tactical-data text-xs">
                  <span className="text-[10px] uppercase tracking-wider text-on-surface-variant block">
                    CRIMINAL HISTORY & KNOWN MODUS OPERANDI
                  </span>
                  <ul className="space-y-1.5 text-on-surface font-semibold list-disc pl-4">
                    {s.criminalHistory?.map((hist, idx) => (
                      <li key={idx}>{hist}</li>
                    ))}
                  </ul>
                  {s.phone && (
                    <div className="pt-2 border-t border-outline-variant/20 flex items-center gap-2 text-primary">
                      <Phone className="w-3.5 h-3.5" />
                      <span>Interrupted Phone Intercept: {s.phone}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded bg-secondary-container/60 border border-primary space-y-2 font-body-md text-xs">
                  <span className="text-[10px] font-tactical-data uppercase tracking-wider text-primary font-bold block flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                    AI REASONING & SENSOR CORRELATION
                  </span>
                  <p className="text-on-surface-variant leading-relaxed">
                    {s.aiReasoning || 'Satellite phone pinged within 180m of breach exactly 12 seconds prior to blackout. Ballistic profile matches prior modus operandi.'}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
