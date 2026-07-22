import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
let prisma: PrismaClient | any = null;
try {
  prisma = new PrismaClient();
} catch (e) {
  console.warn("Prisma failed to initialize, running with mock data only.", e);
}
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper fallback data if DB is not connected / seeded yet or running in memory mode
let mockCasesFallback: any[] = [
  {
    id: 'case-1',
    caseNumber: 'CASE-2026-884A',
    title: 'Project Genesis Breach',
    status: 'CRITICAL',
    priority: 'CRITICAL',
    assignedTo: 'Agent Sarah Jenkins (Cyber-Physical Div)',
    location: 'Sector 4, High-Security Research Facility, Zurich',
    incidentDate: '2026-07-15T23:14:00Z',
    summary: 'Unauthorized physical and cyber infiltration into Sub-Level 3 vault. High-grade classified bio-quantum assets compromised under anomalous sensor blackout conditions.',
    confidenceScore: 94.2,
  },
  {
    id: 'case-2',
    caseNumber: 'CASE-2026-712B',
    title: 'Orbital Uplink Sabotage - Station Alpha',
    status: 'ACTIVE',
    priority: 'CRITICAL',
    assignedTo: 'Lead Investigator Marcus Vance',
    location: 'Ground Control Terminal 9, Nevada Array',
    incidentDate: '2026-07-12T04:30:00Z',
    summary: 'Coordinated EMP surge and manual fiber termination causing 42-minute telemetry blackout during orbital insertion.',
    confidenceScore: 91.8,
  },
];

let doomedTriangleDataset: any = null;
try {
  const dtPath = path.join(__dirname, 'data/doomed_triangle_dataset.json');
  if (fs.existsSync(dtPath)) {
    doomedTriangleDataset = JSON.parse(fs.readFileSync(dtPath, 'utf-8'));
    const formattedDoomedCase = {
      id: 'case-dt01',
      caseNumber: doomedTriangleDataset.case_metadata.case_id || 'CASE-2026-DT01',
      title: doomedTriangleDataset.case_metadata.case_title || 'The Doomed Triangle',
      status: 'SOLVED_CHARGESHEET_FILED',
      priority: 'CRITICAL',
      assignedTo: doomedTriangleDataset.case_metadata.lead_investigators.join(', '),
      location: 'Kalyani Nagar & Lohegaon Hill, Pune',
      incidentDate: '2026-06-21T11:30:00Z',
      summary: doomedTriangleDataset.case_metadata.summary,
      confidenceScore: 99.98,
      evidence: (doomedTriangleDataset.module_2_evidence_vault?.exhibits || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        category: e.category,
        fileUrl: e.fileUrl,
        fileType: e.fileType,
        confidence: e.confidence,
        processedStatus: e.processedStatus,
        description: `${e.attempt ? `[${e.attempt}] ` : ''}${e.description}`
      })),
      witnesses: doomedTriangleDataset.module_3_witness_statements_and_nlp_entity_extraction.witnesses.map((w: any) => ({
        id: w.witness_id,
        witnessName: w.name,
        role: w.role,
        statementDate: w.statement_time,
        statementText: w.verbatim_statement,
        credibilityScore: (w.credibility_score || 0.95) * 100,
        aiExtraction: w.nlp_extracted_entities
      })),
      suspects: [
        {
          id: 'SUS-01',
          name: 'Diya Gupta',
          alias: 'Main Suspect / Mastermind',
          riskScore: 98,
          probability: 0.99,
          criminalHistory: ['Section 302 BNS (Murder)', 'Section 120-B BNS (Conspiracy)', 'Section 307 BNS (Attempt to Murder)'],
          phone: '+91 98220 11400',
          aiReasoning: 'Secret relationship with Chetany Sharma. Orchestrated four attempts (Poisoning, Resort Knife Attack, ₹6,000,000 Hit-and-Run, Lohegaon Hill Cliff Ambush) on Keshan Malhotra.'
        },
        {
          id: 'SUS-02',
          name: 'Chetany Sharma',
          alias: 'Co-Conspirator / Executioner',
          riskScore: 99,
          probability: 0.99,
          criminalHistory: ['Section 302 BNS (Murder)', 'Section 307 BNS (Attempt to Murder)'],
          phone: '+91 98220 55812',
          aiReasoning: 'Local shopkeeper. Purchased poison, launched knife attack at resort, wired ₹6,000,000 to hitman, met at cafe on June 19, and sniped Keshan at Lohegaon Hill on June 21.'
        }
      ],
      timelineEvents: (doomedTriangleDataset.module_1_chronological_timeline_engine?.events || []).map((ev: any) => ({
        id: ev.event_id || ev.id,
        timestamp: ev.timestamp || ev.ts,
        title: (ev.timeline_group ? `[${ev.timeline_group}] ` : '') + (ev.event_category || ev.cat) + ' - ' + (ev.exact_location || ev.loc?.name || 'Pune'),
        description: ev.ai_summary || ev.desc,
        category: (ev.event_category || ev.cat) === 'Planning' || (ev.event_category || ev.cat) === 'Digital' ? 'NETWORK' : (ev.event_category || ev.cat) === 'Execution' || (ev.event_category || ev.cat) === 'Forensic' ? 'WEAPON' : 'CCTV',
        confidence: (ev.confidence_score || 0.95) * 100,
        aiReasoning: ev.investigation_notes || ev.notes
      })),
      reconstruction: {
        id: 'recon-dt01',
        caseId: 'case-dt01',
        sceneType: 'OUTDOOR_CLIFF_AMBUSH',
        environment: { lighting: 'SUNSET', weather: 'WINDY_CLEAR', terrain: 'ROCKY_RIDGE' },
        trajectories: [
          { id: 'traj-1', label: 'Sniper Shot (Remington Model 700)', startPoint: [15, 8, -40], endPoint: [0, 1.6, 0], weaponType: 'SNIPER_RIFLE', confidence: 99.5 }
        ]
      },
      fullDataset: doomedTriangleDataset
    };
    mockCasesFallback.unshift(formattedDoomedCase);
  }
} catch (err) {
  console.warn("Could not preload Doomed Triangle dataset:", err);
}

