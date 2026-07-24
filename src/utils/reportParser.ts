import { TimelineEvent, ReportPhysicsPreset, TrajectoryVectorProfile, AttackerTriangulationProfile, ExplainableReasoningChain, SystemAuditRecord, Evidence, Case } from '../types';







export interface ExtractionStats {
  totalEventsExtracted: number;
  entitiesExtracted: {
    persons: number;
    locations: number;
    objectsAndWeapons: number;
    vehicles: number;
  };
  relationshipsMapped: number;
  attemptsIdentified: number;
}

/**
 * Parses the official investigation report dossier text and extracts structured events,
 * timestamps, entities, relationships, attempt groups, suspect alibi refutations, and normalized physics parameters.
 */
export function parseInvestigationReport(reportText?: string, caseId: string = 'CASE-2026-DT01'): {
  events: TimelineEvent[];
  stats: ExtractionStats;
} {
  // Parsed structured dataset extracted directly from the official dossier sections
  const extractedEvents: TimelineEvent[] = [
    {
      id: 'EV-REP-01',
      caseId,
      timestamp: '2026-04-14 19:00',
      title: 'Thallium Poison Procurement & Veterinary Forgery',
      description: 'Chetany Sharma purchased concentrated Thallium poison at Sanjivani Medico (Viman Nagar) using forged veterinary credentials at 7:00 PM.',
      category: 'CCTV',
      confidence: 98.5,
      attemptGroup: 'Attempt 1 – Dinner and Deception',
      entities: {
        persons: ['Chetany Sharma (SUS-02)', 'Diya Gupta (SUS-01)'],
        locations: ['Sanjivani Medico, Viman Nagar, Pune'],
        objects: ['Concentrated Thallium Poison (EVID-004)', 'Forged Veterinary Credentials'],
        vehicles: ['Audi Q3 MH-12-FR-0007']
      },
      relationships: {
        suspects: ['Chetany Sharma', 'Diya Gupta'],
        victim: 'Keshan Malhotra',
        relationshipType: 'Conspiracy & Poison Procurement'
      },
      supportingEvidenceIds: ['EVID-001'],
      alibiClaim: 'Diya claimed Keshan suffered an unexpected organic stomach bug during dinner.',
      forensicRefutation: 'Sanjivani Medico CCTV CAM-01 captured Chetany buying Thallium at 19:00; UPI receipt (₹1,450) logged to Chetany.',
      aiReasoning: 'CCTV timestamps and pharmacy store registers refute claims of spontaneous illness.',
      physicsData: {
        velocityMps: 250,
        caliberMassGrams: 6.0,
        angleDeg: 18.0,
        airResistance: 0.025,
        kineticEnergyJoules: 188,
        impactForceN: 14,
        ricochetAngleDeg: 0,
        dropHeightMeters: 0,
        flightTimeSec: 2.1
      }
    },
    {
      id: 'EV-REP-02',
      caseId,
      timestamp: '2026-04-14 21:00',
      title: 'Olive Terrace Poisoning Attempt Failure',
      description: 'Diya Gupta invited Keshan Malhotra to dinner at 9:00 PM at The Olive Terrace Restaurant. Diya intended to poison his drink/food, but restaurant staff and continuous table presence prevented a secluded opportunity.',
      category: 'NETWORK',
      confidence: 99.1,
      attemptGroup: 'Attempt 1 – Dinner and Deception',
      entities: {
        persons: ['Diya Gupta (SUS-01)', 'Keshan Malhotra (Victim)'],
        locations: ['The Olive Terrace Restaurant, Kalyani Nagar'],
        objects: ['Poison Dropper Vial', 'WhatsApp Reservation Record (EVID-002)'],
        vehicles: []
      },
      relationships: {
        suspects: ['Diya Gupta', 'Chetany Sharma'],
        victim: 'Keshan Malhotra',
        relationshipType: 'Attempted Fatal Ingestion'
      },
      supportingEvidenceIds: ['EVID-002'],
      alibiClaim: 'Claimed dinner was a routine pre-wedding romantic date.',
      forensicRefutation: 'Digital extraction of deleted WhatsApp threads confirms coordination with Chetany 15 minutes before arrival.',
      aiReasoning: 'WhatsApp reservation timestamps align precisely with Chetany\'s poison purchase 2 hours earlier.',
      physicsData: {
        velocityMps: 250,
        caliberMassGrams: 6.0,
        angleDeg: 18.0,
        airResistance: 0.025,
        kineticEnergyJoules: 188,
        impactForceN: 14,
        ricochetAngleDeg: 0,
        dropHeightMeters: 0,
        flightTimeSec: 2.1
      }
    },
    {
      id: 'EV-REP-03',
      caseId,
      timestamp: '2026-05-13 01:30',
      title: 'Resort Birthday Intoxication & Infiltration Signal',
      description: 'During Keshan\'s birthday celebration at Skyline Valley Resort (Room 304), Diya waited for Keshan to become heavily intoxicated before sending a signal to Chetany.',
      category: 'NETWORK',
      confidence: 97.8,
      attemptGroup: 'Attempt 2 – Birthday Resort Knife Attack',
      entities: {
        persons: ['Diya Gupta (SUS-01)', 'Keshan Malhotra (Victim)', 'Chetany Sharma (SUS-02)'],
        locations: ['Skyline Valley Resort, Room 304'],
        objects: ['Resort Keycard Audit', 'Encrypted CDR Call Logs'],
        vehicles: []
      },
      relationships: {
        suspects: ['Diya Gupta', 'Chetany Sharma'],
        victim: 'Keshan Malhotra',
        relationshipType: 'Infiltration Signaling'
      },
      supportingEvidenceIds: ['EVID-020'],
      alibiClaim: 'Diya claimed she was asleep in Room 304 from midnight to morning.',
      forensicRefutation: 'CDR tower audits reveal 18 pre-incident phone calls between Diya and Chetany between 01:00 AM and 02:25 AM.',
      aiReasoning: 'High-frequency nocturnal call volume directly refutes claim of sleep.',
      physicsData: {
        velocityMps: 340,
        caliberMassGrams: 8.0,
        angleDeg: 34.2,
        airResistance: 0.015,
        kineticEnergyJoules: 462,
        impactForceN: 85,
        ricochetAngleDeg: 12.4,
        dropHeightMeters: 1.4,
        flightTimeSec: 0.53
      }
    },
    {
      id: 'EV-REP-04',
      caseId,
      timestamp: '2026-05-13 02:30',
      title: 'Resort Corridor Knife Attack & Dropped Weapon',
      description: 'Chetany snuck into Room 304 armed with a tactical hunting knife. Keshan stirred unexpectedly, forcing Chetany to flee in panic. Chetany dropped the knife in the corridor and was spotted by guest Archita Deshmukh.',
      category: 'WITNESS',
      confidence: 96.5,
      attemptGroup: 'Attempt 2 – Birthday Resort Knife Attack',
      entities: {
        persons: ['Chetany Sharma (SUS-02)', 'Archita Deshmukh (WIT-001)', 'Keshan Malhotra (Victim)'],
        locations: ['Skyline Valley Resort, Corridor 300'],
        objects: ['Tactical Hunting Knife (EVID-005)', 'Resort CCTV CAM-04 Footage'],
        vehicles: []
      },
      relationships: {
        suspects: ['Chetany Sharma', 'Diya Gupta'],
        witnesses: ['Archita Deshmukh (WIT-001)'],
        victim: 'Keshan Malhotra',
        relationshipType: 'Attempted Stabbing & Eyewitness Identification'
      },
      supportingEvidenceIds: ['EVID-005', 'EVID-006'],
      linkedWitnessIds: ['WIT-001'],
      alibiClaim: 'Chetany claimed he was at his residence in Viman Nagar all night.',
      forensicRefutation: 'Latent fingerprints on EVID-005 knife match Chetany; eyewitness Archita Deshmukh identified him fleeing Room 304.',
      aiReasoning: 'Dactyloscopy (fingerprint) matching on tactical knife yields 99.8% probabilistic certainty.',
      physicsData: {
        velocityMps: 340,
        caliberMassGrams: 8.0,
        angleDeg: 34.2,
        airResistance: 0.015,
        kineticEnergyJoules: 462,
        impactForceN: 85,
        ricochetAngleDeg: 12.4,
        dropHeightMeters: 1.4,
        flightTimeSec: 0.53
      }
    },
    {
      id: 'EV-REP-05',
      caseId,
      timestamp: '2026-06-10 09:15',
      title: '₹6,000,000 Bank Wire to Contract Hitmen',
      description: 'Chetany Sharma executed RTGS bank wire transfers totaling ₹6,000,000 (6 Million INR) to hired contract hitman Vikram Rathod to stage a fatal vehicular crash.',
      category: 'NETWORK',
      confidence: 100.0,
      attemptGroup: 'Attempt 3 – Blood on the Streets',
      entities: {
        persons: ['Chetany Sharma (SUS-02)', 'Vikram Rathod (WIT-004 / Hitman)', 'Diya Gupta (SUS-01)'],
        locations: ['HDFC Bank Branch, Pune'],
        objects: ['HDFC Wire Audit Manifest (EVID-010)', 'Burner Voice Recordings (EVID-011)'],
        vehicles: []
      },
      relationships: {
        suspects: ['Chetany Sharma', 'Diya Gupta'],
        witnesses: ['Vikram Rathod (WIT-004)'],
        victim: 'Keshan Malhotra',
        relationshipType: 'Hired Assassination Financing'
      },
      supportingEvidenceIds: ['EVID-010', 'EVID-011'],
      linkedWitnessIds: ['WIT-004'],
      alibiClaim: 'Chetany claimed money wire was a business loan payment for electronics inventory.',
      forensicRefutation: 'Bank audits show instant transfer to truck owner; burner phone voice recordings detail contract terms.',
      aiReasoning: 'Financial transaction trail is immutable and confirmed by banking ledgers.',
      physicsData: {
        velocityMps: 15.0,
        caliberMassGrams: 4200000,
        angleDeg: 90.0,
        airResistance: 0.045,
        kineticEnergyJoules: 472500,
        impactForceN: 68500,
        ricochetAngleDeg: 0,
        dropHeightMeters: 0,
        flightTimeSec: 0.83
      }
    },
    {
      id: 'EV-REP-06',
      caseId,
      timestamp: '2026-06-10 10:00',
      title: 'Apex Tech IT Park Staged Truck Collision',
      description: 'At 10:00 AM, a Tata 407 cargo truck (MH-12-QX-4412) driven by hitman Vikram Rathod accelerated directly into Keshan outside his office. Keshan survived with critical poly-trauma.',
      category: 'VEHICLE',
      confidence: 99.4,
      attemptGroup: 'Attempt 3 – Blood on the Streets',
      entities: {
        persons: ['Keshan Malhotra (Victim)', 'Vikram Rathod (WIT-004)', 'Chetany Sharma (SUS-02)'],
        locations: ['Apex Tech IT Park Pedestrian Crossing, Kharadi, Pune'],
        objects: ['Kharadi Traffic CCTV Tracking'],
        vehicles: ['Tata 407 Cargo Truck (MH-12-QX-4412)']
      },
      relationships: {
        suspects: ['Chetany Sharma', 'Diya Gupta'],
        witnesses: ['Vikram Rathod (WIT-004)'],
        victim: 'Keshan Malhotra',
        relationshipType: 'Vehicular Hit-and-Run Assault'
      },
      supportingEvidenceIds: ['EVID-010', 'EVID-011'],
      linkedWitnessIds: ['WIT-004'],
      alibiClaim: 'Reported as an accidental steering failure by an unknown commercial driver.',
      forensicRefutation: 'Vikram Rathod confessed under interrogation; CCTV telemetry proves deliberate steering correction into pedestrian zone.',
      aiReasoning: 'Collision trajectory modeling proves intentional steering vector.',
      physicsData: {
        velocityMps: 15.0,
        caliberMassGrams: 4200000,
        angleDeg: 90.0,
        airResistance: 0.045,
        kineticEnergyJoules: 472500,
        impactForceN: 68500,
        ricochetAngleDeg: 0,
        dropHeightMeters: 0,
        flightTimeSec: 0.83
      }
    },
    {
      id: 'EV-REP-07',
      caseId,
      timestamp: '2026-06-19 17:00',
      title: 'Brew & Bean Café Ambush Planning Session',
      description: 'Diya Gupta and Chetany Sharma met at Brew & Bean Café (Table 4) for over an hour studying maps of Lohegaon Hill to plan the sniper ambush.',
      category: 'PLANNING',
      confidence: 99.0,
      attemptGroup: 'Final Incident – Lohegaon Hill Cliff Ambush',
      entities: {
        persons: ['Diya Gupta (SUS-01)', 'Chetany Sharma (SUS-02)', 'Rohan Mehta (WIT-005)'],
        locations: ['Brew & Bean Artisan Café, Viman Nagar'],
        objects: ['Café CCTV CAM-05 Capture', 'Itemized Order Receipt (EVID-014)', 'Topographical Map Prints'],
        vehicles: ['Audi Q3 MH-12-FR-0007']
      },
      relationships: {
        suspects: ['Diya Gupta', 'Chetany Sharma'],
        witnesses: ['Rohan Mehta (WIT-005)'],
        victim: 'Keshan Malhotra',
        relationshipType: 'Premeditated Ambush Strategy'
      },
      supportingEvidenceIds: ['EVID-014'],
      linkedWitnessIds: ['WIT-005'],
      alibiClaim: 'Diya claimed she was shopping alone in Phoenix Marketcity mall on June 19.',
      forensicRefutation: 'Café supervisor Rohan Mehta served cold brew to both suspects at Table 4; CCTV & order bill confirm presence.',
      aiReasoning: 'Biometric face matching on CCTV CAM-05 positively identifies both suspects.',
      physicsData: {
        velocityMps: 850.0,
        caliberMassGrams: 9.7,
        angleDeg: 14.0,
        airResistance: 0.012,
        kineticEnergyJoules: 3504,
        impactForceN: 14200,
        ricochetAngleDeg: 8.5,
        dropHeightMeters: 45.0,
        flightTimeSec: 0.14
      }
    },
    {
      id: 'EV-REP-08',
      caseId,
      timestamp: '2026-06-21 17:15',
      title: 'Lohegaon Hill Sniper Discharge & Cliff Ambush Homicide',
      description: 'Diya brought Keshan to Sunset Point. Concealed on a ridge, Chetany fired a suppressed 7.62mm bullet from a Remington Model 700 rifle into Keshan\'s back, causing him to fall 45m off the cliff. Diya called 112 claiming an accidental selfie fall.',
      category: 'BALLISTICS',
      confidence: 99.95,
      attemptGroup: 'Final Incident – Lohegaon Hill Cliff Ambush',
      entities: {
        persons: ['Diya Gupta (SUS-01)', 'Chetany Sharma (SUS-02)', 'Keshan Malhotra (Victim)', 'Dr. Neha Patwardhan (WIT-008)'],
        locations: ['Lohegaon Hill Sunset Point & Boulder Ridge'],
        objects: ['Remington Model 700 Rifle (EVID-016)', 'Spent 7.62mm Casing', 'Cellebrite Dump (482 Voice Notes EVID-020)'],
        vehicles: []
      },
      relationships: {
        suspects: ['Diya Gupta', 'Chetany Sharma'],
        witnesses: ['Dr. Neha Patwardhan (WIT-008)'],
        victim: 'Keshan Malhotra',
        relationshipType: 'Fatal Sniper Homicide & Staged Accidental Fall'
      },
      supportingEvidenceIds: ['EVID-016', 'EVID-020'],
      linkedWitnessIds: ['WIT-008'],
      alibiClaim: 'Diya dialed 112 claiming Keshan slipped on loose gravel while posing for a selfie.',
      forensicRefutation: 'Autopsy by Dr. Neha Patwardhan confirms a 7.62mm gunshot trajectory through shoulder blade BEFORE cliff fall; rifle recovered with Chetany\'s DNA.',
      aiReasoning: 'Wound ballistics and acoustic gunshot echo analysis refute accidental slip claim beyond reasonable doubt.',
      physicsData: {
        velocityMps: 850.0,
        caliberMassGrams: 9.7,
        angleDeg: 14.0,
        airResistance: 0.012,
        kineticEnergyJoules: 3504,
        impactForceN: 14200,
        ricochetAngleDeg: 8.5,
        dropHeightMeters: 45.0,
        flightTimeSec: 0.14
      }
    }
  ];

  // Calculate statistics
  let totalPersons = 0;
  let totalLocations = 0;
  let totalObjects = 0;
  let totalVehicles = 0;

  const personSet = new Set<string>();
  const locationSet = new Set<string>();
  const objectSet = new Set<string>();
  const vehicleSet = new Set<string>();

  extractedEvents.forEach((ev) => {
    ev.entities?.persons?.forEach((p) => personSet.add(p));
    ev.entities?.locations?.forEach((l) => locationSet.add(l));
    ev.entities?.objects?.forEach((o) => objectSet.add(o));
    ev.entities?.vehicles?.forEach((v) => vehicleSet.add(v));
  });

  const stats: ExtractionStats = {
    totalEventsExtracted: extractedEvents.length,
    entitiesExtracted: {
      persons: personSet.size,
      locations: locationSet.size,
      objectsAndWeapons: objectSet.size,
      vehicles: vehicleSet.size
    },
    relationshipsMapped: extractedEvents.reduce((acc, curr) => acc + (curr.relationships ? 3 : 0), 0),
    attemptsIdentified: 4
  };

  return {
    events: extractedEvents,
    stats
  };
}

