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
            <div>DATE (IST): <strong>{new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()).replace(/\//g, '-')}</strong></div>
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

        {/* Section 5: Digital Forensics & Cyber Activity Log */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-wider text-on-surface print:text-black border-l-4 border-primary pl-3 print:border-black">
            5. Digital Forensics & Cyber Activity Log
          </h2>
          <div className="overflow-x-auto rounded border border-outline-variant/40 bg-surface-container print:bg-transparent print:border-none">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-container-high print:bg-gray-100 text-on-surface-variant print:text-gray-600 font-tactical-data">
                <tr>
                  <th className="p-3 border-b border-outline-variant/40 print:border-gray-300">TIMESTAMP (IST)</th>
                  <th className="p-3 border-b border-outline-variant/40 print:border-gray-300">NODE ID / IP ADDRESS</th>
                  <th className="p-3 border-b border-outline-variant/40 print:border-gray-300">ACTION DETECTED</th>
                  <th className="p-3 border-b border-outline-variant/40 print:border-gray-300">RISK LEVEL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 print:divide-gray-300 font-body-md text-on-surface print:text-black">
                <tr className="hover:bg-surface-container-high/50 transition-colors">
                  <td className="p-3 text-on-surface-variant">23:12:04.112</td>
                  <td className="p-3 font-tactical-data tracking-wider">192.168.104.22</td>
                  <td className="p-3">Firewall Bypassed (Zero-Day Exploit)</td>
                  <td className="p-3"><span className="text-primary font-bold">CRITICAL</span></td>
                </tr>
                <tr className="hover:bg-surface-container-high/50 transition-colors">
                  <td className="p-3 text-on-surface-variant">23:13:45.091</td>
                  <td className="p-3 font-tactical-data tracking-wider">10.0.4.15 (Vault Subnet)</td>
                  <td className="p-3">Biometric Override Initiated</td>
                  <td className="p-3"><span className="text-primary font-bold">CRITICAL</span></td>
                </tr>
                <tr className="hover:bg-surface-container-high/50 transition-colors">
                  <td className="p-3 text-on-surface-variant">23:14:00.000</td>
                  <td className="p-3 font-tactical-data tracking-wider">SEC-CAM-04</td>
                  <td className="p-3">Video Feed Interrupted (EMP Spike)</td>
                  <td className="p-3"><span className="text-orange-400 font-bold">HIGH</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 6: Evidence Chain of Custody */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-wider text-on-surface print:text-black border-l-4 border-primary pl-3 print:border-black">
            6. Evidence Chain of Custody
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-body-md">
            <div className="p-4 rounded bg-surface-container print:bg-transparent border border-outline-variant/40 print:border-gray-300">
              <span className="block text-primary font-bold mb-2">ITEM #44-A: 9mm Shell Casing</span>
              <ul className="space-y-1 text-on-surface-variant">
                <li><strong className="text-on-surface">Collected By:</strong> Agent R. Miller (Badge 4492)</li>
                <li><strong className="text-on-surface">Location:</strong> Walkway Sector [X: -2.4, Y: 1.7, Z: 3.1]</li>
                <li><strong className="text-on-surface">Time:</strong> 01:22:00 IST</li>
                <li><strong className="text-on-surface">Current Status:</strong> Lab Analysis Complete</li>
              </ul>
            </div>
            <div className="p-4 rounded bg-surface-container print:bg-transparent border border-outline-variant/40 print:border-gray-300">
              <span className="block text-primary font-bold mb-2">ITEM #44-B: Burned Keycard</span>
              <ul className="space-y-1 text-on-surface-variant">
                <li><strong className="text-on-surface">Collected By:</strong> CSI J. Doe (Badge 1102)</li>
                <li><strong className="text-on-surface">Location:</strong> Vault Entrance Console</li>
                <li><strong className="text-on-surface">Time:</strong> 01:45:30 IST</li>
                <li><strong className="text-on-surface">Current Status:</strong> DNA Swab Pending</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 7: Financial & Crypto-Forensic Trace */}
        <div className="space-y-3 print:break-before-page">
          <h2 className="text-xl font-bold uppercase tracking-wider text-on-surface print:text-black border-l-4 border-primary pl-3 print:border-black">
            7. Financial & Crypto-Forensic Trace
          </h2>
          <div className="p-4 rounded bg-surface-container print:bg-transparent border border-outline-variant/40 print:border-gray-300 text-xs text-on-surface-variant print:text-black space-y-4">
            <p className="leading-relaxed">
              Suraag AI integrated with global blockchain ledger endpoints to trace a series of obfuscated transactions linked to suspect Viktor Krell. We detected a pattern of micro-transactions via the Tornado Cash mixer prior to the breach.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-primary font-bold block">TXID: 0x9f4a...b21c</span>
                <div className="flex justify-between border-b border-outline-variant/20 pb-1"><span>Amount:</span> <span>42.5 ETH ($148,000)</span></div>
                <div className="flex justify-between border-b border-outline-variant/20 pb-1"><span>Origin:</span> <span>Unknown (Mixer)</span></div>
                <div className="flex justify-between border-b border-outline-variant/20 pb-1"><span>Destination:</span> <span>Cold Wallet (Alias: "V.K.")</span></div>
                <div className="flex justify-between pb-1"><span>Timestamp:</span> <span>July 12, 14:00 IST</span></div>
              </div>
              <div className="space-y-2">
                <span className="text-primary font-bold block">TXID: 0x1a8c...88ff</span>
                <div className="flex justify-between border-b border-outline-variant/20 pb-1"><span>Amount:</span> <span>15.0 XMR ($2,100)</span></div>
                <div className="flex justify-between border-b border-outline-variant/20 pb-1"><span>Origin:</span> <span>Darkweb Market Wallet</span></div>
                <div className="flex justify-between border-b border-outline-variant/20 pb-1"><span>Destination:</span> <span>Hardware Supplier</span></div>
                <div className="flex justify-between pb-1"><span>Timestamp:</span> <span>July 14, 09:30 IST</span></div>
              </div>
            </div>
            <p className="text-[10px] text-primary/80 mt-2">* Transaction graph shows a 99.2% probability that these funds were used to acquire the EMP device deployed at SEC-CAM-04.</p>
          </div>
        </div>

        {/* Section 8: Communications Intercept Log */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-wider text-on-surface print:text-black border-l-4 border-primary pl-3 print:border-black">
            8. Communications Intercept (Decrypted Signal Chat)
          </h2>
          <div className="rounded bg-surface-container-low print:bg-gray-50 border border-outline-variant/40 print:border-gray-300 p-4 text-xs font-mono space-y-3">
            <div className="text-on-surface-variant print:text-gray-500 mb-2 border-b border-outline-variant/20 pb-2">
              DECRYPTION KEY: RSA-4096 / BRUTE-FORCE CONFIDENCE: 100%<br/>
              PARTICIPANTS: V. Krell (Shadow), Unknown Operative (Ghost)
            </div>
            <div className="space-y-2 text-on-surface print:text-black">
              <div className="pl-4 border-l-2 border-emerald-500">
                <span className="text-emerald-500 font-bold">[15-JUL 21:00 IST] Ghost:</span> Is the package secured?
              </div>
              <div className="pl-4 border-l-2 border-primary text-right">
                <span className="text-primary font-bold">[15-JUL 21:05 IST] Shadow:</span> Negative. Waiting for Vance to clear the North Doorway.
              </div>
              <div className="pl-4 border-l-2 border-emerald-500">
                <span className="text-emerald-500 font-bold">[15-JUL 21:07 IST] Ghost:</span> Use the EMP if he stalls. We have a 4-minute window.
              </div>
              <div className="pl-4 border-l-2 border-primary text-right">
                <span className="text-primary font-bold">[15-JUL 21:10 IST] Shadow:</span> Acknowledged. Commencing blackout.
              </div>
            </div>
          </div>
        </div>

        {/* Section 9: Psychological & Behavioral Profiling */}
        <div className="space-y-3 print:break-before-page">
          <h2 className="text-xl font-bold uppercase tracking-wider text-on-surface print:text-black border-l-4 border-primary pl-3 print:border-black">
            9. Psychological & Behavioral Profiling (NLP Analysis)
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="col-span-2 p-4 rounded bg-surface-container print:bg-transparent border border-outline-variant/40 print:border-gray-300 text-xs text-on-surface-variant print:text-black">
              <p className="leading-relaxed">
                Utilizing Natural Language Processing (NLP) over 4,500 internal emails and corporate chat logs from Viktor Krell over the past 6 months, Suraag AI detects a sharp 300% increase in stress markers, anti-corporate sentiment, and financial desperation terminology.
                <br/><br/>
                Krell exhibits classic indicators of the <strong>"Insider Threat Disgruntlement Cycle"</strong>. Flight risk is currently calculated at <strong>98.5%</strong>, with travel queries pointing toward non-extradition jurisdictions identified in his browser cache.
              </p>
            </div>
            <div className="col-span-1 p-4 rounded bg-surface-container-high print:bg-gray-100 border border-outline-variant/40 print:border-gray-300 text-xs space-y-2">
              <span className="text-on-surface font-bold border-b border-outline-variant/40 pb-1 block">NLP Risk Vectors</span>
              <div className="flex justify-between items-center"><span className="text-on-surface-variant">Stress Level:</span> <Badge variant="critical">SEVERE</Badge></div>
              <div className="flex justify-between items-center"><span className="text-on-surface-variant">Deception Index:</span> <Badge variant="high">HIGH (82%)</Badge></div>
              <div className="flex justify-between items-center"><span className="text-on-surface-variant">Flight Risk:</span> <span className="text-primary font-bold">98.5%</span></div>
              <div className="flex justify-between items-center"><span className="text-on-surface-variant">Ideology:</span> <span className="text-on-surface">Mercenary</span></div>
            </div>
          </div>
        </div>

        {/* Section 10: Spectrometry & Micro-Analysis */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-wider text-on-surface print:text-black border-l-4 border-primary pl-3 print:border-black">
            10. Physical Evidence Spectrometry
          </h2>
          <div className="overflow-x-auto rounded border border-outline-variant/40 bg-surface-container print:bg-transparent print:border-none">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-container-high print:bg-gray-100 text-on-surface-variant print:text-gray-600 font-tactical-data">
                <tr>
                  <th className="p-3 border-b border-outline-variant/40 print:border-gray-300">EVIDENCE ITEM</th>
                  <th className="p-3 border-b border-outline-variant/40 print:border-gray-300">ANALYSIS TYPE</th>
                  <th className="p-3 border-b border-outline-variant/40 print:border-gray-300">FINDINGS</th>
                  <th className="p-3 border-b border-outline-variant/40 print:border-gray-300">MATCH PROBABILITY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 print:divide-gray-300 font-body-md text-on-surface print:text-black">
                <tr className="hover:bg-surface-container-high/50 transition-colors">
                  <td className="p-3 text-primary font-bold">ITEM #44-A (Shell)</td>
                  <td className="p-3">Mass Spectrometry</td>
                  <td className="p-3">Traces of RDX explosives and unique lead-antimony alloy.</td>
                  <td className="p-3">99.9% match to Black Market Batch #882</td>
                </tr>
                <tr className="hover:bg-surface-container-high/50 transition-colors">
                  <td className="p-3 text-primary font-bold">ITEM #44-B (Keycard)</td>
                  <td className="p-3">DNA PCR Amplification</td>
                  <td className="p-3">Epithelial cells found on card edge.</td>
                  <td className="p-3">99.999% match to Viktor Krell</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 11: Chronological Incident Timeline */}
        <div className="space-y-3 print:break-before-page">
          <h2 className="text-xl font-bold uppercase tracking-wider text-on-surface print:text-black border-l-4 border-primary pl-3 print:border-black">
            11. Chronological Incident Timeline
          </h2>
          <div className="relative border-l-2 border-primary ml-3 pl-6 space-y-6 text-xs print:text-black">
            <div className="relative">
              <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-background print:ring-white"></div>
              <span className="font-tactical-data text-primary font-bold">23:05:00 IST</span>
              <h3 className="font-bold text-on-surface text-sm mt-1">Suspect Enters Facility</h3>
              <p className="text-on-surface-variant mt-1">Viktor Krell badges into the main lobby. Facial recognition logs elevated heart rate.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-background print:ring-white"></div>
              <span className="font-tactical-data text-emerald-500 font-bold">23:10:45 IST</span>
              <h3 className="font-bold text-on-surface text-sm mt-1">Dr. Vance Approaches Vault</h3>
              <p className="text-on-surface-variant mt-1">Dr. Vance is recorded on SEC-CAM-03 moving towards the Sub-Level 3 Vault.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-orange-400 ring-4 ring-background print:ring-white"></div>
              <span className="font-tactical-data text-orange-400 font-bold">23:14:00 IST</span>
              <h3 className="font-bold text-on-surface text-sm mt-1">EMP Detonation & Blackout</h3>
              <p className="text-on-surface-variant mt-1">EMP device triggered. All cameras and thermal sensors go offline. Vault electronic lock is short-circuited.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-background print:ring-white"></div>
              <span className="font-tactical-data text-primary font-bold">23:16:12 IST</span>
              <h3 className="font-bold text-on-surface text-sm mt-1">Weapon Discharged</h3>
              <p className="text-on-surface-variant mt-1">Acoustic sensors in the stairwell detect a suppressed 9mm gunshot. Acoustic triangulation confirms origin at Walkway Sector.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-background print:ring-white animate-pulse"></div>
              <span className="font-tactical-data text-primary font-bold">23:22:00 IST</span>
              <h3 className="font-bold text-on-surface text-sm mt-1">Target Escapes</h3>
              <p className="text-on-surface-variant mt-1">Suspect vehicle leaves underground parking structure. License plate obscured by IR floodlights.</p>
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