// ==========================================
// AUTHENTICATION API
// ==========================================
// Auth routes have been migrated to Vercel Serverless Functions in api/auth/*
// Added fallback for local development without Vercel CLI
const AGENT_CREDENTIALS = [
  { id: '1', name: 'Atharav', email: 'atharav1708@suraag.ai', password: 'ATH1708!', role: 'Investigator', employeeId: 'AGT-001' },
  { id: '2', name: 'Archita', email: 'archita1503@suraag.ai', password: 'ARC1503!', role: 'Investigator', employeeId: 'AGT-002' },
  { id: '3', name: 'Anuradha', email: 'anuradha1411@suraag.ai', password: 'ANU1411!', role: 'Investigator', employeeId: 'AGT-003' },
  { id: '4', name: 'Aditya', email: 'aditya1205@suraag.ai', password: 'ADI1205!', role: 'Investigator', employeeId: 'AGT-004' },
  { id: '5', name: 'Dipankar', email: 'dipankar2803@suraag.ai', password: 'DIP2803!', role: 'Investigator', employeeId: 'AGT-005' },
  { id: '6', name: 'Darshil', email: 'darshil1812@suraag.ai', password: 'DAR1812!', role: 'Investigator', employeeId: 'AGT-006' },
];

const JWT_SECRET = process.env.JWT_SECRET || 'suraag_super_secret_key_2026';

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  
  const user = AGENT_CREDENTIALS.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  
  const token = jwt.sign({ 
    id: user.id, role: user.role, name: user.name, employeeId: user.employeeId, email: user.email
  }, JWT_SECRET, { expiresIn: '8h' });
  
  return res.json({ token, user: { id: user.id, employeeId: user.employeeId, role: user.role, name: user.name, email: user.email } });
});

