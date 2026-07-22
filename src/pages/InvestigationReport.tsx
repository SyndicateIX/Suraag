import React from 'react';
import { FileText, Printer, ShieldAlert, CheckCircle2, Crosshair, Users, Activity, ExternalLink, Calendar, MapPin, DollarSign, PhoneCall, AlertTriangle } from 'lucide-react';
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
              OFFICIAL LAW ENFORCEMENT & FORENSIC DOSSIER
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            Case Study Dossier: The Doomed Triangle ({selectedCaseId})
          </h1>
        </div>

        <button
          onClick={handlePrint}
          className="px-6 py-2.5 rounded bg-primary text-on-primary hover:bg-surface-tint font-tactical-data text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(255,84,76,0.4)] flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export Full PDF Dossier</span>
        </button>
      </div>

      {/* Printable Dossier Sheet */}
      <div className="font-serif glass-panel p-8 md:p-12 rounded-lg border border-primary/60 space-y-8 bg-surface-container-lowest/90 text-on-surface print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        
        {/* Report Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-primary gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded bg-secondary-container border border-primary flex items-center justify-center shrink-0">
              <ShieldAlert className="w-8 h-8 text-primary" />
            </div>
            <div>
              <span className="text-2xl font-bold uppercase tracking-tighter text-on-surface print:text-black block">
                THE DOOMED TRIANGLE – CASE DOSSIER
              </span>
              <span className="block text-xs text-on-surface-variant uppercase print:text-gray-600">
                STATE CRIME BRANCH & FORENSIC INTELLIGENCE UNIT, PUNE // CHARGESHEET FILED
              </span>
            </div>
          </div>

          <div className="text-right text-xs space-y-1">
            <div>CASE REF: <strong className="text-on-surface print:text-black">CASE-2026-DT01</strong></div>
            <div>STATUS: <Badge variant="critical" className="print:border-black print:text-black">SOLVED // TRIABLE AT SESSIONS COURT</Badge></div>
            <div>CONFIDENCE: <strong className="text-emerald-400 print:text-black">99.984% BAYESIAN PROOF</strong></div>
          </div>
        </div>

        {/* Section 1: Executive Case Summary */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-wider text-on-surface print:text-black border-l-4 border-primary pl-3 print:border-black">
            1. Executive Case Summary
          </h2>
          <div className="p-4 rounded bg-surface-container print:bg-transparent border border-outline-variant/40 print:border-none leading-relaxed text-sm text-on-surface-variant print:text-black space-y-3">
            <p>
              <strong>Diya Gupta</strong>, a young woman from a prestigious family, was in a secret romantic relationship with <strong>Chetany Sharma</strong>, a local shopkeeper operating Sharma Electronics in Viman Nagar, Pune. Due to strict family opposition and Diya's upcoming arranged marriage to <strong>Keshan Malhotra</strong> (a software executive), Diya and Chetany conspired to remove Keshan permanently rather than eloping.
            </p>
            <p>
              Over a two-month period between April and June 2026, the couple conspired and executed <strong>four distinct murder attempts</strong> against Keshan Malhotra. With each failed attempt, they escalated their methods—leaving behind an overwhelming trail of digital, financial, physical, and forensic evidence that ultimately exposed the joint conspiracy.
            </p>
          </div>
        </div>

        {/* Section 2: Detailed Breakdown of the Four Attempts */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-wider text-on-surface print:text-black border-l-4 border-primary pl-3 print:border-black">
            2. Reconstruction of the Four Murder Attempts
          </h2>

          {/* Attempt 1 */}
          <div className="p-5 rounded bg-surface-container-high/60 print:bg-gray-50 border border-outline-variant/50 print:border-gray-300 space-y-2 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/30 pb-2">
              <span className="text-sm font-bold text-primary print:text-black uppercase tracking-wider">
                Attempt 1 – Dinner and Deception (April 14, 2026)
              </span>
              <Badge variant="routine">TIMELINE: 7:00 PM – 9:00 PM</Badge>
            </div>
            <p className="text-on-surface-variant print:text-black leading-relaxed text-sm">
              Before their official engagement, Diya invited Keshan to dinner at <strong>9:00 PM</strong> at <i>The Olive Terrace Restaurant</i> in Kalyani Nagar. Earlier that evening at <strong>7:00 PM</strong>, Chetany had purchased concentrated Thallium poison from <i>Sanjivani Medico</i> using forged veterinary credentials. Diya intended to poison Keshan's drink/food during dinner, but she never found a secluded opportunity as restaurant staff and Keshan remained at the table continuously. The attempt failed, but left crucial digital evidence.
            </p>
            <div className="pt-2 text-on-surface print:text-black font-semibold flex flex-wrap gap-4">
              <span><strong>Key Evidences:</strong></span>
              <span className="text-primary print:text-black">• WhatsApp Restaurant Reservation (9:00 PM)</span>
              <span className="text-primary print:text-black">• Sanjivani Medico CCTV (7:00 PM)</span>
              <span className="text-primary print:text-black">• UPI Payment Receipt (₹1,450)</span>
            </div>
          </div>

          {/* Attempt 2 */}
          <div className="p-5 rounded bg-surface-container-high/60 print:bg-gray-50 border border-outline-variant/50 print:border-gray-300 space-y-2 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/30 pb-2">
              <span className="text-sm font-bold text-primary print:text-black uppercase tracking-wider">
                Attempt 2 – Birthday Resort Knife Attack (May 13, 2026)
              </span>
              <Badge variant="high">TIMELINE: 1:30 AM – 3:00 AM</Badge>
            </div>
            <p className="text-on-surface-variant print:text-black leading-relaxed text-sm">
              During Keshan's birthday celebration at <i>Skyline Valley Resort</i>, Diya waited for Keshan to become heavily intoxicated in Room 304. Diya then signaled Chetany, who snuck onto resort grounds armed with a tactical hunting knife. Chetany entered the room to attack Keshan, but Keshan stirred unexpectedly, forcing Chetany to flee in panic. As Chetany ran down the corridor, he dropped the knife and was spotted by resort guest Archita Deshmukh.
            </p>
            <div className="pt-2 text-on-surface print:text-black font-semibold flex flex-wrap gap-4">
              <span><strong>Key Evidences:</strong></span>
              <span className="text-primary print:text-black">• Recovered Tactical Knife (EVID-005)</span>
              <span className="text-primary print:text-black">• Deposition of Witness Archita Deshmukh</span>
              <span className="text-primary print:text-black">• Resort CCTV CAM-04</span>
              <span className="text-primary print:text-black">• 18 Pre-Incident CDR Calls</span>
            </div>
          </div>

          {/* Attempt 3 */}
          <div className="p-5 rounded bg-surface-container-high/60 print:bg-gray-50 border border-outline-variant/50 print:border-gray-300 space-y-2 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/30 pb-2">
              <span className="text-sm font-bold text-primary print:text-black uppercase tracking-wider">
                Attempt 3 – Blood on the Streets (June 10, 2026)
              </span>
              <Badge variant="critical">TIMELINE: 10:00 AM (HIRED CONTRACT HIT)</Badge>
            </div>
            <p className="text-on-surface-variant print:text-black leading-relaxed text-sm">
              Escalating their conspiracy, Diya and Chetany paid <strong>₹6,000,000 (6 Million INR)</strong> to hired contract criminals led by truck driver Vikram Rathod. At <strong>10:00 AM</strong>, as Keshan approached the pedestrian crossing outside his office at Apex Tech IT Park (Kharadi), a Tata 407 cargo truck (MH-12-QX-4412) accelerated directly into him. Keshan survived with critical poly-trauma injuries.
            </p>
            <div className="pt-2 text-on-surface print:text-black font-semibold flex flex-wrap gap-4">
              <span><strong>Key Evidences:</strong></span>
              <span className="text-primary print:text-black">• ₹6,000,000 Bank Wire Transfers (EVID-010)</span>
              <span className="text-primary print:text-black">• Burner Voice Recordings</span>
              <span className="text-primary print:text-black">• Kharadi Traffic CCTV Tracking</span>
            </div>
          </div>

          {/* Attempt 4 / Final Incident */}
          <div className="p-5 rounded bg-surface-container-high/60 print:bg-gray-50 border border-primary print:border-black space-y-2 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-primary pb-2">
              <span className="text-sm font-bold text-primary print:text-black uppercase tracking-wider">
                Final Incident – Lohegaon Hill Cliff Ambush (June 19–21, 2026)
              </span>
              <Badge variant="critical">FATAL HOMICIDE // SOLVED</Badge>
            </div>
            <p className="text-on-surface-variant print:text-black leading-relaxed text-sm">
              On <strong>June 19</strong>, Diya and Chetany met at <i>Brew & Bean Artisan Café</i> to finalize their cliff ambush plan (confirmed via CCTV and café order bills). On <strong>June 21</strong>, Chetany arrived early at <i>Lohegaon Hill</i>, concealing himself with a Remington Model 700 rifle on a boulder ridge. Diya brought Keshan to Sunset Point viewpoint under the pretext of taking photos. Chetany fired a suppressed 7.62mm gunshot striking Keshan, after which Keshan fell off the 45m cliff onto boulders. Chetany fled down a secluded ravine trail while Diya dialed 112 claiming an accidental selfie slip.
            </p>
            <div className="pt-2 text-on-surface print:text-black font-semibold flex flex-wrap gap-4">
              <span><strong>Key Evidences:</strong></span>
              <span className="text-primary print:text-black">• Remington Model 700 Rifle & 7.62mm Casing</span>
              <span className="text-primary print:text-black">• Café June 19 CCTV & Bill</span>
              <span className="text-primary print:text-black">• Autopsy Gunshot Trajectory</span>
              <span className="text-primary print:text-black">• 482 Deleted WhatsApp Voice Notes</span>
            </div>
          </div>
        </div>

        {/* Section 3: Evidence Inventory Vault */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-wider text-on-surface print:text-black border-l-4 border-primary pl-3 print:border-black">
            3. Physical, Financial, Digital & Ballistics Evidence Vault
          </h2>
          <div className="overflow-x-auto rounded border border-outline-variant/40 bg-surface-container print:bg-transparent print:border-none">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-container-high print:bg-gray-100 text-on-surface-variant print:text-gray-600 font-tactical-data">
                <tr>
                  <th className="p-3 border-b border-outline-variant/40 print:border-gray-300">EXHIBIT ID</th>
                  <th className="p-3 border-b border-outline-variant/40 print:border-gray-300">EVIDENCE TITLE</th>
                  <th className="p-3 border-b border-outline-variant/40 print:border-gray-300">ATTEMPT PHASING</th>
                  <th className="p-3 border-b border-outline-variant/40 print:border-gray-300">CATEGORY</th>
                  <th className="p-3 border-b border-outline-variant/40 print:border-gray-300">CONFIDENCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 print:divide-gray-300 font-body-md text-on-surface print:text-black">
                <tr>
                  <td className="p-3 font-bold text-primary">EVID-001</td>
                  <td className="p-3">Sanjivani Medico CCTV CAM-01 (7:00 PM Poison Purchase)</td>
                  <td className="p-3">Attempt 1 (April 14)</td>
                  <td className="p-3">CCTV Video</td>
                  <td className="p-3 font-bold text-emerald-400">98.5%</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-primary">EVID-002</td>
                  <td className="p-3">WhatsApp Olive Terrace Reservation Record (9:00 PM Dinner)</td>
                  <td className="p-3">Attempt 1 (April 14)</td>
                  <td className="p-3">Digital Document</td>
                  <td className="p-3 font-bold text-emerald-400">99.1%</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-primary">EVID-005</td>
                  <td className="p-3">Recovered Tactical Hunting Knife (Chetany's Latent Prints)</td>
                  <td className="p-3">Attempt 2 (May 13)</td>
                  <td className="p-3">Weapon Exhibit</td>
                  <td className="p-3 font-bold text-emerald-400">99.8%</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-primary">EVID-006</td>
                  <td className="p-3">Resort Room 304 Eyewitness Statement – Archita Deshmukh</td>
                  <td className="p-3">Attempt 2 (May 13)</td>
                  <td className="p-3">Witness Deposition</td>
                  <td className="p-3 font-bold text-emerald-400">96.5%</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-primary">EVID-010</td>
                  <td className="p-3">HDFC Bank Wire Transfer Audits (₹6,000,000 to Hitman Gang)</td>
                  <td className="p-3">Attempt 3 (June 10)</td>
                  <td className="p-3">Financial Ledger</td>
                  <td className="p-3 font-bold text-emerald-400">100.0%</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-primary">EVID-011</td>
                  <td className="p-3">Burner Phone Encrypted Voice Recordings (10:00 AM Hit Contract)</td>
                  <td className="p-3">Attempt 3 (June 10)</td>
                  <td className="p-3">Audio Intercept</td>
                  <td className="p-3 font-bold text-emerald-400">99.4%</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-primary">EVID-014</td>
                  <td className="p-3">Brew & Bean Café CCTV & Order Bill (June 19 Meeting)</td>
                  <td className="p-3">Final Incident (June 19)</td>
                  <td className="p-3">CCTV / Receipt</td>
                  <td className="p-3 font-bold text-emerald-400">99.0%</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-primary">EVID-016</td>
                  <td className="p-3">Remington Model 700 Sniper Rifle & 7.62mm Spent Casing</td>
                  <td className="p-3">Final Incident (June 21)</td>
                  <td className="p-3">Ballistics</td>
                  <td className="p-3 font-bold text-emerald-400">99.95%</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-primary">EVID-020</td>
                  <td className="p-3">Cellebrite Dump: 482 Deleted WhatsApp Voice Notes</td>
                  <td className="p-3">All Four Attempts</td>
                  <td className="p-3">Cloud Extraction</td>
                  <td className="p-3 font-bold text-emerald-400">100.0%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Key Witness Depositions */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-wider text-on-surface print:text-black border-l-4 border-primary pl-3 print:border-black">
            4. Key Witness Depositions & Expert Testimonies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded bg-surface-container print:bg-transparent border border-outline-variant/40 print:border-gray-300 space-y-2">
              <span className="text-primary font-bold block text-sm">ARCHITA DESHMUKH (WIT-001) – RESORT GUEST</span>
              <p className="text-on-surface-variant print:text-black leading-relaxed">
                "I was staying in Room 306 at Skyline Valley Resort on May 13. At ~2:30 AM, I saw a hooded man fleeing Room 304 in panic, dropping a tactical knife on the carpet. I identified him as Chetany Sharma."
              </p>
            </div>
            <div className="p-4 rounded bg-surface-container print:bg-transparent border border-outline-variant/40 print:border-gray-300 space-y-2">
              <span className="text-primary font-bold block text-sm">VIKRAM RATHOD (WIT-004) – HIRED HITMAN / DRIVER</span>
              <p className="text-on-surface-variant print:text-black leading-relaxed">
                "I was hired by Chetany Sharma to stage the hit-and-run outside Keshan's office at 10:00 AM on June 10 using a Tata 407 truck. He paid ₹6,000,000 across wire transfers."
              </p>
            </div>
            <div className="p-4 rounded bg-surface-container print:bg-transparent border border-outline-variant/40 print:border-gray-300 space-y-2">
              <span className="text-primary font-bold block text-sm">ROHAN MEHTA (WIT-005) – CAFÉ SUPERVISOR</span>
              <p className="text-on-surface-variant print:text-black leading-relaxed">
                "On June 19 at 5:00 PM, Diya and Chetany sat at Table 4 at Brew & Bean Café for over an hour examining maps. I served cold brew coffee and preserved the bill."
              </p>
            </div>
            <div className="p-4 rounded bg-surface-container print:bg-transparent border border-outline-variant/40 print:border-gray-300 space-y-2">
              <span className="text-primary font-bold block text-sm">DR. NEHA PATWARDHAN (WIT-008) – FORENSIC PATHOLOGIST</span>
              <p className="text-on-surface-variant print:text-black leading-relaxed">
                "Autopsy confirms a 7.62mm entry/exit gunshot trajectory through Keshan's right shoulder blade that occurred BEFORE his fall from the cliff, completely dismantling the selfie fall story."
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: Contradiction Refutation Matrix */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-wider text-on-surface print:text-black border-l-4 border-primary pl-3 print:border-black">
            5. Suspect Alibi Refutation Matrix
          </h2>
          <div className="p-4 rounded bg-secondary-container/40 print:bg-gray-100 border border-primary print:border-black text-xs space-y-3">
            <div className="flex justify-between items-center font-bold text-sm text-on-surface print:text-black">
              <span>SUSPECT ALIBI vs FORENSIC PROOF MATRIX</span>
              <span className="text-primary">DECEPTION PROBABILITY: 99.98%</span>
            </div>
            <div className="space-y-2">
              <div className="p-2.5 rounded bg-surface-container print:bg-white border border-outline-variant/30">
                <span className="font-bold text-primary">Claim:</span> Diya claimed Keshan had an accidental stomach bug at Olive Terrace dinner on April 14.<br/>
                <span className="font-bold text-emerald-400">Refutation:</span> Sanjivani Medico CCTV CAM-01 records Chetany buying poison at 7:00 PM; Diya booked 9:00 PM dinner.
              </div>
              <div className="p-2.5 rounded bg-surface-container print:bg-white border border-outline-variant/30">
                <span className="font-bold text-primary">Claim:</span> Diya & Chetany claimed no knife attack took place at Skyline Resort on May 13.<br/>
                <span className="font-bold text-emerald-400">Refutation:</span> Recovered knife (EVID-005) bears Chetany's prints; Witness Archita saw him flee; 18 pre-incident calls logged.
              </div>
              <div className="p-2.5 rounded bg-surface-container print:bg-white border border-outline-variant/30">
                <span className="font-bold text-primary">Claim:</span> June 10 office hit-and-run was an accidental traffic crash by an unknown truck.<br/>
                <span className="font-bold text-emerald-400">Refutation:</span> Bank records prove ₹6,000,000 wired by Chetany to driver Vikram Rathod; burner voice recordings recovered.
              </div>
              <div className="p-2.5 rounded bg-surface-container print:bg-white border border-outline-variant/30">
                <span className="font-bold text-primary">Claim:</span> June 21 Lohegaon Hill death was an accidental slip taking a selfie.<br/>
                <span className="font-bold text-emerald-400">Refutation:</span> June 19 café planning meeting (CCTV/bill); 7.62mm gunshot wound in back precedes cliff fall; rifle recovered.
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Statutory Charges & Sign-Off */}
        <div className="pt-6 border-t-2 border-primary flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 text-xs text-on-surface-variant print:text-black">
          <div>
            <span className="font-bold text-on-surface print:text-black block text-sm">STATUTES CHARGED UNDER BHARATIYA NYAYA SANHITA (BNS):</span>
            <span className="block mt-1">• Section 302 BNS (Premeditated Homicide - Life Imprisonment / Capital Punishment)</span>
            <span className="block">• Section 120-B BNS (Criminal Conspiracy Across 4 Incidents)</span>
            <span className="block">• Section 307 BNS (Attempt to Murder - 3 Counts)</span>
            <span className="block">• Section 201 BNS (Fabrication & Destruction of Evidence)</span>
          </div>
          <div className="border-l-2 border-primary pl-4 text-right shrink-0">
            <span className="font-bold block text-sm">CHARGESHEET FILED BY:</span>
            <span className="block text-primary font-bold">Sub-Inspector Santosh Jadhav</span>
            <span className="block text-emerald-400 font-bold">COURT READY & TRIAL PENDING ✔</span>
          </div>
        </div>

      </div>
    </div>
  );
};
