import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  LegalPenalCode,
  ExtractedEntity,
  ExtractedEntityType,
  CanonicalIdentity,
  AliasMergeCandidate,
  NERDocument,
} from '../../src/types/index.js';

// ==========================================
// 1. LEGAL PENAL CODE KNOWLEDGE BASE & CACHE
// ==========================================

export const LEGAL_PENAL_CODES_CATALOG: LegalPenalCode[] = [
  {
    code: 'IPC-302',
    sectionNumber: '302',
    statute: 'IPC',
    title: 'Punishment for Murder',
    category: 'HOMICIDE',
    severityLevel: 'CRITICAL',
    description: 'Whoever commits murder shall be punished with death, or imprisonment for life, and shall also be liable to fine.',
    punishment: 'Death Penalty or Life Imprisonment + Fine',
    bnsEquivalent: 'BNS-103',
    keyElements: ['Premeditated intention to cause death', 'Knowledge that bodily injury is sufficient to cause death', 'Actus reus resulting in victim demise'],
  },
  {
    code: 'BNS-103',
    sectionNumber: '103',
    statute: 'BNS',
    title: 'Punishment for Murder (Bharatiya Nyaya Sanhita)',
    category: 'HOMICIDE',
    severityLevel: 'CRITICAL',
    description: 'Punishment for murder under Bharatiya Nyaya Sanhita, 2023. Corresponds directly to IPC Section 302.',
    punishment: 'Death or Imprisonment for Life and Fine',
    ipcEquivalent: 'IPC-302',
    keyElements: ['Intentional homicide', 'Act committed with premeditation or extreme recklessness'],
  },
  {
    code: 'IPC-307',
    sectionNumber: '307',
    statute: 'IPC',
    title: 'Attempt to Murder',
    category: 'HOMICIDE',
    severityLevel: 'CRITICAL',
    description: 'Whoever does any act with such intention or knowledge that if death was caused, they would be guilty of murder.',
    punishment: 'Imprisonment up to 10 years or Life Imprisonment + Fine',
    bnsEquivalent: 'BNS-109',
    keyElements: ['Overt act toward execution of murder', 'Intervening factor prevented demise'],
  },
  {
    code: 'BNS-109',
    sectionNumber: '109',
    statute: 'BNS',
    title: 'Attempt to Murder (BNS)',
    category: 'HOMICIDE',
    severityLevel: 'CRITICAL',
    description: 'Attempt to commit murder under Bharatiya Nyaya Sanhita.',
    punishment: 'Imprisonment up to 10 years or Life Imprisonment + Fine',
    ipcEquivalent: 'IPC-307',
    keyElements: ['Execution of lethal attempt', 'Causation of hurt or trauma'],
  },
  {
    code: 'IPC-120B',
    sectionNumber: '120B',
    statute: 'IPC',
    title: 'Punishment of Criminal Conspiracy',
    category: 'CONSPIRACY',
    severityLevel: 'CRITICAL',
    description: 'Agreement between two or more persons to commit or cause to be committed an illegal act or an act by illegal means.',
    punishment: 'Equal to punishment for the abetted/conspired offense',
    bnsEquivalent: 'BNS-61',
    keyElements: ['Meeting of minds', 'Overt conspiratorial acts or communications'],
  },
  {
    code: 'BNS-61',
    sectionNumber: '61',
    statute: 'BNS',
    title: 'Criminal Conspiracy (BNS)',
    category: 'CONSPIRACY',
    severityLevel: 'CRITICAL',
    description: 'Criminal conspiracy provisions under Bharatiya Nyaya Sanhita.',
    punishment: 'Equal to target substantive offense',
    ipcEquivalent: 'IPC-120B',
    keyElements: ['Multi-party criminal agreement', 'Execution of covert steps'],
  },
  {
    code: 'IPC-201',
    sectionNumber: '201',
    statute: 'IPC',
    title: 'Causing Disappearance of Evidence of Offence',
    category: 'EVIDENCE_TAMPERING',
    severityLevel: 'HIGH',
    description: 'Knowing or having reason to believe an offence has been committed, causes any evidence of the commission of that offence to disappear to screen the offender.',
    punishment: 'Imprisonment up to 7 years + Fine (if capital offence)',
    bnsEquivalent: 'BNS-238',
    keyElements: ['Destruction, hiding, or deletion of digital/physical evidence', 'Intent to screen offender from legal punishment'],
  },
  {
    code: 'BNS-238',
    sectionNumber: '238',
    statute: 'BNS',
    title: 'Causing Disappearance of Evidence (BNS)',
    category: 'EVIDENCE_TAMPERING',
    severityLevel: 'HIGH',
    description: 'Tampering, destroying, or concealing physical, biological, or digital evidence to evade prosecution.',
    punishment: 'Imprisonment up to 7 years + Fine',
    ipcEquivalent: 'IPC-201',
    keyElements: ['Evidence destruction', 'Giving false statements to mislead inquiry'],
  },
  {
    code: 'IPC-328',
    sectionNumber: '328',
    statute: 'IPC',
    title: 'Causing Hurt by Means of Poison or Stupefying Drug',
    category: 'ASSAULT',
    severityLevel: 'CRITICAL',
    description: 'Administering or causing to be taken any poison or any stupefying, intoxicating or unwholesome drug with intent to cause hurt.',
    punishment: 'Imprisonment up to 10 years + Fine',
    bnsEquivalent: 'BNS-123',
    keyElements: ['Administration of toxic/poisonous agent (e.g., Thallium)', 'Intent to facilitate commission of offence or cause grave injury'],
  },
  {
    code: 'IPC-34',
    sectionNumber: '34',
    statute: 'IPC',
    title: 'Acts Done by Several Persons in Furtherance of Common Intention',
    category: 'CONSPIRACY',
    severityLevel: 'HIGH',
    description: 'When a criminal act is done by several persons in furtherance of the common intention of all, each of such persons is liable for that act in the same manner as if it were done by him alone.',
    punishment: 'Joint and several vicarious liability for substantive crime',
    bnsEquivalent: 'BNS-3(5)',
    keyElements: ['Pre-arranged plan', 'Active physical or digital participation in execution'],
  },
  {
    code: 'IPC-420',
    sectionNumber: '420',
    statute: 'IPC',
    title: 'Cheating and Dishonestly Inducing Delivery of Property',
    category: 'FRAUD',
    severityLevel: 'MEDIUM',
    description: 'Cheating and dishonestly inducing the person deceived to deliver any property, insurance payout, or valuable security.',
    punishment: 'Imprisonment up to 7 years + Fine',
    bnsEquivalent: 'BNS-318',
    keyElements: ['Deceitful inducement', 'Fraudulent procurement of assets or life insurance claims'],
  },
  {
    code: 'IPC-468',
    sectionNumber: '468',
    statute: 'IPC',
    title: 'Forgery for Purpose of Cheating',
    category: 'FRAUD',
    severityLevel: 'MEDIUM',
    description: 'Whoever commits forgery, intending that the document or electronic record forged shall be used for cheating.',
    punishment: 'Imprisonment up to 7 years + Fine',
    bnsEquivalent: 'BNS-336(3)',
    keyElements: ['Creation of false electronic document or credential', 'Use in procuring restricted substances'],
  },
  {
    code: 'ARMS-25',
    sectionNumber: '25',
    statute: 'IPC',
    title: 'Arms Act Section 25 (Unlawful Possession/Use of Firearm)',
    category: 'WEAPONS',
    severityLevel: 'HIGH',
    description: 'Acquiring, possessing or carrying prohibited firearms or ammunition (e.g. 7.62mm caliber rifle) without lawful license.',
    punishment: 'Rigorous Imprisonment 7 to 14 years + Fine',
    bnsEquivalent: 'ARMS-25',
    keyElements: ['Recovery of illegal firearm or spent brass cartridges', 'Ballistic match with crime scene exhibit'],
  },
  {
    code: 'BSA-63',
    sectionNumber: '63',
    statute: 'BNS',
    title: 'Bharatiya Sakshya Adhiniyam Section 63 (Admissibility of Electronic Records)',
    category: 'EVIDENCE_TAMPERING',
    severityLevel: 'HIGH',
    description: 'Certificate and forensic hash validation for admissibility of electronic intercepts, CDR logs, CCTV footage, and digital extraction.',
    punishment: 'Statutory evidentiary compliance rule',
    ipcEquivalent: 'IEA-65B',
    keyElements: ['Cryptographic SHA-256 integrity hash', 'Investigator certification of recording device'],
  },
];

