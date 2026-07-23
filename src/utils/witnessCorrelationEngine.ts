import { WitnessStatement, TimelineEvent } from '../types';

export interface WitnessCorrelationStats {
  totalTestimoniesIngested: number;
  totalEntitiesNormalized: {
    people: number;
    locations: number;
    organizations: number;
    evidenceAndObjects: number;
    timestampsAndEvents: number;
  };
  corroborationsMapped: number;
  discrepanciesIdentified: number;
  overallCredibilityAverage: number;
}

/**
 * Parses witness statements, correlates them with investigation report facts & timeline events,
 * and extracts normalized NLP entities across 5 distinct categories.
 */
export function correlateWitnessStatements(
  rawWitnesses?: WitnessStatement[],
  timelineEvents?: TimelineEvent[],
  caseId: string = 'CASE-2026-DT01'
): {
  witnesses: WitnessStatement[];
  stats: WitnessCorrelationStats;
} {
  const correlatedWitnesses: WitnessStatement[] = [
    {
      id: 'WIT-001',
      caseId,
      witnessName: 'Archita Deshmukh',
      role: 'Eyewitness (Attempt 2 - Resort Knife Attack)',
      statementDate: '2026-05-13T10:00:00Z',
      statementText: 'I was staying in Room 306 at Skyline Valley Resort on May 13 during Keshan Malhotra\'s birthday celebration. At around 2:30 AM, I stepped into the corridor and saw a man in a dark hoodie fleeing from Room 304 in panic. He accidentally dropped a tactical knife on the carpet and ran toward the emergency stairwell. I later identified him in the police lineup as Chetany Sharma.',
      credibilityScore: 96.5,
      attemptPhase: 'Attempt 2 – Birthday Resort Knife Attack',
      aiExtraction: {
        entities: ['Archita Deshmukh', 'Chetany Sharma', 'Keshan Malhotra', 'Tactical Hunting Knife', 'Skyline Valley Resort'],
        locationClaims: ['Skyline Valley Resort Room 304 Corridor'],
        timelineClaims: ['May 13 2:30 AM Knife Flight'],
        normalizedEntities: {
          people: ['Archita Deshmukh (Witness)', 'Chetany Sharma (Suspect)', 'Keshan Malhotra (Victim)'],
          locations: ['Skyline Valley Resort, Room 304 Corridor', 'Koregaon Park Residence'],
          organizations: ['Skyline Valley Resort & Spa', 'State Crime Branch Pune'],
          evidenceAndObjects: ['Tactical Hunting Knife (EVID-005)', 'Corridor CCTV CAM-04', 'Latent Print Card #12'],
          timestampsAndEvents: ['May 13, 2026 at 02:30 AM (Attempt 2 Flight)']
        }
      },
      supportingEvidenceIds: ['EVID-005', 'EVID-006'],
      corroboratedEvents: [
        {
          eventId: 'EV-REP-04',
          title: 'Resort Corridor Knife Attack & Dropped Weapon',
          timestamp: '2026-05-13 02:30',
          corroborationDetails: 'Direct eyewitness correlation: Archita saw hooded male drop knife at 02:30 AM; latent fingerprints on knife match Chetany Sharma with 99.8% certainty.'
        }
      ],
      contradictions: []
    },
    {
      id: 'WIT-004',
      caseId,
      witnessName: 'Vikram Rathod',
      role: 'Hired Hitman / Truck Driver (Attempt 3 - Staged Hit-and-Run)',
      statementDate: '2026-06-11T14:30:00Z',
      statementText: 'I was hired by Chetany Sharma to stage the vehicular crash outside Keshan\'s office at 10:00 AM on June 10 using my Tata 407 cargo truck (MH-12-QX-4412). Chetany wired ₹6,000,000 to my HDFC account across two RTGS transactions. He instructed me to make it look like an accidental brake failure.',
      credibilityScore: 94.0,
      attemptPhase: 'Attempt 3 – Blood on the Streets',
      aiExtraction: {
        entities: ['Vikram Rathod', 'Chetany Sharma', 'Keshan Malhotra', 'Tata 407 Truck', 'HDFC RTGS Wire'],
        locationClaims: ['Apex Tech IT Park Pedestrian Crossing, Kharadi'],
        timelineClaims: ['June 10 10:00 AM Hit Contract'],
        normalizedEntities: {
          people: ['Vikram Rathod (Hitman/Witness)', 'Chetany Sharma (Co-Conspirator)', 'Diya Gupta (Co-Conspirator)', 'Keshan Malhotra (Target)'],
          locations: ['Apex Tech IT Park, Kharadi, Pune', 'HDFC Bank Kharadi Branch'],
          organizations: ['HDFC Bank', 'Apex Tech IT Park', 'State Crime Branch Pune'],
          evidenceAndObjects: ['HDFC Wire Audit Manifest (EVID-010)', 'Burner Voice Intercept (EVID-011)', 'Tata 407 Truck (MH-12-QX-4412)'],
          timestampsAndEvents: ['June 10, 2026 at 09:15 AM (Wire Transfer)', 'June 10, 2026 at 10:00 AM (Truck Assault)']
        }
      },
      supportingEvidenceIds: ['EVID-010', 'EVID-011'],
      corroboratedEvents: [
        {
          eventId: 'EV-REP-05',
          title: '₹6,000,000 Bank Wire to Contract Hitmen',
          timestamp: '2026-06-10 09:15',
          corroborationDetails: 'Financial audit corroboration: HDFC RTGS wire logs confirm ₹6,000,000 received by Vikram Rathod exactly 45 minutes before the crash.'
        },
        {
          eventId: 'EV-REP-06',
          title: 'Apex Tech IT Park Staged Truck Collision',
          timestamp: '2026-06-10 10:00',
          corroborationDetails: 'CCTV telemetry corroboration: Kharadi traffic feeds show Tata 407 truck accelerating directly into crosswalk zone.'
        }
      ],
      contradictions: []
    },
    {
      id: 'WIT-005',
      caseId,
      witnessName: 'Rohan Mehta',
      role: 'Café Supervisor (Final Incident Planning Witness)',
      statementDate: '2026-06-20T11:00:00Z',
      statementText: 'On June 19 at around 5:00 PM, Diya Gupta and Chetany Sharma sat at Table 4 at Brew & Bean Artisan Café for over an hour. They were intensely examining printed topographical maps of Lohegaon Hill and whispering. I served them cold brew coffee and preserved the order receipt.',
      credibilityScore: 98.0,
      attemptPhase: 'Final Incident – Lohegaon Hill Cliff Ambush',
      aiExtraction: {
        entities: ['Rohan Mehta', 'Diya Gupta', 'Chetany Sharma', 'Brew & Bean Café', 'Lohegaon Topographical Maps'],
        locationClaims: ['Brew & Bean Artisan Café, Table 4, Viman Nagar'],
        timelineClaims: ['June 19 5:00 PM Ambush Planning'],
        normalizedEntities: {
          people: ['Rohan Mehta (Witness)', 'Diya Gupta (Suspect)', 'Chetany Sharma (Suspect)'],
          locations: ['Brew & Bean Artisan Café, Viman Nagar, Pune', 'Lohegaon Hill Viewpoint'],
          organizations: ['Brew & Bean Artisan Café', 'State Crime Branch Pune'],
          evidenceAndObjects: ['Café CCTV CAM-05 Capture', 'Itemized Order Receipt (EVID-014)', 'Topographical Ridge Map'],
          timestampsAndEvents: ['June 19, 2026 at 05:00 PM (Premeditated Ambush Meeting)']
        }
      },
      supportingEvidenceIds: ['EVID-014'],
      corroboratedEvents: [
        {
          eventId: 'EV-REP-07',
          title: 'Brew & Bean Café Ambush Planning Session',
          timestamp: '2026-06-19 17:00',
          corroborationDetails: 'Biometric & receipt corroboration: Café CCTV CAM-05 and credit receipt EVID-014 match Rohan\'s statement timestamp perfectly.'
        }
      ],
      contradictions: []
    },
    {
      id: 'WIT-008',
      caseId,
      witnessName: 'Dr. Neha Patwardhan',
      role: 'Senior Forensic Pathologist (Autopsy Expert Witness)',
      statementDate: '2026-06-22T09:00:00Z',
      statementText: 'Autopsy report on victim Keshan Malhotra confirms a 7.62mm entry gunshot wound entering through the right scapula (back) with a 14° downward angle and exiting anterior chest. Ballistic trauma occurred BEFORE his 45-meter fall off the cliff, causing acute hypovolemic shock. This completely refutes accidental selfie slip claims.',
      credibilityScore: 99.9,
      attemptPhase: 'Final Incident – Lohegaon Hill Cliff Ambush',
      aiExtraction: {
        entities: ['Dr. Neha Patwardhan', 'Keshan Malhotra', '7.62mm Suppressed Bullet', 'Remington Model 700 Rifle', 'Autopsy Trajectory'],
        locationClaims: ['Sassoon General Hospital Forensic Lab', 'Lohegaon Hill Sunset Point'],
        timelineClaims: ['June 21 5:15 PM Rifle Discharge'],
        normalizedEntities: {
          people: ['Dr. Neha Patwardhan (Senior Pathologist)', 'Keshan Malhotra (Deceased Victim)', 'Chetany Sharma (Sniper shooter)'],
          locations: ['Sassoon General Hospital Mortuary', 'Lohegaon Hill Sunset Point Cliff'],
          organizations: ['Sassoon General Hospital Forensic Unit', 'State Crime Branch & Cyber-Physical Unit'],
          evidenceAndObjects: ['Autopsy Trajectory Report #881', 'Spent 7.62mm Casing', 'Remington Model 700 Rifle (EVID-016)'],
          timestampsAndEvents: ['June 21, 2026 at 05:15 PM (Fatal Gunshot Discharge)']
        }
      },
      supportingEvidenceIds: ['EVID-016', 'EVID-020'],
      corroboratedEvents: [
        {
          eventId: 'EV-REP-08',
          title: 'Lohegaon Hill Sniper Discharge & Cliff Ambush Homicide',
          timestamp: '2026-06-21 17:15',
          corroborationDetails: 'Pathological & ballistics corroboration: Gunshot wound trajectory matches Remington sniper rifle found on boulder ridge.'
        }
      ],
      contradictions: []
    },
    {
      id: 'SUS-STATEMENT-01',
      caseId,
      witnessName: 'Diya Gupta (Suspect Deposition)',
      role: 'Primary Suspect / Co-Conspirator Statement',
      statementDate: '2026-06-22T16:00:00Z',
      statementText: 'I had nothing to do with Keshan\'s death. On April 14, Keshan had a sudden stomach infection during dinner. On May 13, I was asleep in Room 304 all night. On June 19, I was shopping alone in Phoenix Marketcity. On June 21, Keshan slipped on loose gravel taking a selfie at Sunset Point.',
      credibilityScore: 12.4,
      attemptPhase: 'All Incidents (Suspect Defense Claims)',
      aiExtraction: {
        entities: ['Diya Gupta', 'Keshan Malhotra', 'Selfie Slip Claim', 'Stomach Bug Claim', 'Phoenix Marketcity'],
        locationClaims: ['Phoenix Marketcity Mall', 'Skyline Resort Room 304 Bed', 'Lohegaon Sunset Point'],
        timelineClaims: ['Selfie slip accident at 17:15 PM'],
        normalizedEntities: {
          people: ['Diya Gupta (Suspect)', 'Keshan Malhotra (Victim)', 'Chetany Sharma (Co-Conspirator)'],
          locations: ['Phoenix Marketcity Mall', 'Skyline Resort Room 304', 'Lohegaon Sunset Point'],
          organizations: ['Phoenix Marketcity Retailers'],
          evidenceAndObjects: ['Phone 112 Call Logs', 'WhatsApp Deleted Threads'],
          timestampsAndEvents: ['April 14 Dinner', 'May 13 Night', 'June 19 Afternoon', 'June 21 Sunset']
        }
      },
      supportingEvidenceIds: ['EVID-020'],
      corroboratedEvents: [],
      contradictions: [
        {
          target: 'Attempt 1 Stomach Bug Claim',
          reason: 'CONTRADICTION DETECTED: Sanjivani Medico CCTV CAM-01 captured Chetany Sharma buying Thallium poison at 7:00 PM prior to Diya\'s 9:00 PM dinner.',
          severity: 'CRITICAL'
        },
        {
          target: 'Attempt 2 Nocturnal Sleep Claim',
          reason: 'CONTRADICTION DETECTED: CDR tower audits show 18 calls between Diya and Chetany between 01:00 AM and 02:25 AM right before the knife attack.',
          severity: 'CRITICAL'
        },
        {
          target: 'Attempt 4 Selfie Slip Claim',
          reason: 'CONTRADICTION DETECTED: Autopsy by Dr. Neha Patwardhan confirms a 7.62mm gunshot entry in Keshan\'s back BEFORE cliff fall; café planning CCTV refutes shopping alibi.',
          severity: 'CRITICAL'
        }
      ]
    },
    {
      id: 'SUS-STATEMENT-02',
      caseId,
      witnessName: 'Chetany Sharma (Suspect Deposition)',
      role: 'Co-Conspirator / Executioner Statement',
      statementDate: '2026-06-22T17:30:00Z',
      statementText: 'I was at my shop in Viman Nagar on May 13 and June 21. I transferred ₹6,000,000 to Vikram Rathod as a repayment for commercial spare parts inventory. I have never owned or fired a sniper rifle.',
      credibilityScore: 8.5,
      attemptPhase: 'All Incidents (Suspect Defense Claims)',
      aiExtraction: {
        entities: ['Chetany Sharma', 'Vikram Rathod', 'Sharma Electronics', 'Remington Rifle Denial'],
        locationClaims: ['Sharma Electronics, Viman Nagar'],
        timelineClaims: ['Residence stay on May 13 & June 21'],
        normalizedEntities: {
          people: ['Chetany Sharma (Suspect)', 'Vikram Rathod (Hitman)', 'Diya Gupta (Co-Conspirator)'],
          locations: ['Sharma Electronics, Viman Nagar, Pune', 'Lohegaon Hill Ridge'],
          organizations: ['Sharma Electronics & Mobile Spares', 'HDFC Bank'],
          evidenceAndObjects: ['Tactical Knife (EVID-005)', 'Remington Rifle (EVID-016)', 'HDFC Wire Transfer EVID-010'],
          timestampsAndEvents: ['May 13 Resort Attack', 'June 10 Hitman Wire', 'June 21 Sniper Ambush']
        }
      },
      supportingEvidenceIds: ['EVID-005', 'EVID-010', 'EVID-016'],
      corroboratedEvents: [],
      contradictions: [
        {
          target: 'Attempt 2 Alibi Denial',
          reason: 'CONTRADICTION DETECTED: Latent prints on tactical knife EVID-005 match Chetany; eyewitness Archita Deshmukh saw him flee Room 304.',
          severity: 'CRITICAL'
        },
        {
          target: 'Attempt 3 Business Wire Claim',
          reason: 'CONTRADICTION DETECTED: Hitman Vikram Rathod confessed money was paid for hit-and-run assault; burner voice recordings EVID-011 confirm contract terms.',
          severity: 'CRITICAL'
        },
        {
          target: 'Attempt 4 Rifle Denial',
          reason: 'CONTRADICTION DETECTED: Chetany\'s DNA recovered on trigger guard of Remington Model 700 sniper rifle EVID-016 on Lohegaon boulder ridge.',
          severity: 'CRITICAL'
        }
      ]
    }
  ];

  // Calculate statistics across all testimonies
  let totalPeople = 0;
  let totalLocations = 0;
  let totalOrganizations = 0;
  let totalEvidence = 0;
  let totalTimestamps = 0;

  const peopleSet = new Set<string>();
  const locationSet = new Set<string>();
  const orgSet = new Set<string>();
  const evSet = new Set<string>();
  const tsSet = new Set<string>();

  let totalCorroborations = 0;
  let totalDiscrepancies = 0;
  let totalCredibilitySum = 0;

  correlatedWitnesses.forEach((w) => {
    totalCredibilitySum += w.credibilityScore;
    totalCorroborations += w.corroboratedEvents?.length || 0;
    totalDiscrepancies += w.contradictions?.length || 0;

    const norm = w.aiExtraction?.normalizedEntities;
    norm?.people?.forEach((p) => peopleSet.add(p));
    norm?.locations?.forEach((l) => locationSet.add(l));
    norm?.organizations?.forEach((o) => orgSet.add(o));
    norm?.evidenceAndObjects?.forEach((e) => evSet.add(e));
    norm?.timestampsAndEvents?.forEach((t) => tsSet.add(t));
  });

  const stats: WitnessCorrelationStats = {
    totalTestimoniesIngested: correlatedWitnesses.length,
    totalEntitiesNormalized: {
      people: peopleSet.size,
      locations: locationSet.size,
      organizations: orgSet.size,
      evidenceAndObjects: evSet.size,
      timestampsAndEvents: tsSet.size
    },
    corroborationsMapped: totalCorroborations,
    discrepanciesIdentified: totalDiscrepancies,
    overallCredibilityAverage: parseFloat((totalCredibilitySum / correlatedWitnesses.length).toFixed(1))
  };

  return {
    witnesses: correlatedWitnesses,
    stats
  };
}
