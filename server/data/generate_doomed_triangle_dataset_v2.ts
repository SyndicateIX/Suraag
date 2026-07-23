import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GPS Coordinates & Locations near Pune
const LOC = {
  SANJIVANI_MEDICO: { name: "Sanjivani Medico & Pharma, Shop 4, Viman Nagar, Pune", gps: { latitude: 18.5679, longitude: 73.9143 }, elevation: "560m ASL" },
  OLIVE_TERRACE: { name: "The Olive Terrace Restaurant, 2nd Floor, Kalyani Nagar, Pune", gps: { latitude: 18.5463, longitude: 73.9012 }, elevation: "555m ASL" },
  DIYA_RESIDENCE: { name: "Villa 14/B, Silver Oaks Enclave, Kalyani Nagar, Pune", gps: { latitude: 18.5489, longitude: 73.9035 }, elevation: "558m ASL" },
  CHETANY_SHOP: { name: "Sharma Electronics & Mobile Spares, Viman Nagar, Pune", gps: { latitude: 18.5685, longitude: 73.9150 }, elevation: "562m ASL" },
  SKYLINE_RESORT: { name: "Skyline Valley Resort, Mulshi Road, Pune District", gps: { latitude: 18.5012, longitude: 73.5124 }, elevation: "610m ASL" },
  APEX_TECH: { name: "Apex Tech Solutions, E-Space IT Park, Kharadi, Pune", gps: { latitude: 18.5514, longitude: 73.9348 }, elevation: "552m ASL" },
  KHARADI_CROSSWALK: { name: "Pedestrian Crossing outside E-Space IT Park, Kharadi Bypass", gps: { latitude: 18.5518, longitude: 73.9352 }, elevation: "552m ASL" },
  BREW_AND_BEAN: { name: "Brew & Bean Artisan Café, North Main Road, Koregaon Park, Pune", gps: { latitude: 18.5362, longitude: 73.8939 }, elevation: "550m ASL" },
  LOHEGAON_BASE: { name: "Lohegaon Hill Base Parking Area & Trailhead", gps: { latitude: 18.5815, longitude: 73.9178 }, elevation: "580m ASL" },
  LOHEGAON_VIEWPOINT: { name: "Lohegaon Hill Sunset Point Cliff Edge", gps: { latitude: 18.5821, longitude: 73.9184 }, elevation: "640m ASL" },
  LOHEGAON_SNIPER: { name: "Boulder Ridge 40m Northeast of Sunset Point", gps: { latitude: 18.5824, longitude: 73.9189 }, elevation: "648m ASL" },
  YERWADA_POLICE: { name: "Yerwada Police Station, Airport Road, Pune", gps: { latitude: 18.5529, longitude: 73.8796 }, elevation: "554m ASL" },
  RUBY_HALL: { name: "Ruby Hall Clinic Emergency & Trauma Center, Sassoon Road, Pune", gps: { latitude: 18.5314, longitude: 73.8772 }, elevation: "548m ASL" },
  STATE_FSL: { name: "State Forensic Science Laboratory (FSL), Ganeshkhind Road, Pune", gps: { latitude: 18.5342, longitude: 73.8641 }, elevation: "565m ASL" },
  SESSIONS_COURT: { name: "District and Sessions Court, Shivajinagar, Pune", gps: { latitude: 18.5308, longitude: 73.8529 }, elevation: "550m ASL" }
};

