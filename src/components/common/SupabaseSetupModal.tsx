import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Check,
  Copy,
  ExternalLink,
  ShieldAlert,
  Key,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Code,
} from 'lucide-react';
import { isSupabaseConfigured, probeSupabaseStatus } from '../../lib/supabase';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [checking, setChecking] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ configured: boolean; tablesReady: boolean; error?: string }>({
    configured: isSupabaseConfigured,
    tablesReady: false,
  });

  const checkStatus = async () => {
    setChecking(true);
    const res = await probeSupabaseStatus();
    setDbStatus(res);
    setChecking(false);
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const envExplanation = `# Client Environment Variables (safe for browser)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Server-Only Secrets (NEVER expose to browser bundle)
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
GEMINI_API_KEY="AIzaSy..."`;

  const migrationSqlPath = '/supabase/migrations/20261010_initial_schema.sql';

  const copySqlPath = () => {
    navigator.clipboard.writeText(migrationSqlPath);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const copyEnvSnippet = () => {
    navigator.clipboard.writeText(envExplanation);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Supabase Integration & Architecture</h3>
              <p className="text-xs text-slate-500">PostgreSQL schema, Row Level Security, and role isolation</p>
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
          {/* Live Status Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
              dbStatus.tablesReady
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : dbStatus.configured
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-start gap-3">
              {dbStatus.tablesReady ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : dbStatus.configured ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <Database className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold text-sm">
                  {dbStatus.tablesReady
                    ? 'Supabase Database Connected & Migrated'
                    : dbStatus.configured
                    ? 'Supabase URL Configured (Tables Pending Migration)'
                    : 'Supabase Not Configured'}
                </div>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  {dbStatus.tablesReady
                    ? 'All tables (profiles, complaints, departments, updates, internal notes) and RLS policies are active in your remote database.'
                    : dbStatus.configured
                    ? 'Connected to your Supabase project. To start persisting real records, run the SQL migration below in Supabase SQL Editor.'
                    : 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect to Supabase.'}
                </p>
              </div>
            </div>

            <button
              onClick={checkStatus}
              disabled={checking}
              className="p-2 rounded-xl bg-white/80 hover:bg-white text-slate-700 border border-slate-200 shadow-sm transition shrink-0"
              title="Refresh connection status"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin text-teal-600' : ''}`} />
            </button>
          </div>

          {/* Migration Instructions */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Code className="w-4 h-4 text-teal-600" />
              <span>Step-by-Step SQL Migration Instructions</span>
            </h4>
            <ol className="space-y-2.5 list-decimal list-inside text-xs text-slate-700 leading-relaxed">
              <li>
                Open your Supabase project at{' '}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-600 underline font-semibold inline-flex items-center gap-1"
                >
                  supabase.com/dashboard <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                In the left sidebar, click on <strong className="text-slate-900">SQL Editor</strong> &gt; <strong className="text-slate-900">New Query</strong>.
              </li>
              <li>
                Open the migration file in this project:{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 text-teal-800 font-mono rounded text-[11px]">
                  {migrationSqlPath}
                </code>
              </li>
              <li>
                Copy the entire contents of the file, paste into the Supabase SQL Editor, and click <strong className="text-slate-900">Run</strong>.
              </li>
              <li>
                Under <strong className="text-slate-900">Authentication &gt; Providers &gt; Email</strong>, you can optionally disable <strong className="text-slate-900">"Confirm email"</strong> if you want citizen sign-ups to log in immediately without waiting for SMTP verification.
              </li>
            </ol>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={copySqlPath}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied File Path' : 'Copy Migration File Path'}</span>
              </button>
            </div>
          </div>

          {/* Environment Variables Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Environment Security Boundary</span>
              <button
                onClick={copyEnvSnippet}
                className="text-teal-600 hover:text-teal-700 flex items-center gap-1 font-medium"
              >
                {copiedEnv ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedEnv ? 'Copied' : 'Copy Variables'}</span>
              </button>
            </div>
            <pre className="p-3.5 bg-slate-900 text-teal-300 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
              {envExplanation}
            </pre>
            <p className="text-[11px] text-slate-500">
              <strong className="text-slate-700">Security Rule:</strong> <code className="text-slate-800 font-mono">SUPABASE_SERVICE_ROLE_KEY</code> and <code className="text-slate-800 font-mono">GEMINI_API_KEY</code> are loaded only in server-side routes (<code className="text-slate-800 font-mono">server.ts</code>) and never bundled into frontend client code.
            </p>
          </div>

          {/* RLS and Notes Partitioning Notice */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>Dedicated Internal Notes & Role Partitioning</span>
            </div>
            <p className="leading-relaxed">
              Internal municipal notes are housed in a dedicated table (<code className="font-mono text-amber-950">complaint_internal_notes</code>) with an admin-only RLS policy. Citizens cannot view or select internal notes. The trigger <code className="font-mono text-amber-950">protect_profile_fields</code> prevents non-admins from changing their role or phone verification status.
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
