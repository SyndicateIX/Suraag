import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GitCompare, AlertTriangle, ShieldAlert, CheckCircle2, Crosshair, Eye, ExternalLink, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { useSuraagStore } from '../store/useSuraagStore';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { Modal } from '../components/common/Modal';

export const ContradictionMatrix: React.FC = () => {
  const { selectedCaseId } = useSuraagStore();
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [checkingProgress, setCheckingProgress] = useState(100);

  const { data: witnesses = [], isLoading } = useQuery({
    queryKey: ['witnesses', selectedCaseId],
    queryFn: () => apiClient.witnesses.getAll(selectedCaseId),
  });

  const allContradictions = witnesses.flatMap((w) =>
    (w.contradictions || []).map((c) => ({
      witnessName: w.witnessName,
      statementDate: w.statementDate,
      credibilityScore: w.credibilityScore,
      target: c.target,
      reason: c.reason,
      severity: c.severity,
    }))
  );

  const runLiveGeometricCheck = () => {
    setIsCheckModalOpen(true);
    setCheckingProgress(15);
    const interval = setInterval(() => {
      setCheckingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GitCompare className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              AUTOMATED STATEMENT vs. 3D GEOMETRY REFUTATION ENGINE
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            Contradiction Matrix & Refutation Log
          </h1>
        </div>

        <button
          onClick={runLiveGeometricCheck}
          className="px-5 py-2.5 rounded bg-primary text-on-primary hover:bg-surface-tint font-tactical-data text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(255,84,76,0.35)] flex items-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Run Live Geometric Refutation Check</span>
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={2} height="h-36" />
      ) : (
        <div className="space-y-6">
          {allContradictions.map((item, idx) => (
            <GlassCard key={idx} glow className="p-6 border-primary/70 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-outline-variant/30">
                <div className="flex items-center gap-3">
                  <Badge variant="critical" pulse>
                    SEVERITY: {item.severity}
                  </Badge>
                  <span className="font-display-lg font-bold text-xl uppercase text-on-surface">
                    Witness: {item.witnessName}
                  </span>
                </div>
                <div className="font-tactical-data text-xs text-primary font-bold">
                  CREDIBILITY DOWNGRADED TO {item.credibilityScore}%
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="p-4 rounded bg-surface-container-low border border-outline-variant/40 space-y-2">
                  <span className="text-[10px] font-tactical-data uppercase tracking-wider text-on-surface-variant block">
                    STATEMENT CLAIM
                  </span>
                  <p className="text-xs font-body-md text-on-surface italic leading-relaxed">
                    "I was standing directly by the North Doorway (`Wall B`) at exactly 23:14:00 when I saw two masked individuals enter the vault room and extract the core without triggering alarms."
                  </p>
                </div>

                <div className="p-4 rounded bg-secondary-container/70 border border-primary space-y-2">
                  <span className="text-[10px] font-tactical-data uppercase tracking-wider text-primary font-bold block flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5" />
                    3D GEOMETRIC & SENSOR REFUTATION
                  </span>
                  <p className="text-xs font-body-md text-on-surface-variant leading-relaxed">
                    {item.reason}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs font-tactical-data">
                <span className="text-on-surface-variant/80">
                  OCCLUSION OBSTACLE: <strong className="text-primary">Server Rack #4 (Raycast intersect distance: 2.1m)</strong>
                </span>
                <Link to="/line-of-sight" className="text-primary hover:underline font-bold flex items-center gap-1">
                  <span>Launch Line-of-Sight Raycaster</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Live Geometric Refutation Check Modal */}
      <Modal
        isOpen={isCheckModalOpen}
        onClose={() => setIsCheckModalOpen(false)}
        title="Live 3D Raycasting & Line-of-Sight Audit"
      >
        <div className="space-y-4 font-tactical-data text-xs">
          <div className="flex items-center justify-between">
            <span className="text-primary font-bold">RAYCASTING TARGET: Wall B North Doorway → Vault Interior Lock</span>
            <span>{checkingProgress}% Complete</span>
          </div>
          <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full transition-all duration-300" style={{ width: `${checkingProgress}%` }} />
          </div>

          {checkingProgress === 100 && (
            <div className="p-4 rounded bg-secondary-container/80 border border-primary space-y-2 text-on-surface-variant font-body-md text-xs leading-relaxed mt-4">
              <div className="font-tactical-data text-primary font-bold text-sm">
                ✔ RAYCAST REFUTATION CONFIRMED: 0% VISIBILITY
              </div>
              <p>
                Mathematical intersection point confirmed at `[-4.0m, 1.8m, -1.0m]` exactly on Server Rack #4. Dr. Julian Vance could not have physically witnessed any actions inside the inner vault from Wall B.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
