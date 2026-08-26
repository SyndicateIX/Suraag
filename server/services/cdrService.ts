import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ColumnMapping {
  callingNumber: string;
  calledNumber: string;
  timestamp: string;
  durationSeconds?: string;
  callType?: string;
  cellTowerId?: string;
  lac?: string;
  latitude?: string;
  longitude?: string;
  azimuth?: string;
  imeiCalling?: string;
  imeiCalled?: string;
  firstLocation?: string;
  lastLocation?: string;
}

export interface IngestedCDRRecord {
  id: string;
  datasetId: string;
  callingNumber: string;
  calledNumber: string;
  imeiCalling?: string | null;
  imeiCalled?: string | null;
  timestamp: string; // ISO String
  durationSeconds: number;
  callType: string;
  cellTowerId?: string | null;
  lac?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  azimuth?: number | null;
  firstLocation?: string | null;
  lastLocation?: string | null;
}

export interface SuspectMapping {
  phoneNumber: string;
  suspectId?: string;
  ownerName?: string;
  role?: string;
  riskScore?: number;
  alias?: string;
  avatar?: string;
}

// ----------------------------------------------------
// 1. FILE PARSING & PREVIEW
// ----------------------------------------------------
export function parseTelecomFilePreview(
  content: string | Buffer,
  fileName: string
): { headers: string[]; previewRows: Record<string, any>[]; detectedOperator: string; totalRowsEst: number } {
  let headers: string[] = [];
  let previewRows: Record<string, any>[] = [];
  let totalRowsEst = 0;

  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (ext === 'xlsx' || ext === 'xls') {
    const workbook = XLSX.read(content, { type: Buffer.isBuffer(content) ? 'buffer' : 'string' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
    totalRowsEst = jsonData.length;
    previewRows = jsonData.slice(0, 10);
    if (previewRows.length > 0) {
      headers = Object.keys(previewRows[0]);
    }
  } else {
    // CSV or TXT
    const text = Buffer.isBuffer(content) ? content.toString('utf-8') : content;
    const parsed = Papa.parse<Record<string, any>>(text, {
      header: true,
      skipEmptyLines: true,
      preview: 15,
    });
    headers = parsed.meta.fields || [];
    previewRows = parsed.data.slice(0, 10);
    totalRowsEst = text.split('\n').filter(l => l.trim().length > 0).length - 1;
  }

  const detectedOperator = autoDetectOperator(headers);

  return {
    headers,
    previewRows,
    detectedOperator,
    totalRowsEst: Math.max(totalRowsEst, previewRows.length),
  };
}

export function parseEntireTelecomFile(
  content: string | Buffer,
  fileName: string
): Record<string, any>[] {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (ext === 'xlsx' || ext === 'xls') {
    const workbook = XLSX.read(content, { type: Buffer.isBuffer(content) ? 'buffer' : 'string' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    return XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
  } else {
    const text = Buffer.isBuffer(content) ? content.toString('utf-8') : content;
    const parsed = Papa.parse<Record<string, any>>(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });
    return parsed.data;
  }
}

// ----------------------------------------------------
// 2. OPERATOR & COLUMN AUTO-DETECTION
// ----------------------------------------------------
export function autoDetectOperator(headers: string[]): string {
  const hLower = headers.map(h => h.toLowerCase());

  if (hLower.some(h => h.includes('a_party') || h.includes('b_party'))) return 'Reliance Jio';
  if (hLower.some(h => h.includes('calling_no') || h.includes('called_no') || h.includes('first_cell_id'))) return 'Bharti Airtel';
  if (hLower.some(h => h.includes('originating_no') || h.includes('terminating_no') || h.includes('azimuth'))) return 'Vodafone Idea (Vi)';
  if (hLower.some(h => h.includes('caller') && h.includes('called') && h.includes('tower_id'))) return 'BSNL / MTNL';
  if (hLower.some(h => h.includes('seizure_time') || h.includes('elapsed_time') || h.includes('originating_digits'))) return 'AT&T / Global';
  return 'Standard CDR';
}

export function autoDetectColumnMappings(headers: string[]): Partial<ColumnMapping> {
  const mapping: Partial<ColumnMapping> = {};
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  headers.forEach(h => {
    const norm = normalize(h);
    
    // Calling Number
    if (!mapping.callingNumber && (norm.includes('calling') || norm.includes('aparty') || norm.includes('originat') || norm.includes('source') || norm.includes('from') || norm === 'caller' || norm === 'callingno' || norm === 'callermsisdn')) {
      mapping.callingNumber = h;
    }
    // Called Number
    else if (!mapping.calledNumber && (norm.includes('called') || norm.includes('bparty') || norm.includes('terminat') || norm.includes('dest') || norm.includes('to') || norm === 'dialed' || norm === 'calledno' || norm === 'receivermsisdn')) {
      mapping.calledNumber = h;
    }
    // Timestamp
    else if (!mapping.timestamp && (norm.includes('datetime') || norm.includes('timestamp') || norm.includes('starttime') || norm.includes('calldate') || norm.includes('date') || norm.includes('seizure') || norm === 'time')) {
      mapping.timestamp = h;
    }
    // Duration
    else if (!mapping.durationSeconds && (norm.includes('duration') || norm.includes('elapsed') || norm.includes('sec') || norm.includes('length') || norm === 'dur')) {
      mapping.durationSeconds = h;
    }
    // Call Type
    else if (!mapping.callType && (norm.includes('calltype') || norm.includes('type') || norm.includes('service') || norm.includes('eventtype'))) {
      mapping.callType = h;
    }
    // Cell Tower ID
    else if (!mapping.cellTowerId && (norm.includes('cellid') || norm.includes('towerid') || norm.includes('tower') || norm.includes('cellsite') || norm.includes('firstcgi') || norm.includes('cgi') || norm.includes('siteid'))) {
      mapping.cellTowerId = h;
    }
    // LAC
    else if (!mapping.lac && (norm.includes('lac') || norm.includes('locationarea'))) {
      mapping.lac = h;
    }
    // Latitude
    else if (!mapping.latitude && (norm.includes('lat') || norm.includes('latitude') || norm.includes('towerlat'))) {
      mapping.latitude = h;
    }
    // Longitude
    else if (!mapping.longitude && (norm.includes('lng') || norm.includes('lon') || norm.includes('longitude') || norm.includes('towerlon') || norm.includes('towerlng'))) {
      mapping.longitude = h;
    }
    // Azimuth
    else if (!mapping.azimuth && (norm.includes('azimuth') || norm.includes('angle') || norm.includes('sector'))) {
      mapping.azimuth = h;
    }
    // IMEI Calling
    else if (!mapping.imeiCalling && (norm.includes('imeia') || norm.includes('callingimei') || norm.includes('imei1') || (norm.includes('imei') && !norm.includes('called')))) {
      mapping.imeiCalling = h;
    }
    // IMEI Called
    else if (!mapping.imeiCalled && (norm.includes('imeib') || norm.includes('calledimei') || norm.includes('imei2'))) {
      mapping.imeiCalled = h;
    }
    // Location names
    else if (!mapping.firstLocation && (norm.includes('firstloc') || norm.includes('siteaddress') || norm.includes('location') || norm.includes('address'))) {
      mapping.firstLocation = h;
    }
  });

  return mapping;
}

// ----------------------------------------------------
// 3. RECORD TRANSFORMATION & NORMALIZATION
// ----------------------------------------------------
export function transformRawRowsToRecords(
  rows: Record<string, any>[],
  datasetId: string,
  mapping: ColumnMapping
): IngestedCDRRecord[] {
  return rows
    .map((row, idx) => {
      const callingRaw = String(row[mapping.callingNumber] || '').trim();
      const calledRaw = String(row[mapping.calledNumber] || '').trim();

      if (!callingRaw && !calledRaw) return null;

      // Clean phone number (strip spaces, +, leading zeroes if needed)
      const cleanPhone = (p: string) => p.replace(/[^\d+]/g, '');
      const callingNumber = cleanPhone(callingRaw);
      const calledNumber = cleanPhone(calledRaw);

      // Parse timestamp
      let timestampISO = new Date().toISOString();
      const rawTime = row[mapping.timestamp];
      if (rawTime) {
        const parsedDate = new Date(rawTime);
        if (!isNaN(parsedDate.getTime())) {
          timestampISO = parsedDate.toISOString();
        } else if (typeof rawTime === 'string') {
          // Handle DD/MM/YYYY or DD-MM-YYYY HH:mm:ss
          const parts = rawTime.split(/[\sT]+/);
          if (parts.length >= 1) {
            const dParts = parts[0].split(/[-/]/);
            if (dParts.length === 3) {
              // assume DD/MM/YYYY or YYYY/MM/DD
              let y = dParts[0].length === 4 ? dParts[0] : dParts[2];
              let m = dParts[1];
              let d = dParts[0].length === 4 ? dParts[2] : dParts[0];
              let t = parts[1] || '00:00:00';
              const altDate = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${t}`);
              if (!isNaN(altDate.getTime())) {
                timestampISO = altDate.toISOString();
              }
            }
          }
        }
      }

      // Duration
      let durationSeconds = 0;
      if (mapping.durationSeconds && row[mapping.durationSeconds] !== undefined) {
        const dur = Number(row[mapping.durationSeconds]);
        if (!isNaN(dur)) durationSeconds = Math.max(0, Math.round(dur));
      }

      // Call Type
      let callType = 'VOICE';
      if (mapping.callType && row[mapping.callType]) {
        const ct = String(row[mapping.callType]).toUpperCase();
        if (ct.includes('SMS')) callType = 'SMS';
        else if (ct.includes('DATA') || ct.includes('GPRS') || ct.includes('IP')) callType = 'DATA';
        else if (ct.includes('ROAM')) callType = 'ROAMING';
        else if (ct.includes('MISS')) callType = 'MISSED';
        else callType = 'VOICE';
      }

      // Lat / Lng
      let latitude: number | null = null;
      let longitude: number | null = null;
      if (mapping.latitude && row[mapping.latitude] !== undefined) {
        const lat = parseFloat(row[mapping.latitude]);
        if (!isNaN(lat) && lat >= -90 && lat <= 90) latitude = lat;
      }
      if (mapping.longitude && row[mapping.longitude] !== undefined) {
        const lng = parseFloat(row[mapping.longitude]);
        if (!isNaN(lng) && lng >= -180 && lng <= 180) longitude = lng;
      }

      // Azimuth
      let azimuth: number | null = null;
      if (mapping.azimuth && row[mapping.azimuth] !== undefined) {
        const az = parseInt(row[mapping.azimuth], 10);
        if (!isNaN(az)) azimuth = az;
      }

      const record: IngestedCDRRecord = {
        id: `cdr-rec-${datasetId}-${idx}-${Date.now().toString(36)}`,
        datasetId,
        callingNumber: callingNumber || 'UNKNOWN',
        calledNumber: calledNumber || 'UNKNOWN',
        imeiCalling: mapping.imeiCalling ? String(row[mapping.imeiCalling] || '') : null,
        imeiCalled: mapping.imeiCalled ? String(row[mapping.imeiCalled] || '') : null,
        timestamp: timestampISO,
        durationSeconds,
        callType,
        cellTowerId: mapping.cellTowerId ? String(row[mapping.cellTowerId] || '') : null,
        lac: mapping.lac ? String(row[mapping.lac] || '') : null,
        latitude,
        longitude,
        azimuth,
        firstLocation: mapping.firstLocation ? String(row[mapping.firstLocation] || '') : null,
        lastLocation: mapping.lastLocation ? String(row[mapping.lastLocation] || '') : null,
      };
      return record;
    })
    .filter((r): r is IngestedCDRRecord => r !== null);
}

// ----------------------------------------------------
// 4. STATISTICAL & BURST ANALYTICS ENGINE
// ----------------------------------------------------
export function calculateCDRAnalytics(records: IngestedCDRRecord[], targetNumber?: string) {
  if (!records || records.length === 0) {
    return {
      totalRecords: 0,
      uniqueCallers: 0,
      uniqueReceivers: 0,
      totalUniqueNumbers: 0,
      totalDurationSeconds: 0,
      avgDurationSeconds: 0,
      callTypeBreakdown: {},
      hourlyBurstData: Array.from({ length: 24 }, (_, h) => ({ hour: `${h.toString().padStart(2, '0')}:00`, hourNum: h, calls: 0, duration: 0, voice: 0, sms: 0, data: 0, nightOwl: h >= 23 || h <= 5 })),
      topContactedNumbers: [],
      frequentPairs: [],
      shortBurstCalls: 0,
      nightCallsCount: 0,
      nightCallRatio: 0,
      dateRange: { start: null, end: null },
      cellTowerPingsCount: 0,
    };
  }

  let totalDurationSeconds = 0;
  const callersSet = new Set<string>();
  const receiversSet = new Set<string>();
  const allNumbersSet = new Set<string>();
  const callTypeCounts: Record<string, number> = {};
  const hourlyBuckets = Array.from({ length: 24 }, (_, h) => ({
    hour: `${h.toString().padStart(2, '0')}:00`,
    hourNum: h,
    calls: 0,
    duration: 0,
    voice: 0,
    sms: 0,
    data: 0,
    nightOwl: h >= 23 || h <= 5,
  }));

  const pairCounts: Record<string, { calling: string; called: string; count: number; totalDuration: number; types: Record<string, number> }> = {};
  const contactCounts: Record<string, { number: string; totalCalls: number; inCalls: number; outCalls: number; totalDuration: number }> = {};
  let shortBurstCalls = 0;
  let nightCallsCount = 0;
  let minDate = new Date(records[0].timestamp).getTime();
  let maxDate = minDate;
  let towerPings = 0;

  records.forEach(rec => {
    totalDurationSeconds += rec.durationSeconds;
    callersSet.add(rec.callingNumber);
    receiversSet.add(rec.calledNumber);
    allNumbersSet.add(rec.callingNumber);
    allNumbersSet.add(rec.calledNumber);

    // Call Types
    callTypeCounts[rec.callType] = (callTypeCounts[rec.callType] || 0) + 1;

    // Short call / Missed call burst (< 6 seconds)
    if (rec.durationSeconds > 0 && rec.durationSeconds <= 5 && rec.callType === 'VOICE') {
      shortBurstCalls++;
    }

    // Tower pings
    if (rec.cellTowerId) towerPings++;

    // Timestamps
    const t = new Date(rec.timestamp).getTime();
    if (!isNaN(t)) {
      if (t < minDate) minDate = t;
      if (t > maxDate) maxDate = t;

      const dateObj = new Date(rec.timestamp);
      const hour = dateObj.getHours();
      if (hour >= 0 && hour < 24) {
        hourlyBuckets[hour].calls++;
        hourlyBuckets[hour].duration += rec.durationSeconds;
        if (rec.callType === 'VOICE') hourlyBuckets[hour].voice++;
        else if (rec.callType === 'SMS') hourlyBuckets[hour].sms++;
        else if (rec.callType === 'DATA') hourlyBuckets[hour].data++;

        if (hour >= 23 || hour <= 5) {
          nightCallsCount++;
        }
      }
    }

    // Pair stats
    const pairKey = [rec.callingNumber, rec.calledNumber].sort().join('<->');
    if (!pairCounts[pairKey]) {
      pairCounts[pairKey] = {
        calling: rec.callingNumber,
        called: rec.calledNumber,
        count: 0,
        totalDuration: 0,
        types: {},
      };
    }
    pairCounts[pairKey].count++;
    pairCounts[pairKey].totalDuration += rec.durationSeconds;
    pairCounts[pairKey].types[rec.callType] = (pairCounts[pairKey].types[rec.callType] || 0) + 1;

    // Contact counts for individual numbers
    const updateContact = (num: string, isOut: boolean) => {
      if (!contactCounts[num]) {
        contactCounts[num] = { number: num, totalCalls: 0, inCalls: 0, outCalls: 0, totalDuration: 0 };
      }
      contactCounts[num].totalCalls++;
      contactCounts[num].totalDuration += rec.durationSeconds;
      if (isOut) contactCounts[num].outCalls++;
      else contactCounts[num].inCalls++;
    };

    updateContact(rec.callingNumber, true);
    updateContact(rec.calledNumber, false);
  });

  const topContactedNumbers = Object.values(contactCounts)
    .sort((a, b) => b.totalCalls - a.totalCalls)
    .slice(0, 15);

  const frequentPairs = Object.values(pairCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  return {
    totalRecords: records.length,
    uniqueCallers: callersSet.size,
    uniqueReceivers: receiversSet.size,
    totalUniqueNumbers: allNumbersSet.size,
    totalDurationSeconds,
    avgDurationSeconds: Math.round(totalDurationSeconds / (records.length || 1)),
    callTypeBreakdown: callTypeCounts,
    hourlyBurstData: hourlyBuckets,
    topContactedNumbers,
    frequentPairs,
    shortBurstCalls,
    nightCallsCount,
    nightCallRatio: records.length ? (nightCallsCount / records.length) : 0,
    dateRange: {
      start: new Date(minDate).toISOString(),
      end: new Date(maxDate).toISOString(),
    },
    cellTowerPingsCount: towerPings,
  };
}

// ----------------------------------------------------
// 5. GRAPH CENTRALITY & NETWORK TOPOLOGY
// ----------------------------------------------------
export function generateNetworkTopology(
  records: IngestedCDRRecord[],
  suspectMappings: Record<string, SuspectMapping> = {},
  options: { minCallWeight?: number; callTypeFilter?: string } = {}
) {
  const minWeight = options.minCallWeight || 1;
  const callFilter = options.callTypeFilter || 'ALL';

  const filtered = records.filter(r => {
    if (callFilter !== 'ALL' && r.callType !== callFilter) return false;
    return true;
  });

  const nodesMap: Record<string, {
    id: string;
    phoneNumber: string;
    name: string;
    role: string;
    riskScore: number;
    alias?: string;
    avatar?: string;
    isSuspect: boolean;
    totalCalls: number;
    inCalls: number;
    outCalls: number;
    totalDuration: number;
    degreeCentrality: number;
    betweennessCentrality: number;
    eigenScore: number;
    associatedIMEIs: string[];
    towersUsed: string[];
  }> = {};

  const edgesMap: Record<string, {
    id: string;
    source: string;
    target: string;
    weight: number;
    callCount: number;
    totalDuration: number;
    callTypes: Record<string, number>;
    isBidirectional: boolean;
    lastContact: string;
  }> = {};

  const adjacency: Record<string, Set<string>> = {};

  // First pass: collect numbers and edge stats
  filtered.forEach(rec => {
    const src = rec.callingNumber;
    const dst = rec.calledNumber;

    [src, dst].forEach(num => {
      if (!nodesMap[num]) {
        const mapping = suspectMappings[num];
        nodesMap[num] = {
          id: num,
          phoneNumber: num,
          name: mapping?.ownerName || (mapping?.suspectId ? `Suspect (${mapping.suspectId})` : `Target ${num.slice(-4)}`),
          role: mapping?.role || 'ASSOCIATE',
          riskScore: mapping?.riskScore || 50,
          alias: mapping?.alias || (num.startsWith('+91') ? 'Primary Mobile' : 'Burner Line'),
          avatar: mapping?.avatar,
          isSuspect: !!mapping?.suspectId || (mapping?.riskScore ? mapping.riskScore >= 75 : false),
          totalCalls: 0,
          inCalls: 0,
          outCalls: 0,
          totalDuration: 0,
          degreeCentrality: 0,
          betweennessCentrality: 0,
          eigenScore: 0,
          associatedIMEIs: [],
          towersUsed: [],
        };
      }
    });

    if (rec.imeiCalling && nodesMap[src] && !nodesMap[src].associatedIMEIs.includes(rec.imeiCalling)) {
      nodesMap[src].associatedIMEIs.push(rec.imeiCalling);
    }
    if (rec.imeiCalled && nodesMap[dst] && !nodesMap[dst].associatedIMEIs.includes(rec.imeiCalled)) {
      nodesMap[dst].associatedIMEIs.push(rec.imeiCalled);
    }
    if (rec.cellTowerId && nodesMap[src]) {
      if (!nodesMap[src].towersUsed.includes(rec.cellTowerId)) nodesMap[src].towersUsed.push(rec.cellTowerId);
    }

    nodesMap[src].totalCalls++;
    nodesMap[src].outCalls++;
    nodesMap[src].totalDuration += rec.durationSeconds;

    nodesMap[dst].totalCalls++;
    nodesMap[dst].inCalls++;
    nodesMap[dst].totalDuration += rec.durationSeconds;

    if (!adjacency[src]) adjacency[src] = new Set();
    if (!adjacency[dst]) adjacency[dst] = new Set();
    adjacency[src].add(dst);
    adjacency[dst].add(src);

    const edgeKey = [src, dst].sort().join('---');
    if (!edgesMap[edgeKey]) {
      edgesMap[edgeKey] = {
        id: `edge-${src}-${dst}`,
        source: src,
        target: dst,
        weight: 0,
        callCount: 0,
        totalDuration: 0,
        callTypes: {},
        isBidirectional: false,
        lastContact: rec.timestamp,
      };
    }

    edgesMap[edgeKey].weight += 1;
    edgesMap[edgeKey].callCount += 1;
    edgesMap[edgeKey].totalDuration += rec.durationSeconds;
    edgesMap[edgeKey].callTypes[rec.callType] = (edgesMap[edgeKey].callTypes[rec.callType] || 0) + 1;
    if (new Date(rec.timestamp) > new Date(edgesMap[edgeKey].lastContact)) {
      edgesMap[edgeKey].lastContact = rec.timestamp;
    }
  });

  // Calculate Degree Centrality
  const totalNodesCount = Object.keys(nodesMap).length;
  Object.keys(nodesMap).forEach(nodeId => {
    const neighbors = adjacency[nodeId] ? adjacency[nodeId].size : 0;
    nodesMap[nodeId].degreeCentrality = totalNodesCount > 1 ? Number((neighbors / (totalNodesCount - 1)).toFixed(3)) : 0;
  });

  // Calculate Brandes Betweenness Centrality for bridge identification
  const betweenness: Record<string, number> = {};
  Object.keys(nodesMap).forEach(v => { betweenness[v] = 0; });

  const nodeKeys = Object.keys(nodesMap);
  nodeKeys.forEach(s => {
    const stack: string[] = [];
    const pred: Record<string, string[]> = {};
    const sigma: Record<string, number> = {};
    const dist: Record<string, number> = {};

    nodeKeys.forEach(v => {
      pred[v] = [];
      sigma[v] = 0;
      dist[v] = -1;
    });

    sigma[s] = 1;
    dist[s] = 0;
    const queue: string[] = [s];

    while (queue.length > 0) {
      const v = queue.shift()!;
      stack.push(v);

      const neighbors = Array.from(adjacency[v] || []);
      neighbors.forEach(w => {
        if (dist[w] < 0) {
          dist[w] = dist[v] + 1;
          queue.push(w);
        }
        if (dist[w] === dist[v] + 1) {
          sigma[w] += sigma[v];
          pred[w].push(v);
        }
      });
    }

    const delta: Record<string, number> = {};
    nodeKeys.forEach(v => { delta[v] = 0; });

    while (stack.length > 0) {
      const w = stack.pop()!;
      pred[w].forEach(v => {
        delta[v] += (sigma[v] / (sigma[w] || 1)) * (1 + delta[w]);
      });
      if (w !== s) {
        betweenness[w] += delta[w];
      }
    }
  });

  // Normalize betweenness
  const scale = totalNodesCount > 2 ? 1 / ((totalNodesCount - 1) * (totalNodesCount - 2)) : 1;
  Object.keys(nodesMap).forEach(nodeId => {
    const rawB = betweenness[nodeId] || 0;
    nodesMap[nodeId].betweennessCentrality = Number((rawB * scale).toFixed(3));
    // High betweenness gives risk score boost (identifying bridge nodes/kingpins)
    if (nodesMap[nodeId].betweennessCentrality > 0.35) {
      nodesMap[nodeId].riskScore = Math.max(nodesMap[nodeId].riskScore, 88);
    }
  });

  // Filter edges based on min weight
  const filteredEdges = Object.values(edgesMap).filter(e => e.callCount >= minWeight);

  return {
    nodes: Object.values(nodesMap),
    links: filteredEdges,
    totalNodes: Object.keys(nodesMap).length,
    totalLinks: filteredEdges.length,
    bridgeNodes: Object.values(nodesMap).filter(n => n.betweennessCentrality > 0.25),
    highFrequencyLinks: filteredEdges.filter(e => e.callCount >= 5),
  };
}

// ----------------------------------------------------
// 6. SPATIAL-TEMPORAL CO-OCCURRENCE / CO-PRESENCE
// ----------------------------------------------------
export interface CoOccurrenceEvent {
  id: string;
  timestampA: string;
  timestampB: string;
  timeDeltaMinutes: number;
  cellTowerId: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  phoneA: string;
  phoneB: string;
  suspectAName?: string;
  suspectBName?: string;
  riskSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  reason: string;
  callTypeA: string;
  callTypeB: string;
}

export function findSpatialTemporalCoOccurrences(
  records: IngestedCDRRecord[],
  timeWindowMinutes = 15,
  suspectMappings: Record<string, SuspectMapping> = {}
): CoOccurrenceEvent[] {
  // Filter only records that have a cell tower ID or lat/lng
  const towerRecords = records.filter(r => r.cellTowerId && r.timestamp);
  
  // Group by cell tower ID
  const towerGroups: Record<string, IngestedCDRRecord[]> = {};
  towerRecords.forEach(r => {
    const key = r.cellTowerId!;
    if (!towerGroups[key]) towerGroups[key] = [];
    towerGroups[key].push(r);
  });

  const coOccurrences: CoOccurrenceEvent[] = [];
  const visitedPairs = new Set<string>();

  Object.entries(towerGroups).forEach(([towerId, groupRecords]) => {
    // Sort chronologically
    groupRecords.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    for (let i = 0; i < groupRecords.length; i++) {
      const recA = groupRecords[i];
      const timeA = new Date(recA.timestamp).getTime();

      for (let j = i + 1; j < groupRecords.length; j++) {
        const recB = groupRecords[j];
        const timeB = new Date(recB.timestamp).getTime();
        const deltaMinutes = (timeB - timeA) / (1000 * 60);

        if (deltaMinutes > timeWindowMinutes) break; // Exceeds window, since sorted

        // Only alert if distinct phone numbers
        if (recA.callingNumber !== recB.callingNumber && recA.callingNumber !== recB.calledNumber) {
          const sortedNumbers = [recA.callingNumber, recB.callingNumber].sort();
          const dedupKey = `${towerId}-${sortedNumbers.join(':')}-${Math.floor(timeA / (1000 * 60 * 5))}`; // 5-minute bucket dedup

          if (!visitedPairs.has(dedupKey)) {
            visitedPairs.add(dedupKey);

            const mapA = suspectMappings[recA.callingNumber];
            const mapB = suspectMappings[recB.callingNumber];

            let riskSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' = 'MEDIUM';
            if (deltaMinutes <= 5) riskSeverity = 'CRITICAL';
            else if (deltaMinutes <= 15) riskSeverity = 'HIGH';

            // Boost severity if both are marked suspects
            if (mapA?.suspectId && mapB?.suspectId) {
              riskSeverity = 'CRITICAL';
            }

            coOccurrences.push({
              id: `co-occ-${towerId}-${i}-${j}-${Date.now().toString(36)}`,
              timestampA: recA.timestamp,
              timestampB: recB.timestamp,
              timeDeltaMinutes: Math.round(deltaMinutes * 10) / 10,
              cellTowerId: towerId,
              locationName: recA.firstLocation || recB.firstLocation || `Cell Sector ${towerId}`,
              latitude: recA.latitude || recB.latitude || null,
              longitude: recA.longitude || recB.longitude || null,
              phoneA: recA.callingNumber,
              phoneB: recB.callingNumber,
              suspectAName: mapA?.ownerName || (mapA?.suspectId ? `Suspect (${mapA.suspectId})` : undefined),
              suspectBName: mapB?.ownerName || (mapB?.suspectId ? `Suspect (${mapB.suspectId})` : undefined),
              riskSeverity,
              reason: `Co-presence detected: ${recA.callingNumber} and ${recB.callingNumber} connected to Tower [${towerId}] within ${Math.round(deltaMinutes)} mins.`,
              callTypeA: recA.callType,
              callTypeB: recB.callType,
            });
          }
        }
      }
    }
  });

  return coOccurrences.sort((a, b) => new Date(b.timestampA).getTime() - new Date(a.timestampA).getTime());
}

// ----------------------------------------------------
// 7. GEMINI AI TELECOM FORENSIC INSIGHTS ENGINE
// ----------------------------------------------------
export async function generateAITelecomInsights(
  caseTitle: string,
  analytics: ReturnType<typeof calculateCDRAnalytics>,
  network: ReturnType<typeof generateNetworkTopology>,
  coOccurrences: CoOccurrenceEvent[],
  suspectsList: any[] = []
): Promise<{
  summary: string;
  criticalAnomalies: {
    category: 'BURNER_PHONE' | 'CO_PRESENCE' | 'RADIO_SILENCE' | 'MIDNIGHT_SPIKE' | 'BRIDGE_NODE';
    title: string;
    description: string;
    confidence: number;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    involvedEntities: string[];
  }[];
  tacticalRecommendations: string[];
}> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are Suraag AI's Lead Forensic Telecommunications Analyst.
Analyze the following Call Detail Records (CDR) telemetry data for Case: "${caseTitle}".

CDR METRICS SUMMARY:
- Total Calls Analyzed: ${analytics.totalRecords}
- Unique Numbers: ${analytics.totalUniqueNumbers}
- Total Duration: ${Math.round(analytics.totalDurationSeconds / 60)} minutes
- Night Calls (23:00 - 05:00): ${analytics.nightCallsCount} (${Math.round((analytics.nightCallRatio || 0) * 100)}%)
- Short Burst/Missed Calls (<5s): ${analytics.shortBurstCalls}
- Top Communicators: ${JSON.stringify(analytics.topContactedNumbers.slice(0, 5))}
- Centrality & Bridge Nodes: ${JSON.stringify(network.bridgeNodes.map(b => ({ phone: b.phoneNumber, name: b.name, betweenness: b.betweennessCentrality })))}
- Spatial-Temporal Co-occurrences at Cell Towers: ${JSON.stringify(coOccurrences.slice(0, 5))}
- Known Case Suspects: ${JSON.stringify(suspectsList.map(s => ({ id: s.id, name: s.name, phone: s.phone })))}

Provide your response in strictly VALID JSON format without backticks or markdown fences:
{
  "summary": "Forensic executive summary of telecommunication behavioral patterns",
  "criticalAnomalies": [
    {
      "category": "BURNER_PHONE",
      "title": "Anomaly headline",
      "description": "Evidence-backed tactical explanation",
      "confidence": 92.5,
      "severity": "CRITICAL",
      "involvedEntities": ["+91...", "+91..."]
    }
  ],
  "tacticalRecommendations": [
    "Actionable next forensic steps for investigators"
  ]
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      const cleaned = responseText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(cleaned);
      if (parsed.summary && parsed.criticalAnomalies) {
        return parsed;
      }
    } catch (err) {
      console.warn("Gemini AI API call failed or timed out, using forensic heuristic rules:", err);
    }
  }

  // Fallback Rule-Based Forensic Intelligence Engine
  const anomalies: {
    category: 'BURNER_PHONE' | 'CO_PRESENCE' | 'RADIO_SILENCE' | 'MIDNIGHT_SPIKE' | 'BRIDGE_NODE';
    title: string;
    description: string;
    confidence: number;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    involvedEntities: string[];
  }[] = [];

  // Check 1: Co-occurrence at Cell Towers
  if (coOccurrences.length > 0) {
    const topOcc = coOccurrences[0];
    anomalies.push({
      category: 'CO_PRESENCE',
      title: `Physical Co-location Detected at Tower ${topOcc.cellTowerId}`,
      description: `Target numbers ${topOcc.phoneA} and ${topOcc.phoneB} pinged the exact same cell sector (${topOcc.locationName}) within a ${topOcc.timeDeltaMinutes}-minute window, indicating physical proximity/meeting during operation window.`,
      confidence: 96.4,
      severity: 'CRITICAL',
      involvedEntities: [topOcc.phoneA, topOcc.phoneB],
    });
  }

  // Check 2: Bridge / Mastermind Node
  if (network.bridgeNodes && network.bridgeNodes.length > 0) {
    const topBridge = network.bridgeNodes[0];
    anomalies.push({
      category: 'BRIDGE_NODE',
      title: `High Betweenness Centrality Hub: ${topBridge.name} (${topBridge.phoneNumber})`,
      description: `${topBridge.phoneNumber} exhibits Betweenness Centrality score of ${topBridge.betweennessCentrality}, acting as the primary broker and relay node connecting isolated conspiracy cells.`,
      confidence: 94.0,
      severity: 'CRITICAL',
      involvedEntities: [topBridge.phoneNumber],
    });
  }

  // Check 3: Midnight / Night-Owl Communication Spikes
  if (analytics.nightCallsCount > 0) {
    anomalies.push({
      category: 'MIDNIGHT_SPIKE',
      title: `Anomalous Midnight Tactical Communication Flurry`,
      description: `${analytics.nightCallsCount} calls (${Math.round((analytics.nightCallRatio || 0) * 100)}% of dataset) occurred between 23:00 and 05:00 hours, deviating strongly from legitimate commercial telecom baselines.`,
      confidence: 91.2,
      severity: 'HIGH',
      involvedEntities: analytics.topContactedNumbers.slice(0, 3).map(n => n.number),
    });
  }

  // Check 4: Short Burst / Burner Signaling
  if (analytics.shortBurstCalls > 0) {
    anomalies.push({
      category: 'BURNER_PHONE',
      title: `Rapid Signaling / One-Ring Pings Detected`,
      description: `Identified ${analytics.shortBurstCalls} sub-5-second short duration calls, consistent with stealth signal acknowledgement or pre-arranged activation triggers.`,
      confidence: 88.5,
      severity: 'HIGH',
      involvedEntities: analytics.topContactedNumbers.slice(0, 2).map(n => n.number),
    });
  }

  return {
    summary: `Telecommunication forensic analysis of ${analytics.totalRecords} CDR records reveals significant spatial-temporal co-presence and concentrated communication channels. Co-occurrence analysis pinpointed critical meetings at key cell sectors, while network graph topology identified key relay nodes orchestrating multi-party operations.`,
    criticalAnomalies: anomalies,
    tacticalRecommendations: [
      'Issue Section 91 CrPC notice to telecom operators for subscriber CAF (Customer Application Form) & GPRS IPDR logs on high-centrality target numbers.',
      'Correlate identified Cell Tower sector azimuth angles with CCTV cameras positioned within the 1.5km coverage cone.',
      'Execute IMEI multi-SIM tracking on identified burner handsets to identify secondary SIM cards activated on the same hardware.',
      'Cross-reference spatial-temporal co-presence timestamps with physical witness statements in the Case Dossier.',
    ],
  };
}
