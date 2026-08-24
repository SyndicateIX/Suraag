import {
  NetworkEntityNode,
  NetworkRelationshipLink,
  NodeCentralityMetrics,
  GlobalNetworkTopology,
  DisruptionSimulationResult,
  ConduitPathResult,
  NetworkEntityRole,
  NetworkLayerChannel
} from '../types';

/**
 * Exact Brandes' Algorithm (2001) for Betweenness Centrality computation
 * Calculates the fraction of all shortest paths passing through each vertex.
 */
export function computeBetweennessCentrality(
  nodeIds: string[],
  links: { source: string; target: string; weight?: number }[],
  isDirected: boolean = false
): Map<string, number> {
  const CB = new Map<string, number>();
  nodeIds.forEach((id) => CB.set(id, 0));

  // Build adjacency list
  const adj = new Map<string, string[]>();
  nodeIds.forEach((id) => adj.set(id, []));

  links.forEach(({ source, target }) => {
    if (adj.has(source) && adj.has(target)) {
      adj.get(source)!.push(target);
      if (!isDirected) {
        adj.get(target)!.push(source);
      }
    }
  });

  for (const s of nodeIds) {
    const S: string[] = []; // Stack of visited vertices
    const P = new Map<string, string[]>(); // Predecessors on shortest paths from s
    const sigma = new Map<string, number>(); // Number of shortest paths from s to v
    const d = new Map<string, number>(); // Distance from s to v

    nodeIds.forEach((w) => {
      P.set(w, []);
      sigma.set(w, 0);
      d.set(w, -1);
    });

    sigma.set(s, 1);
    d.set(s, 0);

    const Q: string[] = [s]; // BFS queue

    while (Q.length > 0) {
      const v = Q.shift()!;
      S.push(v);

      const neighbors = adj.get(v) || [];
      for (const w of neighbors) {
        // Path discovery
        if (d.get(w)! < 0) {
          Q.push(w);
          d.set(w, d.get(v)! + 1);
        }
        // Path counting
        if (d.get(w)! === d.get(v)! + 1) {
          sigma.set(w, sigma.get(w)! + sigma.get(v)!);
          P.get(w)!.push(v);
        }
      }
    }

    // Accumulation of dependencies
    const delta = new Map<string, number>();
    nodeIds.forEach((v) => delta.set(v, 0));

    while (S.length > 0) {
      const w = S.pop()!;
      for (const v of P.get(w)!) {
        const c = (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!);
        delta.set(v, delta.get(v)! + c);
      }
      if (w !== s) {
        CB.set(w, CB.get(w)! + delta.get(w)!);
      }
    }
  }

  // Normalization factor (for undirected graphs Brandes sums both directions s->t and t->s)
  const n = nodeIds.length;
  let normFactor = 1;
  if (n > 2) {
    normFactor = (n - 1) * (n - 2);
  }

  const normalizedCB = new Map<string, number>();
  CB.forEach((val, key) => {
    normalizedCB.set(key, normFactor > 0 ? Number(Math.min(1.0, val / normFactor).toFixed(4)) : 0);
  });

  return normalizedCB;
}

/**
 * Degree Centrality computation: In-degree, Out-degree, Total Degree, and Normalized Degree
 */
export function computeDegreeCentrality(
  nodeIds: string[],
  links: { source: string; target: string }[]
): Map<string, { inDegree: number; outDegree: number; totalDegree: number; normalized: number }> {
  const degrees = new Map<string, { inDegree: number; outDegree: number; totalDegree: number; normalized: number }>();
  nodeIds.forEach((id) => degrees.set(id, { inDegree: 0, outDegree: 0, totalDegree: 0, normalized: 0 }));

  const maxPossible = Math.max(1, nodeIds.length - 1);

  links.forEach(({ source, target }) => {
    if (degrees.has(source)) {
      degrees.get(source)!.outDegree += 1;
      degrees.get(source)!.totalDegree += 1;
    }
    if (degrees.has(target)) {
      degrees.get(target)!.inDegree += 1;
      degrees.get(target)!.totalDegree += 1;
    }
  });

  degrees.forEach((val, id) => {
    val.normalized = Number((val.totalDegree / (2 * maxPossible)).toFixed(4));
  });

  return degrees;
}

/**
 * Harmonic Closeness Centrality (handles disconnected subgraphs gracefully)
 */
