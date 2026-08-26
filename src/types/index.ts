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
  attemptPhases?: string[];
  correlatedSuspects?: string[];
  evidenceCount?: number;
  timelineEventsCount?: number;
  forensicVerdict?: string;
}


export interface Evidence {
  id: string;
  caseId: string;
  evidenceId?: string;
  title: string;
  category: 'WEAPON' | 'BLOOD' | 'FOOTPRINT' | 'VEHICLE' | 'PHONE' | 'FINGERPRINT' | 'BALLISTICS' | 'CCTV' | 'DOCUMENT' | string;
  fileUrl: string;
  fileType: string;
  confidence: number;
  boundingBoxes?: BoundingBox[];
  processedStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | string;
  attemptPhase?: string;
  eventId?: string;
  forensicObservation?: string;
  entities?: {
    persons?: string[];
    locations?: string[];
    objects?: string[];
    vehicles?: string[];
  };
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
    claim?: string;
    evidenceRefuting?: string[];
    timelineEvents?: string[];
    occlusionDetails?: string;
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
  motive?: string;
  attemptPhases?: string[];
  telemetryLogs?: Array<{ time: string; location: string; event: string; status: string }>;
  supportingEvidenceIds?: string[];
  linkedTimelineEventIds?: string[];
  refutedAlibis?: string[];
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
  physicsData?: {
    velocityMps?: number;
    caliberMassGrams?: number;
    angleDeg?: number;
    airResistance?: number;
    kineticEnergyJoules?: number;
    impactForceN?: number;
    ricochetAngleDeg?: number;
    dropHeightMeters?: number;
    flightTimeSec?: number;
  };
}

export interface ReportPhysicsPreset {
  id: string;
  name: string;
  eventId: string;
  attemptPhase: string;
  category: string;
  weaponOrVehicle: string;
  evidenceId: string;
  velocity: number;
  caliberMass: number;
  angleDeg: number;
  airResistance: number;
  muzzleEnergyJoules: number;
  impactForceN: number;
  flightTimeSec: number;
  ricochetAngleDeg: number;
  dropHeightMeters: number;
  description: string;
  alibiClaim: string;
  forensicRefutation: string;
  entities: {
    persons: string[];
    locations: string[];
    objects: string[];
    vehicles: string[];
  };
}

export interface TrajectoryVectorProfile {
  id: string;
  vectorId: string;
  title: string;
  attemptPhase: string;
  eventId: string;
  evidenceId: string;
  category: 'PRIMARY_SHOT' | 'RICOCHET_DEFLECTION' | 'SPATTER_VECTOR' | 'VEHICULAR_MOMENTUM' | string;
  weaponOrObject: string;
  timestamp: string;
  originCoords: { x: number; y: number; z: number; label: string };
  impactCoords: { x: number; y: number; z: number; label: string };
  entryAngleDeg: number;
  azimuthAngleDeg: number;
  muzzleVelocityMps: number;
  postImpactVelocityMps: number;
  kineticEnergyLossPercent: number;
  ellipticityRatio: number;
  spatterDropletCount: number;
  spatterOriginAngleDeg: number;
  primaryObstacleOrDeflection: string;
  forensicSummary: string;
  alibiClaim: string;
  forensicRefutation: string;
  entities: {
    persons: string[];
    locations: string[];
    objects: string[];
    vehicles: string[];
  };
  supportingEvidenceIds: string[];
}

export interface AttackerTriangulationProfile {
  id: string;
  presetId: string;
  title: string;
  attemptPhase: string;
  eventId: string;
  evidenceId: string;
  category: string;
  weaponOrVehicle: string;
  timestamp: string;
  originCoords: { x: number; y: number; z: number; sectorLabel: string };
  targetCoords: { x: number; y: number; z: number; sectorLabel: string };
  estimatedAttackerHeightMeters: number;
  heightMarginMeters: number;
  stance: string;
  weaponElevationMeters: number;
  suspectName: string;
  suspectBiometricHeight: string;
  matchProbabilityScore: number;
  lineOfSightScore: number;
  primaryObstacle: string;
  forensicSummary: string;
  alibiClaim: string;
  forensicRefutation: string;
  entities: {
    persons: string[];
    locations: string[];
    objects: string[];
    vehicles: string[];
  };
  supportingEvidenceIds: string[];
}

export interface ExplainableReasoningChain {
  id: string;
  chainId: string;
  title: string;
  attemptPhase: string;
  eventId: string;
  confidence: string;
  confidenceScore: number;
  summary: string;
  evidenceIds: string[];
  physicsMath: string;
  rejectedHypothesis: string;
  entities: {
    persons: string[];
    locations: string[];
    objects: string[];
    vehicles: string[];
  };
  linkedWitnessIds: string[];
}

