import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper fallback data if DB is not connected / seeded yet or running in memory mode
let mockCasesFallback: any[] = [
  {
    id: 'case-1',
    caseNumber: 'CASE-2026-884A',
    title: 'Project Genesis Breach & Bio-Asset Theft',
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
    const cases = await prisma.case.findMany({ where, orderBy: { incidentDate: 'desc' } });
    return res.json(cases);
  } catch (err) {
    // Fallback to memory
    return res.json(mockCasesFallback);
  }
});

app.get('/api/cases/:id', async (req: Request, res: Response) => {
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
    return res.json(witnesses);
  } catch (err) {
    return res.json([
      {
        id: 'wit-1',
        witnessName: 'Dr. Julian Vance (Senior Quantum Physicist)',
        role: 'Primary Eyewitness',
        statementDate: '2026-07-16T01:00:00Z',
        statementText: 'I was standing directly by the North Doorway (`Wall B`) at exactly 23:14:00 when I saw two masked individuals enter the vault room and extract the core without triggering alarms.',
        credibilityScore: 42.5,
        aiExtraction: {
          entities: ['North Doorway', 'Wall B', 'Sub-Level 3 Vault', 'Two Masked Individuals'],
          locationClaims: ['Wall B Corridor North'],
          timelineClaims: ['23:14:00 Vault Entry'],
        },
        contradictions: [
          {
            target: 'Physical Geometry & Line-of-Sight Analysis',
            reason: 'CONTRADICTION DETECTED: Based on 3D room reconstruction (`Wall B` occlusion) and line-of-sight cone analysis, a person standing at the North Doorway has 0% visibility of the interior vault lock.',
            severity: 'CRITICAL',
          },
        ],
      },
    ]);
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
    return res.json(events);
  } catch (err) {
    return res.json([
      { timestamp: '23:10:15', title: 'Perimeter Drone Surveillance Detected', category: 'NETWORK', confidence: 91.0, description: 'Unregistered micro-drone RF emissions detected along North perimeter grid.' },
      { timestamp: '23:14:02', title: 'Corridor CCTV Feed Tampering', category: 'CCTV', confidence: 98.5, description: 'Sub-Level 3 Camera #4 experiences sudden frame freezing and loop injection lasting 42 seconds.' },
      { timestamp: '23:15:10', title: 'Acoustic Gunshot Signature (Suppressed)', category: 'AUDIO', confidence: 96.4, description: 'Acoustic sensors register subsonic 9mm discharge in Sub-Level 3 main corridor.' },
    ]);
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
app.post('/api/ai/assistant/chat', (req: Request, res: Response) => {
  const { message, caseId, history } = req.body;
  const promptLower = String(message || '').toLowerCase();

  let responseText = `Based on multi-sensor fusion analysis of case **${caseId || 'CASE-2026-884A'}**, our AI Reasoning Engine indicates ` +
    `that the breach occurred via a coordinated cyber-physical assault at 23:14:02. ` +
    `Would you like to examine the ballistic trajectory simulation or review the contradiction matrix for Dr. Julian Vance?`;

  if (promptLower.includes('contradiction') || promptLower.includes('witness') || promptLower.includes('vance')) {
    responseText = `### Contradiction Analysis: Dr. Julian Vance\n\n` +
      `1. **Statement Claim**: Stated he was standing at the North Doorway (\`Wall B\`) and witnessed two masked operatives open the vault.\n` +
      `2. **Geometric Refutation**: Our Three.js 3D line-of-sight cone reveals that \`Wall B\` and structural server racks block 100% of visual access to the vault lock from that position.\n` +
      `3. **Timeline Refutation**: Corridor thermal sensors registered no human presence near Wall B between 23:10 and 23:18.\n` +
      `4. **AI Conclusion**: High probability of statement fabrication to mask inside credential leakage. Credibility downgraded to **42.5%**.`;
  } else if (promptLower.includes('trajectory') || promptLower.includes('bullet') || promptLower.includes('physics')) {
    responseText = `### Ballistic Trajectory & Physics Simulation\n\n` +
      `- **Origin Vector**: Attacker positioned at coordinates \`[X: -2.4m, Y: 1.7m, Z: 3.1m]\` (Elevated walkway right of Server Rack #4).\n` +
      `- **Impact Vector**: Subsonic 9mm bullet struck Wall B at \`[X: 1.8m, Y: 1.2m, Z: 0.5m]\` with an entry angle of 34.2° downward.\n` +
      `- **Blood Spatter Correlation**: High-velocity forward spatter droplets (Type O+) emanate precisely from the computed victim position, confirming primary impact occurred at 23:15:10.`;
  } else if (promptLower.includes('missing') || promptLower.includes('recommend') || promptLower.includes('search')) {
    responseText = `### AI Missing Evidence Prediction\n\n` +
      `Our graph correlation engine identified three missing critical nodes:\n` +
      `1. **CCTV Camera #4 Raw Buffer**: Re-scan localized sector cache at Grid C-4 (+14.2% confidence boost).\n` +
      `2. **Secondary Weapon Fingerprints**: Check keycard reader inside cleanroom airlock (+8.5% confidence boost).\n` +
      `3. **Vehicle GPS Telemetry**: Request satellite toll transponder logs for Matte Black SUV departing North Route at 23:18:30.`;
  } else if (promptLower.includes('suspect') || promptLower.includes('krell')) {
    responseText = `### Suspect Intelligence: Viktor "Shadow" Krell\n\n` +
      `- **Risk Score**: **96 / 100 (CRITICAL)**\n` +
      `- **Probability of Involvement**: **89.4%**\n` +
      `- **Evidence Links**: Encrypted satellite phone pinged mobile tower #442 within 180 meters of the breach point exactly 12 seconds prior to sensor blackout.\n` +
      `- **Modus Operandi**: Matches exact EMP surge profile and acoustic suppression tactics observed in the 2024 Geneva facility infiltration.`;
  }

  return res.json({
    role: 'model',
    text: responseText,
    timestamp: new Date().toISOString(),
    confidence: 96.8,
  });
});

app.listen(PORT, () => {
  console.log(`[Suraag AI Server] Tactical REST API listening on port ${PORT}`);
});
