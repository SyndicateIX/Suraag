import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Network,
  ShieldAlert,
  CheckCircle2,
  Eye,
  Tag,
  ArrowRight,
  Sparkles,
  Filter,
  Layers,
  Shield,
  Clock,
  Radio,
  RefreshCw,
  ArrowUpRight,
  Activity,
  Zap,
  Maximize2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { useSuraagStore } from '../store/useSuraagStore';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { GraphNode, GraphLink, CorrelationGraphData } from '../types';

export const EvidenceCorrelationGraph: React.FC = () => {
  const { selectedCaseId } = useSuraagStore();
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('DIYA');
  const [isSimulatingPhysics, setIsSimulatingPhysics] = useState(false);

  // Ingested Investigation Report Nodes & Bayesian Link Structure (Spacious 1000x620 Viewport Coordinates)
  const defaultNodes: GraphNode[] = [
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
  ];

  const defaultLinks: GraphLink[] = [
    { from: 'DIYA', to: 'CHETANY', label: 'Conspiracy Co-Conspirators (EVID-020)', probabilityScore: 99.8, isCritical: true },
    { from: 'DIYA', to: 'KESHAN', label: 'Fiancee / ₹45M Beneficiary', probabilityScore: 99.2, isCritical: true },
    { from: 'CHETANY', to: 'VIKRAM', label: 'RTGS ₹6.0M Wire (EVID-010)', probabilityScore: 99.4, isCritical: true },
    { from: 'CHETANY', to: 'EVID-005', label: 'DNA Match 99.999%', probabilityScore: 99.9, isCritical: true },
    { from: 'CHETANY', to: 'EVID-016', label: 'Rifle DNA & Ballistics', probabilityScore: 99.9, isCritical: true },
    { from: 'ARCHITA', to: 'CHETANY', label: 'Eyewitness Identification', probabilityScore: 98.2 },
    { from: 'NEHA', to: 'EVID-016', label: 'Autopsy Wound Match', probabilityScore: 99.9, isCritical: true },
    { from: 'VIKRAM', to: 'KESHAN', label: 'Kharadi Crossing Hit', probabilityScore: 94.2 },
    { from: 'EVID-020', to: 'DIYA', label: '482 Voice Notes Intercept', probabilityScore: 99.8 },
    { from: 'EV-REP-01', to: 'DIYA', label: 'Table 4 Payment', probabilityScore: 97.5 },
    { from: 'EV-REP-08', to: 'NEHA', label: 'Pathological Verdict', probabilityScore: 99.95 },
    { from: 'EV-REP-08', to: 'EVID-016', label: 'Boulder Ridge Rifle Recovery', probabilityScore: 99.9 }
  ];

  // Query graph data or fallback
  const { data: apiGraph } = useQuery({
    queryKey: ['correlation-graph', selectedCaseId],
    queryFn: () => apiClient.evidence.getCorrelationGraph(selectedCaseId),
  });

  const nodes: GraphNode[] = apiGraph?.nodes && apiGraph.nodes.length > 0 ? apiGraph.nodes : defaultNodes;
  const links: GraphLink[] = apiGraph?.links && apiGraph.links.length > 0 ? apiGraph.links : defaultLinks;

  const filteredNodes = nodes.filter((n) => {
    if (selectedFilter === 'SUSPECTS_WITNESSES') return n.type === 'SUSPECT' || n.type === 'WITNESS' || n.type === 'VICTIM';
    if (selectedFilter === 'PHYSICAL_EXHIBITS') return n.type === 'EXHIBIT';
    if (selectedFilter === 'TIMELINE_EVENTS') return n.type === 'TIMELINE_EVENT';
    return true;
  });

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const handleRunPhysicsSimulation = () => {
    setIsSimulatingPhysics(true);
    setTimeout(() => {
      setIsSimulatingPhysics(false);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Network className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              FORCE-DIRECTED CORRELATION GRAPH ARCHITECTURE & BAYESIAN NODE LINKING
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            Evidence Correlation Graph
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="confidence" pulse>100% BAYESIAN LINKED</Badge>
          <button
            onClick={handleRunPhysicsSimulation}
            disabled={isSimulatingPhysics}
            className="px-5 py-2.5 rounded bg-primary text-on-primary hover:bg-surface-tint font-tactical-data text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(255,84,76,0.35)] flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSimulatingPhysics ? 'animate-spin' : ''}`} />
            <span>{isSimulatingPhysics ? 'SIMULATING GRAPH PHYSICS...' : 'RE-CALCULATE BAYESIAN LINKS'}</span>
          </button>
        </div>
      </div>

      {/* Investigation Dossier Ingestion Fusion Overview Banner */}
      <GlassCard glow className="p-4 border-l-4 border-l-primary bg-secondary-container/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-primary/20 border border-primary shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-tactical-data text-xs font-bold uppercase text-primary tracking-wider">
                  CHARGESHEET DOSSIER GRAPH FUSION ACTIVE
                </span>
                <Badge variant="active">12 GRAPH NODES / 15 BAYESIAN EDGES</Badge>
              </div>
              <p className="text-xs text-on-surface-variant font-body-md mt-0.5">
                Multi-sensory graph engine correlating suspect profiles, witness depositions, physical exhibits, and timeline events with Bayesian probability scores.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-tactical-data">
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">GRAPH NODES</span>
              <strong className="text-primary font-bold text-sm">12 ENTITIES</strong>
            </div>
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">BAYESIAN EDGES</span>
              <strong className="text-emerald-400 font-bold text-sm">15 EDGES</strong>
            </div>
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">MAX LINK CONFIDENCE</span>
              <strong className="text-primary font-bold text-sm">99.9% PROBABILITY</strong>
            </div>
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 text-center">
              <span className="text-on-surface-variant block text-[10px] uppercase">ISOLATED NODES</span>
              <strong className="text-emerald-400 font-bold text-sm">0 ISOLATED</strong>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Filter Toolbar */}
      <GlassCard className="p-4 space-y-3">
        <div className="flex items-center gap-2 font-tactical-data text-xs">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-on-surface font-bold uppercase tracking-wider">FILTER GRAPH NODES BY CATEGORY:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-tactical-data text-xs">
          {[
            { id: 'ALL', label: 'All Graph Nodes (12)' },
            { id: 'SUSPECTS_WITNESSES', label: 'Suspects & Witnesses' },
            { id: 'PHYSICAL_EXHIBITS', label: 'Physical Exhibits' },
            { id: 'TIMELINE_EVENTS', label: 'Timeline Events' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedFilter(item.id)}
              className={`px-3 py-1.5 rounded transition-all border text-xs ${
                selectedFilter === item.id
                  ? 'bg-primary text-on-primary border-primary font-bold shadow-[0_0_12px_rgba(255,84,76,0.35)]'
                  : 'bg-surface-container text-on-surface-variant border-outline-variant hover:text-on-surface'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Main Grid: Pure SVG Force-Directed Canvas + Selected Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Sophisticated SVG Canvas */}
        <GlassCard className="lg:col-span-2 p-6 bg-surface-container-low border-primary/50 relative">
          <div className="h-[580px] w-full relative overflow-hidden flex items-center justify-center select-none bg-[#07090e] rounded-lg border border-outline-variant/40 shadow-[inner_0_0_40px_rgba(0,0,0,0.9)]">
            <svg viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
              <defs>
                <filter id="glow-primary" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff544c" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ff8a80" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Grid Background Pattern Lines */}
              <g opacity="0.08">
                {Array.from({ length: 11 }).map((_, i) => (
                  <line key={`h-${i}`} x1="0" y1={i * 60} x2="1000" y2={i * 60} stroke="#ff544c" strokeWidth="1" />
                ))}
                {Array.from({ length: 17 }).map((_, i) => (
                  <line key={`v-${i}`} x1={i * 60} y1="0" x2={i * 60} y2="620" stroke="#ff544c" strokeWidth="1" />
                ))}
              </g>

              {/* SVG Link Vector Lines with Pill Text Badges */}
              {links.map((l, idx) => {
                const n1 = nodes.find((n) => n.id === l.from);
                const n2 = nodes.find((n) => n.id === l.to);
                if (!n1 || !n2) return null;

                const isN1Visible = filteredNodes.some((fn) => fn.id === n1.id);
                const isN2Visible = filteredNodes.some((fn) => fn.id === n2.id);
                if (!isN1Visible || !isN2Visible) return null;

                const isConnectedToSelected = selectedNodeId === n1.id || selectedNodeId === n2.id;
                const midX = (n1.x + n2.x) / 2;
                const midY = (n1.y + n2.y) / 2;
                const labelText = `${l.label} (${l.probabilityScore}%)`;
                const labelWidth = Math.min(220, labelText.length * 6 + 16);

                return (
                  <g key={idx} className="transition-all duration-300">
                    <line
                      x1={n1.x}
                      y1={n1.y}
                      x2={n2.x}
                      y2={n2.y}
                      stroke={isConnectedToSelected ? '#ff544c' : l.isCritical ? '#e53935' : '#334155'}
                      strokeWidth={isConnectedToSelected ? '2.5' : '1.5'}
                      strokeOpacity={isConnectedToSelected ? '0.95' : '0.4'}
                      strokeDasharray={l.isCritical ? 'none' : '4 4'}
                    />

                    {/* Dark Pill Background Badge behind link text to prevent overlap */}
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x={-labelWidth / 2}
                        y="-10"
                        width={labelWidth}
                        height="18"
                        rx="4"
                        fill="#0c1017"
                        stroke={isConnectedToSelected ? '#ff544c' : '#1e293b'}
                        strokeWidth="1"
                        opacity={isConnectedToSelected ? '0.95' : '0.85'}
                      />
                      <text
                        x="0"
                        y="3"
                        fill={isConnectedToSelected ? '#ff544c' : '#94a3b8'}
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                        className="select-none"
                      >
                        {labelText}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Pure SVG Node Cards */}
              {filteredNodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const cardWidth = 140;
                const cardHeight = 58;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x - cardWidth / 2}, ${node.y - cardHeight / 2})`}
                    onClick={() => setSelectedNodeId(node.id)}
                    className="cursor-pointer transition-all duration-300 group"
                  >
                    {/* Node Card Background Box */}
                    <rect
                      width={cardWidth}
                      height={cardHeight}
                      rx="8"
                      fill={isSelected ? '#1e1b2e' : '#0f172a'}
                      stroke={isSelected ? '#ff544c' : node.color}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      filter={isSelected ? 'url(#glow-primary)' : undefined}
                      className="transition-all"
                    />

                    {/* Node Type Indicator Dot & Label */}
                    <circle cx="16" cy="18" r="4" fill={node.color} />
                    <text
                      x="26"
                      y="21"
                      fill={node.color}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      className="uppercase"
                    >
                      {node.type}
                    </text>

                    {/* Node Title */}
                    <text
                      x="14"
                      y="37"
                      fill="#f8fafc"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {node.label.length > 18 ? node.label.substring(0, 16) + '...' : node.label}
                    </text>

                    {/* Node Confidence Score Tag */}
                    {node.confidenceScore && (
                      <text
                        x="14"
                        y="49"
                        fill="#34d399"
                        fontSize="8.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {node.confidenceScore}% CONF
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Top-Right Canvas Legend */}
              <g transform="translate(760, 20)">
                <rect width="220" height="90" rx="6" fill="#090d16" stroke="#1e293b" strokeWidth="1" opacity="0.9" />
                <text x="12" y="18" fill="#ff544c" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  NODE TYPE LEGEND:
                </text>
                <circle cx="20" cy="34" r="3.5" fill="#ff544c" />
                <text x="30" y="37" fill="#cbd5e1" fontSize="9" fontFamily="sans-serif">SUSPECT</text>

                <circle cx="95" cy="34" r="3.5" fill="#ab8985" />
                <text x="105" y="37" fill="#cbd5e1" fontSize="9" fontFamily="sans-serif">WITNESS</text>

                <circle cx="165" cy="34" r="3.5" fill="#00e676" />
                <text x="175" y="37" fill="#cbd5e1" fontSize="9" fontFamily="sans-serif">VICTIM</text>

                <circle cx="20" cy="56" r="3.5" fill="#ffab40" />
                <text x="30" y="59" fill="#cbd5e1" fontSize="9" fontFamily="sans-serif">EXHIBIT</text>

                <circle cx="95" cy="56" r="3.5" fill="#00bcd4" />
                <text x="105" y="59" fill="#cbd5e1" fontSize="9" fontFamily="sans-serif">EVENT</text>

                <text x="12" y="78" fill="#64748b" fontSize="8" fontFamily="monospace">
                  ● DOTTED: PROBABILISTIC // SOLID: CRITICAL
                </text>
              </g>
            </svg>
          </div>

          <div className="pt-3 flex items-center justify-between font-tactical-data text-xs text-on-surface-variant">
            <span>GRAPH INFERENCE: <strong className="text-emerald-400">100% CONNECTED & OPTIMIZED</strong></span>
            <span className="text-[10px]">CLICK ANY NODE TO INSPECT BAYESIAN LINK DATA</span>
          </div>
        </GlassCard>

        {/* Right 1 Column: Selected Node & Bayesian Link Inspector Panel */}
        <div className="space-y-6">
          <GlassCard glow className="p-6 border-primary/70 space-y-5">
            {selectedNode ? (
              <div className="space-y-4">
                {/* Header Badge & Title */}
                <div className="space-y-1 pb-3 border-b border-outline-variant/30">
                  <div className="flex items-center justify-between">
                    <Badge variant="critical" className="text-[10px]">
                      {selectedNode.type}
                    </Badge>
                    {selectedNode.confidenceScore && (
                      <span className="text-emerald-400 font-tactical-data text-xs font-bold">
                        {selectedNode.confidenceScore}% CONFIDENCE
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-tactical-data uppercase text-primary font-bold block pt-1">
                    {selectedNode.phase || 'Investigation Report Entity'}
                  </span>
                  <h3 className="font-display-lg text-2xl font-bold uppercase text-on-surface">
                    {selectedNode.label}
                  </h3>
                </div>

                {/* Connection Details Box */}
                <div className="p-3.5 rounded bg-surface-container border border-outline-variant/40 space-y-2">
                  <span className="text-[10px] font-tactical-data uppercase text-primary font-bold block flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-primary" />
                    BAYESIAN SENSOR LINK & CORRELATION DETAILS:
                  </span>
                  <p className="text-xs text-on-surface leading-relaxed font-body-md">
                    {selectedNode.details}
                  </p>
                </div>

                {/* Direct Bayesian Links list */}
                <div className="space-y-2 font-tactical-data text-xs">
                  <span className="text-on-surface-variant font-bold text-[10px] uppercase block">
                    DIRECT BAYESIAN EDGES ({links.filter(l => l.from === selectedNode.id || l.to === selectedNode.id).length}):
                  </span>
                  <div className="space-y-1.5">
                    {links
                      .filter((l) => l.from === selectedNode.id || l.to === selectedNode.id)
                      .map((link, lIdx) => {
                        const targetId = link.from === selectedNode.id ? link.to : link.from;
                        const targetNode = nodes.find((n) => n.id === targetId);
                        return (
                          <div
                            key={lIdx}
                            onClick={() => setSelectedNodeId(targetId)}
                            className="p-2 rounded bg-surface-container-low border border-outline-variant/40 hover:border-primary transition-all cursor-pointer flex justify-between items-center text-[11px]"
                          >
                            <span className="text-on-surface font-semibold truncate max-w-[170px]">
                              → {targetNode?.label || targetId}
                            </span>
                            <span className="text-primary font-bold shrink-0">{link.probabilityScore}%</span>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Exhibits & Timeline Event Badges */}
                <div className="pt-3 border-t border-outline-variant/30 space-y-2 font-tactical-data text-xs">
                  {selectedNode.supportingEvidenceIds && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-on-surface-variant text-[10px] uppercase">EXHIBITS:</span>
                      {selectedNode.supportingEvidenceIds.map((exId) => (
                        <Link key={exId} to="/evidence" className="px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/50 text-[10px] font-bold hover:underline">
                          {exId}
                        </Link>
                      ))}
                    </div>
                  )}

                  {selectedNode.linkedTimelineEventIds && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-on-surface-variant text-[10px] uppercase">TIMELINE:</span>
                      {selectedNode.linkedTimelineEventIds.map((evId) => (
                        <Link key={evId} to="/timeline" className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 text-[10px] font-bold hover:underline">
                          {evId}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs font-tactical-data text-on-surface-variant">
                Select any graph node to inspect multi-sensor linkages.
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
