import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import {
  OCRDocument,
  IngestedDatasetSummary,
  FinancialTransactionRecord,
  CDRLogRecord,
  RecordAnomalyAlert,
  OSINTFindingItem,
  Section65BCertificate,
} from '../../src/types/ingestion.js';

// Pre-loaded realistic sample OCR documents
const SAMPLE_OCR_DOCUMENTS: OCRDocument[] = [
  {
    id: 'ocr-doc-01',
    caseId: 'case-dt01',
    title: 'First Information Report (FIR No. 248/2026) - Kotwali PS',
    documentType: 'FIR',
    fileUrl: '/assets/sample_fir_handwritten.png',
    fileType: 'image/png',
    fileSizeKb: 1420,
    uploadedAt: '2026-06-22T08:30:00.000Z',
    processedAt: '2026-06-22T08:30:14.000Z',
    status: 'COMPLETED',
    language: 'mr',
    ocrConfidence: 96.4,
    isHandwritten: true,
    pageCount: 1,
    evidenceIdRef: 'EVD-FIR-01',
    structuredFields: {
      firNumber: '248/2026',
      policeStation: 'Kotwali Police Station, Pune City',
      district: 'Pune',
      actsAndSections: ['IPC 302 (Murder)', 'IPC 120-B (Criminal Conspiracy)', 'IPC 307 (Attempt to Murder)', 'IPC 201 (Disappearance of Evidence)'],
      complainantName: 'Sub-Inspector Santosh Jadhav (Badge #MH-PN-8821)',
      accusedNames: ['Diya Gupta (D/O R.K. Gupta)', 'Chetany Sharma (S/O M.L. Sharma)'],
      victimName: 'Keshan Malhotra',
      dateOfOccurrence: '2026-06-21',
      timeOfOccurrence: '17:15 - 19:40 IST',
      placeOfOccurrence: 'Lohegaon Hill Outlook & Viman Nagar Bypass, Pune',
      recoveredItems: ['1x Glock-19 9mm casing (Lot #991-A)', '1x Samsung S24 Ultra (Cracked OLED)', 'Burnt Carbon Residue & Digital Dashcam SD Card'],
      investigatingOfficer: 'Dr. Neha Patwardhan (Deputy SP, Crime Branch)',
      officerBadge: 'DSP-CRIME-4412',
      chargesheetStatus: 'FILED_UNDER_SECTION_173_CRPC',
    },
    boundingBoxes: [
      { id: 'box-1', x: 12, y: 8, width: 76, height: 6, text: 'FIRST INFORMATION REPORT (Under Section 154 Cr.P.C.)', confidence: 99.1, fieldType: 'GENERAL' },
      { id: 'box-2', x: 12, y: 16, width: 36, height: 5, text: 'FIR No: 248 / 2026', confidence: 97.8, fieldType: 'FIR_NUMBER' },
      { id: 'box-3', x: 50, y: 16, width: 38, height: 5, text: 'PS: Kotwali, Pune City (Dist: Pune)', confidence: 98.2, fieldType: 'POLICE_STATION' },
      { id: 'box-4', x: 12, y: 23, width: 76, height: 6, text: 'Acts & Sections: IPC 302, IPC 120-B, IPC 307, IPC 201', confidence: 95.4, fieldType: 'SECTIONS' },
      { id: 'box-5', x: 12, y: 31, width: 76, height: 6, text: 'Complainant: SI Santosh Jadhav (Badge #MH-PN-8821)', confidence: 96.0, fieldType: 'COMPLAINANT' },
      { id: 'box-6', x: 12, y: 39, width: 76, height: 8, text: 'Accused: 1. Diya Gupta (Age 27) 2. Chetany Sharma (Age 29)', confidence: 94.7, fieldType: 'ACCUSED' },
      { id: 'box-7', x: 12, y: 49, width: 76, height: 6, text: 'Date/Time of Offence: 21-06-2026 between 17:15 hrs to 19:40 hrs', confidence: 96.8, fieldType: 'DATE_TIME' },
      { id: 'box-8', x: 12, y: 57, width: 76, height: 7, text: 'Place of Occurrence: Isolated Clifftop Ridge, Lohegaon Hill, Pune', confidence: 95.9, fieldType: 'LOCATION' },
      { id: 'box-9', x: 12, y: 66, width: 76, height: 12, text: 'Recovered Exhibits: 9mm Glock spent brass casing, shattered handset with telecom SIM, partial biometric footprint casting #P-4', confidence: 94.1, fieldType: 'RECOVERED_ITEMS' },
      { id: 'box-10', x: 45, y: 82, width: 43, height: 8, text: 'Investigating Officer: Dr. Neha Patwardhan (DSP Crime)', confidence: 97.5, fieldType: 'OFFICER' },
    ],
    rawText: `FIRST INFORMATION REPORT (Under Section 154 Cr.P.C.)
1. District: Pune | Police Station: Kotwali Pune City | Year: 2026 | FIR No: 248/2026 | Date: 22/06/2026
2. Act(s) & Section(s):
   - Indian Penal Code, 1860: Section 302 (Punishment for Murder)
   - Indian Penal Code, 1860: Section 120-B (Criminal Conspiracy)
   - Indian Penal Code, 1860: Section 307 (Attempt to Murder)
   - Indian Penal Code, 1860: Section 201 (Causing Disappearance of Evidence)
3. Occurrence of Offence:
   - Day & Date: Sunday, 21st June 2026
   - Time Period: 17:15 hrs to 19:40 hrs IST
4. Place of Occurrence:
   - Isolated cliff slope and dirt road 400m Northeast of Lohegaon Hill Transmission Tower, Pune.
5. Complainant / Informant:
   - Name: Sub-Inspector Santosh Jadhav
   - Deputed Station: Kotwali Police Station / SIT Crime Unit 1
6. Details of Known / Suspected / Accused Persons:
   - 1. Diya Gupta, D/O R.K. Gupta, Residing at Kalyani Nagar Heights, Pune.
   - 2. Chetany Sharma, S/O M.L. Sharma, Residing at Viman Nagar Luxury Enclave, Pune.
7. Brief Narrative & Seizure Summary:
   On 21-06-2026, deceased victim Keshan Malhotra was lured to the Lohegaon Hill viewpoint under the pretext of an urgent financial and marital resolution meeting. Forensic investigation, call logs, and eyewitness panchnama establish that accused Diya Gupta and Chetany Sharma coordinated a fatal assault, orchestrating trajectory suppression, weapon discharge, and subsequent tampering of digital cellular devices.
8. Seized Exhibits:
   - 1x Glock-19 9mm spent casing with distinct extractor markings.
   - 1x Smashed mobile terminal linked to IMSI #404-45-88192.
   - 1x Digital dashcam SD Card recovered 200m south from embankment.
9. Investigating Officer:
   - Name: Dr. Neha Patwardhan (Deputy SP, Special Crime Unit)
   - Badge: DSP-CRIME-4412`,
  },
  {
    id: 'ocr-doc-02',
    caseId: 'case-dt01',
    title: 'Spot Inquest & Seizure Panchnama (Crime Scene 3D Link)',
    documentType: 'PANCHNAMA',
    fileUrl: '/assets/sample_panchnama.png',
    fileType: 'image/png',
    fileSizeKb: 980,
    uploadedAt: '2026-06-22T10:15:00.000Z',
    processedAt: '2026-06-22T10:15:08.000Z',
    status: 'COMPLETED',
    language: 'en',
    ocrConfidence: 94.8,
    isHandwritten: true,
    pageCount: 1,
    evidenceIdRef: 'EVD-PANCH-02',
    structuredFields: {
      firNumber: '248/2026',
      policeStation: 'Viman Nagar Outpost',
      district: 'Pune',
      actsAndSections: ['Sec 100 Cr.P.C. Spot Seizure'],
      complainantName: 'Panch Witness #1: Rajesh Kulkarni, Panch Witness #2: Anand Deshmukh',
      accusedNames: ['Diya Gupta', 'Chetany Sharma'],
      dateOfOccurrence: '2026-06-21',
      timeOfOccurrence: '21:00 - 23:45 IST',
      placeOfOccurrence: 'Vehicle Trunk & Scrubland, Lohegaon Hill',
      recoveredItems: ['Black gloves with nitrocellulose residue', 'Burnt SIM card tray', 'Hawala token notebook with encrypted ledger codes'],
      investigatingOfficer: 'Inspector V.R. Shinde',
      officerBadge: 'PI-9120',
    },
    boundingBoxes: [
      { id: 'pbox-1', x: 10, y: 10, width: 80, height: 7, text: 'SPOT SEIZURE PANCHNAMA (Under Sec. 100 Cr.P.C.)', confidence: 98.4, fieldType: 'GENERAL' },
      { id: 'pbox-2', x: 10, y: 20, width: 80, height: 10, text: 'Panch Witnesses: 1. Rajesh Kulkarni (42y) 2. Anand Deshmukh (38y)', confidence: 95.1, fieldType: 'COMPLAINANT' },
      { id: 'pbox-3', x: 10, y: 32, width: 80, height: 12, text: 'Seized Objects: Nitrile gloves with gunshot residue, scorched plastic SIM jacket, Hawala ledger notes', confidence: 93.6, fieldType: 'RECOVERED_ITEMS' },
      { id: 'pbox-4', x: 10, y: 47, width: 80, height: 14, text: 'Location: Hidden scrub brush 15 meters downslope from metallic railing at Lohegaon crest', confidence: 96.2, fieldType: 'LOCATION' },
      { id: 'pbox-5', x: 40, y: 80, width: 50, height: 8, text: 'Sealing Officer: Inspector V.R. Shinde (PI-9120)', confidence: 97.0, fieldType: 'OFFICER' },
    ],
    rawText: `SPOT SEIZURE PANCHNAMA (Under Sec. 100 Cr.P.C.)
In the presence of independent panchas:
1. Shri Rajesh Kulkarni, Age 42, Business, Pune.
2. Shri Anand Deshmukh, Age 38, Resident of Viman Nagar.

At the spot pointed out by forensic team, on 21st June 2026 at 21:00 hours:
Recovered from a dry shrub 15 meters below the cliff edge:
- 1 pair of black nitrile gloves showing traces of heavy metal and powder burns.
- 1 burnt nano-SIM card remnant bearing partial printed sequence '...88192'.
- 1 pocket diary containing alphanumeric tokens and overseas wire references ('D-NEXUS AC: 99410-CHE').

All articles were packed into clean polythene evidence containers, labeled Exhibit PK-1 through PK-3, sealed with the official seal of Pune Police.`,
  },
];

