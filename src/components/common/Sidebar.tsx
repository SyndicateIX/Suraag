import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Vault,
  Box,
  Cpu,
  Compass,
  Crosshair,
  Clock,
  Gauge,
  Users,
  GitCompare,
  Eye,
  AlertTriangle,
  GitBranch,
  UserCheck,
  Network,
  Sparkles,
  Bot,
  FileText,
  Settings,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navGroups = [
    {
      title: 'COMMAND & CONTROL',
      items: [
        { name: 'Mission Control', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Case Intelligence', path: '/cases', icon: FolderKanban },
        { name: 'Evidence Vault', path: '/evidence', icon: Vault },
      ],
    },
    {
      title: '3D RECONSTRUCTION & PHYSICS',
      items: [
        { name: 'Crime Scene 3D', path: '/reconstruction', icon: Box },
        { name: 'Physics Engine', path: '/physics', icon: Cpu },
        { name: 'Trajectory Lab', path: '/trajectory', icon: Compass },
        { name: 'Attacker Estimation', path: '/attacker-estimation', icon: Crosshair },
      ],
    },
    {
      title: 'TIMELINE & WITNESS ANALYSIS',
      items: [
        { name: 'Timeline Engine', path: '/timeline', icon: Clock },
        { name: 'Timeline Confidence', path: '/timeline-confidence', icon: Gauge },
        { name: 'Witness Analysis', path: '/witnesses', icon: Users },
        { name: 'Contradiction Matrix', path: '/contradiction-matrix', icon: GitCompare },
      ],
    },
    {
      title: 'TACTICAL PREDICTION & SCENARIOS',
      items: [
        { name: 'Line of Sight', path: '/line-of-sight', icon: Eye },
        { name: 'Missing Evidence', path: '/missing-evidence', icon: AlertTriangle },
        { name: 'Scenario Simulator', path: '/scenarios', icon: GitBranch },
        { name: 'Suspect Intelligence', path: '/suspects', icon: UserCheck },
        { name: 'Evidence Graph', path: '/correlation-graph', icon: Network },
      ],
    },
    {
      title: 'EXPLAINABLE AI & REPORTING',
      items: [
        { name: 'AI Reasoning Engine', path: '/ai-reasoning', icon: Sparkles },
        { name: 'AI Assistant', path: '/ai-assistant', icon: Bot },
        { name: 'Investigation Report', path: '/report', icon: FileText },
        { name: 'Settings & Audit', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 z-30 bg-surface/95 backdrop-blur-2xl border-r border-outline-variant/40 flex flex-col justify-between overflow-y-auto custom-scrollbar shadow-[4px_0_20px_rgba(0,0,0,0.5)]">
      <div className="p-3 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <h4 className="px-3 text-[10px] font-tactical-data uppercase tracking-widest text-on-surface-variant/70 font-semibold mb-2">
              {group.title}
            </h4>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md transition-all font-tactical-data text-xs ${
                        isActive
                          ? 'bg-secondary-container/90 text-primary border-l-4 border-primary font-bold shadow-[0_0_12px_rgba(255,84,76,0.3)]'
                          : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer System Status */}
      <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-tactical-data text-on-surface-variant">AI ENGINE STATUS</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
          <div className="bg-primary h-full w-[94.2%] transition-all duration-500 shadow-[0_0_8px_#ff544c]" />
        </div>
        <div className="flex justify-between text-[10px] font-tactical-data text-on-surface-variant/80 mt-1.5">
          <span>GEMINI 3.1 PRO (HIGH)</span>
          <span className="text-primary font-bold">94.2%</span>
        </div>
      </div>
    </aside>
  );
};