export interface SystemAuditRecord {
  id: string;
  auditId: string;
  timestamp: string;
  attemptPhase: string;
  eventId: string;
  actionType: string;
  evidenceId: string;
  actor: string;
  details: string;
  securityStatus: 'COMPLIANT' | 'CRITICAL_DISCREPANCY' | 'FORGERY_DETECTED' | string;
  sha256Checksum: string;
  entities: {
    persons: string[];
    locations: string[];
    objects: string[];
    vehicles: string[];
  };
}


export interface Scenario {
  id: string;
  name: string;
  title?: string;
  probability: number;
  description: string;
  evidenceCount: number;
  category?: 'PREMEDITATED_CONSPIRACY' | 'HIRED_HITMAN_SOLO' | 'ACCIDENTAL_FALL' | string;
  supportingEvidenceIds?: string[];
  linkedTimelineEventIds?: string[];
  refutedAlibis?: string[];
  suspectClaims?: string;
  forensicVerdict?: string;
}

export interface RaycastProfile {
  id: string;
  title: string;
  phase: string;
  subjectName: string;
  origin: { x: number; y: number; z: number; label: string };
  target: { x: number; y: number; z: number; label: string };
  horizontalFov: number;
  verticalFov: number;
  maxDistance: number;
  visibilityScore: number;
  isOccluded: boolean;
  primaryObstacle: string;
  intersectDistanceMeters: number;
  forensicSummary: string;
  supportingEvidenceIds: string[];
  linkedTimelineEventIds: string[];
}

export interface SceneCharacter {
  id: string;
  name: string;
  role: 'SUSPECT' | 'VICTIM' | 'WITNESS' | 'HITMAN';
  position: [number, number, number];
  color: string;
  activity: string;
  waypoints?: CharacterWaypoint[];
  attachedItem?: string;
}

export interface SceneObject {
  id: string;
  label: string;
  type: 'WEAPON' | 'VEHICLE' | 'EVIDENCE' | 'TELEMETRY' | 'OBSTACLE';
  position: [number, number, number];
  details: string;
  supportingEvidenceId?: string;
}

export interface SceneOverlay {
  timestamp: string;
  title: string;
  type: 'CCTV' | 'BANK_TRANSFER' | 'VOICE_INTERCEPT' | 'CELL_TOWER' | 'AUTOPSY' | 'EMERGENCY_CALL';
  details: string;
  evidenceId?: string;
}

export interface InvestigationScene {
  id: string;
  stageIndex: number;
  stageName: string;
  locationName: string;
  timestamp: string;
  phase: string;
  cameraDefault: { position: [number, number, number]; target: [number, number, number] };
  characters: SceneCharacter[];
  objects: SceneObject[];
  overlays: SceneOverlay[];
  hasBallistics: boolean;
  hasVehicleMotion?: boolean;
  linkedEvidenceIds: string[];
  linkedTimelineEventId: string;
  forensicSummary: string;
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
  raycastProfiles?: RaycastProfile[];
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
  scenes?: InvestigationScene[];
  scenarios: Scenario[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'SUSPECT' | 'WITNESS' | 'VICTIM' | 'EXHIBIT' | 'TIMELINE_EVENT' | 'LOCATION' | 'VEHICLE' | string;
  x: number;
  y: number;
  color: string;
  details: string;
  phase?: string;
  confidenceScore?: number;
  supportingEvidenceIds?: string[];
  linkedTimelineEventIds?: string[];
}

export interface GraphLink {
  from: string;
  to: string;
  label: string;
  probabilityScore: number;
  isCritical?: boolean;
}

export interface CorrelationGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface MissingEvidencePrediction {
  id: string;
  title: string;
  phase: string;
  area: string;
  category: 'DIGITAL_LOG' | 'PHYSICAL_EXHIBIT' | 'FINANCIAL_TRAIL' | 'FORENSIC_SPECIMEN' | string;
  boost: string;
  confidence: number;
  reason: string;
  recommendedAction: string;
  recoveryWindowMinutes: number;
  supportingEvidenceIds: string[];
  linkedTimelineEventIds: string[];
}

export type CharacterAnimationState =
  | 'IDLE'
  | 'WALK'
  | 'RUN'
  | 'SIT'
  | 'TURN'
  | 'AIM'
  | 'PUSH'
  | 'ATTACK'
  | 'FALL'
  | 'DEATH';

export interface CharacterWaypoint {
  timeProgress: number; // 0.0 to 1.0 (0% to 100%)
  position: [number, number, number];
  animationState: CharacterAnimationState;
  headingAngle?: number; // radians
  attachedItem?: 'POISON_BOTTLE' | 'TACTICAL_KNIFE' | 'SNIPER_RIFLE' | string;
}

export type CinematicCameraMode =
  | 'FREE_ORBIT'
  | 'FOLLOW_SUBJECT'
  | 'CINEMATIC_ORBIT'
  | 'EVIDENCE_ZOOM'
  | 'SLOW_MOTION_BALLISTIC';

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
  cinematicMode?: CinematicCameraMode;
  activeSubjectId?: string;
}

