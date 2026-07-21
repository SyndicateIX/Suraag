import React from 'react';
import { FileText, Printer, ShieldAlert, CheckCircle2, Crosshair, Users, Activity, Download } from 'lucide-react';
import { useSuraagStore } from '../store/useSuraagStore';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

export const InvestigationReport: React.FC = () => {
  const { selectedCaseId } = useSuraagStore();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              OFFICIAL GOVERNMENT & LAW ENFORCEMENT INVESTIGATION DOSSIER
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            Official Investigation Report ({selectedCaseId})
          </h1>
        </div>

        <button
          onClick={handlePrint}
          className="px-6 py-2.5 rounded bg-primary text-on-primary hover:bg-surface-tint font-tactical-data text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(255,84,76,0.4)] flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF Dossier</span>
        </button>
      </div>

      {/* Printable Dossier Sheet */}
      <div className="font-serif glass-panel p-8 md:p-12 rounded-lg border border-primary/60 space-y-8 bg-surface-container-lowest/90 text-on-surface print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        {/* Report Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-primary gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded bg-secondary-container border border-primary flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-primary" />
            </div>
            <div>
              <span className="text-2xl font-bold uppercase tracking-tighter text-on-surface print:text-black">
                SURAAG AI FORENSIC INTELLIGENCE DOSSIER
              </span>
              <span className="block text-xs text-on-surface-variant uppercase print:text-gray-600">
                SECURITY CLASSIFICATION: SOVEREIGN TOP SECRET // PALANTIR LATTICE PROTOCOL
              </span>
            </div>
          </div>

          <div className="text-right text-xs space-y-1">
            <div>CASE REF: <strong className="text-on-surface print:text-black">{selectedCaseId}</strong></div>
            <div>DATE: <strong>{new Date().toISOString().split('T')[0]}</strong></div>
            <div>STATUS: <Badge variant="critical" className="print:border-black print:text-black">CRITICAL BREACH</Badge></div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-wider text-on-surface print:text-black border-l-4 border-primary pl-3 print:border-black">
            1. Executive Tactical Summary
          </h2>
          <p className="text-sm text-on-surface-variant print:text-black leading-relaxed bg-surface-container print:bg-transparent p-4 print:p-0 rounded border border-outline-variant/40 print:border-none">
            On July 15, 2026 at 23:14:00 UTC, a coordinated cyber-physical infiltration occurred at Sector 4 High-Security Research Facility (Zurich), targeting classified biological quantum assets stored in Sub-Level 3 Vault. Through multi-sensor Bayesian fusion across 18 independent evidence items (`94.2% overall confidence`), Suraag AI confirms that the breach was executed via an insider-assisted ambush (Scenario A, `78.4% probability`) involving suspect Viktor "Shadow" Krell and compromised keycard credentials belonging to Dr. Julian Vance.
          </p>
        </div>

        {/* Section 2: Key Triangulation & Ballistic Findings */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-wider text-on-surface print:text-black border-l-4 border-primary pl-3 print:border-black">
            2. 3D Ballistic & Attacker Triangulation Findings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 print:p-0 rounded bg-surface-container print:bg-transparent border border-outline-variant print:border-none space-y-1">
              <span className="text-on-surface-variant print:text-gray-600 block">ATTACKER POSITION ORIGIN:</span>
              <span className="text-base font-bold text-on-surface print:text-black block">Walkway Sector [X: -2.4, Y: 1.7, Z: 3.1]</span>
              <span className="text-on-surface-variant/80 print:text-gray-600 text-[11px] block mt-1">Stature: 1.82m standing stance. Fired suppressed 9mm.</span>
            </div>
            <div className="p-4 print:p-0 rounded bg-surface-container print:bg-transparent border border-outline-variant print:border-none space-y-1">
              <span className="text-on-surface-variant print:text-gray-600 block">PRIMARY WALL IMPACT:</span>
              <span className="text-base font-bold text-on-surface print:text-black block">Entry Angle: 34.2° Downward</span>
              <span className="text-on-surface-variant/80 print:text-gray-600 text-[11px] block mt-1">Impact velocity: 340 m/s (485 Joules kinetic energy).</span>
            </div>
            <div className="p-4 print:p-0 rounded bg-surface-container print:bg-transparent border border-outline-variant print:border-none space-y-1">
              <span className="text-on-surface-variant print:text-gray-600 block">BLOOD SPATTER CORRELATION:</span>
              <span className="text-base font-bold text-emerald-400 print:text-black block">420 High-Velocity Droplets</span>
              <span className="text-on-surface-variant/80 print:text-gray-600 text-[11px] block mt-1">Elliptical ratio (1.42) matches exact victim location.</span>
            </div>
          </div>
        </div>

        {/* Section 3: Witness Contradictions Audit */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-wider text-on-surface print:text-black border-l-4 border-primary pl-3 print:border-black">
            3. Witness Statement vs. 3D Line-of-Sight Refutation
          </h2>
          <div className="p-4 print:p-0 rounded bg-secondary-container/60 print:bg-transparent border border-primary print:border-none space-y-2 text-xs">
            <div className="flex items-center justify-between text-sm text-on-surface print:text-black font-bold">
              <span>WITNESS: DR. JULIAN VANCE // CREDIBILITY DOWNGRADED TO 42.5%</span>
              <span>GEOMETRIC REFUTATION: 100% BLOCKED</span>
            </div>
            <p className="text-on-surface-variant print:text-black leading-relaxed">
              Dr. Vance stated he stood at the Wall B North Doorway watching two operatives open the vault. Our Three.js 3D raycasting audit proves structural Server Rack #4 occludes 100% of visual access from that coordinate. Furthermore, corridor thermal sensors record zero human heat signatures at Wall B during the 23:14 window.
            </p>
          </div>
        </div>

        {/* Section 4: Primary Suspect Identification */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-wider text-on-surface print:text-black border-l-4 border-primary pl-3 print:border-black">
            4. Suspect Risk Dossier & Evidence Linkages
          </h2>
          <div className="p-4 print:p-0 rounded bg-surface-container print:bg-transparent border border-outline-variant print:border-none flex flex-col sm:flex-row justify-between gap-4 text-xs">
            <div>
              <span className="text-on-surface print:text-black font-bold text-lg block">VIKTOR "SHADOW" KRELL (RISK: 96 / CRITICAL)</span>
              <span className="text-on-surface-variant print:text-gray-600 block mt-1">Probability of Involvement: <strong className="text-primary print:text-black">89.4%</strong></span>
              <span className="text-on-surface-variant/80 print:text-gray-600 block mt-1">Evidence Connection: Satellite phone pinged tower #442 within 180m exactly 12s before EMP blackout. Ballistics match prior Geneva 2024 operation.</span>
            </div>
            <div className="text-right sm:self-center shrink-0">
              <Badge variant="critical" className="print:border-black print:text-black">STATUS: ARREST WARRANT RECOMMENDED</Badge>
            </div>
          </div>
        </div>

        {/* Dossier Sign-Off Footer */}
        <div className="pt-8 border-t border-outline-variant/50 print:border-gray-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 text-xs text-on-surface-variant print:text-gray-600">
          <div>
            <span>GENERATED BY: <strong className="text-on-surface print:text-black">Suraag AI Explainable Reasoning Core v4.2</strong></span>
            <span className="block mt-0.5">SHA-256 DIGITAL SIGNATURE: `31b9da79e7ed15c849788d94e3e58b02bfcd9c6c036`</span>
          </div>
          <div className="border-t sm:border-t-0 sm:border-l border-outline-variant/40 print:border-gray-300 pt-4 sm:pt-0 sm:pl-6">
            <span>AUDIT LEAD: <strong className="print:text-black">Agent Sarah Jenkins</strong></span>
            <span className="block mt-0.5 text-success print:text-black font-bold">COURT & DOSSIER READY ✔</span>
          </div>
        </div>
      </div>
    </div>
  );
};
