import {
  NetworkEntityNode,
  NetworkRelationshipLink,
  SocialNetworkAnalysisPayload
} from '../types';
import { analyzeNetworkCentrality } from '../utils/graphCentrality';

export const rawDoomedTriangleNodes: NetworkEntityNode[] = [
  {
    id: 'DIYA',
    label: 'Diya Gupta',
    name: 'Diya Gupta',
    role: 'KINGPIN',
    category: 'SUSPECT',
    avatarInitials: 'DG',
    threatLevel: 'CRITICAL',
    color: '#ff544c',
    description: 'Primary Mastermind & Strategic Orchestrator. Sole named beneficiary of Keshan Malhotra’s ₹45,000,000 HDFC ERGO life insurance policy. Coordinated and funded all 4 homicide attempts across 3 months.',
    organizationOrFaction: 'Inner Conspiracy Core / Beneficiary',
    operationalPhases: [
      'Attempt 1 – Dinner and Deception (Thallium Procurement)',
      'Attempt 2 – Skyline Resort Knife Assault',
      'Attempt 3 – Kharadi Crossing Vehicular Ambush',
      'Attempt 4 – Lohegaon Hill Cliff Homicide'
    ],
    phoneOrHandle: 'iPhone 15 Pro (IMEI #354910291) // Signal Alias: @d_aura99',
    financialVolumeInr: 45000000,
    directEvidenceIds: ['EVID-001', 'EVID-006', 'EVID-014', 'EVID-017', 'EVID-020'],
    alibiStatus: 'Refuted: Claimed solitary shopping at Phoenix Marketcity; disproved by CCTV CAM-05 and Cellebrite voice note telemetry.',
    x: 420,
    y: 200
  },
  {
    id: 'CHETANY',
    label: 'Chetany Sharma',
    name: 'Chetany Sharma',
    role: 'INTERMEDIARY',
    category: 'SUSPECT',
    avatarInitials: 'CS',
    threatLevel: 'CRITICAL',
    color: '#e53935',
    description: 'Primary Operational Broker & Field Executioner. Key intermediary linking Diya Gupta to underground resource networks (arms, poisons, hitmen). Discharged suppressed Remington 700 sniper rifle at Lohegaon Hill.',
    organizationOrFaction: 'Operational Command / Field Cut-Out',
    operationalPhases: [
      'Attempt 1 – Chemical Sourcing via Forged VET-9942',
      'Attempt 2 – Room 304 Corridor Knife Infiltration',
      'Attempt 3 – ₹6.0M RTGS Wire to Hitman Vikram',
      'Attempt 4 – Lohegaon Ridge Sniper Execution'
    ],
    phoneOrHandle: 'Samsung Galaxy S24 (IMEI #864902102) // Burner: +91 98220 11092',
    financialVolumeInr: 6500000,
    directEvidenceIds: ['EVID-004', 'EVID-005', 'EVID-010', 'EVID-011', 'EVID-016'],
    alibiStatus: 'Refuted: Claimed out-of-town alibi; disproved by epithelial DNA on Remington 700 and cell tower triangulation.',
    x: 580,
    y: 320
  },
  {
    id: 'KESHAN',
    label: 'Keshan Malhotra',
    name: 'Keshan Malhotra',
    role: 'VICTIM',
    category: 'VICTIM',
    avatarInitials: 'KM',
    threatLevel: 'NEUTRAL',
    color: '#00e676',
    description: 'Victim & Insured Target. 29-year-old tech entrepreneur. Subjected to 3 survived premeditated attempts before fatal homicide at Lohegaon Hill Sunset Point via scapular gunshot and cliff precipitation.',
    organizationOrFaction: 'Malhotra Infotech / Target',
    operationalPhases: [
      'Target of Attempt 1, 2, 3, and 4'
    ],
    phoneOrHandle: 'OnePlus 12 (IMEI #8619028471)',
    financialVolumeInr: 45000000,
    directEvidenceIds: ['EVID-001', 'EVID-005', 'EVID-016', 'EVID-017'],
    alibiStatus: 'Deceased victim of multi-attempt homicide.',
    x: 420,
    y: 450
  },
  {
    id: 'VIKRAM',
    label: 'Vikram Rathod',
    name: 'Vikram Rathod',
    role: 'OPERATIVE',
    category: 'SUSPECT',
    avatarInitials: 'VR',
    threatLevel: 'HIGH',
    color: '#ff9800',
    description: 'Hired Contract Hitman / Operative. Contracted by Chetany Sharma for ₹6,000,000 RTGS wire to execute Attempt 3 vehicular hit-and-run at Apex Tech IT Park crossing using modified Tata 407 truck.',
    organizationOrFaction: 'Underground Contract Muscle',
    operationalPhases: [
      'Attempt 3 – Blood on the Streets (Kharadi Collision)'
    ],
    phoneOrHandle: 'Nokia Feature Burner (IMEI #351092004) // Tata 407 MH-12-QX-4412',
    financialVolumeInr: 6000000,
    directEvidenceIds: ['EVID-010', 'EVID-011', 'EVID-012', 'EVID-013'],
    alibiStatus: 'Confessed under custodial interrogation following RTGS bank link audit.',
    x: 780,
    y: 320
  },
  {
    id: 'SURESH_ARMS',
    label: 'Suresh "Goli" Nair',
    name: 'Suresh Nair (Alias "Goli")',
    role: 'FACILITATOR',
    category: 'FACILITATOR',
    avatarInitials: 'SN',
    threatLevel: 'HIGH',
    color: '#b388ff',
    description: 'Underground Black Market Arms Dealer (Kasba Peth network). Procured the suppressed Remington Model 700 bolt-action rifle and 7.62x51mm match-grade ammunition for ₹500,000 cash for Chetany Sharma.',
    organizationOrFaction: 'Kasba Arms Syndicate',
    operationalPhases: [
      'Attempt 4 – Firearm & Suppressor Procurement'
    ],
    phoneOrHandle: 'Unregistered Telegram Bot / Signal @goli_supplies',
    financialVolumeInr: 500000,
    directEvidenceIds: ['EVID-016', 'EVID-018'],
    alibiStatus: 'Under surveillance; CCTV confirms rendezvous with Chetany at Swargate Bus Depot on June 18.',
    x: 720,
    y: 180
  },
  {
    id: 'DR_KULKARNI',
    label: 'Dr. Rajesh Kulkarni',
    name: 'Dr. Rajesh Kulkarni',
    role: 'FACILITATOR',
    category: 'FACILITATOR',
    avatarInitials: 'RK',
    threatLevel: 'HIGH',
    color: '#ab47bc',
    description: 'Corrupt Veterinary Supplier & Registered Pharmacist (Sanjivani Medico). Supplied 25g of concentrated Thallium sulphate for Attempt 1 under forged livestock rodenticide license #VET-9942 for ₹250,000 kickback.',
    organizationOrFaction: 'Sanjivani Medico Pharma',
    operationalPhases: [
      'Attempt 1 – Chemical Sourcing'
    ],
    phoneOrHandle: 'Landline: 020-26129401 // Mobile: +91 94220 88192',
    financialVolumeInr: 250000,
    directEvidenceIds: ['EVID-004'],
    alibiStatus: 'Ledger seized; chemical dispensing discrepancy matches Thallium isotope batch #TL-2026-904.',
    x: 720,
    y: 460
  },
  {
    id: 'ROHIT_FIN',
    label: 'Rohit Verma',
    name: 'Rohit Verma',
    role: 'FINANCIAL_CONDUIT',
    category: 'FACILITATOR',
    avatarInitials: 'RV',
    threatLevel: 'MEDIUM',
    color: '#ffd700',
    description: 'Financial Courier & Hawala Layer. Handled ₹1,200,000 cash layering and USDT cryptocurrency conversions on behalf of Diya Gupta to obscure payment tracks to Chetany and logistical facilitators.',
    organizationOrFaction: 'Bhavani Peth Angadia / Crypto Conduit',
    operationalPhases: [
      'Attempts 1, 3, 4 – Money Laundering & Cash Drops'
    ],
    phoneOrHandle: 'Telegram @pune_wire9 // USDT TRC20: TJx78194...09aa',
    financialVolumeInr: 1200000,
    directEvidenceIds: ['EVID-010', 'EVID-020'],
    alibiStatus: 'Transaction ledger retrieved from encrypted cloud backup.',
    x: 280,
    y: 150
  },
  {
    id: 'SUNIL_LOG',
    label: 'Sunil "Chotta" More',
    name: 'Sunil More',
    role: 'FACILITATOR',
    category: 'FACILITATOR',
    avatarInitials: 'SM',
    threatLevel: 'MEDIUM',
    color: '#8d6e63',
    description: 'Automotive Chop-Shop Specialist. Fabricated fake commercial registration plates (MH-12-QX-4412) and altered steering sensor dampeners on the Tata 407 truck for Vikram Rathod for ₹120,000 cash.',
    organizationOrFaction: 'Hadapsar Auto Logistics',
    operationalPhases: [
      'Attempt 3 – Vehicle Fabrication & Concealment'
    ],
    phoneOrHandle: 'Mobile: +91 97660 44921',
    financialVolumeInr: 120000,
    directEvidenceIds: ['EVID-012', 'EVID-013'],
    alibiStatus: 'Identified by garage assistant witness WIT-007.',
    x: 900,
    y: 320
  },
  {
    id: 'ARCHITA_WIT',
    label: 'Archita Deshmukh',
    name: 'Archita Deshmukh',
    role: 'WITNESS',
    category: 'WITNESS',
    avatarInitials: 'AD',
    threatLevel: 'LOW',
    color: '#26a69a',
    description: 'Skyline Resort Guest (Room 306). Star eyewitness for Attempt 2; observed Chetany Sharma fleeing Room 304 in a panicked state and dropping the bloodstained tactical knife EVID-005 at 02:30 AM on May 13.',
    organizationOrFaction: 'Independent Eyewitness (WIT-001)',
    operationalPhases: [
      'Attempt 2 Eyewitness'
    ],
    phoneOrHandle: 'iPhone 13 // Statement verified under Sec 164 CrPC',
    directEvidenceIds: ['EVID-005', 'EVID-006'],
    alibiStatus: 'Credibility score 98.2%; corroborated by resort electronic corridor lock EVID-006.',
    x: 750,
    y: 570
  },
  {
    id: 'KUNAL_INS',
    label: 'Kunal Shah',
    name: 'Kunal Shah',
    role: 'WITNESS',
    category: 'WITNESS',
    avatarInitials: 'KS',
    threatLevel: 'LOW',
    color: '#29b6f6',
    description: 'HDFC ERGO Senior Claims Fraud Investigator. Flagged expedited ₹45M claim filed by Diya Gupta within 18 hours of Keshan’s death; uncovered backdated policy nomination signature forgery.',
    organizationOrFaction: 'HDFC ERGO Special Investigations Unit',
    operationalPhases: [
      'Post-Incident Financial Audit'
    ],
    phoneOrHandle: 'Corporate: kunal.shah@hdfcergo.corp // Landline: 020-67119000',
    financialVolumeInr: 45000000,
    directEvidenceIds: ['EVID-017'],
    alibiStatus: 'Official corporate investigator; submitted certified forensic audit dossier.',
    x: 200,
    y: 290
  },
  {
    id: 'DR_PATWARDHAN',
    label: 'Dr. Neha Patwardhan',
    name: 'Dr. Neha Patwardhan',
    role: 'INVESTIGATOR',
    category: 'INVESTIGATOR',
    avatarInitials: 'NP',
    threatLevel: 'NEUTRAL',
    color: '#66bb6a',
    description: 'Senior Forensic Pathologist & Chief Medical Examiner. Autopsy report conclusively establishes that 7.62mm scapular bullet wound occurred prior to 45-meter cliff precipitation, refuting staged selfie fall claim.',
    organizationOrFaction: 'Sassoon General Hospital Forensic Dept.',
    operationalPhases: [
      'All Post-Mortem & Ballistics Inquests'
    ],
    phoneOrHandle: 'Dept of Forensic Medicine, Sassoon Hospital',
    directEvidenceIds: ['EVID-016', 'EVID-020'],
    alibiStatus: 'Lead Forensic Pathologist.',
    x: 250,
    y: 560
  },
  {
    id: 'SI_JADHAV',
    label: 'SI Santosh Jadhav',
    name: 'SI Santosh Jadhav',
    role: 'INVESTIGATOR',
    category: 'INVESTIGATOR',
    avatarInitials: 'SJ',
    threatLevel: 'NEUTRAL',
    color: '#42a5f5',
    description: 'Lead Crime Branch Investigating Officer. Spearheaded multi-agency cross-correlation of 75 timeline events, 20 evidence exhibits, and 16 witness depositions across Pune jurisdiction.',
    organizationOrFaction: 'Pune Crime Branch, Cyber-Physical Forensic Unit',
    operationalPhases: [
      'Master Investigation Supervisor'
    ],
    phoneOrHandle: 'Crime Branch Unit 4, Pune Police HQ',
    directEvidenceIds: ['EVID-001', 'EVID-005', 'EVID-010', 'EVID-016'],
    alibiStatus: 'Lead Investigating Officer.',
    x: 120,
    y: 430
  },
  {
    id: 'MANOJ_GUARD',
    label: 'Manoj Tiwary',
    name: 'Manoj Tiwary',
    role: 'WITNESS',
    category: 'WITNESS',
    avatarInitials: 'MT',
    threatLevel: 'LOW',
    color: '#80cbc4',
    description: 'Apex Tech IT Park Security Supervisor (WIT-005). Eyewitness to Attempt 3; recorded exact timestamp of Tata 407 accelerating into pedestrian zone and noted partial plate MH-12-QX.',
    organizationOrFaction: 'Apex Tech Park Security (WIT-005)',
    operationalPhases: [
      'Attempt 3 Eyewitness'
    ],
    phoneOrHandle: 'Apex Tech Security Post #1',
    directEvidenceIds: ['EVID-012'],
    alibiStatus: 'Corroborated by CCTV CAM-03 gate logs.',
    x: 920,
    y: 450
  },
  {
    id: 'ANIKET_TECH',
    label: 'Aniket Joshi',
    name: 'Aniket Joshi',
    role: 'INVESTIGATOR',
    category: 'INVESTIGATOR',
    avatarInitials: 'AJ',
    threatLevel: 'NEUTRAL',
    color: '#4db6ac',
    description: 'Digital Forensics & CDR/Tower Triangulation Specialist. Verified cell tower pings (Tower-100, Tower-101, Lohegaon-South) isolating Diya and Chetany’s synchronized handsets during the homicide window.',
    organizationOrFaction: 'Cyber Forensic Cell, Pune',
    operationalPhases: [
      'Digital Telemetry Fusion'
    ],
    phoneOrHandle: 'Cyber Cell Forensic Lab #3',
    directEvidenceIds: ['EVID-014', 'EVID-020'],
    alibiStatus: 'Digital Forensic Technical Officer.',
    x: 420,
    y: 60
  },
  {
    id: 'POOJA_MALHOTRA',
    label: 'Pooja Malhotra',
    name: 'Pooja Malhotra',
    role: 'WITNESS',
    category: 'WITNESS',
    avatarInitials: 'PM',
    threatLevel: 'LOW',
    color: '#4dd0e1',
    description: 'Victim’s Sister (WIT-002). Corroborated Keshan’s severe gastric illness following the April 14 Olive Terrace dinner and confirmed Diya’s repeated inquiries about Keshan’s life insurance paperwork.',
    organizationOrFaction: 'Malhotra Family (WIT-002)',
    operationalPhases: [
      'Attempt 1 Witness & Motive Corroborator'
    ],
    phoneOrHandle: 'Mobile: +91 98230 49102',
    directEvidenceIds: ['EVID-001', 'EVID-004'],
    alibiStatus: 'Deposition recorded under Sec 161 CrPC.',
    x: 580,
    y: 570
  },
  {
    id: 'RHEA_RESORT',
    label: 'Rhea Fernandez',
    name: 'Rhea Fernandez',
    role: 'WITNESS',
    category: 'WITNESS',
    avatarInitials: 'RF',
    threatLevel: 'LOW',
    color: '#80deea',
    description: 'Skyline Resort Reception Manager (WIT-003). Preserved electronic keycard logs (EVID-006) showing Diya Gupta booked Room 304 under an alias and unlocked the balcony interconnect door.',
    organizationOrFaction: 'Skyline Resort & Spa Staff (WIT-003)',
    operationalPhases: [
      'Attempt 2 Keycard & Booking Audit'
    ],
    phoneOrHandle: 'Skyline Resort Front Desk Extension 101',
    directEvidenceIds: ['EVID-006'],
    alibiStatus: 'Verified against PMS server database backup.',
    x: 580,
    y: 80
  }
];

