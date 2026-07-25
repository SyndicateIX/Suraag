import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let doomedTriangleDataset: any = null;
try {
  const dtPath = path.join(__dirname, '../data/doomed_triangle_dataset.json');
  if (fs.existsSync(dtPath)) {
    doomedTriangleDataset = JSON.parse(fs.readFileSync(dtPath, 'utf-8'));
  }
} catch (e) {
  console.warn('[ContextBuilder] Failed to read doomed_triangle_dataset.json', e);
}

/**
 * Builds rich, structured context string for the specified caseId from Prisma DB or local datasets.
 */
export async function buildCaseContext(caseId?: string, prismaClient?: any): Promise<string> {
  const targetId = (caseId || 'CASE-2026-DT01').trim().toUpperCase();
  let contextParts: string[] = [];

  if (doomedTriangleDataset) {
    const dtMeta = doomedTriangleDataset.case_metadata;
    contextParts.push(`=== CASE DOSSIER: ${dtMeta.case_id} (${dtMeta.case_title}) ===`);
    contextParts.push(`Investigators: ${dtMeta.lead_investigators.join(', ')} | Status: CHARGESHEET_FILED`);
    contextParts.push(`Summary: ${dtMeta.summary}`);

    contextParts.push(`\n--- SUSPECT INTELLIGENCE ---`);
    contextParts.push(`- Diya Gupta (SUS-01, Mastermind): Secret affair with Chetany Sharma. Planned 4 murder attempts for ₹45M insurance.`);
    contextParts.push(`- Chetany Sharma (SUS-02, Executioner): Purchased Thallium, knife resort attack, ₹6M hitman transfer, sniper shooter at Lohegaon Hill.`);

    contextParts.push(`\n--- CHRONOLOGICAL MILESTONES ---`);
    contextParts.push(`- [2026-04-12] Attempt 1 (Poisoning): Thallium added to Keshan's drink; Chetany bought Thallium from chemical dealer.`);
    contextParts.push(`- [2026-05-04] Attempt 2 (Resort Assault): Chetany knife attack on Keshan at Lonavala resort; staged as robbery.`);
    contextParts.push(`- [2026-06-02] Attempt 3 (Hit-and-Run): Hitman Vikram Rathod paid ₹6.0M by Chetany to ram Keshan's car.`);
    contextParts.push(`- [2026-06-21 17:15] Attempt 4 (Final Homicide): Chetany sniped Keshan at Lohegaon Hill with 7.62mm Remington rifle; victim fell 45m off cliff.`);

    contextParts.push(`\n--- FORENSIC EVIDENCE EXHIBITS ---`);
    contextParts.push(`- [EVID-016] Remington 700 Rifle: Suppressed 7.62mm rifle found on boulder ridge with Chetany's DNA & gunshot residue.`);
    contextParts.push(`- [EVID-017] Audi Q3 (MH-12-FR-0007): Diya's car GPS log placing her at Lohegaon Hill cliff at 17:08 PM.`);
    contextParts.push(`- [EVID-020] Cellebrite Dump: 482 encrypted voice notes between Diya & Chetany planning 4 attempts and selfie fall defense.`);

    contextParts.push(`\n--- WITNESS STATEMENTS & CONTRADICTION MATRIX ---`);
    contextParts.push(`- Diya Gupta Claim: Emergency 112 call claiming Keshan slipped while taking a selfie.`);
    contextParts.push(`- CONTRADICTION [C-01]: Refuted by Autopsy (Dr. Neha Patwardhan) confirming 7.62mm scapular bullet wound (34.2° downward entry) BEFORE 45m cliff fall.`);
    contextParts.push(`- Witness Nandini Iyer: Confirmed Diya requested non-traceable poison and complained about Keshan's ₹45M insurance policy.`);

    contextParts.push(`\n--- PHYSICS & BALLISTICS RECONSTRUCTION ---`);
    contextParts.push(`Shooter Height: 3.8m (Boulder Ridge) | Target Height: 2.0m | Distance: 120m`);
    contextParts.push(`Entry Angle: 34.2° downward | Exit Angle: 8.7° | Caliber: 7.62mm | Muzzle Vel: 380 m/s | Verdict: Premeditated Sniper Discharge.`);

    contextParts.push(`\n--- MISSING EVIDENCE PREDICTIONS ---`);
    contextParts.push(`- Missing Item: Damaged CCTV Buffer MicroSD (94% probability) | Recommended Sector: Sector B-4 Lohegaon ravine.`);
  }

  if (contextParts.length === 0) {
    contextParts.push(`Active Case: The Doomed Triangle (CASE-2026-DT01).`);
  }

  return contextParts.join('\n');
}