// =========================================================
// MODULE 1: CHRONOLOGICAL TIMELINE ENGINE (75 EVENTS)
// =========================================================
function buildModule1TimelineEvents() {
  const events: any[] = [];
  const categories = ["Planning", "Travel", "Execution", "Digital", "Financial", "Forensic", "Medical", "Police_Intervention", "Interrogation", "Laboratory_Analysis"];
  
  const milestones = [
    // Attempt 1: April 14 Poisoning (Dinner & Deception)
    { ts: "2026-04-14T18:30:00Z", dur: "15 min", loc: LOC.CHETANY_SHOP, cat: "Planning", group: "Attempt 1: Dinner & Deception (April 14)", desc: "Chetany Sharma prepares forged veterinary credentials to procure concentrated Thallium poison." },
    { ts: "2026-04-14T19:00:00Z", dur: "10 min", loc: LOC.SANJIVANI_MEDICO, cat: "Financial", group: "Attempt 1: Dinner & Deception (April 14)", desc: "Chetany purchases poison at 7:00 PM from Sanjivani Medico (captured on CCTV CAM-01 and UPI receipt EVID-003)." },
    { ts: "2026-04-14T19:25:00Z", dur: "15 min", loc: LOC.DIYA_RESIDENCE, cat: "Travel", group: "Attempt 1: Dinner & Deception (April 14)", desc: "Chetany hands over the poison dropper vial to Diya Gupta in the Silver Oaks basement garage." },
    { ts: "2026-04-14T20:30:00Z", dur: "5 min", loc: LOC.OLIVE_TERRACE, cat: "Digital", group: "Attempt 1: Dinner & Deception (April 14)", desc: "Diya confirms WhatsApp dinner reservation for 9:00 PM at Olive Terrace Restaurant with Keshan." },
    { ts: "2026-04-14T21:00:00Z", dur: "45 min", loc: LOC.OLIVE_TERRACE, cat: "Planning", group: "Attempt 1: Dinner & Deception (April 14)", desc: "Diya and Keshan arrive at Olive Terrace for dinner at 9:00 PM. Diya intends to poison Keshan's food." },
    { ts: "2026-04-14T21:50:00Z", dur: "20 min", loc: LOC.OLIVE_TERRACE, cat: "Execution", group: "Attempt 1: Dinner & Deception (April 14)", desc: "Diya fails to find an opportunity to slip the poison into Keshan's meal as waiter and Keshan remain seated continuously; Attempt 1 fails." },
    
    // Attempt 2: May 13 Birthday Resort Knife Attack
    { ts: "2026-05-12T20:00:00Z", dur: "30 min", loc: LOC.SKYLINE_RESORT, cat: "Planning", group: "Attempt 2: Birthday Resort Knife Attack (May 13)", desc: "Keshan's birthday celebration begins at Skyline Valley Resort; Diya coordinates secretly with Chetany via encrypted calls." },
    { ts: "2026-05-13T01:30:00Z", dur: "15 min", loc: LOC.SKYLINE_RESORT, cat: "Digital", group: "Attempt 2: Birthday Resort Knife Attack (May 13)", desc: "Extensive call history logged between Diya and Chetany immediately prior to the room intrusion." },
    { ts: "2026-05-13T02:15:00Z", dur: "10 min", loc: LOC.SKYLINE_RESORT, cat: "Execution", group: "Attempt 2: Birthday Resort Knife Attack (May 13)", desc: "Diya waits for Keshan to become intoxicated in resort room #304 before signaling Chetany to enter." },
    { ts: "2026-05-13T02:28:00Z", dur: "5 min", loc: LOC.SKYLINE_RESORT, cat: "Execution", group: "Attempt 2: Birthday Resort Knife Attack (May 13)", desc: "Chetany enters room with a knife to attack Keshan. Keshan stirs unexpectedly, causing Chetany's attack to fail." },
    { ts: "2026-05-13T02:32:00Z", dur: "3 min", loc: LOC.SKYLINE_RESORT, cat: "Forensic", group: "Attempt 2: Birthday Resort Knife Attack (May 13)", desc: "Chetany flees the room, dropping the knife in the corridor. Witness Archita spots fleeing suspect outside room 304." },
    { ts: "2026-05-13T03:00:00Z", dur: "30 min", loc: LOC.SKYLINE_RESORT, cat: "Digital", group: "Attempt 2: Birthday Resort Knife Attack (May 13)", desc: "Resort CCTV and digital cell location records confirm Chetany's presence on resort grounds during the attack window." },
    
    // Attempt 3: June 10 Blood on the Streets (Hit-and-Run)
    { ts: "2026-06-08T18:00:00Z", dur: "45 min", loc: LOC.CHETANY_SHOP, cat: "Financial", group: "Attempt 3: Blood on the Streets (June 10)", desc: "Chetany initiates bank transfers totaling ₹6,000,000 to hired criminals (Vikram Rathod gang) to stage a fatal hit-and-run." },
    { ts: "2026-06-09T21:00:00Z", dur: "15 min", loc: LOC.CHETANY_SHOP, cat: "Digital", group: "Attempt 3: Blood on the Streets (June 10)", desc: "Voice recordings captured on burner phone detailing hit-and-run instructions outside Keshan's office." },
    { ts: "2026-06-10T09:45:00Z", dur: "15 min", loc: LOC.APEX_TECH, cat: "Planning", group: "Attempt 3: Blood on the Streets (June 10)", desc: "Hired cargo truck (Tata 407 MH-12-QX-4412) takes position outside Apex Tech IT Park before 10:00 AM." },
    { ts: "2026-06-10T10:00:00Z", dur: "1 min", loc: LOC.KHARADI_CROSSWALK, cat: "Execution", group: "Attempt 3: Blood on the Streets (June 10)", desc: "At 10:00 AM, the hired vehicle accelerates and strikes Keshan outside his office. Keshan survives with severe injuries." },
    { ts: "2026-06-10T10:15:00Z", dur: "1 hour", loc: LOC.KHARADI_CROSSWALK, cat: "Police_Intervention", group: "Attempt 3: Blood on the Streets (June 10)", desc: "Police recover CCTV footage tracking the hired vehicle. Financial trail of ₹6,000,000 bank transfers uncovered." },
    
    // Attempt 4 / Final Incident: June 19-21 Lohegaon Hill Ambush
    { ts: "2026-06-19T17:00:00Z", dur: "1 hour", loc: LOC.BREW_AND_BEAN, cat: "Planning", group: "Attempt 4: Lohegaon Hill Ambush (June 19-21)", desc: "Diya and Chetany meet at Brew & Bean Café to finalize cliff ambush plan; confirmed by café CCTV and order records." },
    { ts: "2026-06-21T15:30:00Z", dur: "45 min", loc: LOC.LOHEGAON_SNIPER, cat: "Travel", group: "Attempt 4: Lohegaon Hill Ambush (June 19-21)", desc: "Chetany arrives early at Lohegaon Hill with Remington Model 700 rifle and conceals himself on boulder ridge." },
    { ts: "2026-06-21T17:15:00Z", dur: "30 min", loc: LOC.LOHEGAON_VIEWPOINT, cat: "Travel", group: "Attempt 4: Lohegaon Hill Ambush (June 19-21)", desc: "Diya brings Keshan to Lohegaon Hill Sunset Point under guise of taking sunset photos." },
    { ts: "2026-06-21T18:14:05Z", dur: "10 sec", loc: LOC.LOHEGAON_VIEWPOINT, cat: "Execution", group: "Attempt 4: Lohegaon Hill Ambush (June 19-21)", desc: "Chetany fires gunshot hitting Keshan, after which Keshan falls off the cliff onto rocks below." },
    { ts: "2026-06-21T18:16:00Z", dur: "10 min", loc: LOC.LOHEGAON_SNIPER, cat: "Travel", group: "Attempt 4: Lohegaon Hill Ambush (June 19-21)", desc: "Chetany flees through secluded ravine trail. Diya calls 112 helpline reporting an accidental selfie fall." },
    { ts: "2026-06-21T19:00:00Z", dur: "3 hours", loc: LOC.LOHEGAON_VIEWPOINT, cat: "Police_Intervention", group: "Attempt 4: Lohegaon Hill Ambush (June 19-21)", desc: "Detectives and FSL unit secure crime scene, recovering 7.62mm casing and finding gunshot trajectory on body." },
    
    // Post-Incident Investigation & Arrest
    { ts: "2026-06-22T09:00:00Z", dur: "4 hours", loc: LOC.YERWADA_POLICE, cat: "Interrogation", group: "Post-Incident Forensic Recovery & Interrogation", desc: "Interrogations of Diya and Chetany reveal massive contradictions against CCTV, CDR, and bank transfer evidence." },
    { ts: "2026-06-23T14:00:00Z", dur: "5 hours", loc: LOC.STATE_FSL, cat: "Laboratory_Analysis", group: "Post-Incident Forensic Recovery & Interrogation", desc: "FSL ballistics and toxicology link all four attempts into one single coordinated murder conspiracy." },
    { ts: "2026-06-25T11:00:00Z", dur: "2 hours", loc: LOC.SESSIONS_COURT, cat: "Police_Intervention", group: "Post-Incident Forensic Recovery & Interrogation", desc: "Comprehensive chargesheet filed charging Diya Gupta and Chetany Sharma under Sections 302, 120-B, 307 BNS." }
  ];

  for (let i = 0; i < 75; i++) {
    const baseIndex = Math.floor((i / 75) * milestones.length);
    const milestone = milestones[baseIndex];
    const prevId = i === 0 ? null : `EV-${String(i).padStart(3, '0')}`;
    const evId = `EV-${String(i + 1).padStart(3, '0')}`;
    const nextId = i === 74 ? null : `EV-${String(i + 2).padStart(3, '0')}`;
    const parentId = `PARENT-GRP-${milestone.group.split(':')[0].replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    const subStep = i % 2 === 0 ? milestone.desc : `Investigative verification & telemetry log: ${milestone.desc}`;
    const tsOffset = new Date(new Date(milestone.ts).getTime() + (i % 3) * 12 * 60000).toISOString();

    const iconsMap: Record<string, string> = {
      Planning: "FileText", Travel: "Car", Execution: "Crosshair", Digital: "Phone", Financial: "CreditCard",
      Forensic: "Search", Medical: "Activity", Police_Intervention: "Shield", Interrogation: "Mic", Laboratory_Analysis: "Database"
    };
    const colorsMap: Record<string, string> = {
      Planning: "#FFB300", Travel: "#03A9F4", Execution: "#FF544C", Digital: "#9C27B0", Financial: "#4CAF50",
      Forensic: "#00BCD4", Medical: "#E91E63", Police_Intervention: "#3F51B5", Interrogation: "#FF9800", Laboratory_Analysis: "#607D8B"
    };

    events.push({
      event_id: evId,
      previous_event_id: prevId,
      next_event_id: nextId,
      parent_event: parentId,
      event_category: milestone.cat,
      timestamp: tsOffset,
      duration: milestone.dur,
      exact_location: milestone.loc.name,
      gps_coordinates: milestone.loc.gps,
      elevation: milestone.loc.elevation,
      persons_present: [
        "Diya Gupta (SUS-01)", "Chetany Sharma (SUS-02)", "Sub-Inspector Santosh Jadhav (INV-01)", "Archita Deshmukh (WIT-001)"
      ].slice(0, (i % 3) + 1),
      vehicles_present: i % 3 === 0 ? ["Audi Q3 MH-12-FR-0007"] : i % 3 === 1 ? ["Tata 407 Truck MH-12-QX-4412"] : ["Police PCR Van MH-12-PA-101"],
      objects_present: [
        "Recovered Knife Exhibit (EVID-005)", "Poison Dropper Vial (EVID-004)", "Remington Sniper Rifle (EVID-018)", "Bank Transfer Ledger ₹6,000,000 (EVID-011)"
      ].slice(0, (i % 2) + 2),
      evidence_generated: [
        `Digital cell tower ping Tower-${100 + (i % 15)}`,
        `CCTV Frame timestamp capture CAM-0${(i % 5) + 1}`,
        `Forensic exhibit chain of custody log entry #${881 + i}`
      ],
      witnesses: [`WIT-${String((i % 16) + 1).padStart(3, '0')}`],
      digital_footprints: [
        `Encrypted WhatsApp voice note packet burst`,
        `GSM tower triangulated signal -${68 + (i % 20)} dBm`
      ],
      phone_activity: {
        device_id: i % 2 === 0 ? "IMEI-864910059102841" : "IMEI-869102940192843",
        call_status: "CONNECTED_VOICE_NOTE",
        tower_id: `CELL-ID-${4012 + (i % 8)}`,
        duration_seconds: 45 + (i * 12) % 180
      },
      financial_activity: milestone.cat === "Financial" || i % 4 === 0 ? {
        transaction_id: `TXN-6000000-${i}`,
        amount_inr: i % 2 === 0 ? 6000000 : 1450,
        payment_method: i % 2 === 0 ? "BANK_RTGS_WIRE" : "UPI_QR_SCAN",
        bank_reference: `HDFC000${String(i).padStart(6, '0')}`
      } : { transaction_id: "NONE", status: "NO_FINANCIAL_TRANSACTION_RECORDED" },
      ai_summary: `AI Analysis of ${evId}: ${subStep} Convergent digital, financial, and witness evidence corroborates event.`,
      investigation_notes: `Investigator Note (${evId}): Verified physical presence via multi-node triangulation.`,
      linked_evidence_ids: [`EVID-${String((i % 25) + 1).padStart(3, '0')}`, `EVID-${String(((i + 5) % 25) + 1).padStart(3, '0')}`],
      linked_witness_ids: [`WIT-${String((i % 16) + 1).padStart(3, '0')}`],
      linked_suspect_ids: i % 2 === 0 ? ["SUS-01", "SUS-02"] : ["SUS-02"],
      confidence_score: Number((0.94 + (i % 6) * 0.01).toFixed(3)),
      importance_score: Number((7.5 + (i % 25) * 0.1).toFixed(1)),
      timeline_color: colorsMap[milestone.cat] || "#FFFFFF",
      timeline_icon: iconsMap[milestone.cat] || "Activity",
      timeline_group: milestone.group,
      event_dependencies: prevId ? [prevId] : []
    });
  }
  return events;
}

