import React, { useState } from 'react';
import { X, Database, Check, Copy, ExternalLink, ShieldAlert, Key, CheckCircle2 } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sampleEnv = `VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`;

  const copyEnvSnippet = () => {
    navigator.clipboard.writeText(sampleEnv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Supabase Integration & Architecture</h3>
              <p className="text-xs text-slate-500">PostgreSQL schema, Row Level Security, and storage setup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-sm text-slate-600">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              isSupabaseConfigured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            {isSupabaseConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Database className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold text-sm">
                {isSupabaseConfigured ? 'Supabase Connected' : 'Running on Built-in Full-Stack Persistence'}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {isSupabaseConfigured
                  ? 'Active Supabase project detected via VITE_SUPABASE_URL. All authentication and complaints are synced with your remote PostgreSQL instance.'
                  : 'The application is running with our full-stack Express persistence store. All complaint lifecycles, Gemini AI triage, and status transitions work immediately without external dependencies.'}
              </p>
            </div>
          </div>

          {/* Quick Setup Checklist */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">Connecting External Supabase Project</h4>
            <ol className="space-y-3 list-decimal list-inside text-xs text-slate-700">
              <li className="leading-relaxed">
                <span className="font-semibold text-slate-900">Create a Supabase Project:</span> Go to{' '}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-600 underline font-medium inline-flex items-center gap-1"
                >
                  supabase.com <ExternalLink className="w-3 h-3" />
                </a>{' '}
                and create a project.
              </li>
              <li className="leading-relaxed">
                <span className="font-semibold text-slate-900">Run Migration SQL:</span> Copy our production schema file{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 text-teal-700 font-mono rounded text-[11px]">
                  /supabase/migrations/20261010_initial_schema.sql
                </code>{' '}
                and execute it in the Supabase SQL Editor.
              </li>
              <li className="leading-relaxed">
                <span className="font-semibold text-slate-900">Add Environment Variables:</span> Add your Project URL & Anon
                Key to Secrets in AI Studio:
              </li>
            </ol>
          </div>

          {/* Code Box */}
          <div className="relative">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-1 px-1">
              <span>Environment Variables (.env)</span>
              <button
                onClick={copyEnvSnippet}
                className="flex items-center gap-1 text-teal-600 hover:text-teal-700 font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3.5 bg-slate-900 text-teal-300 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
              {sampleEnv}
            </pre>
          </div>

          {/* Security & RLS Details */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>Row Level Security (RLS) & Access Governance</span>
            </div>
            <p className="leading-relaxed">
              Our migration enforces strict PostgreSQL RLS policies: Citizens can only query their own complaints, cannot
              grant themselves admin permissions, cannot tamper with status fields, and can only read public resolution
              notes. Internal officer notes remain restricted to authorized administrative sessions.
            </p>
          </div>

          {/* Aadhaar Boundary Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-slate-900">
              <Key className="w-4 h-4 text-teal-600" />
              <span>Mobile Verification vs Aadhaar Boundary</span>
            </div>
            <p className="leading-relaxed">
              Mobile OTP verifies control of the specified phone number. It does not certify Aadhaar linkage. Under
              statutory data regulations, Aadhaar verification requires approved UIDAI API access and is kept as an
              isolated, clearly labeled future integration interface.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
