import React, { useState, useEffect } from 'react';
import { Phone, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { requestMobileOTP, verifyMobileOTP } from '../lib/api';

interface CitizenVerifyMobilePageProps {
  onNavigate: (page: string) => void;
}

export const CitizenVerifyMobilePage: React.FC<CitizenVerifyMobilePageProps> = ({ onNavigate }) => {
  const { user, updateUserPhone } = useAuth();
  const { success, error, info } = useToast();

  const [phone, setPhone] = useState(user?.phone || '+91 9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [demoCodeHint, setDemoCodeHint] = useState<string | null>(null);
  const [smsGatewayConfigured, setSmsGatewayConfigured] = useState(false);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      error('Invalid phone', 'Please enter a valid 10-digit Indian phone number.');
      return;
    }

    setLoading(true);
    try {
      const res = await requestMobileOTP(phone);
      setOtpSent(true);
      setCooldown(res.cooldownSeconds || 60);
      setSmsGatewayConfigured(Boolean(res.smsGatewayConfigured));
      if (res.demoHelperCode) {
        setDemoCodeHint(res.demoHelperCode);
      }
      info('OTP Dispatched', res.message);
    } catch (err: any) {
      error('OTP Request Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      error('Invalid OTP', 'Please enter the 6-digit numeric verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyMobileOTP(phone, otpCode);
      updateUserPhone(phone, true);
      success('Mobile Verified', res.message);
      onNavigate('citizen_dashboard');
    } catch (err: any) {
      error('Verification Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex p-2.5 rounded-xl bg-teal-500/10 text-teal-400 mb-1 border border-teal-500/20">
            <Phone className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black text-white">Mobile Verification</h2>
          <p className="text-xs text-slate-400">Verify control of your mobile number for municipal grievance SMS alerts</p>
        </div>

        {/* Aadhaar Boundary Disclaimer Box */}
        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-teal-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Important Statutory Boundary</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            This verification sends an SMS OTP to confirm that you have physical possession of this phone number.
            <strong className="text-slate-200"> It does NOT represent or certify Aadhaar verification.</strong> Authorized
            Aadhaar verification remains a separate statutory arrangement.
          </p>
        </div>

        {!otpSent ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number</label>
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md shadow-teal-500/20"
            >
              <span>{loading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">Enter 6-Digit OTP</span>
                <span className="text-slate-400 text-[11px]">Sent to {phone}</span>
              </div>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123456"
                className="w-full tracking-widest text-center text-lg font-mono font-bold bg-slate-800 border border-slate-700 rounded-xl py-2.5 text-teal-300 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition"
              />
            </div>

            {/* Demo Helper code box if SMS gateway is in demo mode */}
            {!smsGatewayConfigured && demoCodeHint && (
              <div className="p-3 bg-teal-950/50 border border-teal-800/60 rounded-xl text-xs text-teal-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-teal-300">Demo Mode Active</span>
                  <span className="font-mono bg-teal-900/80 px-2 py-0.5 rounded text-white font-bold tracking-wider">
                    {demoCodeHint}
                  </span>
                </div>
                <p className="text-[10px] text-teal-400 mt-1">
                  SMS Gateway API key not configured in secrets. Use this active generated code for testing.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md shadow-teal-500/20"
            >
              <span>{loading ? 'Verifying...' : 'Confirm Phone Ownership'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="text-slate-400 hover:text-slate-300 text-[11px]"
              >
                Change mobile number
              </button>

              <button
                type="button"
                disabled={cooldown > 0}
                onClick={handleSendOTP}
                className="text-teal-400 hover:text-teal-300 text-[11px] font-semibold disabled:text-slate-600 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}</span>
              </button>
            </div>
          </form>
        )}

        <div className="pt-2 border-t border-slate-800 text-center">
          <button
            onClick={() => onNavigate('citizen_dashboard')}
            className="text-xs text-slate-400 hover:text-white transition"
          >
            Skip for now &rarr; Go to Citizen Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
