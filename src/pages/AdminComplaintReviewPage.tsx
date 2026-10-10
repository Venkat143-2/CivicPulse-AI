import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Shield,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  MapPin,
  Clock,
  Save,
  XCircle,
  FileText,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchComplaintById, updateComplaintByAdmin } from '../lib/api';
import {
  Complaint,
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
  DepartmentName,
  DEPARTMENTS,
} from '../types';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/common/Badges';
import { AIAnalysisCard } from '../components/common/AIAnalysisCard';
import { LeafletMap } from '../components/common/LeafletMap';

interface AdminComplaintReviewPageProps {
  complaintId?: string;
  onNavigate: (page: string, params?: { id?: string }) => void;
}

export const AdminComplaintReviewPage: React.FC<AdminComplaintReviewPageProps> = ({
  complaintId,
  onNavigate,
}) => {
  const { user } = useAuth();
  const { success, error, warning } = useToast();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields for Admin Updates
  const [status, setStatus] = useState<ComplaintStatus>('submitted');
  const [priority, setPriority] = useState<ComplaintPriority>('medium');
  const [department, setDepartment] = useState<DepartmentName>('Roads');
  const [publicNote, setPublicNote] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (complaintId) {
      loadComplaint(complaintId);
    }
  }, [complaintId]);

  const loadComplaint = async (id: string) => {
    setLoading(true);
    try {
      const data = await fetchComplaintById(id, { role: 'admin' });
      setComplaint(data);
      setStatus(data.status);
      setPriority(data.priority);
      if (data.department) {
        setDepartment(data.department as DepartmentName);
      }
    } catch (err: any) {
      error('Failed to load complaint', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle AI override acceptance
  const handleApplyAI = (cat: ComplaintCategory, prio: ComplaintPriority, dept: DepartmentName) => {
    setPriority(prio);
    setDepartment(dept);
    setPublicNote(`Triage approved according to AI recommendations. Allocated to ${dept}.`);
    success('AI Recommendations Applied', `Updated priority to ${prio} and assigned to ${dept}`);
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;

    if (status === 'rejected' && !rejectionReason.trim() && !publicNote.trim()) {
      warning('Rejection Reason Required', 'Please provide a formal explanation for rejecting this civic report.');
      return;
    }

    setSaving(true);
    try {
      const res = await updateComplaintByAdmin(complaint.id, {
        status,
        priority,
        department,
        publicNote: publicNote.trim() || undefined,
        internalNote: internalNote.trim() || undefined,
        rejectionReason: status === 'rejected' ? rejectionReason.trim() : undefined,
        actorName: user?.fullName || 'Municipal Officer',
      });

      setComplaint(res.complaint);
      setPublicNote('');
      setInternalNote('');
      setRejectionReason('');
      success('Complaint Updated', `Status transitioned to ${status}`);
    } catch (err: any) {
      error('Update failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] bg-slate-950 flex items-center justify-center py-20 text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-[80vh] bg-slate-950 flex items-center justify-center py-20 px-4">
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-3 max-w-sm">
          <p className="font-bold text-white">Complaint Not Found</p>
          <button
            onClick={() => onNavigate('admin_complaints')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
          >
            Back to Queue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <button
          onClick={() => onNavigate('admin_complaints')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Triage Queue</span>
        </button>

        {/* Header Banner */}
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-black text-teal-300 px-3 py-1 bg-slate-950 border border-slate-750 rounded-lg">
                {complaint.referenceCode}
              </span>
              <CategoryBadge category={complaint.category} />
              <PriorityBadge priority={complaint.priority} />
            </div>
            <StatusBadge status={complaint.status} />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white">{complaint.title}</h1>

          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>{complaint.address}</span>
            </span>
            <span>Citizen: <strong className="text-slate-200">{complaint.citizenName}</strong></span>
            <span>Logged: {new Date(complaint.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {/* 2-Column Workflow Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: AI Review & Evidence */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Review Card */}
            {complaint.aiCategory && (
              <div>
                <AIAnalysisCard
                  analysis={{
                    category: complaint.aiCategory,
                    confidence: complaint.aiConfidence,
                    explanation: complaint.aiExplanation || complaint.priorityReason,
                    priority: complaint.aiPriority || complaint.priority,
                    department: (complaint.department as DepartmentName) || 'Roads',
                    source: 'gemini',
                  }}
                  isAdmin={true}
                  onApplyOverride={handleApplyAI}
                />
              </div>
            )}

            {/* Description Card */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <h2 className="text-xs uppercase font-extrabold tracking-wider text-teal-400">
                Citizen Grievance Description
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {complaint.description}
              </p>
            </div>

            {/* Photo Evidence if uploaded */}
            {complaint.photoUrl && (
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                <h2 className="text-xs uppercase font-extrabold tracking-wider text-teal-400">
                  Citizen Uploaded Photo
                </h2>
                <div className="rounded-2xl overflow-hidden border border-slate-800">
                  <img src={complaint.photoUrl} alt="Evidence" className="w-full max-h-96 object-cover" />
                </div>
              </div>
            )}

            {/* Map Pin View */}
            {complaint.latitude && complaint.longitude && (
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs uppercase font-extrabold tracking-wider text-teal-400">
                    Geospatial Location
                  </h2>
                  <span className="font-mono text-xs text-slate-400">
                    {complaint.latitude}, {complaint.longitude}
                  </span>
                </div>
                <LeafletMap
                  mode="single"
                  latitude={complaint.latitude}
                  longitude={complaint.longitude}
                  className="h-64 w-full rounded-2xl"
                />
              </div>
            )}

            {/* Complete Status Audit Trail */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <h2 className="text-xs uppercase font-extrabold tracking-wider text-teal-400">
                Audit Trail & History Log
              </h2>
              <div className="space-y-4">
                {complaint.updates.map((u, i) => (
                  <div key={u.id || i} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white capitalize">{u.newStatus.replace('_', ' ')}</span>
                      <span className="text-[10px] text-slate-500">{new Date(u.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="text-[11px] text-teal-400">
                      Action by: {u.actorName} ({u.actorRole})
                    </div>
                    {u.publicNote && (
                      <p className="text-xs text-slate-300 pt-1">
                        <strong className="text-slate-400">Public Note:</strong> {u.publicNote}
                      </p>
                    )}
                  </div>
                ))}

                {complaint.internalNotes && complaint.internalNotes.length > 0 && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Confidential Internal Notes ({complaint.internalNotes.length})</span>
                    </div>
                    {complaint.internalNotes.map((n, idx) => (
                      <div key={n.id || idx} className="p-3 rounded-2xl bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-amber-400/80">
                          <span className="font-semibold">By: {n.author_name || n.authorName || 'Municipal Officer'}</span>
                          <span>{new Date(n.created_at || n.createdAt || '').toLocaleString()}</span>
                        </div>
                        <p className="leading-relaxed">{n.note}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Municipal Dispatch & Status Transition Form */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-900/60 shadow-2xl space-y-5 sticky top-20">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Official Action</span>
                <h2 className="text-base font-black text-white">Triage & Dispatch Controls</h2>
              </div>

              <form onSubmit={handleSaveUpdate} className="space-y-4">
                {/* Status Transition */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status Transition</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  >
                    <option value="submitted">Submitted (Unprocessed)</option>
                    <option value="under_review">Under Municipal Review</option>
                    <option value="assigned">Assigned to Department</option>
                    <option value="in_progress">In Progress (Field Work Active)</option>
                    <option value="resolved">Resolved & Closed</option>
                    <option value="rejected">Rejected (Requires Reason)</option>
                  </select>
                </div>

                {/* Priority Override */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority Override</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Urgency</option>
                    <option value="critical">Critical Hazard</option>
                  </select>
                </div>

                {/* Assigned Department */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as DepartmentName)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* If Rejected, mandatory reason */}
                {status === 'rejected' && (
                  <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-xl space-y-1">
                    <label className="block text-[11px] font-bold text-rose-300">
                      Rejection Reason (Mandatory) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Private property outside BBMP jurisdiction"
                      className="w-full bg-slate-900 border border-rose-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                )}

                {/* Public Note */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Public Update Note (Visible to Citizen)
                  </label>
                  <textarea
                    rows={2}
                    value={publicNote}
                    onChange={(e) => setPublicNote(e.target.value)}
                    placeholder="e.g. Ward 24 maintenance crew dispatched for cold-mix patch."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Internal Administrative Note */}
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span>Internal Note (Confidential, Admin Only)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="e.g. Contractor #KA-38 bill pending; priority inspection required."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md shadow-indigo-600/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Recording Action...' : 'Save & Publish Status Update'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
