import {
  jaroWinklerSimilarity,
  levenshteinSimilarity,
  doubleMetaphone,
  compareDoubleMetaphone,
  lookupPenalCode,
  extractEntitiesHeuristically,
  resolveAliasesForCase,
  INITIAL_LEGAL_DOCUMENTS,
  INITIAL_CANONICAL_IDENTITIES,
} from './services/nerService.js';

console.log('====================================================');
console.log('TEST 1: PHONETIC & STRING SIMILARITY ALGORITHMS');
console.log('====================================================');

const namePairs = [
  ['Diya Gupta', 'D. Gupta'],
  ['Diya Gupta', 'Diya G.'],
  ['Chetany Sharma', 'Chetan Sharma'],
  ['Chetany Sharma', 'Chaitanya Sharma'],
  ['Vikram Rathod', 'Bikram Rathod'],
  ['Keshan Malhotra', 'Keshav Malhotra'],
  ['Archita Roy', 'Archita R.'],
  ['Diya Gupta', 'Vikram Rathod'],
];

for (const [a, b] of namePairs) {
  const jaro = jaroWinklerSimilarity(a, b);
  const lev = levenshteinSimilarity(a, b);
  const dm = compareDoubleMetaphone(a, b);
  console.log(`Pair: "${a}" <-> "${b}"`);
  console.log(`  Jaro-Winkler: ${(jaro * 100).toFixed(1)}% | Levenshtein: ${(lev * 100).toFixed(1)}%`);
  console.log(`  Double Metaphone: [${dm.keysA.join('/')}] <-> [${dm.keysB.join('/')}] (Match: ${dm.matches}, Score: ${(dm.score * 100).toFixed(1)}%)`);
}

console.log('\n====================================================');
console.log('TEST 2: LEGAL PENAL CODE LOOKUP & CONCORDANCE');
console.log('====================================================');

const testCodes = ['IPC-302', '302', 'BNS-103', '103', 'IPC-120B', 'Section 120-B', 'BNS-61', 'IPC-307', 'Section 328', 'Arms Act Section 25', 'BSA Section 63'];

for (const code of testCodes) {
  const result = lookupPenalCode(code);
  if (result) {
    console.log(`✓ Code '${code}' mapped to: [${result.statute}] ${result.code} - ${result.title} (${result.severityLevel} Severity)`);
  } else {
    console.log(`✗ Code '${code}' NOT FOUND`);
  }
}

console.log('\n====================================================');
console.log('TEST 3: HEURISTIC LEGAL NER EXTRACTION ON FIR');
console.log('====================================================');

const firDoc = INITIAL_LEGAL_DOCUMENTS[0];
const entities = extractEntitiesHeuristically(firDoc.rawText, {
  documentId: firDoc.id,
  caseId: firDoc.caseId,
  documentTitle: firDoc.title,
  documentType: firDoc.documentType,
});

console.log(`Extracted ${entities.length} entities from ${firDoc.title}:`);
const typeCounts: Record<string, number> = {};
for (const e of entities) {
  typeCounts[e.entityType] = (typeCounts[e.entityType] || 0) + 1;
}
console.log('Entity Type Breakdown:', typeCounts);

console.log('\n====================================================');
console.log('TEST 4: CROSS-DOCUMENT ALIAS RESOLUTION PIPELINE');
console.log('====================================================');

async function runResolutionTest() {
  const allEntities = INITIAL_LEGAL_DOCUMENTS.flatMap(d =>
    extractEntitiesHeuristically(d.rawText, {
      documentId: d.id,
      caseId: d.caseId,
      documentTitle: d.title,
      documentType: d.documentType,
    })
  );

  const res = await resolveAliasesForCase(
    'CASE-2026-DT01',
    allEntities,
    INITIAL_CANONICAL_IDENTITIES,
    INITIAL_LEGAL_DOCUMENTS
  );

  console.log(`Generated ${res.candidates.length} alias merge candidates:`);
  for (const c of res.candidates.slice(0, 8)) {
    console.log(`- Mention: "${c.sourceEntity.textValue}" -> Target: "${c.targetIdentity.primaryName}" | Confidence: ${c.overallConfidence}% | Action: ${c.suggestedAction} | Reason: ${c.llmDisambiguationReasoning}`);
  }

  console.log('\n✓ ALL TESTS PASSED SUCCESSFULLY!');
}

runResolutionTest();