// =========================================================
// MODULE 2: WITNESS STATEMENTS & NLP ENTITY EXTRACTION
// =========================================================
function buildModule3WitnessStatements() {
  const witnessesData = [
    { id: "WIT-001", name: "Archita Deshmukh", role: "Skyline Valley Resort Guest & Key Witness (Attempt 2)", age: 31, occ: "Corporate Executive", phone: "+91 98220 11999", addr: "Koregaon Park, Pune" },
    { id: "WIT-002", name: "Dr. Suresh Kulkarni", role: "Owner & Pharmacist, Sanjivani Medico (Attempt 1)", age: 58, occ: "Licensed Pharmacist", phone: "+91 98220 55432", addr: "Bungalow 9, Viman Nagar, Pune" },
    { id: "WIT-003", name: "Ananya Deshmukh", role: "Restaurant Manager, The Olive Terrace (Attempt 1)", age: 34, occ: "Hospitality Manager", phone: "+91 98220 11234", addr: "Apt 4B, Koregaon Park, Pune" },
    { id: "WIT-004", name: "Vikram Rathod", role: "Hired Hitman / Truck Driver (Attempt 3)", age: 39, occ: "Heavy Vehicle Driver", phone: "+91 98220 77651", addr: "Chawl #12, Yerwada, Pune" },
    { id: "WIT-005", name: "Rohan Mehta", role: "Senior Waiter, Brew & Bean Artisan Café (June 19 Meeting)", age: 26, occ: "Café Supervisor", phone: "+91 98220 44112", addr: "Koregaon Park, Pune" },
    { id: "WIT-006", name: "Deepak Gokhale", role: "Forest Watcher & Trekking Guide, Lohegaon Hill (Final Incident)", age: 41, occ: "Forest Watcher", phone: "+91 98220 12389", addr: "Hill Base Outpost, Pune" },
    { id: "WIT-007", name: "Sub-Inspector Santosh Jadhav", role: "Lead Investigator, Yerwada Police Station", age: 48, occ: "Police Officer", phone: "+91 98220 00100", addr: "Yerwada Quarters, Pune" },
    { id: "WIT-008", name: "Dr. Neha Patwardhan", role: "Senior Forensic Pathologist, State FSL Pune", age: 45, occ: "Forensic Pathologist", phone: "+91 98220 00200", addr: "Ganeshkhind Colony, Pune" },
    { id: "WIT-009", name: "Pooja Malhotra", role: "Sister of Victim Keshan Malhotra", age: 29, occ: "Software Architect", phone: "+91 98220 99881", addr: "Prabhat Road, Pune" },
    { id: "WIT-010", name: "Subhash Sawant", role: "Forensic Ballistics Examiner, State FSL", age: 50, occ: "Ballistics Specialist", phone: "+91 98220 45678", addr: "Shivajinagar, Pune" },
    { id: "WIT-011", name: "Rahul Sharma", role: "Shop Assistant at Sharma Electronics", age: 23, occ: "Sales Executive", phone: "+91 98220 44321", addr: "Lohegaon Village, Pune" },
    { id: "WIT-012", name: "Kunal Shirodkar", role: "Security Officer, Apex Tech IT Park Kharadi (Attempt 3)", age: 36, occ: "Corporate Security", phone: "+91 98220 54321", addr: "Kharadi Bypass, Pune" },
    { id: "WIT-013", name: "Rajesh Singhania", role: "Senior Forensic Financial Auditor, HDFC Bank", age: 47, occ: "Banking Auditor", phone: "+91 98220 88776", addr: "FC Road, Pune" },
    { id: "WIT-014", name: "Nandini Iyer", role: "Confidante of Diya Gupta", age: 27, occ: "Fashion Designer", phone: "+91 98220 87654", addr: "Boat Club Road, Pune" },
    { id: "WIT-015", name: "Arvind Kadam", role: "Paramedic & Ambulance Driver, Ruby Hall Clinic", age: 38, occ: "Paramedic", phone: "+91 98220 34567", addr: "Camp Area, Pune" },
    { id: "WIT-016", name: "Meera Gupta", role: "Mother of Suspect Diya Gupta", age: 55, occ: "Business Director", phone: "+91 98220 22110", addr: "Kalyani Nagar, Pune" }
  ];

  return witnessesData.map((w, idx) => {
    let specificStatement = "";
    if (w.id === "WIT-001") {
      specificStatement = "I was staying in Room 306 at Skyline Valley Resort on May 13 during Keshan Malhotra's birthday party. At around 2:30 AM, I stepped into the corridor to fetch bottled water and saw a man in a dark hoodie fleeing from Room 304 in panic. He accidentally dropped a tactical knife on the carpet and ran toward the emergency stairwell. I later identified him in the police lineup as Chetany Sharma. Resort CCTV confirms his presence.";
    } else if (w.id === "WIT-004") {
      specificStatement = "I am Vikram Rathod. I was hired by Chetany Sharma to stage the hit-and-run outside Keshan's office at 10:00 AM on June 10 using Tata 407 truck MH-12-QX-4412. Chetany promised and wired ₹6,000,000 across multiple bank transfers. He gave me voice instructions via burner phones. I hit Keshan at the pedestrian crossing as instructed.";
    } else if (w.id === "WIT-005") {
      specificStatement = "I am Rohan Mehta, supervisor at Brew & Bean Café. On June 19 at around 5:00 PM, Diya Gupta and Chetany Sharma sat at Table 4 for over an hour intensely discussing maps on a smartphone. I served them cold brew coffee and preserved the order receipt. CCTV footage from our cafe clearly records their meeting.";
    } else {
      specificStatement = `I am making this formal deposition regarding the four criminal attempts on Keshan Malhotra by Diya Gupta and Chetany Sharma. In my official capacity as ${w.role}, I verified physical exhibits, digital location records, financial transfers of ₹6,000,000, and ballistic gunshot trajectory from Lohegaon Hill. The timeline of events across April 14, May 13, June 10, June 19, and June 21 establishes a calculated, multi-phase conspiracy.`;
    }

    const ner = {
      person: ["Diya Gupta", "Chetany Sharma", "Keshan Malhotra", w.name, "Archita Deshmukh", "Vikram Rathod"],
      location: ["Skyline Valley Resort", "Sanjivani Medico", "Olive Terrace", "Apex Tech Kharadi", "Brew & Bean Café", "Lohegaon Hill"],
      weapon: ["Hunting Knife Exhibit (EVID-005)", "Thallium Poison", "Tata 407 Truck", "Remington Model 700 Rifle"],
      vehicle: ["Audi Q3 MH-12-FR-0007", "Tata 407 Truck MH-12-QX-4412"],
      money: ["₹6,000,000 Bank Transfer", "₹1,450 UPI Purchase"],
      date: ["April 14, 2026", "May 13, 2026", "June 10, 2026", "June 19, 2026", "June 21, 2026"],
      time: ["7:00 PM", "9:00 PM", "2:30 AM", "10:00 AM", "5:00 PM", "6:14 PM"]
    };

    return {
      witness_id: w.id,
      name: w.name,
      role: w.role,
      statement_time: `2026-06-${22 + (idx % 3)}T10:00:00Z`,
      verbatim_statement: specificStatement,
      credibility_score: Number((0.94 + (idx % 5) * 0.01).toFixed(2)),
      complete_profile: {
        witness_id: w.id,
        full_name: w.name,
        age: w.age,
        occupation: w.occ,
        contact_number: w.phone,
        residential_address: w.addr,
        relationship_to_case: w.role,
        background_check_status: "VERIFIED"
      },
      interview_metadata: {
        interviewer: "Sub-Inspector Santosh Jadhav",
        date_time: `2026-06-${22 + (idx % 3)}T10:00:00Z`,
        location: "Yerwada Police Station Interrogation Suite",
        recording_device: "HD Audio/Video Suite",
        duration_minutes: 45,
        language: "English / Marathi"
      },
      nlp_extracted_entities: ner,
      behavior_analysis: {
        eye_contact_ratio: 0.92,
        baseline_deviation: "STABLE_HIGH_CONFIDENCE"
      },
      ai_summary: `AI Witness Evaluation (${w.id}): Statement provides key eyewitness/expert corroboration matching digital logs and physical evidence.`
    };
  });
}

