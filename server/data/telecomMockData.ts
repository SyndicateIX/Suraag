import { IngestedCDRRecord, SuspectMapping } from '../services/cdrService.js';

export interface MockTelecomDataset {
  id: string;
  caseId: string;
  fileName: string;
  operatorName: string;
  recordCount: number;
  targetNumber: string;
  uploadDate: string;
  records: IngestedCDRRecord[];
}

export const MASTER_CELL_TOWERS = [
  {
    towerId: 'TOW-PN-411032-01',
    operator: 'Bharti Airtel',
    locationName: 'Lohegaon Hill Tower Sector 1A, Pune',
    latitude: 18.5822,
    longitude: 73.9197,
    azimuth: 120,
    rangeMeters: 1800,
  },
  {
    towerId: 'TOW-PN-411014-03',
    operator: 'Reliance Jio',
    locationName: 'Kalyani Nagar Bridge Sector 3B, Pune',
    latitude: 18.5482,
    longitude: 73.9025,
    azimuth: 45,
    rangeMeters: 1400,
  },
  {
    towerId: 'TOW-PN-411014-09',
    operator: 'Vodafone Idea',
    locationName: 'Viman Nagar Cyber City Sector 2C, Pune',
    latitude: 18.5679,
    longitude: 73.9143,
    azimuth: 270,
    rangeMeters: 1600,
  },
  {
    towerId: 'TOW-PN-411006-04',
    operator: 'Bharti Airtel',
    locationName: 'Yerawada Industrial Junction Tower, Pune',
    latitude: 18.5529,
    longitude: 73.8828,
    azimuth: 180,
    rangeMeters: 2000,
  },
  {
    towerId: 'TOW-PN-411032-08',
    operator: 'Reliance Jio',
    locationName: 'Pune International Airport Radar Sector 4',
    latitude: 18.5804,
    longitude: 73.9200,
    azimuth: 90,
    rangeMeters: 1500,
  },
];

