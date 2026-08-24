import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as d3 from 'd3';
import {
  Network,
  ShieldAlert,
  Crown,
  GitFork,
  Zap,
  DollarSign,
  PhoneCall,
  Activity,
  Maximize2,
  Minimize2,
  RefreshCw,
  Search,
  Filter,
  Layers,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  FileText,
  HelpCircle,
  Eye,
  Crosshair,
  TrendingUp,
  Cpu,
  Scissors,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useSuraagStore } from '../store/useSuraagStore';
import { apiClient } from '../services/apiClient';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import {
  NetworkEntityNode,
  NetworkRelationshipLink,
  NetworkEntityRole,
  NetworkLayerChannel,
  SocialNetworkAnalysisPayload
} from '../types';
import {
  getDoomedTriangleSocialNetwork,
  rawDoomedTriangleNodes,
  rawDoomedTriangleLinks
} from '../data/socialNetworkDataset';
import {
  analyzeNetworkCentrality,
  findShortestConduits,
  computeDisruptionImpact
} from '../utils/graphCentrality';

type CentralityMetricType = 'BETWEENNESS' | 'DEGREE' | 'EIGENVECTOR' | 'CLOSENESS' | 'KINGPIN_SCORE';
type ActiveTabType = 'RANKINGS' | 'DISRUPTION_SIMULATOR' | 'CONDUIT_TRACER' | 'AI_REPORT';