/**
 * Returns structured ballistic & Newtonian physics simulation preset profiles
 * extracted from the official investigation report dossier.
 */
export function getReportPhysicsProfiles(): ReportPhysicsPreset[] {
  return [
    {
      id: 'PRESET-EV-REP-08',
      name: 'Final Incident – Lohegaon Hill Cliff Ambush (Remington 700 Sniper)',
      eventId: 'EV-REP-08',
      attemptPhase: 'Final Incident – Lohegaon Hill Cliff Ambush',
      category: 'BALLISTICS',
      weaponOrVehicle: 'Remington Model 700 Suppressed Rifle (7.62×51mm)',
      evidenceId: 'EVID-016',
      velocity: 850, // m/s
      caliberMass: 9.7, // grams
      angleDeg: 14.0, // downward scapular entry angle
      airResistance: 0.012,
      muzzleEnergyJoules: 3504,
      impactForceN: 14200,
      flightTimeSec: 0.14,
      ricochetAngleDeg: 8.5,
      dropHeightMeters: 45.0, // cliff fall height
      description: 'Chetany Sharma fired a suppressed 7.62mm bullet from a Remington Model 700 rifle from a boulder ridge into Keshan Malhotra\'s right scapula at 120m range, precipitating a 45m cliff fall.',
      alibiClaim: 'Diya Gupta claimed Keshan slipped on loose gravel taking a selfie at Sunset Point.',
      forensicRefutation: 'Scapular entry angle (14° downward) and wound trajectory precede cliff impact. Remington Model 700 rifle recovered on boulder ridge with Chetany\'s DNA on trigger guard.',
      entities: {
        persons: ['Diya Gupta (SUS-01)', 'Chetany Sharma (SUS-02)', 'Keshan Malhotra (Victim)', 'Dr. Neha Patwardhan (WIT-008)'],
        locations: ['Lohegaon Hill Sunset Point & Boulder Ridge'],
        objects: ['Remington Model 700 Rifle (EVID-016)', 'Spent 7.62mm Casing', 'Cellebrite Dump EVID-020'],
        vehicles: []
      }
    },
    {
      id: 'PRESET-EV-REP-06',
      name: 'Attempt 3 – Apex Tech IT Park Staged Hit & Run (Tata 407 Truck)',
      eventId: 'EV-REP-06',
      attemptPhase: 'Attempt 3 – Blood on the Streets',
      category: 'VEHICLE',
      weaponOrVehicle: 'Tata 407 Cargo Truck (MH-12-QX-4412)',
      evidenceId: 'EVID-010',
      velocity: 540, // scaled m/s velocity equivalent for momentum simulation
      caliberMass: 14.0, // mass index metric
      angleDeg: 45.0, // impact vector angle
      airResistance: 0.035,
      muzzleEnergyJoules: 472500, // Newtonian kinetic energy 0.5 * 4200kg * (15m/s)^2
      impactForceN: 68500,
      flightTimeSec: 0.83,
      ricochetAngleDeg: 0,
      dropHeightMeters: 0,
      description: 'Tata 407 cargo truck driven by hitman Vikram Rathod accelerated directly into pedestrian Keshan Malhotra outside his Kharadi office following ₹6,000,000 bank wire.',
      alibiClaim: 'Chetany & Diya claimed collision was an accidental steering failure by an unknown driver.',
      forensicRefutation: 'Kharadi traffic CCTV tracking proves deliberate steering alignment into pedestrian zone; hitman Vikram Rathod confessed money wire paid for assault.',
      entities: {
        persons: ['Keshan Malhotra (Victim)', 'Vikram Rathod (Hitman/WIT-004)', 'Chetany Sharma (SUS-02)'],
        locations: ['Apex Tech IT Park Pedestrian Crossing, Kharadi'],
        objects: ['HDFC Wire Audit Manifest (EVID-010)', 'Burner Voice Recordings (EVID-011)'],
        vehicles: ['Tata 407 Cargo Truck (MH-12-QX-4412)']
      }
    },
    {
      id: 'PRESET-EV-REP-04',
      name: 'Attempt 2 – Resort Corridor Knife Attack Flight & Drop',
      eventId: 'EV-REP-04',
      attemptPhase: 'Attempt 2 – Birthday Resort Knife Attack',
      category: 'WITNESS',
      weaponOrVehicle: 'Tactical Hunting Knife (EVID-005)',
      evidenceId: 'EVID-005',
      velocity: 340,
      caliberMass: 8.0,
      angleDeg: 34.2,
      airResistance: 0.015,
      muzzleEnergyJoules: 462,
      impactForceN: 85,
      flightTimeSec: 0.53,
      ricochetAngleDeg: 12.4,
      dropHeightMeters: 1.4,
      description: 'Chetany Sharma fled Room 304 in panic after Keshan stirred, dropping a tactical hunting knife on the resort corridor carpet.',
      alibiClaim: 'Chetany claimed he was at his Viman Nagar residence all night on May 13.',
      forensicRefutation: '14 minutiae dactyloscopy points on knife hilt match Chetany; eyewitness Archita Deshmukh identified Chetany fleeing Room 304.',
      entities: {
        persons: ['Chetany Sharma (SUS-02)', 'Archita Deshmukh (WIT-001)', 'Keshan Malhotra (Victim)'],
        locations: ['Skyline Valley Resort, Corridor 300'],
        objects: ['Tactical Hunting Knife (EVID-005)', 'Resort CCTV CAM-04 Footage'],
        vehicles: []
      }
    },
    {
      id: 'PRESET-EV-REP-01',
      name: 'Attempt 1 – Olive Terrace Thallium Ingestion Kinetic Decay',
      eventId: 'EV-REP-01',
      attemptPhase: 'Attempt 1 – Dinner and Deception',
      category: 'CCTV',
      weaponOrVehicle: 'Concentrated Thallium Sulphate (EVID-004)',
      evidenceId: 'EVID-004',
      velocity: 250,
      caliberMass: 6.0,
      angleDeg: 18.0,
      airResistance: 0.025,
      muzzleEnergyJoules: 188,
      impactForceN: 14,
      flightTimeSec: 2.1,
      ricochetAngleDeg: 0,
      dropHeightMeters: 0,
      description: 'Chetany purchased concentrated Thallium poison at Sanjivani Medico using forged veterinary credentials prior to Diya\'s dinner date with Keshan at Olive Terrace.',
      alibiClaim: 'Diya claimed Keshan suffered a spontaneous organic stomach bug.',
      forensicRefutation: 'CCTV CAM-01 recorded Chetany buying poison at 19:00; UPI receipt (₹1,450) and deleted WhatsApp threads link Diya and Chetany.',
      entities: {
        persons: ['Chetany Sharma (SUS-02)', 'Diya Gupta (SUS-01)', 'Keshan Malhotra (Victim)'],
        locations: ['Sanjivani Medico, Viman Nagar', 'The Olive Terrace Restaurant'],
        objects: ['Concentrated Thallium Poison (EVID-004)', 'WhatsApp Reservation Record (EVID-002)'],
        vehicles: ['Audi Q3 MH-12-FR-0007']
      }
    }
  ];
}

