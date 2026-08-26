import {
  OCRDocument,
  IngestedDatasetSummary,
  FinancialTransactionRecord,
  CDRLogRecord,
  RecordAnomalyAlert,
  OSINTFindingItem,
  Section65BCertificate,
  OSINTPlatform,
  RecordCategory,
} from '../types/ingestion';

const BASE_URL = '/api/ingestion';

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Ingestion API Error: ${res.statusText}`);
  }
  return res.json();
}

export const ingestionService = {
  // 1. OCR Digitization
  getOCRSamples: async (caseId?: string): Promise<OCRDocument[]> => {
    try {
      const res = await fetchJSON<{ success: boolean; data: OCRDocument[] }>(
        `/ocr/samples${caseId ? `?caseId=${caseId}` : ''}`
      );
      return res.data;
    } catch (e) {
      console.warn('Using fallback OCR samples:', e);
      return [];
    }
  },

  processDocumentOCR: async (payload: {
    caseId?: string;
    title?: string;
    documentType?: string;
    fileUrl?: string;
    rawText?: string;
    language?: string;
    isHandwritten?: boolean;
  }): Promise<OCRDocument> => {
    const res = await fetchJSON<{ success: boolean; data: OCRDocument }>('/ocr/process', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  // 2. Structured Records (CDRs & Financial)
  getRecordSamples: async (): Promise<{
    summary: IngestedDatasetSummary;
    financialRecords: FinancialTransactionRecord[];
    cdrRecords: CDRLogRecord[];
    anomalies: RecordAnomalyAlert[];
  }> => {
    const res = await fetchJSON<{
      success: boolean;
      data: IngestedDatasetSummary;
      financialRecords: FinancialTransactionRecord[];
      cdrRecords: CDRLogRecord[];
      anomalies: RecordAnomalyAlert[];
    }>('/records/samples');
    return {
      summary: res.data,
      financialRecords: res.financialRecords,
      cdrRecords: res.cdrRecords,
      anomalies: res.anomalies,
    };
  },

  validateAndImportRecords: async (payload: {
    caseId?: string;
    datasetName?: string;
    category?: RecordCategory;
    rawRecords?: any[];
    columnMappings?: any[];
  }): Promise<{
    success: boolean;
    message: string;
    dataset: IngestedDatasetSummary;
  }> => {
    return fetchJSON('/records/validate-and-import', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // 3. OSINT & Social Connectors
  getOSINTSamples: async (): Promise<OSINTFindingItem[]> => {
    const res = await fetchJSON<{ success: boolean; data: OSINTFindingItem[] }>('/osint/samples');
    return res.data;
  },

  queryOSINT: async (payload: {
    platform: OSINTPlatform;
    query: string;
    caseId?: string;
  }): Promise<{
    success: boolean;
    query: string;
    platform: OSINTPlatform;
    provenanceHash: string;
    timestamp: string;
    count: number;
    data: OSINTFindingItem[];
  }> => {
    return fetchJSON('/osint/query', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  generateSection65BCertificate: async (payload: {
    findingId?: string;
    caseId?: string;
    caseTitle?: string;
    targetQuery?: string;
    officerName?: string;
    officerBadge?: string;
    policeStation?: string;
  }): Promise<Section65BCertificate> => {
    const res = await fetchJSON<{ success: boolean; certificate: Section65BCertificate }>(
      '/osint/provenance/certificate',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return res.certificate;
  },
};
