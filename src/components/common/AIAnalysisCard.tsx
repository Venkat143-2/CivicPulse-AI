import React from 'react';
import { Sparkles, ShieldCheck, AlertTriangle, Cpu, CheckCircle } from 'lucide-react';
import { AIClassificationResult, ComplaintCategory, ComplaintPriority, DepartmentName } from '../../types';
import { PriorityBadge } from './Badges';

interface AIAnalysisCardProps {
  analysis: Partial<AIClassificationResult> | null;
  loading?: boolean;
  isAdmin?: boolean;
  onApplyOverride?: (category: ComplaintCategory, priority: ComplaintPriority, department: DepartmentName) => void;
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({
  analysis,
  loading = false,
  isAdmin = false,
  onApplyOverride,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2.5 text-teal-400 font-semibold text-sm">
          <Sparkles className="w-4 h-4 animate-spin text-teal-300" />
          <span>Gemini 3.8 Flash Triage Engine Analyzing...</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Evaluating complaint severity, municipal routing, and public safety hazards...
        </p>
        <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 animate-pulse w-3/4 rounded-full" />
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const confidencePercent = Math.round((analysis.confidence || 0.85) * 100);
  const isGemini = analysis.source === 'gemini';

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Background subtle glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              Gemini AI Triage Assessment
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-800/80">
                {isGemini ? 'gemini-3.8-flash' : 'Rule-Based Fallback'}
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">Server-side automated triage & routing</p>
          </div>
        </div>

        {/* Confidence Gauge */}
        <div className="text-right">
          <div className="text-xs font-semibold text-slate-300">Confidence</div>
          <div className="text-sm font-bold text-teal-400 flex items-center justify-end gap-1">
            <span>{confidencePercent}%</span>
          </div>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="mt-3 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-500"
          style={{ width: `${confidencePercent}%` }}
        />
      </div>

      {/* Explanation */}
      {analysis.explanation && (
        <div className="mt-3.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-teal-300 block mb-0.5">Municipal Rationale:</span>
          {analysis.explanation}
        </div>
      )}

      {/* Triage Grid */}
      <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-medium">Recommended Dept</div>
          <div className="text-xs font-bold text-slate-200 mt-1 truncate">
            {analysis.department || 'General Municipal Services'}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-medium">Predicted Category</div>
          <div className="text-xs font-bold text-slate-200 mt-1 capitalize truncate">
            {analysis.category?.replace('_', ' ') || 'Civic'}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 col-span-2 sm:col-span-1 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 uppercase font-medium">Estimated Priority</div>
          <div className="mt-1">
            {analysis.priority && <PriorityBadge priority={analysis.priority as ComplaintPriority} />}
          </div>
        </div>
      </div>

      {/* Risk Indicators */}
      {analysis.risk_indicators && analysis.risk_indicators.length > 0 && (
        <div className="mt-3">
          <div className="text-[11px] text-slate-400 font-medium mb-1.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Hazard & Risk Indicators Identified:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {analysis.risk_indicators.map((risk, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/80"
              >
                {risk}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Mandatory Human Review Notice */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
        <p>
          AI triage recommendations are advisory. High and critical hazard issues are prioritized for verified on-ground
          inspection by municipal staff.
        </p>
      </div>

      {/* Admin Action Bar */}
      {isAdmin && onApplyOverride && analysis.category && analysis.priority && analysis.department && (
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex justify-end">
          <button
            type="button"
            onClick={() =>
              onApplyOverride(
                analysis.category as ComplaintCategory,
                analysis.priority as ComplaintPriority,
                analysis.department as DepartmentName
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold transition shadow-sm"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Accept AI Recommendation</span>
          </button>
        </div>
      )}
    </div>
  );
};
