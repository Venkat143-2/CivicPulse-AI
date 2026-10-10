import {
  AIClassificationResult,
  Complaint,
  KPIStats,
} from '../types';

export async function checkSystemHealth() {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function classifyComplaintAI(data: {
  title: string;
  description: string;
  address?: string;
}): Promise<AIClassificationResult> {
  const res = await fetch('/api/ai/classify-complaint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'AI classification request failed');
  }

  return res.json();
}

export async function fetchComplaints(params?: {
  citizenId?: string;
  role?: string;
  status?: string;
  category?: string;
  priority?: string;
  department?: string;
  search?: string;
}): Promise<{ total: number; complaints: Complaint[] }> {
  const query = new URLSearchParams();
  if (params?.citizenId) query.set('citizenId', params.citizenId);
  if (params?.role) query.set('role', params.role);
  if (params?.status) query.set('status', params.status);
  if (params?.category) query.set('category', params.category);
  if (params?.priority) query.set('priority', params.priority);
  if (params?.department) query.set('department', params.department);
  if (params?.search) query.set('search', params.search);

  const res = await fetch(`/api/complaints?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load complaints');
  return res.json();
}

export async function fetchComplaintById(
  id: string,
  params?: { citizenId?: string; role?: string }
): Promise<Complaint> {
  const query = new URLSearchParams();
  if (params?.citizenId) query.set('citizenId', params.citizenId);
  if (params?.role) query.set('role', params.role);

  const res = await fetch(`/api/complaints/${encodeURIComponent(id)}?${query.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch complaint details');
  }
  return res.json();
}

export async function trackComplaintPublic(refCode: string) {
  const res = await fetch(`/api/complaints/track/${encodeURIComponent(refCode)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Complaint not found with this reference code');
  }
  return res.json();
}

export async function submitComplaint(payload: {
  citizenId?: string;
  citizenName?: string;
  citizenPhone?: string;
  title: string;
  description: string;
  category?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
}) {
  const res = await fetch('/api/complaints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to lodge complaint');
  }

  return res.json();
}

export async function updateComplaintByAdmin(
  id: string,
  payload: {
    status?: string;
    priority?: string;
    department?: string;
    publicNote?: string;
    internalNote?: string;
    rejectionReason?: string;
    actorName?: string;
  }
) {
  const res = await fetch(`/api/complaints/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update complaint');
  }

  return res.json();
}

export async function fetchKPIStats(): Promise<KPIStats> {
  const res = await fetch('/api/stats');
  if (!res.ok) throw new Error('Failed to load statistics');
  return res.json();
}

export async function requestMobileOTP(phone: string) {
  const res = await fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to send OTP');
  }
  return data;
}

export async function verifyMobileOTP(phone: string, code: string) {
  const res = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Invalid OTP code');
  }
  return data;
}
