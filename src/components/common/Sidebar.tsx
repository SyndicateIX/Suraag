import React, { useState } from 'react';
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
  ChevronDown,
  User
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'COMMAND & CONTROL': true,
    '3D RECONSTRUCTION & PHYSICS': false,
    'TIMELINE & WITNESS ANALYSIS': false,
    'TACTICAL PREDICTION & SCENARIOS': false,
    'EXPLAINABLE AI & REPORTING': false,
  });

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

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
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`fixed left-0 top-16 bottom-0 z-50 w-[86vw] max-w-72 bg-surface/95 backdrop-blur-2xl border-r border-outline-variant/40 flex flex-col justify-between overflow-y-auto custom-scrollbar shadow-[4px_0_20px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:w-64 lg:z-30`}>
        <div className="p-3 space-y-4">
          {navGroups.map((group, idx) => {
    <aside className="fixed left-0 top-16 bottom-0 w-64 z-30 bg-surface/95 backdrop-blur-2xl border-r border-outline-variant/40 flex flex-col justify-between shadow-[4px_0_20px_rgba(0,0,0,0.5)]">
      <div className="p-3 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
        {navGroups.map((group, idx) => {
          const isExpanded = expandedGroups[group.title];
          return (
            <div
              key={idx}
              className="space-y-1"
              onMouseEnter={() => setExpandedGroups(prev => ({ ...prev, [group.title]: true }))}
              onMouseLeave={() => setExpandedGroups(prev => ({ ...prev, [group.title]: false }))}
            >
              <button
                onClick={() => toggleGroup(group.title)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded hover:bg-surface-container transition-colors group focus:outline-none"
              >
                <h4 className="text-xs font-tactical-data uppercase tracking-widest text-on-surface-variant/70 font-semibold group-hover:text-primary transition-colors">
                  {group.title}
                </h4>
                <ChevronDown
                  className={`w-4 h-4 text-on-surface-variant/70 transition-transform duration-300 ${
                    isExpanded ? 'rotate-180 text-primary' : ''
                  }`}
                />
              </button>
              
              <div
                className={`space-y-0.5 overflow-hidden transition-all duration-300 ${
                  isExpanded ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-md transition-all font-tactical-data text-sm ${
                          isActive
                            ? 'bg-secondary-container/90 text-primary border-l-4 border-primary font-bold shadow-[0_0_12px_rgba(255,84,76,0.3)]'
                            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                        }`
                      }
                    >
                      <Icon className="w-[18px] h-[18px] shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer System Status */}
      <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest/60 shrink-0">
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

      {/* User Profile Quick Link */}
      <div className="px-3 py-2 border-t border-outline-variant/30 bg-surface-container/30 shrink-0">
        <NavLink
          to="/profile"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-md transition-all font-tactical-data text-sm ${
              isActive
                ? 'bg-secondary-container/90 text-primary border-l-4 border-primary font-bold shadow-[0_0_12px_rgba(255,84,76,0.3)]'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`
          }
        >
          <User className="w-[18px] h-[18px] shrink-0" />
          <span className="truncate uppercase tracking-wider">Agent Profile</span>
        </NavLink>
      </div>
      </aside>
    </>
  );
};
