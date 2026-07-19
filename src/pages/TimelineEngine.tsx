import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, AlertTriangle, Radio, Video, Volume2, ShieldAlert, Filter, Search, CheckCircle2, ChevronRight } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useSuraagStore } from '../store/useSuraagStore';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const TimelineEngine: React.FC = () => {
  const { selectedCaseId } = useSuraagStore();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: timelineEvents = [], isLoading } = useQuery({
    queryKey: ['timeline', selectedCaseId],
    queryFn: () => apiClient.timeline.getAll(selectedCaseId),
  });

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'AUDIO':
        return Volume2;
      case 'CCTV':
        return Video;
      case 'NETWORK':
      default:
        return Radio;
    }
  };

  const filteredEvents = timelineEvents.filter((e) => {
    if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;
    if (searchQuery && !e.title.toLowerCase().includes(searchQuery.toLowerCase()) && !e.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              MULTI-SENSOR CHRONOLOGICAL FUSION ENGINE
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            Chronological Timeline Engine
          </h1>
        </div>
        <Badge variant="confidence" pulse>CHRONOLOGY SYNC: 100% VERIFIED</Badge>
      </div>

      {/* Filter Toolbar */}
      <GlassCard className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 font-tactical-data text-xs">
          <Filter className="w-4 h-4 text-primary mr-1" />
          {['ALL', 'CCTV', 'AUDIO', 'NETWORK', 'WITNESS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded transition-all border ${
                selectedCategory === cat
                  ? 'bg-secondary-container text-primary border-primary font-bold shadow-[0_0_10px_rgba(255,84,76,0.3)]'
                  : 'bg-surface-container text-on-surface-variant border-outline-variant hover:text-on-surface'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search timeline events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 bg-surface-container-low text-xs font-tactical-data text-on-surface rounded border border-outline-variant pl-9 pr-3 focus:outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/60"
          />
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5 pointer-events-none" />
        </div>
      </GlassCard>

      {/* Chronological Timeline Stream */}
      {isLoading ? (
        <LoadingSkeleton rows={4} height="h-24" />
      ) : (
        <div className="relative pl-6 md:pl-10 space-y-6 before:absolute before:left-2 md:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-outline-variant before:to-transparent">
          {filteredEvents.map((ev, idx) => {
            const Icon = getIcon(ev.category);
            const hasAnomaly = ev.confidence < 95.0;
            return (
              <div key={idx} className="relative group">
                {/* Timeline node circle */}
                <div
                  className={`absolute -left-6 md:-left-10 top-5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-125 ${
                    hasAnomaly
                      ? 'bg-primary border-primary shadow-[0_0_12px_#ff544c]'
                      : 'bg-surface-container border-emerald-400'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${hasAnomaly ? 'bg-white' : 'bg-emerald-400'}`} />
                </div>

                <GlassCard
                  glow={hasAnomaly}
                  className={`p-5 hover:border-primary/70 transition-all ${
                    hasAnomaly ? 'border-primary/60 bg-secondary-container/20' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-outline-variant/30">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded bg-surface-container border border-outline-variant font-tactical-data text-xs font-bold text-primary">
                        {ev.timestamp} UTC
                      </span>
                      <Badge variant={hasAnomaly ? 'critical' : 'active'}>{ev.category}</Badge>
                      {hasAnomaly && (
                        <Badge variant="critical" pulse>
                          ANOMALY DETECTED
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 font-tactical-data text-xs">
                      <span className="text-on-surface-variant">SENSOR CONFIDENCE:</span>
                      <span className={hasAnomaly ? 'text-primary font-bold' : 'text-emerald-400 font-bold'}>
                        {ev.confidence}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-start gap-3">
                    <div className="p-2 rounded bg-surface-container border border-outline-variant/40 shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display-lg font-bold text-lg text-on-surface uppercase">
                        {ev.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant font-body-md mt-1 leading-relaxed">
                        {ev.description}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
