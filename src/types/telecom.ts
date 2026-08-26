export interface CDRRecord {
  id: string;
  datasetId: string;
  callingNumber: string;
  calledNumber: string;
  imeiCalling?: string | null;
  imeiCalled?: string | null;
  timestamp: string;
  durationSeconds: number;
  callType: 'VOICE' | 'SMS' | 'DATA' | 'ROAMING' | 'MISSED' | string;
  cellTowerId?: string | null;
  lac?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  azimuth?: number | null;
  firstLocation?: string | null;
  lastLocation?: string | null;
}

export interface CDRDataset {
  id: string;
  caseId: string;
  fileName: string;
  operatorName: string;
  recordCount: number;
  targetNumber?: string;
  uploadDate: string;
  _count?: {
    records: number;
  };
}

export interface ColumnMapping {
  callingNumber: string;
  calledNumber: string;
  timestamp: string;
  durationSeconds?: string;
  callType?: string;
  cellTowerId?: string;
  lac?: string;
  latitude?: string;
  longitude?: string;
  azimuth?: string;
  imeiCalling?: string;
  imeiCalled?: string;
  firstLocation?: string;
  lastLocation?: string;
}

export interface UploadPreviewResponse {
  success: boolean;
  fileName: string;
  detectedOperator: string;
  headers: string[];
  previewRows: Record<string, any>[];
  suggestedMapping: Partial<ColumnMapping>;
  totalRowsEst: number;
}

export interface CDRAnalytics {
  totalRecords: number;
  uniqueCallers: number;
  uniqueReceivers: number;
  totalUniqueNumbers: number;
  totalDurationSeconds: number;
  avgDurationSeconds: number;
  callTypeBreakdown: Record<string, number>;
  hourlyBurstData: {
    hour: string;
    hourNum: number;
    calls: number;
    duration: number;
    voice: number;
    sms: number;
    data: number;
    nightOwl: boolean;
  }[];
  topContactedNumbers: {
    number: string;
    totalCalls: number;
    inCalls: number;
    outCalls: number;
    totalDuration: number;
  }[];
  frequentPairs: {
    calling: string;
    called: string;
    count: number;
    totalDuration: number;
    types: Record<string, number>;
  }[];
  shortBurstCalls: number;
  nightCallsCount: number;
  nightCallRatio: number;
  dateRange: {
    start: string | null;
    end: string | null;
  };
  cellTowerPingsCount: number;
}

export interface NetworkNode {
  id: string;
  phoneNumber: string;
  name: string;
  role: string;
  riskScore: number;
  alias?: string;
  avatar?: string;
  isSuspect: boolean;
  totalCalls: number;
  inCalls: number;
  outCalls: number;
  totalDuration: number;
  degreeCentrality: number;
  betweennessCentrality: number;
  eigenScore: number;
  associatedIMEIs: string[];
  towersUsed: string[];
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface NetworkLink {
  id: string;
  source: string | NetworkNode;
  target: string | NetworkNode;
  weight: number;
  callCount: number;
  totalDuration: number;
  callTypes: Record<string, number>;
  isBidirectional: boolean;
  lastContact: string;
}

export interface NetworkGraphData {
  nodes: NetworkNode[];
  links: NetworkLink[];
  totalNodes: number;
  totalLinks: number;
  bridgeNodes: NetworkNode[];
  highFrequencyLinks: NetworkLink[];
}

export interface CoOccurrenceEvent {
  id: string;
  timestampA: string;
  timestampB: string;
  timeDeltaMinutes: number;
  cellTowerId: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  phoneA: string;
  phoneB: string;
  suspectAName?: string;
  suspectBName?: string;
  riskSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  reason: string;
  callTypeA: string;
  callTypeB: string;
}

export interface TelecomAnomaly {
  category: 'BURNER_PHONE' | 'CO_PRESENCE' | 'RADIO_SILENCE' | 'MIDNIGHT_SPIKE' | 'BRIDGE_NODE';
  title: string;
  description: string;
  confidence: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  involvedEntities: string[];
}

export interface AITelecomInsightsResponse {
  summary: string;
  criticalAnomalies: TelecomAnomaly[];
  tacticalRecommendations: string[];
}

export interface MasterCellTower {
  towerId: string;
  operator: string;
  locationName: string;
  latitude: number;
  longitude: number;
  azimuth?: number;
  rangeMeters?: number;
}

export interface SampleTemplateInfo {
  name: string;
  operator: string;
  description: string;
  csvText: string;
}