export const rawDoomedTriangleLinks: NetworkRelationshipLink[] = [
  // Core Kingpin <-> Intermediary Bridge
  {
    id: 'LINK-01',
    source: 'DIYA',
    target: 'CHETANY',
    channel: 'COMMUNICATION',
    label: '482 Encrypted Signal VoIP & Voice Notes (EVID-020)',
    weight: 10,
    frequencyCount: 482,
    communicationMedium: 'Signal End-to-End Encrypted VoIP / Voice Bursts',
    evidenceExhibitIds: ['EVID-020'],
    isCriticalConduit: true,
    isDirectional: true,
    investigativeNote: 'Direct strategic coordination conduit. Diya issues hit parameters; Chetany returns operational progress updates.'
  },
  {
    id: 'LINK-02',
    source: 'DIYA',
    target: 'CHETANY',
    channel: 'FINANCIAL',
    label: '₹6,500,000 Advance & Execution Kickback Wires',
    weight: 10,
    transactionAmountInr: 6500000,
    frequencyCount: 6,
    communicationMedium: 'RTGS / Split Bank Transfers / Cash Courier',
    evidenceExhibitIds: ['EVID-010', 'EVID-020'],
    isCriticalConduit: true,
    isDirectional: true,
    investigativeNote: 'Primary funding pipeline from Kingpin to Intermediary for procuring hitmen, weapons, and poisons.'
  },
  {
    id: 'LINK-03',
    source: 'DIYA',
    target: 'CHETANY',
    channel: 'OPERATIONAL',
    label: 'Physical Conspiracy Planning Meetings (Brew & Bean / Olive Terrace)',
    weight: 9,
    frequencyCount: 8,
    communicationMedium: 'In-person rendezvous (CCTV CAM-05)',
    evidenceExhibitIds: ['EVID-001', 'EVID-014'],
    isCriticalConduit: true,
    isDirectional: false,
    investigativeNote: 'Physical handoffs of route maps, target schedules, and keycard credentials.'
  },

  // Kingpin <-> Victim (Fiancee / Beneficiary relationship)
  {
    id: 'LINK-04',
    source: 'DIYA',
    target: 'KESHAN',
    channel: 'FINANCIAL',
    label: '₹45,000,000 Life Insurance Policy Beneficiary Designation',
    weight: 10,
    transactionAmountInr: 45000000,
    frequencyCount: 1,
    communicationMedium: 'HDFC ERGO Policy Nomination Contract',
    evidenceExhibitIds: ['EVID-017'],
    isCriticalConduit: true,
    isDirectional: true,
    investigativeNote: 'Central financial motive for the 4-phase homicide conspiracy.'
  },
  {
    id: 'LINK-05',
    source: 'DIYA',
    target: 'KESHAN',
    channel: 'OPERATIONAL',
    label: 'Lured Target to Incident Sites (Olive Terrace / Lohegaon Hill)',
    weight: 9,
    frequencyCount: 4,
    communicationMedium: 'Personal Relationship / Dinner & Sunset Invitations',
    evidenceExhibitIds: ['EVID-001', 'EVID-016', 'EVID-020'],
    isCriticalConduit: true,
    isDirectional: true,
    investigativeNote: 'Diya personally positioned Keshan at the fatal Lohegaon cliff edge under pretense of sunset selfie.'
  },

  // Intermediary <-> Hitman Vikram Rathod
  {
    id: 'LINK-06',
    source: 'CHETANY',
    target: 'VIKRAM',
    channel: 'FINANCIAL',
    label: 'RTGS ₹6,000,000 Hit Contract Transfer (EVID-010)',
    weight: 9,
    transactionAmountInr: 6000000,
    frequencyCount: 2,
    communicationMedium: 'HDFC Kharadi Bank RTGS Wire Transfer',
    evidenceExhibitIds: ['EVID-010'],
    isCriticalConduit: true,
    isDirectional: true,
    investigativeNote: 'Wired 15 minutes before the Kharadi tech park pedestrian crossing collision.'
  },
  {
    id: 'LINK-07',
    source: 'CHETANY',
    target: 'VIKRAM',
    channel: 'COMMUNICATION',
    label: 'Burner Intercepts: "Target Crossing in 5 Mins" (EVID-011)',
    weight: 8,
    frequencyCount: 14,
    communicationMedium: 'Nokia Feature Burner SMS / Voice Call',
    evidenceExhibitIds: ['EVID-011'],
    isCriticalConduit: true,
    isDirectional: true,
    investigativeNote: 'Real-time spotting telemetry fed to driver Vikram.'
  },

  // Hitman Vikram <-> Target Keshan (Attempt 3 Collision)
  {
    id: 'LINK-08',
    source: 'VIKRAM',
    target: 'KESHAN',
    channel: 'OPERATIONAL',
    label: 'Attempt 3: Tata 407 Vehicular Hit-and-Run (62 km/h Impact)',
    weight: 9,
    frequencyCount: 1,
    communicationMedium: 'Commercial Vehicle Ramming',
    evidenceExhibitIds: ['EVID-012', 'EVID-013'],
    isCriticalConduit: true,
    isDirectional: true,
    investigativeNote: 'Victim sustained multiple pelvic fractures; survived due to safety barricade.'
  },

  // Intermediary <-> Arms Dealer Suresh Nair
  {
    id: 'LINK-09',
    source: 'CHETANY',
    target: 'SURESH_ARMS',
    channel: 'FINANCIAL',
    label: '₹500,000 Cash for Suppressed Remington 700 Rifle',
    weight: 8,
    transactionAmountInr: 500000,
    frequencyCount: 1,
    communicationMedium: 'Kasba Peth Cash Handoff',
    evidenceExhibitIds: ['EVID-016', 'EVID-018'],
    isCriticalConduit: true,
    isDirectional: true,
    investigativeNote: 'Procurement of precision sniper rifle used in Attempt 4 fatal gunshot.'
  },
  {
    id: 'LINK-10',
    source: 'CHETANY',
    target: 'SURESH_ARMS',
    channel: 'COMMUNICATION',
    label: 'Encrypted Telegram Negotiations (@goli_supplies)',
    weight: 7,
    frequencyCount: 19,
    communicationMedium: 'Telegram Secret Chat',
    evidenceExhibitIds: ['EVID-018'],
    isCriticalConduit: false,
    isDirectional: false,
    investigativeNote: 'Specifications: requested suppressed bolt-action rifle with 7.62x51mm match rounds.'
  },

  // Intermediary <-> Chemical Supplier Dr. Kulkarni
  {
    id: 'LINK-11',
    source: 'CHETANY',
    target: 'DR_KULKARNI',
    channel: 'FINANCIAL',
    label: '₹250,000 Kickback for 25g Concentrated Thallium Sulphate',
    weight: 8,
    transactionAmountInr: 250000,
    frequencyCount: 1,
    communicationMedium: 'Sanjivani Medico Pharmacy Cash Payment',
    evidenceExhibitIds: ['EVID-004'],
    isCriticalConduit: true,
    isDirectional: true,
    investigativeNote: 'Used forged veterinary rodenticide permit #VET-9942.'
  },
  {
    id: 'LINK-12',
    source: 'CHETANY',
    target: 'DR_KULKARNI',
    channel: 'OPERATIONAL',
    label: 'Chemical Dropper Vial Handoff (EVID-004)',
    weight: 8,
    frequencyCount: 2,
    communicationMedium: 'Direct Physical Handoff',
    evidenceExhibitIds: ['EVID-004'],
    isCriticalConduit: true,
    isDirectional: true,
    investigativeNote: 'Toxin administered into soup dish during April 14 Olive Terrace dinner.'
  },

  // Kingpin Diya <-> Financial Courier Rohit Verma
  {
    id: 'LINK-13',
    source: 'DIYA',
    target: 'ROHIT_FIN',
    channel: 'FINANCIAL',
    label: '₹1,200,000 Hawala & Crypto Layering Transfers',
    weight: 8,
    transactionAmountInr: 1200000,
    frequencyCount: 4,
    communicationMedium: 'Angadia Cash Layering / USDT TRC20 Wallets',
    evidenceExhibitIds: ['EVID-010', 'EVID-020'],
    isCriticalConduit: true,
    isDirectional: true,
    investigativeNote: 'Funds split into untraceable cash bundles distributed to operational cut-outs.'
  },
  {
    id: 'LINK-14',
    source: 'ROHIT_FIN',
    target: 'CHETANY',
    channel: 'FINANCIAL',
    label: '₹850,000 Secondary Cash Drop to Chetany',
    weight: 7,
    transactionAmountInr: 850000,
    frequencyCount: 2,
    communicationMedium: 'Cash Drop at Viman Nagar Service Road',
    evidenceExhibitIds: ['EVID-020'],
    isCriticalConduit: true,
    isDirectional: true,
    investigativeNote: 'Intermediary funding for resort booking and vehicle modification.'
  },

  // Hitman Vikram <-> Vehicle Modifier Sunil More
  {
    id: 'LINK-15',
    source: 'VIKRAM',
    target: 'SUNIL_LOG',
    channel: 'FINANCIAL',
    label: '₹120,000 Fake Number Plate & Steering Sensor Mod',
    weight: 7,
    transactionAmountInr: 120000,
    frequencyCount: 1,
    communicationMedium: 'Hadapsar Workshop Cash Payment',
    evidenceExhibitIds: ['EVID-012', 'EVID-013'],
    isCriticalConduit: false,
    isDirectional: true,
    investigativeNote: 'Fabrication of cloned plate MH-12-QX-4412 to evade automatic ANPR toll cameras.'
  },

  // Intermediary Chetany <-> Target Keshan (Direct Assaults: Knife & Sniper)
  {
    id: 'LINK-16',
    source: 'CHETANY',
    target: 'KESHAN',
    channel: 'OPERATIONAL',
    label: 'Attempt 2 & 4: Knife Infiltration & Fatal 7.62mm Rifle Discharge',
    weight: 10,
    frequencyCount: 2,
    communicationMedium: 'Armed Assault / Precision Rifle Shot',
    evidenceExhibitIds: ['EVID-005', 'EVID-016'],
    isCriticalConduit: true,
    isDirectional: true,
    investigativeNote: 'Corridor 300 knife assault (May 13) and Lohegaon Hill scapular sniper shot (June 21).'
  },

  // Witnesses & Forensic Links
  {
    id: 'LINK-17',
    source: 'ARCHITA_WIT',
    target: 'CHETANY',
    channel: 'SURVEILLANCE_WITNESS',
    label: 'Eyewitness Positive Identification (Resort Corridor 300)',
    weight: 8,
    frequencyCount: 1,
    communicationMedium: 'Sec 164 CrPC Testimonial Deposition',
    evidenceExhibitIds: ['EVID-005'],
    isCriticalConduit: false,
    isDirectional: false,
    investigativeNote: 'Identified Chetany fleeing Room 304 with dropped tactical knife.'
  },
  {
    id: 'LINK-18',
    source: 'RHEA_RESORT',
    target: 'DIYA',
    channel: 'FORENSIC',
    label: 'Room 304 Keycard Swipe & Alias Booking Audit (EVID-006)',
    weight: 8,
    frequencyCount: 3,
    communicationMedium: 'Hotel PMS Electronic Lock Telemetry',
    evidenceExhibitIds: ['EVID-006'],
    isCriticalConduit: false,
    isDirectional: false,
    investigativeNote: 'Proves Diya unlocked the interconnecting balcony door for the assailant.'
  },
  {
    id: 'LINK-19',
    source: 'KUNAL_INS',
    target: 'DIYA',
    channel: 'FORENSIC',
    label: '₹45M Insurance Nomination Forgery Exposure (EVID-017)',
    weight: 9,
    frequencyCount: 1,
    communicationMedium: 'HDFC ERGO Fraud Audit Report',
    evidenceExhibitIds: ['EVID-017'],
    isCriticalConduit: false,
    isDirectional: false,
    investigativeNote: 'Uncovered backdated policy nomination signature executed 2 weeks prior to Attempt 1.'
  },
  {
    id: 'LINK-20',
    source: 'DR_PATWARDHAN',
    target: 'KESHAN',
    channel: 'FORENSIC',
    label: 'Post-Mortem Autopsy: 7.62mm Scapular Bullet Entry Trajectory',
    weight: 10,
    frequencyCount: 1,
    communicationMedium: 'Medico-Legal Autopsy Report (EVID-016)',
    evidenceExhibitIds: ['EVID-016'],
    isCriticalConduit: false,
    isDirectional: false,
    investigativeNote: 'Bullet traversed left scapula at -14° angle, incapacitating victim prior to cliff fall.'
  },
  {
    id: 'LINK-21',
    source: 'DR_PATWARDHAN',
    target: 'CHETANY',
    channel: 'FORENSIC',
    label: 'DNA & Ballistics Match on Remington 700 Rifle (99.999%)',
    weight: 10,
    frequencyCount: 1,
    communicationMedium: 'Forensic Science Laboratory DNA Certificate',
    evidenceExhibitIds: ['EVID-016'],
    isCriticalConduit: false,
    isDirectional: false,
    investigativeNote: 'Chetany’s epithelial DNA profile matched trigger guard and stock swab.'
  },
  {
    id: 'LINK-22',
    source: 'SI_JADHAV',
    target: 'DIYA',
    channel: 'FORENSIC',
    label: 'Chargesheet Accused #1 / Section 120B & 302 IPC',
    weight: 9,
    frequencyCount: 1,
    communicationMedium: 'State Crime Branch Formal Indictment',
    evidenceExhibitIds: ['EVID-001', 'EVID-020'],
    isCriticalConduit: false,
    isDirectional: false,
    investigativeNote: 'Primary conspirator charged with masterminding 4 premeditated attempts.'
  },
  {
    id: 'LINK-23',
    source: 'SI_JADHAV',
    target: 'CHETANY',
    channel: 'FORENSIC',
    label: 'Chargesheet Accused #2 / Section 302 & Arms Act Sec 25/27',
    weight: 9,
    frequencyCount: 1,
    communicationMedium: 'State Crime Branch Formal Indictment',
    evidenceExhibitIds: ['EVID-005', 'EVID-010', 'EVID-016'],
    isCriticalConduit: false,
    isDirectional: false,
    investigativeNote: 'Co-conspirator charged with execution, arms handling, and hitman contracting.'
  },
  {
    id: 'LINK-24',
    source: 'SI_JADHAV',
    target: 'VIKRAM',
    channel: 'FORENSIC',
    label: 'Chargesheet Accused #3 / Section 307 IPC Hitman Indictment',
    weight: 8,
    frequencyCount: 1,
    communicationMedium: 'Custodial Interrogation & RTGS Link Verification',
    evidenceExhibitIds: ['EVID-010', 'EVID-012'],
    isCriticalConduit: false,
    isDirectional: false,
    investigativeNote: 'Hired driver indicted for vehicular hit-and-run.'
  },
  {
    id: 'LINK-25',
    source: 'MANOJ_GUARD',
    target: 'VIKRAM',
    channel: 'SURVEILLANCE_WITNESS',
    label: 'CCTV & Gate Log Match for Tata 407 (MH-12-QX)',
    weight: 8,
    frequencyCount: 1,
    communicationMedium: 'Eyewitness Statement & Security Video',
    evidenceExhibitIds: ['EVID-012'],
    isCriticalConduit: false,
    isDirectional: false,
    investigativeNote: 'Corroborates exact truck acceleration timestamp at 09:58 AM on June 10.'
  },
  {
    id: 'LINK-26',
    source: 'ANIKET_TECH',
    target: 'DIYA',
    channel: 'FORENSIC',
    label: 'Cell Tower Triangulation (Lohegaon-South Sector 3)',
    weight: 9,
    frequencyCount: 1,
    communicationMedium: 'CDR / BTS Signal Triangulation Audit',
    evidenceExhibitIds: ['EVID-014', 'EVID-020'],
    isCriticalConduit: false,
    isDirectional: false,
    investigativeNote: 'Proves Diya was co-located at Sunset Point during the exact 17:15 gunshot timestamp.'
  },
  {
    id: 'LINK-27',
    source: 'ANIKET_TECH',
    target: 'CHETANY',
    channel: 'FORENSIC',
    label: 'Boulder Ridge Tower Ping & Signal Azimuth 284°',
    weight: 9,
    frequencyCount: 1,
    communicationMedium: 'CDR / BTS Signal Triangulation Audit',
    evidenceExhibitIds: ['EVID-016', 'EVID-020'],
    isCriticalConduit: false,
    isDirectional: false,
    investigativeNote: 'Places Chetany on the sniper ridge 140m north of Sunset Point during the shot.'
  },
  {
    id: 'LINK-28',
    source: 'POOJA_MALHOTRA',
    target: 'KESHAN',
    channel: 'COMMUNICATION',
    label: 'Hospitalization & Poisoning Symptoms Emergency Log',
    weight: 7,
    frequencyCount: 5,
    communicationMedium: 'Family Communication & Medical Records',
    evidenceExhibitIds: ['EVID-001', 'EVID-004'],
    isCriticalConduit: false,
    isDirectional: false,
    investigativeNote: 'Corroborated sudden alopecia and neuropathy typical of Thallium toxicity.'
  }
];

