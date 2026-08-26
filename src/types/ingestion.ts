export type DocumentLanguage = 'en' | 'hi' | 'mr' | 'auto';

export interface OCRBoundingBox {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  text: string;
  confidence: number;
  fieldType?: 'FIR_NUMBER' | 'POLICE_STATION' | 'SECTIONS' | 'COMPLAINANT' | 'ACCUSED' | 'DATE_TIME' | 'LOCATION' | 'RECOVERED_ITEMS' | 'OFFICER' | 'GENERAL';
}

export interface StructuredFIRFields {
  firNumber?: string;
  policeStation?: string;
  district?: string;
  actsAndSections?: string[];
  complainantName?: string;
  accusedNames?: string[];
  victimName?: string;
  dateOfOccurrence?: string;
  timeOfOccurrence?: string;
  placeOfOccurrence?: string;
  recoveredItems?: string[];
  investigatingOfficer?: string;
  officerBadge?: string;
  chargesheetStatus?: string;
}

export interface OCRDocument {
  id: string;
  caseId: string;
  title: string;
  documentType: 'FIR' | 'PANCHNAMA' | 'POLICE_DIARY' | 'AUTOPSY' | 'FORENSIC_REPORT' | 'OTHER';
  fileUrl: string;
  fileType: string;
  fileSizeKb: number;
  uploadedAt: string;
  processedAt?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  language: DocumentLanguage;
  ocrConfidence: number;
  rawText: string;
  boundingBoxes: OCRBoundingBox[];
  structuredFields: StructuredFIRFields;
  isHandwritten: boolean;
  pageCount: number;
  evidenceIdRef?: string;
}

// -------------------------------------------------------------
// 2. Structured Records Types (CDRs & Financial Logs)
// -------------------------------------------------------------

export type RecordCategory = 'CDR' | 'IPDR' | 'BANK_STATEMENT' | 'UPI_LOG' | 'HAWALA_CRYPTO';

export interface ColumnMapping {
  standardField: string;
  sourceColumn: string;
  confidence: number;
}

export interface FinancialTransactionRecord {
  id: string;
  transactionId: string;
  timestamp: string;
  accountNumber: string;
  senderName: string;
  receiverName: string;
  receiverAccount: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT' | 'UPI_TRANSFER' | 'CASH_WITHDRAWAL' | 'HAWALA_TOKEN';
  bankOrChannel: string;
  narration?: string;
  isFlaggedSuspicious: boolean;
  suspicionReason?: string;
  anomalyScore?: number; // 0 - 100
}

export interface CDRLogRecord {
  id: string;
  callingNumber: string;
  calledNumber: string;
  timestamp: string;
  durationSeconds: number;
  callType: 'VOICE' | 'SMS' | 'DATA' | 'MISSED';
  imeiCalling?: string;
  imeiCalled?: string;
  cellTowerId?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  isFlaggedSuspicious: boolean;
  suspicionReason?: string;
}

export interface RecordAnomalyAlert {
  id: string;
  type: 'SMURFING_LAYERING' | 'ROUND_TRIPPING' | 'RAPID_FUND_DRAIN' | 'BURST_CALLING' | 'MIDNIGHT_SURGE' | 'TOWER_CONVERGENCE' | 'SUSPICIOUS_TOKEN';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  involvedEntities: string[];
  timestampRange?: string;
  totalVolumeOrFrequency?: string;
  recommendedAction: string;
}

export interface IngestedDatasetSummary {
  id: string;
  caseId: string;
  datasetName: string;
  category: RecordCategory;
  recordCount: number;
  uploadDate: string;
  totalVolumeAmount?: number;
  flaggedCount: number;
  anomalies: RecordAnomalyAlert[];
  records: (FinancialTransactionRecord | CDRLogRecord)[];
  schemaMappings: ColumnMapping[];
}

// -------------------------------------------------------------
// 3. OSINT & Social Media Connector Types
// -------------------------------------------------------------

export type OSINTPlatform = 'TWITTER_X' | 'TELEGRAM' | 'REDDIT' | 'WHOIS' | 'MCA_REGISTRY' | 'VAHAN_VEHICLE' | 'DARKWEB_PASTE';

export interface OSINTProvenanceMetadata {
  sha256Hash: string;
  originUrl: string;
  ipAddress: string;
  captureTimestamp: string;
  examinerId: string;
  examinerBadge: string;
  rfc3161TimestampProof: string;
  digitalSignature: string;
  chainOfCustodyStatus: 'VERIFIED' | 'TAMPER_PROOF' | 'UNVERIFIED';
}

export interface OSINTFindingItem {
  id: string;
  platform: OSINTPlatform;
  targetQuery: string;
  authorHandle: string;
  authorDisplayName?: string;
  avatarUrl?: string;
  postContent: string;
  publishedAt: string;
  capturedAt: string;
  sourceUrl: string;
  sentiment: 'THREAT' | 'SUSPICIOUS' | 'HOSTILE' | 'NEUTRAL' | 'CRUCIAL_LEAD';
  threatScore: number; // 0 - 100
  geoTag?: string;
  associatedEntities: {
    handles?: string[];
    phoneNumbers?: string[];
    cryptoWallets?: string[];
    organizations?: string[];
    hashtags?: string[];
  };
  provenance: OSINTProvenanceMetadata;
}

export interface Section65BCertificate {
  certificateId: string;
  caseId: string;
  caseTitle: string;
  targetQuery: string;
  evidenceItemId: string;
  generatedDate: string;
  certifyingOfficer: {
    name: string;
    designation: string;
    badgeNumber: string;
    policeStation: string;
  };
  technicalDetails: {
    systemHostname: string;
    ipAddress: string;
    osVersion: string;
    captureHashSHA256: string;
    rfc3161TimeStamp: string;
    storageMediaType: string;
  };
  legalDeclaration: string;
  digitalSealBase64: string;
}
