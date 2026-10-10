export type UserRole = 'citizen' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  phoneVerified: boolean;
  role: UserRole;
  createdAt: string;
}

export type ComplaintCategory =
  | 'pothole'
  | 'garbage'
  | 'streetlight'
  | 'water_leakage'
  | 'drainage'
  | 'other';

export type ComplaintStatus =
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'rejected';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';

export const DEPARTMENTS = [
  'Roads',
  'Sanitation',
  'Street Lighting',
  'Water Supply',
  'Drainage',
  'General Municipal Services',
] as const;

export type DepartmentName = (typeof DEPARTMENTS)[number];

export interface AIClassificationResult {
  category: ComplaintCategory;
  department: DepartmentName;
  priority: ComplaintPriority;
  confidence: number;
  explanation: string;
  risk_indicators: string[];
  needs_human_review: boolean;
  model: string;
  source: 'gemini' | 'heuristic_fallback';
}

export interface ComplaintUpdate {
  id: string;
  complaintId: string;
  actorId?: string;
  actorName: string;
  actorRole: 'admin' | 'system' | 'citizen';
  oldStatus?: ComplaintStatus;
  newStatus: ComplaintStatus;
  publicNote?: string;
  internalNote?: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  referenceCode: string;
  citizenId: string;
  citizenName: string;
  citizenPhone?: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  aiCategory?: ComplaintCategory;
  aiConfidence?: number;
  aiExplanation?: string;
  priority: ComplaintPriority;
  aiPriority?: ComplaintPriority;
  priorityReason?: string;
  department?: DepartmentName | string;
  address: string;
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
  status: ComplaintStatus;
  publicResolutionNote?: string;
  rejectionReason?: string;
  needsHumanReview: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  updates: ComplaintUpdate[];
  internalNotes?: Array<{
    id: string;
    complaintId?: string;
    authorName?: string;
    author_name?: string;
    note: string;
    createdAt?: string;
    created_at?: string;
  }>;
}

export interface KPIStats {
  totalComplaints: number;
  submitted: number;
  underReview: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  highPriority: number;
  avgResolutionDays: number;
  byCategory?: Record<string, number>;
  byDepartment?: Record<string, number>;
}