export const SocialNetworkAnalysis: React.FC = () => {
  const { selectedCaseId } = useSuraagStore();

  // State Management
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');
  const [activeMetric, setActiveMetric] = useState<CentralityMetricType>('BETWEENNESS');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('CHETANY');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isolatedNodeId, setIsolatedNodeId] = useState<string | null>(null);
  const [conduitSourceId, setConduitSourceId] = useState<string>('DIYA');
  const [conduitTargetId, setConduitTargetId] = useState<string>('VIKRAM');
  const [activeTab, setActiveTab] = useState<ActiveTabType>('RANKINGS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPhysicsRunning, setIsPhysicsRunning] = useState<boolean>(true);
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);

  // SVG ref for D3 Force Layout
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Load dataset (grounded in Doomed Triangle)
  const networkData: SocialNetworkAnalysisPayload = useMemo(() => {
    return getDoomedTriangleSocialNetwork();
  }, []);

  // Filtered links and nodes based on channel & isolation simulation
  const { activeNodes, activeLinks, topology } = useMemo(() => {
    let filteredLinks = networkData.links;

    if (selectedChannel !== 'ALL') {
      filteredLinks = filteredLinks.filter((l) => l.channel === selectedChannel);
    }

    if (isolatedNodeId) {
      filteredLinks = filteredLinks.filter(
        (l) =>
          (typeof l.source === 'object' ? (l.source as any).id : l.source) !== isolatedNodeId &&
          (typeof l.target === 'object' ? (l.target as any).id : l.target) !== isolatedNodeId
      );
    }

    // Recompute centrality metrics dynamically for current graph state
    const { nodesWithCentrality, topology: currentTopology } = analyzeNetworkCentrality(
      networkData.nodes,
      filteredLinks
    );

    return {
      activeNodes: nodesWithCentrality,
      activeLinks: filteredLinks,
      topology: currentTopology
    };
  }, [networkData, selectedChannel, isolatedNodeId]);

  // Selected Node Details
  const selectedNode = useMemo(() => {
    return activeNodes.find((n) => n.id === selectedNodeId) || activeNodes[0];
  }, [activeNodes, selectedNodeId]);

  // Conduit paths between source & target
  const conduitResult = useMemo(() => {
    if (!conduitSourceId || !conduitTargetId || conduitSourceId === conduitTargetId) {
      return null;
    }
    return findShortestConduits(conduitSourceId, conduitTargetId, activeNodes, activeLinks);
  }, [conduitSourceId, conduitTargetId, activeNodes, activeLinks]);

  // Disruption Impact simulation stats if a node is isolated
  const disruptionResult = useMemo(() => {
    if (!isolatedNodeId) return null;
    const nodeObj = networkData.nodes.find((n) => n.id === isolatedNodeId);
    const nodeIds = networkData.nodes.map((n) => n.id);
    const simpleLinks = networkData.links.map((l) => ({
      source: typeof l.source === 'object' ? (l.source as any).id : l.source,
      target: typeof l.target === 'object' ? (l.target as any).id : l.target
    }));
    const impact = computeDisruptionImpact(isolatedNodeId, nodeIds, simpleLinks);
    return {
      nodeObj,
      ...impact
    };
  }, [isolatedNodeId, networkData]);

  // D3 Force Simulation Setup
  const [simNodes, setSimNodes] = useState<any[]>([]);
  const [simLinks, setSimLinks] = useState<any[]>([]);

  useEffect(() => {
    // Clone nodes and links for D3 simulation
    const nodesCopy = activeNodes.map((n) => ({ ...n }));
    const linksCopy = activeLinks.map((l) => ({
      ...l,
      source: typeof l.source === 'object' ? (l.source as any).id : l.source,
      target: typeof l.target === 'object' ? (l.target as any).id : l.target
    }));

    const width = 900;
    const height = 620;

    const simulation = d3
      .forceSimulation(nodesCopy)
      .force(
        'link',
        d3
          .forceLink(linksCopy)
          .id((d: any) => d.id)
          .distance((d: any) => (d.weight ? 180 - d.weight * 7 : 140))
      )
      .force('charge', d3.forceManyBody().strength(-480))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(45).iterations(2))
      .alphaDecay(0.02);

    simulation.on('tick', () => {
      setSimNodes([...nodesCopy]);
      setSimLinks([...linksCopy]);
    });

    if (!isPhysicsRunning) {
      simulation.stop();
    }

    return () => {
      simulation.stop();
    };
  }, [activeNodes, activeLinks, isPhysicsRunning]);

  // D3 Zoom Setup
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 3])
      .on('zoom', (event) => {
        setZoomTransform(event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);
  }, []);

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.25);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.8);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(400).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  // Helper function to get node radius based on active centrality metric
  const getNodeRadius = (node: NetworkEntityNode) => {
    const base = 24;
    if (!node.centrality) return base;

    switch (activeMetric) {
      case 'BETWEENNESS':
        return base + node.centrality.betweennessCentrality * 35;
      case 'DEGREE':
        return base + (node.centrality.totalDegree / 8) * 22;
      case 'EIGENVECTOR':
        return base + node.centrality.eigenvectorCentrality * 30;
      case 'CLOSENESS':
        return base + node.centrality.closenessCentrality * 25;
      case 'KINGPIN_SCORE':
        return base + (node.centrality.kingpinScore / 100) * 32;
      default:
        return base;
    }
  };

  // Helper function for channel badge colors
  const getChannelColor = (channel: NetworkLayerChannel) => {
    switch (channel) {
      case 'FINANCIAL':
        return '#ffd700'; // Gold
      case 'COMMUNICATION':
        return '#00e5ff'; // Cyan
      case 'OPERATIONAL':
        return '#ff1744'; // Crimson
      case 'SURVEILLANCE_WITNESS':
        return '#ff9100'; // Amber
      case 'FORENSIC':
        return '#00e676'; // Emerald
      default:
        return '#90caf9';
    }
  };

  // Helper for role icon & badge
  const getRoleIcon = (role: NetworkEntityRole) => {
    switch (role) {
      case 'KINGPIN':
        return <Crown className="w-3.5 h-3.5 text-amber-400" />;
      case 'INTERMEDIARY':
        return <GitFork className="w-3.5 h-3.5 text-primary" />;
      case 'OPERATIVE':
        return <Zap className="w-3.5 h-3.5 text-orange-400" />;
      case 'FACILITATOR':
        return <Cpu className="w-3.5 h-3.5 text-purple-400" />;
      case 'FINANCIAL_CONDUIT':
        return <DollarSign className="w-3.5 h-3.5 text-yellow-400" />;
      case 'VICTIM':
        return <Crosshair className="w-3.5 h-3.5 text-emerald-400" />;
      case 'WITNESS':
        return <Eye className="w-3.5 h-3.5 text-teal-400" />;
      case 'INVESTIGATOR':
        return <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  // Check if a link is part of active conduit path
  const isLinkInConduit = (link: any) => {
    if (!conduitResult || conduitResult.shortestPaths.length === 0) return false;
    const s = typeof link.source === 'object' ? link.source.id : link.source;
    const t = typeof link.target === 'object' ? link.target.id : link.target;

    for (const path of conduitResult.shortestPaths) {
      for (let i = 0; i < path.length - 1; i++) {
        if ((path[i] === s && path[i + 1] === t) || (path[i] === t && path[i + 1] === s)) {
          return true;
        }
      }
    }
    return false;
  };

  // Check if a node is in active conduit
  const isNodeInConduit = (nodeId: string) => {
    if (!conduitResult) return false;
    return conduitResult.shortestPaths.some((p) => p.includes(nodeId));
  };

  return (
    <div className="space-y-6 pb-16">
      {/* ========================================================================= */}
      {/* 1. TOP TACTICAL TITLE & TELEMETRY HUD                                     */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-variant/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Network className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              SOCIAL NETWORK ANALYSIS // KEY INFLUENCER & CONDUIT DETECTION ENGINE
            </span>
            <span className="px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/40 text-[10px] font-tactical-data font-bold">
              BRANDES ALGORITHM (2001)
            </span>
          </div>
          <h1 className="font-display-lg text-3xl md:text-4xl font-bold uppercase tracking-tight text-on-surface flex items-center gap-3">
            Syndicate Social Network Analysis
            <span className="text-sm font-tactical-data text-on-surface-variant font-normal tracking-normal border-l border-outline-variant/60 pl-3">
              CASE-2026-DT01: The Doomed Triangle
            </span>
          </h1>
        </div>

        {/* Global Network Telemetry Chips */}
        <div className="flex flex-wrap items-center gap-2 font-tactical-data text-xs">
          <div className="px-3 py-2 rounded bg-surface-container-high border border-outline-variant/50 flex flex-col">
            <span className="text-[10px] text-on-surface-variant uppercase">Global Nodes</span>
            <span className="text-sm font-bold text-on-surface">{topology.nodeCount} Entities</span>
          </div>
          <div className="px-3 py-2 rounded bg-surface-container-high border border-outline-variant/50 flex flex-col">
            <span className="text-[10px] text-on-surface-variant uppercase">Active Conduits</span>
            <span className="text-sm font-bold text-primary">{topology.edgeCount} Links</span>
          </div>
          <div className="px-3 py-2 rounded bg-surface-container-high border border-outline-variant/50 flex flex-col">
            <span className="text-[10px] text-on-surface-variant uppercase">Graph Density</span>
            <span className="text-sm font-bold text-on-surface">{(topology.graphDensity * 100).toFixed(1)}%</span>
          </div>
          <div className="px-3 py-2 rounded bg-surface-container-high border border-outline-variant/50 flex flex-col">
            <span className="text-[10px] text-on-surface-variant uppercase">Centralization</span>
            <span className="text-sm font-bold text-amber-400">
              {(topology.betweennessCentralization * 100).toFixed(1)}% ($C_B$)
            </span>
          </div>
          <div className="px-3 py-2 rounded bg-secondary-container/80 border border-primary/60 flex flex-col shadow-[0_0_12px_rgba(255,84,76,0.3)]">
            <span className="text-[10px] text-primary uppercase font-bold">Vulnerability Rating</span>
            <span className="text-sm font-bold text-primary">{topology.vulnerabilityIndex}/100 [HIGH SPOF]</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FILTER & METRIC CONTROLS BAR                                           */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-3 rounded-lg bg-surface-container border border-outline-variant/40">
        {/* Layer Channel Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-tactical-data text-on-surface-variant mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-primary" /> LAYER:
          </span>
          {[
            { id: 'ALL', label: 'All Layers (45)' },
            { id: 'COMMUNICATION', label: 'VoIP / Calls', color: '#00e5ff' },
            { id: 'FINANCIAL', label: 'Financial / RTGS', color: '#ffd700' },
            { id: 'OPERATIONAL', label: 'Assault / Weapons', color: '#ff1744' },
            { id: 'FORENSIC', label: 'DNA / Ballistics', color: '#00e676' },
            { id: 'SURVEILLANCE_WITNESS', label: 'Eyewitness / CCTV', color: '#ff9100' }
          ].map((chan) => (
            <button
              key={chan.id}
              onClick={() => setSelectedChannel(chan.id)}
              className={`px-3 py-1 rounded text-xs font-tactical-data transition-all uppercase tracking-wider flex items-center gap-1.5 ${
                selectedChannel === chan.id
                  ? 'bg-primary text-on-primary font-bold shadow-[0_0_10px_rgba(255,84,76,0.4)]'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
              }`}
            >
              {chan.color && (
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: chan.color }} />
              )}
              {chan.label}
            </button>
          ))}
        </div>

        {/* Centrality Metric Sizing Switcher */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-tactical-data text-on-surface-variant mr-1 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-amber-400" /> SIZING METRIC:
          </span>
          {[
            { id: 'BETWEENNESS', label: 'Betweenness (Intermediaries)' },
            { id: 'KINGPIN_SCORE', label: 'Kingpin Index' },
            { id: 'DEGREE', label: 'Degree (Links)' },
            { id: 'EIGENVECTOR', label: 'Eigenvector' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMetric(m.id as CentralityMetricType)}
              className={`px-2.5 py-1 rounded text-xs font-tactical-data transition-all ${
                activeMetric === m.id
                  ? 'bg-secondary-container text-primary border border-primary/80 font-bold'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN WORKSPACE: GRAPH VISUALIZER (LEFT) + DOSSIER / TOOL PANEL (RIGHT) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Force-Directed Network Graph Visualizer */}
        <div className="xl:col-span-2 space-y-3">
          <GlassCard className="relative overflow-hidden p-0 border border-outline-variant/50 shadow-2xl bg-surface-container-lowest/90">
            {/* Canvas Header & Interactive Controls */}
            <div className="p-3.5 border-b border-outline-variant/40 bg-surface-container/60 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-tactical-data font-bold text-on-surface uppercase tracking-wider">
                  TACTICAL TOPOLOGY VIEW // {activeNodes.length} NODES & {activeLinks.length} CHANNELS
                </span>
                {isolatedNodeId && (
                  <Badge variant="critical" pulse className="ml-2">
                    NODE ISOLATED: {isolatedNodeId}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPhysicsRunning(!isPhysicsRunning)}
                  className={`px-2.5 py-1 rounded text-xs font-tactical-data flex items-center gap-1.5 transition-colors ${
                    isPhysicsRunning
                      ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/50'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                  title="Toggle Force Physics Simulation"
                >
                  <RefreshCw className={`w-3 h-3 ${isPhysicsRunning ? 'animate-spin' : ''}`} />
                  {isPhysicsRunning ? 'Physics: LIVE' : 'Physics: FROZEN'}
                </button>
                <div className="flex items-center bg-surface-container-high rounded border border-outline-variant/40">
                  <button
                    onClick={handleZoomIn}
                    className="p-1.5 hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
                    title="Zoom In"
                  >
                    +
                  </button>
                  <button
                    onClick={handleZoomOut}
                    className="p-1.5 hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
                    title="Zoom Out"
                  >
                    -
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="px-2 py-1 text-[10px] font-tactical-data hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface border-l border-outline-variant/40"
                    title="Reset Zoom & Pan"
                  >
                    RESET
                  </button>
                </div>
              </div>
            </div>

            {/* SVG Graph Viewport */}
            <div className="relative w-full h-[580px] bg-gradient-to-b from-[#090b10] via-[#0d1117] to-[#090b10] cursor-grab active:cursor-grabbing">
              {/* Tactical Grid Background */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle, #ff544c 1px, transparent 1px)`,
                  backgroundSize: '24px 24px'
                }}
              />

              <svg
                ref={svgRef}
                className="w-full h-full"
                viewBox="0 0 900 620"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Glowing Halos for Kingpins & Intermediaries */}
                  <filter id="glow-crimson" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Marker Arrows */}
                  <marker
                    id="arrowhead-crit"
                    markerWidth="8"
                    markerHeight="8"
                    refX="22"
                    refY="4"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 4, 0 8" fill="#ff544c" />
                  </marker>
                  <marker
                    id="arrowhead-gold"
                    markerWidth="8"
                    markerHeight="8"
                    refX="22"
                    refY="4"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 4, 0 8" fill="#ffd700" />
                  </marker>
                  <marker
                    id="arrowhead-cyan"
                    markerWidth="8"
                    markerHeight="8"
                    refX="22"
                    refY="4"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 4, 0 8" fill="#00e5ff" />
                  </marker>
                </defs>

                <g transform={`translate(${zoomTransform.x}, ${zoomTransform.y}) scale(${zoomTransform.k})`}>
                  {/* Graph Links */}
                  {simLinks.map((link, idx) => {
                    const s = typeof link.source === 'object' ? link.source : { x: 400, y: 300, id: link.source };
                    const t = typeof link.target === 'object' ? link.target : { x: 500, y: 300, id: link.target };
                    const isConduit = isLinkInConduit(link);
                    const isHovered = hoveredNodeId === s.id || hoveredNodeId === t.id;
                    const strokeColor = isConduit
                      ? '#00e5ff'
                      : isHovered
                      ? '#ff544c'
                      : getChannelColor(link.channel);

                    return (
                      <g key={link.id || idx} className="transition-all duration-300">
                        {/* Link Path Line */}
                        <line
                          x1={s.x || 400}
                          y1={s.y || 300}
                          x2={t.x || 500}
                          y2={t.y || 300}
                          stroke={strokeColor}
                          strokeWidth={isConduit ? 3.5 : isHovered ? 2.5 : Math.max(1.2, (link.weight || 5) / 3)}
                          strokeOpacity={isConduit ? 1.0 : isHovered ? 0.9 : 0.45}
                          strokeDasharray={link.channel === 'COMMUNICATION' ? '4 3' : undefined}
                          filter={isConduit ? 'url(#glow-cyan)' : undefined}
                        />

                        {/* Animated Particle Indicator on Critical Conduits */}
                        {link.isCriticalConduit && (
                          <circle r={isConduit ? 3.5 : 2.5} fill={strokeColor} opacity={0.9}>
                            <animateMotion
                              path={`M ${s.x || 400} ${s.y || 300} L ${t.x || 500} ${t.y || 300}`}
                              dur={`${Math.max(1.5, 3.5 - (link.weight || 5) * 0.2)}s`}
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}
                      </g>
                    );
                  })}

                  {/* Graph Nodes */}
                  {simNodes.map((node) => {
                    const radius = getNodeRadius(node);
                    const isSelected = selectedNodeId === node.id;
                    const isHovered = hoveredNodeId === node.id;
                    const inConduit = isNodeInConduit(node.id);
                    const isKingpin = node.role === 'KINGPIN';
                    const isIntermediary = node.role === 'INTERMEDIARY';

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x || 450}, ${node.y || 300})`}
                        onClick={() => setSelectedNodeId(node.id)}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        className="cursor-pointer group select-none"
                      >
                        {/* Outer Pulsing Tactical Ring for Kingpins & Intermediaries */}
                        {(isKingpin || isIntermediary) && (
                          <circle
                            r={radius + 12}
                            fill="none"
                            stroke={isKingpin ? '#ff544c' : '#ff9100'}
                            strokeWidth="1.5"
                            strokeDasharray="4 2"
                            opacity={0.7}
                            className="animate-spin"
                            style={{ transformOrigin: 'center', animationDuration: '12s' }}
                          />
                        )}

                        {/* Selection & Conduit Glow Ring */}
                        {(isSelected || inConduit) && (
                          <circle
                            r={radius + 7}
                            fill="none"
                            stroke={isSelected ? '#ff544c' : '#00e5ff'}
                            strokeWidth="2"
                            filter={isSelected ? 'url(#glow-crimson)' : 'url(#glow-cyan)'}
                            opacity={0.9}
                          />
                        )}

                        {/* Main Node Circle */}
                        <circle
                          r={radius}
                          fill={node.color || '#263238'}
                          fillOpacity={0.85}
                          stroke={isSelected ? '#ffffff' : '#37474f'}
                          strokeWidth={isSelected ? 2.5 : 1.5}
                          className="transition-all duration-200"
                        />

                        {/* Node Label Initials */}
                        <text
                          textAnchor="middle"
                          dy=".35em"
                          fill="#ffffff"
                          fontSize={radius > 32 ? '14px' : '11px'}
                          fontWeight="bold"
                          fontFamily="monospace"
                          pointerEvents="none"
                        >
                          {node.avatarInitials}
                        </text>

                        {/* Crown/Broker Icon Badge on top of node */}
                        {isKingpin && (
                          <g transform={`translate(0, ${-radius - 8})`}>
                            <circle r="8" fill="#1e1e24" stroke="#ffd700" strokeWidth="1" />
                            <text
                              textAnchor="middle"
                              dy=".35em"
                              fontSize="9px"
                              fill="#ffd700"
                              fontWeight="bold"
                            >
                              👑
                            </text>
                          </g>
                        )}
                        {isIntermediary && (
                          <g transform={`translate(0, ${-radius - 8})`}>
                            <circle r="8" fill="#1e1e24" stroke="#ff544c" strokeWidth="1" />
                            <text
                              textAnchor="middle"
                              dy=".35em"
                              fontSize="9px"
                              fill="#ff544c"
                              fontWeight="bold"
                            >
                              🔀
                            </text>
                          </g>
                        )}

                        {/* Node Text Label Underneath */}
                        <g transform={`translate(0, ${radius + 14})`}>
                          <rect
                            x={-node.label.length * 3.8 - 4}
                            y="-9"
                            width={node.label.length * 7.6 + 8}
                            height="18"
                            rx="3"
                            fill="#0d1117"
                            fillOpacity="0.85"
                            stroke="#30363d"
                            strokeWidth="0.8"
                          />
                          <text
                            textAnchor="middle"
                            dy=".3em"
                            fill={isSelected ? '#ff544c' : inConduit ? '#00e5ff' : '#e6edf3'}
                            fontSize="10px"
                            fontFamily="monospace"
                            fontWeight={isSelected ? 'bold' : 'normal'}
                          >
                            {node.label}
                          </text>
                        </g>

                        {/* Centrality Metric Tag Below Name */}
                        <g transform={`translate(0, ${radius + 32})`}>
                          <text
                            textAnchor="middle"
                            fill="#8b949e"
                            fontSize="8.5px"
                            fontFamily="monospace"
                          >
                            {activeMetric === 'BETWEENNESS' &&
                              `$C_B$: ${(node.centrality?.betweennessCentrality || 0).toFixed(3)}`}
                            {activeMetric === 'KINGPIN_SCORE' &&
                              `Kingpin: ${node.centrality?.kingpinScore}/100`}
                            {activeMetric === 'DEGREE' &&
                              `Deg: ${node.centrality?.totalDegree} links`}
                            {activeMetric === 'EIGENVECTOR' &&
                              `Eig: ${(node.centrality?.eigenvectorCentrality || 0).toFixed(3)}`}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* Bottom Canvas Legend */}
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 p-2 rounded bg-surface/90 backdrop-blur-md border border-outline-variant/40 text-[11px] font-tactical-data text-on-surface-variant">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-on-surface">ROLE LEGEND:</span>
                  <span className="flex items-center gap-1 text-primary font-bold">
                    <Crown className="w-3 h-3 text-amber-400" /> Kingpin (Mastermind)
                  </span>
                  <span className="flex items-center gap-1 text-orange-400 font-bold">
                    <GitFork className="w-3 h-3 text-primary" /> Intermediary / Broker
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <Zap className="w-3 h-3" /> Operative
                  </span>
                  <span className="flex items-center gap-1 text-purple-400">
                    <Cpu className="w-3 h-3" /> Facilitator
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Crosshair className="w-3 h-3" /> Victim
                  </span>
                  <span className="flex items-center gap-1 text-teal-400">
                    <Eye className="w-3 h-3" /> Witness
                  </span>
                </div>
                <div className="text-[10px] text-on-surface-variant/80">
                  CLICK NODE TO INSPECT DOSSIER // DRAG OR ZOOM CANVAS
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Quick Tactical Conduit Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-lg bg-surface-container border border-outline-variant/40 flex items-start gap-3">
              <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-tactical-data uppercase text-amber-400 font-bold">
                  KINGPIN IDENTIFIED
                </div>
                <div className="text-sm font-bold text-on-surface">Diya Gupta (SUS-01)</div>
                <div className="text-xs text-on-surface-variant font-tactical-data mt-0.5">
                  Eigenvector: 1.000 | ₹45M Insured Policy Motive
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-surface-container border border-outline-variant/40 flex items-start gap-3">
              <div className="p-2 rounded bg-primary/10 border border-primary/30 text-primary">
                <GitFork className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-tactical-data uppercase text-primary font-bold">
                  PRIMARY INTERMEDIARY (SPOF)
                </div>
                <div className="text-sm font-bold text-on-surface">Chetany Sharma (SUS-02)</div>
                <div className="text-xs text-on-surface-variant font-tactical-data mt-0.5">
                  $C_B$: 0.5841 | Severs 88% of street conduits
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-surface-container border border-outline-variant/40 flex items-start gap-3">
              <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-tactical-data uppercase text-cyan-400 font-bold">
                  HIRED OPERATIVE
                </div>
                <div className="text-sm font-bold text-on-surface">Vikram Rathod (SUS-03)</div>
                <div className="text-xs text-on-surface-variant font-tactical-data mt-0.5">
                  ₹6,000,000 RTGS Wire (Attempt 3 Collision)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Deep-Dive Node Dossier & Inspector */}
        <div className="space-y-4">
          <GlassCard className="p-5 border border-outline-variant/50 space-y-5 bg-surface-container/70">
            {/* Header with Role Badge */}
            <div className="flex items-start justify-between gap-3 border-b border-outline-variant/40 pb-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  {getRoleIcon(selectedNode.role)}
                  <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-wider">
                    {selectedNode.role} DOSSIER
                  </span>
                </div>
                <h3 className="font-display-lg text-2xl font-bold text-on-surface">
                  {selectedNode.name}
                </h3>
                <p className="text-xs text-on-surface-variant font-tactical-data">
                  {selectedNode.organizationOrFaction}
                </p>
              </div>

              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg font-tactical-data border"
                style={{
                  backgroundColor: `${selectedNode.color}20`,
                  borderColor: selectedNode.color,
                  color: selectedNode.color
                }}
              >
                {selectedNode.avatarInitials}
              </div>
            </div>

            {/* Centrality Scorecard Radar / Grid */}
            <div className="space-y-3">
              <div className="text-xs font-tactical-data text-on-surface-variant uppercase font-bold tracking-wider flex items-center justify-between">
                <span>GRAPH CENTRALITY PROFILE</span>
                <span className="text-primary">{selectedNode.centrality?.structuralRoleTitle}</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 font-tactical-data text-xs">
                <div className="p-2.5 rounded bg-surface-container-high border border-outline-variant/40">
                  <div className="text-[10px] text-on-surface-variant uppercase">Betweenness ($C_B$)</div>
                  <div className="text-base font-bold text-primary">
                    {(selectedNode.centrality?.betweennessCentrality || 0).toFixed(4)}
                  </div>
                  <div className="w-full bg-surface-container-lowest h-1 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (selectedNode.centrality?.betweennessCentrality || 0) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded bg-surface-container-high border border-outline-variant/40">
                  <div className="text-[10px] text-on-surface-variant uppercase">Kingpin Index</div>
                  <div className="text-base font-bold text-amber-400">
                    {selectedNode.centrality?.kingpinScore}/100
                  </div>
                  <div className="w-full bg-surface-container-lowest h-1 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full"
                      style={{ width: `${selectedNode.centrality?.kingpinScore || 0}%` }}
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded bg-surface-container-high border border-outline-variant/40">
                  <div className="text-[10px] text-on-surface-variant uppercase">Total Degree ($C_D$)</div>
                  <div className="text-base font-bold text-on-surface">
                    {selectedNode.centrality?.totalDegree} Channels
                  </div>
                  <div className="text-[10px] text-on-surface-variant mt-0.5">
                    In: {selectedNode.centrality?.inDegree} | Out: {selectedNode.centrality?.outDegree}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-surface-container-high border border-outline-variant/40">
                  <div className="text-[10px] text-on-surface-variant uppercase">Eigenvector ($C_E$)</div>
                  <div className="text-base font-bold text-cyan-400">
                    {(selectedNode.centrality?.eigenvectorCentrality || 0).toFixed(3)}
                  </div>
                  <div className="text-[10px] text-on-surface-variant mt-0.5">
                    Closeness: {(selectedNode.centrality?.closenessCentrality || 0).toFixed(3)}
                  </div>
                </div>
              </div>
            </div>

            {/* Description & Intelligence Narrative */}
            <div className="space-y-2">
              <div className="text-xs font-tactical-data text-on-surface-variant uppercase font-bold tracking-wider">
                INTELLIGENCE NARRATIVE
              </div>
              <p className="text-xs text-on-surface/90 leading-relaxed bg-surface-container-high/50 p-3 rounded border border-outline-variant/30 font-body-sm">
                {selectedNode.description}
              </p>
            </div>

            {/* Financial & Comms Telemetry */}
            <div className="p-3 rounded bg-surface-container-high/70 border border-outline-variant/40 space-y-2 text-xs font-tactical-data">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" /> FINANCIAL FOOTPRINT:
                </span>
                <span className="font-bold text-amber-400">
                  {selectedNode.financialVolumeInr
                    ? `₹${selectedNode.financialVolumeInr.toLocaleString('en-IN')}`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5 text-cyan-400" /> COMMS IDENTIFIER:
                </span>
                <span className="font-mono text-[11px] text-on-surface truncate max-w-[180px]">
                  {selectedNode.phoneOrHandle || 'Undisclosed Burner'}
                </span>
              </div>
            </div>

            {/* Operational Phases Involved */}
            <div className="space-y-1.5">
              <div className="text-xs font-tactical-data text-on-surface-variant uppercase font-bold tracking-wider">
                CRIMINAL ATTEMPT PHASES
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.operationalPhases.map((phase, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface text-[11px] font-tactical-data border border-outline-variant/40"
                  >
                    {phase}
                  </span>
                ))}
              </div>
            </div>

            {/* Linked Forensic Evidence Exhibits */}
            <div className="space-y-1.5">
              <div className="text-xs font-tactical-data text-on-surface-variant uppercase font-bold tracking-wider">
                LINKED FORENSIC EXHIBITS
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.directEvidenceIds.map((evId) => (
                  <span
                    key={evId}
                    className="px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/40 font-tactical-data text-[11px] font-bold"
                  >
                    {evId}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons: Isolate Node / Set as Conduit Endpoints */}
            <div className="pt-2 border-t border-outline-variant/40 flex flex-col gap-2 font-tactical-data text-xs">
              <button
                onClick={() => {
                  if (isolatedNodeId === selectedNode.id) {
                    setIsolatedNodeId(null);
                  } else {
                    setIsolatedNodeId(selectedNode.id);
                  }
                }}
                className={`w-full py-2.5 rounded font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  isolatedNodeId === selectedNode.id
                    ? 'bg-amber-600 text-on-primary hover:bg-amber-700'
                    : 'bg-secondary-container text-primary border border-primary/80 hover:bg-primary hover:text-on-primary'
                }`}
              >
                <Scissors className="w-4 h-4" />
                {isolatedNodeId === selectedNode.id
                  ? 'RESTORE ISOLATED NODE'
                  : `SIMULATE ARREST / ISOLATION OF ${selectedNode.avatarInitials}`}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setConduitSourceId(selectedNode.id);
                    setActiveTab('CONDUIT_TRACER');
                  }}
                  className="py-2 px-3 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-[11px] border border-outline-variant/40 flex items-center justify-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-cyan-400" /> SET AS SOURCE
                </button>
                <button
                  onClick={() => {
                    setConduitTargetId(selectedNode.id);
                    setActiveTab('CONDUIT_TRACER');
                  }}
                  className="py-2 px-3 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-[11px] border border-outline-variant/40 flex items-center justify-center gap-1.5"
                >
                  <Crosshair className="w-3 h-3 text-primary" /> SET AS TARGET
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. LOWER ANALYSIS SUITE: TABS (RANKINGS / DISRUPTION / CONDUITS / REPORT)  */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-outline-variant/50 gap-2 overflow-x-auto">
          {[
            { id: 'RANKINGS', label: '👑 Key Influencer Detection Matrix', icon: Crown },
            { id: 'DISRUPTION_SIMULATOR', label: '✂️ What-If Network Disruption Simulator', icon: Scissors },
            { id: 'CONDUIT_TRACER', label: '⚡ Multi-Hop Conduit & Financial Tracer', icon: GitFork },
            { id: 'AI_REPORT', label: '📋 AI Strategic Syndicate Assessment', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTabType)}
                className={`pb-3 pt-2 px-4 font-tactical-data text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-primary text-primary bg-surface-container/40 rounded-t'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Key Influencer Rankings Matrix */}
        {activeTab === 'RANKINGS' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Kingpins Ranking Card */}
              <GlassCard className="p-4 border border-outline-variant/40 space-y-3 bg-surface-container/60">
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <h4 className="font-tactical-data text-xs uppercase font-bold text-on-surface tracking-wider">
                      KINGPINS & STRATEGIC MASTERMINDS (BY EIGENVECTOR & FINANCIAL COMMAND)
                    </h4>
                  </div>
                  <Badge variant="confidence">EIGENVECTOR RANKED</Badge>
                </div>

                <div className="space-y-2.5">
                  {networkData.kingpins.map((kp) => (
                    <div
                      key={kp.entityId}
                      onClick={() => setSelectedNodeId(kp.entityId)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        selectedNodeId === kp.entityId
                          ? 'bg-secondary-container/90 border-primary shadow-[0_0_12px_rgba(255,84,76,0.3)]'
                          : 'bg-surface-container-high/60 border-outline-variant/40 hover:bg-surface-container-high'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-amber-400/20 text-amber-400 font-tactical-data text-xs font-bold flex items-center justify-center">
                            #{kp.rank}
                          </span>
                          <span className="font-bold text-sm text-on-surface">{kp.name}</span>
                        </div>
                        <span className="font-tactical-data text-xs text-amber-400 font-bold">
                          Index: {kp.score}/100
                        </span>
                      </div>
                      <div className="text-[11px] font-tactical-data text-on-surface-variant mb-1.5">
                        {kp.primaryMetric}
                      </div>
                      <p className="text-xs text-on-surface-variant font-body-sm line-clamp-2">
                        {kp.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Intermediaries Ranking Card */}
              <GlassCard className="p-4 border border-outline-variant/40 space-y-3 bg-surface-container/60">
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2.5">
                  <div className="flex items-center gap-2">
                    <GitFork className="w-4 h-4 text-primary" />
                    <h4 className="font-tactical-data text-xs uppercase font-bold text-on-surface tracking-wider">
                      CRITICAL INTERMEDIARIES & BROKERS (BY BRANDES BETWEENNESS CENTRALITY)
                    </h4>
                  </div>
                  <Badge variant="critical">SPOF CHOKE-POINTS</Badge>
                </div>

                <div className="space-y-2.5">
                  {networkData.intermediaries.map((inter) => (
                    <div
                      key={inter.entityId}
                      onClick={() => setSelectedNodeId(inter.entityId)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        selectedNodeId === inter.entityId
                          ? 'bg-secondary-container/90 border-primary shadow-[0_0_12px_rgba(255,84,76,0.3)]'
                          : 'bg-surface-container-high/60 border-outline-variant/40 hover:bg-surface-container-high'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-primary/20 text-primary font-tactical-data text-xs font-bold flex items-center justify-center">
                            #{inter.rank}
                          </span>
                          <span className="font-bold text-sm text-on-surface">{inter.name}</span>
                        </div>
                        <span className="font-tactical-data text-xs text-primary font-bold">
                          Impact: {inter.score}%
                        </span>
                      </div>
                      <div className="text-[11px] font-tactical-data text-on-surface-variant mb-1.5">
                        {inter.primaryMetric}
                      </div>
                      <p className="text-xs text-on-surface-variant font-body-sm line-clamp-2">
                        {inter.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Complete Mathematical Centrality Matrix Table */}
            <GlassCard className="p-4 border border-outline-variant/40 space-y-3 bg-surface-container/60 overflow-x-auto">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2.5">
                <h4 className="font-tactical-data text-xs uppercase font-bold text-on-surface tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" /> COMPLETE MATHEMATICAL GRAPH CENTRALITY MATRIX
                </h4>
                <div className="text-[11px] font-tactical-data text-on-surface-variant">
                  TOTAL {activeNodes.length} NODES AUDITED
                </div>
              </div>

              <table className="w-full text-left font-tactical-data text-xs">
                <thead>
                  <tr className="border-b border-outline-variant/40 text-on-surface-variant text-[11px]">
                    <th className="py-2.5 px-3">ENTITY ID / NAME</th>
                    <th className="py-2.5 px-2">ROLE</th>
                    <th className="py-2.5 px-2">BETWEENNESS ($C_B$)</th>
                    <th className="py-2.5 px-2">DEGREE ($C_D$)</th>
                    <th className="py-2.5 px-2">EIGENVECTOR ($C_E$)</th>
                    <th className="py-2.5 px-2">BURT'S CONSTRAINT</th>
                    <th className="py-2.5 px-2">KINGPIN SCORE</th>
                    <th className="py-2.5 px-2">DISRUPTION IMPACT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {activeNodes.map((n) => (
                    <tr
                      key={n.id}
                      onClick={() => setSelectedNodeId(n.id)}
                      className={`cursor-pointer transition-colors ${
                        selectedNodeId === n.id ? 'bg-secondary-container/80 font-bold' : 'hover:bg-surface-container-high'
                      }`}
                    >
                      <td className="py-2.5 px-3 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: n.color }}
                        />
                        <span className="text-on-surface font-semibold">{n.name}</span>
                        <span className="text-[10px] text-on-surface-variant">({n.id})</span>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className="px-2 py-0.5 rounded bg-surface-container-highest text-[10px] uppercase">
                          {n.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 font-bold text-primary">
                        {(n.centrality?.betweennessCentrality || 0).toFixed(4)}
                      </td>
                      <td className="py-2.5 px-2 text-on-surface">
                        {n.centrality?.totalDegree} ({n.centrality?.inDegree}in/{n.centrality?.outDegree}out)
                      </td>
                      <td className="py-2.5 px-2 text-cyan-400">
                        {(n.centrality?.eigenvectorCentrality || 0).toFixed(3)}
                      </td>
                      <td className="py-2.5 px-2 text-on-surface-variant">
                        {(n.centrality?.burtsConstraint || 0).toFixed(3)}
                      </td>
                      <td className="py-2.5 px-2 text-amber-400 font-bold">
                        {n.centrality?.kingpinScore}/100
                      </td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            (n.centrality?.disruptionImpactPct || 0) > 70
                              ? 'bg-red-900/40 text-red-300 border border-red-500/50'
                              : 'bg-surface-container-high text-on-surface-variant'
                          }`}
                        >
                          {n.centrality?.disruptionImpactPct}% SEVERANCE
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlassCard>
          </div>
        )}

        {/* Tab 2: What-If Network Disruption Simulator */}
        {activeTab === 'DISRUPTION_SIMULATOR' && (
          <GlassCard className="p-5 border border-outline-variant/40 space-y-5 bg-surface-container/60">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-outline-variant/30 pb-3">
              <div>
                <h4 className="font-tactical-data text-sm uppercase font-bold text-primary flex items-center gap-2">
                  <Scissors className="w-4 h-4" /> WHAT-IF NETWORK ISOLATION & ARREST SIMULATOR
                </h4>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Simulate the kinetic or legal neutralization of any entity to measure real-time syndicate fragmentation.
                </p>
              </div>

              {isolatedNodeId && (
                <button
                  onClick={() => setIsolatedNodeId(null)}
                  className="px-3 py-1.5 rounded bg-surface-container-highest hover:bg-surface-container text-xs font-tactical-data uppercase text-on-surface transition-colors"
                >
                  RESTORE FULL NETWORK
                </button>
              )}
            </div>

            {/* Quick Entity Picker for Isolation */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-tactical-data text-on-surface-variant mr-1">
                SELECT TARGET TO ISOLATE:
              </span>
              {activeNodes
                .filter((n) => n.category === 'SUSPECT' || n.category === 'FACILITATOR')
                .map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      if (isolatedNodeId === n.id) {
                        setIsolatedNodeId(null);
                      } else {
                        setIsolatedNodeId(n.id);
                        setSelectedNodeId(n.id);
                      }
                    }}
                    className={`px-3 py-1.5 rounded text-xs font-tactical-data transition-all uppercase flex items-center gap-1.5 ${
                      isolatedNodeId === n.id
                        ? 'bg-amber-600 text-on-primary font-bold shadow-[0_0_10px_rgba(255,152,0,0.5)]'
                        : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                  >
                    <Scissors className="w-3 h-3" />
                    {n.name}
                  </button>
                ))}
            </div>

            {/* Disruption Impact Results Panel */}
            {disruptionResult ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-lg bg-surface-container-lowest border border-amber-500/40">
                <div className="space-y-1">
                  <div className="text-[10px] font-tactical-data text-on-surface-variant uppercase">
                    ISOLATED TARGET
                  </div>
                  <div className="text-lg font-bold text-amber-400 font-tactical-data">
                    {disruptionResult.nodeObj?.name}
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    {disruptionResult.nodeObj?.organizationOrFaction}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-tactical-data text-on-surface-variant uppercase">
                    DISRUPTION EFFICIENCY
                  </div>
                  <div className="text-2xl font-bold text-primary font-tactical-data">
                    {disruptionResult.disruptionPct}%
                  </div>
                  <div className="text-xs text-on-surface-variant">Reachability Collapse</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-tactical-data text-on-surface-variant uppercase">
                    SEVERED CONDUITS
                  </div>
                  <div className="text-2xl font-bold text-on-surface font-tactical-data">
                    {disruptionResult.severedEdges} Links
                  </div>
                  <div className="text-xs text-on-surface-variant">Direct Channels Terminated</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-tactical-data text-on-surface-variant uppercase">
                    NETWORK FRAGMENTATION
                  </div>
                  <div className="text-2xl font-bold text-cyan-400 font-tactical-data">
                    {disruptionResult.postComponents} Clusters
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    Split from {disruptionResult.preComponents} original cluster(s)
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-on-surface-variant font-tactical-data text-xs bg-surface-container-high/30 rounded border border-dashed border-outline-variant/40">
                SELECT AN ENTITY ABOVE TO SIMULATE KINETIC ISOLATION AND STRUCTURAL DISRUPTION
              </div>
            )}
          </GlassCard>
        )}

        {/* Tab 3: Conduit & Shortest Path Tracer */}
        {activeTab === 'CONDUIT_TRACER' && (
          <GlassCard className="p-5 border border-outline-variant/40 space-y-5 bg-surface-container/60">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div>
                <h4 className="font-tactical-data text-sm uppercase font-bold text-cyan-400 flex items-center gap-2">
                  <GitFork className="w-4 h-4" /> MULTI-HOP CONDUIT & FINANCIAL INTERMEDIARY TRACER
                </h4>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Calculate shortest paths and identify the mandatory intermediaries bridging two entities.
                </p>
              </div>
              <Badge variant="confidence">ALL-PAIRS DIJKSTRA</Badge>
            </div>

            {/* Source and Target Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-tactical-data text-xs">
              <div className="space-y-1.5">
                <label className="text-on-surface-variant uppercase font-bold flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400" /> SOURCE ENTITY:
                </label>
                <select
                  value={conduitSourceId}
                  onChange={(e) => setConduitSourceId(e.target.value)}
                  className="w-full p-2.5 rounded bg-surface-container-high border border-outline-variant text-on-surface focus:outline-none focus:border-primary"
                >
                  {activeNodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-on-surface-variant uppercase font-bold flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5 text-primary" /> TARGET ENTITY:
                </label>
                <select
                  value={conduitTargetId}
                  onChange={(e) => setConduitTargetId(e.target.value)}
                  className="w-full p-2.5 rounded bg-surface-container-high border border-outline-variant text-on-surface focus:outline-none focus:border-primary"
                >
                  {activeNodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Path Results */}
            {conduitResult && (
              <div className="space-y-3 p-4 rounded-lg bg-surface-container-lowest border border-cyan-500/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-tactical-data uppercase text-cyan-400 font-bold">
                    DISCOVERED CONDUIT // {conduitResult.hopCount} HOP(S)
                  </span>
                  <span className="text-xs font-tactical-data text-amber-400 font-bold">
                    FINANCIAL VOLUME: ₹{conduitResult.totalFinancialVolumeInr.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="space-y-2">
                  {conduitResult.shortestPaths.map((path, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded bg-surface-container-high border border-outline-variant/40 flex items-center gap-3 overflow-x-auto"
                    >
                      {path.map((nodeId, nodeIdx) => {
                        const nodeObj = activeNodes.find((n) => n.id === nodeId);
                        return (
                          <React.Fragment key={nodeId}>
                            <div
                              onClick={() => setSelectedNodeId(nodeId)}
                              className="px-3 py-2 rounded bg-surface-container-lowest border border-outline-variant/60 cursor-pointer hover:border-primary transition-colors shrink-0"
                            >
                              <div className="text-[10px] font-tactical-data text-on-surface-variant">
                                {nodeObj?.role}
                              </div>
                              <div className="text-xs font-bold text-on-surface">{nodeObj?.name}</div>
                            </div>
                            {nodeIdx < path.length - 1 && (
                              <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0" />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {conduitResult.bottleneckIntermediaryIds.length > 0 && (
                  <div className="p-3 rounded bg-secondary-container/70 border border-primary/40 text-xs font-tactical-data">
                    <span className="text-primary font-bold uppercase">MANDATORY INTERMEDIARY BOTTLENECK: </span>
                    <span className="text-on-surface">
                      All communications and financial transfers between {conduitSourceId} and {conduitTargetId} pass exclusively through{' '}
                      <strong className="text-primary">
                        {conduitResult.bottleneckIntermediaryIds.join(', ')}
                      </strong>.
                    </span>
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        )}

        {/* Tab 4: AI Strategic Syndicate Assessment */}
        {activeTab === 'AI_REPORT' && (
          <GlassCard className="p-6 border border-outline-variant/40 space-y-6 bg-surface-container/60 font-body-md">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                <h4 className="font-display-lg text-lg font-bold text-on-surface uppercase tracking-tight">
                  EXECUTIVE AI FORENSIC SYNDICATE REPORT
                </h4>
              </div>
              <Badge variant="critical">OFFICIAL DOSSIER</Badge>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-on-surface/90">
              <div className="p-4 rounded-lg bg-surface-container-high border-l-4 border-primary space-y-1">
                <h5 className="font-tactical-data text-xs uppercase font-bold text-primary tracking-wider">
                  1. EXECUTIVE SUMMARY & TOPOLOGICAL ARCHITECTURE
                </h5>
                <p>{networkData.aiSyndicateReport.executiveSummary}</p>
              </div>

              <div className="p-4 rounded-lg bg-surface-container-high border-l-4 border-amber-400 space-y-1">
                <h5 className="font-tactical-data text-xs uppercase font-bold text-amber-400 tracking-wider">
                  2. COMMAND HIERARCHY & SHIELDING ANALYSIS
                </h5>
                <p>{networkData.aiSyndicateReport.commandHierarchyAssessment}</p>
              </div>

              <div className="p-4 rounded-lg bg-surface-container-high border-l-4 border-red-500 space-y-1">
                <h5 className="font-tactical-data text-xs uppercase font-bold text-red-400 tracking-wider">
                  3. CRITICAL INTERMEDIARY BOTTLENECKS (CHETANY SHARMA)
                </h5>
                <p>{networkData.aiSyndicateReport.criticalIntermediaryVulnerabilities}</p>
              </div>

              <div className="p-4 rounded-lg bg-surface-container-high border-l-4 border-yellow-400 space-y-1">
                <h5 className="font-tactical-data text-xs uppercase font-bold text-yellow-400 tracking-wider">
                  4. FINANCIAL CONDUIT FINDINGS & MONEY TRAIL
                </h5>
                <p>{networkData.aiSyndicateReport.financialConduitFindings}</p>
              </div>

              <div className="p-4 rounded-lg bg-surface-container-high border-l-4 border-emerald-400 space-y-1">
                <h5 className="font-tactical-data text-xs uppercase font-bold text-emerald-400 tracking-wider">
                  5. COURT ADMISSIBILITY (SEC 10 & 65B INDIAN EVIDENCE ACT)
                </h5>
                <p>{networkData.aiSyndicateReport.courtAdmissibilityEvaluation}</p>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};