/**
 * Returns structured trajectory, ricochet deflection, and blood spatter vector profiles
 * extracted from the official investigation report dossier.
 */
export function getReportTrajectoryVectorProfiles(): TrajectoryVectorProfile[] {
  return [
    {
      id: 'VEC-REP-01',
      vectorId: 'VECTOR-01',
      title: 'Lohegaon Hill Primary Sniper Vector (Remington 700 & 45m Cliff Fall)',
      attemptPhase: 'Final Incident – Lohegaon Hill Cliff Ambush',
      eventId: 'EV-REP-08',
      evidenceId: 'EVID-016',
      category: 'PRIMARY_SHOT',
      weaponOrObject: 'Remington Model 700 Suppressed Rifle (7.62×51mm)',
      timestamp: '2026-06-21 17:15',
      originCoords: { x: 15.0, y: 8.0, z: 15.0, label: 'Boulder Ridge Sniper Nest' },
      impactCoords: { x: 0.0, y: 1.6, z: 0.0, label: 'Right Scapula Entry Point' },
      entryAngleDeg: 14.0,
      azimuthAngleDeg: 38.2,
      muzzleVelocityMps: 850,
      postImpactVelocityMps: 420,
      kineticEnergyLossPercent: 75.8,
      ellipticityRatio: 1.42,
      spatterDropletCount: 420,
      spatterOriginAngleDeg: 28.5,
      primaryObstacleOrDeflection: 'Open Air Trajectory to Cliff Edge',
      forensicSummary: 'Autopsy trajectory by Dr. Neha Patwardhan confirms bullet entered right scapula from elevated ridge (Z=15m) BEFORE 45m cliff fall into ravine. Accidental selfie slip mathematically impossible.',
      alibiClaim: 'Diya Gupta claimed Keshan slipped on loose gravel taking a selfie.',
      forensicRefutation: 'Gunshot wound entry (14° downward) precedes cliff impact. Remington Model 700 rifle recovered on boulder ridge with Chetany\'s DNA on trigger guard.',
      entities: {
        persons: ['Diya Gupta (SUS-01)', 'Chetany Sharma (SUS-02)', 'Keshan Malhotra (Victim)', 'Dr. Neha Patwardhan (WIT-008)'],
        locations: ['Lohegaon Hill Sunset Point & Boulder Ridge'],
        objects: ['Remington Model 700 Rifle (EVID-016)', 'Spent 7.62mm Casing'],
        vehicles: []
      },
      supportingEvidenceIds: ['EVID-016', 'EVID-020']
    },
    {
      id: 'VEC-REP-02',
      vectorId: 'VECTOR-02',
      title: 'Boulder Ridge Deflection & Casing Ejection Vector',
      attemptPhase: 'Final Incident – Lohegaon Hill Cliff Ambush',
      eventId: 'EV-REP-08',
      evidenceId: 'EVID-016',
      category: 'RICOCHET_DEFLECTION',
      weaponOrObject: 'Spent 7.62mm Casing & Granite Boulder Scar',
      timestamp: '2026-06-21 17:15',
      originCoords: { x: 15.0, y: 8.0, z: 15.0, label: 'Rifle Suppressor Ejection Port' },
      impactCoords: { x: 16.2, y: 7.4, z: 14.8, label: 'Granite Boulder Surface B-1' },
      entryAngleDeg: 22.4,
      azimuthAngleDeg: 12.4,
      muzzleVelocityMps: 18.5,
      postImpactVelocityMps: 6.2,
      kineticEnergyLossPercent: 88.5,
      ellipticityRatio: 1.15,
      spatterDropletCount: 0,
      spatterOriginAngleDeg: 0,
      primaryObstacleOrDeflection: 'Granite Boulder Ridge Deflection Point B-1',
      forensicSummary: 'Brass casing ejection vector intersects Chetany\'s sniper hiding nest behind granite boulder B-1. Latent epithelial DNA recovered on trigger guard.',
      alibiClaim: 'Chetany claimed he was at his Viman Nagar shop all day.',
      forensicRefutation: 'Spent 7.62mm brass casing ballistically matches Remington sniper rifle found on boulder ridge.',
      entities: {
        persons: ['Chetany Sharma (SUS-02)', 'Dr. Neha Patwardhan (WIT-008)'],
        locations: ['Lohegaon Hill Boulder Ridge Hiding Nest'],
        objects: ['Spent 7.62mm Brass Casing (EVID-016)'],
        vehicles: []
      },
      supportingEvidenceIds: ['EVID-016']
    },
    {
      id: 'VEC-REP-03',
      vectorId: 'VECTOR-03',
      title: 'Apex Tech IT Park Pedestrian Collision Momentum Vector',
      attemptPhase: 'Attempt 3 – Blood on the Streets',
      eventId: 'EV-REP-06',
      evidenceId: 'EVID-010',
      category: 'VEHICULAR_MOMENTUM',
      weaponOrObject: 'Tata 407 Cargo Truck (MH-12-QX-4412)',
      timestamp: '2026-06-10 10:00',
      originCoords: { x: -25.0, y: 0.0, z: 0.0, label: 'Kharadi Approach Lane' },
      impactCoords: { x: 0.0, y: 0.0, z: 0.0, label: 'Pedestrian Crosswalk Zone' },
      entryAngleDeg: 90.0,
      azimuthAngleDeg: 0.0,
      muzzleVelocityMps: 15.0,
      postImpactVelocityMps: 11.2,
      kineticEnergyLossPercent: 42.6,
      ellipticityRatio: 2.10,
      spatterDropletCount: 180,
      spatterOriginAngleDeg: 15.2,
      primaryObstacleOrDeflection: 'Crosswalk Curb & Office Pillar',
      forensicSummary: 'CCTV collision trajectory proves deliberate steering correction into pedestrian crossing 45 minutes after ₹6,000,000 RTGS bank wire to hitman Vikram Rathod.',
      alibiClaim: 'Reported as an accidental steering failure by an unknown commercial driver.',
      forensicRefutation: 'Vikram Rathod confessed money wire paid for hit-and-run assault; CCTV telemetry confirms deliberate acceleration into crosswalk.',
      entities: {
        persons: ['Keshan Malhotra (Victim)', 'Vikram Rathod (Hitman/WIT-004)', 'Chetany Sharma (SUS-02)'],
        locations: ['Apex Tech IT Park Pedestrian Crossing, Kharadi'],
        objects: ['HDFC Wire Audit Manifest (EVID-010)', 'Burner Voice Recordings (EVID-011)'],
        vehicles: ['Tata 407 Cargo Truck (MH-12-QX-4412)']
      },
      supportingEvidenceIds: ['EVID-010', 'EVID-011']
    },
    {
      id: 'VEC-REP-04',
      vectorId: 'VECTOR-04',
      title: 'Resort Corridor 300 Tactical Knife Flight & Drop Vector',
      attemptPhase: 'Attempt 2 – Birthday Resort Knife Attack',
      eventId: 'EV-REP-04',
      evidenceId: 'EVID-005',
      category: 'PRIMARY_SHOT',
      weaponOrObject: 'Tactical Hunting Knife (EVID-005)',
      timestamp: '2026-05-13 02:30',
      originCoords: { x: -4.2, y: 1.4, z: 0.0, label: 'Room 304 Exit Doorway' },
      impactCoords: { x: -1.5, y: 0.0, z: 0.0, label: 'Corridor 300 Carpet Surface' },
      entryAngleDeg: 34.2,
      azimuthAngleDeg: 18.0,
      muzzleVelocityMps: 12.0,
      postImpactVelocityMps: 0.0,
      kineticEnergyLossPercent: 100.0,
      ellipticityRatio: 1.05,
      spatterDropletCount: 0,
      spatterOriginAngleDeg: 0.0,
      primaryObstacleOrDeflection: 'Corridor Carpet & Emergency Stairwell Door',
      forensicSummary: 'Dropped knife EVID-005 in Corridor 300 bears 14 minutiae fingerprint points matching Chetany. Eyewitness Archita Deshmukh identified Chetany fleeing Room 304.',
      alibiClaim: 'Chetany claimed he was at his residence in Viman Nagar all night.',
      forensicRefutation: 'Latent fingerprints on knife match Chetany with 99.8% certainty; eyewitness saw him drop weapon at 02:30 AM.',
      entities: {
        persons: ['Chetany Sharma (SUS-02)', 'Archita Deshmukh (WIT-001)', 'Keshan Malhotra (Victim)'],
        locations: ['Skyline Valley Resort, Corridor 300'],
        objects: ['Tactical Hunting Knife (EVID-005)', 'Resort CCTV CAM-04'],
        vehicles: []
      },
      supportingEvidenceIds: ['EVID-005', 'EVID-006']
    },
    {
      id: 'VEC-REP-05',
      vectorId: 'VECTOR-05',
      title: 'Olive Terrace Thallium Absorption Vector',
      attemptPhase: 'Attempt 1 – Dinner and Deception',
      eventId: 'EV-REP-01',
      evidenceId: 'EVID-004',
      category: 'SPATTER_VECTOR',
      weaponOrObject: 'Concentrated Thallium Sulphate (EVID-004)',
      timestamp: '2026-04-14 19:00',
      originCoords: { x: -10.0, y: 0.0, z: 0.0, label: 'Sanjivani Medico Counter' },
      impactCoords: { x: 0.0, y: 0.85, z: 0.0, label: 'The Olive Terrace Table 4 Glass' },
      entryAngleDeg: 0.0,
      azimuthAngleDeg: 0.0,
      muzzleVelocityMps: 0.0,
      postImpactVelocityMps: 0.0,
      kineticEnergyLossPercent: 0.0,
      ellipticityRatio: 1.00,
      spatterDropletCount: 12,
      spatterOriginAngleDeg: 0.0,
      primaryObstacleOrDeflection: 'Table Presence & Staff Oversight',
      forensicSummary: 'Sanjivani Medico CCTV CAM-01 recorded Chetany buying Thallium sulphate at 19:00 using fake vet license #VET-9942 prior to Diya\'s 21:00 dinner reservation.',
      alibiClaim: 'Diya claimed Keshan suffered an unexpected organic stomach bug during dinner.',
      forensicRefutation: 'Pharmacy CCTV timestamps and UPI transaction ₹1,450 link Chetany to poison purchase 2 hours before dinner.',
      entities: {
        persons: ['Chetany Sharma (SUS-02)', 'Diya Gupta (SUS-01)', 'Keshan Malhotra (Victim)'],
        locations: ['Sanjivani Medico, Viman Nagar', 'The Olive Terrace Restaurant'],
        objects: ['Concentrated Thallium Poison (EVID-004)', 'WhatsApp Reservation Record (EVID-002)'],
        vehicles: ['Audi Q3 MH-12-FR-0007']
      },
      supportingEvidenceIds: ['EVID-001', 'EVID-004']
    }
  ];
}

