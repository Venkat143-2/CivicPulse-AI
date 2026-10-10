import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Shield,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  RotateCcw,
  Sparkles,
  MapPin,
  Calendar,
} from 'lucide-react';
import { fetchComplaints } from '../lib/api';
import { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus, DEPARTMENTS } from '../types';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/common/Badges';

interface AdminComplaintsListPageProps {
  onNavigate: (page: string, params?: { id?: string }) => void;
}

export const AdminComplaintsListPage: React.FC<AdminComplaintsListPageProps> = ({ onNavigate }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  useEffect(() => {
    loadList();
  }, [statusFilter, categoryFilter, priorityFilter, deptFilter]);

  const loadList = async () => {
    setLoading(true);
    try {
      const data = await fetchComplaints({
        role: 'admin',
        status: statusFilter !== 'all' ? statusFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        department: deptFilter !== 'all' ? deptFilter : undefined,
        search: search.trim() || undefined,
      });
      setComplaints(data.complaints);
    } catch (err) {
      console.error('Failed to load admin complaints list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadList();
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setPriorityFilter('all');
    setDeptFilter('all');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Municipal Redressal Registry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Complaint Triage Queue</h1>
            <p className="text-xs text-slate-400">
              Review incoming public infrastructure grievances, assess Gemini AI classifications, and dispatch engineering units.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('admin_map')}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition"
            >
              Switch to Map View
            </button>
            <button
              onClick={() => onNavigate('admin_dashboard')}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition"
            >
              Back to KPI Dashboard
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by reference code, description, citizen, address..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition"
            >
              Search
            </button>
          </form>

          {/* Dropdown Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1">
            {/* Status */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Categories</option>
                <option value="pothole">Pothole / Road</option>
                <option value="garbage">Garbage & Waste</option>
                <option value="streetlight">Street Lighting</option>
                <option value="water_leakage">Water Leakage</option>
                <option value="drainage">Drainage & Sewage</option>
                <option value="other">Other Civic</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical Urgency</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Department</label>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Departments</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-end">
              <button
                type="button"
                onClick={resetFilters}
                className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Showing {complaints.length} registered grievances</span>
            <span className="font-semibold text-slate-300">Sorted by: Most Recent</span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400 space-y-2">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Loading grievance registry...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="py-20 text-center text-slate-400 space-y-2">
              <p className="text-sm font-semibold text-white">No complaints found</p>
              <p className="text-xs">Adjust your active search query or filter selections.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/40">
                    <th className="py-3.5 px-4 font-bold">Reference</th>
                    <th className="py-3.5 px-4 font-bold">Subject & Location</th>
                    <th className="py-3.5 px-4 font-bold">Category</th>
                    <th className="py-3.5 px-4 font-bold">Priority</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold">Department</th>
                    <th className="py-3.5 px-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {complaints.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => onNavigate('admin_complaint_review', { id: c.id })}
                      className="hover:bg-slate-800/50 transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-300 whitespace-nowrap">
                        {c.referenceCode}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-white group-hover:text-teal-300 transition truncate">
                          {c.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{c.address}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <CategoryBadge category={c.category} />
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <PriorityBadge priority={c.priority} />
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={c.status} />
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-300 font-medium">
                        {c.department || 'Unassigned'}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('admin_complaint_review', { id: c.id });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-teal-500 hover:text-slate-950 text-slate-200 text-xs font-semibold transition"
                        >
                          Triage & Review &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
