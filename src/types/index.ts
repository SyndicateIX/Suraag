export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
}

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  status: 'ACTIVE' | 'CRITICAL' | 'ARCHIVED' | 'PENDING_AUDIT' | string;
  priority: 'CRITICAL' | 'HIGH' | 'ROUTINE' | string;
  assignedTo: string;
  location: string;
  incidentDate: string | Date;
  summary: string;
  confidenceScore: number;
}

export interface Evidence {
  id: string;
  caseId: string;
  title: string;
  category: 'WEAPON' | 'BLOOD' | 'FOOTPRINT' | 'VEHICLE' | 'PHONE' | 'FINGERPRINT' | 'BALLISTICS' | 'CCTV' | 'DOCUMENT' | string;
  fileUrl: string;
  fileType: string;
  confidence: number;
  boundingBoxes?: BoundingBox[];
  processedStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | string;
  metadata?: Record<string, any>;
  createdAt?: string | Date;
}

export interface WitnessStatement {
  id: string;
  caseId: string;
  witnessName: string;
  role?: string;
  statementDate: string | Date;
  statementText: string;
  aiExtraction?: {
    entities: string[];
    locationClaims: string[];
    timelineClaims: string[];
    normalizedEntities?: {
      people?: string[];
      locations?: string[];
      organizations?: string[];
      evidenceAndObjects?: string[];
      timestampsAndEvents?: string[];
    };
  };
  credibilityScore: number;
  attemptPhase?: string;
  corroboratedEvents?: Array<{
    eventId: string;
    title: string;
    timestamp: string;
    corroborationDetails: string;
  }>;
  supportingEvidenceIds?: string[];
  contradictions?: Array<{
    target: string;
    reason: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  }>;
}

export interface Suspect {
  id: string;
  caseId: string;
  name: string;
  alias?: string;
  riskScore: number;
  probability: number;
  criminalHistory?: string[];
  phone?: string;
  gpsCoordinates?: Array<{ time: string; lat: number; lng: number }>;
  linkedEvidenceIds?: string[];
  aiReasoning?: string;
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  timestamp: string;
  title: string;
  description: string;
  category: 'AUDIO' | 'CCTV' | 'BALLISTICS' | 'WITNESS' | 'VEHICLE' | 'NETWORK' | 'PLANNING' | string;
  confidence: number;
  aiReasoning?: string;
  supportingEvidenceIds?: string[];
  // Extracted report fields
  entities?: {
    persons?: string[];
    locations?: string[];
    objects?: string[];
    vehicles?: string[];
  };
  relationships?: {
    suspects?: string[];
    witnesses?: string[];
    victim?: string;
    relationshipType?: string;
  };
  attemptGroup?: string;
  alibiClaim?: string;
  forensicRefutation?: string;
  linkedWitnessIds?: string[];
}


export interface Scenario {
  id: string;
  name: string;
  probability: number;
  description: string;
  evidenceCount: number;
}

export interface ReconstructionData {
  id?: string;
  caseId: string;
  attackerPosition: { x: number; y: number; z: number };
  victimPosition: { x: number; y: number; z: number };
  attackDirection: string;
  weaponAngle: string;
  lineOfSight: {
    visibilityScore: number;
    occludedBy: string[];
  };
  physicsResults: {
    bulletTrajectory: {
      start: [number, number, number];
      impact: [number, number, number];
      velocityMps: number;
      caliber: string;
      ricochetAngle?: number;
      kineticEnergyJoules?: number;
    };
    bloodSpatter: {
      origin: [number, number, number];
      dropletCount: number;
      patternType: string;
      ellipsoidRatio?: number;
    };
  };
  scenarios: Scenario[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  confidence?: number;
}

export interface SimulationState {
  isPlaying: boolean;
  currentTime: number;
  playbackSpeed: number;
  selectedEvidenceId: string | null;
  cameraPreset: 'TOP' | 'ISOMETRIC' | 'FRONT' | 'FREE' | 'BULLET_CAM';
  lightingMode: 'NORMAL' | 'UV' | 'INFRARED' | 'WIREFRAME';
  showMeasurements: boolean;
  showVisibilityCone: boolean;
}
