import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface CitizenForgotPasswordPageProps {
  onNavigate: (page: string) => void;
}

export const CitizenForgotPasswordPage: React.FC<CitizenForgotPasswordPageProps> = ({ onNavigate }) => {
  const { resetPassword } = useAuth();
  const { success, error } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      error('Email required', 'Please enter your registered email address.');
      return;
    }

    setLoading(true);
    const result = await resetPassword(email.trim());
    setLoading(false);

    if (!result.success) {
      error('Reset Failed', result.error || 'Could not send recovery link.');
      return;
    }

    setSubmitted(true);
    success('Reset link dispatched', 'Password reset instructions have been sent to your inbox.');
  };

  return (
    <div className="min-h-[85vh] bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <button
          onClick={() => onNavigate('citizen_login')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </button>

        <div className="text-center space-y-1">
          <div className="inline-flex p-2.5 rounded-xl bg-teal-500/10 text-teal-400 mb-1 border border-teal-500/20">
            <Mail className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black text-white">Reset Password</h2>
          <p className="text-xs text-slate-400">
            Enter your email to receive a password recovery link
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-sm font-bold text-white">Check Your Email</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              If an account exists for <span className="text-teal-300 font-medium">{email}</span>, a secure password reset
              link has been dispatched.
            </p>
            <button
              onClick={() => onNavigate('citizen_login')}
              className="mt-2 text-xs font-semibold text-teal-400 hover:underline"
            >
              Return to Citizen Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Registered Email</label>
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

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-teal-500/20"
            >
              <span>Send Recovery Link</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