// ==========================================
// CASES API
// ==========================================
app.get('/api/cases', async (req: Request, res: Response) => {
  try {
    const { status, priority, search } = req.query;
    let where: any = {};
    if (status && status !== 'ALL') where.status = String(status);
    if (priority && priority !== 'ALL') where.priority = String(priority);
    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { caseNumber: { contains: String(search), mode: 'insensitive' } },
        { assignedTo: { contains: String(search), mode: 'insensitive' } },
      ];
    }
    let cases = await prisma.case.findMany({ where, orderBy: { incidentDate: 'desc' } });
    if (mockCasesFallback.length > 0 && mockCasesFallback[0].caseNumber === 'CASE-2026-DT01') {
      if (!cases.some((c: any) => c.caseNumber === 'CASE-2026-DT01')) {
        cases.unshift(mockCasesFallback[0]);
      }
    }
    return res.json(cases);
  } catch (err) {
    // Fallback to memory
    return res.json(mockCasesFallback);
  }
});

app.get('/api/cases/:id', async (req: Request, res: Response) => {
  if (req.params.id === 'CASE-2026-DT01' || req.params.id === 'case-dt01') {
    const dtCase = mockCasesFallback.find(x => x.caseNumber === 'CASE-2026-DT01' || x.id === 'case-dt01');
    if (dtCase) return res.json(dtCase);
  }
  try {
    const c = await prisma.case.findFirst({
      where: {
        OR: [{ id: req.params.id }, { caseNumber: req.params.id }],
      },
      include: {
        evidence: true,
        witnesses: true,
        suspects: true,
        timelineEvents: true,
        reconstruction: true,
      },
    });
    if (!c) return res.status(404).json({ error: 'Case not found' });
    return res.json(c);
  } catch (err) {
    const c = mockCasesFallback.find(x => x.id === req.params.id || x.caseNumber === req.params.id) || mockCasesFallback[0];
    return res.json(c);
  }
});

app.get('/api/dataset/doomed-triangle', async (req: Request, res: Response) => {
  if (doomedTriangleDataset) {
    return res.json(doomedTriangleDataset);
  }
  return res.status(404).json({ error: 'Doomed Triangle dataset not found' });
});

app.post('/api/cases', async (req: Request, res: Response) => {
  try {
    const created = await prisma.case.create({ data: req.body });
    return res.status(201).json(created);
  } catch (err) {
    const newCase = { id: `case-${Date.now()}`, ...req.body };
    mockCasesFallback.push(newCase);
    return res.status(201).json(newCase);
  }
});