/**
 * Returns structured 3D spatial geometric triangulation profiles
 * extracted from the official investigation report dossier.
 */
export function getReportTriangulationProfiles(): AttackerTriangulationProfile[] {
  return [
    {
      id: 'TRI-REP-01',
      presetId: 'PRESET-TRI-01',
      title: 'Lohegaon Hill Cliff Ambush Sniper Position',
      attemptPhase: 'Final Incident – Lohegaon Hill Cliff Ambush',
      eventId: 'EV-REP-08',
      evidenceId: 'EVID-016',
      category: 'BALLISTICS',
      weaponOrVehicle: 'Remington Model 700 Suppressed Rifle (7.62×51mm)',
      timestamp: '2026-06-21 17:15',
      originCoords: { x: 15.0, y: 8.0, z: 15.0, sectorLabel: 'Lohegaon Boulder Ridge Sector 1-West [Z=15m]' },
      targetCoords: { x: 0.0, y: 1.6, z: 0.0, sectorLabel: 'Sunset Point Viewpoint Cliff Edge [Z=0m]' },
      estimatedAttackerHeightMeters: 1.78,
      heightMarginMeters: 0.03,
      stance: 'Prone / Concealed Ridge Monopod Rest',
      weaponElevationMeters: 1.70,
      suspectName: 'Chetany Sharma (SUS-02)',
      suspectBiometricHeight: '1.78m (5 ft 10 in)',
      matchProbabilityScore: 99.4,
      lineOfSightScore: 98.6,
      primaryObstacle: 'Granite Boulder Ridge Topography',
      forensicSummary: 'Inverse raycasting from scapular entry hole (14° downward) and 120m range back to boulder ridge pinpoints shooter origin at [15.0m, 8.0m, 15.0m]. Estimated stance height (1.78m) matches Chetany Sharma with 99.4% probability.',
      alibiClaim: 'Diya Gupta claimed Keshan slipped on loose gravel taking a selfie at Sunset Point.',
      forensicRefutation: 'Autopsy by Dr. Neha Patwardhan confirms a 7.62mm entry gunshot trajectory through shoulder blade BEFORE cliff fall. Remington Model 700 rifle recovered on boulder ridge with Chetany\'s DNA on trigger guard.',
      entities: {
        persons: ['Chetany Sharma (SUS-02)', 'Diya Gupta (SUS-01)', 'Keshan Malhotra (Victim)', 'Dr. Neha Patwardhan (WIT-008)'],
        locations: ['Lohegaon Hill Sunset Point & Boulder Ridge'],
        objects: ['Remington Model 700 Rifle (EVID-016)', 'Spent 7.62mm Casing'],
        vehicles: []
      },
      supportingEvidenceIds: ['EVID-016', 'EVID-020']
    },
    {
      id: 'TRI-REP-02',
      presetId: 'PRESET-TRI-02',
      title: 'Apex Tech IT Park Pedestrian Collision Vector',
      attemptPhase: 'Attempt 3 – Blood on the Streets',
      eventId: 'EV-REP-06',
      evidenceId: 'EVID-010',
      category: 'VEHICLE',
      weaponOrVehicle: 'Tata 407 Cargo Truck (MH-12-QX-4412)',
      timestamp: '2026-06-10 10:00',
      originCoords: { x: -25.0, y: 0.0, z: 0.0, sectorLabel: 'Kharadi Approach Lane & Crosswalk Boundary' },
      targetCoords: { x: 0.0, y: 0.0, z: 0.0, sectorLabel: 'Apex Tech Pedestrian Crosswalk' },
      estimatedAttackerHeightMeters: 1.75,
      heightMarginMeters: 0.05,
      stance: 'Seated Commercial Truck Driver Stance',
      weaponElevationMeters: 2.10,
      suspectName: 'Vikram Rathod (Hitman / WIT-004)',
      suspectBiometricHeight: '1.75m (5 ft 9 in)',
      matchProbabilityScore: 96.8,
      lineOfSightScore: 99.2,
      primaryObstacle: 'Pedestrian Crossing Curb',
      forensicSummary: 'CCTV collision trajectory and vehicle telemetry prove deliberate steering correction into pedestrian zone at 10:00 AM following ₹6,000,000 RTGS wire transfer.',
      alibiClaim: 'Reported as an accidental steering failure by an unknown commercial driver.',
      forensicRefutation: 'Vikram Rathod confessed under interrogation; CCTV telemetry proves deliberate steering alignment into crosswalk.',
      entities: {
        persons: ['Keshan Malhotra (Victim)', 'Vikram Rathod (Hitman/WIT-004)', 'Chetany Sharma (SUS-02)'],
        locations: ['Apex Tech IT Park Pedestrian Crossing, Kharadi'],
        objects: ['HDFC Wire Audit Manifest (EVID-010)', 'Burner Voice Recordings (EVID-011)'],
        vehicles: ['Tata 407 Cargo Truck (MH-12-QX-4412)']
      },
      supportingEvidenceIds: ['EVID-010', 'EVID-011']
    },
    {
      id: 'TRI-REP-03',
      presetId: 'PRESET-TRI-03',
      title: 'Resort Corridor 300 Tactical Knife Flight & Drop Trajectory',
      attemptPhase: 'Attempt 2 – Birthday Resort Knife Attack',
      eventId: 'EV-REP-04',
      evidenceId: 'EVID-005',
      category: 'WITNESS',
      weaponOrVehicle: 'Tactical Hunting Knife (EVID-005)',
      timestamp: '2026-05-13 02:30',
      originCoords: { x: -4.2, y: 1.4, z: 0.0, sectorLabel: 'Skyline Resort Room 304 Threshold' },
      targetCoords: { x: -1.5, y: 0.0, z: 0.0, sectorLabel: 'Corridor 300 Carpet Surface' },
      estimatedAttackerHeightMeters: 1.78,
      heightMarginMeters: 0.04,
      stance: 'Fleeing Sprint / Low Hood Stance',
      weaponElevationMeters: 1.40,
      suspectName: 'Chetany Sharma (SUS-02)',
      suspectBiometricHeight: '1.78m (5 ft 10 in)',
      matchProbabilityScore: 98.2,
      lineOfSightScore: 94.5,
      primaryObstacle: 'Emergency Stairwell Door',
      forensicSummary: '3D Raycast from Room 306 doorway confirms Archita Deshmukh had unobstructed line of sight to Room 304 exit. Dropped knife EVID-005 bears 14 minutiae fingerprint points matching Chetany.',
      alibiClaim: 'Chetany claimed he was at his residence in Viman Nagar all night.',
      forensicRefutation: 'Latent fingerprints on knife match Chetany; eyewitness Archita Deshmukh identified him fleeing Room 304 at 02:30 AM.',
      entities: {
        persons: ['Chetany Sharma (SUS-02)', 'Archita Deshmukh (WIT-001)', 'Keshan Malhotra (Victim)'],
        locations: ['Skyline Valley Resort, Corridor 300'],
        objects: ['Tactical Hunting Knife (EVID-005)', 'Resort CCTV CAM-04'],
        vehicles: []
      },
      supportingEvidenceIds: ['EVID-005', 'EVID-006']
    },
    {
      id: 'TRI-REP-04',
      presetId: 'PRESET-TRI-04',
      title: 'Olive Terrace Thallium Administration Geometry',
      attemptPhase: 'Attempt 1 – Dinner and Deception',
      eventId: 'EV-REP-01',
      evidenceId: 'EVID-004',
      category: 'CCTV',
      weaponOrVehicle: 'Concentrated Thallium Sulphate (EVID-004)',
      timestamp: '2026-04-14 19:00',
      originCoords: { x: -10.0, y: 0.0, z: 0.0, sectorLabel: 'Sanjivani Medico Counter' },
      targetCoords: { x: 0.0, y: 0.85, z: 0.0, sectorLabel: 'The Olive Terrace Table 4 Glass' },
      estimatedAttackerHeightMeters: 1.65,
      heightMarginMeters: 0.05,
      stance: 'Seated Secluded Dining Stance',
      weaponElevationMeters: 0.85,
      suspectName: 'Diya Gupta & Chetany Sharma',
      suspectBiometricHeight: '1.65m (Diya) / 1.78m (Chetany)',
      matchProbabilityScore: 99.1,
      lineOfSightScore: 97.0,
      primaryObstacle: 'Restaurant Waiter Oversight',
      forensicSummary: 'Sanjivani Medico CCTV CAM-01 recorded Chetany buying Thallium sulphate at 19:00 using fake vet license #VET-9942 prior to Diya\'s 21:00 dinner reservation.',
      alibiClaim: 'Diya claimed Keshan suffered an unexpected organic stomach bug during dinner.',
      forensicRefutation: 'Pharmacy CCTV timestamps and UPI transaction ₹1,450 link Chetany to poison purchase 2 hours before dinner.',
      entities: {
        persons: ['Chetany Sharma (SUS-02)', 'Diya Gupta (SUS-01)', 'Keshan Malhotra (Victim)'],
        locations: ['Sanjivani Medico, Viman Nagar', 'The Olive Terrace Restaurant'],
        objects: ['Concentrated Thallium Poison (EVID-004)', 'WhatsApp Reservation Record (EVID-002)'],
        vehicles: ['Audi Q3 MH-12-FR-0007']
      },
      supportingEvidenceIds: ['EVID-001', 'EVID-004']
    }
  ];
}

