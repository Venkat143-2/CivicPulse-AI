import React, { useEffect, useState } from 'react';
import {
  Compass,
  ArrowLeft,
  Filter,
  Layers,
  MapPin,
  ChevronRight,
  Sparkles,
  AlertOctagon,
} from 'lucide-react';
import { fetchComplaints } from '../lib/api';
import { Complaint, ComplaintPriority, ComplaintStatus } from '../types';
import { LeafletMap } from '../components/common/LeafletMap';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/common/Badges';

interface AdminMapPageProps {
  onNavigate: (page: string, params?: { id?: string }) => void;
}

export const AdminMapPage: React.FC<AdminMapPageProps> = ({ onNavigate }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    loadComplaints();
  }, [statusFilter, priorityFilter]);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const data = await fetchComplaints({
        role: 'admin',
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      });
      setComplaints(data.complaints);
      if (data.complaints.length > 0 && !selectedComplaint) {
        setSelectedComplaint(data.complaints[0]);
      }
    } catch (err) {
      console.error('Failed to load map complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="max-w-7xl mx-auto w-full space-y-4 flex-1 flex flex-col">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('admin_dashboard')}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-black text-white flex items-center gap-2">
                <span>City Geospatial Redressal Map</span>
                <span className="text-[10px] font-bold text-teal-400 px-2 py-0.5 rounded bg-teal-950 border border-teal-800">
                  Live View
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Visualizing active infrastructure bottlenecks, pothole clusters, and water bursts.
              </p>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1">
          {/* Main Map */}
          <div className="lg:col-span-3 rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl relative min-h-[500px]">
            <LeafletMap
              mode="multi"
              complaints={complaints}
              onComplaintSelect={(c) => setSelectedComplaint(c)}
              className="w-full h-full min-h-[500px]"
            />

            {/* Legend Overlay */}
            <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl shadow-lg text-[11px] text-slate-300 space-y-1 hidden sm:block">
              <div className="font-bold text-white text-[10px] uppercase tracking-wider mb-1">Priority Pins</div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span>Critical Urgency</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>High Hazard</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                <span>Medium Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Low Priority</span>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Selected Complaint or List */}
          <div className="space-y-4">
            {selectedComplaint ? (
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-teal-300">
                    {selectedComplaint.referenceCode}
                  </span>
                  <StatusBadge status={selectedComplaint.status} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">{selectedComplaint.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                    {selectedComplaint.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Category:</span>
                    <CategoryBadge category={selectedComplaint.category} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Priority:</span>
                    <PriorityBadge priority={selectedComplaint.priority} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Department:</span>
                    <span className="font-semibold">{selectedComplaint.department || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-start gap-1.5 pt-1 text-slate-400 text-[11px]">
                    <MapPin className="w-3 h-3 text-teal-400 shrink-0 mt-0.5" />
                    <span>{selectedComplaint.address}</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('admin_complaint_review', { id: selectedComplaint.id })}
                  className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <span>Open Triage Ticket &rarr;</span>
                </button>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
                Click any pin on the map to inspect details
              </div>
            )}

            {/* Quick List */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2 max-h-60 overflow-y-auto">
              <span className="text-[10px] uppercase font-bold text-slate-400 block px-1">
                Mapped Complaints ({complaints.length})
              </span>
              {complaints.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedComplaint(c)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                    selectedComplaint?.id === c.id
                      ? 'bg-slate-800 border-teal-500/60 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold truncate">{c.title}</div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                    <span>{c.referenceCode}</span>
                    <span className="capitalize">{c.status.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
