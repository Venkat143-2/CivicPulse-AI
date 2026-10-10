import React, { useEffect, useState } from 'react';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Copy,
  Check,
  ChevronRight,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchComplaints } from '../lib/api';
import { Complaint } from '../types';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/common/Badges';

interface CitizenDashboardPageProps {
  onNavigate: (page: string, params?: { id?: string }) => void;
}

export const CitizenDashboardPage: React.FC<CitizenDashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadComplaints();
  }, [user]);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetchComplaints({
        citizenId: user?.id || 'citizen-demo-1',
        role: 'citizen',
      });
      setComplaints(res.complaints);
    } catch (err) {
      console.error('Failed to load citizen complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyRefCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Metrics
  const total = complaints.length;
  const inProgress = complaints.filter(
    (c) => c.status === 'in_progress' || c.status === 'assigned' || c.status === 'under_review'
  ).length;
  const resolved = complaints.filter((c) => c.status === 'resolved').length;
  const submitted = complaints.filter((c) => c.status === 'submitted').length;

  // Filtered
  const filtered = complaints.filter((c) => {
    if (filterStatus === 'active') {
      return c.status !== 'resolved' && c.status !== 'rejected';
    }
    if (filterStatus === 'resolved') {
      return c.status === 'resolved';
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.referenceCode.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div>
            <div className="text-xs font-bold text-teal-400 uppercase tracking-wider">Citizen Portal</div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Welcome, {user?.fullName || 'Resident'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage your community reports and check real-time municipal inspection progress.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('new_complaint')}
              className="px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition hover:scale-102"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Report New Issue</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            onClick={() => setFilterStatus('all')}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-slate-900 border-teal-500/50 shadow-md'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
              <span>Total Reports</span>
              <Layers className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-white mt-2">{total}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">All logged issues</div>
          </div>

          <div
            onClick={() => setFilterStatus('active')}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              filterStatus === 'active'
                ? 'bg-slate-900 border-teal-500/50 shadow-md'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-xs text-amber-400 font-semibold flex items-center justify-between">
              <span>In Progress / Assigned</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white mt-2">{inProgress}</div>
            <div className="text-[11px] text-amber-400/80 mt-0.5">Under field crew repair</div>
          </div>

          <div
            onClick={() => setFilterStatus('resolved')}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              filterStatus === 'resolved'
                ? 'bg-slate-900 border-teal-500/50 shadow-md'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-xs text-emerald-400 font-semibold flex items-center justify-between">
              <span>Resolved</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white mt-2">{resolved}</div>
            <div className="text-[11px] text-emerald-400/80 mt-0.5">Completed & closed</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs text-sky-400 font-semibold flex items-center justify-between">
              <span>Pending Review</span>
              <AlertCircle className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-white mt-2">{submitted}</div>
            <div className="text-[11px] text-sky-400/80 mt-0.5">Awaiting municipal dispatch</div>
          </div>
        </div>

        {/* Complaints List Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Your Submitted Complaints</h2>
              <p className="text-xs text-slate-400">Click on any card to view the official update timeline</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, ref..."
                  className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                    filterStatus === 'all' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                    filterStatus === 'active'
                      ? 'bg-teal-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterStatus('resolved')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                    filterStatus === 'resolved'
                      ? 'bg-teal-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Resolved
                </button>
              </div>
            </div>
          </div>

          {/* List or Empty State */}
          {loading ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Loading your complaints...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center space-y-4 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div className="max-w-sm mx-auto space-y-1">
                <h3 className="text-sm font-bold text-white">No complaints found</h3>
                <p className="text-xs text-slate-400">
                  {searchQuery || filterStatus !== 'all'
                    ? 'No results match your active filter criteria.'
                    : "You haven't submitted any civic complaints yet. Help improve your neighborhood today!"}
                </p>
              </div>
              <button
                onClick={() => onNavigate('new_complaint')}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition"
              >
                Submit First Report
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onNavigate('citizen_complaint_detail', { id: c.id })}
                  className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition cursor-pointer group hover:bg-slate-950/90 shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Reference code copy button */}
                      <button
                        type="button"
                        onClick={(e) => copyRefCode(c.referenceCode, e)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 font-mono text-xs font-bold text-teal-300 hover:bg-slate-800"
                        title="Click to copy Reference Code"
                      >
                        <span>{c.referenceCode}</span>
                        {copiedCode === c.referenceCode ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-500" />
                        )}
                      </button>

                      <CategoryBadge category={c.category} />
                      <PriorityBadge priority={c.priority} />
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={c.status} />
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition hidden sm:block" />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-2 group-hover:text-teal-300 transition">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{c.description}</p>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                        <span className="truncate max-w-[200px] sm:max-w-xs">{c.address}</span>
                      </span>
                      {c.department && (
                        <span className="hidden sm:inline text-slate-400">
                          Dept: <strong className="text-slate-300 font-medium">{c.department}</strong>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
