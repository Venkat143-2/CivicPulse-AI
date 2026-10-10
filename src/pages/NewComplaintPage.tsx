import React, { useState } from 'react';
import {
  PlusCircle,
  Sparkles,
  MapPin,
  Camera,
  UploadCloud,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  AlertTriangle,
  Info,
  HelpCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { classifyComplaintAI, submitComplaint } from '../lib/api';
import { ComplaintCategory, AIClassificationResult } from '../types';
import { LeafletMap } from '../components/common/LeafletMap';
import { AIAnalysisCard } from '../components/common/AIAnalysisCard';

interface NewComplaintPageProps {
  onNavigate: (page: string, params?: { id?: string }) => void;
}

export const NewComplaintPage: React.FC<NewComplaintPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { success, error, warning } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComplaintCategory>('pothole');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(12.9716);
  const [longitude, setLongitude] = useState<number | undefined>(77.5946);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [consentAccepted, setConsentAccepted] = useState(false);

  // AI Triage State
  const [aiAnalysis, setAiAnalysis] = useState<AIClassificationResult | null>(null);
  const [analyzingAI, setAnalyzingAI] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submittedRefCode, setSubmittedRefCode] = useState<string | null>(null);
  const [createdComplaintId, setCreatedComplaintId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Trigger Gemini AI Pre-Triage
  const handleRunAiTriage = async () => {
    if (!title.trim() && !description.trim()) {
      warning('Need complaint text', 'Enter at least a title or description to analyze with AI.');
      return;
    }

    setAnalyzingAI(true);
    try {
      const res = await classifyComplaintAI({
        title: title || 'Civic infrastructure report',
        description: description || title,
        address,
      });
      setAiAnalysis(res);
      if (res.category) {
        setSelectedCategory(res.category);
      }
      success('Gemini AI Triage Ready', `Predicted ${res.category} under ${res.department}`);
    } catch (err: any) {
      error('AI Analysis Notice', err.message || 'Heuristic triage fallback used.');
    } finally {
      setAnalyzingAI(false);
    }
  };

  // Handle Photo selection
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      error('File too large', 'Please select an image smaller than 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    if (!address) {
      setAddress(`Lat: ${lat}, Lng: ${lng} (Pinned on City Map)`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !address.trim()) {
      error('Required fields', 'Please provide a title, description, and location.');
      return;
    }

    if (!consentAccepted) {
      warning('Consent required', 'Please confirm that this report is genuine.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitComplaint({
        citizenId: user?.id || 'citizen-demo-1',
        citizenName: user?.fullName || 'Aarav Sharma',
        citizenPhone: user?.phone || '+91 9876543210',
        title: title.trim(),
        description: description.trim(),
        category: selectedCategory,
        address: address.trim(),
        latitude,
        longitude,
        photoUrl: photoPreview || undefined,
      });

      setSubmittedRefCode(res.referenceCode);
      setCreatedComplaintId(res.complaint.id);
      success('Complaint Lodged!', `Registered with Reference ${res.referenceCode}`);
    } catch (err: any) {
      error('Submission Error', err.message || 'Could not register complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const copyRefCode = () => {
    if (!submittedRefCode) return;
    navigator.clipboard.writeText(submittedRefCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // If successfully submitted, render receipt screen
  if (submittedRefCode) {
    return (
      <div className="min-h-[85vh] bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold text-teal-400 uppercase tracking-widest">Complaint Lodged</div>
            <h2 className="text-2xl font-black text-white">Report Successfully Registered</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your grievance has been entered into the municipal system and assigned for municipal review.
            </p>
          </div>

          {/* Reference Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
            <div className="text-left">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Your Tracking Reference</span>
              <div className="text-lg font-mono font-black text-teal-300 tracking-wider mt-0.5">{submittedRefCode}</div>
            </div>
            <button
              onClick={copyRefCode}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed text-left p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
            <strong>Next Steps:</strong> You will receive SMS alerts as municipal crews update status. Anyone with this
            reference code can check status anytime on the public tracking portal.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => onNavigate('citizen_complaint_detail', { id: createdComplaintId || undefined })}
              className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <span>View Complaint Timeline</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('citizen_dashboard')}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <div className="text-xs font-bold text-teal-400 uppercase tracking-widest">Public Redressal</div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Report a Civic Problem</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Provide details, photo, and exact location. Our Gemini AI triage engine will prioritize and route to the
            correct municipal department.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Group 1: Issue Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
              <span>1. Issue Description</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Headline / Short Summary <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Deep crater pothole near Indiranagar Metro pillar 45"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Detailed Description <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleRunAiTriage}
                  disabled={analyzingAI}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold transition"
                  title="Run Gemini AI pre-assessment on this description"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{analyzingAI ? 'AI Analyzing...' : 'Run Gemini AI Triage'}</span>
                </button>
              </div>
              <textarea
                required
                rows={4}
                maxLength={1200}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail: when did it start, how severe is it, does it block vehicles or pedestrians, any immediate safety hazard?"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition leading-relaxed"
              />
            </div>

            {/* AI Triage Card preview if generated */}
            {aiAnalysis && (
              <div className="pt-2">
                <AIAnalysisCard analysis={aiAnalysis} loading={analyzingAI} />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Category Selection</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'pothole', label: 'Pothole / Road' },
                  { id: 'garbage', label: 'Garbage & Waste' },
                  { id: 'streetlight', label: 'Streetlight / Pole' },
                  { id: 'water_leakage', label: 'Water Leak' },
                  { id: 'drainage', label: 'Drainage / Sewage' },
                  { id: 'other', label: 'Other Civic Issue' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id as ComplaintCategory)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold text-left border transition ${
                      selectedCategory === cat.id
                        ? 'bg-teal-500 text-slate-950 border-teal-400 font-bold shadow-md shadow-teal-500/20'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Group 2: Location & Map Pin */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
              <span>2. Location & Geographic Pin</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Address / Landmark / Ward <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Near Indiranagar Metro Station, 100ft Road, Ward 80"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
                />
              </div>
            </div>

            {/* Interactive Leaflet Pin Picker */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Pinpoint On Map (Optional but Recommended)</span>
                {latitude && longitude && (
                  <span className="text-slate-400 font-mono text-[11px]">
                    Lat: {latitude}, Lng: {longitude}
                  </span>
                )}
              </div>
              <LeafletMap
                mode="picker"
                latitude={latitude}
                longitude={longitude}
                onLocationSelect={handleLocationSelect}
                className="h-64 sm:h-72 w-full rounded-2xl"
              />
            </div>
          </div>

          {/* Group 3: Optional Photo Upload */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
              <span>3. Visual Evidence Photo (Optional)</span>
            </h2>

            {!photoPreview ? (
              <label className="border-2 border-dashed border-slate-700 hover:border-teal-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition bg-slate-950/40 group">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-white">Click or drag photo of the problem</div>
                <p className="text-[11px] text-slate-400 mt-1">Supports JPG, PNG up to 8MB</p>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 max-w-sm">
                <img src={photoPreview} alt="Complaint preview" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="absolute top-2 right-2 p-1.5 bg-slate-900/90 text-rose-400 hover:text-white rounded-lg backdrop-blur"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Citizen Consent & Submit Button */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                required
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-teal-600 focus:ring-teal-500 bg-slate-800"
              />
              <span className="leading-relaxed">
                I certify that this complaint represents an authentic public civic problem in my community. I understand
                frivolous submissions may delay genuine public works.
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-teal-500/25 transition disabled:opacity-50 hover:scale-101"
            >
              <span>{submitting ? 'Lodging Complaint & Dispatching AI...' : 'Submit Complaint to Municipal Corporation'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