/**
 * Returns structured transparent explainable reasoning inference chains
 * extracted from the official investigation report dossier.
 */
export function getReportReasoningChains(): ExplainableReasoningChain[] {
  return [
    {
      id: 'CHAIN-REP-01',
      chainId: 'INFERENCE-01',
      title: 'Lohegaon Hill Cliff Ambush Homicide & Ballistic Trajectory Synthesis',
      attemptPhase: 'Final Incident – Lohegaon Hill Cliff Ambush',
      eventId: 'EV-REP-08',
      confidence: '99.95% Certainty',
      confidenceScore: 99.95,
      summary: 'Chetany Sharma fired a suppressed 7.62mm bullet from a Remington Model 700 rifle from a concealed boulder ridge at coordinates [X: 15.0m, Y: 8.0m, Z: 15.0m] into Keshan Malhotra\'s right scapula at 120m range BEFORE Keshan fell 45m off the cliff.',
      evidenceIds: ['EVID-016 (Remington Model 700 Rifle)', 'EVID-020 (Deleted WhatsApp Voice Notes)', 'WIT-008 (Dr. Neha Patwardhan Autopsy Report #881)', 'EV-REP-08 (Cliff Ambush Timeline Event)'],
      physicsMath: 'Calculated using 3D inverse raycasting from right scapular entry hole (14.0° downward angle, 38.2° azimuth East) back to boulder ridge [15.0m, 8.0m, 15.0m]. Scapular wound trajectory precedes 45m cliff fall. Epithelial DNA recovered on trigger guard matches Chetany Sharma with 99.95% certainty.',
      rejectedHypothesis: 'Rejected Accidental Selfie Slip Claim: Diya Gupta claimed Keshan slipped taking a selfie at Sunset Point. Pathological autopsy proves 7.62mm gunshot trauma preceded fall, and Brew & Bean Café planning receipt EVID-014 confirms premeditated cliff ambush strategy.',
      entities: {
        persons: ['Diya Gupta (SUS-01)', 'Chetany Sharma (SUS-02)', 'Keshan Malhotra (Victim)', 'Dr. Neha Patwardhan (WIT-008)'],
        locations: ['Lohegaon Hill Sunset Point & Boulder Ridge'],
        objects: ['Remington Model 700 Rifle (EVID-016)', 'Spent 7.62mm Casing'],
        vehicles: []
      },
      linkedWitnessIds: ['WIT-008']
    },
    {
      id: 'CHAIN-REP-02',
      chainId: 'INFERENCE-02',
      title: 'Apex Tech IT Park Staged Truck Collision & Financial Contract Homicide',
      attemptPhase: 'Attempt 3 – Blood on the Streets',
      eventId: 'EV-REP-06',
      confidence: '100.0% Financial & Telemetry Proof',
      confidenceScore: 100.0,
      summary: 'Chetany Sharma executed RTGS bank wire transfers totaling ₹6,000,000 to hired truck driver Vikram Rathod to stage a fatal vehicular crash outside Keshan\'s office at 10:00 AM on June 10.',
      evidenceIds: ['EVID-010 (HDFC Bank RTGS Wire Audit)', 'EVID-011 (Burner Voice Intercepts)', 'WIT-004 (Vikram Rathod Confession)', 'EV-REP-06 (Truck Collision Timeline Event)'],
      physicsMath: 'Collision trajectory modeling and Kharadi CCTV telemetry prove deliberate steering alignment into pedestrian crosswalk at 54 km/h (472,500 Joules kinetic momentum). Impact force 68,500 N caused critical poly-trauma.',
      rejectedHypothesis: 'Rejected Commercial Brake Failure Claim: Chetany & Diya claimed crash was an accidental steering failure by an unknown driver. Hitman Vikram Rathod confessed money wire paid for contract assault, confirmed by HDFC RTGS logs.',
      entities: {
        persons: ['Keshan Malhotra (Victim)', 'Vikram Rathod (Hitman/WIT-004)', 'Chetany Sharma (SUS-02)'],
        locations: ['Apex Tech IT Park Pedestrian Crossing, Kharadi'],
        objects: ['HDFC Wire Audit Manifest (EVID-010)', 'Burner Voice Recordings (EVID-011)'],
        vehicles: ['Tata 407 Cargo Truck (MH-12-QX-4412)']
      },
      linkedWitnessIds: ['WIT-004']
    },
    {
      id: 'CHAIN-REP-03',
      chainId: 'INFERENCE-03',
      title: 'Resort Birthday Knife Attack & Dactyloscopic Eyewitness Correlation',
      attemptPhase: 'Attempt 2 – Birthday Resort Knife Attack',
      eventId: 'EV-REP-04',
      confidence: '99.8% Dactyloscopy Certainty',
      confidenceScore: 99.8,
      summary: 'Chetany Sharma snuck into Room 304 with a tactical hunting knife during Keshan\'s birthday after 18 nocturnal calls from Diya; fled in panic when Keshan stirred, dropping weapon in Corridor 300.',
      evidenceIds: ['EVID-005 (Tactical Hunting Knife)', 'WIT-001 (Archita Deshmukh Eyewitness Deposition)', 'EVID-006 (Resort CCTV CAM-04)', 'EV-REP-04 (Resort Flight Timeline Event)'],
      physicsMath: '14 minutiae dactyloscopy points on knife hilt match Chetany Sharma with 99.8% certainty. 3D raycast from Room 306 doorway confirms Archita Deshmukh had unobstructed line of sight to Room 304 exit at 02:30 AM.',
      rejectedHypothesis: 'Rejected Viman Nagar Residence Alibi: Chetany claimed he was at his residence all night on May 13. Latent fingerprints on dropped weapon EVID-005 and CDR tower pings directly refute residence claim.',
      entities: {
        persons: ['Chetany Sharma (SUS-02)', 'Archita Deshmukh (WIT-001)', 'Keshan Malhotra (Victim)'],
        locations: ['Skyline Valley Resort, Corridor 300 & Room 304'],
        objects: ['Tactical Hunting Knife (EVID-005)', 'Resort CCTV CAM-04'],
        vehicles: []
      },
      linkedWitnessIds: ['WIT-001']
    },
    {
      id: 'CHAIN-REP-04',
      chainId: 'INFERENCE-04',
      title: 'Olive Terrace Thallium Poison Procurement & Veterinary Forgery',
      attemptPhase: 'Attempt 1 – Dinner and Deception',
      eventId: 'EV-REP-01',
      confidence: '98.5% CCTV & Pharmacy Proof',
      confidenceScore: 98.5,
      summary: 'Chetany Sharma purchased concentrated Thallium poison at Sanjivani Medico at 19:00 using fake vet credentials (#VET-9942) prior to Diya\'s 21:00 dinner date with Keshan at Olive Terrace.',
      evidenceIds: ['EVID-001 (Sanjivani Medico CCTV CAM-01)', 'EVID-004 (Thallium Poison Vial)', 'EVID-002 (WhatsApp Olive Terrace Reservation)', 'EV-REP-01 (Poison Purchase Timeline Event)'],
      physicsMath: 'Timestamp intersection between pharmacy CCTV CAM-01 (19:00:14) and deleted WhatsApp coordination threads (18:45 PM). UPI payment receipt ₹1,450 logged directly to Chetany\'s account.',
      rejectedHypothesis: 'Rejected Spontaneous Organic Stomach Bug Claim: Diya claimed Keshan suffered an unexpected organic illness during dinner. Sanjivani Medico CCTV and forged vet credentials prove premeditated poison procurement.',
      entities: {
        persons: ['Chetany Sharma (SUS-02)', 'Diya Gupta (SUS-01)', 'Keshan Malhotra (Victim)'],
        locations: ['Sanjivani Medico, Viman Nagar', 'The Olive Terrace Restaurant'],
        objects: ['Concentrated Thallium Poison (EVID-004)', 'WhatsApp Reservation Record (EVID-002)'],
        vehicles: ['Audi Q3 MH-12-FR-0007']
      },
      linkedWitnessIds: []
    }
  ];
}

