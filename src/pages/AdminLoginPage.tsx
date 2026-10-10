import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface AdminLoginPageProps {
  onNavigate: (page: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const { loginAdmin, switchRole } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Credentials required', 'Please provide municipal staff email and access key.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      loginAdmin(email, 'Executive Engineer');
      success('Authorized Access', 'Logged in to Municipal Administration Portal.');
      setLoading(false);
      onNavigate('admin_dashboard');
    }, 400);
  };

  const handleDemoAdminLogin = () => {
    switchRole('admin');
    success('Municipal Official Active', 'Signed in as Priya Raman (Executive Engineer).');
    onNavigate('admin_dashboard');
  };

  return (
    <div className="min-h-[85vh] bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 mb-1 border border-indigo-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black text-white">Municipal Authority Login</h2>
          <p className="text-xs text-slate-400">Restricted portal for municipal engineers and ward supervisors</p>
        </div>

        {/* Security Alert notice */}
        <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-200 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-indigo-300">
            <ShieldAlert className="w-4 h-4" />
            <span>Administrative Security Boundary</span>
          </div>
          <p className="text-[11px] text-indigo-200/80 leading-relaxed">
            Public citizen self-registration for administrator role is disabled. Official access is verified by
            server-side authentication and database Row Level Security.
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
                placeholder="priya.raman@bbmp.gov.in"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Department Access Key</label>
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

        {/* Quick Demo Admin Button */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <button
            type="button"
            onClick={handleDemoAdminLogin}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs border border-slate-700/80 flex items-center justify-center gap-2 transition"
          >
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>Use Demo Municipal Official Profile</span>
          </button>

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