// =========================================================
// MODULE 3: EVIDENCE VAULT INVENTORY (25+ EXHIBITS)
// =========================================================
function buildEvidenceInventory() {
  return [
    // Attempt 1 Exhibits
    {
      id: "EVID-001",
      title: "Pharmacy CCTV Camera CAM-01 (Sanjivani Medico)",
      category: "CCTV",
      attempt: "Attempt 1 – Dinner & Deception (April 14)",
      fileUrl: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80",
      fileType: "video/mp4",
      confidence: 98.5,
      processedStatus: "COMPLETED",
      description: "CCTV footage recorded at 7:00 PM on April 14 showing Chetany Sharma purchasing poison at Sanjivani Medico."
    },
    {
      id: "EVID-002",
      title: "WhatsApp Dinner Reservation Timestamp (Olive Terrace)",
      category: "DOCUMENT",
      attempt: "Attempt 1 – Dinner & Deception (April 14)",
      fileUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
      fileType: "image/jpeg",
      confidence: 99.1,
      processedStatus: "COMPLETED",
      description: "WhatsApp chat export confirming Diya invited Keshan to dinner at 9:00 PM on April 14."
    },
    {
      id: "EVID-003",
      title: "Sanjivani Medico UPI Digital Receipt (₹1,450)",
      category: "DOCUMENT",
      attempt: "Attempt 1 – Dinner & Deception (April 14)",
      fileUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
      fileType: "image/jpeg",
      confidence: 99.5,
      processedStatus: "COMPLETED",
      description: "Digital ledger confirming Chetany's UPI transfer to Sanjivani Medico at 7:02 PM on April 14."
    },
    {
      id: "EVID-004",
      title: "Recovered Unused Dropper Vial (Thallium Solution)",
      category: "DOCUMENT",
      attempt: "Attempt 1 – Dinner & Deception (April 14)",
      fileUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
      fileType: "image/jpeg",
      confidence: 97.8,
      processedStatus: "COMPLETED",
      description: "Poison vial recovered from Audi Q3 glovebox after Diya failed to find opportunity during 9:00 PM dinner."
    },

    // Attempt 2 Exhibits
    {
      id: "EVID-005",
      title: "Tactical Hunting Knife (Recovered Corridor Exhibit)",
      category: "WEAPON",
      attempt: "Attempt 2 – Birthday Resort (May 13)",
      fileUrl: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=800&q=80",
      fileType: "image/jpeg",
      confidence: 99.8,
      processedStatus: "COMPLETED",
      description: "Tactical knife dropped by Chetany while fleeing Room 304 at Skyline Valley Resort after failed attack. Latent prints recovered."
    },
    {
      id: "EVID-006",
      title: "Resort Deposition Statement - Archita Deshmukh",
      category: "DOCUMENT",
      attempt: "Attempt 2 – Birthday Resort (May 13)",
      fileUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
      fileType: "application/pdf",
      confidence: 96.5,
      processedStatus: "COMPLETED",
      description: "Witness testimony from Archita Deshmukh who saw Chetany fleeing Keshan's room corridor dropping the knife at 2:30 AM."
    },
    {
      id: "EVID-007",
      title: "Skyline Valley Resort CCTV Feed CAM-04",
      category: "CCTV",
      attempt: "Attempt 2 – Birthday Resort (May 13)",
      fileUrl: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80",
      fileType: "video/mp4",
      confidence: 98.9,
      processedStatus: "COMPLETED",
      description: "Resort CCTV footage showing Chetany entering resort perimeter and fleeing room 304 after Keshan stirred."
    },
    {
      id: "EVID-008",
      title: "Resort Cell Tower & GPS Location Logs",
      category: "PHONE",
      attempt: "Attempt 2 – Birthday Resort (May 13)",
      fileUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
      fileType: "application/json",
      confidence: 99.2,
      processedStatus: "COMPLETED",
      description: "GSM tower pings placing Chetany's phone at Skyline Valley Resort during the 1:30 AM - 3:00 AM window."
    },
    {
      id: "EVID-009",
      title: "Pre-Incident CDR Call Logs (Diya & Chetany)",
      category: "PHONE",
      attempt: "Attempt 2 – Birthday Resort (May 13)",
      fileUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
      fileType: "application/json",
      confidence: 99.9,
      processedStatus: "COMPLETED",
      description: "Call records proving 18 secret phone calls between Diya and Chetany immediately before Chetany's room intrusion."
    },

    // Attempt 3 Exhibits
    {
      id: "EVID-010",
      title: "HDFC Bank Wire Transfer Records (₹6,000,000)",
      category: "DOCUMENT",
      attempt: "Attempt 3 – Blood on the Streets (June 10)",
      fileUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
      fileType: "application/pdf",
      confidence: 100.0,
      processedStatus: "COMPLETED",
      description: "Bank transfer trail proving ₹6,000,000 (6 million INR) paid by suspects to hired criminal gang for staging hit-and-run."
    },
    {
      id: "EVID-011",
      title: "Burner Phone Encrypted Voice Recordings",
      category: "PHONE",
      attempt: "Attempt 3 – Blood on the Streets (June 10)",
      fileUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
      fileType: "audio/wav",
      confidence: 99.4,
      processedStatus: "COMPLETED",
      description: "Recovered voice recordings between Chetany and hitman Vikram Rathod planning the 10:00 AM office hit-and-run."
    },
    {
      id: "EVID-012",
      title: "Kharadi Bypass Traffic CCTV Tracking (Tata 407)",
      category: "CCTV",
      attempt: "Attempt 3 – Blood on the Streets (June 10)",
      fileUrl: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80",
      fileType: "video/mp4",
      confidence: 98.7,
      processedStatus: "COMPLETED",
      description: "CCTV tracking cargo truck MH-12-QX-4412 accelerating into Keshan outside Apex Tech IT Park at 10:00 AM."
    },
    {
      id: "EVID-013",
      title: "Impounded Tata 407 Cargo Truck (MH-12-QX-4412)",
      category: "VEHICLE",
      attempt: "Attempt 3 – Blood on the Streets (June 10)",
      fileUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80",
      fileType: "image/jpeg",
      confidence: 99.6,
      processedStatus: "COMPLETED",
      description: "Impounded truck used in staged hit-and-run. Front bumper paint transfer matches Keshan's suit fibers."
    },

    // Attempt 4 / Final Incident Exhibits
    {
      id: "EVID-014",
      title: "Brew & Bean Café CCTV Footage (June 19)",
      category: "CCTV",
      attempt: "Final Incident – Lohegaon Hill (June 19-21)",
      fileUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
      fileType: "video/mp4",
      confidence: 99.0,
      processedStatus: "COMPLETED",
      description: "Café CCTV footage from June 19 recording Diya and Chetany meeting at Table 4 to finalize cliff ambush plan."
    },
    {
      id: "EVID-015",
      title: "Brew & Bean Order Bill & Digital Payment (June 19)",
      category: "DOCUMENT",
      attempt: "Final Incident – Lohegaon Hill (June 19-21)",
      fileUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
      fileType: "image/jpeg",
      confidence: 99.3,
      processedStatus: "COMPLETED",
      description: "Café order bill confirming table seating time and item order during June 19 conspiracy finalization."
    },
    {
      id: "EVID-016",
      title: "Remington Model 700 Sniper Rifle (EVID-018)",
      category: "WEAPON",
      attempt: "Final Incident – Lohegaon Hill (June 19-21)",
      fileUrl: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=800&q=80",
      fileType: "image/jpeg",
      confidence: 99.9,
      processedStatus: "COMPLETED",
      description: "Sniper rifle retrieved from ravine. Firing pin marks match spent casing; bolt assembly bears Chetany's thumbprint."
    },
    {
      id: "EVID-017",
      title: "Spent 7.62x51mm Remington Shell Casing",
      category: "BALLISTICS",
      attempt: "Final Incident – Lohegaon Hill (June 19-21)",
      fileUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
      fileType: "image/jpeg",
      confidence: 99.95,
      processedStatus: "COMPLETED",
      description: "Spent brass casing recovered 40m northeast on boulder ridge hide at Lohegaon Hill."
    },
    {
      id: "EVID-018",
      title: "Autopsy & Ballistic Trajectory Report (Dr. Patwardhan)",
      category: "DOCUMENT",
      attempt: "Final Incident – Lohegaon Hill (June 19-21)",
      fileUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
      fileType: "application/pdf",
      confidence: 99.8,
      processedStatus: "COMPLETED",
      description: "Autopsy proving 7.62mm gunshot entry/exit wound preceded the fall from the 45m cliff, refuting selfie fall story."
    },
    {
      id: "EVID-019",
      title: "112 Helpline Emergency Call Audio (Diya Gupta)",
      category: "PHONE",
      attempt: "Final Incident – Lohegaon Hill (June 19-21)",
      fileUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
      fileType: "audio/wav",
      confidence: 99.0,
      processedStatus: "COMPLETED",
      description: "Recorded distress call where Diya falsely claimed Keshan accidentally slipped while taking a selfie."
    },
    {
      id: "EVID-020",
      title: "Cellebrite Cloud Dump - 482 Deleted WhatsApp Voice Notes",
      category: "PHONE",
      attempt: "Final Incident – Lohegaon Hill (June 19-21)",
      fileUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
      fileType: "application/json",
      confidence: 100.0,
      processedStatus: "COMPLETED",
      description: "Decrypted iCloud backup containing 482 voice notes between Diya and Chetany detailing all four murder attempts."
    }
  ];
}

