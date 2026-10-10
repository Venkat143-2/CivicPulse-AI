import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  ArrowLeft,
  PieChart,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { fetchKPIStats } from '../lib/api';
import { KPIStats } from '../types';

interface AdminAnalyticsPageProps {
  onNavigate: (page: string) => void;
}

export const AdminAnalyticsPage: React.FC<AdminAnalyticsPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<KPIStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKPIStats()
      .then(setStats)
      .catch((e) => console.error('Failed to load stats:', e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('admin_dashboard')}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Municipal Analytics</span>
              </div>
              <h1 className="text-2xl font-black text-white mt-0.5">SLA & Resolution Insights</h1>
            </div>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow space-y-1">
            <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>Average Resolution Turnaround</span>
            </div>
            <div className="text-3xl font-black text-white mt-1">
              {stats?.avgResolutionDays || 2.4} <span className="text-sm font-normal text-slate-400">days</span>
            </div>
            <p className="text-[11px] text-teal-400 font-medium">City SLA target: 3.5 days (Outperforming by 31%)</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow space-y-1">
            <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Resolution Rate</span>
            </div>
            <div className="text-3xl font-black text-white mt-1">
              {stats ? Math.round((stats.resolved / (stats.totalComplaints || 1)) * 100) : 25}%
            </div>
            <p className="text-[11px] text-emerald-400 font-medium">Complaints verified by municipal engineers</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow space-y-1">
            <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Urgent Redressal SLA</span>
            </div>
            <div className="text-3xl font-black text-white mt-1">
              {stats?.highPriority || 2} <span className="text-sm font-normal text-slate-400">active</span>
            </div>
            <p className="text-[11px] text-rose-400 font-medium">Assigned to rapid emergency field response squads</p>
          </div>
        </div>

        {/* Breakdown Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-teal-400" />
              <span>Civic Category Volume</span>
            </h2>

            <div className="space-y-3 pt-2">
              {stats?.byCategory &&
                Object.entries(stats.byCategory).map(([cat, count]: [string, number]) => {
                  const pct = Math.round((count / (stats.totalComplaints || 1)) * 100);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300 capitalize">{cat.replace('_', ' ')}</span>
                        <span className="font-mono text-teal-300">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Departmental Workload</span>
            </h2>

            <div className="space-y-3 pt-2">
              {stats?.byDepartment &&
                Object.entries(stats.byDepartment).map(([dept, count]: [string, number]) => {
                  const pct = Math.round((count / (stats.totalComplaints || 1)) * 100);
                  return (
                    <div key={dept} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">{dept}</span>
                        <span className="font-mono text-indigo-300">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
