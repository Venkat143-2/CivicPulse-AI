import {
  AIClassificationResult,
  Complaint,
  KPIStats,
} from '../types';
import { supabase } from './supabase';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    } catch {
      // ignore
    }
  }
  return headers;
}

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
  const headers = await getAuthHeaders();
  const res = await fetch('/api/ai/classify-complaint', {
    method: 'POST',
    headers,
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
  const headers = await getAuthHeaders();
  const query = new URLSearchParams();
  if (params?.citizenId) query.set('citizenId', params.citizenId);
  if (params?.role) query.set('role', params.role);
  if (params?.status) query.set('status', params.status);
  if (params?.category) query.set('category', params.category);
  if (params?.priority) query.set('priority', params.priority);
  if (params?.department) query.set('department', params.department);
  if (params?.search) query.set('search', params.search);

  const res = await fetch(`/api/complaints?${query.toString()}`, { headers });
  if (!res.ok) throw new Error('Failed to load complaints');
  return res.json();
}

export async function fetchComplaintById(
  id: string,
  params?: { citizenId?: string; role?: string }
): Promise<Complaint> {
  const headers = await getAuthHeaders();
  const query = new URLSearchParams();
  if (params?.citizenId) query.set('citizenId', params.citizenId);
  if (params?.role) query.set('role', params.role);

  const res = await fetch(`/api/complaints/${encodeURIComponent(id)}?${query.toString()}`, { headers });
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
  const headers = await getAuthHeaders();
  const res = await fetch('/api/complaints', {
    method: 'POST',
    headers,
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
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/complaints/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update complaint');
  }

  return res.json();
}

export async function uploadComplaintPhotoToStorage(file: File): Promise<string> {
  if (supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const ext = file.name.split('.').pop() || 'jpg';
      const userFolder = session?.user?.id || 'uploads';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = `${userFolder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('complaint-photos')
        .upload(filePath, file, { upsert: false });

      if (!error && data) {
        // Generate signed URL with 1-year validity for the private bucket
        const { data: signedData, error: signError } = await supabase.storage
          .from('complaint-photos')
          .createSignedUrl(filePath, 60 * 60 * 24 * 365);

        if (!signError && signedData?.signedUrl) {
          return signedData.signedUrl;
        }

        const { data: urlData } = supabase.storage
          .from('complaint-photos')
          .getPublicUrl(filePath);
        return urlData.publicUrl;
      }
    } catch (e) {
      console.warn('Storage upload warning:', e);
    }
  }

  // Fallback to Base64 Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function fetchKPIStats(): Promise<KPIStats> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/stats', { headers });
  if (!res.ok) throw new Error('Failed to load statistics');
  return res.json();
}

export async function requestMobileOTP(phone: string) {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/auth/send-otp', {
    method: 'POST',
    headers,
    body: JSON.stringify({ phone }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'SMS verification is not configured.');
  }
  return data;
}

export async function verifyMobileOTP(phone: string, code: string) {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers,
    body: JSON.stringify({ phone, code }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'SMS verification is not configured.');
  }
  return data;
}