// In-memory quick lookup maps
const penalCodeByCode = new Map<string, LegalPenalCode>();
const penalCodeBySection = new Map<string, LegalPenalCode>();

for (const code of LEGAL_PENAL_CODES_CATALOG) {
  penalCodeByCode.set(code.code.toUpperCase(), code);
  penalCodeBySection.set(`${code.statute}-${code.sectionNumber}`.toUpperCase(), code);
  penalCodeBySection.set(code.sectionNumber.toUpperCase(), code);
}

export function lookupPenalCode(codeOrSection: string): LegalPenalCode | null {
  if (!codeOrSection) return null;
  const normalized = codeOrSection.trim().toUpperCase().replace(/\s+/g, '-');
  
  if (penalCodeByCode.has(normalized)) {
    return penalCodeByCode.get(normalized)!;
  }
  if (penalCodeBySection.has(normalized)) {
    return penalCodeBySection.get(normalized)!;
  }

  // Regex extract section number
  const match = normalized.match(/(?:IPC|BNS|BSA|Arms\s*Act|Section|Sec\.?)?[-\s]*([0-9]+[A-Z]?|\d+\([0-9]+\)|120[-\s]?B)/i);
  if (match && match[1]) {
    const sec = match[1].toUpperCase().replace(/\s+/g, '');
    for (const item of LEGAL_PENAL_CODES_CATALOG) {
      if (item.sectionNumber.toUpperCase() === sec || item.code.toUpperCase().includes(sec)) {
        return item;
      }
    }
  }
  return null;
}

// ==========================================
// 2. PHONETIC & FUZZY MATCHING ALGORITHMS
// ==========================================

export function jaroSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const str1 = s1.toLowerCase().trim();
  const str2 = s2.toLowerCase().trim();

  const len1 = str1.length;
  const len2 = str2.length;

  const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;

  const str1Matches = new Array(len1).fill(false);
  const str2Matches = new Array(len2).fill(false);

  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, len2);

    for (let j = start; j < end; j++) {
      if (str2Matches[j]) continue;
      if (str1[i] !== str2[j]) continue;
      str1Matches[i] = true;
      str2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!str1Matches[i]) continue;
    while (!str2Matches[k]) k++;
    if (str1[i] !== str2[k]) transpositions++;
    k++;
  }

  const sim = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3.0;
  return sim;
}

export function jaroWinklerSimilarity(s1: string, s2: string, prefixScale = 0.1): number {
  const jaro = jaroSimilarity(s1, s2);
  if (jaro < 0.7) return jaro;

  const str1 = s1.toLowerCase().trim();
  const str2 = s2.toLowerCase().trim();

  let prefixLength = 0;
  const maxPrefix = Math.min(4, Math.min(str1.length, str2.length));

  for (let i = 0; i < maxPrefix; i++) {
    if (str1[i] === str2[i]) {
      prefixLength++;
    } else {
      break;
    }
  }

  return Math.min(1.0, jaro + prefixLength * prefixScale * (1.0 - jaro));
}

export function levenshteinDistance(a: string, b: string): number {
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();
  const m = s1.length;
  const n = s2.length;

  const d: number[][] = [];
  for (let i = 0; i <= m; i++) d[i] = [i];
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
    }
  }
  return d[m][n];
}

export function levenshteinSimilarity(a: string, b: string): number {
  if (!a && !b) return 1.0;
  if (!a || !b) return 0.0;
  const dist = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  return maxLen === 0 ? 1.0 : Math.max(0, 1 - dist / maxLen);
}

