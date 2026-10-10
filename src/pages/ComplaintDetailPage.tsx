import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  MapPin,
  Calendar,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Wrench,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchComplaintById } from '../lib/api';
import { Complaint } from '../types';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/common/Badges';
import { LeafletMap } from '../components/common/LeafletMap';
import { AIAnalysisCard } from '../components/common/AIAnalysisCard';

interface ComplaintDetailPageProps {
  complaintId?: string;
  onNavigate: (page: string, params?: { id?: string }) => void;
}

export const ComplaintDetailPage: React.FC<ComplaintDetailPageProps> = ({
  complaintId,
  onNavigate,
}) => {
  const { user, isAdmin } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (complaintId) {
      loadDetails(complaintId);
    } else {
      setLoading(false);
    }
  }, [complaintId]);

  const loadDetails = async (id: string) => {
    setLoading(true);
    try {
      const data = await fetchComplaintById(id, {
        citizenId: user?.id,
        role: user?.role,
      });
      setComplaint(data);
    } catch (err) {
      console.error('Failed to load complaint:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyRefCode = () => {
    if (!complaint) return;
    navigator.clipboard.writeText(complaint.referenceCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] bg-slate-950 flex items-center justify-center text-slate-400 py-16">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-[80vh] bg-slate-950 flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center space-y-4 bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Complaint Not Found</h2>
          <p className="text-xs text-slate-400">
            This complaint may not exist or you may not have authorization to view it.
          </p>
          <button
            onClick={() => onNavigate(isAdmin ? 'admin_complaints' : 'citizen_dashboard')}
            className="px-4 py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back link */}
        <button
          onClick={() => onNavigate(isAdmin ? 'admin_complaints' : 'citizen_dashboard')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {isAdmin ? 'Admin Queue' : 'My Complaints'}</span>
        </button>

        {/* Header Hero Banner */}
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={copyRefCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-750 font-mono text-xs font-black text-teal-300 hover:bg-slate-800 transition"
                title="Copy reference code"
              >
                <span>{complaint.referenceCode}</span>
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              </button>

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

            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Logged on {new Date(complaint.createdAt).toLocaleDateString()}</span>
            </span>

            {complaint.department && (
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Department: <strong className="text-slate-200 font-semibold">{complaint.department}</strong></span>
              </span>
            )}
          </div>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Description, Photo, Map */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <h2 className="text-xs uppercase font-extrabold tracking-wider text-teal-400">
                Grievance Description
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {complaint.description}
              </p>
            </div>

            {/* Photo Evidence */}
            {complaint.photoUrl && (
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                <h2 className="text-xs uppercase font-extrabold tracking-wider text-teal-400">
                  Visual Evidence Photo
                </h2>
                <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-96">
                  <img
                    src={complaint.photoUrl}
                    alt={complaint.title}
                    className="w-full h-auto object-cover max-h-96 hover:scale-101 transition duration-300"
                  />
                </div>
              </div>
            )}

            {/* Resolution Note if resolved */}
            {complaint.publicResolutionNote && (
              <div className="p-6 rounded-3xl bg-emerald-950/40 border border-emerald-800/80 shadow-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Municipal Resolution Note</span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                  {complaint.publicResolutionNote}
                </p>
              </div>
            )}

            {/* AI Triage Card */}
            {complaint.aiCategory && (
              <div>
                <AIAnalysisCard
                  analysis={{
                    category: complaint.aiCategory,
                    confidence: complaint.aiConfidence,
                    explanation: complaint.aiExplanation || complaint.priorityReason,
                    priority: complaint.aiPriority || complaint.priority,
                    department: (complaint.department as any) || 'Roads',
                    source: 'gemini',
                  }}
                />
              </div>
            )}

            {/* Map Pin Location */}
            {complaint.latitude && complaint.longitude && (
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs uppercase font-extrabold tracking-wider text-teal-400">
                    Geographic Coordinates
                  </h2>
                  <span className="text-[11px] font-mono text-slate-400">
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
          </div>

          {/* Right Column: Status Timeline & Audit History */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              <div>
                <h2 className="text-xs uppercase font-extrabold tracking-wider text-teal-400">
                  Status Timeline & Audit
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Chronological record of municipal actions</p>
              </div>

              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {complaint.updates && complaint.updates.length > 0 ? (
                  complaint.updates.map((update, idx) => (
                    <div key={update.id || idx} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-teal-500 group-hover:scale-110 transition" />

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white capitalize">
                            {update.newStatus.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(update.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="text-[11px] text-teal-400 font-medium">
                          By: {update.actorName} ({update.actorRole})
                        </div>

                        {update.publicNote && (
                          <p className="text-xs text-slate-300 leading-relaxed p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                            {update.publicNote}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No updates logged yet.</p>
                )}
              </div>
            </div>

            {/* Public Tracking Share Tool */}
            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
              <span className="font-bold text-slate-300 block">Share Public Tracking Reference</span>
              <p className="leading-relaxed text-[11px]">
                Anyone in your community can track this issue using the reference code{' '}
                <strong className="text-teal-300 font-mono">{complaint.referenceCode}</strong> on the public portal.
              </p>
              <button
                onClick={() => onNavigate('track')}
                className="text-teal-400 hover:text-teal-300 font-semibold inline-flex items-center gap-1 text-[11px]"
              >
                <span>Open Public Tracker</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