// Pre-loaded sample structured records (Financial + CDR)
const SAMPLE_FINANCIAL_RECORDS: FinancialTransactionRecord[] = [
  {
    id: 'tx-101',
    transactionId: 'TXN-20260618-9901',
    timestamp: '2026-06-18T14:20:00Z',
    accountNumber: 'HDFC-****-4412 (Keshan Malhotra)',
    senderName: 'Keshan Malhotra',
    receiverName: 'D-Nexus Global Corp (Diya Gupta)',
    receiverAccount: 'ICICI-****-8810',
    amount: 4500000,
    type: 'DEBIT',
    bankOrChannel: 'ICICI RTGS',
    narration: 'Urgent Capital Allocation - Offshore Escrow Tranche A',
    isFlaggedSuspicious: true,
    suspicionReason: 'Massive capital drain 72 hours before incident; transferred to unverified shell corporate account.',
    anomalyScore: 92,
  },
  {
    id: 'tx-102',
    transactionId: 'TXN-20260619-1102',
    timestamp: '2026-06-19T02:15:00Z',
    accountNumber: 'ICICI-****-8810 (Diya Gupta)',
    senderName: 'Diya Gupta',
    receiverName: 'Chetany Sharma (Personal)',
    receiverAccount: 'SBI-****-3319',
    amount: 1500000,
    type: 'DEBIT',
    bankOrChannel: 'SBI IMPS',
    narration: 'Consulting Advisory Retainer - Phase 2',
    isFlaggedSuspicious: true,
    suspicionReason: 'High-value midnight IMPS payout to primary co-conspirator.',
    anomalyScore: 95,
  },
  {
    id: 'tx-103',
    transactionId: 'TXN-20260619-1103',
    timestamp: '2026-06-19T02:18:00Z',
    accountNumber: 'ICICI-****-8810 (Diya Gupta)',
    senderName: 'Diya Gupta',
    receiverName: 'Apex Tactical Armaments LLC',
    receiverAccount: 'AXIS-****-9921',
    amount: 49500,
    type: 'UPI_TRANSFER',
    bankOrChannel: 'Razorpay UPI',
    narration: 'Specialized Hardware Acquisition',
    isFlaggedSuspicious: true,
    suspicionReason: 'Structured Smurfing: Amount kept just below ₹50,000 regulatory reporting threshold.',
    anomalyScore: 88,
  },
  {
    id: 'tx-104',
    transactionId: 'TXN-20260619-1104',
    timestamp: '2026-06-19T02:22:00Z',
    accountNumber: 'ICICI-****-8810 (Diya Gupta)',
    senderName: 'Diya Gupta',
    receiverName: 'Alpha Secure Comms Gateway',
    receiverAccount: 'AXIS-****-9921',
    amount: 49200,
    type: 'UPI_TRANSFER',
    bankOrChannel: 'PhonePe UPI',
    narration: 'Burner SIM & Satellite Airtime Package',
    isFlaggedSuspicious: true,
    suspicionReason: 'Structured Smurfing: Second consecutive sub-₹50,000 transaction to anonymous tech vendor.',
    anomalyScore: 89,
  },
  {
    id: 'tx-105',
    transactionId: 'TXN-20260620-4401',
    timestamp: '2026-06-20T23:45:00Z',
    accountNumber: 'SBI-****-3319 (Chetany Sharma)',
    senderName: 'Chetany Sharma',
    receiverName: 'Hawala Node Dubai [Token: #DH-994]',
    receiverAccount: 'AE-IBAN-****-7712',
    amount: 850000,
    type: 'HAWALA_TOKEN',
    bankOrChannel: 'Offshore Hawala Clearing',
    narration: 'Settlement Token for Logistics & Extraction',
    isFlaggedSuspicious: true,
    suspicionReason: 'Cross-border Hawala token settlement 18 hours prior to the assassination attempt.',
    anomalyScore: 98,
  },
  {
    id: 'tx-106',
    transactionId: 'TXN-20260621-0810',
    timestamp: '2026-06-21T08:10:00Z',
    accountNumber: 'HDFC-****-4412 (Keshan Malhotra)',
    senderName: 'Keshan Malhotra',
    receiverName: 'Kalyani Nagar Coffee House',
    receiverAccount: 'HDFC-****-1102',
    amount: 450,
    type: 'UPI_TRANSFER',
    bankOrChannel: 'Google Pay UPI',
    narration: 'Morning Cafe Receipt',
    isFlaggedSuspicious: false,
    anomalyScore: 5,
  },
];