export function getDoomedTriangleSocialNetwork(): SocialNetworkAnalysisPayload {
  const { nodesWithCentrality, topology } = analyzeNetworkCentrality(
    rawDoomedTriangleNodes,
    rawDoomedTriangleLinks
  );

  // Derive ranked kingpins (sorted by kingpin score & eigenvector centrality)
  const kingpins = nodesWithCentrality
    .filter((n) => n.category === 'SUSPECT' || n.role === 'KINGPIN')
    .sort((a, b) => (b.centrality?.kingpinScore || 0) - (a.centrality?.kingpinScore || 0))
    .map((node, index) => ({
      entityId: node.id,
      name: node.name,
      role: node.role,
      rank: index + 1,
      score: node.centrality?.kingpinScore || 0,
      primaryMetric: `Eigenvector: ${node.centrality?.eigenvectorCentrality.toFixed(3)} | Fin Volume: ₹${(node.financialVolumeInr || 0).toLocaleString('en-IN')}`,
      summary: `${node.name} commands top strategic authority with low direct street exposure, channeling commands and ₹${(node.financialVolumeInr || 0).toLocaleString('en-IN')} in funding through intermediate brokers.`,
      structuralVulnerability: 'Insulated behind cut-outs; highly susceptible to financial audit and forensic Cellebrite voice decrypts.',
      tacticalTakedownRecommendation: 'Execute asset freezing under PMLA and subpoena unredacted cloud backup keys for Cellebrite dump EVID-020.'
    }));

  // Derive ranked intermediaries (sorted by betweenness centrality & intermediary score)
  const intermediaries = nodesWithCentrality
    .filter((n) => (n.centrality?.betweennessCentrality || 0) > 0.05 || n.role === 'INTERMEDIARY' || n.role === 'FINANCIAL_CONDUIT')
    .sort((a, b) => (b.centrality?.betweennessCentrality || 0) - (a.centrality?.betweennessCentrality || 0))
    .map((node, index) => ({
      entityId: node.id,
      name: node.name,
      role: node.role,
      rank: index + 1,
      score: Math.round((node.centrality?.betweennessCentrality || 0) * 100),
      primaryMetric: `Betweenness ($C_B$): ${(node.centrality?.betweennessCentrality || 0).toFixed(4)} | Disruption: ${node.centrality?.disruptionImpactPct}%`,
      summary: `${node.name} acts as the structural choke-point ($C_B = ${(node.centrality?.betweennessCentrality || 0).toFixed(4)}). Neutralizing this entity fragments ${(node.centrality?.disruptionImpactPct || 0)}% of inter-cluster conspiracy paths.`,
      structuralVulnerability: 'Directly bridges the mastermind with street executioners, arms dealers, and chemical sources. Single point of network failure.',
      tacticalTakedownRecommendation: 'Primary arrest priority. Exploiting phone intercepts and wire transfers instantly severs the syndicate’s operational capability.'
    }));

  // Derive ranked operatives & facilitators
  const operatives = nodesWithCentrality
    .filter((n) => n.role === 'OPERATIVE' || n.role === 'FACILITATOR' || n.role === 'FINANCIAL_CONDUIT')
    .sort((a, b) => (b.centrality?.totalDegree || 0) - (a.centrality?.totalDegree || 0))
    .map((node, index) => ({
      entityId: node.id,
      name: node.name,
      role: node.role,
      rank: index + 1,
      score: node.centrality?.totalDegree || 0,
      primaryMetric: `Degree: ${node.centrality?.totalDegree} | Category: ${node.role}`,
      summary: `${node.name} functions as a specialized resource conduit for ${node.operationalPhases.join(', ')}.`,
      structuralVulnerability: 'Perimeter entity with localized connectivity; highly vulnerable to physical surveillance and transaction trace.',
      tacticalTakedownRecommendation: 'Simultaneous coordinated raids on Kasba arms depot and Hadapsar workshop to seize physical evidence exhibits.'
    }));

  return {
    caseId: 'CASE-2026-DT01',
    caseTitle: 'The Doomed Triangle (Keshan Malhotra Homicide)',
    topology,
    nodes: nodesWithCentrality,
    links: rawDoomedTriangleLinks,
    kingpins,
    intermediaries,
    operatives,
    aiSyndicateReport: {
      executiveSummary: `Graph centrality analysis of "The Doomed Triangle" (CASE-2026-DT01) mathematically identifies a hub-and-spoke hierarchical conspiracy structure. Suspect Diya Gupta (SUS-01) functions as the strategic Kingpin (Eigenvector Centrality = 1.000, Kingpin Index = 96/100) commanding the financial apparatus (₹45,000,000 insurance motive). Suspect Chetany Sharma (SUS-02) is mathematically isolated as the sole Primary Intermediary (Betweenness Centrality CB = 0.5841, Disruption Impact = 88%), acting as the indispensable broker bridging Diya Gupta to black-market arms, toxic chemical suppliers, and contract hitmen.`,
      commandHierarchyAssessment: `The syndicate utilizes a classic two-tier compartmentalized structure. Diya Gupta maintains near-zero direct communication with street facilitators (Vikram Rathod, Suresh Nair, Dr. Kulkarni), relying entirely on encrypted VoIP conduits (LINK-01, 482 calls) and RTGS wire transfers (LINK-02, ₹6.5M) to Chetany Sharma. This shielding strategy is defeated through Betweenness Centrality mapping and Cellebrite decryption EVID-020.`,
      criticalIntermediaryVulnerabilities: `Chetany Sharma constitutes the single structural point of failure (SPOF). Algorithmic node deletion simulation confirms that isolating Chetany Sharma severs 88% of operational conspiracy pathways and fragments the network into 3 isolated clusters. Chetany's high betweenness is corroborated physically by DNA match EVID-005 (Knife) and EVID-016 (Sniper Rifle).`,
      financialConduitFindings: `Financial centrality analysis maps a closed money trail originating from Diya Gupta's personal accounts, channeled through Rohit Verma's Hawala layer (₹1.2M), deposited to Chetany Sharma (₹6.5M), and finally wired via HDFC RTGS (₹6.0M, EVID-010) to contract hitman Vikram Rathod 15 minutes before the Kharadi collision.`,
      courtAdmissibilityEvaluation: `Under Indian Evidence Act Sec 10 (Conspiracy) and Sec 65B (Electronic Evidence), the combination of graph betweenness centrality, mathematical shortest path corroboration, and physical exhibit linkages (EVID-001 to EVID-020) provides incontrovertible proof of joint premeditation across all four homicide attempts.`
    }
  };
}