// ----------------------------------------------------
// Social Network Analysis & Key Influencer Detection
// ----------------------------------------------------

export type NetworkEntityRole =
  | 'KINGPIN'
  | 'INTERMEDIARY'
  | 'OPERATIVE'
  | 'FACILITATOR'
  | 'FINANCIAL_CONDUIT'
  | 'VICTIM'
  | 'WITNESS'
  | 'INVESTIGATOR';

export type NetworkLayerChannel =
  | 'FINANCIAL'
  | 'COMMUNICATION'
  | 'OPERATIONAL'
  | 'SURVEILLANCE_WITNESS'
  | 'FORENSIC';

export interface NetworkEntityNode {
  id: string;
  label: string;
  name: string;
  role: NetworkEntityRole;
  category: 'SUSPECT' | 'FACILITATOR' | 'VICTIM' | 'WITNESS' | 'INVESTIGATOR';
  avatarInitials: string;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NEUTRAL';
  color: string;
  description: string;
  organizationOrFaction: string;
  operationalPhases: string[];
  phoneOrHandle?: string;
  financialVolumeInr?: number;
  directEvidenceIds: string[];
  alibiStatus?: string;
  centrality?: NodeCentralityMetrics;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface NetworkRelationshipLink {
  id: string;
  source: string;
  target: string;
  channel: NetworkLayerChannel;
  label: string;
  weight: number; // 1 to 10 intensity
  transactionAmountInr?: number;
  frequencyCount?: number;
  communicationMedium?: string;
  evidenceExhibitIds: string[];
  isCriticalConduit?: boolean;
  isDirectional?: boolean;
  timestamps?: string[];
  investigativeNote?: string;
}

export interface NodeCentralityMetrics {
  degreeCentrality: number; // Normalized degree 0-1
  inDegree: number;
  outDegree: number;
  totalDegree: number;
  betweennessCentrality: number; // Brandes fraction 0-1
  closenessCentrality: number; // Normalized closeness 0-1
  eigenvectorCentrality: number; // Power iteration 0-1
  burtsConstraint: number; // Structural holes / constraint index
  kingpinScore: number; // Composite 0-100
  intermediaryScore: number; // Composite 0-100
  structuralRoleTitle: string;
  disruptionImpactPct: number; // % network efficiency loss if isolated
}

export interface GlobalNetworkTopology {
  nodeCount: number;
  edgeCount: number;
  graphDensity: number;
  averageDegree: number;
  globalClusteringCoefficient: number;
  networkDiameter: number;
  averageShortestPathLength: number;
  degreeCentralization: number;
  betweennessCentralization: number;
  vulnerabilityIndex: number; // 0-100
}

export interface KeyInfluencerRanking {
  entityId: string;
  name: string;
  role: NetworkEntityRole;
  rank: number;
  score: number;
  primaryMetric: string;
  summary: string;
  structuralVulnerability: string;
  tacticalTakedownRecommendation: string;
}

export interface DisruptionSimulationResult {
  isolatedNodeId: string;
  isolatedNodeName: string;
  isolatedRole: NetworkEntityRole;
  preFragmentationComponents: number;
  postFragmentationComponents: number;
  severedEdgesCount: number;
  affectedEntitiesCount: number;
  networkDisruptionScorePct: number;
  reachabilityDropPct: number;
  isolatedClusterDetails: Array<{
    clusterName: string;
    members: string[];
  }>;
  tacticalVerdict: string;
}

export interface ConduitPathResult {
  sourceId: string;
  targetId: string;
  shortestPaths: string[][]; // Node ID sequences
  hopCount: number;
  bottleneckIntermediaryIds: string[];
  totalFinancialVolumeInr: number;
  primaryChannelsUsed: NetworkLayerChannel[];
  forensicEvidenceEnRoute: string[];
}

export interface SocialNetworkAnalysisPayload {
  caseId: string;
  caseTitle: string;
  topology: GlobalNetworkTopology;
  nodes: NetworkEntityNode[];
  links: NetworkRelationshipLink[];
  kingpins: KeyInfluencerRanking[];
  intermediaries: KeyInfluencerRanking[];
  operatives: KeyInfluencerRanking[];
  aiSyndicateReport: {
    executiveSummary: string;
    commandHierarchyAssessment: string;
    criticalIntermediaryVulnerabilities: string;
    financialConduitFindings: string;
    courtAdmissibilityEvaluation: string;
  };
}

// ==========================================
// LEGAL NER & CROSS-DOCUMENT ALIAS RESOLUTION (PHASE 2)
// ==========================================

export type LegalStatute = 'IPC' | 'BNS';

export interface LegalPenalCode {
  id?: string;
  code: string; // e.g. "IPC-302" or "BNS-103"
  sectionNumber: string; // "302"
  statute: LegalStatute;
  title: string;
  category: 'HOMICIDE' | 'CONSPIRACY' | 'ASSAULT' | 'EVIDENCE_TAMPERING' | 'FRAUD' | 'WEAPONS' | 'NARCOTICS' | 'CYBERCRIME' | 'OTHER' | string;
  severityLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'ROUTINE';
  description: string;
  punishment?: string;
  bnsEquivalent?: string;
  ipcEquivalent?: string;
  keyElements?: string[];
}

export type ExtractedEntityType =
  | 'PERSON'
  | 'ALIAS'
  | 'PENAL_CODE'
  | 'LOCATION'
  | 'VEHICLE'
  | 'WEAPON'
  | 'TIMESTAMP'
  | 'ORGANIZATION'
  | 'PHONE'
  | 'FINANCIAL';

export interface ExtractedEntity {
  id: string;
  documentId: string;
  caseId?: string;
  entityType: ExtractedEntityType;
  textValue: string;
  startIndex: number;
  endIndex: number;
  confidenceScore: number;
  contextSnippet?: string;
  metadata?: {
    penalCodeDetails?: LegalPenalCode;
    roleHint?: 'SUSPECT' | 'WITNESS' | 'VICTIM' | 'ASSOCIATE';
    documentTitle?: string;
    documentType?: string;
    sourceSection?: string;
    coOccurrence?: {
      phoneNumbers?: string[];
      locations?: string[];
      timestamps?: string[];
      associates?: string[];
    };
    [key: string]: any;
  };
  createdAt?: string | Date;
}

export interface AliasMappingItem {
  mappingId: string;
  extractedEntityId: string;
  aliasName: string;
  documentId: string;
  documentTitle?: string;
  resolutionMethod: 'AUTOMATIC_FUZZY' | 'AUTOMATIC_LLM' | 'MANUAL_OVERRIDE';
  confidence: number;
  isApproved: boolean;
  reasoning?: string;
  contextSnippet?: string;
}

export interface IdentityCitation {
  documentId: string;
  documentTitle: string;
  snippet: string;
  entityType: ExtractedEntityType;
  confidence: number;
}

export interface CanonicalIdentity {
  id: string;
  caseId: string;
  primaryName: string;
  type: 'SUSPECT' | 'WITNESS' | 'VICTIM' | 'ASSOCIATE';
  riskScore: number;
  notes?: string;
  penalCharges?: string[];
  penalCodeDetails?: LegalPenalCode[];
  aliases?: AliasMappingItem[];
  citations?: IdentityCitation[];
  coOccurrenceSummary?: {
    sharedPhoneNumbers: string[];
    associatedLocations: string[];
    knownAssociates: string[];
    timelineSpan?: string;
  };
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AliasMapping {
  id: string;
  extractedEntityId: string;
  canonicalIdentityId: string;
  resolutionMethod: 'AUTOMATIC_FUZZY' | 'AUTOMATIC_LLM' | 'MANUAL_OVERRIDE';
  confidence: number;
  isApproved: boolean;
  reasoning?: string;
  extractedEntity?: ExtractedEntity;
  canonicalIdentity?: CanonicalIdentity;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AliasMergeCandidate {
  id: string;
  sourceEntity: ExtractedEntity;
  targetIdentity: CanonicalIdentity;
  proposedName: string;
  matchType: 'PHONETIC_SOUNDEX' | 'FUZZY_JARO_WINKLER' | 'LLM_CONTEXTUAL_COOCCURRENCE' | 'HYBRID_HIGH_CONFIDENCE';
  fuzzyScore: number;
  soundexMatch: boolean;
  doubleMetaphoneKeys: {
    source: [string, string];
    target: [string, string];
  };
  coOccurrenceScore: number;
  coOccurrenceFactors: {
    sharedPhoneNumbers: string[];
    sharedLocations: string[];
    sharedAssociates: string[];
    temporalProximityHours?: number;
  };
  llmDisambiguationReasoning: string;
  overallConfidence: number;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  suggestedAction: 'MERGE' | 'FLAG_REVIEW' | 'SEPARATE';
}

export interface NERDocument {
  id: string;
  caseId: string;
  title: string;
  documentType: 'FIR' | 'CHARGE_SHEET' | 'WITNESS_STATEMENT' | 'FORENSIC_REPORT' | 'INTERCEPT_TRANSCRIPT' | 'DIGITAL_EXTRACTION';
  rawText: string;
  processedDate: string;
  entitiesCount: number;
  penalCodesCount: number;
  entities: ExtractedEntity[];
}