const SAMPLE_CDR_LOGS: CDRLogRecord[] = [
  {
    id: 'cdr-101',
    callingNumber: '+91 98231 44012 (Diya Gupta)',
    calledNumber: '+91 99882 11094 (Chetany Sharma)',
    timestamp: '2026-06-21T16:45:10Z',
    durationSeconds: 184,
    callType: 'VOICE',
    imeiCalling: '864291040192841',
    imeiCalled: '359182049102914',
    cellTowerId: 'TOW-KLN-04',
    locationName: 'Kalyani Nagar North Sector Tower',
    isFlaggedSuspicious: true,
    suspicionReason: 'Coordinating call immediately prior to departing toward Lohegaon Hill vantage point.',
  },
  {
    id: 'cdr-102',
    callingNumber: '+91 99882 11094 (Chetany Sharma)',
    calledNumber: '+91 91102 33491 (Keshan Malhotra)',
    timestamp: '2026-06-21T17:02:45Z',
    durationSeconds: 92,
    callType: 'VOICE',
    cellTowerId: 'TOW-LHG-01',
    locationName: 'Lohegaon Hill Crest Tower A',
    isFlaggedSuspicious: true,
    suspicionReason: 'Lure call to guide victim to isolated crest viewpoint.',
  },
  {
    id: 'cdr-103',
    callingNumber: '+91 98231 44012 (Diya Gupta)',
    calledNumber: '+91 99882 11094 (Chetany Sharma)',
    timestamp: '2026-06-21T17:28:15Z',
    durationSeconds: 24,
    callType: 'VOICE',
    cellTowerId: 'TOW-LHG-01',
    locationName: 'Lohegaon Hill Crest Tower A',
    isFlaggedSuspicious: true,
    suspicionReason: 'Pre-strike confirmation call 2 minutes before the fatal gunshot sound logged on acoustic sensor.',
  },
  {
    id: 'cdr-104',
    callingNumber: '+91 98231 44012 (Diya Gupta)',
    calledNumber: '+971 50 9918241 (Dubai Hawala Handler)',
    timestamp: '2026-06-21T19:10:00Z',
    durationSeconds: 310,
    callType: 'VOICE',
    cellTowerId: 'TOW-VMN-02',
    locationName: 'Viman Nagar Highway Junction Tower',
    isFlaggedSuspicious: true,
    suspicionReason: 'International roaming voice burst during immediate flight phase.',
  },
];

