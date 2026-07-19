import React from 'react';
import { Settings as SettingsIcon, ShieldAlert, Database, RefreshCw, Lock, Palette } from 'lucide-react';
import { useSuraagStore } from '../store/useSuraagStore';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

export const Settings: React.FC = () => {
  const { theme, toggleTheme, resetPlayback, clearChatHistory } = useSuraagStore();

  const handleClearCache = () => {
    localStorage.removeItem('suraag-ai-storage');
    window.location.reload();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <SettingsIcon className="w-4 h-4 text-primary" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              SYSTEM CONFIGURATION & AUDIT PREFERENCES
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            System Settings & Security Audit
          </h1>
        </div>

        <Badge variant="confidence">4096-BIT SOVEREIGN ENCRYPTION</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/30 font-tactical-data text-xs text-primary font-bold">
            <Palette className="w-4 h-4" />
            <span>INTERFACE AESTHETICS & LATTICE THEME</span>
          </div>
          <div className="flex items-center justify-between font-tactical-data text-xs">
            <div>
              <span className="text-on-surface font-bold block">Current UI Spectrum:</span>
              <span className="text-on-surface-variant text-[11px]">Dark Black (#050505) + Glowing Red (#ffb4ac)</span>
            </div>
            <Badge variant="critical">PREMIUM STITCH THEME LOCKED</Badge>
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/30 font-tactical-data text-xs text-primary font-bold">
            <Database className="w-4 h-4" />
            <span>CACHE & SIMULATION RESET</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleClearCache}
              className="px-4 py-2 rounded bg-secondary-container hover:bg-primary text-primary hover:text-on-primary border border-primary/50 transition-all font-tactical-data text-xs font-bold uppercase"
            >
              Reset Local Storage & Cache
            </button>
            <button
              onClick={resetPlayback}
              className="px-4 py-2 rounded bg-surface-container hover:bg-surface-variant text-on-surface-variant font-tactical-data text-xs uppercase transition-all"
            >
              Reset Ballistic Scrubber Time
            </button>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6 space-y-3 font-tactical-data text-xs text-on-surface-variant">
        <span className="text-primary font-bold uppercase block">SECURITY AUDIT PROTOCOL</span>
        <div>● All REST API transmissions authenticated via Sovereign JWT Bearer token format.</div>
        <div>● Computer vision bounding box manifests encrypted with SHA-256 integrity verification.</div>
        <div>● Gemini 3.1 Pro reasoning requests routed through zero-retention sovereign privacy enclaves.</div>
      </GlassCard>
    </div>
  );
};
