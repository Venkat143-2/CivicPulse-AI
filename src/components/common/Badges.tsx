import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileQuestion,
  HelpCircle,
  Lightbulb,
  Trash2,
  Droplets,
  Flame,
  Waves,
  XCircle,
  Wrench,
} from 'lucide-react';
import { ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../../types';

export const StatusBadge: React.FC<{ status: ComplaintStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const configs: Record<
    ComplaintStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    submitted: {
      label: 'Submitted',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-300',
      icon: <Clock className="w-3 h-3 text-slate-500" />,
    },
    under_review: {
      label: 'Under Review',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      icon: <FileQuestion className="w-3 h-3 text-amber-600" />,
    },
    assigned: {
      label: 'Assigned',
      bg: 'bg-sky-50',
      text: 'text-sky-800',
      border: 'border-sky-200',
      icon: <Clock className="w-3 h-3 text-sky-600" />,
    },
    in_progress: {
      label: 'In Progress',
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
      icon: <Wrench className="w-3 h-3 text-indigo-600 animate-pulse" />,
    },
    resolved: {
      label: 'Resolved',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
    },
    rejected: {
      label: 'Rejected',
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      icon: <XCircle className="w-3 h-3 text-rose-600" />,
    },
  };

  const item = configs[status] || configs.submitted;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${item.bg} ${item.text} ${item.border} ${className}`}
    >
      {item.icon}
      <span>{item.label}</span>
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: ComplaintPriority; className?: string }> = ({
  priority,
  className = '',
}) => {
  const configs: Record<
    ComplaintPriority,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    low: {
      label: 'Low',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      icon: null,
    },
    medium: {
      label: 'Medium',
      bg: 'bg-teal-50',
      text: 'text-teal-800',
      border: 'border-teal-200',
      icon: null,
    },
    high: {
      label: 'High',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-300',
      icon: <AlertTriangle className="w-3 h-3 text-amber-600" />,
    },
    critical: {
      label: 'Critical',
      bg: 'bg-rose-100',
      text: 'text-rose-900',
      border: 'border-rose-300',
      icon: <AlertOctagon className="w-3 h-3 text-rose-600" />,
    },
  };

  const item = configs[priority] || configs.medium;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${item.bg} ${item.text} ${item.border} ${className}`}
    >
      {item.icon}
      <span>{item.label}</span>
    </span>
  );
};

export const CategoryBadge: React.FC<{ category: ComplaintCategory; className?: string }> = ({
  category,
  className = '',
}) => {
  const configs: Record<
    ComplaintCategory,
    { label: string; icon: React.ReactNode; color: string }
  > = {
    pothole: {
      label: 'Pothole / Road',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />,
      color: 'text-orange-900 bg-orange-50 border-orange-200',
    },
    garbage: {
      label: 'Garbage & Waste',
      icon: <Trash2 className="w-3.5 h-3.5 text-emerald-600" />,
      color: 'text-emerald-900 bg-emerald-50 border-emerald-200',
    },
    streetlight: {
      label: 'Street Lighting',
      icon: <Lightbulb className="w-3.5 h-3.5 text-amber-600" />,
      color: 'text-amber-900 bg-amber-50 border-amber-200',
    },
    water_leakage: {
      label: 'Water Leakage',
      icon: <Droplets className="w-3.5 h-3.5 text-cyan-600" />,
      color: 'text-cyan-900 bg-cyan-50 border-cyan-200',
    },
    drainage: {
      label: 'Drainage & Sewage',
      icon: <Waves className="w-3.5 h-3.5 text-blue-600" />,
      color: 'text-blue-900 bg-blue-50 border-blue-200',
    },
    other: {
      label: 'Civic Issue',
      icon: <HelpCircle className="w-3.5 h-3.5 text-slate-600" />,
      color: 'text-slate-900 bg-slate-50 border-slate-200',
    },
  };

  const item = configs[category] || configs.other;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${item.color} ${className}`}
    >
      {item.icon}
      <span>{item.label}</span>
    </span>
  );
};