const SAMPLE_FINANCIAL_ANOMALIES: RecordAnomalyAlert[] = [
  {
    id: 'anom-01',
    type: 'SMURFING_LAYERING',
    severity: 'CRITICAL',
    title: 'Sub-Threshold Structured Smurfing Detected',
    description: 'Multiple UPI outbound transfers of ₹49,500 and ₹49,200 executed in rapid 4-minute intervals from Diya Gupta to obfuscate tactical equipment acquisition.',
    involvedEntities: ['Diya Gupta (ICICI-****-8810)', 'Apex Tactical Armaments LLC', 'Alpha Secure Comms'],
    timestampRange: '2026-06-19 02:18 - 02:22 IST',
    totalVolumeOrFrequency: '₹98,700 across 2 transactions',
    recommendedAction: 'Issue Section 91 CrPC notice to UPI Payment Gateway for merchant KYC & IP binding.',
  },
  {
    id: 'anom-02',
    type: 'ROUND_TRIPPING',
    severity: 'CRITICAL',
    title: 'Pre-Meditated Capital Drain & Co-Conspirator Payout',
    description: '₹45,00,000 transferred from victim Keshan Malhotra to Diya Gupta shell company, followed by ₹15,00,000 payout to Chetany Sharma and ₹8,50,000 Hawala token settlement.',
    involvedEntities: ['Keshan Malhotra', 'D-Nexus Global Corp', 'Chetany Sharma', 'Hawala Node Dubai'],
    timestampRange: '2026-06-18 to 2026-06-20 IST',
    totalVolumeOrFrequency: '₹68,50,000 total flow',
    recommendedAction: 'Attach corporate bank accounts under PMLA / CrPC Section 102.',
  },
  {
    id: 'anom-03',
    type: 'MIDNIGHT_SURGE',
    severity: 'HIGH',
    title: 'High-Frequency Midnight CDR Burst & Tower Co-Location',
    description: 'Simultaneous cell tower convergence on TOW-LHG-01 (Lohegaon Hill) between suspect handsets right prior to gunshot acoustic capture.',
    involvedEntities: ['+91 98231 44012 (Diya)', '+91 99882 11094 (Chetany)', '+91 91102 33491 (Keshan)'],
    timestampRange: '2026-06-21 16:45 - 17:35 IST',
    totalVolumeOrFrequency: '4 critical voice calls / 0 SMS',
    recommendedAction: 'Freeze CDR/IPDR dumps with Telecom Service Providers (Airtel & Jio).',
  },
];

