import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Activity, Radio, Search, Bell, Database, ExternalLink, Moon, Sun, Menu } from 'lucide-react';
import { useSuraagStore } from '../../store/useSuraagStore';
import { useTheme } from '../../hooks/useTheme';
import { Badge } from './Badge';
import { IngestCaseModal } from './IngestCaseModal';

interface TopBarProps {
  onMenuClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { selectedCaseId, setSelectedCaseId } = useSuraagStore();
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cases, setCases] = useState<any[]>([]);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3001/api/cases')
      .then(res => res.json())
      .then(data => {
        setCases(data);
        if (data.length > 0 && !selectedCaseId) {
          setSelectedCaseId(data[0].id);
        }
      })
      .catch(err => console.error("Failed to fetch cases", err));
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
      };
      const formatted = new Intl.DateTimeFormat('en-IN', options).format(now);
      setCurrentTime(formatted.replace(',', '') + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCaseId(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/cases?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-background/85 backdrop-blur-xl border-b border-outline-variant/50 shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex items-center justify-between px-3 sm:px-4 md:px-6">
      {/* Brand & Landing Link */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-6 shrink-0 min-w-0">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onMenuClick}
          className="md:hidden flex h-11 w-11 items-center justify-center rounded-lg border border-outline-variant/50 bg-surface-container text-on-surface shadow-sm"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/" className="flex items-center gap-3 group shrink-0 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center border border-primary/60 shadow-[0_0_15px_rgba(255,84,76,0.3)] group-hover:scale-105 transition-transform shrink-0">
            <ShieldAlert className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div className="hidden sm:flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display-lg text-xl font-bold tracking-tighter uppercase text-primary whitespace-nowrap">
                Suraag AI
              </span>
              <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-tactical-data bg-primary/20 text-primary border border-primary/50 uppercase whitespace-nowrap">
                Enterprise v4.2
              </span>
            </div>
            <span className="hidden lg:block text-[10px] font-tactical-data tracking-widest text-on-surface-variant uppercase whitespace-nowrap">
              Reconstruct. Analyze. Reveal the Truth.
            </span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-3 pl-6 border-l border-outline-variant/40 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-surface-container border border-outline-variant/40">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-tactical-data text-on-surface">MULTI-SENSOR FUSION:</span>
            <Badge variant="active" pulse>94.2% CONFIDENCE</Badge>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-surface-container border border-outline-variant/40">
            <Radio className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-xs font-tactical-data text-on-surface-variant">LATTICE LINK:</span>
            <span className="text-xs font-tactical-data text-primary font-bold">ONLINE</span>
          </div>
        </div>
      </div>

      {/* Center/Right Controls: Case Selector & Quick Search */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0 overflow-hidden">
        {/* Quick Search */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative shrink-0">
          <input
            type="text"
            placeholder="Search entities, suspects, GPS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 xl:w-60 h-8 bg-surface-container-low text-[10px] font-tactical-data text-on-surface rounded border border-outline-variant/60 pl-7 pr-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/60"
          />
          <Search className="w-3.5 h-3.5 text-on-surface-variant absolute left-2.5 top-2 pointer-events-none" />
        </form>

        {/* Active Case Selector */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5 bg-surface-container-high px-2 py-1 rounded border border-primary/40 shadow-[0_0_10px_rgba(255,84,76,0.15)]">
            <Database className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline-block text-[10px] font-tactical-data text-on-surface-variant uppercase">Case:</span>
            <select
              value={selectedCaseId}
              onChange={handleCaseChange}
              className="min-h-11 bg-transparent font-tactical-data text-[10px] text-primary font-bold focus:outline-none cursor-pointer max-w-[88px] sm:max-w-[140px] truncate"
            >
              {cases.length === 0 && <option value="CASE-2026-901M" className="bg-surface-container-high text-primary">CASE-2026-901M: The Doomed Triangle</option>}
              {cases.map(c => (
                <option key={c.id} value={c.id} className="bg-surface-container-high text-primary">
                  {c.caseNumber}: {c.title}
                </option>
              ))}
            </select>
          </div>
          <button 
            onClick={() => setIsIngestModalOpen(true)}
            className="flex min-h-11 items-center gap-1 bg-primary/20 text-primary hover:bg-primary/40 border border-primary/40 px-2 py-1 rounded text-[10px] font-tactical-data uppercase transition-all"
            title="Ingest New Case via AI"
          >
            + NEW CASE
          </button>
        </div>

        {/* Live Timestamp */}
        <div className="hidden md:flex flex-col items-end border-l border-outline-variant/40 pl-4 font-tactical-data shrink-0">
          <span className="text-[10px] text-on-surface-variant whitespace-nowrap">SYSTEM TIME</span>
          <span className="text-xs text-on-surface font-semibold tracking-wider whitespace-nowrap">{currentTime || 'SYNCING...'}</span>
        </div>

        {/* Action Buttons */}
        <Link
          to="/"
          title="Return to Landing Page Overview"
          className="flex h-11 w-11 items-center justify-center rounded bg-surface-container hover:bg-secondary-container hover:text-primary transition-all border border-outline-variant/50 shrink-0"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>

        <button 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container hover:bg-secondary-container hover:text-primary transition-all border border-outline-variant/50 shrink-0 hover:scale-105 active:scale-95"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button className="flex h-11 w-11 items-center justify-center rounded bg-surface-container hover:bg-secondary-container hover:text-primary transition-all border border-outline-variant/50 relative shrink-0">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
        </button>
      </div>
      <IngestCaseModal 
        isOpen={isIngestModalOpen} 
        onClose={() => setIsIngestModalOpen(false)} 
        onSuccess={(id) => {
          setIsIngestModalOpen(false);
          fetch('http://localhost:3001/api/cases')
            .then(res => res.json())
            .then(data => setCases(data));
        }} 
      />
    </header>
  );
};