export const INITIAL_SUSPECT_MAPPINGS: Record<string, Record<string, SuspectMapping>> = {
  'case-dt01': {
    '+919822019941': {
      phoneNumber: '+919822019941',
      suspectId: 'SUS-01',
      ownerName: 'Diya Gupta',
      role: 'MASTERMIND',
      riskScore: 96,
      alias: 'Diya (Target 1)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    '+919890142831': {
      phoneNumber: '+919890142831',
      suspectId: 'SUS-02',
      ownerName: 'Chetany Sharma',
      role: 'CO-CONSPIRATOR',
      riskScore: 94,
      alias: 'Chetany (Hit Facilitator)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    '+919766318820': {
      phoneNumber: '+919766318820',
      suspectId: 'SUS-03',
      ownerName: 'Keshan Malhotra',
      role: 'VICTIM',
      riskScore: 20,
      alias: 'Keshan (Target Victim)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
    '+919130094812': {
      phoneNumber: '+919130094812',
      suspectId: 'SUS-04',
      ownerName: 'Rohan "Blade" Verma',
      role: 'OPERATIVE',
      riskScore: 89,
      alias: 'Rohan (Vehicle Driver)',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    },
    '+919422001199': {
      phoneNumber: '+919422001199',
      suspectId: 'SUS-05',
      ownerName: 'Amit Salunkhe',
      role: 'ASSOCIATE',
      riskScore: 68,
      alias: 'Amit (Garage Owner)',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
    '+919000112233': {
      phoneNumber: '+919000112233',
      ownerName: 'Unregistered Burner SIM A',
      role: 'BURNER',
      riskScore: 92,
      alias: 'Burner Handset #1',
    },
    '+919000445566': {
      phoneNumber: '+919000445566',
      ownerName: 'Unregistered Burner SIM B',
      role: 'BURNER',
      riskScore: 90,
      alias: 'Burner Handset #2',
    },
  },
};

// Realistic Doomed Triangle CDR generation
function generateDoomedTriangleRecords(): IngestedCDRRecord[] {
  const records: IngestedCDRRecord[] = [];
  const datasetId = 'ds-doomed-airtel-01';

  const diyNumber = '+919822019941';
  const chetanyNumber = '+919890142831';
  const keshanNumber = '+919766318820';
  const rohanNumber = '+919130094812';
  const amitNumber = '+919422001199';
  const burnerA = '+919000112233';
  const burnerB = '+919000445566';
  const randomNumbers = [
    '+919822334455',
    '+919811223344',
    '+919922110099',
    '+919371002233',
    '+919850123456',
  ];

  // Base date around incident June 21, 2026
  const baseDate = new Date('2026-06-20T10:00:00Z');

  // Pre-crime coordination calls (Diya & Chetany) - Frequent, long calls
  for (let i = 0; i < 18; i++) {
    const callDate = new Date(baseDate.getTime() + i * 3600 * 1000 * 3 + Math.floor(Math.random() * 1800000));
    records.push({
      id: `cdr-dt-pre-${i}`,
      datasetId,
      callingNumber: i % 2 === 0 ? diyNumber : chetanyNumber,
      calledNumber: i % 2 === 0 ? chetanyNumber : diyNumber,
      imeiCalling: '864291040182910',
      imeiCalled: '869102049182049',
      timestamp: callDate.toISOString(),
      durationSeconds: Math.floor(120 + Math.random() * 450),
      callType: 'VOICE',
      cellTowerId: 'TOW-PN-411014-03', // Kalyani Nagar
      lac: '41101',
      latitude: 18.5482,
      longitude: 73.9025,
      azimuth: 45,
      firstLocation: 'Kalyani Nagar Bridge, Sector 3B',
      lastLocation: 'Kalyani Nagar Bridge, Sector 3B',
    });
  }

  // Midnight coordination burst (June 21, 01:15 AM - 04:30 AM)
  const midnightBase = new Date('2026-06-21T01:15:00Z');
  for (let i = 0; i < 8; i++) {
    const callDate = new Date(midnightBase.getTime() + i * 1200 * 1000);
    records.push({
      id: `cdr-dt-mid-${i}`,
      datasetId,
      callingNumber: chetanyNumber,
      calledNumber: rohanNumber,
      imeiCalling: '869102049182049',
      imeiCalled: '861029384756102',
      timestamp: callDate.toISOString(),
      durationSeconds: Math.floor(45 + Math.random() * 180),
      callType: i % 3 === 0 ? 'SMS' : 'VOICE',
      cellTowerId: 'TOW-PN-411032-01', // Lohegaon Hill
      lac: '41103',
      latitude: 18.5822,
      longitude: 73.9197,
      azimuth: 120,
      firstLocation: 'Lohegaon Hill Tower, Sector 1A',
      lastLocation: 'Lohegaon Hill Tower, Sector 1A',
    });
  }

  // Co-location event at Lohegaon Hill Tower between Diya & Chetany (Spatial-Temporal Co-presence!)
  const crimeTime = new Date('2026-06-21T11:15:00Z');
  records.push({
    id: `cdr-dt-co-1`,
    datasetId,
    callingNumber: diyNumber,
    calledNumber: burnerA,
    imeiCalling: '864291040182910',
    imeiCalled: '860000000111222',
    timestamp: new Date(crimeTime.getTime() - 1000 * 60 * 8).toISOString(), // 11:07 AM
    durationSeconds: 34,
    callType: 'VOICE',
    cellTowerId: 'TOW-PN-411032-01', // Lohegaon Tower
    lac: '41103',
    latitude: 18.5822,
    longitude: 73.9197,
    azimuth: 120,
    firstLocation: 'Lohegaon Hill Sector 1A',
    lastLocation: 'Lohegaon Hill Sector 1A',
  });

  records.push({
    id: `cdr-dt-co-2`,
    datasetId,
    callingNumber: chetanyNumber,
    calledNumber: rohanNumber,
    imeiCalling: '869102049182049',
    imeiCalled: '861029384756102',
    timestamp: new Date(crimeTime.getTime() - 1000 * 60 * 3).toISOString(), // 11:12 AM (5 mins delta!)
    durationSeconds: 12,
    callType: 'VOICE',
    cellTowerId: 'TOW-PN-411032-01', // Lohegaon Tower
    lac: '41103',
    latitude: 18.5822,
    longitude: 73.9197,
    azimuth: 120,
    firstLocation: 'Lohegaon Hill Sector 1A',
    lastLocation: 'Lohegaon Hill Sector 1A',
  });

  records.push({
    id: `cdr-dt-co-3`,
    datasetId,
    callingNumber: burnerA,
    calledNumber: burnerB,
    imeiCalling: '860000000111222',
    imeiCalled: '860000000333444',
    timestamp: new Date(crimeTime.getTime() + 1000 * 60 * 2).toISOString(), // 11:17 AM
    durationSeconds: 4, // 4 sec short ping
    callType: 'VOICE',
    cellTowerId: 'TOW-PN-411032-01',
    lac: '41103',
    latitude: 18.5822,
    longitude: 73.9197,
    azimuth: 120,
    firstLocation: 'Lohegaon Hill Sector 1A',
    lastLocation: 'Lohegaon Hill Sector 1A',
  });

  // Short burst missed calls from Burner to Keshan (Attempting lure)
  for (let i = 0; i < 4; i++) {
    records.push({
      id: `cdr-dt-miss-${i}`,
      datasetId,
      callingNumber: burnerA,
      calledNumber: keshanNumber,
      timestamp: new Date(crimeTime.getTime() - 1000 * 60 * (30 - i * 5)).toISOString(),
      durationSeconds: 3,
      callType: 'VOICE',
      cellTowerId: 'TOW-PN-411014-09',
      latitude: 18.5679,
      longitude: 73.9143,
      azimuth: 270,
      firstLocation: 'Viman Nagar Cyber City Sector 2C',
    });
  }

  // Post-crime radio silence: no calls for 14 hours on suspect lines, then single ping to Garage
  const postCrimeDate = new Date('2026-06-22T02:00:00Z');
  records.push({
    id: `cdr-dt-post-1`,
    datasetId,
    callingNumber: rohanNumber,
    calledNumber: amitNumber,
    timestamp: postCrimeDate.toISOString(),
    durationSeconds: 95,
    callType: 'VOICE',
    cellTowerId: 'TOW-PN-411006-04',
    latitude: 18.5529,
    longitude: 73.8828,
    azimuth: 180,
    firstLocation: 'Yerawada Industrial Junction',
  });

  // Add random background calls to make dataset look authentic
  for (let i = 0; i < 25; i++) {
    const rndNum = randomNumbers[i % randomNumbers.length];
    const rndSrc = i % 2 === 0 ? keshanNumber : rndNum;
    const rndDst = i % 2 === 0 ? rndNum : keshanNumber;
    const rndDate = new Date(baseDate.getTime() + Math.random() * 86400000 * 2);
    records.push({
      id: `cdr-dt-bg-${i}`,
      datasetId,
      callingNumber: rndSrc,
      calledNumber: rndDst,
      timestamp: rndDate.toISOString(),
      durationSeconds: Math.floor(20 + Math.random() * 200),
      callType: i % 4 === 0 ? 'SMS' : 'VOICE',
      cellTowerId: 'TOW-PN-411014-09',
      latitude: 18.5679,
      longitude: 73.9143,
      firstLocation: 'Viman Nagar Cyber City Sector 2C',
    });
  }

  return records.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export const PRELOADED_TELECOM_DATASETS: MockTelecomDataset[] = [
  {
    id: 'ds-doomed-airtel-01',
    caseId: 'case-dt01',
    fileName: 'AIRTEL_CDR_PUNE_LOHEGAON_SECTOR_20260621.csv',
    operatorName: 'Bharti Airtel',
    recordCount: 58,
    targetNumber: '+919822019941',
    uploadDate: '2026-06-22T08:30:00Z',
    records: generateDoomedTriangleRecords(),
  },
  {
    id: 'ds-case1-jio-01',
    caseId: 'case-1',
    fileName: 'JIO_IPDR_CDR_DUMP_CASE884A.xlsx',
    operatorName: 'Reliance Jio',
    recordCount: 58,
    targetNumber: '+919822019941',
    uploadDate: '2026-07-16T14:10:00Z',
    records: generateDoomedTriangleRecords().map(r => ({ ...r, datasetId: 'ds-case1-jio-01' })),
  },
];

// Pre-built downloadable/loadable CSV sample content for the Ingestion Wizard
export const SAMPLE_CSV_DATASETS: Record<string, { name: string; operator: string; description: string; csvText: string }> = {
  airtel_lohegaon: {
    name: 'Airtel Lohegaon Sector Dump (Doomed Triangle)',
    operator: 'Bharti Airtel',
    description: 'High-density cell tower capture covering Kalyani Nagar & Lohegaon Hill during critical conspiracy window.',
    csvText: `Calling_No,Called_No,Call_Date_Time,Duration_Sec,Call_Type,First_Cell_ID,IMEI_A,IMEI_B,Lat,Long,Azimuth,Site_Address
+919822019941,+919890142831,2026-06-20 14:15:22,342,VOICE,TOW-PN-411014-03,864291040182910,869102049182049,18.5482,73.9025,45,Kalyani Nagar Bridge
+919890142831,+919822019941,2026-06-20 18:30:10,210,VOICE,TOW-PN-411014-03,869102049182049,864291040182910,18.5482,73.9025,45,Kalyani Nagar Bridge
+919890142831,+919130094812,2026-06-21 01:20:45,185,VOICE,TOW-PN-411032-01,869102049182049,861029384756102,18.5822,73.9197,120,Lohegaon Hill Sector 1A
+919890142831,+919130094812,2026-06-21 02:45:00,0,SMS,TOW-PN-411032-01,869102049182049,861029384756102,18.5822,73.9197,120,Lohegaon Hill Sector 1A
+919822019941,+919000112233,2026-06-21 11:07:15,34,VOICE,TOW-PN-411032-01,864291040182910,860000000111222,18.5822,73.9197,120,Lohegaon Hill Sector 1A
+919890142831,+919130094812,2026-06-21 11:12:02,12,VOICE,TOW-PN-411032-01,869102049182049,861029384756102,18.5822,73.9197,120,Lohegaon Hill Sector 1A
+919000112233,+919000445566,2026-06-21 11:17:40,4,VOICE,TOW-PN-411032-01,860000000111222,860000000333444,18.5822,73.9197,120,Lohegaon Hill Sector 1A
+919000112233,+919766318820,2026-06-21 10:45:12,3,VOICE,TOW-PN-411014-09,860000000111222,869988776655443,18.5679,73.9143,270,Viman Nagar Cyber City
+919130094812,+919422001199,2026-06-22 02:00:18,95,VOICE,TOW-PN-411006-04,861029384756102,865544332211009,18.5529,73.8828,180,Yerawada Industrial Junction`,
  },
  jio_standard: {
    name: 'Reliance Jio Standard CDR Export',
    operator: 'Reliance Jio',
    description: 'Standard Jio CDR format with A_PARTY_NO, B_PARTY_NO, START_TIME and CELL_ID headers.',
    csvText: `A_PARTY_NO,B_PARTY_NO,START_TIME,CALL_DURATION,CALL_TYPE,FIRST_CELL_ID,IMEI,LATITUDE,LONGITUDE
+919890142831,+919822019941,2026-06-20 11:10:00,140,VOICE,TOW-PN-411014-03,869102049182049,18.5482,73.9025
+919822019941,+919890142831,2026-06-20 15:40:22,280,VOICE,TOW-PN-411014-03,864291040182910,18.5482,73.9025
+919890142831,+919130094812,2026-06-21 00:55:10,65,VOICE,TOW-PN-411032-01,869102049182049,18.5822,73.9197
+919130094812,+919890142831,2026-06-21 03:12:44,45,VOICE,TOW-PN-411032-01,861029384756102,18.5822,73.9197
+919890142831,+919130094812,2026-06-21 11:12:02,12,VOICE,TOW-PN-411032-01,869102049182049,18.5822,73.9197`,
  },
  vi_cdr: {
    name: 'Vodafone Idea (Vi) Cell Dump',
    operator: 'Vodafone Idea',
    description: 'Vodafone format containing ORIGINATING_NO, TERMINATING_NO, DATE_TIME and AZIMUTH.',
    csvText: `ORIGINATING_NO,TERMINATING_NO,DATE_TIME,DURATION,EVENT_TYPE,CELL_ID,AZIMUTH,LAT,LON
+919000112233,+919766318820,2026-06-21 10:45:12,3,VOICE,TOW-PN-411014-09,270,18.5679,73.9143
+919000112233,+919766318820,2026-06-21 10:50:00,2,VOICE,TOW-PN-411014-09,270,18.5679,73.9143
+919000112233,+919000445566,2026-06-21 11:17:40,4,VOICE,TOW-PN-411032-01,120,18.5822,73.9197`,
  },
};