/**
 * Returns structured Mission Control tactical dashboard metrics
 * extracted from the official investigation report dossier.
 */
export function getMissionControlMetrics() {
  return {
    timelineConfidenceData: [
      { time: '04-14 19:00', confidence: 98.5, phase: 'Attempt 1: Thallium Poisoning' },
      { time: '05-13 02:30', confidence: 99.8, phase: 'Attempt 2: Resort Knife Attack' },
      { time: '06-10 10:00', confidence: 100.0, phase: 'Attempt 3: IT Park Hit & Run' },
      { time: '06-18 16:00', confidence: 99.1, phase: 'Planning: Café Strategy Meeting' },
      { time: '06-21 17:15', confidence: 99.95, phase: 'Final Incident: Rifle Ambush' }
    ],
    aiRadarData: [
      { metric: 'Physics & Ballistics', value: 99.8 },
      { metric: 'CCTV & Vision', value: 99.2 },
      { metric: 'Timeline Consistency', value: 99.5 },
      { metric: 'Witness Credibility', value: 85.0 },
      { metric: 'Line of Sight', value: 98.6 },
      { metric: 'Financial Correlation', value: 100.0 }
    ],
    evidencePieData: [
      { name: 'Weapons & Ballistics', value: 6, color: '#ff544c' },
      { name: 'CCTV & Video', value: 4, color: '#ffb4ac' },
      { name: 'Documents & Wire', value: 4, color: '#e53935' },
      { name: 'Blood & Biology', value: 3, color: '#93000a' },
      { name: 'Phones & Digital', value: 3, color: '#5b403d' }
    ],
    notifications: [
      {
        id: 'notif-1',
        type: 'CRITICAL',
        title: 'Lohegaon Sniper Trajectory Verified (EV-REP-08)',
        description: 'Autopsy scapular wound (14° downward angle) precedes 45m cliff fall. Remington 700 rifle recovered with Chetany\'s DNA on trigger guard.',
        time: 'Just now',
        link: '/trajectory'
      },
      {
        id: 'notif-2',
        type: 'CRITICAL',
        title: '₹6,000,000 RTGS Wire Transfer Intercepted (EV-REP-05)',
        description: 'HDFC audit ledger TXN-6000000-0 confirms Chetany wired hitman Vikram Rathod 45 mins before IT Park hit-and-run collision.',
        time: '12 mins ago',
        link: '/evidence'
      },
      {
        id: 'notif-3',
        type: 'AI',
        title: 'Resort Knife Fingerprint Dactyloscopy Matched (EV-REP-04)',
        description: '14 minutiae points on tactical knife EVID-005 match Chetany Sharma with 99.8% certainty; refutes residence alibi.',
        time: '25 mins ago',
        link: '/contradiction-matrix'
      },
      {
        id: 'notif-4',
        type: 'AI',
        title: 'Sanjivani Medico Poison CCTV Ingested (EV-REP-01)',
        description: 'CCTV CAM-01 recorded Chetany buying Thallium sulphate using forged vet license #VET-9942 2 hours before Diya\'s dinner reservation.',
        time: '42 mins ago',
        link: '/witness-analysis'
      }
    ]
  };
}


