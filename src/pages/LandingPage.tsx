import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Radio,
  Cpu,
  Crosshair,
  FileText,
  Eye,
  ChevronRight,
  ChevronDown,
  Activity,
  Layers,
  Database,
  Terminal,
  Play,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { ScanlineOverlay } from '../components/common/ScanlineOverlay';
import { Badge } from '../components/common/Badge';
import ShapeGrid from '../components/ShapeGrid/ShapeGrid';

export const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<'reconstruction' | 'contradictions' | 'prediction'>('reconstruction');

  const features = [
    {
      icon: Cpu,
      title: 'Explainable AI Reasoning',
      description:
        'Every forensic conclusion breaks down exactly WHY it was made with transparent confidence scores, linked evidence IDs, and geometric physics support.',
    },
    {
      icon: Crosshair,
      title: '3D Scene Reconstruction',
      description:
        'Interactive Three.js & React Three Fiber rooms with multi-spectral lighting, ballistic angle popups, and precision distance measurement grids.',
    },
    {
      icon: Eye,
      title: 'Contradiction & Line of Sight',
      description:
        'Cross-reference witness testimony against 3D room geometry and visibility cones to instantly detect physical impossibilities and occlusions.',
    },
    {
      icon: Radio,
      title: 'Physics Trajectory Lab',
      description:
        'Simulate high-velocity bullet trajectories, ricochet dynamics, and arterial blood spatter math with chronological timeline scrubber controls.',
    },
    {
      icon: Layers,
      title: 'Missing Evidence Predictor',
      description:
        'AI graph correlation engine highlights missing CCTV angles, unrecovered weapons, and recommended search grid sectors with projected confidence boosts.',
    },
    {
      icon: FileText,
      title: 'Government-Grade Dossiers',
      description:
        'Export comprehensive PDF investigation reports featuring executive summaries, scenario probability rankings, and suspect risk hierarchies.',
    },
  ];

  const faqs = [
    {
      q: 'What makes Suraag AI an "Explainable AI" platform?',
      a: 'Unlike black-box AI tools, Suraag AI provides a transparent chain of custody and reasoning for every calculation. When the system asserts a contradiction or estimates an attacker position, it shows the exact mathematical vectors, supporting evidence items, and line-of-sight geometry that led to the conclusion.',
    },
    {
      q: 'How does the 3D physics engine simulate bullet trajectories and blood spatter?',
      a: 'Our Three.js physics lab calculates projectile velocity, caliber mass, angle of incidence, and kinetic energy loss upon impact. For blood spatter, we compute elliptical droplet ratios and launch angles to trace back to the precise 3D origin point of the assault.',
    },
    {
      q: 'Can Suraag AI ingest raw field evidence like CCTV footage and GPS logs?',
      a: 'Yes. The Evidence Vault supports automated drag-and-drop ingestion of images, video feeds, audio recordings, PDF manifests, and raw GPS telemetry. Our computer vision pipeline automatically detects weapons, shell casings, footprints, and blood pools with high-precision bounding boxes.',
    },
    {
      q: 'How does the Contradiction Matrix validate witness statements?',
      a: 'By parsing natural language entity claims (e.g., "I stood at the north doorway at 23:14") and cross-referencing them against our 3D room reconstruction and physical sensor timeline, Suraag AI flags claims where visibility was 0% or where thermal sensors record no presence.',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md relative overflow-hidden selection:bg-primary selection:text-on-primary">
      <ScanlineOverlay laser={true} />

      {/* Animated Shape Grid Background */}
      <div className="absolute inset-0 overflow-hidden z-0 opacity-40">
        <ShapeGrid 
          speed={0.5} 
          squareSize={40}
          direction="diagonal"
          borderColor="#333333"
          hoverFillColor="rgba(255, 84, 76, 0.2)"
          shape="hexagon"
          hoverTrailAmount={5} 
        />
        {/* Digital Grid Dots */}
        <div className="absolute inset-0 tactical-grid opacity-30 pointer-events-none" />
      </div>

      {/* Landing Navigation Header */}
      <header className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto border-b border-outline-variant/40 bg-background/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center border border-primary/60 shadow-[0_0_15px_rgba(255,84,76,0.4)]">
            <ShieldAlert className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div>
            <span className="font-display-lg text-2xl font-bold tracking-tighter uppercase text-primary">Suraag AI</span>
            <span className="block text-[10px] font-tactical-data tracking-widest text-on-surface-variant uppercase">
              Reconstruct. Analyze. Reveal the Truth.
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 font-tactical-data text-xs uppercase tracking-wider text-on-surface-variant">
          <a href="#features" className="hover:text-primary transition-colors">Tactical Capabilities</a>
          <a href="#workflow" className="hover:text-primary transition-colors">Investigation Workflow</a>
          <a href="#technologies" className="hover:text-primary transition-colors">Lattice Tech Stack</a>
          <a href="#faq" className="hover:text-primary transition-colors">System FAQ</a>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/auth"
            className="px-6 py-2.5 rounded-md bg-primary text-on-primary font-tactical-data text-xs font-bold tracking-wider uppercase hover:bg-surface-tint transition-all shadow-[0_0_20px_rgba(255,84,76,0.4)] flex items-center gap-2 group"
          >
            <span>Launch Command Center</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-28 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container border border-primary/50 text-primary font-tactical-data text-xs mb-8 shadow-[0_0_15px_rgba(255,84,76,0.2)]"
        >
          <Activity className="w-4 h-4 animate-pulse" />
          <span>NATIONAL LAW ENFORCEMENT & DEFENSE GRADE PLATFORM</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display-lg text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight uppercase leading-none max-w-5xl mx-auto"
        >
          Reconstruct. <span className="text-primary glow-red">Analyze.</span> Reveal the Truth.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-on-surface-variant max-w-3xl mx-auto font-body-md leading-relaxed"
        >
          An Explainable AI-powered forensic intelligence platform designed for complex crime scene reconstruction, 3D physics trajectory simulation, witness statement validation, and multi-scenario probability analysis.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6"
        >
          <Link
            to="/auth"
            className="px-8 py-4 rounded-md bg-primary text-on-primary font-tactical-data text-sm font-bold tracking-wider uppercase hover:bg-surface-tint transition-all shadow-[0_0_30px_rgba(255,84,76,0.5)] flex items-center gap-3 group"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Enter Mission Control (Active Demo)</span>
          </Link>
          <Link
            to="/reconstruction"
            className="px-8 py-4 rounded-md bg-surface-container-high text-on-surface font-tactical-data text-sm font-bold tracking-wider uppercase border border-outline-variant hover:border-primary transition-all flex items-center gap-2"
          >
            <Crosshair className="w-5 h-5 text-primary" />
            <span>Explore 3D Crime Scene Room</span>
          </Link>
        </motion.div>

        {/* Tactical Metrics Strip */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[
            { label: 'MULTI-SENSOR CONFIDENCE', value: '94.2%', sub: 'Real-time Bayesian Fusion' },
            { label: 'SIMULATED TRAJECTORIES', value: '< 12ms', sub: 'Three.js Ballistic Math' },
            { label: 'CONTRADICTIONS DETECTED', value: '100%', sub: 'Geometric Line-of-Sight Check' },
            { label: 'SECURITY COMPLIANCE', value: 'SOVEREIGN', sub: 'Palantir / Anduril Lattice Spec' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="glass-panel p-5 rounded border border-outline-variant/40 bg-surface/60 backdrop-blur-md text-left relative overflow-hidden group hover:border-primary/60 transition-all"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full pointer-events-none group-hover:bg-primary/15 transition-colors" />
              <span className="text-[10px] font-tactical-data text-on-surface-variant uppercase tracking-widest block">
                {stat.label}
              </span>
              <span className="font-display-lg text-3xl font-bold text-primary block mt-1">
                {stat.value}
              </span>
              <span className="text-xs text-on-surface-variant/70 block mt-1 font-body-md">
                {stat.sub}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Workflow Section */}
      <section id="workflow" className="relative z-10 py-24 px-6 max-w-7xl mx-auto border-t border-outline-variant/30">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="confidence" className="mb-3">TACTICAL PIPELINE</Badge>
          <h2 className="font-display-lg text-3xl md:text-5xl font-bold uppercase tracking-tight">
            How Suraag AI Reveals the Truth
          </h2>
          <p className="text-on-surface-variant mt-4 font-body-md">
            Our multi-tier engine converts raw, chaotic field data into mathematically verified, court-ready conclusions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Ingest & Detect',
              desc: 'Upload CCTV, audio, GPS, and crime photos into the Evidence Vault. Deep learning computer vision auto-tags weapons, blood, and shell casings.',
            },
            {
              step: '02',
              title: 'Reconstruct & Simulate',
              desc: 'Three.js creates a digital twin of the crime scene. Simulate bullet trajectories, arterial spatter vectors, and attacker positions in 3D.',
            },
            {
              step: '03',
              title: 'Reveal Contradictions',
              desc: 'Cross-reference witness claims against line-of-sight cones and thermal logs to instantly highlight geometric and chronological falsehoods.',
            },
            {
              step: '04',
              title: 'Forecast & Report',
              desc: 'Predict missing evidence locations, compute Scenario A/B/C probabilities, and generate a sovereign PDF investigation dossier.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="glass-panel p-6 rounded-lg border border-outline-variant/50 relative overflow-hidden group hover:border-primary transition-all flex flex-col justify-between"
            >
              <div className="absolute top-3 right-6 text-6xl leading-none font-display-lg font-bold text-outline-variant/15 select-none group-hover:text-primary/20 transition-colors">
                {item.step}
              </div>
              <div>
                <span className="inline-block px-2.5 py-1 rounded bg-secondary-container text-primary font-tactical-data text-xs font-bold mb-4">
                  STEP {item.step}
                </span>
                <h3 className="font-display-lg text-xl font-bold uppercase tracking-wider mb-2 text-on-surface">
                  {item.title}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed font-body-md">
                  {item.desc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant/30 flex items-center justify-between text-xs font-tactical-data text-primary">
                <span>VERIFIED MODULE</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Capabilities Grid */}
      <section id="features" className="relative z-10 py-24 px-6 max-w-7xl mx-auto border-t border-outline-variant/30">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <Badge variant="critical" className="mb-3">SYSTEM MODULES</Badge>
            <h2 className="font-display-lg text-3xl md:text-5xl font-bold uppercase tracking-tight">
              Enterprise Forensic Intelligence
            </h2>
          </div>
          <p className="text-on-surface-variant max-w-md mt-4 md:mt-0 font-body-md text-sm">
            Architected for national intelligence and criminal investigation bureaus requiring absolute mathematical fidelity and explainability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="glass-panel p-6 rounded-lg border border-outline-variant/40 hover:border-primary/60 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded bg-surface-container-high border border-outline-variant flex items-center justify-center mb-5 group-hover:border-primary group-hover:bg-secondary-container transition-all">
                    <Icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="font-display-lg text-lg font-bold uppercase tracking-wider mb-3 text-on-surface">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed font-body-md">
                    {feat.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-outline-variant/30 flex items-center gap-2 text-xs font-tactical-data text-on-surface-variant group-hover:text-primary transition-colors">
                  <span>EXAMINE SUBSYSTEM</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Feature Demo Tabs */}
      <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto border-t border-outline-variant/30">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="active" className="mb-3">LIVE DIAGNOSTIC PREVIEW</Badge>
          <h2 className="font-display-lg text-3xl md:text-4xl font-bold uppercase tracking-tight">
            See Suraag AI in Action
          </h2>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          {[
            { id: 'reconstruction', label: '3D Crime Scene & Ballistics' },
            { id: 'contradictions', label: 'Witness vs Line-of-Sight Check' },
            { id: 'prediction', label: 'AI Missing Evidence Forecast' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded font-tactical-data text-xs uppercase tracking-wider transition-all border ${activeTab === tab.id
                  ? 'bg-secondary-container text-primary border-primary shadow-[0_0_15px_rgba(255,84,76,0.3)] font-bold'
                  : 'bg-surface-container text-on-surface-variant border-outline-variant hover:text-on-surface'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="glass-panel p-8 rounded-lg border border-primary/50 shadow-[0_0_30px_rgba(255,84,76,0.2)]">
          <AnimatePresence mode="wait">
            {activeTab === 'reconstruction' && (
              <motion.div
                key="reconstruction"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
              >
                <div className="space-y-4">
                  <Badge variant="critical">CASE-2026-884A SIMULATION</Badge>
                  <h3 className="font-display-lg text-2xl font-bold uppercase text-on-surface">
                    Sub-Level 3 Vault Trajectory Analysis
                  </h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed font-body-md">
                    Our Three.js physics laboratory computes the bullet flight path from the elevated maintenance walkway directly into Wall B. The 34.2° entry angle aligns perfectly with the victim position and arterial blood spatter origin point.
                  </p>
                  <div className="space-y-2 pt-2 font-tactical-data text-xs">
                    <div className="flex justify-between p-2 rounded bg-surface-container-high border border-outline-variant/40">
                      <span className="text-on-surface-variant">ATTACKER ESTIMATION VECTOR:</span>
                      <span className="text-primary font-bold">[X: -2.4m, Y: 1.7m, Z: 3.1m]</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-surface-container-high border border-outline-variant/40">
                      <span className="text-on-surface-variant">BALLISTIC CALIBER & VELOCITY:</span>
                      <span className="text-on-surface font-semibold">9mm Subsonic (340 m/s)</span>
                    </div>
                  </div>
                  <Link
                    to="/reconstruction"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded bg-primary text-on-primary font-tactical-data text-xs font-bold uppercase mt-4 hover:bg-surface-tint transition-all"
                  >
                    <span>Launch Interactive 3D Room</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="relative rounded-lg overflow-hidden border border-tactical aspect-video bg-surface-container-lowest flex items-center justify-center group">
                  <img
                    src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
                    alt="3D Reconstruction Simulation Preview"
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-tactical-data text-xs text-primary bg-black/60 backdrop-blur-md px-3 py-2 rounded border border-primary/40">
                    <span>THREE.JS CAMERA: ORBIT / UV MODE</span>
                    <span className="animate-pulse">● LIVE MATH ENGINE</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'contradictions' && (
              <motion.div
                key="contradictions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
              >
                <div className="space-y-4">
                  <Badge variant="critical" pulse>CONTRADICTION DETECTED (SEVERITY: CRITICAL)</Badge>
                  <h3 className="font-display-lg text-2xl font-bold uppercase text-on-surface">
                    Witness Statement vs. Geometric Line-of-Sight
                  </h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed font-body-md">
                    Witness **Dr. Julian Vance** claims he stood at the North Doorway (`Wall B`) watching two operatives enter the vault. Our automated 3D occlusion check proves structural Server Rack #4 blocks 100% of visual access from that coordinate.
                  </p>
                  <div className="p-3 rounded bg-secondary-container/60 border border-primary text-xs font-tactical-data space-y-1">
                    <span className="text-primary font-bold block">AI REASONING CONCLUSION:</span>
                    <span className="text-on-surface-variant">
                      Statement credibility downgraded from 85% to **42.5%**. High probability of intentional fabrication to conceal insider keycard override at 23:14:18.
                    </span>
                  </div>
                  <Link
                    to="/contradiction-matrix"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded bg-primary text-on-primary font-tactical-data text-xs font-bold uppercase mt-4 hover:bg-surface-tint transition-all"
                  >
                    <span>Examine Contradiction Matrix</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="p-6 rounded-lg bg-surface-container-low border border-outline-variant/60 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30 font-tactical-data text-xs">
                    <span className="text-on-surface">STATEMENT CLAIMS vs SENSOR TRUTH</span>
                    <span className="text-primary font-bold">100% REFUTED</span>
                  </div>
                  <div className="space-y-3 font-body-md text-xs">
                    <div className="p-3 rounded bg-surface-container border border-outline-variant/40 flex items-start gap-3">
                      <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-on-surface font-semibold block">Claimed Location: Wall B Corridor</span>
                        <span className="text-on-surface-variant text-[11px]">Thermal sensors at Wall B show 0.0°C deviation (no human heat signature) during exact 23:14:00 timestamp.</span>
                      </div>
                    </div>
                    <div className="p-3 rounded bg-secondary-container/40 border border-primary/50 flex items-start gap-3">
                      <Crosshair className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-primary font-semibold block">Line of Sight Cone: 0% Visibility</span>
                        <span className="text-on-surface-variant text-[11px]">Raycasting from North Doorway intersects Server Rack #4 at 2.1 meters. Vault lock is occluded.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'prediction' && (
              <motion.div
                key="prediction"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
              >
                <div className="space-y-4">
                  <Badge variant="active">BAYESIAN GRAPH INFERENCE</Badge>
                  <h3 className="font-display-lg text-2xl font-bold uppercase text-on-surface">
                    Predicting Missing Evidence Links
                  </h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed font-body-md">
                    By mapping the graph connections between suspect Viktor Krell's satellite phone pings and the acoustic gunshot signature, Suraag AI calculates the highest probability location for unrecovered evidence items.
                  </p>
                  <div className="space-y-2 pt-2 font-tactical-data text-xs">
                    <div className="flex justify-between items-center p-2 rounded bg-surface-container-high border border-outline-variant/40">
                      <span className="text-on-surface-variant">RECOMMENDED SEARCH SECTOR:</span>
                      <span className="text-primary font-bold">Grid C-4 (Ventilation Duct North)</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-surface-container-high border border-outline-variant/40">
                      <span className="text-on-surface-variant">CONFIDENCE BOOST IF RECOVERED:</span>
                      <span className="text-emerald-400 font-bold">+14.2% (Takes Case to 99.4%)</span>
                    </div>
                  </div>
                  <Link
                    to="/missing-evidence"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded bg-primary text-on-primary font-tactical-data text-xs font-bold uppercase mt-4 hover:bg-surface-tint transition-all"
                  >
                    <span>Launch Missing Evidence Predictor</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="p-6 rounded-lg bg-surface-container-low border border-outline-variant/60 space-y-3 font-tactical-data text-xs">
                  <span className="text-on-surface-variant uppercase tracking-wider block text-[11px]">AI PREDICTION PRIORITY QUEUE</span>
                  {[
                    { item: 'Missing CCTV Camera #4 Raw Buffer', area: 'Grid Sector C-4', boost: '+14.2%' },
                    { item: 'Secondary Weapon Fingerprint Smear', area: 'Cleanroom Airlock Keypad', boost: '+8.5%' },
                    { item: 'Matte Black SUV Toll Transponder Log', area: 'Highway 101 North Checkpoint', boost: '+6.1%' },
                  ].map((pred, idx) => (
                    <div key={idx} className="p-3 rounded bg-surface-container border border-outline-variant/40 flex items-center justify-between">
                      <div>
                        <span className="text-on-surface font-semibold block">{pred.item}</span>
                        <span className="text-on-surface-variant/70 text-[10px]">Search Area: {pred.area}</span>
                      </div>
                      <span className="px-2 py-1 rounded bg-primary/20 text-primary font-bold">{pred.boost}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Technologies & Lattice Architecture */}
      <section id="technologies" className="relative z-10 py-24 px-6 max-w-7xl mx-auto border-t border-outline-variant/30">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="neutral" className="mb-3">MISSION SPECIFICATION</Badge>
          <h2 className="font-display-lg text-3xl md:text-5xl font-bold uppercase tracking-tight">
            Built on Sovereign Stack Standards
          </h2>
          <p className="text-on-surface-variant mt-4 font-body-md text-sm">
            Engineered with strict TypeScript, React 19, Three.js Fiber, Zustand, and Prisma PostgreSQL for zero-latency mission critical operations.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: 'React 19', type: 'Frontend Engine' },
            { name: 'TypeScript', type: 'Strict Type Safety' },
            { name: 'Three.js / Fiber', type: '3D Room Simulation' },
            { name: 'Tailwind + shadcn', type: 'Tactical UI Design' },
            { name: 'Framer Motion', type: 'Smooth Transitions' },
            { name: 'Zustand', type: 'Persistent Store' },
            { name: 'Node / Express', type: 'REST API Service' },
            { name: 'Prisma ORM', type: 'Relational Schema' },
            { name: 'PostgreSQL', type: 'Forensic Database' },
            { name: 'D3.js Force Graph', type: 'Entity Correlation' },
            { name: 'Recharts', type: 'Live Diagnostics' },
            { name: 'Gemini AI Ready', type: 'Explainable Reasoning' },
          ].map((tech, idx) => (
            <div
              key={idx}
              className="glass-panel p-4 rounded text-center border border-outline-variant/40 hover:border-primary/50 transition-all group"
            >
              <Terminal className="w-5 h-5 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-display-lg font-bold text-sm text-on-surface block">{tech.name}</span>
              <span className="text-[10px] font-tactical-data text-on-surface-variant/70 block mt-0.5">{tech.type}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="relative z-10 py-24 px-6 max-w-4xl mx-auto border-t border-outline-variant/30">
        <div className="text-center mb-16">
          <Badge variant="routine" className="mb-3">INTELLIGENCE KNOWLEDGE BASE</Badge>
          <h2 className="font-display-lg text-3xl md:text-4xl font-bold uppercase tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-lg border border-outline-variant/40 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between font-display-lg text-base font-bold uppercase tracking-wider text-on-surface hover:text-primary transition-colors bg-surface-container/50"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-primary transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 pt-3 text-sm text-on-surface-variant leading-relaxed font-body-md border-t border-outline-variant/20 bg-surface-container-lowest/60">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-8 border-t border-outline-variant/50 bg-surface-container-lowest/90 font-tactical-data text-xs text-on-surface-variant">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <span className="font-display-lg font-bold text-on-surface uppercase tracking-wider">SURAAG AI</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-surface-container border border-outline-variant">
              PALANTIR GOTHAM / ANDURIL LATTICE EQUIVALENT
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span>ALL RIGHTS RESERVED © 2026</span>
            <span>SYSTEM ENCRYPTION: SOVEREIGN 4096-BIT</span>
            <Link to="/auth" className="text-primary font-bold hover:underline">
              COMMAND CENTER →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
