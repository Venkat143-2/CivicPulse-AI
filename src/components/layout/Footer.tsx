import React from 'react';
import { Activity, ShieldCheck, Heart, ExternalLink, HelpCircle } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-bold">
                <Activity className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">CivicPulse AI</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              A transparent civic complaint reporting and municipal resolution platform. Powered by Gemini 3.8 Flash
              automated triage and accountable public infrastructure workflows.
            </p>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 max-w-md">
              <span className="font-semibold text-teal-400 block mb-1">Aadhaar Statutory Boundary:</span>
              CivicPulse AI verifies phone possession via standard SMS OTP. In strict compliance with regulatory guidelines,
              Aadhaar verification is never faked and remains a designated statutory integration milestone.
            </div>
          </div>

          {/* Citizen Links */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Citizen Portal</h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li>
                <button onClick={() => onNavigate('new_complaint')} className="hover:text-teal-400 transition">
                  Report an Issue
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('track')} className="hover:text-teal-400 transition">
                  Track by Reference Code
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('citizen_dashboard')} className="hover:text-teal-400 transition">
                  My Active Complaints
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy')} className="hover:text-teal-400 transition">
                  Privacy & Data Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('help')} className="hover:text-teal-400 transition">
                  Civic Help & Guidelines
                </button>
              </li>
            </ul>
          </div>

          {/* Municipal Administration */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Municipal Authority</h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li>
                <button onClick={() => onNavigate('admin_login')} className="hover:text-teal-400 transition">
                  Official Staff Login
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin_dashboard')} className="hover:text-teal-400 transition">
                  Admin Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin_complaints')} className="hover:text-teal-400 transition">
                  Complaint Triage Queue
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin_map')} className="hover:text-teal-400 transition">
                  City Geospatial Map
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>&copy; {new Date().getFullYear()} CivicPulse AI. Designed for transparent municipal governance.</div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('privacy')} className="hover:text-slate-300">
              Privacy
            </button>
            <button onClick={() => onNavigate('help')} className="hover:text-slate-300">
              Help
            </button>
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
              <span>Role-Based Access Control</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