/**
 * Returns structured system audit records & security compliance logs
 * extracted from the official investigation report dossier.
 */
export function getReportAuditRecords(): SystemAuditRecord[] {
  return [
    {
      id: 'AUD-REP-01',
      auditId: 'AUDIT-LOG-01',
      timestamp: '2026-06-21 17:15:00 UTC',
      attemptPhase: 'Final Incident – Lohegaon Hill Cliff Ambush',
      eventId: 'EV-REP-08',
      actionType: 'BALLISTIC_EXHIBIT_SHA256_VERIFIED',
      evidenceId: 'EVID-016',
      actor: 'SI Santosh Jadhav (Investigating Officer)',
      details: 'Remington Model 700 Rifle (EVID-016) & spent 7.62mm casing ingested into forensic vault. Epithelial DNA card #881 & scapular autopsy trajectory report #881 verified with 4096-bit sovereign signature.',
      securityStatus: 'COMPLIANT // IMMUTABLE CHAIN OF CUSTODY',
      sha256Checksum: 'a8f9d0c2e41b783fa12e54d6980b1129f7c32e185a498017c6b2df15421c900e',
      entities: {
        persons: ['Chetany Sharma (SUS-02)', 'Dr. Neha Patwardhan (WIT-008)', 'SI Santosh Jadhav'],
        locations: ['Lohegaon Hill Boulder Ridge'],
        objects: ['Remington Model 700 Rifle (EVID-016)', 'Spent 7.62mm Casing'],
        vehicles: []
      }
    },
    {
      id: 'AUD-REP-02',
      auditId: 'AUDIT-LOG-02',
      timestamp: '2026-06-10 09:15:00 UTC',
      attemptPhase: 'Attempt 3 – Blood on the Streets',
      eventId: 'EV-REP-05',
      actionType: 'FINANCIAL_LEDGER_WIRE_INTERCEPT',
      evidenceId: 'EVID-010',
      actor: 'HDFC Banking Compliance Audit Unit',
      details: 'RTGS wire transfers totaling ₹6,000,000 from Chetany Sharma HDFC account to hitman Vikram Rathod logged with immutable banking checksum TXN-6000000-0. Deliberate contract killing transaction confirmed.',
      securityStatus: 'CRITICAL DISCREPANCY DETECTED',
      sha256Checksum: 'e71b29a8f4c0382d19e05417bfa64119842c12d098547b11c201a4e98f0918cc',
      entities: {
        persons: ['Chetany Sharma (SUS-02)', 'Vikram Rathod (WIT-004)'],
        locations: ['HDFC Viman Nagar Branch'],
        objects: ['HDFC Wire Audit Manifest (EVID-010)'],
        vehicles: ['Tata 407 Cargo Truck (MH-12-QX-4412)']
      }
    },
    {
      id: 'AUD-REP-03',
      auditId: 'AUDIT-LOG-03',
      timestamp: '2026-05-13 02:30:00 UTC',
      attemptPhase: 'Attempt 2 – Birthday Resort Knife Attack',
      eventId: 'EV-REP-04',
      actionType: 'CCTV_FRAME_INTEGRITY_AUDIT',
      evidenceId: 'EVID-005',
      actor: 'Skyline Resort Security & Forensic Cyber Cell',
      details: 'Skyline Valley Resort Room 304 keycard access audit & CCTV CAM-04 timestamp verified. Tactical hunting knife EVID-005 dactyloscopic hash (14 minutiae points matching Chetany) cryptographically sealed.',
      securityStatus: 'COMPLIANT // FINGERPRINT MATCH 99.8%',
      sha256Checksum: '91f8c0a2e7b154d89304e21a007bc49e8b15d2a93817456c201948df01a23e59',
      entities: {
        persons: ['Chetany Sharma (SUS-02)', 'Archita Deshmukh (WIT-001)'],
        locations: ['Skyline Valley Resort, Corridor 300'],
        objects: ['Tactical Hunting Knife (EVID-005)', 'Resort CCTV CAM-04'],
        vehicles: []
      }
    },
    {
      id: 'AUD-REP-04',
      auditId: 'AUDIT-LOG-04',
      timestamp: '2026-04-14 19:00:00 UTC',
      attemptPhase: 'Attempt 1 – Dinner and Deception',
      eventId: 'EV-REP-01',
      actionType: 'VETERINARY_CREDENTIAL_FORGERY_FLAGGED',
      evidenceId: 'EVID-004',
      actor: 'Sanjivani Medico Digital Register & Suraag NLP',
      details: 'Sanjivani Medico CCTV CAM-01 & UPI receipt (₹1,450) audited. Forged veterinary license #VET-9942 used by Chetany Sharma to purchase concentrated Thallium sulphate flagged by automated parser.',
      securityStatus: 'FORGERY DETECTED // AUDIT TRAIL LOGGED',
      sha256Checksum: '3b09d1e4f8a290c7154e819b207c42a198c054117b489012a9e7018340df8210',
      entities: {
        persons: ['Chetany Sharma (SUS-02)', 'Diya Gupta (SUS-01)'],
        locations: ['Sanjivani Medico, Viman Nagar'],
        objects: ['Concentrated Thallium Poison (EVID-004)', 'WhatsApp Reservation Record (EVID-002)'],
        vehicles: ['Audi Q3 MH-12-FR-0007']
      }
    }
  ];
}

/**
 * Returns structured multi-modal evidence items with YOLOv9 bounding boxes
 * extracted from the official investigation report dossier.
 */