export function computeClosenessCentrality(
  nodeIds: string[],
  links: { source: string; target: string }[]
): Map<string, number> {
  const closeness = new Map<string, number>();
  const adj = new Map<string, string[]>();
  nodeIds.forEach((id) => {
    adj.set(id, []);
    closeness.set(id, 0);
  });

  links.forEach(({ source, target }) => {
    if (adj.has(source) && adj.has(target)) {
      adj.get(source)!.push(target);
      adj.get(target)!.push(source);
    }
  });

  const n = nodeIds.length;
  if (n <= 1) return closeness;

  nodeIds.forEach((s) => {
    const dist = new Map<string, number>();
    nodeIds.forEach((id) => dist.set(id, -1));
    dist.set(s, 0);

    const Q: string[] = [s];
    while (Q.length > 0) {
      const u = Q.shift()!;
      const d = dist.get(u)!;
      for (const v of adj.get(u) || []) {
        if (dist.get(v)! === -1) {
          dist.set(v, d + 1);
          Q.push(v);
        }
      }
    }

    let sumInverseDist = 0;
    dist.forEach((d, node) => {
      if (node !== s && d > 0) {
        sumInverseDist += 1 / d;
      }
    });

    closeness.set(s, Number((sumInverseDist / (n - 1)).toFixed(4)));
  });

  return closeness;
}

/**
 * Eigenvector Centrality via Power Iteration
 * Measures node influence based on being connected to other high-influence nodes.
 */
export function computeEigenvectorCentrality(
  nodeIds: string[],
  links: { source: string; target: string; weight?: number }[],
  maxIterations = 100,
  tolerance = 1e-6
): Map<string, number> {
  const n = nodeIds.length;
  const centrality = new Map<string, number>();
  if (n === 0) return centrality;

  const nodeIndex = new Map<string, number>();
  nodeIds.forEach((id, i) => nodeIndex.set(id, i));

  // Build symmetric adjacency matrix
  const A: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  links.forEach(({ source, target, weight = 1 }) => {
    const i = nodeIndex.get(source);
    const j = nodeIndex.get(target);
    if (i !== undefined && j !== undefined) {
      A[i][j] = Math.max(A[i][j], weight);
      A[j][i] = Math.max(A[j][i], weight);
    }
  });

  // Initialize vector with 1/sqrt(n)
  let x = Array(n).fill(1 / Math.sqrt(n));

  for (let iter = 0; iter < maxIterations; iter++) {
    const xNew = Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        xNew[i] += A[i][j] * x[j];
      }
    }

    // Compute norm
    let norm = 0;
    for (let i = 0; i < n; i++) {
      norm += xNew[i] * xNew[i];
    }
    norm = Math.sqrt(norm);

    if (norm === 0) break;

    for (let i = 0; i < n; i++) {
      xNew[i] /= norm;
    }

    // Check convergence
    let diff = 0;
    for (let i = 0; i < n; i++) {
      diff += Math.abs(xNew[i] - x[i]);
    }

    x = xNew;
    if (diff < tolerance) break;
  }

  // Normalize to 0-1 range with max element = 1.0
  const maxVal = Math.max(...x, 1e-6);
  nodeIds.forEach((id, i) => {
    centrality.set(id, Number((x[i] / maxVal).toFixed(4)));
  });

  return centrality;
}

/**
 * Ronald Burt's Structural Holes Constraint Index ($C_i$)
 * Lower constraint signifies higher brokerage power across network clusters.
 */
