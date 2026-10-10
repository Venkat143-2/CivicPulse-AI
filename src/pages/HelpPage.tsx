import React from 'react';
import { HelpCircle, ArrowLeft, PhoneCall, AlertTriangle, Clock, MapPin, Camera, CheckCircle2 } from 'lucide-react';

interface HelpPageProps {
  onNavigate: (page: string) => void;
}

export const HelpPage: React.FC<HelpPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Citizen Guidance & FAQs</span>
          </div>
          <h1 className="text-3xl font-black text-white">Help & Complaint Guidelines</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Learn how to submit clear grievances and understand municipal SLA response timeframes.
          </p>
        </div>

        {/* Emergency Callout */}
        <div className="p-6 rounded-3xl bg-rose-950/30 border border-rose-800/60 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-rose-400 text-sm font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>Life-Threatening Civic Emergencies</span>
          </div>
          <p className="text-xs text-rose-200/90 leading-relaxed">
            For active emergencies requiring immediate siren response (such as live high-voltage fallen wires, sudden road
            cave-ins, or active building collapses), please immediately contact city disaster emergency lines:
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <div className="px-3 py-1.5 rounded-xl bg-rose-900/60 text-white font-mono text-xs font-bold border border-rose-700">
              National Emergency: 112
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-rose-900/60 text-white font-mono text-xs font-bold border border-rose-700">
              Fire & Rescue: 101
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-rose-900/60 text-white font-mono text-xs font-bold border border-rose-700">
              Disaster Control Room: 1077
            </div>
          </div>
        </div>

        {/* Section 1: Tips for submitting effective reports */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white">How to Submit an Effective Complaint</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <Camera className="w-5 h-5 text-teal-400" />
              <div className="font-bold text-white">Clear Visual Photo</div>
              <p className="text-slate-400 leading-relaxed">
                Take a landscape photo showing both the defect (e.g. pothole depth) and surrounding landmarks or road signs.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <MapPin className="w-5 h-5 text-teal-400" />
              <div className="font-bold text-white">Precise Location Pin</div>
              <p className="text-slate-400 leading-relaxed">
                Use the "My GPS Location" button or click on the map to drop a pin. Mention nearby landmarks like Metro pillars.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <CheckCircle2 className="w-5 h-5 text-teal-400" />
              <div className="font-bold text-white">Describe Safety Risks</div>
              <p className="text-slate-400 leading-relaxed">
                Detail if vehicles are skidding, if dirty water is flooding homes, or if darkness creates pedestrian danger.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Expected SLAs */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-400" />
            <span>Municipal Service Level Agreements (SLAs)</span>
          </h2>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-rose-400">Critical Priority</span>
                <p className="text-slate-400 text-[11px]">Open manholes, live sparking lines, main pipe rupture</p>
              </div>
              <span className="font-mono font-bold text-white bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700">
                &lt; 24 Hours
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-amber-400">High Priority</span>
                <p className="text-slate-400 text-[11px]">Severe arterial road potholes, overflowing market garbage</p>
              </div>
              <span className="font-mono font-bold text-white bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700">
                &lt; 48 Hours
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-teal-400">Medium Priority</span>
                <p className="text-slate-400 text-[11px]">Residential streetlight dark zone, storm drain silt</p>
              </div>
              <span className="font-mono font-bold text-white bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700">
                3 - 5 Days
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-300">Low Priority</span>
                <p className="text-slate-400 text-[11px]">Minor sidewalk paving repair, park fence repaint</p>
              </div>
              <span className="font-mono font-bold text-white bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700">
                7 - 10 Days
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
