import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  NetworkGraphData,
  NetworkNode,
  NetworkLink,
  CDRRecord,
} from '../../types/telecom';
import {
  Search,
  Filter,
  Layers,
  Sparkles,
  UserCheck,
  PhoneCall,
  Radio,
  Clock,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Eye,
  Info,
  X,
  ExternalLink,
} from 'lucide-react';
import * as d3 from 'd3';

interface SuspectNetworkGraphProps {
  caseId: string;
  graphData: NetworkGraphData | null;
  loading: boolean;
  onSelectNode?: (node: NetworkNode | null) => void;
  onSyncSuspect?: (node: NetworkNode) => void;
  onFilterChange?: (filters: { minWeight: number; callType: string }) => void;
}

export const SuspectNetworkGraph: React.FC<SuspectNetworkGraphProps> = ({
  caseId,
  graphData,
  loading,
  onSelectNode,
  onSyncSuspect,
  onFilterChange,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minWeight, setMinWeight] = useState<number>(1);
  const [callType, setCallType] = useState<string>('ALL');
  const [centralityMode, setCentralityMode] = useState<'ALL' | 'BRIDGE' | 'DEGREE'>('ALL');
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);

  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });

  // Update dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 900,
          height: Math.max(500, containerRef.current.clientHeight || 550),
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter change trigger
  const handleWeightChange = (newWeight: number) => {
    setMinWeight(newWeight);
    onFilterChange?.({ minWeight: newWeight, callType });
  };

  const handleCallTypeChange = (newType: string) => {
    setCallType(newType);
    onFilterChange?.({ minWeight, callType: newType });
  };

  // D3 Force Simulation
  useEffect(() => {
    if (!svgRef.current || !graphData || graphData.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = dimensions.width;
    const height = dimensions.height;

    const g = svg.append('g').attr('class', 'network-container');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Deep clone nodes and links so D3 doesn't mutate immutable props
    const nodes: (NetworkNode & d3.SimulationNodeDatum)[] = graphData.nodes.map(n => ({
      ...n,
      x: (n.x ?? width / 2) + (Math.random() - 0.5) * 80,
      y: (n.y ?? height / 2) + (Math.random() - 0.5) * 80,
    }));

    const links: (NetworkLink & d3.SimulationLinkDatum<any>)[] = graphData.links.map(l => ({
      ...l,
      source: typeof l.source === 'object' ? l.source.id : l.source,
      target: typeof l.target === 'object' ? l.target.id : l.target,
    }));

    // Define gradients and filters
    const defs = svg.append('defs');

    // Glow filter
    const glowFilter = defs.append('filter')
      .attr('id', 'neon-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance((d: any) => {
        // Shorter distance for higher call count
        return Math.max(70, 180 - Math.min(d.callCount * 8, 110));
      }))
      .force('charge', d3.forceManyBody().strength(-380))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Render Edges
    const linkGroup = g.append('g').attr('class', 'links');
    const linkElements = linkGroup.selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        if (d.callCount >= 8) return '#10b981'; // neon emerald
        if (d.callCount >= 4) return '#3b82f6'; // neon blue
        return '#3f3f46'; // zinc-700
      })
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d) => Math.min(7, Math.max(1.5, Math.log2(d.callCount + 1) * 2)))
      .attr('stroke-dasharray', (d) => (d.callTypes && d.callTypes.SMS && !d.callTypes.VOICE ? '4,4' : 'none'));

    // Render Edge Call Count Badges for High Weight
    const edgeLabels = linkGroup.selectAll('.edge-label')
      .data(links.filter(l => l.callCount >= 2))
      .enter()
      .append('text')
      .attr('class', 'edge-label font-mono text-[9px] fill-zinc-400 select-none')
      .attr('text-anchor', 'middle')
      .attr('dy', -4)
      .text(d => `${d.callCount} calls`);

    // Render Nodes Group
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const nodeElements = nodeGroup.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node cursor-pointer')
      .call(
        d3.drag<SVGGElement, any>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on('click', (_, d) => {
        setSelectedNode(d);
        onSelectNode?.(d);
      })
      .on('mouseenter', (_, d) => {
        setHoveredNode(d);
      })
      .on('mouseleave', () => {
        setHoveredNode(null);
      });

    // Outer Halo Ring for Bridge Nodes / High Risk
    nodeElements.each(function (d) {
      const el = d3.select(this);
      const isBridge = d.betweennessCentrality > 0.25;
      const isHighRisk = d.riskScore >= 80;

      if (isBridge || isHighRisk) {
        el.append('circle')
          .attr('r', 28)
          .attr('fill', 'none')
          .attr('stroke', isBridge ? '#f59e0b' : '#ef4444')
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', isBridge ? '3,3' : 'none')
          .attr('filter', 'url(#neon-glow)')
          .attr('opacity', 0.8);
      }
    });

    // Main Node Circle
    nodeElements.append('circle')
      .attr('r', (d) => {
        if (centralityMode === 'BRIDGE') return Math.max(16, Math.min(32, 16 + d.betweennessCentrality * 35));
        if (centralityMode === 'DEGREE') return Math.max(16, Math.min(32, 16 + d.degreeCentrality * 25));
        return d.isSuspect ? 24 : 18;
      })
      .attr('fill', (d) => {
        if (d.role === 'MASTERMIND') return '#7f1d1d'; // dark red
        if (d.role === 'CO-CONSPIRATOR' || d.role === 'OPERATIVE') return '#831843'; // rose
        if (d.role === 'BURNER') return '#78350f'; // dark amber
        if (d.role === 'VICTIM') return '#1e293b'; // slate
        return '#18181b'; // zinc-900
      })
      .attr('stroke', (d) => {
        if (d.role === 'MASTERMIND') return '#ef4444'; // red
        if (d.betweennessCentrality > 0.25) return '#f59e0b'; // amber
        if (d.isSuspect) return '#10b981'; // emerald
        return '#52525b'; // zinc-600
      })
      .attr('stroke-width', (d) => (d.isSuspect || d.betweennessCentrality > 0.25 ? 2.5 : 1.5));

    // Node Icons / Text Indicators
    nodeElements.append('text')
      .attr('class', 'font-mono text-[10px] font-bold fill-zinc-100 select-none')
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .text(d => {
        if (d.role === 'MASTERMIND') return 'M';
        if (d.role === 'BURNER') return 'B';
        if (d.isSuspect) return 'SUS';
        return d.phoneNumber.slice(-4);
      });

    // Node Labels (Suspect name & number underneath)
    nodeElements.append('text')
      .attr('class', 'font-mono text-[10px] fill-zinc-300 font-semibold select-none pointer-events-none')
      .attr('text-anchor', 'middle')
      .attr('dy', 34)
      .text(d => d.name || d.phoneNumber);

    nodeElements.append('text')
      .attr('class', 'font-mono text-[8px] fill-zinc-500 select-none pointer-events-none')
      .attr('text-anchor', 'middle')
      .attr('dy', 44)
      .text(d => d.phoneNumber);

    // Simulation Tick
    simulation.on('tick', () => {
      linkElements
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      edgeLabels
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2);

      nodeElements.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [graphData, dimensions, centralityMode]);

  // Matching node search highlighting
  const filteredNodesCount = useMemo(() => {
    if (!graphData) return 0;
    if (!searchQuery) return graphData.nodes.length;
    return graphData.nodes.filter(
      n =>
        n.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.alias && n.alias.toLowerCase().includes(searchQuery.toLowerCase()))
    ).length;
  }, [graphData, searchQuery]);

  return (
    <div className="relative w-full bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Network Header & Controls Toolbar */}
      <div className="bg-zinc-900/90 border-b border-zinc-800 p-4 flex flex-wrap items-center justify-between gap-4 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-100 font-mono flex items-center gap-2">
              Communication Topology & Suspect Graph
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-zinc-700">
                {graphData ? `${graphData.totalNodes} Nodes / ${graphData.totalLinks} Edges` : '0 Nodes'}
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono">
              Betweenness Centrality identifies bridge coordinators & hidden conspiracy brokers.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search phone / suspect..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 w-48"
            />
          </div>

          {/* Centrality Mode Switcher */}
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setCentralityMode('ALL')}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                centralityMode === 'ALL' ? 'bg-zinc-800 text-emerald-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Default
            </button>
            <button
              type="button"
              onClick={() => setCentralityMode('BRIDGE')}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors flex items-center gap-1 ${
                centralityMode === 'BRIDGE' ? 'bg-amber-950/80 text-amber-400 font-semibold border border-amber-800/60' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-400" /> Bridge Nodes
            </button>
            <button
              type="button"
              onClick={() => setCentralityMode('DEGREE')}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                centralityMode === 'DEGREE' ? 'bg-blue-950/80 text-blue-400 font-semibold border border-blue-800/60' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Degree Hubs
            </button>
          </div>

          {/* Call Type Toggle */}
          <select
            value={callType}
            onChange={(e) => handleCallTypeChange(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 text-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Event Types</option>
            <option value="VOICE">Voice Only</option>
            <option value="SMS">SMS Only</option>
            <option value="DATA">Data Only</option>
          </select>

          {/* Call Weight Slider */}
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-lg">
            <span className="text-[10px] text-zinc-500 uppercase">Min Calls:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={minWeight}
              onChange={(e) => handleWeightChange(parseInt(e.target.value, 10))}
              className="w-16 accent-emerald-500 cursor-pointer"
            />
            <span className="text-emerald-400 font-bold text-[11px]">{minWeight}+</span>
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div ref={containerRef} className="relative flex-1 min-h-[520px] bg-zinc-950">
        {/* Subtle Crime Noir Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-10 bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 text-[11px] font-mono space-y-1.5 backdrop-blur-md">
          <span className="text-zinc-400 block text-[10px] font-bold uppercase tracking-wider mb-1">
            Network Legend
          </span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            <span className="text-zinc-300">Mastermind / Target 1</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-400/40" />
            <span className="text-zinc-300">Bridge Node (High Betweenness)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-zinc-300">Active Suspect / Operative</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-700" />
            <span className="text-zinc-300">Burner Phone / Signal</span>
          </div>
        </div>

        {/* Interactive SVG Canvas */}
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full block"
        />

        {/* Selected Suspect Dossier Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 z-20 w-84 max-w-[360px] bg-zinc-950/95 border border-zinc-700/80 rounded-xl p-5 shadow-2xl backdrop-blur-2xl font-mono text-xs space-y-4 animate-in fade-in slide-in-from-right-5 duration-200">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                {selectedNode.avatar ? (
                  <img
                    src={selectedNode.avatar}
                    alt={selectedNode.name}
                    className="w-11 h-11 rounded-lg object-cover border-2 border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold">
                    {selectedNode.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm text-zinc-100">{selectedNode.name}</h4>
                  <span className="text-emerald-400 text-[11px] block">{selectedNode.phoneNumber}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 mt-1 inline-block">
                    {selectedNode.role}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="text-zinc-500 hover:text-zinc-200 p-1 rounded hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Risk & Centrality Indices */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-2">
                <span className="text-[9px] text-zinc-500 uppercase block">Risk Score</span>
                <span className={`text-sm font-bold ${selectedNode.riskScore >= 80 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {selectedNode.riskScore}/100
                </span>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-2">
                <span className="text-[9px] text-zinc-500 uppercase block">Betweenness</span>
                <span className="text-sm font-bold text-amber-400">
                  {selectedNode.betweennessCentrality}
                </span>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-2">
                <span className="text-[9px] text-zinc-500 uppercase block">Degree Cent.</span>
                <span className="text-sm font-bold text-blue-400">
                  {selectedNode.degreeCentrality}
                </span>
              </div>
            </div>

            {/* Telecommunication Metrics */}
            <div className="space-y-2 bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/80 text-[11px]">
              <div className="flex justify-between text-zinc-400">
                <span>Total Calls Logged:</span>
                <span className="text-zinc-200 font-bold">{selectedNode.totalCalls} ({selectedNode.outCalls} Out / {selectedNode.inCalls} In)</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Total Airtime:</span>
                <span className="text-zinc-200 font-bold">{Math.round(selectedNode.totalDuration / 60)} mins</span>
              </div>
              {selectedNode.associatedIMEIs.length > 0 && (
                <div className="text-zinc-400 pt-1 border-t border-zinc-800/60">
                  <span className="block text-[10px] text-zinc-500 uppercase mb-1">Associated IMEIs:</span>
                  {selectedNode.associatedIMEIs.map(imei => (
                    <span key={imei} className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] inline-block mr-1 mb-1">
                      {imei}
                    </span>
                  ))}
                </div>
              )}
              {selectedNode.towersUsed.length > 0 && (
                <div className="text-zinc-400 pt-1 border-t border-zinc-800/60">
                  <span className="block text-[10px] text-zinc-500 uppercase mb-1">Cell Towers Pinged:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.towersUsed.map(t => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onSyncSuspect?.(selectedNode)}
                className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              >
                <UserCheck className="w-3.5 h-3.5" /> Sync to Dossier
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
