import React from 'react';
import { ShieldCheck, Lock, EyeOff, Key, Database, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface PrivacyPageProps {
  onNavigate: (page: string) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Civic Data Protection & Statutory Transparency</span>
          </div>
          <h1 className="text-3xl font-black text-white">Privacy & Statutory Compliance Policy</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            How CivicPulse AI collects, protects, isolates, and audits citizen grievance data.
          </p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* Section 1: Crucial Aadhaar Boundary */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-teal-500/40 shadow-xl space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-teal-400" />
              <span>1. Mobile Verification vs UIDAI Aadhaar Statutory Boundary</span>
            </h2>
            <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-800/60 text-teal-200 text-xs space-y-2">
              <p className="font-semibold text-teal-100">
                Crucial Regulatory Notice on Identity & Mobile Verification:
              </p>
              <p>
                CivicPulse AI verifies a citizen's phone number through standard SMS OTP delivery. A successful mobile OTP
                confirms only that the user possesses physical control of that specific mobile handset.
              </p>
              <p className="font-bold">
                Mobile OTP does NOT prove or represent that the number is Aadhaar-linked, nor does it perform UIDAI
                statutory authentication.
              </p>
              <p>
                Under prevailing digital identity regulations, Aadhaar-linked verification can strictly only be conducted
                through an authorized Authentication User Agency (AUA/KUA) arrangement with explicit statutory approval.
                CivicPulse AI will never collect Aadhaar numbers, ask citizens to paste UIDAI OTPs, or imitate official
                government credentials without authorized integration.
              </p>
            </div>
          </div>

          {/* Section 2: Data Minimization in AI Triage */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-teal-400" />
              <span>2. Data Minimization & Gemini AI Boundary</span>
            </h2>
            <p>
              When a citizen lodges a complaint, our server-side integration forwards only the infrastructure title,
              issue description, and location context to Google Gemini 3.8 Flash for priority and department categorization.
            </p>
            <p className="text-slate-400">
              Citizen names, mobile numbers, email addresses, and personal identification metadata are{' '}
              <strong className="text-white">strictly stripped before calling the AI model</strong>. Gemini acts as an
              advisory triage assistant and never stores personal citizen records.
            </p>
          </div>

          {/* Section 3: Public vs Private Information */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-teal-400" />
              <span>3. Public Tracking vs Private Account Protection</span>
            </h2>
            <p>
              CivicPulse AI generates an unguessable human-friendly reference code (e.g.{' '}
              <code className="text-teal-300 font-mono">CP-2026-MG821</code>) for every complaint:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-2">
              <li>
                <strong className="text-slate-200">Public Tracking View:</strong> Displays only the issue summary, current
                inspection status, department, and official progress notes.
              </li>
              <li>
                <strong className="text-slate-200">Private Profile View:</strong> Citizen phone numbers and full names are
                visible only to the reporting citizen and verified municipal field engineers.
              </li>
              <li>
                <strong className="text-slate-200">Confidential Admin Notes:</strong> Internal contractor notes and
                administrative audits are strictly partitioned away from public and citizen view.
              </li>
            </ul>
          </div>

          {/* Section 4: Database Row Level Security (RLS) */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-400" />
              <span>4. Database Architecture & Row Level Security</span>
            </h2>
            <p>
              Whether deployed with Supabase or PostgreSQL, our data layer enforces database-level Row Level Security (RLS).
              Citizens cannot query other residents' records, cannot modify their own authorization roles, and cannot
              alter status or verification flags directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