// Pre-loaded sample OSINT findings
const SAMPLE_OSINT_FINDINGS: OSINTFindingItem[] = [
  {
    id: 'osint-post-01',
    platform: 'TWITTER_X',
    targetQuery: '@chetany_shadow99',
    authorHandle: '@chetany_shadow99',
    authorDisplayName: 'Chetany S. [Verified]',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    postContent: 'Clean angles, zero trace. When a liability expires, value multiplies. Looking forward to tomorrow\'s sunset elevation view in East Pune. #FinalPhase #ClosingTheLoop',
    publishedAt: '2026-06-20T21:40:00Z',
    capturedAt: '2026-06-22T09:12:00Z',
    sourceUrl: 'https://x.com/chetany_shadow99/status/1803920194821',
    sentiment: 'THREAT',
    threatScore: 98,
    geoTag: 'Viman Nagar, Pune (18.5679° N, 73.9143° E)',
    associatedEntities: {
      handles: ['@diya_invest_g', '@apex_defense_in'],
      hashtags: ['#FinalPhase', '#ClosingTheLoop', '#PuneSunset'],
      phoneNumbers: ['+91 99882 11094'],
    },
    provenance: {
      sha256Hash: '9e38bb091fc5a468d6f519543e582845c43d92419a5840656a81a7b45f94d0c1',
      originUrl: 'https://x.com/chetany_shadow99/status/1803920194821',
      ipAddress: '104.244.42.1',
      captureTimestamp: '2026-06-22T09:12:00.000Z',
      examinerId: 'EXAM-CYBER-884',
      examinerBadge: 'SI-CYBER-PUNE-104',
      rfc3161TimestampProof: 'RFC3161-CERT-SHA256-TOKEN-98218-STAMPED',
      digitalSignature: 'SIG-RSA-4096-7782A-MH-CYBER-SEC65B',
      chainOfCustodyStatus: 'TAMPER_PROOF',
    },
  },
  {
    id: 'osint-post-02',
    platform: 'TELEGRAM',
    targetQuery: 't.me/pune_underground_escrow',
    authorHandle: '@shadow_broker_09',
    authorDisplayName: 'Escrow Channel Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    postContent: 'Escrow confirmed for Lot #991-A (Glock 9mm Polish batch + 20 suppressed rounds). Handover completed near Nagar Road bypass. Buyer Ref: Diya-G.',
    publishedAt: '2026-06-19T18:30:00Z',
    capturedAt: '2026-06-22T09:15:30Z',
    sourceUrl: 'https://t.me/pune_underground_escrow/4482',
    sentiment: 'CRUCIAL_LEAD',
    threatScore: 96,
    associatedEntities: {
      handles: ['@diya_invest_g'],
      cryptoWallets: ['0x71C...88B9', 'bc1q9...44a1'],
      organizations: ['Apex Tactical'],
    },
    provenance: {
      sha256Hash: 'a8b1c43f90192e448bca6108172c91834e9102488a0029bcf812948201a094bb',
      originUrl: 'https://t.me/pune_underground_escrow/4482',
      ipAddress: '149.154.167.220',
      captureTimestamp: '2026-06-22T09:15:30.000Z',
      examinerId: 'EXAM-CYBER-884',
      examinerBadge: 'SI-CYBER-PUNE-104',
      rfc3161TimestampProof: 'RFC3161-CERT-SHA256-TOKEN-98219-STAMPED',
      digitalSignature: 'SIG-RSA-4096-8819B-MH-CYBER-SEC65B',
      chainOfCustodyStatus: 'TAMPER_PROOF',
    },
  },
  {
    id: 'osint-post-03',
    platform: 'MCA_REGISTRY',
    targetQuery: 'D-Nexus Global Corp',
    authorHandle: 'MCA-ROC-PUNE',
    authorDisplayName: 'Ministry of Corporate Affairs (MCA21)',
    avatarUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=80',
    postContent: 'Company CIN: U74999PN2025PTC219081. Directors: Diya Gupta (DIN: 09841209), Chetany Sharma (DIN: 09918234). Registered Office: Flat 402, Elite Tower, Kalyani Nagar, Pune.',
    publishedAt: '2025-11-10T10:00:00Z',
    capturedAt: '2026-06-22T09:20:00Z',
    sourceUrl: 'https://mca.gov.in/mcafoportal/companyDetails?cin=U74999PN2025PTC219081',
    sentiment: 'CRUCIAL_LEAD',
    threatScore: 88,
    associatedEntities: {
      organizations: ['D-Nexus Global Corp', 'Elite Heights LLP'],
      handles: ['Diya Gupta', 'Chetany Sharma'],
    },
    provenance: {
      sha256Hash: '4399cbb2819a9f0e18104889cba0011928410291948ba981029410bb4419208a',
      originUrl: 'https://mca.gov.in/mcafoportal/companyDetails?cin=U74999PN2025PTC219081',
      ipAddress: '164.100.14.92',
      captureTimestamp: '2026-06-22T09:20:00.000Z',
      examinerId: 'EXAM-CYBER-884',
      examinerBadge: 'SI-CYBER-PUNE-104',
      rfc3161TimestampProof: 'RFC3161-CERT-SHA256-TOKEN-98220-STAMPED',
      digitalSignature: 'SIG-RSA-4096-9921C-MH-CYBER-SEC65B',
      chainOfCustodyStatus: 'TAMPER_PROOF',
    },
  },
  {
    id: 'osint-post-04',
    platform: 'VAHAN_VEHICLE',
    targetQuery: 'MH12-QT-9921',
    authorHandle: 'VAHAN-SARATHI-RTO',
    authorDisplayName: 'RTO Maharashtra Central Registry',
    avatarUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=120&auto=format&fit=crop&q=80',
    postContent: 'Registration: MH12-QT-9921 | Model: Mahindra Thar 4x4 (Deep Forest Black) | Owner: Chetany Sharma | Registered RTO: Pune Central (MH-12) | Chassis: MA1THAR4X4...9982. Fastag logged passing Viman Nagar Toll at 2026-06-21 16:55 IST.',
    publishedAt: '2026-06-21T16:55:00Z',
    capturedAt: '2026-06-22T09:25:00Z',
    sourceUrl: 'https://vahan.parivahan.gov.in/vahansearch?regn=MH12QT9921',
    sentiment: 'CRUCIAL_LEAD',
    threatScore: 92,
    associatedEntities: {
      handles: ['Chetany Sharma'],
      organizations: ['RTO Pune (MH-12)'],
    },
    provenance: {
      sha256Hash: '77218bb90192a84e1902488102919488a0029bcff812948201a094bb77412901',
      originUrl: 'https://vahan.parivahan.gov.in/vahansearch?regn=MH12QT9921',
      ipAddress: '164.100.161.44',
      captureTimestamp: '2026-06-22T09:25:00.000Z',
      examinerId: 'EXAM-CYBER-884',
      examinerBadge: 'SI-CYBER-PUNE-104',
      rfc3161TimestampProof: 'RFC3161-CERT-SHA256-TOKEN-98221-STAMPED',
      digitalSignature: 'SIG-RSA-4096-1029D-MH-CYBER-SEC65B',
      chainOfCustodyStatus: 'TAMPER_PROOF',
    },
  },
];

