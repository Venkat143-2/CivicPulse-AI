import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, ShieldAlert, Database, Info, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface AdminLoginPageProps {
  onNavigate: (page: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const { loginAdmin, tablesReady } = useAuth();
  const { success, error, info } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      error('Credentials required', 'Please provide municipal staff email and access key.');
      return;
    }

    setLoading(true);
    const result = await loginAdmin(email.trim(), password);
    setLoading(false);

    if (!result.success) {
      if (!tablesReady) {
        error(
          'Database Setup Required',
          'Database tables have not been created in Supabase yet. Please run the SQL migration in your Supabase dashboard first.'
        );
      } else {
        error('Authorization Denied', result.error || 'Invalid credentials or non-admin account.');
      }
      return;
    }

    success('Authorized Access', 'Authenticated as verified Municipal Administrator.');
    onNavigate('admin_dashboard');
  };

  const sqlAdminCmd = `-- Promote any user to Municipal Admin in Supabase SQL Editor:
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');`;

  const copySqlCmd = () => {
    navigator.clipboard.writeText(sqlAdminCmd);
    setCopied(true);
    info('Copied', 'SQL command copied to clipboard.');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-[85vh] bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 mb-1 border border-indigo-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black text-white">Municipal Authority Login</h2>
          <p className="text-xs text-slate-400">Strictly verified administrative portal for municipal officials</p>
        </div>

        {!tablesReady && (
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-300">
              <Database className="w-4 h-4" />
              <span>Supabase Schema Migration Required</span>
            </div>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              Database tables are not yet created in your Supabase project. You must run the SQL migration script in your Supabase SQL Editor.
            </p>
          </div>
        )}

        {/* Security Alert notice */}
        <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-200 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-indigo-300">
            <ShieldAlert className="w-4 h-4" />
            <span>Strict Role Verification</span>
          </div>
          <p className="text-[11px] text-indigo-200/80 leading-relaxed">
            Public citizen self-registration cannot grant the administrator role. Access is verified server-side against the <code className="bg-indigo-950 px-1 py-0.5 rounded text-indigo-300">profiles</code> table.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Official Municipal Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="official@city.gov"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Department Access Key (Password)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md shadow-indigo-600/20"
          >
            <span>{loading ? 'Verifying Authorization...' : 'Authenticate Official Access'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Administration Role Granting Guide */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] space-y-1.5 text-slate-400">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                How to provision an Admin in Supabase:
              </span>
              <button
                type="button"
                onClick={copySqlCmd}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              1. Sign up as a user. 2. Run the SQL update in Supabase SQL Editor to set <code className="text-slate-300">role = 'admin'</code>.
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={() => onNavigate('portal')}
              className="text-xs text-slate-400 hover:text-white transition"
            >
              &larr; Return to Portal Selector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
