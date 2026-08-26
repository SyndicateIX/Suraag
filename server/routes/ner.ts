import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  LEGAL_PENAL_CODES_CATALOG,
  lookupPenalCode,
  extractEntitiesWithLLM,
  extractEntitiesHeuristically,
  resolveAliasesForCase,
  INITIAL_LEGAL_DOCUMENTS,
  INITIAL_CANONICAL_IDENTITIES,
} from '../services/nerService.js';
import {
  CanonicalIdentity,
  ExtractedEntity,
  NERDocument,
  AliasMergeCandidate,
} from '../../src/types/index.js';

export function createNERRouter(prisma: PrismaClient | any) {
  const router = Router();

  // In-memory runtime state for fast execution and offline fallback
  let memoryDocuments: NERDocument[] = JSON.parse(JSON.stringify(INITIAL_LEGAL_DOCUMENTS));
  let memoryIdentities: CanonicalIdentity[] = JSON.parse(JSON.stringify(INITIAL_CANONICAL_IDENTITIES));
  let memoryEntities: ExtractedEntity[] = [];
  let memoryCandidates: AliasMergeCandidate[] = [];

  // Initialize initial entities from documents
  const initEntities = () => {
    memoryEntities = [];
    for (const doc of memoryDocuments) {
      const extracted = extractEntitiesHeuristically(doc.rawText, {
        documentId: doc.id,
        caseId: doc.caseId,
        documentTitle: doc.title,
        documentType: doc.documentType,
      });
      doc.entities = extracted;
      doc.entitiesCount = extracted.length;
      doc.penalCodesCount = extracted.filter(e => e.entityType === 'PENAL_CODE').length;
      memoryEntities.push(...extracted);
    }
  };
  initEntities();

  // 1. GET /api/ner/penal-codes
  router.get('/penal-codes', (_req: Request, res: Response) => {
    return res.json({
      success: true,
      count: LEGAL_PENAL_CODES_CATALOG.length,
      data: LEGAL_PENAL_CODES_CATALOG,
    });
  });

  // 2. GET /api/ner/penal-codes/lookup
  router.get('/penal-codes/lookup', (req: Request, res: Response) => {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).json({ error: 'Code parameter is required' });
    }
    const result = lookupPenalCode(code);
    if (!result) {
      return res.status(404).json({ error: `Penal section '${code}' not found in catalog` });
    }
    return res.json({ success: true, data: result });
  });

  // 3. GET /api/ner/documents/:caseId
  router.get('/documents/:caseId', (req: Request, res: Response) => {
    const caseId = String(req.params.caseId || '');
    const docs = memoryDocuments.filter(d => d.caseId.toLowerCase() === caseId.toLowerCase() || caseId === 'all' || caseId === 'CASE-2026-DT01');
    return res.json({
      success: true,
      count: docs.length,
      data: docs.length > 0 ? docs : memoryDocuments,
    });
  });

  // 4. POST /api/ner/extract-document
  router.post('/extract-document', async (req: Request, res: Response) => {
    const { rawText, text, documentId, caseId = 'CASE-2026-DT01', documentTitle, documentType = 'FIR' } = req.body;
    const content = rawText || text;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Document text is required' });
    }

    const docId = documentId || `DOC-CUSTOM-${Date.now()}`;
    const title = documentTitle || `Investigative Document (${new Date().toLocaleDateString()})`;

    try {
      const extracted = await extractEntitiesWithLLM(content, {
        documentId: docId,
        caseId: String(caseId),
        documentTitle: title,
        documentType,
      });

      // Update or add document in memory store
      const existingIdx = memoryDocuments.findIndex(d => d.id === docId);
      const newDoc: NERDocument = {
        id: docId,
        caseId: String(caseId),
        title,
        documentType,
        rawText: content,
        processedDate: new Date().toISOString(),
        entitiesCount: extracted.length,
        penalCodesCount: extracted.filter(e => e.entityType === 'PENAL_CODE').length,
        entities: extracted,
      };

      if (existingIdx >= 0) {
        memoryDocuments[existingIdx] = newDoc;
      } else {
        memoryDocuments.unshift(newDoc);
      }

      // Remove older extracted entities for this doc and push new ones
      memoryEntities = memoryEntities.filter(e => e.documentId !== docId).concat(extracted);

      return res.json({
        success: true,
        document: newDoc,
        entities: extracted,
        summary: {
          totalEntities: extracted.length,
          personsCount: extracted.filter(e => e.entityType === 'PERSON' || e.entityType === 'ALIAS').length,
          penalCodesCount: extracted.filter(e => e.entityType === 'PENAL_CODE').length,
          locationsCount: extracted.filter(e => e.entityType === 'LOCATION').length,
          weaponsVehiclesCount: extracted.filter(e => e.entityType === 'WEAPON' || e.entityType === 'VEHICLE').length,
        },
      });
    } catch (err: any) {
      console.error('[NER Route] Error in extract-document:', err);
      return res.status(500).json({ error: err.message || 'Failed to extract entities' });
    }
  });

  // 5. POST /api/ner/resolve-aliases/:caseId
  router.post('/resolve-aliases/:caseId', async (req: Request, res: Response) => {
    const caseId = String(req.params.caseId || '');

    try {
      const caseDocs = memoryDocuments.filter(d => d.caseId.toLowerCase() === caseId.toLowerCase() || caseId === 'CASE-2026-DT01');
      const caseEntities = memoryEntities.filter(e => !e.caseId || e.caseId.toLowerCase() === caseId.toLowerCase() || caseId === 'CASE-2026-DT01');
      const caseIdentities = memoryIdentities.filter(i => i.caseId.toLowerCase() === caseId.toLowerCase() || caseId === 'CASE-2026-DT01');

      const resolution = await resolveAliasesForCase(
        caseId,
        caseEntities,
        caseIdentities,
        caseDocs
      );

      memoryCandidates = resolution.candidates;

      return res.json({
        success: true,
        caseId,
        candidatesCount: resolution.candidates.length,
        candidates: resolution.candidates,
        canonicalIdentities: resolution.updatedIdentities,
        stats: {
          highConfidenceMerges: resolution.candidates.filter(c => c.suggestedAction === 'MERGE').length,
          flaggedReview: resolution.candidates.filter(c => c.suggestedAction === 'FLAG_REVIEW').length,
          soundexMatches: resolution.candidates.filter(c => c.soundexMatch).length,
        },
      });
    } catch (err: any) {
      console.error('[NER Route] Error in resolve-aliases:', err);
      return res.status(500).json({ error: err.message || 'Alias resolution pipeline failed' });
    }
  });

  // 6. GET /api/ner/cases/:caseId/canonical-identities
  router.get('/cases/:caseId/canonical-identities', (req: Request, res: Response) => {
    const caseId = String(req.params.caseId || '');
    const identities = memoryIdentities.filter(i => i.caseId.toLowerCase() === caseId.toLowerCase() || caseId === 'CASE-2026-DT01');

    return res.json({
      success: true,
      caseId,
      count: identities.length,
      data: identities.length > 0 ? identities : memoryIdentities,
    });
  });

  // 7. GET /api/ner/cases/:caseId/candidates
  router.get('/cases/:caseId/candidates', async (req: Request, res: Response) => {
    const caseId = String(req.params.caseId || '');
    if (memoryCandidates.length === 0) {
      const resolution = await resolveAliasesForCase(caseId, memoryEntities, memoryIdentities, memoryDocuments);
      memoryCandidates = resolution.candidates;
    }
    return res.json({
      success: true,
      count: memoryCandidates.length,
      data: memoryCandidates,
    });
  });

  // 8. POST /api/ner/alias-mapping/approve
  router.post('/alias-mapping/approve', (req: Request, res: Response) => {
    const { candidateId, action = 'APPROVE', canonicalIdentityId, aliasName } = req.body;

    const candIndex = memoryCandidates.findIndex(c => c.id === candidateId);
    let targetIdentityId = canonicalIdentityId;
    let targetAliasName = aliasName;

    if (candIndex >= 0) {
      const cand = memoryCandidates[candIndex];
      targetIdentityId = targetIdentityId || cand.targetIdentity.id;
      targetAliasName = targetAliasName || cand.sourceEntity.textValue;
      cand.status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    }

    if (action === 'APPROVE' && targetIdentityId && targetAliasName) {
      const identity = memoryIdentities.find(i => i.id === targetIdentityId);
      if (identity) {
        if (!identity.aliases) identity.aliases = [];
        const exists = identity.aliases.some(a => a.aliasName.toLowerCase() === targetAliasName.toLowerCase());
        if (!exists) {
          identity.aliases.push({
            mappingId: `map-dyn-${Date.now()}`,
            extractedEntityId: candIndex >= 0 ? memoryCandidates[candIndex].sourceEntity.id : `ent-dyn-${Date.now()}`,
            aliasName: targetAliasName,
            documentId: candIndex >= 0 ? memoryCandidates[candIndex].sourceEntity.documentId : 'MANUAL_OVERRIDE',
            resolutionMethod: candIndex >= 0 ? (memoryCandidates[candIndex].matchType.includes('LLM') ? 'AUTOMATIC_LLM' : 'AUTOMATIC_FUZZY') : 'MANUAL_OVERRIDE',
            confidence: candIndex >= 0 ? memoryCandidates[candIndex].overallConfidence / 100 : 1.0,
            isApproved: true,
            reasoning: candIndex >= 0 ? memoryCandidates[candIndex].llmDisambiguationReasoning : 'Investigator manual approval.',
          });
        }
      }
    }

    return res.json({
      success: true,
      status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      candidateId,
      canonicalIdentities: memoryIdentities,
    });
  });

  // 9. POST /api/ner/merge-identities
  router.post('/merge-identities', (req: Request, res: Response) => {
    const { sourceIdentityId, targetIdentityId } = req.body;

    if (!sourceIdentityId || !targetIdentityId || sourceIdentityId === targetIdentityId) {
      return res.status(400).json({ error: 'Valid distinct source and target identity IDs are required' });
    }

    const sourceIdx = memoryIdentities.findIndex(i => i.id === sourceIdentityId);
    const targetIdx = memoryIdentities.findIndex(i => i.id === targetIdentityId);

    if (sourceIdx < 0 || targetIdx < 0) {
      return res.status(404).json({ error: 'One or both identities not found' });
    }

    const source = memoryIdentities[sourceIdx];
    const target = memoryIdentities[targetIdx];

    // Merge aliases
    if (!target.aliases) target.aliases = [];
    // Add source primary name as an alias of target
    target.aliases.push({
      mappingId: `map-merge-${Date.now()}`,
      extractedEntityId: `ent-${source.id}`,
      aliasName: source.primaryName,
      documentId: 'MANUAL_MERGE',
      resolutionMethod: 'MANUAL_OVERRIDE',
      confidence: 1.0,
      isApproved: true,
      reasoning: `Manual master identity merge by Lead Investigator. Absorbed profile ${source.id}.`,
    });

    if (source.aliases) {
      for (const al of source.aliases) {
        if (!target.aliases.some(a => a.aliasName.toLowerCase() === al.aliasName.toLowerCase())) {
          target.aliases.push(al);
        }
      }
    }

    // Merge charges
    const chargesSet = new Set([...(target.penalCharges || []), ...(source.penalCharges || [])]);
    target.penalCharges = Array.from(chargesSet);
    target.penalCodeDetails = target.penalCharges.map(c => lookupPenalCode(c)!).filter(Boolean);

    // Merge citations
    if (source.citations) {
      target.citations = [...(target.citations || []), ...source.citations];
    }

    // Remove source from list
    memoryIdentities.splice(sourceIdx, 1);

    return res.json({
      success: true,
      mergedIdentity: target,
      remainingCount: memoryIdentities.length,
      canonicalIdentities: memoryIdentities,
    });
  });

  // 10. POST /api/ner/split-identity
  router.post('/split-identity', (req: Request, res: Response) => {
    const { canonicalIdentityId, aliasName, mappingId, createNewIdentity = true } = req.body;

    const identity = memoryIdentities.find(i => i.id === canonicalIdentityId);
    if (!identity || !identity.aliases) {
      return res.status(404).json({ error: 'Canonical identity not found or has no aliases' });
    }

    const aliasIdx = identity.aliases.findIndex(a => a.mappingId === mappingId || a.aliasName.toLowerCase() === (aliasName || '').toLowerCase());
    if (aliasIdx < 0) {
      return res.status(404).json({ error: 'Alias mention not found on this identity' });
    }

    const removedAlias = identity.aliases.splice(aliasIdx, 1)[0];

    let newIdentity: CanonicalIdentity | null = null;
    if (createNewIdentity) {
      newIdentity = {
        id: `CAN-SPLIT-${Date.now()}`,
        caseId: identity.caseId,
        primaryName: removedAlias.aliasName,
        type: 'SUSPECT',
        riskScore: 50.0,
        notes: `Extracted via alias unlinking from master record ${identity.primaryName}. Requires separate inquiry.`,
        penalCharges: [],
        penalCodeDetails: [],
        aliases: [],
        citations: [],
        coOccurrenceSummary: {
          sharedPhoneNumbers: [],
          associatedLocations: [],
          knownAssociates: [],
        },
      };
      memoryIdentities.push(newIdentity);
    }

    return res.json({
      success: true,
      unlinkedAlias: removedAlias,
      newIdentity,
      canonicalIdentities: memoryIdentities,
    });
  });

  // 11. POST /api/ner/reset-case
  router.post('/reset-case', (_req: Request, res: Response) => {
    memoryDocuments = JSON.parse(JSON.stringify(INITIAL_LEGAL_DOCUMENTS));
    memoryIdentities = JSON.parse(JSON.stringify(INITIAL_CANONICAL_IDENTITIES));
    initEntities();
    memoryCandidates = [];

    return res.json({
      success: true,
      message: 'NER case data reset to forensic baseline',
      documentsCount: memoryDocuments.length,
      identitiesCount: memoryIdentities.length,
    });
  });

  return router;
}