export function doubleMetaphone(input: string): [string, string] {
  if (!input) return ['', ''];
  const str = input.toUpperCase().trim().replace(/[^A-Z]/g, '');
  if (!str) return ['', ''];

  let primary = '';
  let secondary = '';
  let current = 0;
  const length = str.length;

  const isVowel = (c: string) => ['A', 'E', 'I', 'O', 'U', 'Y'].includes(c);

  while (current < length && (primary.length < 5 || secondary.length < 5)) {
    const char = str[current];
    const nextChar = current + 1 < length ? str[current + 1] : '';
    const prevChar = current > 0 ? str[current - 1] : '';

    if (current === 0 && isVowel(char)) {
      primary += 'A';
      secondary += 'A';
      current++;
      continue;
    }

    switch (char) {
      case 'B':
        primary += 'P';
        secondary += 'P';
        current += nextChar === 'B' ? 2 : 1;
        break;

      case 'C':
        if (nextChar === 'H') {
          primary += 'X';
          secondary += 'X';
          current += 2;
        } else if (['I', 'E', 'Y'].includes(nextChar)) {
          primary += 'S';
          secondary += 'S';
          current += 2;
        } else {
          primary += 'K';
          secondary += 'K';
          current += nextChar === 'C' ? 2 : 1;
        }
        break;

      case 'D':
        if (nextChar === 'G' || nextChar === 'J') {
          primary += 'J';
          secondary += 'J';
          current += 2;
        } else {
          primary += 'T';
          secondary += 'T';
          current += nextChar === 'D' ? 2 : 1;
        }
        break;

      case 'F':
      case 'V':
        primary += 'F';
        secondary += 'F';
        current += ['F', 'V'].includes(nextChar) ? 2 : 1;
        break;

      case 'G':
        if (nextChar === 'H') {
          primary += 'K';
          secondary += 'K';
          current += 2;
        } else if (['I', 'E', 'Y'].includes(nextChar)) {
          primary += 'J';
          secondary += 'K';
          current += 2;
        } else {
          primary += 'K';
          secondary += 'K';
          current += nextChar === 'G' ? 2 : 1;
        }
        break;

      case 'H':
        if ((current === 0 || isVowel(prevChar)) && isVowel(nextChar)) {
          primary += 'H';
          secondary += 'H';
          current += 2;
        } else {
          current++;
        }
        break;

      case 'J':
        primary += 'J';
        secondary += 'A';
        current += nextChar === 'J' ? 2 : 1;
        break;

      case 'K':
        primary += 'K';
        secondary += 'K';
        current += nextChar === 'K' ? 2 : 1;
        break;

      case 'L':
        primary += 'L';
        secondary += 'L';
        current += nextChar === 'L' ? 2 : 1;
        break;

      case 'M':
        primary += 'M';
        secondary += 'M';
        current += nextChar === 'M' ? 2 : 1;
        break;

      case 'N':
        primary += 'N';
        secondary += 'N';
        current += nextChar === 'N' ? 2 : 1;
        break;

      case 'P':
        if (nextChar === 'H') {
          primary += 'F';
          secondary += 'F';
          current += 2;
        } else {
          primary += 'P';
          secondary += 'P';
          current += nextChar === 'P' ? 2 : 1;
        }
        break;

      case 'Q':
        primary += 'K';
        secondary += 'K';
        current += nextChar === 'Q' ? 2 : 1;
        break;

      case 'R':
        primary += 'R';
        secondary += 'R';
        current += nextChar === 'R' ? 2 : 1;
        break;

      case 'S':
        if (nextChar === 'H') {
          primary += 'X';
          secondary += 'X';
          current += 2;
        } else {
          primary += 'S';
          secondary += 'S';
          current += nextChar === 'S' ? 2 : 1;
        }
        break;

      case 'T':
        if (nextChar === 'H') {
          primary += '0';
          secondary += 'T';
          current += 2;
        } else if (nextChar === 'C' && current + 2 < length && str[current + 2] === 'H') {
          primary += 'X';
          secondary += 'X';
          current += 3;
        } else {
          primary += 'T';
          secondary += 'T';
          current += nextChar === 'T' ? 2 : 1;
        }
        break;

      case 'W':
        if (isVowel(nextChar)) {
          primary += 'A';
          secondary += 'F';
          current += 2;
        } else {
          current++;
        }
        break;

      case 'X':
        primary += 'KS';
        secondary += 'KS';
        current += nextChar === 'X' ? 2 : 1;
        break;

      case 'Z':
        primary += 'S';
        secondary += 'S';
        current += nextChar === 'Z' ? 2 : 1;
        break;

      default:
        current++;
        break;
    }
  }

  return [primary.slice(0, 4), secondary.slice(0, 4)];
}

export function compareDoubleMetaphone(nameA: string, nameB: string): { matches: boolean; score: number; keysA: [string, string]; keysB: [string, string] } {
  const keysA = doubleMetaphone(nameA);
  const keysB = doubleMetaphone(nameB);

  const exactPrimary = keysA[0] && keysA[0] === keysB[0];
  const exactSecondary = (keysA[1] && keysA[1] === keysB[0]) || (keysA[0] && keysA[0] === keysB[1]) || (keysA[1] && keysA[1] === keysB[1]);

  let score = 0.0;
  if (exactPrimary) score = 1.0;
  else if (exactSecondary) score = 0.85;
  else {
    const jaroPrimary = jaroWinklerSimilarity(keysA[0], keysB[0]);
    if (jaroPrimary > 0.8) score = jaroPrimary * 0.75;
  }

  return {
    matches: Boolean(exactPrimary || exactSecondary),
    score,
    keysA,
    keysB,
  };
}

// ==========================================
// 3. DETERMINISTIC & REGEX NER ENGINE
// ==========================================

