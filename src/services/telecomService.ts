import {
  CDRDataset,
  CDRRecord,
  CDRAnalytics,
  NetworkGraphData,
  CoOccurrenceEvent,
  AITelecomInsightsResponse,
  UploadPreviewResponse,
  ColumnMapping,
  MasterCellTower,
  SampleTemplateInfo,
} from '../types/telecom';

const API_BASE = '/api/cdr';

export async function getSampleTemplates(): Promise<{
  templates: Record<string, SampleTemplateInfo>;
  cellTowers: MasterCellTower[];
}> {
  const res = await fetch(`${API_BASE}/sample-templates`);
  if (!res.ok) throw new Error('Failed to fetch sample templates');
  return res.json();
}

export async function uploadPreview(payload: {
  fileContent?: string;
  fileBase64?: string;
  fileName: string;
}): Promise<UploadPreviewResponse> {
  const res = await fetch(`${API_BASE}/upload-preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to upload preview');
  }
  return res.json();
}

export async function ingestCDR(payload: {
  caseId: string;
  fileName: string;
  operatorName: string;
  targetNumber?: string;
  mapping: ColumnMapping;
  fileContent?: string;
  fileBase64?: string;
  rawRows?: Record<string, any>[];
}): Promise<{
  success: boolean;
  datasetId: string;
  recordCount: number;
  dataset: CDRDataset;
}> {
  const res = await fetch(`${API_BASE}/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to ingest CDR records');
  }
  return res.json();
}

export async function getCaseDatasets(caseId: string): Promise<CDRDataset[]> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/datasets`);
  if (!res.ok) throw new Error('Failed to fetch case datasets');
  return res.json();
}

export async function getCaseRecords(
  caseId: string,
  params: { datasetId?: string; search?: string; callType?: string; page?: number; limit?: number } = {}
): Promise<{
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  records: CDRRecord[];
}> {
  const query = new URLSearchParams();
  if (params.datasetId) query.set('datasetId', params.datasetId);
  if (params.search) query.set('search', params.search);
  if (params.callType && params.callType !== 'ALL') query.set('callType', params.callType);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const res = await fetch(`${API_BASE}/cases/${caseId}/records?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch case CDR records');
  return res.json();
}

export async function getCaseAnalytics(caseId: string, datasetId?: string): Promise<CDRAnalytics> {
  const query = datasetId ? `?datasetId=${encodeURIComponent(datasetId)}` : '';
  const res = await fetch(`${API_BASE}/cases/${caseId}/analytics${query}`);
  if (!res.ok) throw new Error('Failed to fetch case CDR analytics');
  return res.json();
}

export async function getCaseNetworkGraph(
  caseId: string,
  params: { datasetId?: string; minWeight?: number; callType?: string } = {}
): Promise<NetworkGraphData> {
  const query = new URLSearchParams();
  if (params.datasetId) query.set('datasetId', params.datasetId);
  if (params.minWeight) query.set('minWeight', String(params.minWeight));
  if (params.callType && params.callType !== 'ALL') query.set('callType', params.callType);

  const res = await fetch(`${API_BASE}/cases/${caseId}/network-graph?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch network graph');
  return res.json();
}

export async function getCoOccurrences(
  caseId: string,
  timeWindowMinutes = 15,
  datasetId?: string
): Promise<{
  totalEvents: number;
  timeWindowMinutes: number;
  coOccurrences: CoOccurrenceEvent[];
}> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/co-occurrence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timeWindowMinutes, datasetId }),
  });
  if (!res.ok) throw new Error('Failed to compute co-occurrences');
  return res.json();
}

export async function getAITelecomInsights(
  caseId: string,
  datasetId?: string
): Promise<AITelecomInsightsResponse> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/ai-insights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ datasetId }),
  });
  if (!res.ok) throw new Error('Failed to generate AI telecom insights');
  return res.json();
}

export async function syncSuspectMapping(
  caseId: string,
  payload: {
    phoneNumber: string;
    name: string;
    role?: string;
    riskScore?: number;
    alias?: string;
    avatar?: string;
    imei?: string;
  }
): Promise<{ success: boolean; mapping: any }> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/sync-suspect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to sync suspect');
  return res.json();
}

export async function syncToDossier(
  caseId: string,
  payload: {
    title: string;
    description: string;
    category?: string;
    timestamp?: string;
    confidence?: number;
  }
): Promise<{ success: boolean; message: string; timelineEvent: any }> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/sync-dossier`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to sync to dossier');
  return res.json();
}
