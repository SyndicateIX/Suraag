import React, { useState } from 'react';
import { Network, ShieldAlert, CheckCircle2, Eye, Tag, ArrowRight } from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

export const EvidenceCorrelationGraph: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<{ id: string; label: string; type: string; details: string } | null>({
    id: 'KRELL',
    label: 'Viktor "Shadow" Krell (Suspect)',
    type: 'SUSPECT',
    details: 'Primary suspect. Risk score 96/100. Connected to satellite phone ping and spent 9mm casing.',
  });

  const nodes = [
    { id: 'KRELL', label: 'Viktor Krell', type: 'SUSPECT', x: 250, y: 150, color: '#ff544c' },
    { id: 'PHONE', label: 'Sat Phone Ping #442', type: 'DIGITAL', x: 130, y: 260, color: '#ffb4ac' },
    { id: 'WEAPON', label: 'Glock 19 Pistol (EV-1)', type: 'WEAPON', x: 380, y: 260, color: '#e53935' },
    { id: 'BLOOD', label: 'Spatter Type O+', type: 'BIOLOGY', x: 520, y: 160, color: '#93000a' },
    { id: 'VANCE', label: 'Dr. Julian Vance', type: 'WITNESS', x: 260, y: 380, color: '#ab8985' },
  ];

  const links = [
    { from: 'KRELL', to: 'PHONE', label: 'RF Beacon Intercept (12s before EMP)' },
    { from: 'KRELL', to: 'WEAPON', label: 'Ballistic Firing Pin Profile Match' },
    { from: 'WEAPON', to: 'BLOOD', label: '34.2° Downward Trajectory Vector' },
    { from: 'VANCE', to: 'KRELL', label: 'Compromised Airlock Keycard Override' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Network className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              FORCE-DIRECTED CORRELATION GRAPH ARCHITECTURE
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            Evidence Correlation Graph
          </h1>
        </div>

        <Badge variant="confidence">ALL NODES BAYESIAN LINKED</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-6 bg-surface-container-low border-primary/50 relative">
          <div className="h-[460px] w-full relative overflow-hidden flex items-center justify-center select-none">
            <svg className="w-full h-full absolute inset-0">
              {links.map((l, idx) => {
                const n1 = nodes.find((n) => n.id === l.from);
                const n2 = nodes.find((n) => n.id === l.to);
                if (!n1 || !n2) return null;
                return (
                  <g key={idx}>
                    <line x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} stroke="#ff544c" strokeWidth="2" strokeOpacity="0.5" strokeDasharray="4 4" />
                    <text x={(n1.x + n2.x) / 2} y={(n1.y + n2.y) / 2 - 8} fill="#ab8985" fontSize="10" textAnchor="middle" className="font-tactical-data">
                      {l.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode({ id: node.id, label: node.label, type: node.type, details: `Node: ${node.label} (${node.type}) fully correlated across sensor logs.` })}
                  style={{ left: `${node.x - 55}px`, top: `${node.y - 30}px` }}
                  className={`absolute w-32 p-2 rounded-lg border-2 text-center cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/20 shadow-[0_0_20px_rgba(255,84,76,0.6)] scale-110 z-20'
                      : 'border-outline-variant bg-surface-container hover:border-primary z-10'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full inline-block mb-1" style={{ backgroundColor: node.color }} />
                  <span className="font-display-lg font-bold text-xs text-on-surface block truncate">{node.label}</span>
                  <span className="text-[9px] font-tactical-data text-on-surface-variant block">{node.type}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-4 flex flex-col justify-between border-primary/40">
          {selectedNode ? (
            <div className="space-y-4">
              <Badge variant="critical">{selectedNode.type}</Badge>
              <h3 className="font-display-lg text-2xl font-bold uppercase text-on-surface">
                {selectedNode.label}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed font-body-md p-3 rounded bg-surface-container border border-outline-variant/40">
                {selectedNode.details}
              </p>
            </div>
          ) : (
            <div className="py-12 text-center text-xs font-tactical-data text-on-surface-variant">
              Click any node on the correlation canvas to inspect multi-sensor linkages.
            </div>
          )}

          <div className="pt-4 border-t border-outline-variant/30 text-xs font-tactical-data text-primary">
            <span>GRAPH INFERENCE: 100% CONNECTED</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