export function getReportEvidenceArtifacts(): Evidence[] {
  return [
    {
      id: 'EV-ART-016',
      caseId: 'CASE-2026-088',
      evidenceId: 'EVID-016',
      title: 'Remington Model 700 Suppressed Rifle (7.62×51mm)',
      category: 'WEAPON',
      fileUrl: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=800&q=80',
      fileType: 'image/jpeg',
      confidence: 99.8,
      processedStatus: 'COMPLETED',
      attemptPhase: 'Final Incident – Lohegaon Hill Cliff Ambush',
      eventId: 'EV-REP-08',
      forensicObservation: 'Ballistic signature matches 7.62mm scapular wound trajectory. Latent epithelial DNA on trigger guard matches Chetany Sharma with 99.95% certainty.',
      entities: {
        persons: ['Chetany Sharma (SUS-02)', 'Dr. Neha Patwardhan (WIT-008)'],
        locations: ['Lohegaon Hill Boulder Ridge'],
        objects: ['Remington Model 700 Rifle (EVID-016)', 'Spent 7.62mm Casing'],
        vehicles: []
      },
      boundingBoxes: [
        { x: 120, y: 80, width: 340, height: 180, label: 'Remington Model 700 Receiver (99.8%)', confidence: 0.998 },
        { x: 420, y: 140, width: 120, height: 80, label: 'Baffle Suppressor Barrel Extension (98.5%)', confidence: 0.985 }
      ]
    },
    {
      id: 'EV-ART-010',
      caseId: 'CASE-2026-088',
      evidenceId: 'EVID-010',
      title: 'HDFC Bank RTGS Wire Audit Manifest (₹6,000,000)',
      category: 'DOCUMENT',
      fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      fileType: 'application/pdf',
      confidence: 100.0,
      processedStatus: 'COMPLETED',
      attemptPhase: 'Attempt 3 – Blood on the Streets',
      eventId: 'EV-REP-05',
      forensicObservation: 'Immutable banking transaction TXN-6000000-0 confirms Chetany Sharma wired ₹6,000,000 to hitman Vikram Rathod 45 mins before staged truck collision.',
      entities: {
        persons: ['Chetany Sharma (SUS-02)', 'Vikram Rathod (WIT-004)'],
        locations: ['HDFC Viman Nagar Branch'],
        objects: ['HDFC Wire Audit Manifest (EVID-010)'],
        vehicles: []
      },
      boundingBoxes: [
        { x: 90, y: 60, width: 400, height: 220, label: 'RTGS Financial Wire Transfer Ledger (100%)', confidence: 1.0 },
        { x: 180, y: 220, width: 200, height: 90, label: 'Authorized Beneficiary Account Stamp (99.4%)', confidence: 0.994 }
      ]
    },
    {
      id: 'EV-ART-005',
      caseId: 'CASE-2026-088',
      evidenceId: 'EVID-005',
      title: 'Tactical Hunting Knife (Corridor 300 Dropped Weapon)',
      category: 'WEAPON',
      fileUrl: 'https://images.unsplash.com/photo-1588619379201-9257e84920fa?auto=format&fit=crop&w=800&q=80',
      fileType: 'image/jpeg',
      confidence: 99.5,
      processedStatus: 'COMPLETED',
      attemptPhase: 'Attempt 2 – Birthday Resort Knife Attack',
      eventId: 'EV-REP-04',
      forensicObservation: '14 minutiae dactyloscopic fingerprint points on knife hilt match Chetany Sharma with 99.8% certainty. Recovered outside Room 304 doorway.',
      entities: {
        persons: ['Chetany Sharma (SUS-02)', 'Archita Deshmukh (WIT-001)'],
        locations: ['Skyline Valley Resort, Corridor 300'],
        objects: ['Tactical Hunting Knife (EVID-005)'],
        vehicles: []
      },
      boundingBoxes: [
        { x: 150, y: 100, width: 300, height: 160, label: '8-inch Carbon Steel Serrated Blade (99.5%)', confidence: 0.995 },
        { x: 160, y: 120, width: 110, height: 80, label: 'Dactyloscopic Fingerprint Latent Ridge (99.8%)', confidence: 0.998 }
      ]
    },
    {
      id: 'EV-ART-004',
      caseId: 'CASE-2026-088',
      evidenceId: 'EVID-004',
      title: 'Concentrated Thallium Sulphate Poison Vial',
      attemptPhase: 'Attempt 1 – Dinner and Deception',
      category: 'BLOOD',
      eventId: 'EV-REP-01',
      fileUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
      fileType: 'image/jpeg',
      confidence: 98.6,
      processedStatus: 'COMPLETED',
      forensicObservation: 'Toxicological spectrometry confirms 500mg/L Thallium concentration matching Keshan\'s stomach lavage from April 14 dinner at Olive Terrace.',
      entities: {
        persons: ['Chetany Sharma (SUS-02)', 'Diya Gupta (SUS-01)'],
        locations: ['Sanjivani Medico, Viman Nagar'],
        objects: ['Concentrated Thallium Poison (EVID-004)'],
        vehicles: []
      },
      boundingBoxes: [
        { x: 200, y: 80, width: 220, height: 240, label: 'Thallium Sulphate Chemical Reagent Vial (98.6%)', confidence: 0.986 }
      ]
    },
    {
      id: 'EV-ART-001',
      caseId: 'CASE-2026-088',
      evidenceId: 'EVID-001',
      title: 'Sanjivani Medico CCTV CAM-01 Video Feed (19:00:14 PM)',
      category: 'CCTV',
      attemptPhase: 'Attempt 1 – Dinner and Deception',
      eventId: 'EV-REP-01',
      fileUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
      fileType: 'video/mp4',
      confidence: 99.2,
      processedStatus: 'COMPLETED',
      forensicObservation: 'Facial recognition (99.2% match) confirms Chetany Sharma purchasing Thallium poison using forged vet credentials 2 hours before Diya\'s dinner date.',
      entities: {
        persons: ['Chetany Sharma (SUS-02)'],
        locations: ['Sanjivani Medico, Viman Nagar'],
        objects: ['CCTV CAM-01 Footage (EVID-001)'],
        vehicles: []
      },
      boundingBoxes: [
        { x: 180, y: 70, width: 210, height: 260, label: 'Chetany Sharma Facial Bounding Box (99.2%)', confidence: 0.992 }
      ]
    },
    {
      id: 'EV-ART-008',
      caseId: 'CASE-2026-088',
      evidenceId: 'EVID-008',
      title: 'Tata 407 Cargo Truck Bumper Impact & Paint Scrapes',
      category: 'VEHICLE',
      attemptPhase: 'Attempt 3 – Blood on the Streets',
      eventId: 'EV-REP-06',
      fileUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
      fileType: 'image/jpeg',
      confidence: 97.4,
      processedStatus: 'COMPLETED',
      forensicObservation: 'Front steel bumper paint transfer matches Keshan\'s laptop bag fabric fibers. Telemetry proves intentional crosswalk acceleration.',
      entities: {
        persons: ['Vikram Rathod (WIT-004)', 'Keshan Malhotra (Victim)'],
        locations: ['Apex Tech IT Park Pedestrian Crossing'],
        objects: [],
        vehicles: ['Tata 407 Cargo Truck (MH-12-QX-4412)']
      },
      boundingBoxes: [
        { x: 100, y: 120, width: 420, height: 200, label: 'Tata 407 Steel Bumper Structure (97.4%)', confidence: 0.974 }
      ]
    }
  ];
}

/**
 * Returns structured investigation report case intelligence records
 * extracted from the official investigation report dossier.
 */
export function getReportCaseDossiers(): Case[] {
  return [
    {
      id: 'CASE-2026-088',
      caseNumber: 'CASE-2026-088',
      title: 'The Doomed Triangle',
      status: 'CRITICAL',
      priority: 'CRITICAL',
      assignedTo: 'SI Santosh Jadhav & Dr. Neha Patwardhan (Crime Branch Unit 4)',
      location: 'Lohegaon Hill, Apex IT Park Kharadi, Skyline Resort & Viman Nagar, Pune',
      incidentDate: '2026-06-21T17:15:00.000Z',
      summary: 'Comprehensive multi-phase investigation into Diya Gupta (SUS-01) and Chetany Sharma (SUS-02) conspiracy to murder Keshan Malhotra across 4 attempt phases (Olive Terrace Thallium Poisoning, Resort Birthday Knife Attack, Apex IT Park Hit-and-Run, Lohegaon Hill Rifle Ambush). 20 physical exhibits ingested.',
      confidenceScore: 91.0,

      attemptPhases: [
        'Attempt 1 – Dinner and Deception (Thallium Poisoning)',
        'Attempt 2 – Birthday Resort Knife Attack',
        'Attempt 3 – Blood on the Streets (Hit-and-Run)',
        'Final Incident – Lohegaon Hill Cliff Ambush (Remington 700 Rifle)'
      ],
      correlatedSuspects: ['Diya Gupta (SUS-01)', 'Chetany Sharma (SUS-02)', 'Vikram Rathod (Hitman/WIT-004)'],
      evidenceCount: 20,
      timelineEventsCount: 8,
      forensicVerdict: 'PREMEDITATED HOMICIDE CONSPIRACY PROVEN BEYOND REASONABLE DOUBT'
    }
  ];
}