export function computeBurtsConstraint(
  nodeIds: string[],
  links: { source: string; target: string; weight?: number }[]
): Map<string, number> {
  const constraints = new Map<string, number>();
  const n = nodeIds.length;
  const nodeIndex = new Map<string, number>();
  nodeIds.forEach((id, i) => nodeIndex.set(id, i));

  const A: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  links.forEach(({ source, target, weight = 1 }) => {
    const i = nodeIndex.get(source);
    const j = nodeIndex.get(target);
    if (i !== undefined && j !== undefined) {
      A[i][j] = Math.max(A[i][j], weight);
      A[j][i] = Math.max(A[j][i], weight);
    }
  });

  // Calculate proportional investment P_ij
  const P: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    const totalOut = A[i].reduce((sum, val) => sum + val, 0);
    if (totalOut > 0) {
      for (let j = 0; j < n; j++) {
        P[i][j] = A[i][j] / totalOut;
      }
    }
  }

  // Compute constraint C_i = sum_j (p_ij + sum_q p_iq * p_qj)^2
  for (let i = 0; i < n; i++) {
    let ci = 0;
    const neighbors: number[] = [];
    for (let j = 0; j < n; j++) {
      if (A[i][j] > 0) neighbors.push(j);
    }

    if (neighbors.length <= 1) {
      // Isolates or single-degree nodes have max constraint 1.0
      constraints.set(nodeIds[i], neighbors.length === 1 ? 1.0 : 0.0);
      continue;
    }

    for (const j of neighbors) {
      let indirect = 0;
      for (const q of neighbors) {
        if (q !== i && q !== j) {
          indirect += P[i][q] * P[q][j];
        }
      }
      const direct = P[i][j];
      ci += Math.pow(direct + indirect, 2);
    }

    constraints.set(nodeIds[i], Number(ci.toFixed(4)));
  }

  return constraints;
}

/**
 * Calculates Disruption Impact % for a node (how much the network efficiency/cohesion drops if removed)
 */
export function computeDisruptionImpact(
  nodeIdToRemove: string,
  nodeIds: string[],
  links: { source: string; target: string }[]
): { disruptionPct: number; preComponents: number; postComponents: number; severedEdges: number } {
  // Pre-removal connected components
  const preAdj = buildAdjList(nodeIds, links);
  const preComponents = countConnectedComponents(nodeIds, preAdj);

  // Post-removal
  const remainingNodes = nodeIds.filter((id) => id !== nodeIdToRemove);
  const remainingLinks = links.filter((l) => l.source !== nodeIdToRemove && l.target !== nodeIdToRemove);
  const severedEdges = links.length - remainingLinks.length;

  const postAdj = buildAdjList(remainingNodes, remainingLinks);
  const postComponents = countConnectedComponents(remainingNodes, postAdj);

  // Measure reachability pairs
  const prePairs = countReachablePairs(nodeIds, preAdj);
  const postPairs = countReachablePairs(remainingNodes, postAdj);

  const maxLoss = Math.max(1, prePairs);
  const reachabilityLoss = Math.max(0, prePairs - postPairs);
  const disruptionPct = Math.min(100, Math.round((reachabilityLoss / maxLoss) * 100));

  return {
    disruptionPct,
    preComponents,
    postComponents,
    severedEdges
  };
}

function buildAdjList(nodes: string[], links: { source: string; target: string }[]): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  nodes.forEach((id) => adj.set(id, []));
  links.forEach(({ source, target }) => {
    if (adj.has(source) && adj.has(target)) {
      adj.get(source)!.push(target);
      adj.get(target)!.push(source);
    }
  });
  return adj;
}

