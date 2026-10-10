import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface CitizenLoginPageProps {
  onNavigate: (page: string) => void;
}

export const CitizenLoginPage: React.FC<CitizenLoginPageProps> = ({ onNavigate }) => {
  const { loginCitizen, switchRole } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      error('Missing input', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      loginCitizen(email.trim(), email.split('@')[0]);
      success('Welcome back', 'Successfully logged into Citizen Portal.');
      setLoading(false);
      onNavigate('citizen_dashboard');
    }, 400);
  };

  const handleDemoLogin = () => {
    switchRole('citizen');
    success('Demo Citizen Active', 'Logged in as Aarav Sharma (citizen-demo-1).');
    onNavigate('citizen_dashboard');
  };

  return (
    <div className="min-h-[85vh] bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex p-2 rounded-xl bg-teal-500/10 text-teal-400 mb-1 border border-teal-500/20">
            <User className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black text-white">Citizen Sign In</h2>
          <p className="text-xs text-slate-400">Access your reported complaints and status history</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav.sharma@gmail.com"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <button
                type="button"
                onClick={() => onNavigate('citizen_forgot_password')}
                className="text-[11px] text-teal-400 hover:text-teal-300"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md shadow-teal-500/20"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In as Citizen'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Citizen Login */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs border border-slate-700/80 flex items-center justify-center gap-2 transition"
          >
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Use Verified Citizen Demo Account</span>
          </button>

          <div className="text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('citizen_register')}
              className="text-teal-400 hover:text-teal-300 font-semibold underline"
            >
              Register here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
