import React, { useEffect, useState } from 'react';
import {
  Shield,
  Layers,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  Compass,
  BarChart3,
  Building2,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { fetchKPIStats, fetchComplaints } from '../lib/api';
import { KPIStats, Complaint } from '../types';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/common/Badges';

interface AdminDashboardPageProps {
  onNavigate: (page: string, params?: { id?: string }) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<KPIStats | null>(null);
  const [criticalComplaints, setCriticalComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchKPIStats(), fetchComplaints({ priority: 'all' })])
      .then(([statsData, complaintsData]) => {
        setStats(statsData);
        // Find high & critical items
        const urgent = complaintsData.complaints
          .filter((c) => c.priority === 'critical' || c.priority === 'high')
          .slice(0, 5);
        setCriticalComplaints(urgent);
      })
      .catch((err) => console.error('Error loading admin dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div>
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Municipal Operations Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Grievance Triage & Resolution</h1>
            <p className="text-xs text-slate-400 mt-1">
              Oversee citywide infrastructure complaints, verify AI triage recommendations, and dispatch field crews.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('admin_complaints')}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-md shadow-teal-500/20"
            >
              <span>Open Triage Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onNavigate('admin_map')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-2 transition"
            >
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              <span>City Geospatial Map</span>
            </button>
          </div>
        </div>

        {/* Real KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow">
            <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
              <span>Total Lodged</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-black text-white mt-2">{stats ? stats.totalComplaints : '...'}</div>
            <div className="text-[11px] text-slate-400 mt-1">All civic reports</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow">
            <div className="text-xs font-semibold text-sky-400 flex items-center justify-between">
              <span>Under Review</span>
              <Clock className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-3xl font-black text-white mt-2">
              {stats ? stats.submitted + stats.underReview : '...'}
            </div>
            <div className="text-[11px] text-sky-400 mt-1">Awaiting dispatch</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow">
            <div className="text-xs font-semibold text-amber-400 flex items-center justify-between">
              <span>In Progress</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-white mt-2">{stats ? stats.inProgress : '...'}</div>
            <div className="text-[11px] text-amber-400 mt-1">Crew on ground</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow">
            <div className="text-xs font-semibold text-emerald-400 flex items-center justify-between">
              <span>Resolved SLA</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white mt-2">{stats ? stats.resolved : '...'}</div>
            <div className="text-[11px] text-emerald-400 mt-1">Closed & verified</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-rose-900/60 shadow col-span-2 lg:col-span-1">
            <div className="text-xs font-semibold text-rose-400 flex items-center justify-between">
              <span>High / Critical</span>
              <AlertOctagon className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-3xl font-black text-rose-300 mt-2">{stats ? stats.highPriority : '...'}</div>
            <div className="text-[11px] text-rose-400 mt-1">Immediate hazard</div>
          </div>
        </div>

        {/* Priority Attention Queue & Department breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Urgent Hazard Queue */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>High & Critical Urgency Queue</span>
                </h2>
                <p className="text-xs text-slate-400">Complaints flagged by Gemini triage for expedited response</p>
              </div>

              <button
                onClick={() => onNavigate('admin_complaints')}
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 pt-1">
              {criticalComplaints.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onNavigate('admin_complaint_review', { id: c.id })}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-300">{c.referenceCode}</span>
                      <CategoryBadge category={c.category} />
                      <PriorityBadge priority={c.priority} />
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition truncate">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{c.address}</p>
                  </div>

                  <div className="flex sm:flex-col sm:items-end justify-between items-center shrink-0">
                    <StatusBadge status={c.status} />
                    <span className="text-[11px] text-slate-400 mt-1">{c.department || 'General'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Workload Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-400" />
                <span>Department Workload</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Active issues by municipal division</p>

              <div className="mt-4 space-y-3">
                {stats?.byDepartment &&
                  Object.entries(stats.byDepartment).map(([dept, count]: [string, number]) => (
                    <div key={dept} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">{dept}</span>
                        <span className="font-mono font-bold text-teal-300">{count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{
                            width: `${Math.min(100, (count / (stats.totalComplaints || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => onNavigate('admin_analytics')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <BarChart3 className="w-4 h-4 text-teal-400" />
                <span>Open Resolution Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