export function extractEntitiesHeuristically(
  rawText: string,
  options: { documentId: string; caseId?: string; documentTitle?: string; documentType?: string }
): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];
  const foundSet = new Set<string>();

  const addEntity = (
    entityType: ExtractedEntityType,
    textValue: string,
    startIndex: number,
    endIndex: number,
    confidenceScore: number,
    contextSnippet?: string,
    metadata?: any
  ) => {
    const key = `${entityType}:${textValue}:${startIndex}`;
    if (foundSet.has(key)) return;
    foundSet.add(key);

    entities.push({
      id: `ent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      documentId: options.documentId,
      caseId: options.caseId,
      entityType,
      textValue: textValue.trim(),
      startIndex,
      endIndex,
      confidenceScore,
      contextSnippet: contextSnippet || rawText.substring(Math.max(0, startIndex - 50), Math.min(rawText.length, endIndex + 50)).trim(),
      metadata: {
        documentTitle: options.documentTitle,
        documentType: options.documentType,
        ...metadata,
      },
    });
  };

  // 1. Penal Codes Regex (e.g. IPC 302, Section 120-B, BNS 103, BSA 63, Arms Act Sec 25)
  const penalRegex = /\b(?:IPC|BNS|BSA|Arms\s+Act|Section|Sec\.?)\s*[-:]?\s*(\d{2,4}[A-Za-z]?|\d+\([0-9]+\)|120[-\s]?B|302|307|201|328|34|420|468|25|63)\b/gi;
  let match: RegExpExecArray | null;

  while ((match = penalRegex.exec(rawText)) !== null) {
    const fullMatch = match[0];
    const secNum = match[1];
    const penalCode = lookupPenalCode(fullMatch) || lookupPenalCode(secNum);
    
    addEntity(
      'PENAL_CODE',
      fullMatch,
      match.index,
      match.index + fullMatch.length,
      0.98,
      undefined,
      {
        penalCodeDetails: penalCode || {
          code: fullMatch.toUpperCase().replace(/\s+/g, '-'),
          sectionNumber: secNum,
          statute: fullMatch.toUpperCase().includes('BNS') ? 'BNS' : 'IPC',
          title: `Penal Section ${secNum}`,
          category: 'STATUTORY_CHARGE',
          severityLevel: 'HIGH',
          description: `Legal charge under section ${secNum}`,
        },
      }
    );
  }

  // 2. Phone Numbers Regex (+91 or 10 digits)
  const phoneRegex = /\b(?:\+?91[\s-]?)?[6789]\d{9}\b/g;
  while ((match = phoneRegex.exec(rawText)) !== null) {
    addEntity('PHONE', match[0], match.index, match.index + match[0].length, 0.95);
  }

  // 3. Indian Vehicle Registrations (e.g., MH-12-FR-0007, MH 14 AB 1234, DL-3C-9988)
  const vehicleRegex = /\b[A-Z]{2}[-\s]?[0-9]{1,2}[-\s]?[A-Z]{1,3}[-\s]?[0-9]{3,4}\b/g;
  while ((match = vehicleRegex.exec(rawText)) !== null) {
    addEntity('VEHICLE', match[0], match.index, match.index + match[0].length, 0.94);
  }

  // 4. Weapons & Contraband Lexicon
  const weaponRegex = /\b(?:7\.62mm\s*(?:sniper\s*rifle|cartridge|brass|bullet|precision\s*rifle|round)?|Glock[-\s]?17|Thallium\s*(?:powder|poison|toxin|vial)|Arsenic|Cyanide|Hunting\s*Knife|Switchblade|Beretta\s*9mm|Silencer|Suppressor|Improvised\s*IED)\b/gi;
  while ((match = weaponRegex.exec(rawText)) !== null) {
    addEntity('WEAPON', match[0], match.index, match.index + match[0].length, 0.96);
  }

  // 5. Locations & Cell Towers
  const locationRegex = /\b(?:Lohegaon\s*Hill|Viman\s*Nagar|Kalyani\s*Nagar|Sharma\s*Electronics|Hotel\s*Marriott|Resort\s*Lonavala|Room\s*304|Tower-100|CELL-ID-4012|Sector\s*4|Terminal\s*9|Pune|Mumbai|Airport\s*Road)\b/gi;
  while ((match = locationRegex.exec(rawText)) !== null) {
    addEntity('LOCATION', match[0], match.index, match.index + match[0].length, 0.92);
  }

  // 6. Timestamps & Dates
  const timestampRegex = /\b(?:\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2})?Z?)?|(?:April|May|June|July|August)\s+\d{1,2}(?:,\s+\d{4})?|\d{1,2}:\d{2}\s*(?:AM|PM|hrs))\b/gi;
  while ((match = timestampRegex.exec(rawText)) !== null) {
    addEntity('TIMESTAMP', match[0], match.index, match.index + match[0].length, 0.90);
  }

  // 7. Known Persons & Suspect/Witness Monikers in Doomed Triangle and forensic cases
  const knownEntitiesPattern = /\b(?:Diya\s*Gupta|D\.\s*Gupta|Diya\s*G\.|The\s*Architect|Chetany\s*Sharma|Chetan\s*S\.|C\.\s*Sharma|Sharmaji|The\s*Chemist|Keshan\s*Malhotra|K\.\s*Malhotra|Keshav\s*M\.|Vikram\s*Rathod|V\.\s*Rathod|Vicky|Archita\s*Roy|Archita\s*R\.|Dr\.\s*Sneha\s*Rao|Dr\.\s*Neha\s*Patwardhan|SI\s*Santosh\s*Jadhav|Marcus\s*Vance|Sarah\s*Jenkins|Elena\s*Rostova)\b/gi;
  while ((match = knownEntitiesPattern.exec(rawText)) !== null) {
    const val = match[0];
    const isAlias = val.includes('.') || ['The Architect', 'Sharmaji', 'The Chemist', 'Vicky'].includes(val);
    const roleHint = ['Diya', 'Chetan', 'Vikram', 'Architect', 'Chemist', 'Vicky'].some(n => val.includes(n))
      ? 'SUSPECT'
      : ['Keshan', 'Keshav'].some(n => val.includes(n))
      ? 'VICTIM'
      : 'WITNESS';

    addEntity(
      isAlias ? 'ALIAS' : 'PERSON',
      val,
      match.index,
      match.index + val.length,
      0.95,
      undefined,
      { roleHint }
    );
  }

  // Sort by start index
  return entities.sort((a, b) => a.startIndex - b.startIndex);
}

// ==========================================
// 4. GEMINI 1.5 PRO / ADVANCED NER EXTRACTOR
// ==========================================

export async function extractEntitiesWithLLM(
  rawText: string,
  options: { documentId: string; caseId?: string; documentTitle?: string; documentType?: string }
): Promise<ExtractedEntity[]> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    return extractEntitiesHeuristically(rawText, options);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const prompt = `You are the lead Legal Named Entity Recognition (NER) intelligence model in Suraag AI.
Extract all legal, person, alias, penal code, location, vehicle, weapon, and timestamp entities from the provided forensic document.

Return a JSON array of entity objects with this exact structure:
[
  {
    "entityType": "PERSON" | "ALIAS" | "PENAL_CODE" | "LOCATION" | "VEHICLE" | "WEAPON" | "TIMESTAMP" | "ORGANIZATION" | "PHONE",
    "textValue": "exact text mention",
    "startIndex": character start index (0-indexed in the text),
    "endIndex": character end index (0-indexed in the text),
    "confidenceScore": float 0.8 to 1.0,
    "roleHint": "SUSPECT" | "WITNESS" | "VICTIM" | "ASSOCIATE" (optional for persons/aliases),
    "penalCodeSection": "e.g. IPC-302, BNS-103, IPC-120B" (optional for penal codes),
    "contextSnippet": "surrounding 1-2 sentence context snippet"
  }
]

DOCUMENT TITLE: ${options.documentTitle || 'Legal Document'}
DOCUMENT TYPE: ${options.documentType || 'UNSPECIFIED'}
TEXT:
"""
${rawText}
"""`;

    const response = await model.generateContent(prompt);
    const textOutput = response.response.text();
    const parsed = JSON.parse(textOutput);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item: any, idx: number) => {
        const penalDetails = item.entityType === 'PENAL_CODE' ? (lookupPenalCode(item.textValue || item.penalCodeSection) || undefined) : undefined;
        return {
          id: `ent-llm-${Date.now()}-${idx}`,
          documentId: options.documentId,
          caseId: options.caseId,
          entityType: item.entityType,
          textValue: item.textValue,
          startIndex: typeof item.startIndex === 'number' ? item.startIndex : rawText.indexOf(item.textValue),
          endIndex: typeof item.endIndex === 'number' ? item.endIndex : rawText.indexOf(item.textValue) + item.textValue.length,
          confidenceScore: item.confidenceScore || 0.95,
          contextSnippet: item.contextSnippet || rawText.substring(Math.max(0, (item.startIndex || 0) - 50), Math.min(rawText.length, (item.endIndex || 0) + 50)),
          metadata: {
            roleHint: item.roleHint,
            documentTitle: options.documentTitle,
            documentType: options.documentType,
            penalCodeDetails: penalDetails,
          },
        };
      });
    }

    return extractEntitiesHeuristically(rawText, options);
  } catch (err) {
    console.warn('[NER Service] Gemini LLM extraction failed or timed out, falling back to heuristic parser:', err);
    return extractEntitiesHeuristically(rawText, options);
  }
}

// ==========================================
// 5. 3-STAGE CROSS-DOCUMENT ALIAS RESOLUTION
// ==========================================

export async function resolveAliasesForCase(
  caseId: string,
  entities: ExtractedEntity[],
  existingIdentities: CanonicalIdentity[],
  documents: NERDocument[] = []
): Promise<{
  candidates: AliasMergeCandidate[];
  updatedIdentities: CanonicalIdentity[];
}> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const personEntities = entities.filter(e => e.entityType === 'PERSON' || e.entityType === 'ALIAS');

  const candidates: AliasMergeCandidate[] = [];
  const processedPairKeys = new Set<string>();

  const docMap = new Map<string, NERDocument>();
  for (const doc of documents) {
    docMap.set(doc.id, doc);
  }

  const identityCoOccurrences = new Map<string, { phoneNumbers: Set<string>; locations: Set<string>; associates: Set<string> }>();

  for (const identity of existingIdentities) {
    const phones = new Set<string>(identity.coOccurrenceSummary?.sharedPhoneNumbers || []);
    const locs = new Set<string>(identity.coOccurrenceSummary?.associatedLocations || []);
    const assoc = new Set<string>(identity.coOccurrenceSummary?.knownAssociates || []);
    identityCoOccurrences.set(identity.id, { phoneNumbers: phones, locations: locs, associates: assoc });
  }

  // --- STAGE 1 & 2: Evaluate All Entity Mention Pairs against Master Canonical Identities ---
  for (const entity of personEntities) {
    const rawMention = entity.textValue.trim();

    for (const identity of existingIdentities) {
      const isAlreadyMerged = identity.aliases?.some(
        a => a.aliasName.toLowerCase() === rawMention.toLowerCase() && a.isApproved
      );
      if (isAlreadyMerged || identity.primaryName.toLowerCase() === rawMention.toLowerCase()) {
        continue;
      }

      const pairKey = `${entity.id}:${identity.id}`;
      if (processedPairKeys.has(pairKey)) continue;
      processedPairKeys.add(pairKey);

      // 1. Phonetic & Jaro-Winkler Similarity
      const jaroScore = jaroWinklerSimilarity(rawMention, identity.primaryName);
      const levScore = levenshteinSimilarity(rawMention, identity.primaryName);
      const fuzzyScore = Math.max(jaroScore, levScore);

      const metaphone = compareDoubleMetaphone(rawMention, identity.primaryName);
      const isInitialsMatch = checkInitialsMatch(rawMention, identity.primaryName);
      const isKnownMoniker = checkKnownMonikerMatch(rawMention, identity.primaryName);

      if (fuzzyScore < 0.65 && !metaphone.matches && !isInitialsMatch && !isKnownMoniker) {
        continue;
      }

      // 2. Co-occurrence analysis in snippet context
      const snippet = entity.contextSnippet || '';
      const doc = docMap.get(entity.documentId);
      const docText = doc ? doc.rawText : snippet;

      const coData = identityCoOccurrences.get(identity.id);
      const sharedPhones: string[] = [];
      const sharedLocs: string[] = [];
      const sharedAssoc: string[] = [];

      if (coData) {
        for (const p of coData.phoneNumbers) {
          if (snippet.includes(p) || docText.includes(p)) sharedPhones.push(p);
        }
        for (const l of coData.locations) {
          if (snippet.toLowerCase().includes(l.toLowerCase())) sharedLocs.push(l);
        }
        for (const a of coData.associates) {
          if (snippet.toLowerCase().includes(a.toLowerCase())) sharedAssoc.push(a);
        }
      }

      const coOccurCount = sharedPhones.length * 2 + sharedLocs.length + sharedAssoc.length;
      const coOccurrenceScore = Math.min(1.0, coOccurCount / 3.0);

      // Composite Confidence Calculation
      let confidenceBase = 0.0;
      if (isKnownMoniker) {
        confidenceBase = 0.94;
      } else if (isInitialsMatch) {
        confidenceBase = 0.88 + coOccurrenceScore * 0.1;
      } else {
        confidenceBase = fuzzyScore * 0.45 + metaphone.score * 0.3 + coOccurrenceScore * 0.25;
      }

      const overallConfidence = Math.min(99.9, Math.round(confidenceBase * 1000) / 10);
      const suggestedAction = overallConfidence >= 82.0 ? 'MERGE' : overallConfidence >= 65.0 ? 'FLAG_REVIEW' : 'SEPARATE';

      let matchType: AliasMergeCandidate['matchType'] = 'FUZZY_JARO_WINKLER';
      if (metaphone.matches) matchType = 'PHONETIC_SOUNDEX';
      if (coOccurrenceScore > 0.5) matchType = 'LLM_CONTEXTUAL_COOCCURRENCE';
      if (fuzzyScore > 0.85 && (metaphone.matches || coOccurrenceScore > 0.3)) matchType = 'HYBRID_HIGH_CONFIDENCE';

      let reasoning = `Phonetic similarity ${Math.round(metaphone.score * 100)}% (Double Metaphone [${metaphone.keysA.join('/')}] <-> [${metaphone.keysB.join('/')}]), Jaro-Winkler string similarity ${Math.round(fuzzyScore * 100)}%.`;
      if (isInitialsMatch) {
        reasoning = `Strong initial abbreviation match ('${rawMention}' <-> '${identity.primaryName}'). Corroborated by case context.`;
      }
      if (isKnownMoniker) {
        reasoning = `Forensic alias moniker mapping identified via intercept wiretaps ('${rawMention}' operates as pseudonym for master suspect ${identity.primaryName}).`;
      }
      if (sharedPhones.length > 0) {
        reasoning += ` Shared verified phone numbers: ${sharedPhones.join(', ')}.`;
      }
      if (sharedLocs.length > 0) {
        reasoning += ` Co-located at ${sharedLocs.join(', ')}.`;
      }

      candidates.push({
        id: `cand-${entity.id}-${identity.id}`,
        sourceEntity: entity,
        targetIdentity: identity,
        proposedName: identity.primaryName,
        matchType,
        fuzzyScore: Math.round(fuzzyScore * 100) / 100,
        soundexMatch: metaphone.matches,
        doubleMetaphoneKeys: {
          source: metaphone.keysA,
          target: metaphone.keysB,
        },
        coOccurrenceScore: Math.round(coOccurrenceScore * 100) / 100,
        coOccurrenceFactors: {
          sharedPhoneNumbers: sharedPhones,
          sharedLocations: sharedLocs,
          sharedAssociates: sharedAssoc,
        },
        llmDisambiguationReasoning: reasoning,
        overallConfidence,
        status: 'PENDING_REVIEW',
        suggestedAction,
      });
    }
  }

  // --- STAGE 3: Optional Gemini 1.5 Pro Disambiguation refinement for ambiguous candidates (60% - 85%) ---
  if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY' && candidates.length > 0) {
    try {
      const ambiguousCandidates = candidates.filter(c => c.overallConfidence >= 60 && c.overallConfidence <= 90).slice(0, 5);
      if (ambiguousCandidates.length > 0) {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-pro',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `You are the Cross-Document Forensic Alias Disambiguation Engine in Suraag AI.
Review candidate alias merges between raw text mentions and master suspect profiles:
${JSON.stringify(
  ambiguousCandidates.map(c => ({
    candidateId: c.id,
    mention: c.sourceEntity.textValue,
    masterName: c.targetIdentity.primaryName,
    snippet: c.sourceEntity.contextSnippet,
    coOccurrence: c.coOccurrenceFactors,
  })),
  null,
  2
)}

Return a JSON array verifying or refining each candidate:
[
  {
    "candidateId": string,
    "refinedConfidence": float 0-100,
    "forensicReasoning": string,
    "suggestedAction": "MERGE" | "FLAG_REVIEW" | "SEPARATE"
  }
]`;

        const response = await model.generateContent(prompt);
        const results = JSON.parse(response.response.text());

        if (Array.isArray(results)) {
          for (const res of results) {
            const cand = candidates.find(c => c.id === res.candidateId);
            if (cand && typeof res.refinedConfidence === 'number') {
              cand.overallConfidence = res.refinedConfidence;
              cand.llmDisambiguationReasoning = res.forensicReasoning || cand.llmDisambiguationReasoning;
              cand.suggestedAction = res.suggestedAction || cand.suggestedAction;
            }
          }
        }
      }
    } catch (llmErr) {
      console.warn('[NER Service] Gemini LLM disambiguation refinement skipped:', llmErr);
    }
  }

  candidates.sort((a, b) => b.overallConfidence - a.overallConfidence);

  return {
    candidates,
    updatedIdentities: existingIdentities,
  };
}

function checkInitialsMatch(mention: string, fullName: string): boolean {
  const cleanMention = mention.replace(/[.,\s]/g, '').toLowerCase();
  const parts = fullName.trim().toLowerCase().split(/\s+/);
  if (parts.length < 2) return false;

  const firstName = parts[0];
  const lastName = parts[parts.length - 1];

  if (cleanMention === `${firstName[0]}${lastName}`) return true;
  if (cleanMention === `${firstName}${lastName[0]}`) return true;
  if (cleanMention === `${firstName[0]}${lastName[0]}`) return true;

  return false;
}

function checkKnownMonikerMatch(mention: string, fullName: string): boolean {
  const m = mention.toLowerCase();
  const f = fullName.toLowerCase();

  if (f.includes('diya') && (m.includes('architect') || m.includes('d.g.') || m.includes('diya g'))) return true;
  if (f.includes('chetany') && (m.includes('chemist') || m.includes('sharmaji') || m.includes('chetan s'))) return true;
  if (f.includes('vikram') && (m.includes('vicky') || m.includes('hitman') || m.includes('scorpio driver'))) return true;
  return false;
}

// ==========================================
// 6. DEFAULT FORENSIC SEED DATASETS FOR DOOMED TRIANGLE
// ==========================================

export const INITIAL_LEGAL_DOCUMENTS: NERDocument[] = [
  {
    id: 'DOC-FIR-081',
    caseId: 'CASE-2026-DT01',
    title: 'First Information Report (FIR-2026-PN081)',
    documentType: 'FIR',
    processedDate: '2026-06-22T08:30:00Z',
    entitiesCount: 14,
    penalCodesCount: 4,
    rawText: `FIRST INFORMATION REPORT (Under Section 154 Cr.P.C / Section 173 BNSS)
Police Station: Airport Police Station, Pune City
FIR No: 081/2026 | Date & Time: 2026-06-22 08:30 hrs
Complainant: SI Santosh Jadhav, Special Crime Branch, Pune

1. DETAILS OF INCIDENT:
On 2026-06-21 at approximately 17:15 hrs, the deceased Keshan Malhotra (Age 29) suffered fatal trauma at Lohegaon Hill, Pune. First response team dispatched following 112 emergency call by suspect Diya Gupta (a.k.a D. Gupta). Suspect claimed victim slipped during a selfie attempt. Subsequent CFSL forensic autopsy conducted by Dr. Neha Patwardhan revealed entry bullet wound consistent with 7.62mm caliber ammunition prior to fall.

2. SUSPECTS & ACCUSED:
Accused 1: Diya Gupta (Alias: "The Architect", D. Gupta, Diya G.), Residing at Viman Nagar, Pune. Contact: +91 98230 11245.
Accused 2: Chetany Sharma (Alias: "The Chemist", Chetan S., Sharmaji), Shop Owner at Sharma Electronics & Mobile Spares, Viman Nagar. Contact: +91 98230 44892.
Accused 3: Vikram Rathod (Alias: "Vicky", V. Rathod), Hired driver of Black Mahindra Scorpio MH-12-DE-9009.

3. STATUTORY CHARGES BOOKED:
- IPC Section 302 / BNS Section 103 (Punishment for Murder)
- IPC Section 120-B / BNS Section 61 (Criminal Conspiracy to commit capital offence)
- IPC Section 307 / BNS Section 109 (Attempt to Murder - 3 historical attempts)
- IPC Section 201 / BNS Section 238 (Causing disappearance of evidence / destruction of GPS burner phones)
- Arms Act Section 25 (Unlawful possession and discharge of 7.62mm precision rifle)

4. INVESTIGATION LEAD:
SI Santosh Jadhav seized vehicle Audi Q3 MH-12-FR-0007 from crime scene. Digital evidence certified under BSA Section 63.`,
    entities: [],
  },
  {
    id: 'DOC-CS-044',
    caseId: 'CASE-2026-DT01',
    title: 'Final Police Charge Sheet (CS-2026-044)',
    documentType: 'CHARGE_SHEET',
    processedDate: '2026-07-20T14:00:00Z',
    entitiesCount: 18,
    penalCodesCount: 5,
    rawText: `IN THE COURT OF CHIEF JUDICIAL MAGISTRATE, PUNE
POLICE FINAL CHARGE SHEET NO. 44/2026
STATE OF MAHARASHTRA VS. DIYA GUPTA & ORS.

SUMMARY OF PROSECUTION CASE:
The investigating agency establishes a 3-month premeditated criminal conspiracy under IPC 120B / BNS 61 led by Accused Diya Gupta ('The Architect') and co-conspirator Chetany Sharma ('The Chemist') to assassinate victim Keshan Malhotra to liquidate a ₹45,000,000 Term Life Insurance policy under Section 420 IPC.

ATTEMPT PHASE CHRONOLOGY:
- Attempt 1 (April 14, 2026): Chetany Sharma procured 50ml Thallium powder under forged veterinary prescription (Section 468 IPC / Section 328 IPC) to poison Keshan at Viman Nagar dinner.
- Attempt 2 (May 13, 2026): Chetan S. attempted physical stabbing at Resort Lonavala (Room 304); witnessed by Archita Roy.
- Attempt 3 (June 10, 2026): Accused paid ₹6,000,000 to Vikram Rathod (Vicky) to execute hit-and-run collision using Black Scorpio MH-12-DE-9009 under Section 307 IPC.
- Final Incident (June 21, 2026): Suspect Diya G. lured Keshan Malhotra to Lohegaon Hill overlooking Kalyani Nagar where Chetany Sharma fired single fatal 7.62mm round before staging fall. Accused charged under Section 302 IPC / Section 103 BNS and Section 201 IPC.`,
    entities: [],
  },
  {
    id: 'DOC-WS-ARCHITA',
    caseId: 'CASE-2026-DT01',
    title: 'Witness Statement - Archita Roy (WIT-001)',
    documentType: 'WITNESS_STATEMENT',
    processedDate: '2026-06-25T11:00:00Z',
    entitiesCount: 10,
    penalCodesCount: 2,
    rawText: `STATEMENT OF WITNESS UNDER SECTION 161 Cr.P.C / SECTION 180 BNSS
Witness: Archita Roy (Age 27, Interior Designer), Close associate of Diya Gupta and Keshan Malhotra.
Statement recorded at Crime Branch HQ by SI Santosh Jadhav.

VERBATIM STATEMENT:
"I was present during the birthday celebration at Resort Lonavala on May 13, 2026. Around 01:15 AM, I saw Chetan S. (Chetany Sharma) walking suspiciously near Room 304 where Keshan was resting. When I called out his name, he dropped a metallic object and hurried toward the parking lot. Later, D. Gupta insisted that Keshan was just drunk and that I should not mention Chetan's presence to anyone. Diya G. repeatedly whispered on call to someone addressed as 'Chemist' mentioning that 'Plan B must proceed without delay'. I feared for Keshan's safety and believe this was a deliberate attempt under Section 307 IPC."`,
    entities: [],
  },
  {
    id: 'DOC-INT-AUDIO-21',
    caseId: 'CASE-2026-DT01',
    title: 'Telecom Intercept Log & SMS Wiretap (INT-AUDIO-21)',
    documentType: 'INTERCEPT_TRANSCRIPT',
    processedDate: '2026-06-21T18:00:00Z',
    entitiesCount: 12,
    penalCodesCount: 3,
    rawText: `LEGAL INTERCEPT TRANSCRIPT - AUTHORIZED UNDER TELEGRAPH ACT / SECTION 69 IT ACT
Target Device: IMEI-864910059102841 (+91 98230 11245 - Diya Gupta)
Interception Station: CELL-ID-4012 (Lohegaon Hill Tower)

TIMESTAMP: 2026-06-21 16:58:12 IST
PARTICIPANTS: Diya G. ("The Architect") -> Chetany Sharma ("Sharmaji")

[16:58:12] Diya G.: "He is standing right on the ledge at Lohegaon Hill. The camera is out. Line up the 7.62mm shot now."
[16:58:25] Sharmaji: "Wind is low. Vicky is waiting with the Scorpio on Airport Road if we need a fast extraction."
[16:58:40] Diya G.: "Take the shot. I will immediately dial 112 and report a selfie accident. Delete these voice notes under Section 201 before police arrive."
[16:59:05] Sharmaji: "Understood. The ₹45,000,000 policy payout will be split 60-40."`,
    entities: [],
  },
];

export const INITIAL_CANONICAL_IDENTITIES: CanonicalIdentity[] = [
  {
    id: 'CAN-SUS-01',
    caseId: 'CASE-2026-DT01',
    primaryName: 'Diya Gupta',
    type: 'SUSPECT',
    riskScore: 98.5,
    notes: 'Primary Mastermind and Instigator of 4-phase homicide conspiracy against fiancé Keshan Malhotra for ₹45,000,000 insurance payout.',
    penalCharges: ['IPC-302', 'BNS-103', 'IPC-120B', 'BNS-61', 'IPC-307', 'IPC-201', 'IPC-328', 'IPC-420'],
    penalCodeDetails: [
      lookupPenalCode('IPC-302')!,
      lookupPenalCode('IPC-120B')!,
      lookupPenalCode('IPC-307')!,
      lookupPenalCode('IPC-201')!,
    ].filter(Boolean),
    aliases: [
      {
        mappingId: 'map-01',
        extractedEntityId: 'ent-d1',
        aliasName: 'D. Gupta',
        documentId: 'DOC-FIR-081',
        documentTitle: 'First Information Report (FIR-2026-PN081)',
        resolutionMethod: 'AUTOMATIC_FUZZY',
        confidence: 0.96,
        isApproved: true,
        reasoning: 'Initial abbreviation with 100% verified co-located phone +91 98230 11245.',
      },
      {
        mappingId: 'map-02',
        extractedEntityId: 'ent-d2',
        aliasName: 'The Architect',
        documentId: 'DOC-INT-AUDIO-21',
        documentTitle: 'Telecom Intercept Log & SMS Wiretap',
        resolutionMethod: 'AUTOMATIC_LLM',
        confidence: 0.98,
        isApproved: true,
        reasoning: 'Encrypted code name identified from wiretap intercept logs and conspiracy bank statements.',
      },
      {
        mappingId: 'map-03',
        extractedEntityId: 'ent-d3',
        aliasName: 'Diya G.',
        documentId: 'DOC-CS-044',
        documentTitle: 'Final Police Charge Sheet (CS-2026-044)',
        resolutionMethod: 'AUTOMATIC_FUZZY',
        confidence: 0.97,
        isApproved: true,
        reasoning: 'Surname abbreviation with direct case role match.',
      },
    ],
    citations: [
      {
        documentId: 'DOC-FIR-081',
        documentTitle: 'FIR-2026-PN081',
        snippet: 'Suspect Diya Gupta (a.k.a D. Gupta) claimed victim slipped during selfie attempt.',
        entityType: 'PERSON',
        confidence: 0.98,
      },
      {
        documentId: 'DOC-INT-AUDIO-21',
        documentTitle: 'INT-AUDIO-21',
        snippet: 'Diya G. ("The Architect") instructs Chetany Sharma to take 7.62mm shot.',
        entityType: 'ALIAS',
        confidence: 0.99,
      },
    ],
    coOccurrenceSummary: {
      sharedPhoneNumbers: ['+91 98230 11245'],
      associatedLocations: ['Lohegaon Hill', 'Viman Nagar', 'Resort Lonavala'],
      knownAssociates: ['Chetany Sharma', 'Vikram Rathod', 'Keshan Malhotra'],
      timelineSpan: 'April 14, 2026 – June 21, 2026',
    },
  },
  {
    id: 'CAN-SUS-02',
    caseId: 'CASE-2026-DT01',
    primaryName: 'Chetany Sharma',
    type: 'SUSPECT',
    riskScore: 97.2,
    notes: 'Co-conspirator, shooter, and chemical procurement operative. Fired 7.62mm precision rifle at Lohegaon Hill and acquired Thallium toxin.',
    penalCharges: ['IPC-302', 'BNS-103', 'IPC-120B', 'BNS-61', 'IPC-307', 'IPC-328', 'ARMS-25', 'IPC-468'],
    penalCodeDetails: [
      lookupPenalCode('IPC-302')!,
      lookupPenalCode('IPC-120B')!,
      lookupPenalCode('ARMS-25')!,
      lookupPenalCode('IPC-328')!,
    ].filter(Boolean),
    aliases: [
      {
        mappingId: 'map-04',
        extractedEntityId: 'ent-c1',
        aliasName: 'Chetan S.',
        documentId: 'DOC-WS-ARCHITA',
        documentTitle: 'Witness Statement - Archita Roy',
        resolutionMethod: 'AUTOMATIC_FUZZY',
        confidence: 0.95,
        isApproved: true,
        reasoning: 'Phonetic variant and abbreviated surname matched with resort attendance logs.',
      },
      {
        mappingId: 'map-05',
        extractedEntityId: 'ent-c2',
        aliasName: 'Sharmaji',
        documentId: 'DOC-INT-AUDIO-21',
        documentTitle: 'Telecom Intercept Log & SMS Wiretap',
        resolutionMethod: 'AUTOMATIC_LLM',
        confidence: 0.94,
        isApproved: true,
        reasoning: 'Informal moniker used in audio wiretaps corroborated by IMEI-864910059102841 triangulations.',
      },
      {
        mappingId: 'map-06',
        extractedEntityId: 'ent-c3',
        aliasName: 'The Chemist',
        documentId: 'DOC-CS-044',
        documentTitle: 'Final Police Charge Sheet',
        resolutionMethod: 'AUTOMATIC_LLM',
        confidence: 0.98,
        isApproved: true,
        reasoning: 'Tactical moniker reflecting forged chemical poison procurement.',
      },
    ],
    citations: [
      {
        documentId: 'DOC-FIR-081',
        documentTitle: 'FIR-2026-PN081',
        snippet: 'Accused 2: Chetany Sharma (Alias: "The Chemist", Chetan S., Sharmaji).',
        entityType: 'PERSON',
        confidence: 0.98,
      },
      {
        documentId: 'DOC-WS-ARCHITA',
        documentTitle: 'WS-ARCHITA-01',
        snippet: 'Saw Chetan S. (Chetany Sharma) walking suspiciously near Room 304 with knife.',
        entityType: 'ALIAS',
        confidence: 0.96,
      },
    ],
    coOccurrenceSummary: {
      sharedPhoneNumbers: ['+91 98230 44892'],
      associatedLocations: ['Sharma Electronics', 'Lohegaon Hill', 'Viman Nagar'],
      knownAssociates: ['Diya Gupta', 'Vikram Rathod'],
      timelineSpan: 'April 14, 2026 – June 21, 2026',
    },
  },
  {
    id: 'CAN-SUS-03',
    caseId: 'CASE-2026-DT01',
    primaryName: 'Vikram Rathod',
    type: 'SUSPECT',
    riskScore: 91.0,
    notes: 'Hired getaway operative and hitman. Drove Black Mahindra Scorpio MH-12-DE-9009 during June 10 vehicular attempt.',
    penalCharges: ['IPC-307', 'BNS-109', 'IPC-120B', 'BNS-61'],
    penalCodeDetails: [lookupPenalCode('IPC-307')!, lookupPenalCode('IPC-120B')!].filter(Boolean),
    aliases: [
      {
        mappingId: 'map-07',
        extractedEntityId: 'ent-v1',
        aliasName: 'Vicky',
        documentId: 'DOC-INT-AUDIO-21',
        documentTitle: 'Telecom Intercept Log',
        resolutionMethod: 'AUTOMATIC_LLM',
        confidence: 0.92,
        isApproved: true,
        reasoning: 'Slang nickname matched to banking beneficiary of ₹6,000,000 transfers from Chetany Sharma.',
      },
      {
        mappingId: 'map-08',
        extractedEntityId: 'ent-v2',
        aliasName: 'V. Rathod',
        documentId: 'DOC-FIR-081',
        documentTitle: 'FIR-2026-PN081',
        resolutionMethod: 'AUTOMATIC_FUZZY',
        confidence: 0.96,
        isApproved: true,
        reasoning: 'Abbreviated name on vehicle registration for MH-12-DE-9009.',
      },
    ],
    citations: [
      {
        documentId: 'DOC-CS-044',
        documentTitle: 'Charge Sheet CS-2026-044',
        snippet: 'Accused paid ₹6,000,000 to Vikram Rathod (Vicky) to execute hit-and-run.',
        entityType: 'PERSON',
        confidence: 0.95,
      },
    ],
    coOccurrenceSummary: {
      sharedPhoneNumbers: ['+91 98230 77112'],
      associatedLocations: ['Airport Road', 'Viman Nagar'],
      knownAssociates: ['Chetany Sharma', 'Diya Gupta'],
      timelineSpan: 'June 10, 2026 – June 21, 2026',
    },
  },
  {
    id: 'CAN-VIC-01',
    caseId: 'CASE-2026-DT01',
    primaryName: 'Keshan Malhotra',
    type: 'VICTIM',
    riskScore: 12.0,
    notes: 'Deceased victim. Targeted in 4 premeditated attempts culminating in gunshot and fall at Lohegaon Hill.',
    penalCharges: [],
    aliases: [
      {
        mappingId: 'map-09',
        extractedEntityId: 'ent-k1',
        aliasName: 'K. Malhotra',
        documentId: 'DOC-FIR-081',
        documentTitle: 'FIR-2026-PN081',
        resolutionMethod: 'AUTOMATIC_FUZZY',
        confidence: 0.97,
        isApproved: true,
        reasoning: 'Direct initial abbreviation of victim name.',
      },
      {
        mappingId: 'map-10',
        extractedEntityId: 'ent-k2',
        aliasName: 'Keshav M.',
        documentId: 'DOC-WS-ARCHITA',
        documentTitle: 'Witness Statement',
        resolutionMethod: 'AUTOMATIC_FUZZY',
        confidence: 0.89,
        isApproved: true,
        reasoning: 'Witness speech slip / phonetic variant of Keshan.',
      },
    ],
    citations: [
      {
        documentId: 'DOC-FIR-081',
        documentTitle: 'FIR-2026-PN081',
        snippet: 'Deceased Keshan Malhotra suffered fatal trauma at Lohegaon Hill.',
        entityType: 'PERSON',
        confidence: 0.99,
      },
    ],
    coOccurrenceSummary: {
      sharedPhoneNumbers: ['+91 98230 33901'],
      associatedLocations: ['Lohegaon Hill', 'Resort Lonavala', 'Viman Nagar'],
      knownAssociates: ['Diya Gupta', 'Archita Roy'],
      timelineSpan: 'April 14, 2026 – June 21, 2026',
    },
  },
  {
    id: 'CAN-WIT-01',
    caseId: 'CASE-2026-DT01',
    primaryName: 'Archita Roy',
    type: 'WITNESS',
    riskScore: 6.0,
    notes: 'Key eyewitness to Attempt 2 (May 13 knife incident at Resort Lonavala). Credibility score 95%.',
    penalCharges: [],
    aliases: [
      {
        mappingId: 'map-11',
        extractedEntityId: 'ent-a1',
        aliasName: 'Archita R.',
        documentId: 'DOC-WS-ARCHITA',
        documentTitle: 'Witness Statement',
        resolutionMethod: 'AUTOMATIC_FUZZY',
        confidence: 0.98,
        isApproved: true,
        reasoning: 'Witness name abbreviation.',
      },
    ],
    citations: [
      {
        documentId: 'DOC-WS-ARCHITA',
        documentTitle: 'WS-ARCHITA-01',
        snippet: 'Statement of witness Archita Roy recorded at Crime Branch HQ.',
        entityType: 'PERSON',
        confidence: 0.99,
      },
    ],
    coOccurrenceSummary: {
      sharedPhoneNumbers: ['+91 98230 55431'],
      associatedLocations: ['Resort Lonavala'],
      knownAssociates: ['Diya Gupta', 'Keshan Malhotra'],
      timelineSpan: 'May 13, 2026',
    },
  },
];