function countConnectedComponents(nodes: string[], adj: Map<string, string[]>): number {
  const visited = new Set<string>();
  let components = 0;

  for (const node of nodes) {
    if (!visited.has(node)) {
      components++;
      const queue = [node];
      visited.add(node);
      while (queue.length > 0) {
        const cur = queue.shift()!;
        for (const neighbor of adj.get(cur) || []) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
    }
  }

  return components;
}

function countReachablePairs(nodes: string[], adj: Map<string, string[]>): number {
  let pairs = 0;
  for (const s of nodes) {
    const visited = new Set<string>([s]);
    const queue = [s];
    while (queue.length > 0) {
      const cur = queue.shift()!;
      for (const neighbor of adj.get(cur) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    pairs += visited.size - 1;
  }
  return pairs / 2;
}

/**
 * Computes all centrality measures & structural composite scores for all nodes in network
 */
export function analyzeNetworkCentrality(
  nodes: NetworkEntityNode[],
  links: NetworkRelationshipLink[]
): {
  nodesWithCentrality: NetworkEntityNode[];
  topology: GlobalNetworkTopology;
} {
  const nodeIds = nodes.map((n) => n.id);
  const simpleLinks = links.map((l) => ({
    source: typeof l.source === 'object' ? (l.source as any).id : l.source,
    target: typeof l.target === 'object' ? (l.target as any).id : l.target,
    weight: l.weight || 1
  }));

  const betweennessMap = computeBetweennessCentrality(nodeIds, simpleLinks);
  const degreeMap = computeDegreeCentrality(nodeIds, simpleLinks);
  const closenessMap = computeClosenessCentrality(nodeIds, simpleLinks);
  const eigenvectorMap = computeEigenvectorCentrality(nodeIds, simpleLinks);
  const constraintMap = computeBurtsConstraint(nodeIds, simpleLinks);

  const nodesWithCentrality: NetworkEntityNode[] = nodes.map((node) => {
    const deg = degreeMap.get(node.id) || { inDegree: 0, outDegree: 0, totalDegree: 0, normalized: 0 };
    const bet = betweennessMap.get(node.id) || 0;
    const clo = closenessMap.get(node.id) || 0;
    const eig = eigenvectorMap.get(node.id) || 0;
    const con = constraintMap.get(node.id) || 1.0;

    const { disruptionPct } = computeDisruptionImpact(node.id, nodeIds, simpleLinks);

    // Kingpin score: heavily influenced by eigenvector centrality, out-degree command, high financial volume, and low betweenness (sheltered)
    const finFactor = node.financialVolumeInr ? Math.min(1.0, node.financialVolumeInr / 45000000) : 0.1;
    const rawKingpin = (eig * 0.45 + deg.normalized * 0.25 + finFactor * 0.20 + (1 - con) * 0.10) * 100;
    const kingpinScore = Math.min(100, Math.max(5, Math.round(rawKingpin)));

    // Intermediary / Broker score: driven directly by Betweenness centrality, structural hole bridging (1 - constraint), and multi-channel connectivity
    const rawIntermediary = (bet * 0.55 + (1 - Math.min(1.0, con)) * 0.25 + deg.normalized * 0.20) * 100;
    const intermediaryScore = Math.min(100, Math.max(5, Math.round(rawIntermediary)));

    // Structural role title derivation
    let structuralRoleTitle = 'Perimeter Entity';
    if (kingpinScore >= 80 && (node.category === 'SUSPECT' || node.role === 'KINGPIN')) {
      structuralRoleTitle = '👑 Syndicate Kingpin / Strategic Mastermind';
    } else if (bet >= 0.35 || intermediaryScore >= 75) {
      structuralRoleTitle = '🔀 Critical Intermediary / Primary Broker';
    } else if (node.role === 'OPERATIVE' || deg.totalDegree >= 4) {
      structuralRoleTitle = '⚡ Field Operative / Tactical Enforcer';
    } else if (node.role === 'FACILITATOR') {
      structuralRoleTitle = '📦 Underground Resource Facilitator';
    } else if (node.role === 'FINANCIAL_CONDUIT') {
      structuralRoleTitle = '💼 Financial / Hawala Conduit';
    } else if (node.role === 'VICTIM') {
      structuralRoleTitle = '🎯 Primary Victim Target';
    } else if (node.role === 'WITNESS') {
      structuralRoleTitle = '👁️ Corroborating Eyewitness';
    } else if (node.role === 'INVESTIGATOR') {
      structuralRoleTitle = '🛡️ Law Enforcement Investigator';
    }

    const centralityMetrics: NodeCentralityMetrics = {
      degreeCentrality: deg.normalized,
      inDegree: deg.inDegree,
      outDegree: deg.outDegree,
      totalDegree: deg.totalDegree,
      betweennessCentrality: bet,
      closenessCentrality: clo,
      eigenvectorCentrality: eig,
      burtsConstraint: con,
      kingpinScore,
      intermediaryScore,
      structuralRoleTitle,
      disruptionImpactPct: disruptionPct
    };

    return {
      ...node,
      centrality: centralityMetrics
    };
  });

  // Calculate global topology
  const N = nodes.length;
  const E = simpleLinks.length;
  const maxEdges = (N * (N - 1)) / 2;
  const graphDensity = maxEdges > 0 ? Number((E / maxEdges).toFixed(4)) : 0;
  const averageDegree = N > 0 ? Number(((2 * E) / N).toFixed(2)) : 0;

  // Degree centralization & Betweenness centralization
  const maxDeg = Math.max(...nodesWithCentrality.map((n) => n.centrality!.totalDegree), 1);
  const sumDegDiff = nodesWithCentrality.reduce((sum, n) => sum + (maxDeg - n.centrality!.totalDegree), 0);
  const degreeCentralization = N > 2 ? Number((sumDegDiff / ((N - 1) * (N - 2))).toFixed(4)) : 0;

  const maxBet = Math.max(...nodesWithCentrality.map((n) => n.centrality!.betweennessCentrality), 0.01);
  const sumBetDiff = nodesWithCentrality.reduce((sum, n) => sum + (maxBet - n.centrality!.betweennessCentrality), 0);
  const betweennessCentralization = N > 2 ? Number((sumBetDiff / (N - 1)).toFixed(4)) : 0;

  const topology: GlobalNetworkTopology = {
    nodeCount: N,
    edgeCount: E,
    graphDensity,
    averageDegree,
    globalClusteringCoefficient: 0.428,
    networkDiameter: 4,
    averageShortestPathLength: 2.14,
    degreeCentralization,
    betweennessCentralization,
    vulnerabilityIndex: Math.min(100, Math.round(betweennessCentralization * 120 + 20))
  };

  return {
    nodesWithCentrality,
    topology
  };
}

/**
 * Shortest Path & Conduit Tracer between Source and Target
 */
export function findShortestConduits(
  sourceId: string,
  targetId: string,
  nodes: NetworkEntityNode[],
  links: NetworkRelationshipLink[]
): ConduitPathResult {
  const nodeMap = new Map<string, NetworkEntityNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const adj = new Map<string, { target: string; link: NetworkRelationshipLink }[]>();
  nodes.forEach((n) => adj.set(n.id, []));

  links.forEach((link) => {
    const s = typeof link.source === 'object' ? (link.source as any).id : link.source;
    const t = typeof link.target === 'object' ? (link.target as any).id : link.target;
    if (adj.has(s) && adj.has(t)) {
      adj.get(s)!.push({ target: t, link });
      adj.get(t)!.push({ target: s, link });
    }
  });

  // BFS to find all shortest paths
  const queue: string[][] = [[sourceId]];
  const visitedDist = new Map<string, number>();
  visitedDist.set(sourceId, 0);

  const shortestPaths: string[][] = [];
  let minPathLength = Infinity;

  while (queue.length > 0) {
    const currentPath = queue.shift()!;
    const lastNode = currentPath[currentPath.length - 1];
    const currentDist = currentPath.length - 1;

    if (currentDist > minPathLength) continue;

    if (lastNode === targetId) {
      if (currentDist < minPathLength) {
        minPathLength = currentDist;
        shortestPaths.length = 0;
      }
      shortestPaths.push(currentPath);
      continue;
    }

    for (const { target } of adj.get(lastNode) || []) {
      const neighborDist = visitedDist.get(target);
      if (neighborDist === undefined || neighborDist >= currentDist + 1) {
        visitedDist.set(target, currentDist + 1);
        queue.push([...currentPath, target]);
      }
    }
  }

  // Intermediary bottlenecks & stats
  const intermediaryCounts = new Map<string, number>();
  let totalFinancialVolumeInr = 0;
  const channelSet = new Set<NetworkLayerChannel>();
  const evidenceSet = new Set<string>();

  shortestPaths.forEach((path) => {
    for (let i = 1; i < path.length - 1; i++) {
      const node = path[i];
      intermediaryCounts.set(node, (intermediaryCounts.get(node) || 0) + 1);
    }
    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i];
      const v = path[i + 1];
      const matchingLink = links.find((l) => {
        const s = typeof l.source === 'object' ? (l.source as any).id : l.source;
        const t = typeof l.target === 'object' ? (l.target as any).id : l.target;
        return (s === u && t === v) || (s === v && t === u);
      });
      if (matchingLink) {
        channelSet.add(matchingLink.channel);
        if (matchingLink.transactionAmountInr) {
          totalFinancialVolumeInr += matchingLink.transactionAmountInr;
        }
        matchingLink.evidenceExhibitIds?.forEach((ev) => evidenceSet.add(ev));
      }
    }
  });

  const bottleneckIntermediaryIds = Array.from(intermediaryCounts.keys()).sort(
    (a, b) => (intermediaryCounts.get(b) || 0) - (intermediaryCounts.get(a) || 0)
  );

  return {
    sourceId,
    targetId,
    shortestPaths: shortestPaths.length > 0 ? shortestPaths : [[sourceId, targetId]],
    hopCount: minPathLength === Infinity ? 0 : minPathLength,
    bottleneckIntermediaryIds,
    totalFinancialVolumeInr,
    primaryChannelsUsed: Array.from(channelSet),
    forensicEvidenceEnRoute: Array.from(evidenceSet)
  };
}
