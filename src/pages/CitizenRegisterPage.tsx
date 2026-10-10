import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface CitizenRegisterPageProps {
  onNavigate: (page: string) => void;
}

export const CitizenRegisterPage: React.FC<CitizenRegisterPageProps> = ({ onNavigate }) => {
  const { loginCitizen } = useAuth();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      error('Missing details', 'Please fill in all required fields.');
      return;
    }
    if (!acceptedTerms) {
      error('Consent required', 'Please accept the citizen privacy policy.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      loginCitizen(email.trim(), fullName.trim(), phone.trim());
      success('Account created', 'Welcome to CivicPulse AI! Please verify your phone number.');
      setSubmitting(false);
      onNavigate('citizen_verify_mobile');
    }, 600);
  };

  return (
    <div className="min-h-[85vh] bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex p-2 rounded-xl bg-teal-500/10 text-teal-400 mb-1 border border-teal-500/20">
            <User className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black text-white">Citizen Registration</h2>
          <p className="text-xs text-slate-400">Join CivicPulse AI to report and track municipal complaints</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ramesh.k@gmail.com"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number (India +91)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Required for SMS status alerts. Control of phone will be verified via standard SMS OTP.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
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

          {/* Privacy & Aadhaar boundary notice */}
          <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-2 text-[11px] text-slate-300">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-teal-600 focus:ring-teal-500 bg-slate-800"
              />
              <span className="leading-relaxed">
                I agree to the CivicPulse AI privacy terms. I understand my phone number will be verified via SMS OTP, and
                that this verifies mobile ownership only (distinct from UIDAI Aadhaar verification).
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md shadow-teal-500/20"
          >
            <span>{submitting ? 'Creating Profile...' : 'Complete Citizen Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('citizen_login')}
            className="text-teal-400 hover:text-teal-300 font-semibold underline"
          >
            Sign In here
          </button>
        </div>
      </div>
    </div>
  );
};
