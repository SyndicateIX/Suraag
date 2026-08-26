import React from 'react';
import { CDRAnalytics } from '../../types/telecom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  PhoneCall,
  Clock,
  Radio,
  Flame,
  Moon,
  Zap,
  Users,
  Activity,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

interface CDRAnalyticsViewProps {
  analytics: CDRAnalytics | null;
  loading: boolean;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];

export const CDRAnalyticsView: React.FC<CDRAnalyticsViewProps> = ({
  analytics,
  loading,
}) => {
  if (loading || !analytics) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-12 text-center text-zinc-500 font-mono text-xs">
        <Activity className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-400" />
        Calculating statistical burst profiles and communication frequencies...
      </div>
    );
  }

  // Format call types for Pie Chart
  const pieData = Object.entries(analytics.callTypeBreakdown || {}).map(([name, value]) => ({
    name,
    value,
  }));

  // Top 8 frequent communicators
  const topNumbersData = (analytics.topContactedNumbers || []).slice(0, 8).map(t => ({
    number: t.number.length > 10 ? t.number.slice(-8) : t.number,
    fullNumber: t.number,
    totalCalls: t.totalCalls,
    outCalls: t.outCalls,
    inCalls: t.inCalls,
    totalMinutes: Math.round(t.totalDuration / 60),
  }));

  return (
    <div className="space-y-6 font-mono text-zinc-100">
      {/* 4 Summary KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Calls */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 relative overflow-hidden backdrop-blur-xl group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 uppercase font-semibold">Total Call Records</span>
            <PhoneCall className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-100 tracking-tight">
              {analytics.totalRecords}
            </span>
            <span className="text-xs text-emerald-400">
              ({analytics.totalUniqueNumbers} unique MSISDNs)
            </span>
          </div>
        </div>

        {/* Total Airtime */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 relative overflow-hidden backdrop-blur-xl group hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 uppercase font-semibold">Total Airtime Duration</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-100 tracking-tight">
              {Math.round(analytics.totalDurationSeconds / 60)} <span className="text-sm text-zinc-400">min</span>
            </span>
            <span className="text-xs text-zinc-400">
              (Avg: {analytics.avgDurationSeconds}s)
            </span>
          </div>
        </div>

        {/* Night-Owl Activity */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 relative overflow-hidden backdrop-blur-xl group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 uppercase font-semibold">Night-Owl Bursts (23-05h)</span>
            <Moon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400 tracking-tight">
              {analytics.nightCallsCount}
            </span>
            <span className="text-xs text-amber-400/80">
              ({Math.round((analytics.nightCallRatio || 0) * 100)}% of dataset)
            </span>
          </div>
        </div>

        {/* Short Signaling / Missed Bursts */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 relative overflow-hidden backdrop-blur-xl group hover:border-red-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 uppercase font-semibold">Signaling Pings (&lt;5s)</span>
            <Zap className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-400 tracking-tight">
              {analytics.shortBurstCalls}
            </span>
            <span className="text-xs text-red-400/80">
              One-ring stealth triggers
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Burst Histogram (8 Cols) */}
        <div className="lg:col-span-8 bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                24-Hour Temporal Burst Distribution
              </h3>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Night Window (23:00-05:00)
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Normal Daylight
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.hourlyBurstData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="hour" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }}
                  labelStyle={{ color: '#10b981', fontWeight: 'bold' }}
                />
                <Bar dataKey="calls" name="Total Calls" radius={[4, 4, 0, 0]}>
                  {analytics.hourlyBurstData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.nightOwl ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Call Type Breakdown Donut (4 Cols) */}
        <div className="lg:col-span-4 bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Service / Protocol Breakdown
            </h3>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`pie-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-zinc-500">No protocol data</span>
            )}
          </div>
        </div>
      </div>

      {/* Top Communicators Table & Chart */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Top Active Communicators (Volume & Airtime)
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400">
            Outbound vs. Inbound call balance
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topNumbersData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="number" stroke="#71717a" fontSize={10} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="outCalls" name="Outbound Calls" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="inCalls" name="Inbound Calls" fill="#3b82f6" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