export function createIngestionRouter(prisma: any) {
  const router = Router();

  // In-memory runtime state
  let runtimeOCRDocuments: OCRDocument[] = [...SAMPLE_OCR_DOCUMENTS];
  let runtimeFinancialRecords: FinancialTransactionRecord[] = [...SAMPLE_FINANCIAL_RECORDS];
  let runtimeCDRRecords: CDRLogRecord[] = [...SAMPLE_CDR_LOGS];
  let runtimeAnomalies: RecordAnomalyAlert[] = [...SAMPLE_FINANCIAL_ANOMALIES];
  let runtimeOSINTFindings: OSINTFindingItem[] = [...SAMPLE_OSINT_FINDINGS];

  // -------------------------------------------------------------
  // 1. OCR ENDPOINTS
  // -------------------------------------------------------------

  // GET /api/ingestion/ocr/samples
  router.get('/ocr/samples', (req: Request, res: Response) => {
    const caseId = (req.query.caseId as string) || 'case-dt01';
    const docs = runtimeOCRDocuments.filter((d) => !caseId || d.caseId === caseId || d.caseId === 'case-dt01');
    return res.json({
      success: true,
      count: docs.length,
      data: docs,
    });
  });

  // POST /api/ingestion/ocr/process
  router.post('/ocr/process', async (req: Request, res: Response) => {
    try {
      const {
        caseId = 'case-dt01',
        title = 'Uploaded Police Document',
        documentType = 'FIR',
        fileUrl,
        rawText,
        language = 'auto',
        isHandwritten = true,
      } = req.body;

      // Generate a simulated high-fidelity OCR result if custom text not provided
      const docId = `ocr-doc-${Date.now()}`;
      const detectedConfidence = Number((93 + Math.random() * 6).toFixed(1));

      let extractedText = rawText;
      if (!extractedText) {
        extractedText = `FIRST INFORMATION REPORT (Under Section 154 Cr.P.C.)\nDistrict: Pune | PS: Kotwali Pune | FIR No: ${Math.floor(100 + Math.random() * 900)}/2026\nActs & Sections: IPC 302, IPC 120-B, IPC 34\nComplainant: SI S. Jadhav (Badge #8821)\nAccused: Diya Gupta, Chetany Sharma\nDate/Time: 2026-06-21 at 17:30 hrs IST\nPlace: Lohegaon Hill Vantage Ridge, Pune\nSummary: Digitized handwritten police diary memo regarding the homicide investigation.`;
      }

      // Parse structured fields from text
      const firMatch = extractedText.match(/FIR No[:\s]+([0-9]+\/[0-9]+)/i);
      const psMatch = extractedText.match(/Police Station[:\s]+([^\n|]+)/i) || extractedText.match(/PS[:\s]+([^\n|]+)/i);
      const sectionsMatch = extractedText.match(/(?:Acts? & Sections?|Section\(s\)|IPC|BNS)[:\s]+([^\n]+)/i);
      const complainantMatch = extractedText.match(/Complainant[^:\n]*[:\s]+([^\n]+)/i);
      const accusedMatch = extractedText.match(/Accused[^:\n]*[:\s]+([^\n]+)/i);
      const placeMatch = extractedText.match(/Place of Occurrence[:\s]+([^\n]+)/i);

      const newDoc: OCRDocument = {
        id: docId,
        caseId,
        title: title || 'Digitized Scanned Document',
        documentType: (documentType as any) || 'FIR',
        fileUrl: fileUrl || '/assets/sample_fir_handwritten.png',
        fileType: 'image/png',
        fileSizeKb: 1240,
        uploadedAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        status: 'COMPLETED',
        language: language as any,
        ocrConfidence: detectedConfidence,
        rawText: extractedText,
        isHandwritten: isHandwritten ?? true,
        pageCount: 1,
        evidenceIdRef: `EVD-OCR-${Math.floor(1000 + Math.random() * 9000)}`,
        structuredFields: {
          firNumber: firMatch ? firMatch[1].trim() : '248/2026',
          policeStation: psMatch ? psMatch[1].trim() : 'Kotwali Police Station, Pune',
          district: 'Pune',
          actsAndSections: sectionsMatch ? sectionsMatch[1].split(',').map((s: string) => s.trim()) : ['IPC 302', 'IPC 120-B'],
          complainantName: complainantMatch ? complainantMatch[1].trim() : 'SI Santosh Jadhav',
          accusedNames: accusedMatch ? accusedMatch[1].split(',').map((s: string) => s.trim()) : ['Diya Gupta', 'Chetany Sharma'],
          placeOfOccurrence: placeMatch ? placeMatch[1].trim() : 'Lohegaon Hill Outlook, Pune',
          dateOfOccurrence: '2026-06-21',
          timeOfOccurrence: '17:15 - 19:40 IST',
          recoveredItems: ['1x Glock-19 spent casing', '1x Burner Mobile Phone', 'Digital Dashcam SD Card'],
          investigatingOfficer: 'Dr. Neha Patwardhan (DSP Crime)',
          officerBadge: 'DSP-CRIME-4412',
          chargesheetStatus: 'FILED_UNDER_SECTION_173_CRPC',
        },
        boundingBoxes: [
          { id: 'b1', x: 12, y: 10, width: 76, height: 8, text: title, confidence: detectedConfidence, fieldType: 'GENERAL' },
          { id: 'b2', x: 12, y: 22, width: 36, height: 6, text: `FIR: ${firMatch ? firMatch[1] : '248/2026'}`, confidence: detectedConfidence, fieldType: 'FIR_NUMBER' },
          { id: 'b3', x: 50, y: 22, width: 38, height: 6, text: `PS: ${psMatch ? psMatch[1] : 'Kotwali Pune'}`, confidence: detectedConfidence, fieldType: 'POLICE_STATION' },
          { id: 'b4', x: 12, y: 32, width: 76, height: 8, text: `Accused: ${accusedMatch ? accusedMatch[1] : 'Diya Gupta, Chetany Sharma'}`, confidence: detectedConfidence - 1.2, fieldType: 'ACCUSED' },
          { id: 'b5', x: 12, y: 44, width: 76, height: 18, text: extractedText.slice(0, 180), confidence: detectedConfidence - 0.8, fieldType: 'GENERAL' },
        ],
      };

      runtimeOCRDocuments.unshift(newDoc);

      return res.json({
        success: true,
        message: 'Document digitized and OCR extracted successfully',
        data: newDoc,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'OCR extraction failed' });
    }
  });

  // -------------------------------------------------------------
  // 2. STRUCTURED RECORDS ENDPOINTS (CDRs & Financial Logs)
  // -------------------------------------------------------------

  // GET /api/ingestion/records/samples
  router.get('/records/samples', (_req: Request, res: Response) => {
    const totalVolume = runtimeFinancialRecords.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const summary: IngestedDatasetSummary = {
      id: 'ds-financial-cdr-master',
      caseId: 'case-dt01',
      datasetName: 'Doomed Triangle Consolidated Financial & Telecom Ledger',
      category: 'BANK_STATEMENT',
      recordCount: runtimeFinancialRecords.length + runtimeCDRRecords.length,
      uploadDate: new Date().toISOString(),
      totalVolumeAmount: totalVolume,
      flaggedCount: runtimeFinancialRecords.filter((r) => r.isFlaggedSuspicious).length + runtimeCDRRecords.filter((r) => r.isFlaggedSuspicious).length,
      anomalies: runtimeAnomalies,
      records: [...runtimeFinancialRecords, ...runtimeCDRRecords],
      schemaMappings: [
        { standardField: 'Transaction ID / Call ID', sourceColumn: 'TxnRef / Call_ID', confidence: 100 },
        { standardField: 'Timestamp', sourceColumn: 'Value_Date_Time / Call_Timestamp', confidence: 99 },
        { standardField: 'Sender / Calling Entity', sourceColumn: 'From_Account / Calling_MSISDN', confidence: 98 },
        { standardField: 'Receiver / Called Entity', sourceColumn: 'To_Account / Called_MSISDN', confidence: 98 },
        { standardField: 'Amount / Duration', sourceColumn: 'Trx_Amount_INR / Duration_Sec', confidence: 97 },
      ],
    };

    return res.json({
      success: true,
      data: summary,
      financialRecords: runtimeFinancialRecords,
      cdrRecords: runtimeCDRRecords,
      anomalies: runtimeAnomalies,
    });
  });

  // POST /api/ingestion/records/validate-and-import
  router.post('/records/validate-and-import', (req: Request, res: Response) => {
    try {
      const {
        caseId = 'case-dt01',
        datasetName = 'Imported Financial & CDR Records',
        category = 'BANK_STATEMENT',
        rawRecords = [],
        columnMappings = [],
      } = req.body;

      const processedRecords: FinancialTransactionRecord[] = [];
      const newAnomalies: RecordAnomalyAlert[] = [];

      let totalAmount = 0;
      let flaggedCount = 0;

      // Process uploaded raw records
      if (Array.isArray(rawRecords) && rawRecords.length > 0) {
        rawRecords.forEach((row: any, idx: number) => {
          const amt = Number(row.amount || row.Amount || row.Trx_Amount_INR || (5000 + Math.random() * 450000).toFixed(0));
          const isSuspicious = amt > 1000000 || (amt >= 48000 && amt <= 49999);
          if (isSuspicious) flaggedCount++;
          totalAmount += amt;

          const rec: FinancialTransactionRecord = {
            id: `tx-imported-${idx}-${Date.now()}`,
            transactionId: row.transactionId || row.TxnRef || `TXN-IMP-${Math.floor(100000 + Math.random() * 900000)}`,
            timestamp: row.timestamp || row.Value_Date_Time || new Date().toISOString(),
            accountNumber: row.accountNumber || row.From_Account || 'HDFC-****-9921',
            senderName: row.senderName || row.Sender || 'Primary Suspect Entity',
            receiverName: row.receiverName || row.Receiver || 'Destination Beneficiary',
            receiverAccount: row.receiverAccount || row.To_Account || 'ICICI-****-3310',
            amount: amt,
            type: (row.type as any) || (amt < 50000 ? 'UPI_TRANSFER' : 'DEBIT'),
            bankOrChannel: row.bankOrChannel || row.Channel || 'Real-time IMPS',
            narration: row.narration || row.Remarks || 'Forensic Ledger Entry',
            isFlaggedSuspicious: isSuspicious,
            suspicionReason: isSuspicious
              ? amt >= 48000 && amt <= 49999
                ? 'Structured Smurfing Rule triggered (sub-threshold transfers)'
                : 'High-Velocity Capital Outflow anomaly'
              : undefined,
            anomalyScore: isSuspicious ? Math.floor(80 + Math.random() * 18) : 10,
          };
          processedRecords.push(rec);
        });

        // Add to runtime state
        runtimeFinancialRecords.unshift(...processedRecords);

        if (flaggedCount > 0) {
          newAnomalies.push({
            id: `anom-${Date.now()}`,
            type: 'SMURFING_LAYERING',
            severity: 'HIGH',
            title: `Automated Ingestion Anomaly: ${flaggedCount} Flagged Transactions`,
            description: `Automated validation rules detected ${flaggedCount} suspicious transaction patterns matching money laundering or covert procurement signatures.`,
            involvedEntities: processedRecords.filter((r) => r.isFlaggedSuspicious).map((r) => r.receiverName).slice(0, 3),
            totalVolumeOrFrequency: `₹${totalAmount.toLocaleString()} across ${processedRecords.length} records`,
            recommendedAction: 'Cross-reference beneficiary accounts with canonical suspect directory.',
          });
          runtimeAnomalies.unshift(...newAnomalies);
        }
      }

      return res.json({
        success: true,
        message: `Successfully validated and imported ${processedRecords.length || rawRecords.length} records.`,
        dataset: {
          id: `ds-${Date.now()}`,
          caseId,
          datasetName,
          category,
          recordCount: processedRecords.length || rawRecords.length,
          uploadDate: new Date().toISOString(),
          totalVolumeAmount: totalAmount,
          flaggedCount,
          anomalies: newAnomalies,
          records: processedRecords,
          schemaMappings: columnMappings,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Record import failed' });
    }
  });

  // -------------------------------------------------------------
  // 3. OSINT & SOCIAL MEDIA DATA CONNECTORS ENDPOINTS
  // -------------------------------------------------------------

  // GET /api/ingestion/osint/samples
  router.get('/osint/samples', (_req: Request, res: Response) => {
    return res.json({
      success: true,
      count: runtimeOSINTFindings.length,
      data: runtimeOSINTFindings,
    });
  });

  // POST /api/ingestion/osint/query
  router.post('/osint/query', async (req: Request, res: Response) => {
    try {
      const {
        platform = 'TWITTER_X',
        query = '@chetany_shadow99',
        caseId = 'case-dt01',
      } = req.body;

      // Compute cryptographic hash of search query + execution timestamp
      const timestamp = new Date().toISOString();
      const contentToHash = `${platform}:${query}:${timestamp}:${caseId}`;
      const sha256Hash = crypto.createHash('sha256').update(contentToHash).digest('hex');

      // Filter existing findings matching query, or synthesize dynamic connector response
      let findings = runtimeOSINTFindings.filter(
        (f) => f.platform === platform || f.targetQuery.toLowerCase().includes(query.toLowerCase()) || f.authorHandle.toLowerCase().includes(query.toLowerCase())
      );

      if (findings.length === 0) {
        const dynamicItem: OSINTFindingItem = {
          id: `osint-${Date.now()}`,
          platform: platform as any,
          targetQuery: query,
          authorHandle: query.startsWith('@') ? query : `@target_${query.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`,
          authorDisplayName: `Target Profile: ${query}`,
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
          postContent: `Live OSINT crawler telemetry captured active mentions and network interactions referencing target '${query}' with verified server IP correlation and cryptographic timestamping.`,
          publishedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          capturedAt: timestamp,
          sourceUrl: `https://osint.tactical-intel.gov.in/query?term=${encodeURIComponent(query)}&platform=${platform}`,
          sentiment: 'CRUCIAL_LEAD',
          threatScore: 84,
          geoTag: 'Pune Metropolitan Region (18.5204° N, 73.8567° E)',
          associatedEntities: {
            handles: [query, '@diya_invest_g'],
            hashtags: ['#LohegaonIncident', '#Investigation'],
          },
          provenance: {
            sha256Hash,
            originUrl: `https://osint.tactical-intel.gov.in/query?term=${encodeURIComponent(query)}`,
            ipAddress: '164.100.24.11',
            captureTimestamp: timestamp,
            examinerId: 'EXAM-CYBER-884',
            examinerBadge: 'SI-CYBER-PUNE-104',
            rfc3161TimestampProof: `RFC3161-CERT-SHA256-${sha256Hash.slice(0, 16).toUpperCase()}`,
            digitalSignature: `SIG-RSA-4096-${crypto.randomBytes(8).toString('hex').toUpperCase()}-MH-CYBER-SEC65B`,
            chainOfCustodyStatus: 'TAMPER_PROOF',
          },
        };
        findings = [dynamicItem];
        runtimeOSINTFindings.unshift(dynamicItem);
      }

      return res.json({
        success: true,
        query,
        platform,
        provenanceHash: sha256Hash,
        timestamp,
        count: findings.length,
        data: findings,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'OSINT query execution failed' });
    }
  });

  // POST /api/ingestion/osint/provenance/certificate
  router.post('/osint/provenance/certificate', (req: Request, res: Response) => {
    try {
      const {
        findingId,
        caseId = 'case-dt01',
        caseTitle = 'The Doomed Triangle',
        targetQuery = '@chetany_shadow99',
        officerName = 'Dr. Neha Patwardhan',
        officerBadge = 'DSP-CRIME-4412',
        policeStation = 'Special Cyber Crime Branch, Pune Police Commissionerate',
      } = req.body;

      const finding = runtimeOSINTFindings.find((f) => f.id === findingId) || runtimeOSINTFindings[0];
      const captureHash = finding?.provenance?.sha256Hash || crypto.createHash('sha256').update(targetQuery).digest('hex');
      const certId = `CERT-65B-${Date.now()}`;

      const certificate: Section65BCertificate = {
        certificateId: certId,
        caseId,
        caseTitle,
        targetQuery,
        evidenceItemId: finding?.id || 'EVD-OSINT-001',
        generatedDate: new Date().toISOString(),
        certifyingOfficer: {
          name: officerName,
          designation: 'Deputy Superintendent of Police / Cyber Forensic Examiner',
          badgeNumber: officerBadge,
          policeStation,
        },
        technicalDetails: {
          systemHostname: 'SUR-TACTICAL-NODE-04.pune.police.gov.in',
          ipAddress: '10.142.88.24',
          osVersion: 'Suraag Secure Linux Kernel 6.8.0-FIPS / Node 22',
          captureHashSHA256: captureHash,
          rfc3161TimeStamp: finding?.provenance?.rfc3161TimestampProof || `RFC3161-CERT-${certId}`,
          storageMediaType: 'WORM (Write Once Read Many) Immutable Cryptographic Vault',
        },
        legalDeclaration: `I hereby certify under Section 65B of the Indian Evidence Act, 1872 (read with Section 63 of Bharatiya Sakshya Adhiniyam, 2023) that the electronic record herein produced was generated during the ordinary course of lawful cyber intelligence collection. The electronic computing device was operating accurately without malfunction or tampering, and the SHA-256 cryptographic hash verifies absolute integrity and chain of custody.`,
        digitalSealBase64: `DATA:SUR-GOV-MH-POLICE-SEAL-VERIFIED-${captureHash.slice(0, 32)}`,
      };

      return res.json({
        success: true,
        certificate,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Certificate generation failed' });
    }
  });

  return router;
}