// =========================================================
// MODULE 4: CONTRADICTION MATRIX & REFUTATION LOG
// =========================================================
function buildModule4Contradictions() {
  const suspectClaims = [
    { who: "Diya Gupta (SUS-01)", claim: "I invited Keshan to dinner at 9:00 PM on April 14 purely to celebrate our upcoming engagement; I never knew Chetany purchased poison at 7:00 PM.", refEVID: ["EVID-001", "EVID-002", "EVID-003", "EVID-004"], refEV: ["EV-002", "EV-005"], refWIT: ["WIT-002", "WIT-003"] },
    { who: "Diya Gupta (SUS-01)", claim: "During Keshan's birthday at Skyline Resort on May 13, no one entered our room with a knife; Keshan slept peacefully all night.", refEVID: ["EVID-005", "EVID-006", "EVID-007", "EVID-008", "EVID-009"], refEV: ["EV-009", "EV-011"], refWIT: ["WIT-001"] },
    { who: "Diya Gupta (SUS-01)", claim: "The 10:00 AM accident outside Keshan's office on June 10 was a random hit-and-run by an unknown driver; we had no involvement or bank transactions.", refEVID: ["EVID-010", "EVID-011", "EVID-012", "EVID-013"], refEV: ["EV-013", "EV-016"], refWIT: ["WIT-004", "WIT-012", "WIT-013"] },
    { who: "Diya Gupta (SUS-01)", claim: "On June 21 at Lohegaon Hill, Keshan slipped accidentally while taking a sunset selfie. I never met Chetany at a café on June 19.", refEVID: ["EVID-014", "EVID-015", "EVID-016", "EVID-017", "EVID-018", "EVID-020"], refEV: ["EV-019", "EV-022"], refWIT: ["WIT-005", "WIT-006", "WIT-008", "WIT-010"] },
    { who: "Chetany Sharma (SUS-02)", claim: "I have never been to Skyline Valley Resort or possessed any knife. I was in Viman Nagar on May 13.", refEVID: ["EVID-005", "EVID-006", "EVID-007", "EVID-008"], refEV: ["EV-009", "EV-011"], refWIT: ["WIT-001"] },
    { who: "Chetany Sharma (SUS-02)", claim: "I never wired ₹6,000,000 to anyone or talked to truck driver Vikram Rathod.", refEVID: ["EVID-010", "EVID-011", "EVID-013"], refEV: ["EV-013", "EV-015"], refWIT: ["WIT-004", "WIT-013"] }
  ];

  const contradictions: any[] = [];
  const refutations: any[] = [];

  for (let i = 0; i < 30; i++) {
    const base = suspectClaims[i % suspectClaims.length];
    const cId = `CONTRA-${String(i + 1).padStart(3, '0')}`;
    const rId = `REF-${String(i + 1).padStart(3, '0')}`;

    contradictions.push({
      contradiction_id: cId,
      statement: `${base.claim} [Interrogation Re-assertion #${i + 1}]`,
      who_said_it: base.who,
      when: `2026-06-${22 + (i % 3)}T11:30:00Z`,
      evidence_refuting: base.refEVID,
      timeline_events: base.refEV,
      witnesses: base.refWIT,
      ai_reasoning: `AI Refutation Engine: Claim is contradicted by 100% convergent forensic evidence, witness testimony, and digital/financial trail.`,
      bayesian_truth_probability: 0.0001,
      confidence: 0.999,
      severity: "CRITICAL",
      status: "PROVEN_FALSE_IN_REFUTATION_LOG"
    });

    refutations.push({
      refutation_id: rId,
      contradiction_id: cId,
      evidence_chain: base.refEVID.map(e => `Refuting Exhibit: ${e}`),
      investigator_notes: `Confronted suspect with exhibits; suspect failed to explain digital/physical contradictions.`,
      court_admissibility: "ADMISSIBLE_UNDER_BSA_SECTION_63"
    });
  }

  return {
    contradictions,
    refutation_logs: refutations,
    truth_matrix: [
      { dimension: "Attempt 1 (April 14)", suspect_claim: "Normal dinner celebration", absolute_truth: "Chetany bought poison at 7:00 PM; Diya hosted dinner at 9:00 PM intending to poison Keshan (failed due to lack of opportunity)", status: "REFUTED" },
      { dimension: "Attempt 2 (May 13)", suspect_claim: "Keshan slept peacefully at resort", absolute_truth: "Chetany attempted knife attack in room 304 after Keshan became intoxicated; fled leaving knife (witnessed by Archita)", status: "REFUTED" },
      { dimension: "Attempt 3 (June 10)", suspect_claim: "Unrelated hit-and-run", absolute_truth: "Staged hit-and-run outside office at 10:00 AM backed by ₹6,000,000 bank transfers to hitman Vikram Rathod", status: "REFUTED" },
      { dimension: "Final Incident (June 19-21)", suspect_claim: "Accidental selfie fall", absolute_truth: "June 19 café plan finalization (CCTV/bills); June 21 sniper gunshot at Lohegaon Hill followed by cliff fall", status: "REFUTED" }
    ],
    lie_probability_matrix: {
      "Diya Gupta (SUS-01)": { overall_deception_probability: 0.998, credibility_index: 0.002, status: "SYSTEMIC_CHRONIC_DECEPTION" },
      "Chetany Sharma (SUS-02)": { overall_deception_probability: 0.999, credibility_index: 0.001, status: "SYSTEMIC_CHRONIC_DECEPTION" }
    },
    investigation_dashboard: {
      total_events: 75,
      total_witnesses: 16,
      total_contradictions: 30,
      overall_case_confidence: "99.984%",
      chain_of_custody_integrity: "100%",
      prosecutorial_readiness: "READY_FOR_SESSIONS_COURT_TRIAL",
      primary_statutes_violated: [
        "Section 302 BNS (Murder - Death Penalty / Life Imprisonment)",
        "Section 120-B BNS (Criminal Conspiracy)",
        "Section 307 BNS (Attempt to Murder - 3 counts)",
        "Section 201 BNS (Causing Disappearance of Evidence)"
      ]
    },
    executive_ai_summary: `The multi-module investigation into 'The Doomed Triangle' (CASE-2026-DT01) proves with absolute forensic certainty that suspects Diya Gupta and Chetany Sharma conspired across four distinct attempts to murder Keshan Malhotra. From the April 14 poison purchase and 9:00 PM dinner, the May 13 Birthday Resort knife attack witnessed by Archita, the June 10 10:00 AM hit-and-run funded by ₹6,000,000 bank transfers, to the June 19 café meeting and June 21 Lohegaon Hill gunshot and cliff precipitation, every attempt generated mounting digital, financial, physical, and testimonial evidence exposing the conspiracy.`
  };
}

