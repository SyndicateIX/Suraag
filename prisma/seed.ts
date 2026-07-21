import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  await prisma.evidence.deleteMany({});
  await prisma.witnessStatement.deleteMany({});
  await prisma.suspect.deleteMany({});
  await prisma.timelineEvent.deleteMany({});
  await prisma.reconstructionData.deleteMany({});
  await prisma.case.deleteMany({});

  console.log('Seeding 10 Forensic Cases...');
  const casesData = [
    {
      caseNumber: 'CASE-2026-884A',
      title: 'Project Genesis Breach',
      status: 'CRITICAL',
      priority: 'CRITICAL',
      assignedTo: 'Agent Sarah Jenkins (Cyber-Physical Div)',
      location: 'Sector 4, High-Security Research Facility, Zurich',
      incidentDate: new Date('2026-07-15T23:14:00Z'),
      summary: 'Unauthorized physical and cyber infiltration into Sub-Level 3 vault. High-grade classified bio-quantum assets compromised under anomalous sensor blackout conditions.',
      confidenceScore: 94.2,
    },
    {
      caseNumber: 'CASE-2026-712B',
      title: 'Orbital Uplink Sabotage - Station Alpha',
      status: 'ACTIVE',
      priority: 'CRITICAL',
      assignedTo: 'Lead Investigator Marcus Vance',
      location: 'Ground Control Terminal 9, Nevada Array',
      incidentDate: new Date('2026-07-12T04:30:00Z'),
      summary: 'Coordinated EMP surge and manual fiber termination causing 42-minute telemetry blackout during orbital insertion.',
      confidenceScore: 91.8,
    },
    {
      caseNumber: 'CASE-2026-650C',
      title: 'Autonomous Transit Collision & Fugitive Extraction',
      status: 'ACTIVE',
      priority: 'HIGH',
      assignedTo: 'Det. Elena Rostova',
      location: 'Mag-Lev Corridor 14B, New Berlin',
      incidentDate: new Date('2026-07-09T18:45:00Z'),
      summary: 'High-speed mag-lev train intercepted by armed operatives following localized LiDAR spoofing.',
      confidenceScore: 88.5,
    },
    {
      caseNumber: 'CASE-2026-599D',
      title: 'Deep-Water Data Conduit Tap - Baltic Sea',
      status: 'ACTIVE',
      priority: 'HIGH',
      assignedTo: 'Lt. Cmdr. Viktor Thorne',
      location: 'Baltic Sub-surface Node 7',
      incidentDate: new Date('2026-07-04T11:20:00Z'),
      summary: 'Submersible drone recovered near undersea fiber junction with unauthorized optical bypass equipment attached.',
      confidenceScore: 86.4,
    },
    {
      caseNumber: 'CASE-2026-511E',
      title: 'Synthetic Neural Core Heist',
      status: 'CRITICAL',
      priority: 'CRITICAL',
      assignedTo: 'Agent Sarah Jenkins (Cyber-Physical Div)',
      location: 'Anduril Lattice R&D Hub, Austin, TX',
      incidentDate: new Date('2026-06-28T02:15:00Z'),
      summary: 'Prototype neural processor core removed from cleanroom vault. Security guards incapacitated via non-lethal acoustic pulse.',
      confidenceScore: 96.1,
    },
    {
      caseNumber: 'CASE-2026-440F',
      title: 'VIP Convoy Ambush & Acoustic Disruption',
      status: 'ARCHIVED',
      priority: 'HIGH',
      assignedTo: 'Det. James Miller',
      location: 'Highway 101 Overpass, San Francisco',
      incidentDate: new Date('2026-06-19T14:10:00Z'),
      summary: 'Armored diplomatic transport disabled by focused acoustic beam. Ballistic evidence indicates crossfire from two vantage points.',
      confidenceScore: 93.0,
    },
    {
      caseNumber: 'CASE-2026-382G',
      title: 'Quantum Key Distribution Node Compromise',
      status: 'PENDING_AUDIT',
      priority: 'ROUTINE',
      assignedTo: 'Dr. Aris Thorne (Forensic Cryptographer)',
      location: 'QKD Relay Tower 3, Geneva',
      incidentDate: new Date('2026-06-11T09:00:00Z'),
      summary: 'Laser receiver alignment altered by 0.04 degrees accompanied by physical intrusion signatures on the maintenance hatch.',
      confidenceScore: 82.3,
    },
    {
      caseNumber: 'CASE-2026-310H',
      title: 'Biometric Spoofing at Sovereign Vault 1',
      status: 'ACTIVE',
      priority: 'HIGH',
      assignedTo: 'Det. Elena Rostova',
      location: 'Federal Bullion Repository, Frankfurt',
      incidentDate: new Date('2026-06-03T01:40:00Z'),
      summary: 'Retinal and vascular pattern scanners defeated using advanced synthetic polymer overlays recovered in ventilation duct.',
      confidenceScore: 89.7,
    },
    {
      caseNumber: 'CASE-2026-229I',
      title: 'Drone Swarm Perimeter Breach - Defense Compound 4',
      status: 'ARCHIVED',
      priority: 'HIGH',
      assignedTo: 'Lead Investigator Marcus Vance',
      location: 'Northern Testing Proving Grounds, Alaska',
      incidentDate: new Date('2026-05-22T21:15:00Z'),
      summary: 'Swarm of 24 micro-drones penetrated radar curtain using radar-absorbent materials and terrain masking.',
      confidenceScore: 95.4,
    },
    {
      caseNumber: 'CASE-2026-104J',
      title: 'Classified Drone Telemetry Exfiltration',
      status: 'PENDING_AUDIT',
      priority: 'ROUTINE',
      assignedTo: 'Agent Sarah Jenkins (Cyber-Physical Div)',
      location: 'Palantir Defense Annex, Washington D.C.',
      incidentDate: new Date('2026-05-10T16:20:00Z'),
      summary: 'Encrypted telemetry stream diverted to offshore IP address via rogue hardware bridge concealed inside server rack patch panel.',
      confidenceScore: 90.1,
    },
  ];

  const createdCases = [];
  for (const c of casesData) {
    const created = await prisma.case.create({ data: c });
    createdCases.push(created);
  }

  const primaryCase = createdCases[0]; // CASE-2026-884A

  console.log('Seeding 50 Evidence Items across cases...');
  const evidenceCategories = ['WEAPON', 'BLOOD', 'FOOTPRINT', 'VEHICLE', 'PHONE', 'FINGERPRINT', 'BALLISTICS', 'CCTV', 'DOCUMENT'];
  const evidenceLabels: Record<string, string[]> = {
    WEAPON: ['Glock 19 Gen 5 9mm Pistol', 'Suppressed MPX Submachine Gun', 'Tactical Combat Knife (Ceramic Blade)', 'Micro-EMP Detonator', 'Acoustic Pulse Projector'],
    BLOOD: ['High-Velocity Blood Spatter (Type O+)', 'Arterial Spatter Pool near Vault Door', 'Transfer Smear on Keypad (Type AB-)', 'Micro-droplet Trail leading North', 'Dried Plasma Residue on Broken Glass'],
    FOOTPRINT: ['Size 11 Tactical Combat Boot (Vibram Sole)', 'Muddy Sneaker Impression (Nike Air Max)', 'Partial Heel Print with Micro-Carbon Dust', 'Two-Stage Stride Pattern (Running)', 'Rubber Tread Pattern near Vent Hatch'],
    VEHICLE: ['Matte Black SUV (License Plate Obscured)', 'Heavy Cargo Van with Thermal Shielding', 'Modified Electric Motorcycle (Silent Drive)', 'Delivery Truck with Cloned Transponder', 'Sedan with Ballistic Glass Damage'],
    PHONE: ['Encrypted Satellite Communicator (Iridium)', 'Burner Smartphone with SIM Swapped', 'Ruggedized Tactical Tablet (Locked)', 'Smartwatch with Heart Rate Spike at 23:14', 'Encrypted Flash Drive concealed in FOB'],
    FINGERPRINT: ['Latent Ridge Print on Server Rack #4', 'Partial Thumbprint on Keycard Reader', 'Glove Fabric Impression on Door Handle', 'Sebum Transfer on Laser Alignment Mirror', 'Multi-finger Smudge on CCTV Lens'],
    BALLISTICS: ['9mm Luger Shell Casing (Lot #4492)', 'Spent 5.56x45mm NATO Brass Casing', 'Deformed Lead Bullet Core (Extracted from Wall B)', 'Subsonic Projectile Fragment', 'Micro-casing from Automated Turret'],
    CCTV: ['Sub-Level 3 Corridor Camera #4 (Tampered at 23:14:02)', 'Exterior Perimeter Thermal Feed (Zone North)', 'Elevator Lobby IR Camera Recording', 'Backup Server Room Drone Footage', 'Overhead Mag-Lev Station Feed'],
    DOCUMENT: ['Handwritten Schematic with Vault Access Timing', 'Forged Security Clearance Badge (Level 5)', 'Encrypted Radio Frequency Log Page', 'Sub-Level 3 Electrical Blueprint with Redlines', 'Intercepted Guard Roster Schedule'],
  };

  const evidenceItems = [];
  let evIndex = 1;
  for (const c of createdCases) {
    // Give each case 5 evidence items
    for (let i = 0; i < 5; i++) {
      const cat = evidenceCategories[(evIndex - 1) % evidenceCategories.length];
      const titles = evidenceLabels[cat];
      const title = titles[i % titles.length] + (i > 0 ? ` (Item #${evIndex})` : '');
      
      const boundingBoxes = [
        {
          x: Math.floor(Math.random() * 400) + 50,
          y: Math.floor(Math.random() * 300) + 50,
          width: Math.floor(Math.random() * 120) + 60,
          height: Math.floor(Math.random() * 120) + 60,
          label: cat === 'WEAPON' ? 'Glock 19 (98.4%)' : cat === 'BLOOD' ? 'Blood Pool Type-O (94.1%)' : cat === 'BALLISTICS' ? '9mm Casing (99.1%)' : `${cat} Detected`,
          confidence: parseFloat((0.88 + Math.random() * 0.11).toFixed(3)),
        }
      ];

      const ev = await prisma.evidence.create({
        data: {
          caseId: c.id,
          title,
          category: cat,
          fileUrl: `https://images.unsplash.com/photo-${1580000000000 + evIndex * 1000}?auto=format&fit=crop&w=800&q=80`,
          fileType: cat === 'CCTV' ? 'video/mp4' : cat === 'AUDIO' || cat === 'PHONE' ? 'audio/wav' : 'image/jpeg',
          confidence: parseFloat((86.0 + Math.random() * 13.5).toFixed(1)),
          boundingBoxes,
          processedStatus: 'COMPLETED',
          metadata: {
            detectedAt: new Date(c.incidentDate.getTime() + evIndex * 60000).toISOString(),
            scannerModel: 'Suraag-CV-DeepNet-v4.2',
            gridCoordinates: `Grid ${String.fromCharCode(65 + (evIndex % 4))}-${(evIndex % 8) + 1}`,
          },
        },
      });
      evidenceItems.push(ev);
      evIndex++;
    }
  }

  console.log('Seeding 20 Witnesses with Statements & Contradiction matrix data...');
  const witnessNames = [
    'Dr. Julian Vance (Senior Quantum Physicist)',
    'Officer David Chen (Patrol Unit 14)',
    'Security Lead Elena Rostova',
    'Tech Specialist Arthur Pendelton',
    'Maintenance Technician Carlos Rivera',
    'Dr. Sophia Martinez (Lead Biologist)',
    'Guard Samuel Briggs (Corridor North)',
    'Courier Hannah Sterling',
    'Network Admin Lucas Wright',
    'Surveillance Operator Chloe Bennett',
    'Dr. Henrik Lindqvist (Visiting Scholar)',
    'Janitor Boris Nikolaev',
    'Security Officer Rachel Green',
    'Systems Engineer Omar Al-Fassi',
    'Executive Assistant Maya Lin',
    'Lead Auditor Thomas Thorne',
    'Logistics Coordinator Ian MacLeod',
    'Technician Fiona Gallagher',
    'Perimeter Guard Kevin Vance',
    'Facility Director Richard Sterling',
  ];

  for (let i = 0; i < 20; i++) {
    const assignedCase = createdCases[i % createdCases.length];
    const name = witnessNames[i];
    const isContradictory = i === 0 || i === 4 || i === 6 || i === 11;

    await prisma.witnessStatement.create({
      data: {
        caseId: assignedCase.id,
        witnessName: name,
        role: i % 3 === 0 ? 'Primary Eyewitness' : i % 3 === 1 ? 'Security Personnel' : 'Facility Staff',
        statementDate: new Date(assignedCase.incidentDate.getTime() + (i + 1) * 3600000),
        statementText: isContradictory
          ? `I was standing directly by the North Doorway (` +
            `Wall B` +
            `) at exactly 23:14:00 when I saw two masked individuals enter the vault room and extract the core without triggering alarms.`
          : `I heard a sharp acoustic pop from Sub-Level 3 at approximately 23:15. When I checked the hallway monitor, the camera feed experienced severe interference and static for roughly 40 seconds.`,
        aiExtraction: {
          entities: ['North Doorway', 'Wall B', 'Sub-Level 3 Vault', 'Two Masked Individuals', 'Acoustic Pop'],
          locationClaims: ['Wall B Corridor North', 'Hallway Monitor Room'],
          timelineClaims: ['23:14:00 Vault Entry', '23:15:10 Acoustic Signature'],
        },
        credibilityScore: isContradictory ? 42.5 : parseFloat((82.0 + Math.random() * 15).toFixed(1)),
        contradictions: isContradictory
          ? [
              {
                target: 'Physical Geometry & Line-of-Sight Analysis',
                reason: 'CONTRADICTION DETECTED: Based on 3D room reconstruction (`Wall B` occlusion) and line-of-sight cone analysis, a person standing at the North Doorway has 0% visibility of the interior vault lock.',
                severity: 'CRITICAL',
              },
              {
                target: 'CCTV & Thermal Timeline at 23:14:02',
                reason: 'Corridor thermal sensors record zero thermal signatures at Wall B until 23:18:45.',
                severity: 'HIGH',
              },
            ]
          : null,
      },
    });
  }

  console.log('Seeding 15 Suspects with Risk Scores & Criminal Intelligence...');
  const suspectNames = [
    { name: 'Viktor "Shadow" Krell', alias: 'V-KRELL', riskScore: 96, probability: 0.89, phone: '+41 79 555 0192', history: ['Armed Infiltration - Geneva 2024', 'Industrial Espionage', 'Biometric Spoofing'] },
    { name: 'Dmitri Volkov', alias: 'GHOST-04', riskScore: 88, probability: 0.78, phone: '+49 170 555 0831', history: ['Subversion of Critical Infrastructure', 'EMP Device Procurement'] },
    { name: 'Elena "Cipher" Thorne', alias: 'CYPHER', riskScore: 91, probability: 0.82, phone: '+1 415 555 0144', history: ['Quantum Network Intrusion', 'Zero-Day Exploit Broker'] },
    { name: 'Marcus "Apex" Kane', alias: 'APEX', riskScore: 84, probability: 0.71, phone: '+44 7700 900077', history: ['Ex-Military Reconnaissance', 'Tactical Firearms Trafficking'] },
    { name: 'Artemis Black', alias: 'RAVEN', riskScore: 79, probability: 0.65, phone: '+33 6 55 50 12 34', history: ['Corporate Defection', 'Classified Blueprint Theft'] },
    { name: 'Sven Lindholm', alias: 'NORD-1', riskScore: 73, probability: 0.58, phone: '+46 70 123 4567', history: ['Subsea Cable Tampering', 'High-Voltage Engineering'] },
    { name: 'Kieran "Drift" O\'Connor', alias: 'DRIFT', riskScore: 68, probability: 0.51, phone: '+353 87 123 4567', history: ['Unauthorized Mag-Lev Boarding', 'Electronic Countermeasures'] },
    { name: 'Mei-Ling Zhou', alias: 'ORCHID', riskScore: 86, probability: 0.76, phone: '+852 9123 4567', history: ['Bio-tech Reverse Engineering', 'Illicit Asset Transfer'] },
    { name: 'Hassan Al-Sayed', alias: 'FALCON', riskScore: 77, probability: 0.63, phone: '+971 50 123 4567', history: ['Satellite Uplink Jamming', 'RF Interception'] },
    { name: 'Niko Bellic', alias: 'SLAVIC', riskScore: 81, probability: 0.69, phone: '+381 64 123 4567', history: ['Tactical Assault', 'Armored Transport Robbery'] },
    { name: 'Chiyo Tanaka', alias: 'KITSUNE', riskScore: 89, probability: 0.81, phone: '+81 90 1234 5678', history: ['AI weights Exfiltration', 'Neural Network Poisoning'] },
    { name: 'Lucas "Glitch" Mercer', alias: 'GLITCH', riskScore: 64, probability: 0.45, phone: '+1 312 555 0199', history: ['CCTV Loop Spoofing', 'Access Card Cloning'] },
    { name: 'Gabriela Santos', alias: 'VIPER', riskScore: 75, probability: 0.61, phone: '+55 11 91234 5678', history: ['Chemical & Bio Vault Bypassing', 'Explosive Ordnance'] },
    { name: 'Jaxon "Stealth" Reed', alias: 'STEALTH', riskScore: 83, probability: 0.73, phone: '+1 202 555 0188', history: ['Perimeter Drone Swarm Piloting', 'IR Camouflage'] },
    { name: 'Zane "Echo" Sterling', alias: 'ECHO', riskScore: 71, probability: 0.55, phone: '+61 400 123 456', history: ['Acoustic Weaponry Assembly', 'Diplomatic Convoy Tracking'] },
  ];

  for (let i = 0; i < 15; i++) {
    const s = suspectNames[i];
    const assignedCase = createdCases[i % createdCases.length];
    await prisma.suspect.create({
      data: {
        caseId: assignedCase.id,
        name: s.name,
        alias: s.alias,
        riskScore: s.riskScore,
        probability: s.probability,
        criminalHistory: s.history,
        phone: s.phone,
        gpsCoordinates: [
          { time: '23:10:00', lat: 47.3769, lng: 8.5417 },
          { time: '23:14:05', lat: 47.3772, lng: 8.5422 },
          { time: '23:18:30', lat: 47.3785, lng: 8.5450 },
        ],
        linkedEvidenceIds: [evidenceItems[i % evidenceItems.length].id, evidenceItems[(i + 1) % evidenceItems.length].id],
        aiReasoning: `Suspect's encrypted satellite phone pinged mobile tower #442 within 180 meters of the breach point exactly 12 seconds prior to the sensor blackout. Ballistic profile matches prior modus operandi from 2024 Geneva operation.`,
      },
    });
  }

  console.log('Seeding Timeline Events for Case 1...');
  const timelineEvents = [
    { timestamp: '23:10:15', title: 'Perimeter Drone Surveillance Detected', category: 'NETWORK', confidence: 91.0, desc: 'Unregistered micro-drone RF emissions detected along North perimeter grid.' },
    { timestamp: '23:14:02', title: 'Corridor CCTV Feed Tampering', category: 'CCTV', confidence: 98.5, desc: 'Sub-Level 3 Camera #4 experiences sudden frame freezing and loop injection lasting 42 seconds.' },
    { timestamp: '23:14:18', title: 'Biometric Keycard Override (Level 5)', category: 'BALLISTICS', confidence: 99.2, desc: 'Dr. Julian Vance credentials used to open primary cleanroom airlock.' },
    { timestamp: '23:15:10', title: 'Acoustic Gunshot Signature (Suppressed)', category: 'AUDIO', confidence: 96.4, desc: 'Acoustic sensors register subsonic 9mm discharge in Sub-Level 3 main corridor.' },
    { timestamp: '23:15:45', title: 'Bio-Asset Containment Breach', category: 'CCTV', confidence: 99.9, desc: 'Cryo-vault pressure drop and unauthorized physical removal of Quantum Bio-Core #3.' },
    { timestamp: '23:18:30', title: 'High-Speed Vehicle Departure', category: 'VEHICLE', confidence: 94.0, desc: 'Matte black SUV departs North service road at 84 km/h with infrared transponder spoofed.' },
  ];

  for (const t of timelineEvents) {
    await prisma.timelineEvent.create({
      data: {
        caseId: primaryCase.id,
        timestamp: t.timestamp,
        title: t.title,
        description: t.desc,
        category: t.category,
        confidence: t.confidence,
        aiReasoning: `Cross-validated via multi-sensor fusion (CCTV frame differential, acoustic triangulation, and physical access badge audit). Confidence exceeds 94% threshold.`,
        supportingEvidenceIds: [evidenceItems[0].id, evidenceItems[1].id],
      },
    });
  }

  console.log('Seeding 3D Reconstruction, Physics & Scenario Data for Case 1...');
  await prisma.reconstructionData.create({
    data: {
      caseId: primaryCase.id,
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
        {
          id: 'SCENARIO-A',
          name: 'Premeditated Insider-Assisted Ambush',
          probability: 78.4,
          description: 'Suspect Viktor Krell utilized compromised credentials from Dr. Vance to enter via airlock, neutralizing security guard with suppressed fire before extracting bio-core.',
          evidenceCount: 18,
        },
        {
          id: 'SCENARIO-B',
          name: 'External Cyber-Kinetic Assault',
          probability: 18.1,
          description: 'Automated drone swarm disabled external sensors while two external operatives forced entry using thermite charges on ventilation duct B.',
          evidenceCount: 6,
        },
        {
          id: 'SCENARIO-C',
          name: 'Accidental Containment Failure & Coverup',
          probability: 3.5,
          description: 'Internal biological containment pressure surge caused equipment failure, with staff fabricating external attack signatures to evade corporate liability.',
          evidenceCount: 2,
        },
      ],
    },
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
