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
      model: 'gemini-3.6-flash',
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
    });
  }
});

app.get('/api/evidence/predictions', async (req: Request, res: Response) => {
  return res.json([
    {
      id: 'PRED-REP-01',
      title: 'Forged Veterinary License Registry & Chemical Wholesaler Invoice',
      phase: 'Attempt 1 – Dinner and Deception (April 14)',
      area: 'Sanjivani Medico (Viman Nagar) & State Veterinary Board DB',
      category: 'DIGITAL_LOG',
      boost: '+16.8%',
      confidence: 96.5,
      reason: 'Graph gap analysis reveals Chetany Sharma used a fake license number (#VET-9942) to purchase concentrated Thallium sulphate at 19:00. Cross-referencing chemical wholesaler invoices will identify the secondary distributor.',
      recommendedAction: 'Issue subpoena to State Veterinary Licensing Authority for registry audit and seize pharmacy distributor manifest.',
      recoveryWindowMinutes: 60,
      supportingEvidenceIds: ['EVID-001', 'EVID-004'],
      linkedTimelineEventIds: ['EV-REP-01']
    },
    {
      id: 'PRED-REP-02',
      title: 'Skyline Resort Emergency Stairwell Access Log & Soil Impression',
      phase: 'Attempt 2 – Birthday Resort Knife Attack (May 13)',
      area: 'Skyline Valley Resort Room 304 Exterior Stairwell & Lawn',
      category: 'PHYSICAL_EXHIBIT',
      boost: '+18.4%',
      confidence: 98.1,
      reason: 'While tactical hunting knife EVID-005 was recovered in the corridor, the forced exterior stairwell door lock log and mud footwear impression on the exit threshold remain un-annexed. Recovery will corroborate forced entry at 02:22 AM.',
      recommendedAction: 'Cast dental stone impression of exterior stairwell soil and extract electronic keycard audit file #SK-304.',
      recoveryWindowMinutes: 45,
      supportingEvidenceIds: ['EVID-005', 'EVID-006'],
      linkedTimelineEventIds: ['EV-REP-03', 'EV-REP-04']
    },
    {
      id: 'PRED-REP-03',
      title: 'Hitman Secondary Burner Phone IMEI & Cash Kickback Receipt',
      phase: 'Attempt 3 – Blood on the Streets (June 10)',
      area: 'Apex Tech IT Park Kharadi Perimeter & HDFC Kharadi Branch',
      category: 'FINANCIAL_TRAIL',
      boost: '+22.5%',
      confidence: 99.4,
      reason: 'RTGS transfer EVID-010 accounts for ₹6,000,000, but voice intercept EVID-011 references a ₹500,000 upfront cash deposit. Extracting tower pings for burner IMEI #864902102 will localize the cash drop location.',
      recommendedAction: 'Triangulate cell tower pings for burner handset IMEI #864902102 and retrieve HDFC cash vault serial logs.',
      recoveryWindowMinutes: 30,
      supportingEvidenceIds: ['EVID-010', 'EVID-011'],
      linkedTimelineEventIds: ['EV-REP-05', 'EV-REP-06']
    },
    {
      id: 'PRED-REP-04',
      title: 'Brew & Bean Café Table 4 Paper Scrap & GPS Track',
      phase: 'Final Incident – Ambush Planning Session (June 19)',
      area: 'Brew & Bean Café Table 4 Trash Bin & Audi Q3 Telemetry',
      category: 'DIGITAL_LOG',
      boost: '+19.2%',
      confidence: 97.8,
      reason: 'Order bill EVID-014 confirms June 19 café meeting. Witness Rohan Mehta noted suspects sketched notes on paper napkin scraps. Audi Q3 GPS telemetry will prove precise route taken from café to Lohegaon Hill.',
      recommendedAction: 'Extract Audi Q3 MH-12-FR-0007 onboard ECU telemetry logs and examine café paper scrap for latent handwriting.',
      recoveryWindowMinutes: 90,
      supportingEvidenceIds: ['EVID-014'],
      linkedTimelineEventIds: ['EV-REP-07']
    },
    {
      id: 'PRED-REP-05',
      title: 'Remington Model 700 Rifle Suppressor Thread Micro-Analysis',
      phase: 'Final Incident – Lohegaon Hill Cliff Ambush (June 21)',
      area: 'Lohegaon Hill Boulder Ridge & Sassoon Forensic Mortuary',
      category: 'FORENSIC_SPECIMEN',
      boost: '+24.1%',
      confidence: 99.9,
      reason: 'Autopsy by Dr. Neha Patwardhan recovered 7.62mm bullet core. Microscopic toolmark matching on rifle EVID-016 suppressor threading will prove exact acoustic suppressor attachment used on ridge.',
      recommendedAction: 'Perform scanning electron microscopy (SEM) on Remington 700 barrel threading and match spent casing striations.',
      recoveryWindowMinutes: 120,
      supportingEvidenceIds: ['EVID-016', 'EVID-020'],
      linkedTimelineEventIds: ['EV-REP-08']
    }
app.get('/api/evidence/graph', async (req: Request, res: Response) => {
  return res.json({
    nodes: [
      {
        id: 'DIYA',
        label: 'Diya Gupta (Primary Mastermind)',
        type: 'SUSPECT',
        x: 300,
        y: 220,
        color: '#ff544c',
        details: 'Primary suspect & mastermind. Risk score 99/100. ₹45,000,000 insurance policy beneficiary on victim Keshan. Correlated across all 4 incident phases.',
        phase: 'Mastermind (All Incidents)',
        confidenceScore: 99.2,
        supportingEvidenceIds: ['EVID-001', 'EVID-006', 'EVID-014', 'EVID-017', 'EVID-020'],
        linkedTimelineEventIds: ['EV-REP-01', 'EV-REP-03', 'EV-REP-07', 'EV-REP-08']
      },
      {
        id: 'CHETANY',
        label: 'Chetany Sharma (Executioner)',
        type: 'SUSPECT',
        x: 560,
        y: 220,
        color: '#e53935',
        details: 'Operational executioner & shooter. Risk score 97/100. DNA match on tactical knife EVID-005 and Remington sniper rifle EVID-016.',
        phase: 'Executioner (All Incidents)',
        confidenceScore: 98.5,
        supportingEvidenceIds: ['EVID-004', 'EVID-005', 'EVID-010', 'EVID-011', 'EVID-016'],
        linkedTimelineEventIds: ['EV-REP-02', 'EV-REP-04', 'EV-REP-05', 'EV-REP-08']
      },
      {
        id: 'VIKRAM',
        label: 'Vikram Rathod (Hitman WIT-004)',
        type: 'SUSPECT',
        x: 860,
        y: 220,
        color: '#ff8a80',
        details: 'Hired contract driver. Received ₹6,000,000 RTGS wire from Chetany 15 mins prior to Kharadi pedestrian crossing collision.',
        phase: 'Attempt 3 (Vehicular Hit)',
        confidenceScore: 94.2,
        supportingEvidenceIds: ['EVID-010', 'EVID-011', 'EVID-012', 'EVID-013'],
        linkedTimelineEventIds: ['EV-REP-05', 'EV-REP-06']
      },
      {
        id: 'KESHAN',
        label: 'Keshan Malhotra (Victim)',
        type: 'VICTIM',
        x: 330,
        y: 380,
        color: '#00e676',
        details: 'Deceased victim. Target of 3-month multi-attempt homicide conspiracy. Deceased at Lohegaon Hill Sunset Point via 7.62mm scapular gunshot.',
        phase: 'Victim Target',
        confidenceScore: 100.0,
        supportingEvidenceIds: ['EVID-001', 'EVID-005', 'EVID-016', 'EVID-017'],
        linkedTimelineEventIds: ['EV-REP-01', 'EV-REP-03', 'EV-REP-05', 'EV-REP-08']
      },
      {
        id: 'ARCHITA',
        label: 'Archita Deshmukh (Witness WIT-001)',
        type: 'WITNESS',
        x: 870,
        y: 380,
        color: '#ab8985',
        details: 'Eyewitness at Skyline Resort Room 306. Identified Chetany Sharma fleeing Room 304 and dropping tactical knife EVID-005 at 02:30 AM.',
        phase: 'Attempt 2 Eyewitness',
        confidenceScore: 98.2,
        supportingEvidenceIds: ['EVID-005', 'EVID-006'],
        linkedTimelineEventIds: ['EV-REP-03', 'EV-REP-04']
      },
      {
        id: 'NEHA',
        label: 'Dr. Neha Patwardhan (Autopsy Expert WIT-008)',
        type: 'WITNESS',
        x: 140,
        y: 520,
        color: '#ffb4ac',
        details: 'Senior Forensic Pathologist. Autopsy trajectory confirms 7.62mm scapular gunshot wound inflicted BEFORE 45m cliff fall.',
        phase: 'Final Incident Autopsy',
        confidenceScore: 99.9,
        supportingEvidenceIds: ['EVID-016', 'EVID-020'],
        linkedTimelineEventIds: ['EV-REP-08']
      },
      {
        id: 'EVID-005',
        label: 'Tactical Knife (EVID-005)',
        type: 'EXHIBIT',
        x: 620,
        y: 380,
        color: '#ffab40',
        details: '8-inch serrated tactical hunting knife with blood traces recovered in Corridor 300. Chetany Sharma DNA match 99.999%.',
        phase: 'Attempt 2 Exhibit',
        confidenceScore: 99.5,
        supportingEvidenceIds: ['EVID-005'],
        linkedTimelineEventIds: ['EV-REP-03', 'EV-REP-04']
      },
      {
        id: 'EVID-010',
        label: 'RTGS ₹6.0M Wire (EVID-010)',
        type: 'EXHIBIT',
        x: 740,
        y: 80,
        color: '#ffd700',
        details: 'HDFC Bank RTGS wire transfer receipt of ₹6,000,000 from Chetany Sharma account to Vikram Rathod prior to Kharadi truck collision.',
        phase: 'Attempt 3 Financial Exhibit',
        confidenceScore: 99.4,
        supportingEvidenceIds: ['EVID-010', 'EVID-011'],
        linkedTimelineEventIds: ['EV-REP-05']
      },
      {
        id: 'EVID-016',
        label: 'Remington 700 Rifle (EVID-016)',
        type: 'EXHIBIT',
        x: 380,
        y: 520,
        color: '#e040fb',
        details: 'Suppressed 7.62mm Remington Model 700 sniper rifle recovered on Lohegaon boulder ridge. Ballistics & epithelial DNA match Chetany.',
        phase: 'Final Homicide Weapon',
        confidenceScore: 99.9,
        supportingEvidenceIds: ['EVID-016'],
        linkedTimelineEventIds: ['EV-REP-08']
      },
      {
        id: 'EVID-020',
        label: 'Cellebrite Dump (EVID-020)',
        type: 'EXHIBIT',
        x: 110,
        y: 220,
        color: '#00e5ff',
        details: 'Cellebrite forensic extraction of Diya\'s iPhone 15 Pro. Contains 482 encrypted voice notes detailing hitman payments and ambush plans.',
        phase: 'Digital Forensic Exhibit',
        confidenceScore: 99.8,
        supportingEvidenceIds: ['EVID-020'],
        linkedTimelineEventIds: ['EV-REP-07', 'EV-REP-08']
      },
      {
        id: 'EV-REP-01',
        label: 'Olive Terrace Dinner (EV-REP-01)',
        type: 'TIMELINE_EVENT',
        x: 280,
        y: 80,
        color: '#00bcd4',
        details: 'April 14 dinner at Olive Terrace Restaurant where Keshan suffered initial acute Thallium sulphate poisoning.',
        phase: 'Attempt 1 Timeline Event',
        confidenceScore: 97.5,
        supportingEvidenceIds: ['EVID-001', 'EVID-004'],
        linkedTimelineEventIds: ['EV-REP-01']
      },
      {
        id: 'EV-REP-08',
        label: 'Lohegaon Cliff Homicide (EV-REP-08)',
        type: 'TIMELINE_EVENT',
        x: 650,
        y: 520,
        color: '#ff1744',
        details: 'June 21 fatal cliff ambush at Lohegaon Hill Sunset Point. Suppressed 7.62mm rifle discharge followed by 45m cliff fall.',
        phase: 'Final Homicide Event',
        confidenceScore: 99.95,
        supportingEvidenceIds: ['EVID-016', 'EVID-020'],
        linkedTimelineEventIds: ['EV-REP-08']
      }
    ],
    links: [
      { from: 'DIYA', to: 'CHETANY', label: 'Conspiracy Co-Conspirators (Cellebrite EVID-020)', probabilityScore: 99.8, isCritical: true },
      { from: 'DIYA', to: 'KESHAN', label: 'Fiancee / ₹45M Policy Beneficiary', probabilityScore: 99.2, isCritical: true },
      { from: 'CHETANY', to: 'VIKRAM', label: 'RTGS ₹6.0M Contract Wire (EVID-010)', probabilityScore: 99.4, isCritical: true },
      { from: 'CHETANY', to: 'EVID-005', label: 'Epithelial DNA Match 99.999%', probabilityScore: 99.9, isCritical: true },
      { from: 'CHETANY', to: 'EVID-016', label: 'Sniper Rifle DNA & Ballistic Strike', probabilityScore: 99.9, isCritical: true },
      { from: 'ARCHITA', to: 'CHETANY', label: 'Eyewitness Lineup Flight Identification', probabilityScore: 98.2 },
      { from: 'NEHA', to: 'EVID-016', label: 'Autopsy 7.62mm Scapular Wound Match', probabilityScore: 99.9, isCritical: true },
      { from: 'VIKRAM', to: 'KESHAN', label: 'Kharadi Crossing Pedestrian Hit', probabilityScore: 94.2 },
      { from: 'EVID-020', to: 'DIYA', label: '482 Voice Notes Intercept', probabilityScore: 99.8 },
      { from: 'EV-REP-01', to: 'DIYA', label: 'Olive Terrace Table 4 Payment', probabilityScore: 97.5 },
      { from: 'EV-REP-08', to: 'NEHA', label: 'Autopsy Pathological Verdict', probabilityScore: 99.95 },
      { from: 'EV-REP-08', to: 'EVID-016', label: 'Boulder Ridge Rifle Recovery', probabilityScore: 99.9 }
    ]
  });
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
            target: 'Attempt 1 – Olive Terrace Dinner (April 14)',
            claim: 'Diya claimed Keshan suffered an unexpected organic stomach bug during dinner.',
            reason: 'CONTRADICTION DETECTED: Sanjivani Medico CCTV CAM-01 captured Chetany Sharma purchasing concentrated Thallium poison at 7:00 PM prior to Diya\'s 9:00 PM dinner reservation. Deleted WhatsApp threads confirm pre-dinner coordination.',
            severity: 'CRITICAL',
            evidenceRefuting: ['EVID-001', 'EVID-002', 'EVID-004'],
            timelineEvents: ['EV-REP-01', 'EV-REP-02'],
            occlusionDetails: 'Financial & CCTV Intersection: UPI payment ₹1,450 logged to Chetany; CCTV CAM-01 timestamp 19:00:14.'
          },
          {
            target: 'Attempt 2 – Skyline Valley Resort Knife Attack (May 13)',
            claim: 'Diya claimed she was asleep in Room 304 from midnight to morning and heard no disturbance.',
            reason: 'CONTRADICTION DETECTED: CDR tower audits reveal 18 pre-incident phone calls between Diya and Chetany between 01:00 AM and 02:25 AM right before the knife flight. Eyewitness Archita Deshmukh saw Chetany flee Room 304.',
            severity: 'CRITICAL',
            evidenceRefuting: ['EVID-005', 'EVID-006', 'EVID-020'],
            timelineEvents: ['EV-REP-03', 'EV-REP-04'],
            occlusionDetails: '3D Raycast Intersection: Direct line of sight from Room 306 corridor doorway to Room 304 exit; latent prints on knife EVID-005 match Chetany.'
          },
          {
            target: 'Final Incident – Phoenix Marketcity Shopping Alibi & Selfie Slip (June 19–21)',
            claim: 'Diya claimed she was shopping alone in Phoenix Marketcity on June 19 and that Keshan slipped taking a selfie on June 21.',
            reason: 'CONTRADICTION DETECTED: Café supervisor Rohan Mehta and CCTV CAM-05 confirm Diya & Chetany spent over an hour examining Lohegaon Hill maps on June 19. Autopsy by Dr. Neha Patwardhan confirms a 7.62mm gunshot trajectory through scapula BEFORE cliff fall.',
            severity: 'CRITICAL',
            evidenceRefuting: ['EVID-014', 'EVID-016', 'EVID-020'],
            timelineEvents: ['EV-REP-07', 'EV-REP-08'],
            occlusionDetails: '3D Geometry & Trajectory Refutation: Scapular entry angle 14° downward matches sniper ridge elevation [15m, 8m, -40m]. Accidental selfie slip mathematically impossible.'
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
            target: 'Attempt 2 – Skyline Resort Knife Flight Alibi (May 13)',
            claim: 'Chetany claimed he was at his residence in Viman Nagar all night on May 13 and never possessed a tactical hunting knife.',
            reason: 'CONTRADICTION DETECTED: Latent fingerprints recovered from tactical knife EVID-005 dropped in resort corridor match Chetany with 99.8% certainty; eyewitness Archita Deshmukh identified him fleeing Room 304.',
            severity: 'CRITICAL',
            evidenceRefuting: ['EVID-005', 'EVID-006'],
            timelineEvents: ['EV-REP-04'],
            occlusionDetails: 'Dactyloscopic match card #12 confirms 14 minutiae points on knife hilt.'
          },
          {
            target: 'Attempt 3 – ₹6,000,000 Hired Hit Wire Claim (June 10)',
            claim: 'Chetany claimed the ₹6,000,000 wire to Vikram Rathod was a commercial loan repayment for mobile phone spares inventory.',
            reason: 'CONTRADICTION DETECTED: Hitman Vikram Rathod confessed money was paid for hit-and-run assault; burner voice recordings EVID-011 confirm contract terms.',
            severity: 'CRITICAL',
            evidenceRefuting: ['EVID-010', 'EVID-011'],
            timelineEvents: ['EV-REP-05', 'EV-REP-06'],
            occlusionDetails: 'Financial ledger audit: HDFC RTGS wire sent at 09:15 AM, truck impact occurred at 10:00 AM.'
          },
          {
            target: 'Final Incident – Lohegaon Hill Rifle & Sniper Ambush Denial (June 21)',
            claim: 'Chetany claimed he was at his shop all day on June 21 and has never owned or fired a sniper rifle.',
            reason: 'CONTRADICTION DETECTED: Chetany\'s epithelial DNA recovered on trigger guard of Remington Model 700 sniper rifle EVID-016 on Lohegaon boulder ridge; spent 7.62mm casing ballistically matches the fatal wound.',
            severity: 'CRITICAL',
            evidenceRefuting: ['EVID-016', 'EVID-020'],
            timelineEvents: ['EV-REP-08'],
            occlusionDetails: 'Ballistic acoustic echo vector intersects Chetany\'s hidden position on Lohegaon boulder ridge.'
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
    if (suspects && suspects.length > 0) return res.json(suspects);
  } catch (err) {}

  return res.json([
    {
      id: 'SUS-01',
      caseId: 'CASE-2026-DT01',
      name: 'Diya Gupta',
      alias: 'SUS-01 // Primary Conspirator & Mastermind',
      riskScore: 99,
      probability: 0.992,
      motive: 'Financial Gain / Insurance Fraud – ₹45,000,000 HDFC Life Insurance Policy Beneficiary on Victim Keshan Malhotra.',
      phone: 'iPhone 15 Pro IMEI #354910291 // Audi Q3 GPS MH-12-FR-0007',
      criminalHistory: [
        'Premeditated Multi-Stage Homicide Conspiracy (3-Month Planning)',
        'Insurance Policy Beneficiary Forgery & Financial Concealment',
        'Subornation of Perjury & False 112 Emergency Reporting',
        'Covert Communication via Encrypted Voice Notes (Cellebrite EVID-020)'
      ],
      attemptPhases: [
        'Attempt 1 – Dinner and Deception (Poison Procurement)',
        'Attempt 2 – Birthday Resort Knife Attack (Room 304 Logistics)',
        'Attempt 3 – Blood on the Streets (Hitman Contracting)',
        'Final Incident – Lohegaon Hill Cliff Ambush (Staged Selfie Fall)'
      ],
      telemetryLogs: [
        { time: 'Apr 14 19:30', location: 'Olive Terrace Restaurant Table 4', event: 'Credit Card Payment EVID-001 & Poisoning Window', status: 'VERIFIED' },
        { time: 'May 13 01:15', location: 'Skyline Resort Room 304 Door', event: 'Electronic Keycard Swipe EVID-006', status: 'VERIFIED' },
        { time: 'Jun 19 17:00', location: 'Brew & Bean Café Table 4', event: 'CCTV CAM-05 Capture & Map Session EVID-014', status: 'VERIFIED' },
        { time: 'Jun 21 17:18', location: 'Lohegaon Hill Sunset Point', event: 'Staged 112 Emergency Call & Tower Triangulation', status: 'VERIFIED' }
      ],
      aiReasoning: 'Multi-sensor fusion correlates Diya Gupta to all 4 incident sites. Cellebrite extraction EVID-020 contains 482 encrypted voice notes detailing ₹6.5M hitman payments to Chetany and Vikram. 112 selfie fall claim is fully refuted by scapular bullet entry trajectory.',
      supportingEvidenceIds: ['EVID-001', 'EVID-006', 'EVID-014', 'EVID-017', 'EVID-020'],
      linkedTimelineEventIds: ['EV-REP-01', 'EV-REP-03', 'EV-REP-07', 'EV-REP-08'],
      refutedAlibis: [
        'Claimed she was shopping alone at Phoenix Marketcity mall on June 19 (Refuted by Brew & Bean CCTV CAM-05).',
        'Claimed Keshan slipped on loose gravel taking a selfie (Refuted by Dr. Neha Patwardhan autopsy bullet trajectory EVID-016).'
      ]
    },
    {
      id: 'SUS-02',
      caseId: 'CASE-2026-DT01',
      name: 'Chetany Sharma',
      alias: 'SUS-02 // Operational Executioner & Shooter',
      riskScore: 97,
      probability: 0.985,
      motive: 'Financial Contract Kickback – Received ₹6,500,000 total compensation wired by Diya Gupta across multiple transactions.',
      phone: 'Samsung Galaxy S24 IMEI #864902102 // Burner +91 98220 11092',
      criminalHistory: [
        'Illegal Chemical Acquisition (Thallium sulphate via forged license #VET-9942)',
        'Armed Assault with Tactical Hunting Knife (Skyline Resort May 13)',
        'Contract Hit Procurement & Hitman Coordination (RTGS Wire EVID-010)',
        'Long-Range Precision Rifle Discharge (Remington Model 700 Sniper Ridge June 21)'
      ],
      attemptPhases: [
        'Attempt 1 – Thallium Sulphate Chemical Sourcing',
        'Attempt 2 – Room 304 Corridor Knife Assault',
        'Attempt 3 – Kharadi Crossing Hitman Wire Transfer',
        'Final Incident – Boulder Ridge Sniper Discharge'
      ],
      telemetryLogs: [
        { time: 'Apr 14 19:00', location: 'Sanjivani Medico Pharmacy', event: 'Forged Veterinary License Invoice EVID-004', status: 'VERIFIED' },
        { time: 'May 13 02:30', location: 'Skyline Resort Corridor 300', event: 'Dropped Tactical Knife EVID-005 & Eyewitness WIT-001', status: 'VERIFIED' },
        { time: 'Jun 10 09:45', location: 'HDFC Kharadi Bank Vault', event: 'RTGS ₹6,000,000 Wire Transfer EVID-010 to Vikram', status: 'VERIFIED' },
        { time: 'Jun 21 17:15', location: 'Lohegaon Hill Boulder Ridge', event: 'Suppressed 7.62mm Rifle Discharge EVID-016 & DNA Match', status: 'VERIFIED' }
      ],
      aiReasoning: 'DNA on recovered tactical hunting knife (EVID-005) and Remington sniper rifle (EVID-016) matches Chetany with 99.999% probability. Bank records confirm ₹6.0M RTGS wire transfer to hitman Vikram Rathod 15 minutes before the hit-and-run.',
      supportingEvidenceIds: ['EVID-004', 'EVID-005', 'EVID-010', 'EVID-011', 'EVID-016'],
      linkedTimelineEventIds: ['EV-REP-02', 'EV-REP-04', 'EV-REP-05', 'EV-REP-08'],
      refutedAlibis: [
        'Claimed RTGS wire was a legitimate business loan payment (Refuted by burner voice intercept EVID-011).',
        'Claimed he was out of town on June 21 (Refuted by DNA match on Remington 700 rifle recovered on boulder ridge).'
      ]
    },
    {
      id: 'SUS-03',
      caseId: 'CASE-2026-DT01',
      name: 'Vikram Rathod',
      alias: 'WIT-004 / SUS-03 // Hired Vehicular Operative',
      riskScore: 88,
      probability: 0.942,
      motive: 'Hired Contract Driver – Paid ₹6,000,000 by Chetany Sharma for staged vehicular hit-and-run assault.',
      phone: 'Nokia Feature Burner IMEI #351092004 // Tata 407 MH-12-QX-4412',
      criminalHistory: [
        'Vehicular Hit-and-Run Assault (Apex Tech IT Park Kharadi)',
        'Premeditated Pedestrian Ambush & Steering Vector Manipulation',
        'Illicit Financial Wire Receipt & Commercial Vehicle Tampering'
      ],
      attemptPhases: [
        'Attempt 3 – Blood on the Streets (Apex Tech IT Park Kharadi Collision)'
      ],
      telemetryLogs: [
        { time: 'Jun 10 09:45', location: 'Apex Tech IT Park Perimeter', event: 'RTGS ₹6,000,000 Bank Credit Confirmation', status: 'VERIFIED' },
        { time: 'Jun 10 09:58', location: 'Kharadi Pedestrian Crossing', event: 'Truck Acceleration (62 km/h) & Steering Correction EVID-012', status: 'VERIFIED' },
        { time: 'Jun 10 10:15', location: 'Hadapsar Abandoned Quarry', event: 'Vehicle Abandonment & Burner Handset Disposal', status: 'VERIFIED' }
      ],
      aiReasoning: 'CCTV telemetry of Tata 407 cargo truck proves deliberate steering vector adjustment directly into pedestrian sanctuary zone. Vikram Rathod confessed under interrogation after HDFC wire records linked him to Chetany.',
      supportingEvidenceIds: ['EVID-010', 'EVID-011', 'EVID-012', 'EVID-013'],
      linkedTimelineEventIds: ['EV-REP-05', 'EV-REP-06'],
      refutedAlibis: [
        'Initially claimed an accidental steering gear breakdown (Refuted by mechanical audit EVID-013 proving steering system was 100% operational).'
      ]
    }
  ]);
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
    if (data && (data as any).scenes) return res.json(data);
  } catch (err) {}

  return res.json({
    caseId: req.params.caseId || 'CASE-2026-DT01',
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
        caliber: '7.62mm Suppressed Sniper Discharge',
        ricochetAngle: 12.4,
        kineticEnergyJoules: 2450,
      },
      bloodSpatter: {
        origin: [1.8, 1.2, 0.5],
        dropletCount: 420,
        patternType: 'High-Velocity Scapular Arterial Spatter',
        ellipsoidRatio: 1.42,
      },
    },
    scenes: [
      {
        id: 'STAGE-01',
        stageIndex: 1,
        stageName: 'Attempt 1 – Dinner and Deception',
        locationName: 'Olive Terrace Restaurant (Table 4)',
        timestamp: '2026-04-14 19:30',
        phase: 'Attempt 1 (Poison Procurement & Administration)',
        cameraDefault: { position: [-6, 5, 8], target: [0, 1, 0] },
        characters: [
          { id: 'DIYA', name: 'Diya Gupta', role: 'SUSPECT', position: [-1.2, 0.9, 0.5], color: '#ff544c', activity: 'Administering Thallium sulphate in red wine' },
          { id: 'KESHAN', name: 'Keshan Malhotra', role: 'VICTIM', position: [1.2, 0.9, 0.5], color: '#00e676', activity: 'Consuming poisoned dinner course' },
          { id: 'WAITER', name: 'Restaurant Server', role: 'WITNESS', position: [-3.5, 0.9, -2], color: '#ab8985', activity: 'Serving food at Table 4' }
        ],
        objects: [
          { id: 'WINE_GLASS', label: 'Poisoned Red Wine Glass (EVID-001)', type: 'EVIDENCE', position: [0.2, 0.9, 0.5], details: 'Toxicology confirmed Thallium sulphate residue (0.85 mg/L).', supportingEvidenceId: 'EVID-001' },
          { id: 'INVOICE', label: 'Veterinary License Invoice (EVID-004)', type: 'EVIDENCE', position: [-2.0, 0.9, -1.8], details: 'Forged license #VET-9942 used by Chetany Sharma at Sanjivani Medico.', supportingEvidenceId: 'EVID-004' }
        ],
        overlays: [
          { timestamp: '19:00 PM', title: 'CCTV CAM-01 Chemical Purchase Intercept', type: 'CCTV', details: 'Chetany Sharma recorded purchasing Thallium sulphate using forged license #VET-9942.', evidenceId: 'EVID-004' },
          { timestamp: '19:30 PM', title: 'Card Transaction (EVID-001)', type: 'BANK_TRANSFER', details: 'Diya Gupta credit card payment ₹4,200 at Olive Terrace Table 4.', evidenceId: 'EVID-001' }
        ],
        hasBallistics: false,
        hasVehicleMotion: false,
        linkedEvidenceIds: ['EVID-001', 'EVID-004'],
        linkedTimelineEventId: 'EV-REP-01',
        forensicSummary: 'Attempt 1: Acute Thallium poisoning administered at Olive Terrace Restaurant Table 4.'
      },
      {
        id: 'STAGE-02',
        stageIndex: 2,
        stageName: 'Attempt 2 – Birthday Resort Attack',
        locationName: 'Skyline Resort (Corridor 300 & Room 304)',
        timestamp: '2026-05-13 01:15',
        phase: 'Attempt 2 (Corridor Knife Attack)',
        cameraDefault: { position: [-8, 6, 9], target: [0, 1.2, 0] },
        characters: [
          { id: 'CHETANY', name: 'Chetany Sharma', role: 'SUSPECT', position: [-3.2, 0.9, -1.0], color: '#e53935', activity: 'Fleeing Room 304 corridor with knife' },
          { id: 'KESHAN', name: 'Keshan Malhotra', role: 'VICTIM', position: [2.0, 0.9, 0.5], color: '#00e676', activity: 'Wounded inside Room 304' },
          { id: 'DIYA', name: 'Diya Gupta', role: 'SUSPECT', position: [0.5, 0.9, 1.2], color: '#ff544c', activity: 'Unlocking door & orchestrating entry' },
          { id: 'ARCHITA', name: 'Archita Deshmukh (WIT-001)', role: 'WITNESS', position: [5.5, 0.9, -2.5], color: '#ab8985', activity: 'Observing flee from Room 306 doorway' }
        ],
        objects: [
          { id: 'TACTICAL_KNIFE', label: 'Tactical Hunting Knife (EVID-005)', type: 'WEAPON', position: [-2.2, 0.1, -1.0], details: '8-inch tactical knife dropped in Corridor 300. Epithelial DNA match Chetany 99.999%.', supportingEvidenceId: 'EVID-005' },
          { id: 'KEYCARD_LOCK', label: 'Electronic Keycard Lock (EVID-006)', type: 'EVIDENCE', position: [1.2, 1.4, 0.5], details: 'Audit log confirms keycard swipe by Diya at 01:15:22 AM.', supportingEvidenceId: 'EVID-006' }
        ],
        overlays: [
          { timestamp: '01:15 AM', title: 'Electronic Keycard Audit Log (EVID-006)', type: 'CELL_TOWER', details: 'Diya Gupta scanned keycard to disarm interior deadbolt.', evidenceId: 'EVID-006' },
          { timestamp: '02:30 AM', title: 'Eyewitness Deposition WIT-001', type: 'CCTV', details: 'Archita Deshmukh identified Chetany Sharma dropping tactical knife EVID-005 in corridor.', evidenceId: 'EVID-005' }
        ],
        hasBallistics: false,
        hasVehicleMotion: false,
        linkedEvidenceIds: ['EVID-005', 'EVID-006'],
        linkedTimelineEventId: 'EV-REP-03',
        forensicSummary: 'Attempt 2: Staged knife attack inside Skyline Resort Room 304 disarmed by victim.'
      },
      {
        id: 'STAGE-03',
        stageIndex: 3,
        stageName: 'Attempt 3 – Blood on the Streets',
        locationName: 'Apex Tech IT Park (Kharadi Crossing)',
        timestamp: '2026-06-10 09:58',
        phase: 'Attempt 3 (Vehicular Hit-and-Run)',
        cameraDefault: { position: [-12, 10, 12], target: [0, 1, 0] },
        characters: [
          { id: 'VIKRAM', name: 'Vikram Rathod (Hitman)', role: 'HITMAN', position: [-5.0, 1.8, 0.0], color: '#ff8a80', activity: 'Operating Tata 407 cargo truck' },
          { id: 'KESHAN', name: 'Keshan Malhotra', role: 'VICTIM', position: [3.5, 0.9, 1.5], color: '#00e676', activity: 'Pedestrian crossing pavement' }
        ],
        objects: [
          { id: 'TRUCK', label: 'Tata 407 Cargo Truck (EVID-012)', type: 'VEHICLE', position: [-4.0, 1.2, 0.0], details: 'Commercial truck MH-12-QX-4412 accelerated to 62 km/h into pedestrian zone.', supportingEvidenceId: 'EVID-012' },
          { id: 'RTGS_RECEIPT', label: 'RTGS ₹6.0M Wire Receipt (EVID-010)', type: 'TELEMETRY', position: [-8.0, 0.5, -4.0], details: 'Bank wire of ₹6,000,000 from Chetany to Vikram 15 mins prior.', supportingEvidenceId: 'EVID-010' }
        ],
        overlays: [
          { timestamp: '09:45 AM', title: 'HDFC RTGS Wire Transfer (EVID-010)', type: 'BANK_TRANSFER', details: 'Chetany Sharma transferred ₹6,000,000 to hitman Vikram Rathod.', evidenceId: 'EVID-010' },
          { timestamp: '09:58 AM', title: 'Traffic CCTV Telemetry & Steering Vector', type: 'CCTV', details: 'Deliberate 42° steering correction directly into pedestrian sanctuary zone.', evidenceId: 'EVID-012' }
        ],
        hasBallistics: false,
        hasVehicleMotion: true,
        linkedEvidenceIds: ['EVID-010', 'EVID-011', 'EVID-012', 'EVID-013'],
        linkedTimelineEventId: 'EV-REP-05',
        forensicSummary: 'Attempt 3: Staged vehicular hit-and-run assault by hired hitman Vikram Rathod.'
      },
      {
        id: 'STAGE-04',
        stageIndex: 4,
        stageName: 'Ambush Planning & Reconnaissance',
        locationName: 'Brew & Bean Café (Table 4)',
        timestamp: '2026-06-19 17:00',
        phase: 'Ambush Logistics & Site Reconnaissance',
        cameraDefault: { position: [-5, 4, 7], target: [0, 1, 0] },
        characters: [
          { id: 'DIYA', name: 'Diya Gupta', role: 'SUSPECT', position: [-1.0, 0.9, 0.4], color: '#ff544c', activity: 'Reviewing Lohegaon topographic map' },
          { id: 'CHETANY', name: 'Chetany Sharma', role: 'SUSPECT', position: [1.0, 0.9, 0.4], color: '#e53935', activity: 'Confirming sniper ridge vantage point' },
          { id: 'SUPERVISOR', name: 'Rohan Mehta (WIT-005)', role: 'WITNESS', position: [3.8, 0.9, -2.0], color: '#ab8985', activity: 'Observing Table 4 planning session' }
        ],
        objects: [
          { id: 'CAFE_BILL', label: 'Brew & Bean Order Bill (EVID-014)', type: 'EVIDENCE', position: [0.0, 0.9, 0.4], details: 'Bill #BB-9921 timestamped 17:04 PM. Refutes Diya\'s Phoenix Mall alibi.', supportingEvidenceId: 'EVID-014' }
        ],
        overlays: [
          { timestamp: '17:00 PM', title: 'CCTV CAM-05 Capture & Map Session', type: 'CCTV', details: 'Diya and Chetany recorded studying Lohegaon Sunset Point topographic map at Table 4.', evidenceId: 'EVID-014' },
          { timestamp: '17:30 PM', title: 'Refuted Phoenix Mall Alibi Claim', type: 'VOICE_INTERCEPT', details: 'Diya\'s claim of shopping alone at Phoenix Marketcity refuted by CCTV CAM-05.', evidenceId: 'EVID-014' }
        ],
        hasBallistics: false,
        hasVehicleMotion: false,
        linkedEvidenceIds: ['EVID-014', 'EVID-015'],
        linkedTimelineEventId: 'EV-REP-07',
        forensicSummary: 'Ambush Planning: Co-conspirators finalized Lohegaon Hill cliff ambush logistics at Brew & Bean Café.'
      },
      {
        id: 'STAGE-05',
        stageIndex: 5,
        stageName: 'Final Incident – Lohegaon Hill Homicide',
        locationName: 'Lohegaon Hill Sunset Point & Boulder Ridge',
        timestamp: '2026-06-21 17:15',
        phase: 'Final Incident (Cliff Ambush & Sniper Discharge)',
        cameraDefault: { position: [-14, 12, 14], target: [0, 2, 0] },
        characters: [
          { id: 'CHETANY', name: 'Chetany Sharma (Sniper)', role: 'SUSPECT', position: [-8.5, 3.8, -4.5], color: '#e53935', activity: 'Discharging suppressed Remington 700 rifle from boulder ridge' },
          { id: 'DIYA', name: 'Diya Gupta (Mastermind)', role: 'SUSPECT', position: [1.2, 2.2, 0.8], color: '#ff544c', activity: 'Positioning victim near cliff edge for staged fall' },
          { id: 'KESHAN', name: 'Keshan Malhotra (Victim)', role: 'VICTIM', position: [2.5, 2.0, 1.2], color: '#00e676', activity: 'Struck by 7.62mm bullet & falling 45m' }
        ],
        objects: [
          { id: 'SNIPER_RIFLE', label: 'Remington 700 Sniper Rifle (EVID-016)', type: 'WEAPON', position: [-8.2, 3.5, -4.5], details: 'Suppressed 7.62mm Remington rifle recovered on boulder ridge. DNA & ballistics match Chetany.', supportingEvidenceId: 'EVID-016' },
          { id: 'AUDI_Q3', label: 'Audi Q3 Vehicle (MH-12-FR-0007)', type: 'VEHICLE', position: [-3.0, 2.2, 4.0], details: 'Diya\'s Audi Q3 GPS tracker confirmed arrival at Sunset Point 17:08 PM.', supportingEvidenceId: 'EVID-017' },
          { id: 'CELLEBRITE_DUMP', label: 'Cellebrite Voice Notes (EVID-020)', type: 'EVIDENCE', position: [3.5, 0.5, 3.5], details: '482 encrypted voice notes detailing ₹6.5M hitman payments and staged selfie fall script.', supportingEvidenceId: 'EVID-020' }
        ],
        overlays: [
          { timestamp: '17:15 PM', title: '7.62mm Suppressed Sniper Discharge', type: 'AUTOPSY', details: 'Remington 700 fired from 120m distance. Entry trajectory 34.2° downward through scapula.', evidenceId: 'EVID-016' },
          { timestamp: '17:18 PM', title: 'Staged 112 Emergency Call & Tower Ping', type: 'EMERGENCY_CALL', details: 'Diya reported false selfie slip. Refuted by Dr. Neha Patwardhan autopsy (gunshot prior to fall).', evidenceId: 'EVID-020' }
        ],
        hasBallistics: true,
        hasVehicleMotion: false,
        linkedEvidenceIds: ['EVID-016', 'EVID-017', 'EVID-020'],
        linkedTimelineEventId: 'EV-REP-08',
        forensicSummary: 'Final Homicide: Suppressed 7.62mm sniper rifle discharge at Lohegaon Hill followed by 45m cliff fall.'
      }
    ],
    scenarios: [
      {
        id: 'SCENARIO-A',
        name: 'Premeditated Multi-Attempt Conspiracy & Staged Selfie Fall',
        title: 'Premeditated Multi-Attempt Conspiracy & Staged Selfie Fall',
        probability: 92.4,
        description: 'Diya Gupta (Primary Mastermind) and Chetany Sharma (Co-Conspirator) executed a 3-month multi-attempt conspiracy to eliminate Keshan Malhotra for ₹45,000,000 insurance.',
        evidenceCount: 18,
        category: 'PREMEDITATED_CONSPIRACY',
        supportingEvidenceIds: ['EVID-001', 'EVID-005', 'EVID-010', 'EVID-011', 'EVID-014', 'EVID-016', 'EVID-020'],
        linkedTimelineEventIds: ['EV-REP-01', 'EV-REP-03', 'EV-REP-05', 'EV-REP-07', 'EV-REP-08'],
        forensicVerdict: 'DOMINANT HYPOTHESIS – 100% Corroborated by Ballistics, DNA, Autopsy, and Digital Intercepts.'
      },
      {
        id: 'SCENARIO-B',
        name: 'Isolated Hired Hitman Vehicular Assault Hypothesis',
        title: 'Isolated Hired Hitman Vehicular Assault Hypothesis',
        probability: 5.8,
        description: 'Hypothesis that hitman Vikram Rathod acted as an independent rogue driver without mastermind backing. Fails to explain Thallium poisoning in April or 7.62mm rifle recovery.',
        evidenceCount: 4,
        category: 'HIRED_HITMAN_SOLO',
        supportingEvidenceIds: ['EVID-010', 'EVID-011', 'EVID-012'],
        linkedTimelineEventIds: ['EV-REP-05', 'EV-REP-06'],
        forensicVerdict: 'REJECTED AS SOLE CAUSE – Accounts for Attempt 3 only; fails holistic multi-attempt timeline.'
      },
      {
        id: 'SCENARIO-C',
        name: 'Accidental Cliff Edge Slip & Structural Fall Defense Claim',
        title: 'Accidental Cliff Edge Slip & Structural Fall Defense Claim',
        probability: 1.8,
        description: 'Diya Gupta\'s emergency 112 defense claim that Keshan lost footing taking a selfie. Fully refuted by autopsy confirming 7.62mm scapular bullet wound BEFORE fall.',
        evidenceCount: 1,
        category: 'ACCIDENTAL_FALL',
        supportingEvidenceIds: ['EVID-017'],
        linkedTimelineEventIds: ['EV-REP-08'],
        forensicVerdict: 'REFUTED DEFENSE CLAIM – Contradicted by physical autopsy evidence and ballistic raycasting.'
      }
    ]
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

    const systemInstruction = `You are a highly advanced AI Evidence Analysis model (Suraag Bot) working for Suraag AI, a forensic intelligence platform. You analyze crime scene data, 3D reconstructions, ballistic trajectories, witness statements, and sensor telemetry.
You must politely reply to general greetings like "hello", "hi", etc. But always remember and remind users of your primary identity as an AI Evidence Analysis model for Suraag AI.
Adopt a tactical, analytical, and highly precise tone when discussing cases. Provide structured, concise intelligence briefings when asked questions. Always format with markdown for readability.
Use the following case context to answer questions about the active investigation and seamlessly sync your answers with the added cases data:\n\n${caseContext}`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.6-flash',
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
    return res.status(200).json({
      role: 'model',
      text: `**ERROR**: AI Reasoning Core offline or unreachable.\n\nDetails: ${error.message}`,
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