app.post('/api/cases/ingest', async (req: Request, res: Response) => {
  const { storyline } = req.body;
  if (!storyline) return res.status(400).json({ error: 'Storyline text is required' });

  try {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY missing');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const prompt = `Analyze this crime storyline and extract the details into a strict JSON object. 
The JSON must follow this exact structure:
{
  "caseNumber": "CASE-YYYY-XXXX",
  "title": "Short title",
  "status": "ACTIVE",
  "priority": "CRITICAL",
  "assignedTo": "Lead Investigator",
  "location": "Main location",
  "incidentDate": "2026-06-21T11:30:00Z",
  "summary": "1-2 sentence summary",
  "confidenceScore": 95.5,
  "evidence": [
    { "title": "Item name", "category": "WEAPON or CCTV or DOCUMENT or PHONE or VEHICLE or BALLISTICS", "fileUrl": "https://images.unsplash.com/photo-1580000000000?auto=format&fit=crop&w=800&q=80", "fileType": "image/jpeg", "confidence": 99.0, "processedStatus": "COMPLETED", "boundingBoxes": [] }
  ],
  "witnesses": [
    { "witnessName": "Name", "role": "Role", "statementDate": "2026-06-21T12:00:00Z", "statementText": "Quote", "aiExtraction": { "entities": [], "locationClaims": [], "timelineClaims": [] }, "credibilityScore": 90.0, "contradictions": [{ "target": "What it contradicts", "reason": "Why", "severity": "CRITICAL" }] }
  ],
  "suspects": [
    { "name": "Name", "alias": "Alias", "riskScore": 95, "probability": 0.9, "criminalHistory": [], "phone": "12345", "aiReasoning": "Why" }
  ],
  "timelineEvents": [
    { "timestamp": "2026-06-21T10:00:00Z", "title": "Event name", "description": "What happened", "category": "NETWORK or CCTV or WEAPON or VEHICLE", "confidence": 98.0, "aiReasoning": "Why" }
  ]
}

Ensure you generate at least 2 witnesses (one of which must have a contradiction) and at least 4 timeline events based on the storyline. If the storyline is too short, creatively extrapolate plausible forensic details that fit the narrative.

Here is the storyline:
${storyline}`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(prompt);
    const parsedData = JSON.parse(result.response.text());

    if (prisma) {
      const newCase = await prisma.case.create({
        data: {
          caseNumber: parsedData.caseNumber,
          title: parsedData.title,
          status: parsedData.status,
          priority: parsedData.priority,
          assignedTo: parsedData.assignedTo,
          location: parsedData.location,
          incidentDate: new Date(parsedData.incidentDate || new Date()),
          summary: parsedData.summary,
          confidenceScore: parsedData.confidenceScore,
          evidence: { create: parsedData.evidence || [] },
          witnesses: {
            create: (parsedData.witnesses || []).map((w: any) => ({
              ...w,
              statementDate: new Date(w.statementDate || new Date())
            }))
          },
          suspects: { create: parsedData.suspects || [] },
          timelineEvents: { create: parsedData.timelineEvents || [] }
        }
      });
      return res.json({ id: newCase.id });
    } else {
      throw new Error("Database not connected");
    }
  } catch (error: any) {
    console.error('[Suraag AI] Case Ingestion Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// EVIDENCE & COMPUTER VISION API
// ==========================================
app.get('/api/evidence', async (req: Request, res: Response) => {
  try {
    const { caseId, category } = req.query;
    let where: any = {};
    if (caseId) where.caseId = String(caseId);
    if (category && category !== 'ALL') where.category = String(category);
    const evidence = await prisma.evidence.findMany({ where, orderBy: { createdAt: 'desc' } });
    return res.json(evidence);
  } catch (err) {
    return res.json([
      {
        id: 'ev-1',
        caseId: 'case-1',
        title: 'Glock 19 Gen 5 9mm Pistol (Recovered in Duct)',
        category: 'WEAPON',
        fileUrl: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&w=800&q=80',
        fileType: 'image/jpeg',
        confidence: 98.4,
        boundingBoxes: [{ x: 120, y: 150, width: 180, height: 110, label: 'Glock 19 (98.4%)', confidence: 0.984 }],
        processedStatus: 'COMPLETED',
      },
      {
        id: 'ev-2',
        caseId: 'case-1',
        title: 'High-Velocity Blood Spatter (Type O+)',
        category: 'BLOOD',
        fileUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
        fileType: 'image/jpeg',
        confidence: 94.1,
        boundingBoxes: [{ x: 80, y: 90, width: 220, height: 160, label: 'Blood Spatter Type O+ (94.1%)', confidence: 0.941 }],
        processedStatus: 'COMPLETED',
      },
    ]);
  }
});

app.post('/api/evidence/process', async (req: Request, res: Response) => {
  // Simulates computer vision object detection pipeline
  const { fileName, fileType, caseId, category } = req.body;
  
  const mockCategories = ['WEAPON', 'BLOOD', 'FOOTPRINT', 'VEHICLE', 'PHONE', 'FINGERPRINT', 'BALLISTICS', 'CCTV', 'DOCUMENT'];
  const assignedCategory = category || mockCategories[Math.floor(Math.random() * mockCategories.length)];
  const confidence = parseFloat((88.0 + Math.random() * 11.5).toFixed(1));
  
  const boundingBoxes = [
    {
      x: Math.floor(Math.random() * 300) + 60,
      y: Math.floor(Math.random() * 200) + 60,
      width: Math.floor(Math.random() * 140) + 80,
      height: Math.floor(Math.random() * 140) + 80,
      label: assignedCategory === 'WEAPON' ? 'Glock 19 Pistol (98.4%)' : assignedCategory === 'BLOOD' ? 'Arterial Spatter Pool (94.1%)' : `${assignedCategory} Detected (${confidence}%)`,
      confidence: confidence / 100,
    }
  ];

  try {
    const created = await prisma.evidence.create({
      data: {
        caseId: caseId || 'case-1',
        title: fileName || 'Uploaded Tactical Evidence Item',
        category: assignedCategory,
        fileUrl: 'https://images.unsplash.com/photo-1580000000000?auto=format&fit=crop&w=800&q=80',
        fileType: fileType || 'image/jpeg',
        confidence,
        boundingBoxes,
        processedStatus: 'COMPLETED',
        metadata: {
          scannedBy: 'Suraag AI Vision Module v4.2',
          timestamp: new Date().toISOString(),
        },
      },
    });
    return res.status(201).json(created);
  } catch (err) {
    return res.status(201).json({
      id: `ev-${Date.now()}`,
      caseId: caseId || 'case-1',
      title: fileName || 'Uploaded Tactical Evidence Item',
      category: assignedCategory,
      fileUrl: 'https://images.unsplash.com/photo-1580000000000?auto=format&fit=crop&w=800&q=80',
      fileType: fileType || 'image/jpeg',
      confidence,
      boundingBoxes,
      processedStatus: 'COMPLETED',
    });
  }
});

// ==========================================
// WITNESSES & CONTRADICTIONS API
// ==========================================
app.get('/api/witnesses', async (req: Request, res: Response) => {
  try {
    const { caseId } = req.query;
    let where: any = {};
    if (caseId) where.caseId = String(caseId);
    const witnesses = await prisma.witnessStatement.findMany({ where, orderBy: { statementDate: 'asc' } });
    if (witnesses && witnesses.length > 0) return res.json(witnesses);

    if (mockCasesFallback.length > 0 && mockCasesFallback[0].witnesses) {
      return res.json(mockCasesFallback[0].witnesses);
    }
    return res.json([]);
  } catch (err) {
    if (mockCasesFallback.length > 0 && mockCasesFallback[0].witnesses) {
      return res.json(mockCasesFallback[0].witnesses);
    }
    return res.json([]);
  }
});

app.post('/api/witnesses/correlate', async (req: Request, res: Response) => {
  try {
    const { caseId = 'CASE-2026-DT01' } = req.body;
    const correlated = [
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

    const stats = {
      totalTestimoniesIngested: correlated.length,
      totalEntitiesNormalized: { people: 8, locations: 7, organizations: 6, evidenceAndObjects: 10, timestampsAndEvents: 8 },
      corroborationsMapped: 5,
      discrepanciesIdentified: 6,
      overallCredibilityAverage: 68.2
    };

    return res.json({ witnesses: correlated, stats });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// SUSPECTS API
// ==========================================
app.get('/api/suspects', async (req: Request, res: Response) => {
  try {
    const { caseId } = req.query;
    let where: any = {};
    if (caseId) where.caseId = String(caseId);
    const suspects = await prisma.suspect.findMany({ where, orderBy: { riskScore: 'desc' } });
    return res.json(suspects);
  } catch (err) {
    return res.json([
      {
        id: 'susp-1',
        name: 'Viktor "Shadow" Krell',
        alias: 'V-KRELL',
        riskScore: 96,
        probability: 0.89,
        phone: '+41 79 555 0192',
        criminalHistory: ['Armed Infiltration - Geneva 2024', 'Industrial Espionage', 'Biometric Spoofing'],
        aiReasoning: 'Satellite phone pinged within 180m of breach exactly 12 seconds prior to blackout. Ballistic profile matches prior modus operandi.',
      },
    ]);
  }
});

// ==========================================
// TIMELINE & RECONSTRUCTION API
// ==========================================
app.get('/api/timeline', async (req: Request, res: Response) => {
  try {
    const { caseId } = req.query;
    let where: any = {};
    if (caseId) where.caseId = String(caseId);
    const events = await prisma.timelineEvent.findMany({ where, orderBy: { timestamp: 'asc' } });
    if (events && events.length > 0) return res.json(events);
    
    // Fallback to preloaded Doomed Triangle dataset if available
    if (mockCasesFallback.length > 0 && mockCasesFallback[0].timelineEvents) {
      return res.json(mockCasesFallback[0].timelineEvents);
    }
    return res.json([]);
  } catch (err) {
    if (mockCasesFallback.length > 0 && mockCasesFallback[0].timelineEvents) {
      return res.json(mockCasesFallback[0].timelineEvents);
    }
    return res.json([
      { timestamp: '23:10:15', title: 'Perimeter Drone Surveillance Detected', category: 'NETWORK', confidence: 91.0, description: 'Unregistered micro-drone RF emissions detected along North perimeter grid.' },
      { timestamp: '23:14:02', title: 'Corridor CCTV Feed Tampering', category: 'CCTV', confidence: 98.5, description: 'Sub-Level 3 Camera #4 experiences sudden frame freezing and loop injection lasting 42 seconds.' },
      { timestamp: '23:15:10', title: 'Acoustic Gunshot Signature (Suppressed)', category: 'AUDIO', confidence: 96.4, description: 'Acoustic sensors register subsonic 9mm discharge in Sub-Level 3 main corridor.' },
    ]);
  }
});

app.post('/api/timeline/parse-report', async (req: Request, res: Response) => {
  try {
    const { caseId = 'CASE-2026-DT01' } = req.body;
    // Extract report timeline events
    const reportEvents = [
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
        relationships: { suspects: ['Chetany Sharma', 'Diya Gupta'], victim: 'Keshan Malhotra', relationshipType: 'Conspiracy & Poison Procurement' },
        supportingEvidenceIds: ['EVID-001'],
        alibiClaim: 'Diya claimed Keshan suffered an unexpected organic stomach bug during dinner.',
        forensicRefutation: 'Sanjivani Medico CCTV CAM-01 captured Chetany buying Thallium at 19:00; UPI receipt (₹1,450) logged to Chetany.'
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
        relationships: { suspects: ['Diya Gupta', 'Chetany Sharma'], victim: 'Keshan Malhotra', relationshipType: 'Attempted Fatal Ingestion' },
        supportingEvidenceIds: ['EVID-002'],
        alibiClaim: 'Claimed dinner was a routine pre-wedding romantic date.',
        forensicRefutation: 'Digital extraction of deleted WhatsApp threads confirms coordination with Chetany 15 minutes before arrival.'
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
        relationships: { suspects: ['Diya Gupta', 'Chetany Sharma'], victim: 'Keshan Malhotra', relationshipType: 'Infiltration Signaling' },
        supportingEvidenceIds: ['EVID-020'],
        alibiClaim: 'Diya claimed she was asleep in Room 304 from midnight to morning.',
        forensicRefutation: 'CDR tower audits reveal 18 pre-incident phone calls between Diya and Chetany between 01:00 AM and 02:25 AM.'
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
        relationships: { suspects: ['Chetany Sharma', 'Diya Gupta'], witnesses: ['Archita Deshmukh (WIT-001)'], victim: 'Keshan Malhotra', relationshipType: 'Attempted Stabbing & Eyewitness Identification' },
        supportingEvidenceIds: ['EVID-005', 'EVID-006'],
        linkedWitnessIds: ['WIT-001'],
        alibiClaim: 'Chetany claimed he was at his residence in Viman Nagar all night.',
        forensicRefutation: 'Latent fingerprints on EVID-005 knife match Chetany; eyewitness Archita Deshmukh identified him fleeing Room 304.'
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
        relationships: { suspects: ['Chetany Sharma', 'Diya Gupta'], witnesses: ['Vikram Rathod (WIT-004)'], victim: 'Keshan Malhotra', relationshipType: 'Hired Assassination Financing' },
        supportingEvidenceIds: ['EVID-010', 'EVID-011'],
        linkedWitnessIds: ['WIT-004'],
        alibiClaim: 'Chetany claimed money wire was a business loan payment for electronics inventory.',
        forensicRefutation: 'Bank audits show instant transfer to truck owner; burner phone voice recordings detail contract terms.'
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
        relationships: { suspects: ['Chetany Sharma', 'Diya Gupta'], witnesses: ['Vikram Rathod (WIT-004)'], victim: 'Keshan Malhotra', relationshipType: 'Vehicular Hit-and-Run Assault' },
        supportingEvidenceIds: ['EVID-010', 'EVID-011'],
        linkedWitnessIds: ['WIT-004'],
        alibiClaim: 'Reported as an accidental steering failure by an unknown commercial driver.',
        forensicRefutation: 'Vikram Rathod confessed under interrogation; CCTV telemetry proves deliberate steering correction into pedestrian zone.'
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
        relationships: { suspects: ['Diya Gupta', 'Chetany Sharma'], witnesses: ['Rohan Mehta (WIT-005)'], victim: 'Keshan Malhotra', relationshipType: 'Premeditated Ambush Strategy' },
        supportingEvidenceIds: ['EVID-014'],
        linkedWitnessIds: ['WIT-005'],
        alibiClaim: 'Diya claimed she was shopping alone in Phoenix Marketcity mall on June 19.',
        forensicRefutation: 'Café supervisor Rohan Mehta served cold brew to both suspects at Table 4; CCTV & order bill confirm presence.'
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
        relationships: { suspects: ['Diya Gupta', 'Chetany Sharma'], witnesses: ['Dr. Neha Patwardhan (WIT-008)'], victim: 'Keshan Malhotra', relationshipType: 'Fatal Sniper Homicide & Staged Accidental Fall' },
        supportingEvidenceIds: ['EVID-016', 'EVID-020'],
        linkedWitnessIds: ['WIT-008'],
        alibiClaim: 'Diya dialed 112 claiming Keshan slipped on loose gravel while posing for a selfie.',
        forensicRefutation: 'Autopsy by Dr. Neha Patwardhan confirms a 7.62mm gunshot trajectory through shoulder blade BEFORE cliff fall; rifle recovered with Chetany\'s DNA.'
      }
    ];

    const stats = {
      totalEventsExtracted: reportEvents.length,
      entitiesExtracted: { persons: 8, locations: 6, objectsAndWeapons: 9, vehicles: 2 },
      relationshipsMapped: 24,
      attemptsIdentified: 4
    };

    return res.json({ events: reportEvents, stats });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/reconstruction/:caseId', async (req: Request, res: Response) => {
  try {
    const data = await prisma.reconstructionData.findFirst({
      where: {
        OR: [{ caseId: req.params.caseId }, { case: { caseNumber: req.params.caseId } }],
      },
    });
    if (data) return res.json(data);
  } catch (err) {}
  
  return res.json({
    caseId: req.params.caseId,
    attackerPosition: { x: -2.4, y: 1.7, z: 3.1 },
    victimPosition: { x: 1.8, y: 1.2, z: 0.5 },
    attackDirection: 'Azimuth 38° East, Elevation -14° Downward',
    weaponAngle: '34.2° relative to floor plane',
    lineOfSight: {
      visibilityScore: 98.4,
      occludedBy: ['Structural Column C-2', 'Server Rack #4'],
    },
    physicsResults: {
      bulletTrajectory: {
        start: [-2.4, 1.7, 3.1],
        impact: [1.8, 1.2, 0.5],
        velocityMps: 340,
        caliber: '9mm Subsonic',
        ricochetAngle: 12.4,
        kineticEnergyJoules: 485,
      },
      bloodSpatter: {
        origin: [1.8, 1.2, 0.5],
        dropletCount: 420,
        patternType: 'High-Velocity Forward Spatter',
        ellipsoidRatio: 1.42,
      },
    },
    scenarios: [
      { id: 'SCENARIO-A', name: 'Premeditated Insider-Assisted Ambush', probability: 78.4, description: 'Suspect Viktor Krell utilized compromised credentials from Dr. Vance to enter via airlock.', evidenceCount: 18 },
      { id: 'SCENARIO-B', name: 'External Cyber-Kinetic Assault', probability: 18.1, description: 'Automated drone swarm disabled external sensors while two operatives forced entry.', evidenceCount: 6 },
      { id: 'SCENARIO-C', name: 'Accidental Containment Failure & Coverup', probability: 3.5, description: 'Internal biological containment pressure surge caused equipment failure.', evidenceCount: 2 },
    ],
  });
});

// ==========================================
// AI REASONING & ASSISTANT CHAT API
// ==========================================
app.post('/api/ai/assistant/chat', async (req: Request, res: Response) => {
  const { message, caseId, history } = req.body;

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured in .env');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Fetch case context for grounding the AI
    let caseContext = 'No specific case data provided.';
    if (caseId) {
      try {
        const c = await prisma.case.findFirst({
          where: { OR: [{ id: caseId }, { caseNumber: caseId }] },
          include: { suspects: true, evidence: true, witnesses: true, timelineEvents: true, reconstruction: true }
        });
        if (c) {
          caseContext = JSON.stringify(c, null, 2);
        } else {
          const fallback = mockCasesFallback.find(x => x.id === caseId || x.caseNumber === caseId);
          if (fallback) caseContext = JSON.stringify(fallback, null, 2);
        }
      } catch (e) {
        const fallback = mockCasesFallback.find(x => x.id === caseId || x.caseNumber === caseId);
        if (fallback) caseContext = JSON.stringify(fallback, null, 2);
      }
    }

    const systemInstruction = `You are a highly advanced AI investigative co-pilot (Gemini 3.1 Pro Tactical Co-Pilot) working for Suraag AI, a forensic intelligence platform. You analyze crime scene data, 3D reconstructions, ballistic trajectories, witness statements, and sensor telemetry. Adopt a tactical, analytical, and highly precise tone. Provide structured, concise intelligence briefings when asked questions. Always format with markdown for readability. Use the following case context to answer questions about the active investigation:\n\n${caseContext}`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction,
    });

    // Format chat history to match Gemini's expected Content[] type
    let formattedHistory: any[] = [];
    let lastRole = null;
    const rawHistory = Array.isArray(history) ? history : [];
    
    for (const msg of rawHistory) {
      const role = msg.role === 'model' ? 'model' : 'user';
      if (role !== lastRole) {
        formattedHistory.push({
          role,
          parts: [{ text: msg.text || '' }]
        });
        lastRole = role;
      } else if (formattedHistory.length > 0) {
        formattedHistory[formattedHistory.length - 1].parts[0].text += '\n\n' + (msg.text || '');
      }
    }

    // Gemini strictly requires the first message to be from 'user'
    if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory.shift();
    }

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    return res.json({
      role: 'model',
      text: responseText,
      timestamp: new Date().toISOString(),
      confidence: parseFloat((92.0 + Math.random() * 7.5).toFixed(1)),
    });
  } catch (error: any) {
    console.error('[Suraag AI] Gemini API Error:', error);
    // Return a fallback response so the frontend still functions gracefully
    return res.status(500).json({
      role: 'model',
      text: `**ERROR**: AI Reasoning Core offline or unreachable. Please check API key configuration.\n\nDetails: ${error.message}`,
      confidence: 0,
      timestamp: new Date().toISOString()
    });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`[Suraag AI Server] Tactical REST API listening on port ${PORT}`);
  });
}

export default app;
