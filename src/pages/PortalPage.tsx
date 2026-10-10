import React from 'react';
import { User, Shield, ArrowRight, CheckCircle2, Building, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PortalPageProps {
  onNavigate: (page: string) => void;
}

export const PortalPage: React.FC<PortalPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const handleSelectCitizen = () => {
    if (user) {
      onNavigate('citizen_dashboard');
    } else {
      onNavigate('citizen_login');
    }
  };

  const handleSelectAdmin = () => {
    onNavigate('admin_login');
  };

  return (
    <div className="min-h-[85vh] bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Role Selection</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Choose Your CivicPulse Portal</h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Select how you would like to interact with the municipal grievance redressal system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Citizen Card */}
          <div className="bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-3xl p-7 transition-all hover:scale-101 flex flex-col justify-between group shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-teal-400 transition">Citizen Portal</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  For residents, pedestrians, and commuters reporting civic problems in their neighborhood.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Report potholes, garbage, streetlights & drainage</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interactive map & GPS location pinpointing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real-time SMS updates & status timeline tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Private by default — contact info is protected</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 space-y-2">
              <button
                onClick={handleSelectCitizen}
                className="w-full py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-teal-500/20"
              >
                <span>Continue as Citizen</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex justify-center gap-4 text-[11px] text-slate-400 pt-1">
                <button onClick={() => onNavigate('citizen_login')} className="hover:text-teal-400">
                  Citizen Sign In
                </button>
                <span>&bull;</span>
                <button onClick={() => onNavigate('citizen_register')} className="hover:text-teal-400">
                  Create Account
                </button>
              </div>
            </div>
          </div>

          {/* Municipal Admin Card */}
          <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-7 transition-all hover:scale-101 flex flex-col justify-between group shadow-xl relative overflow-hidden">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition">
                    Municipal Authority
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    Restricted
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  For executive engineers, ward supervisors, and department field maintenance coordinators.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Review Gemini 3.8 Flash triage and priority predictions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dispatch complaints to engineering squads</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Update public status and internal confidential logs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Geospatial ward heatmap & SLA metrics</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 space-y-2">
              <button
                onClick={handleSelectAdmin}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition"
              >
                <span>Municipal Official Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-[11px] text-slate-400">
                Staff credentials required. Public self-registration is strictly disabled.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
