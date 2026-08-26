import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  parseTelecomFilePreview,
  parseEntireTelecomFile,
  autoDetectColumnMappings,
  transformRawRowsToRecords,
  calculateCDRAnalytics,
  generateNetworkTopology,
  findSpatialTemporalCoOccurrences,
  generateAITelecomInsights,
  ColumnMapping,
  IngestedCDRRecord,
  SuspectMapping,
} from '../services/cdrService.js';
import {
  PRELOADED_TELECOM_DATASETS,
  INITIAL_SUSPECT_MAPPINGS,
  SAMPLE_CSV_DATASETS,
  MASTER_CELL_TOWERS,
  MockTelecomDataset,
} from '../data/telecomMockData.js';

export function createCDRRouter(prisma: PrismaClient | any) {
  const router = Router();

  // In-memory runtime state for datasets and suspect mappings
  let memoryDatasets: MockTelecomDataset[] = [...PRELOADED_TELECOM_DATASETS];
  let memorySuspectMappings: Record<string, Record<string, SuspectMapping>> = { ...INITIAL_SUSPECT_MAPPINGS };

  // Helper to retrieve records for a case
  const getRecordsForCase = async (caseId: string, datasetId?: string): Promise<IngestedCDRRecord[]> => {
    let records: IngestedCDRRecord[] = [];

    // Try Prisma DB first
    if (prisma && prisma.cDRRecord) {
      try {
        const whereClause: any = {};
        if (datasetId) {
          whereClause.datasetId = datasetId;
        } else {
          whereClause.dataset = { caseId };
        }
        const dbRecords = await prisma.cDRRecord.findMany({
          where: whereClause,
          orderBy: { timestamp: 'asc' },
        });
        if (dbRecords && dbRecords.length > 0) {
          records = dbRecords.map((r: any) => ({
            id: r.id,
            datasetId: r.datasetId,
            callingNumber: r.callingNumber,
            calledNumber: r.calledNumber,
            imeiCalling: r.imeiCalling,
            imeiCalled: r.imeiCalled,
            timestamp: r.timestamp instanceof Date ? r.timestamp.toISOString() : String(r.timestamp),
            durationSeconds: r.durationSeconds || 0,
            callType: r.callType || 'VOICE',
            cellTowerId: r.cellTowerId,
            lac: r.lac,
            latitude: r.latitude,
            longitude: r.longitude,
            azimuth: r.azimuth,
            firstLocation: r.firstLocation,
            lastLocation: r.lastLocation,
          }));
        }
      } catch (err) {
        // Fallback to memory
      }
    }

    // If no DB records, fallback to memory
    if (records.length === 0) {
      const caseDatasets = memoryDatasets.filter(
        d => d.caseId === caseId || (caseId.startsWith('case-dt') && d.caseId.startsWith('case-dt')) || (caseId === 'case-1' && d.caseId === 'case-1')
      );
      if (datasetId) {
        const target = caseDatasets.find(d => d.id === datasetId);
        if (target) records = target.records;
      } else {
        records = caseDatasets.flatMap(d => d.records);
      }

      // If still empty and looking for any case, provide preloaded Doomed Triangle dataset for demo
      if (records.length === 0 && memoryDatasets.length > 0) {
        records = memoryDatasets[0].records;
      }
    }

    return records;
  };

  // Helper for suspect mappings
  const getSuspectMappings = async (caseId: string): Promise<Record<string, SuspectMapping>> => {
    let mapping: Record<string, SuspectMapping> = {};

    // Get from memory
    const mem = memorySuspectMappings[caseId] || memorySuspectMappings['case-dt01'] || {};
    mapping = { ...mem };

    // Supplement with Prisma suspects if available
    if (prisma && prisma.suspect) {
      try {
        const suspects = await prisma.suspect.findMany({
          where: { caseId },
        });
        suspects.forEach((s: any) => {
          if (s.phone) {
            mapping[s.phone] = {
              phoneNumber: s.phone,
              suspectId: s.id,
              ownerName: s.name,
              role: s.alias || 'SUSPECT',
              riskScore: s.riskScore || 80,
              alias: s.alias,
            };
          }
        });
      } catch (err) {
        // Ignore
      }
    }

    return mapping;
  };

  // ----------------------------------------------------
  // 1. SAMPLE TEMPLATES & MASTER TOWERS
  // ----------------------------------------------------
  router.get('/sample-templates', (req: Request, res: Response) => {
    return res.json({
      templates: SAMPLE_CSV_DATASETS,
      cellTowers: MASTER_CELL_TOWERS,
    });
  });

  // ----------------------------------------------------
  // 2. UPLOAD PREVIEW & COLUMN AUTO-MAPPING
  // ----------------------------------------------------
  router.post('/upload-preview', (req: Request, res: Response) => {
    try {
      const { fileContent, fileName = 'telecom_data.csv', fileBase64 } = req.body;

      let content = fileContent;
      if (!content && fileBase64) {
        content = Buffer.from(fileBase64, 'base64');
      }

      if (!content) {
        return res.status(400).json({ error: 'No file content or fileBase64 provided.' });
      }

      const preview = parseTelecomFilePreview(content, fileName);
      const suggestedMapping = autoDetectColumnMappings(preview.headers);

      return res.json({
        success: true,
        fileName,
        detectedOperator: preview.detectedOperator,
        headers: preview.headers,
        previewRows: preview.previewRows,
        suggestedMapping,
        totalRowsEst: preview.totalRowsEst,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to parse file preview', details: err.message });
    }
  });

  // ----------------------------------------------------
  // 3. INGEST CDR RECORDS
  // ----------------------------------------------------
  router.post('/ingest', async (req: Request, res: Response) => {
    try {
      const {
        caseId = 'case-dt01',
        fileName = 'CDR_INGESTED.csv',
        operatorName = 'Bharti Airtel',
        targetNumber = '',
        mapping,
        fileContent,
        fileBase64,
        rawRows,
      } = req.body;

      if (!mapping || !mapping.callingNumber || !mapping.calledNumber || !mapping.timestamp) {
        return res.status(400).json({
          error: 'Invalid column mapping. callingNumber, calledNumber, and timestamp are required.',
        });
      }

      let parsedRows = rawRows;
      if (!parsedRows || !Array.isArray(parsedRows) || parsedRows.length === 0) {
        let content = fileContent;
        if (!content && fileBase64) {
          content = Buffer.from(fileBase64, 'base64');
        }
        if (!content) {
          return res.status(400).json({ error: 'No data rows or file content provided for ingestion.' });
        }
        parsedRows = parseEntireTelecomFile(content, fileName);
      }

      const datasetId = `ds-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const normalizedRecords = transformRawRowsToRecords(parsedRows, datasetId, mapping as ColumnMapping);

      if (normalizedRecords.length === 0) {
        return res.status(400).json({ error: 'No valid CDR records could be extracted with the provided mapping.' });
      }

      // Persist to Prisma DB if available
      let persistedToDb = false;
      if (prisma && prisma.cDRDataset && prisma.cDRRecord) {
        try {
          await prisma.cDRDataset.create({
            data: {
              id: datasetId,
              caseId,
              fileName,
              operatorName,
              recordCount: normalizedRecords.length,
              targetNumber: targetNumber || null,
              uploadDate: new Date(),
              records: {
                create: normalizedRecords.map(r => ({
                  callingNumber: r.callingNumber,
                  calledNumber: r.calledNumber,
                  imeiCalling: r.imeiCalling || null,
                  imeiCalled: r.imeiCalled || null,
                  timestamp: new Date(r.timestamp),
                  durationSeconds: r.durationSeconds,
                  callType: r.callType,
                  cellTowerId: r.cellTowerId || null,
                  lac: r.lac || null,
                  latitude: r.latitude || null,
                  longitude: r.longitude || null,
                  azimuth: r.azimuth || null,
                  firstLocation: r.firstLocation || null,
                  lastLocation: r.lastLocation || null,
                })),
              },
            },
          });
          persistedToDb = true;
        } catch (dbErr) {
          console.warn('Prisma DB insert failed, saving to memory fallback:', dbErr);
        }
      }

      // Also store in memory
      const newDataset: MockTelecomDataset = {
        id: datasetId,
        caseId,
        fileName,
        operatorName,
        recordCount: normalizedRecords.length,
        targetNumber,
        uploadDate: new Date().toISOString(),
        records: normalizedRecords,
      };
      memoryDatasets.unshift(newDataset);

      return res.json({
        success: true,
        datasetId,
        recordCount: normalizedRecords.length,
        persistedToDb,
        dataset: {
          id: datasetId,
          fileName,
          operatorName,
          recordCount: normalizedRecords.length,
          uploadDate: newDataset.uploadDate,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to ingest CDR records', details: err.message });
    }
  });

  // ----------------------------------------------------
  // 4. GET DATASETS FOR A CASE
  // ----------------------------------------------------
  router.get('/cases/:caseId/datasets', async (req: Request, res: Response) => {
    try {
      const caseId = String(req.params.caseId || '');
      let datasets: any[] = [];

      if (prisma && prisma.cDRDataset) {
        try {
          datasets = await prisma.cDRDataset.findMany({
            where: { caseId },
            include: {
              _count: { select: { records: true } },
            },
            orderBy: { uploadDate: 'desc' },
          });
        } catch (err) {
          // Fallback to memory
        }
      }

      if (datasets.length === 0) {
        const mem = memoryDatasets.filter(
          d => d.caseId === caseId || (caseId.startsWith('case-dt') && d.caseId.startsWith('case-dt')) || (caseId === 'case-1' && d.caseId === 'case-1')
        );
        datasets = mem.map(d => ({
          id: d.id,
          caseId: d.caseId,
          fileName: d.fileName,
          operatorName: d.operatorName,
          recordCount: d.records.length,
          targetNumber: d.targetNumber,
          uploadDate: d.uploadDate,
        }));
        if (datasets.length === 0 && memoryDatasets.length > 0) {
          datasets = [memoryDatasets[0]];
        }
      }

      return res.json(datasets);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch datasets', details: err.message });
    }
  });

  // ----------------------------------------------------
  // 5. GET CDR RECORDS (PAGINATED / FILTERED)
  // ----------------------------------------------------
  router.get('/cases/:caseId/records', async (req: Request, res: Response) => {
    try {
      const caseId = String(req.params.caseId || '');
      const { datasetId, search, callType, page = '1', limit = '50' } = req.query;

      const records = await getRecordsForCase(caseId, datasetId ? String(datasetId) : undefined);

      let filtered = records;
      if (callType && callType !== 'ALL') {
        filtered = filtered.filter(r => r.callType === callType);
      }
      if (search) {
        const q = String(search).toLowerCase();
        filtered = filtered.filter(
          r =>
            r.callingNumber.includes(q) ||
            r.calledNumber.includes(q) ||
            (r.imeiCalling && r.imeiCalling.includes(q)) ||
            (r.cellTowerId && r.cellTowerId.toLowerCase().includes(q))
        );
      }

      const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
      const limitNum = Math.min(200, Math.max(1, parseInt(String(limit), 10) || 50));
      const total = filtered.length;
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedRecords = filtered.slice(startIndex, startIndex + limitNum);

      return res.json({
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        records: paginatedRecords,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch records', details: err.message });
    }
  });

  // ----------------------------------------------------
  // 6. GET CDR ANALYTICS (STATISTICS, FREQUENCIES, BURSTS)
  // ----------------------------------------------------
  router.get('/cases/:caseId/analytics', async (req: Request, res: Response) => {
    try {
      const caseId = String(req.params.caseId || '');
      const { datasetId, targetNumber } = req.query;

      const records = await getRecordsForCase(caseId, datasetId ? String(datasetId) : undefined);
      const analytics = calculateCDRAnalytics(records, targetNumber ? String(targetNumber) : undefined);

      return res.json(analytics);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to calculate analytics', details: err.message });
    }
  });

  // ----------------------------------------------------
  // 7. GET NETWORK GRAPH (NODES, LINKS, CENTRALITY)
  // ----------------------------------------------------
  router.get('/cases/:caseId/network-graph', async (req: Request, res: Response) => {
    try {
      const caseId = String(req.params.caseId || '');
      const { datasetId, minWeight = '1', callType = 'ALL' } = req.query;

      const records = await getRecordsForCase(caseId, datasetId ? String(datasetId) : undefined);
      const suspectMappings = await getSuspectMappings(caseId);

      const graph = generateNetworkTopology(records, suspectMappings, {
        minCallWeight: parseInt(String(minWeight), 10) || 1,
        callTypeFilter: String(callType),
      });

      return res.json(graph);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to generate network graph', details: err.message });
    }
  });

  // ----------------------------------------------------
  // 8. POST CO-OCCURRENCE SEARCH (SPATIAL-TEMPORAL)
  // ----------------------------------------------------
  router.post('/cases/:caseId/co-occurrence', async (req: Request, res: Response) => {
    try {
      const caseId = String(req.params.caseId || '');
      const { timeWindowMinutes = 15, datasetId } = req.body;

      const records = await getRecordsForCase(caseId, datasetId ? String(datasetId) : undefined);
      const suspectMappings = await getSuspectMappings(caseId);

      const coOccurrences = findSpatialTemporalCoOccurrences(
        records,
        Number(timeWindowMinutes) || 15,
        suspectMappings
      );

      return res.json({
        totalEvents: coOccurrences.length,
        timeWindowMinutes: Number(timeWindowMinutes) || 15,
        coOccurrences,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to compute co-occurrences', details: err.message });
    }
  });

  // ----------------------------------------------------
  // 9. POST AI TELECOM INSIGHTS (GEMINI AI + HEURISTICS)
  // ----------------------------------------------------
  router.post('/cases/:caseId/ai-insights', async (req: Request, res: Response) => {
    try {
      const caseId = String(req.params.caseId || '');
      const { datasetId } = req.body;

      const records = await getRecordsForCase(caseId, datasetId ? String(datasetId) : undefined);
      const suspectMappings = await getSuspectMappings(caseId);
      const analytics = calculateCDRAnalytics(records);
      const network = generateNetworkTopology(records, suspectMappings);
      const coOccurrences = findSpatialTemporalCoOccurrences(records, 15, suspectMappings);

      // Get suspects list if available
      let suspectsList: any[] = [];
      if (prisma && prisma.suspect) {
        try {
          suspectsList = await prisma.suspect.findMany({ where: { caseId } });
        } catch (e) {}
      }

      const caseTitle = caseId === 'case-dt01' ? 'The Doomed Triangle' : `Forensic Investigation ${caseId}`;
      const insights = await generateAITelecomInsights(
        caseTitle,
        analytics,
        network,
        coOccurrences,
        suspectsList
      );

      return res.json(insights);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to generate AI insights', details: err.message });
    }
  });

  // ----------------------------------------------------
  // 10. POST SYNC SUSPECT MAPPING
  // ----------------------------------------------------
  router.post('/cases/:caseId/sync-suspect', async (req: Request, res: Response) => {
    try {
      const caseId = String(req.params.caseId || '');
      const { phoneNumber, name, role, riskScore = 80, alias, avatar, imei } = req.body;

      if (!phoneNumber || !name) {
        return res.status(400).json({ error: 'phoneNumber and name are required.' });
      }

      if (!memorySuspectMappings[caseId]) {
        memorySuspectMappings[caseId] = {};
      }

      memorySuspectMappings[caseId][phoneNumber] = {
        phoneNumber,
        ownerName: name,
        role: role || 'SUSPECT',
        riskScore: Number(riskScore) || 80,
        alias: alias || undefined,
        avatar: avatar || undefined,
      };

      // Also create Prisma Suspect / SuspectPhoneMapping if available
      if (prisma && prisma.suspect) {
        try {
          await prisma.suspect.create({
            data: {
              caseId,
              name,
              alias: alias || role || 'Telecom Target',
              phone: phoneNumber,
              riskScore: Number(riskScore) || 80,
              aiReasoning: `Linked from Telecom CDR intelligence: ${phoneNumber} (IMEI: ${imei || 'N/A'})`,
            },
          });
        } catch (dbErr) {
          console.warn('Prisma suspect creation skipped:', dbErr);
        }
      }

      return res.json({
        success: true,
        mapping: memorySuspectMappings[caseId][phoneNumber],
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to sync suspect', details: err.message });
    }
  });

  // ----------------------------------------------------
  // 11. POST SYNC TO DOSSIER & TIMELINE
  // ----------------------------------------------------
  router.post('/cases/:caseId/sync-dossier', async (req: Request, res: Response) => {
    try {
      const caseId = String(req.params.caseId || '');
      const { title, description, category = 'NETWORK', timestamp, confidence = 95.0 } = req.body;

      let timelineEvent: any = null;
      if (prisma && prisma.timelineEvent) {
        try {
          timelineEvent = await prisma.timelineEvent.create({
            data: {
              caseId,
              title: title || 'Telecom CDR Co-presence Anomaly',
              description: description || 'Cell Tower spatial-temporal co-presence detected by Suraag Telecom Engine.',
              category,
              timestamp: timestamp || new Date().toISOString(),
              confidence: Number(confidence) || 95.0,
              aiReasoning: 'Automated extraction from Telecom Metadata Processing Engine.',
            },
          });
        } catch (dbErr) {
          console.warn('TimelineEvent DB creation skipped:', dbErr);
        }
      }

      return res.json({
        success: true,
        message: 'Successfully injected into Case Dossier and Timeline.',
        timelineEvent: timelineEvent || {
          id: `te-cdr-${Date.now()}`,
          caseId,
          title,
          description,
          category,
          timestamp,
          confidence,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to sync to dossier', details: err.message });
    }
  });

  return router;
}