// =========================================================
// MAIN GENERATOR EXPORT
// =========================================================
async function runExhaustiveGenerator() {
  console.log("Generating Module 1: Chronological Timeline Engine...");
  const module1 = buildModule1TimelineEvents();

  console.log("Generating Module 2: Witness Statements & NLP (16 Witnesses, including Archita)...");
  const module3 = buildModule3WitnessStatements();

  console.log("Generating Module 3: Evidence Vault (20 Exhibits)...");
  const evidenceList = buildEvidenceInventory();

  console.log("Generating Module 4: Contradiction Matrix & Refutation Log...");
  const module4 = buildModule4Contradictions();

  const completeDatabase = {
    case_metadata: {
      case_id: "CASE-2026-DT01",
      case_title: "The Doomed Triangle",
      investigating_agency: "State Crime Branch & Cyber-Physical Forensic Unit, Pune",
      lead_investigators: ["Sub-Inspector Santosh Jadhav", "Dr. Neha Patwardhan (Senior Forensic Pathologist)"],
      status: "SOLVED_CHARGESHEET_FILED",
      generated_at: new Date().toISOString(),
      summary: "Comprehensive multi-module investigation database covering four premeditated murder attempts on Keshan Malhotra by Diya Gupta and Chetany Sharma, culminating in homicide at Lohegaon Hill on June 21, 2026."
    },
    module_1_chronological_timeline_engine: {
      total_events: module1.length,
      events: module1
    },
    module_2_evidence_vault: {
      total_exhibits: evidenceList.length,
      exhibits: evidenceList
    },
    module_3_witness_statements_and_nlp_entity_extraction: {
      total_witnesses: module3.length,
      witnesses: module3
    },
    module_4_contradiction_matrix_and_refutation_log: module4
  };

  const serverPath = path.join(__dirname, 'doomed_triangle_dataset.json');
  const srcPath = path.join(__dirname, '../../src/data/doomed_triangle_dataset.json');

  fs.writeFileSync(serverPath, JSON.stringify(completeDatabase, null, 2), 'utf-8');
  fs.writeFileSync(srcPath, JSON.stringify(completeDatabase, null, 2), 'utf-8');

  console.log(`\nSuccessfully generated Doomed Triangle dataset (${module1.length} events, ${evidenceList.length} evidence items, ${module3.length} witnesses)!`);
}

runExhaustiveGenerator().catch(console.error);
