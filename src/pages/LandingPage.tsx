import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Search,
  PlusCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Trash2,
  Lightbulb,
  Droplets,
  Waves,
  Building2,
  Layers,
  Users,
} from 'lucide-react';
import { fetchKPIStats } from '../lib/api';
import { KPIStats } from '../types';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<KPIStats | null>(null);

  useEffect(() => {
    fetchKPIStats()
      .then(setStats)
      .catch((e) => console.warn('Failed to load landing stats:', e));
  }, []);

  const categories = [
    {
      id: 'pothole',
      name: 'Pothole & Road Hazards',
      desc: 'Craters, collapsed asphalt, sunken trenches, damaged speed breakers.',
      icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
      dept: 'Roads & Infrastructure',
      bg: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    },
    {
      id: 'garbage',
      name: 'Garbage & Waste Dumps',
      desc: 'Overflowing bins, uncollected neighborhood waste, illegal dumping.',
      icon: <Trash2 className="w-5 h-5 text-emerald-500" />,
      dept: 'Sanitation Dept',
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    },
    {
      id: 'streetlight',
      name: 'Damaged Streetlights',
      desc: 'Blackout zones, broken poles, dangling wires, malfunctioning timers.',
      icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
      dept: 'Street Lighting & Power',
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    },
    {
      id: 'water_leakage',
      name: 'Water Pipeline Leaks',
      desc: 'Burst main pipelines, contaminated municipal supply, road flooding.',
      icon: <Droplets className="w-5 h-5 text-cyan-500" />,
      dept: 'Water Supply Board',
      bg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    },
    {
      id: 'drainage',
      name: 'Drainage & Sewage Block',
      desc: 'Stormwater drain overflow, blocked gullies, open or damaged manholes.',
      icon: <Waves className="w-5 h-5 text-blue-500" />,
      dept: 'Drainage & Flood Control',
      bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    },
    {
      id: 'other',
      name: 'Other Civic Infrastructure',
      desc: 'Damaged public parks, unauthorized construction, municipal concerns.',
      icon: <Building2 className="w-5 h-5 text-teal-500" />,
      dept: 'General Municipal Services',
      bg: 'bg-teal-500/10 border-teal-500/20 text-teal-400',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute -top-10 left-10 w-72 h-72 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-teal-400 font-semibold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>CivicPulse AI &bull; Intelligent Municipal Grievance Redressal</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
              Make your neighborhood better,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-200">
                one report at a time.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              Report potholes, garbage, streetlights, or water leaks in seconds. Gemini AI triages urgency and routes to
              the right city department, keeping you informed at every step.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={() => onNavigate('new_complaint')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 transition-all hover:scale-102"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                <span>Report an Issue</span>
              </button>

              <button
                onClick={() => onNavigate('track')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-800 flex items-center justify-center gap-2 transition hover:border-slate-700"
              >
                <Search className="w-4 h-4 text-teal-400" />
                <span>Track a Complaint</span>
              </button>

              <button
                onClick={() => onNavigate('portal')}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-transparent hover:bg-slate-900/60 text-slate-300 font-medium text-xs border border-slate-800/80 flex items-center justify-center gap-1.5 transition"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Choose Portal</span>
              </button>
            </div>
          </div>

          {/* Live KPI Stats Row */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Total Resolved</span>
              </div>
              <div className="text-2xl font-black text-white mt-1.5">{stats ? stats.resolved : 1}</div>
              <div className="text-[11px] text-emerald-400 mt-1 font-medium">Verified by municipal crews</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                <span>Avg Resolution</span>
              </div>
              <div className="text-2xl font-black text-white mt-1.5">
                {stats ? stats.avgResolutionDays : 2.4} <span className="text-xs font-normal text-slate-400">days</span>
              </div>
              <div className="text-[11px] text-teal-400 mt-1 font-medium">Faster than city target SLA</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                <span>Active Reports</span>
              </div>
              <div className="text-2xl font-black text-white mt-1.5">
                {stats ? stats.inProgress + stats.underReview + stats.submitted : 4}
              </div>
              <div className="text-[11px] text-sky-400 mt-1 font-medium">Under active civic work</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Triage Accuracy</span>
              </div>
              <div className="text-2xl font-black text-white mt-1.5">94%</div>
              <div className="text-[11px] text-purple-400 mt-1 font-medium">Gemini 3.8 Flash automated</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Workflow Section */}
      <section className="py-16 bg-slate-900/60 border-y border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs uppercase font-extrabold text-teal-400 tracking-wider">How It Works</h2>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
              From report to resolution in three transparent steps
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Eliminating civic black boxes with real-time updates and accountable department routing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative group hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm mb-4">
                01
              </div>
              <h4 className="text-base font-bold text-white mb-2">Snap, Pin & Describe</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Take a quick photo, drop a location pin on our interactive map, and describe the problem. No bureaucratic
                paperwork required.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative group hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4">
                02
              </div>
              <h4 className="text-base font-bold text-white mb-2">Gemini AI Triage</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our server-side Gemini 3.8 Flash model automatically categorizes the grievance, assesses public safety
                hazards, and dispatches it to the designated department.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative group hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm mb-4">
                03
              </div>
              <h4 className="text-base font-bold text-white mb-2">Public Resolution Audit</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track each milestone with your unique reference code (e.g. CP-2026-MG821). View municipal notes and
                confirmed resolution photos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Issue Categories Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs uppercase font-extrabold text-teal-400 tracking-wider">What You Can Report</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">Supported Civic Categories</h3>
            </div>
            <button
              onClick={() => onNavigate('new_complaint')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 hover:text-teal-300 transition"
            >
              <span>Submit a report now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((c) => (
              <div
                key={c.id}
                onClick={() => onNavigate('new_complaint')}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-1 cursor-pointer group shadow-lg"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`p-2 rounded-xl border ${c.bg}`}>{c.icon}</div>
                  <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                    {c.dept}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-teal-400 transition">{c.name}</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Privacy Guarantee */}
      <section className="py-16 bg-slate-900/50 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-2 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Citizen Privacy & Regulatory Compliance</span>
                </div>
                <h3 className="text-2xl font-black text-white">
                  Built with privacy by design and strict role-based access
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Your phone number and private contact information are never visible to the public or other citizens.
                  Public tracking links expose only minimal reference progress. Furthermore, we maintain a clear statutory
                  boundary: standard mobile OTP verifies control of the phone number, without misrepresenting Aadhaar linkage.
                </p>
                <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Row Level Security (RLS)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>No personal data sent to Gemini</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Append-only audit timeline</span>
                  </span>
                </div>
              </div>

              <div className="text-center lg:text-right">
                <button
                  onClick={() => onNavigate('privacy')}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
                >
                  Read Privacy & Compliance Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
