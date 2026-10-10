import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { trackComplaintPublic } from '../lib/api';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/common/Badges';

interface TrackComplaintPageProps {
  onNavigate: (page: string) => void;
}

export const TrackComplaintPage: React.FC<TrackComplaintPageProps> = ({ onNavigate }) => {
  const [refCode, setRefCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent, customCode?: string) => {
    if (e) e.preventDefault();
    const query = (customCode || refCode).trim().toUpperCase();

    if (!query) {
      setErrorMsg('Please enter a complaint reference code.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const data = await trackComplaintPublic(query);
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'No complaint found matching this reference code.');
    } finally {
      setLoading(false);
    }
  };

  const setSampleCode = (code: string) => {
    setRefCode(code);
    handleSearch(undefined, code);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Title */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Public Accountability</span>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Track Complaint Status</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Enter your unique reference code to check current municipal inspection, assignment, and resolution progress.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={refCode}
                onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                placeholder="Enter Reference (e.g. CP-2026-MG821)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white font-mono placeholder-slate-500 uppercase tracking-wider focus:outline-none focus:border-teal-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md shadow-teal-500/20"
            >
              <span>{loading ? 'Searching...' : 'Track Issue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick sample chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-1">
            <span>Try sample codes:</span>
            {['CP-2026-MG821', 'CP-2026-WL912', 'CP-2026-SL105'].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setSampleCode(code)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 font-mono text-[11px] border border-slate-700 transition"
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {/* Error notice */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-200 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Not Found:</span> {errorMsg}
            </div>
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Reference Code</span>
                <div className="text-xl font-mono font-black text-teal-300">{result.referenceCode}</div>
              </div>
              <StatusBadge status={result.status} />
            </div>

            {/* Title & Info */}
            <div>
              <h2 className="text-lg font-bold text-white">{result.title}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  <span>{result.addressArea}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Department: <strong className="text-slate-200">{result.department}</strong></span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Logged: {new Date(result.createdAt).toLocaleDateString()}</span>
                </span>
              </div>
            </div>

            {/* Resolution Note if present */}
            {result.publicResolutionNote && (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/80 text-xs text-emerald-100 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Public Resolution Verified</span>
                </div>
                <p className="leading-relaxed">{result.publicResolutionNote}</p>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-teal-400">
                Official Redressal Timeline
              </h3>

              <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {result.timeline.map((entry: any, idx: number) => (
                  <div key={entry.id || idx} className="relative">
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-teal-500" />
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white capitalize">{entry.status.replace('_', ' ')}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(entry.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{entry.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy Protection Notice */}
            <div className="pt-4 border-t border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>
                To safeguard resident privacy under municipal data governance regulations, citizen phone numbers,
                identities, and internal staff notes are excluded from public tracking.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
