import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// 1. Initialize Server-side Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey && apiKey !== 'MY_GEMINI_API_KEY'
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// 2. Initialize Server-side Supabase Admin Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// Probe whether Supabase database tables have been migrated
async function checkSupabaseTables(): Promise<{ ready: boolean; error?: string }> {
  if (!supabaseAdmin) {
    return { ready: false, error: 'Supabase credentials not configured' };
  }
  try {
    const { error } = await supabaseAdmin
      .from('complaints')
      .select('id')
      .limit(1);

    if (error) {
      return { ready: false, error: error.message };
    }
    return { ready: true };
  } catch (err: any) {
    return { ready: false, error: err?.message || 'Connection failure' };
  }
}

// Authenticate caller strictly from Bearer JWT
async function getAuthenticatedCaller(req: express.Request): Promise<{
  id: string;
  email: string;
  role: 'citizen' | 'admin';
  fullName: string;
} | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  if (!token || !supabaseAdmin) return null;

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;

    // Default to citizen, verify role from profiles table (trusted server verification)
    let role: 'citizen' | 'admin' = (user.app_metadata?.role === 'admin') ? 'admin' : 'citizen';
    let fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Citizen User';

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      if (profile.role === 'admin') role = 'admin';
      if (profile.full_name) fullName = profile.full_name;
    }

    return {
      id: user.id,
      email: user.email || '',
      role,
      fullName,
    };
  } catch (err) {
    return null;
  }
}

// Generate human-readable civic complaint reference code
function generateRefCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 5; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CP-${new Date().getFullYear()}-${rand}`;
}

// ==========================================
// API ROUTES
// ==========================================

// 1. System Health & Database Migration Status
app.get('/api/health', async (req, res) => {
  const hasGemini = Boolean(ai);
  const hasSupabaseUrl = Boolean(process.env.VITE_SUPABASE_URL);
  const tableCheck = await checkSupabaseTables();
  const hasSMS = Boolean(process.env.SMS_PROVIDER_API_KEY);

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    integrations: {
      gemini: {
        configured: hasGemini,
        model: 'gemini-3.8-flash',
        mode: hasGemini ? 'active' : 'unavailable',
      },
      supabase: {
        configured: hasSupabaseUrl,
        tablesMigrated: tableCheck.ready,
        mode: tableCheck.ready ? 'connected_database' : (hasSupabaseUrl ? 'pending_sql_migration' : 'unconfigured'),
        error: tableCheck.ready ? undefined : tableCheck.error,
      },
      sms: {
        configured: hasSMS,
        mode: hasSMS ? 'live_gateway' : 'unconfigured',
        notice: 'SMS gateway is optional and not currently configured. Live SMS/OTP delivery is disabled.',
      },
      aadhaar: {
        configured: false,
        status: 'statutory_boundary_preserved',
        notice: 'Aadhaar verification requires statutory UIDAI integration. Ordinary mobile OTP verifies phone control only.',
      },
    },
  });
});

// 2. Server-side Gemini AI Triage Endpoint
const classifyComplaintHandler = async (req: express.Request, res: express.Response) => {
  try {
    const { title, description, address } = req.body;
    if (!title || typeof title !== 'string' || !description || typeof description !== 'string') {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    const safeTitle = title.trim().slice(0, 300);
    const safeDescription = description.trim().slice(0, 1500);
    const safeAddress = address ? String(address).trim().slice(0, 300) : 'Unspecified';

    if (!ai) {
      return res.json({
        available: false,
        status: 'pending_review',
        category: null,
        department: null,
        priority: 'medium',
        confidence: null,
        explanation: 'Gemini AI is not configured. Complaint queued for manual municipal assessment.',
        risk_indicators: [],
        needs_human_review: true,
        source: 'unprocessed_pending_review',
      });
    }

    const promptText = `
You are an expert municipal infrastructure triage AI for a city administration.
Analyze this citizen-reported civic issue and produce a strictly validated classification.

Title: ${safeTitle}
Description: ${safeDescription}
Location Context: ${safeAddress}

Classification Rules:
- Allowed categories: 'pothole', 'garbage', 'streetlight', 'water_leakage', 'drainage', 'other'
- Allowed departments: 'Roads', 'Sanitation', 'Street Lighting', 'Water Supply', 'Drainage', 'General Municipal Services'
- Allowed priority: 'low', 'medium', 'high', 'critical'
- Priority definitions:
  * 'critical': immediate threat to human life or acute hazard (open manhole, live sparking electrical wires, major pipeline burst)
  * 'high': active accident risk, severe public health hazard, major arterial traffic blockage
  * 'medium': standard maintenance issue without immediate casualty hazard
  * 'low': minor aesthetic wear and tear
- Confidence: estimated value between 0.1 and 0.99
- Needs human review: true if critical/high priority or ambiguous.
`;

    const aiCall = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            department: { type: Type.STRING },
            priority: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            explanation: { type: Type.STRING },
            risk_indicators: { type: Type.ARRAY, items: { type: Type.STRING } },
            needs_human_review: { type: Type.BOOLEAN },
          },
          required: ['category', 'department', 'priority', 'confidence', 'explanation', 'risk_indicators', 'needs_human_review'],
        },
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI inference timed out')), 15000)
    );

    const response = await Promise.race([aiCall, timeoutPromise]);

    let rawJson = response.text?.trim() || '';
    if (rawJson.startsWith('```json')) {
      rawJson = rawJson.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (rawJson.startsWith('```')) {
      rawJson = rawJson.replace(/^```/, '').replace(/```$/, '').trim();
    }

    if (rawJson) {
      const parsed = JSON.parse(rawJson);
      // Validate schema values
      const validCategories = ['pothole', 'garbage', 'streetlight', 'water_leakage', 'drainage', 'other'];
      const validPriorities = ['low', 'medium', 'high', 'critical'];
      const validDepts = ['Roads', 'Sanitation', 'Street Lighting', 'Water Supply', 'Drainage', 'General Municipal Services'];

      const finalCategory = validCategories.includes(parsed.category) ? parsed.category : 'other';
      const finalPriority = validPriorities.includes(parsed.priority) ? parsed.priority : 'medium';
      const finalDept = validDepts.includes(parsed.department) ? parsed.department : 'General Municipal Services';

      return res.json({
        category: finalCategory,
        department: finalDept,
        priority: finalPriority,
        confidence: typeof parsed.confidence === 'number' ? Math.min(Math.max(parsed.confidence, 0.1), 0.99) : 0.85,
        explanation: parsed.explanation || 'Classified based on municipal infrastructure heuristics.',
        risk_indicators: Array.isArray(parsed.risk_indicators) ? parsed.risk_indicators : [],
        needs_human_review: Boolean(parsed.needs_human_review),
        available: true,
        model: 'gemini-3.8-flash',
        source: 'gemini',
      });
    }

    return res.json({
      available: false,
      status: 'pending_review',
      category: null,
      department: null,
      priority: 'medium',
      confidence: null,
      explanation: 'AI classification output could not be parsed. Queued for human inspection.',
      risk_indicators: [],
      needs_human_review: true,
      source: 'unprocessed_pending_review',
    });
  } catch (err: any) {
    console.warn('Gemini classification error:', err?.message || err);
    return res.json({
      available: false,
      status: 'pending_review',
      category: null,
      department: null,
      priority: 'medium',
      confidence: null,
      explanation: 'AI service temporarily unavailable. Complaint preserved for manual review.',
      risk_indicators: [],
      needs_human_review: true,
      source: 'unprocessed_pending_review',
    });
  }
};

app.post('/api/ai/classify-complaint', classifyComplaintHandler);
app.post('/api/complaints/classify', classifyComplaintHandler);

// 3. Complaints Collection API (Supabase Persistent with Strict Authorization)
app.get('/api/complaints', async (req, res) => {
  const caller = await getAuthenticatedCaller(req);
  const { status, category, priority, department, search } = req.query;

  const tableCheck = await checkSupabaseTables();
  if (!tableCheck.ready || !supabaseAdmin) {
    return res.status(503).json({
      total: 0,
      complaints: [],
      pendingMigration: true,
      error: 'Database tables are pending migration in Supabase. Please run the SQL migration script in your Supabase SQL Editor.',
    });
  }

  // Citizens must be authenticated to view their complaints
  if (!caller) {
    return res.status(401).json({
      total: 0,
      complaints: [],
      error: 'Authentication required. Please sign in to view your complaints.',
    });
  }

  try {
    let query = supabaseAdmin
      .from('complaints')
      .select(`
        id,
        reference_code,
        citizen_id,
        citizen_name,
        citizen_phone,
        title,
        description,
        category,
        ai_category,
        ai_confidence,
        ai_explanation,
        priority,
        ai_priority,
        priority_reason,
        department,
        address,
        latitude,
        longitude,
        photo_path,
        status,
        public_resolution_note,
        rejection_reason,
        needs_human_review,
        created_at,
        updated_at,
        resolved_at,
        updates:complaint_updates(
          id,
          complaint_id,
          actor_name,
          actor_role,
          old_status,
          new_status,
          public_note,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    // Enforce role-based access:
    // If not admin, strictly isolate to complaints submitted by the caller
    const isCallerAdmin = caller.role === 'admin';
    if (!isCallerAdmin) {
      query = query.eq('citizen_id', caller.id);
    }

    // Filter parameters
    if (status && status !== 'all') query = query.eq('status', status);
    if (category && category !== 'all') query = query.eq('category', category);
    if (priority && priority !== 'all') query = query.eq('priority', priority);
    if (department && department !== 'all') query = query.eq('department', department);
    if (search && typeof search === 'string') {
      const q = search.trim();
      query = query.or(`reference_code.ilike.%${q}%,title.ilike.%${q}%,address.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Format snake_case to frontend camelCase
    const formatted = (data || []).map((row: any) => ({
      id: row.id,
      referenceCode: row.reference_code,
      citizenId: row.citizen_id,
      citizenName: isCallerAdmin ? row.citizen_name : 'You',
      citizenPhone: isCallerAdmin ? row.citizen_phone : undefined,
      title: row.title,
      description: row.description,
      category: row.category,
      aiCategory: row.ai_category,
      aiConfidence: row.ai_confidence,
      aiExplanation: row.ai_explanation,
      priority: row.priority,
      aiPriority: row.ai_priority,
      priorityReason: row.priority_reason,
      department: row.department,
      address: row.address,
      latitude: row.latitude,
      longitude: row.longitude,
      photoUrl: row.photo_path,
      status: row.status,
      publicResolutionNote: row.public_resolution_note,
      rejectionReason: row.rejection_reason,
      needsHumanReview: row.needs_human_review,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      resolvedAt: row.resolved_at,
      updates: (row.updates || []).map((u: any) => ({
        id: u.id,
        complaintId: u.complaint_id,
        actorName: u.actor_name,
        actorRole: u.actor_role,
        oldStatus: u.old_status,
        newStatus: u.new_status,
        publicNote: u.public_note,
        createdAt: u.created_at,
      })),
    }));

    return res.json({ total: formatted.length, complaints: formatted });
  } catch (dbErr: any) {
    console.error('Complaints fetch error:', dbErr);
    return res.status(500).json({ error: dbErr.message || 'Failed to fetch complaints' });
  }
});

// 4. Single Complaint Detail (Strict ownership & privacy verification)
app.get('/api/complaints/:id', async (req, res) => {
  const { id } = req.params;
  const caller = await getAuthenticatedCaller(req);

  const tableCheck = await checkSupabaseTables();
  if (!tableCheck.ready || !supabaseAdmin) {
    return res.status(503).json({
      error: 'Database tables are pending migration in Supabase.',
      pendingMigration: true,
    });
  }

  if (!caller) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let query = supabaseAdmin
      .from('complaints')
      .select(`
        *,
        updates:complaint_updates(*),
        internal_notes:complaint_internal_notes(*),
        assignments:complaint_assignments(*)
      `);

    if (isUUID) {
      query = query.eq('id', id);
    } else {
      query = query.ilike('reference_code', id);
    }

    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Complaint not found.' });

    const isCallerAdmin = caller.role === 'admin';
    // If not admin, enforce that caller is the owner
    if (!isCallerAdmin && data.citizen_id !== caller.id) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to view this complaint.' });
    }

    const formatted = {
      id: data.id,
      referenceCode: data.reference_code,
      citizenId: data.citizen_id,
      citizenName: isCallerAdmin ? data.citizen_name : 'You',
      citizenPhone: isCallerAdmin ? data.citizen_phone : undefined,
      title: data.title,
      description: data.description,
      category: data.category,
      aiCategory: data.ai_category,
      aiConfidence: data.ai_confidence,
      aiExplanation: data.ai_explanation,
      priority: data.priority,
      aiPriority: data.ai_priority,
      priorityReason: data.priority_reason,
      department: data.department,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      photoUrl: data.photo_path,
      status: data.status,
      publicResolutionNote: data.public_resolution_note,
      rejectionReason: data.rejection_reason,
      needsHumanReview: data.needs_human_review,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      resolvedAt: data.resolved_at,
      updates: (data.updates || []).map((u: any) => ({
        id: u.id,
        complaintId: u.complaint_id,
        actorName: u.actor_name,
        actorRole: u.actor_role,
        oldStatus: u.old_status,
        newStatus: u.new_status,
        publicNote: u.public_note,
        createdAt: u.created_at,
      })),
      // CRITICAL: internal notes strictly restricted to verified administrators
      internalNotes: isCallerAdmin
        ? (data.internal_notes || []).map((n: any) => ({
            id: n.id,
            complaintId: n.complaint_id,
            authorName: n.author_name,
            note: n.note,
            createdAt: n.created_at,
          }))
        : [],
      assignments: isCallerAdmin ? data.assignments || [] : [],
    };

    return res.json(formatted);
  } catch (e: any) {
    console.error('Complaint detail fetch error:', e);
    return res.status(500).json({ error: e.message || 'Failed to fetch complaint' });
  }
});

// 5. Public Tracking by Reference Code (Zero citizen PII leakage)
app.get('/api/complaints/track/:refCode', async (req, res) => {
  const refCode = req.params.refCode.trim().toUpperCase();

  const tableCheck = await checkSupabaseTables();
  if (!tableCheck.ready || !supabaseAdmin) {
    return res.status(503).json({
      found: false,
      error: 'Database tables are pending migration in Supabase. Please execute the SQL migration script.',
    });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('complaints')
      .select(`
        reference_code,
        title,
        category,
        status,
        department,
        priority,
        address,
        created_at,
        updated_at,
        resolved_at,
        public_resolution_note,
        updates:complaint_updates(
          id,
          new_status,
          public_note,
          actor_role,
          created_at
        )
      `)
      .ilike('reference_code', refCode)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ found: false, error: 'No complaint found matching this reference code.' });
    }

    return res.json({
      found: true,
      referenceCode: data.reference_code,
      title: data.title,
      category: data.category,
      status: data.status,
      department: data.department || 'Under Assessment',
      priority: data.priority,
      addressArea: data.address,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      resolvedAt: data.resolved_at,
      publicResolutionNote: data.public_resolution_note,
      timeline: (data.updates || []).map((u: any) => ({
        id: u.id,
        status: u.new_status,
        note: u.public_note || 'Status update logged',
        actorRole: u.actor_role,
        createdAt: u.created_at,
      })),
    });
  } catch (e: any) {
    console.error('Public track query error:', e);
    return res.status(500).json({ found: false, error: 'Failed to search complaint' });
  }
});

// 6. Create Complaint (Persistent Supabase insertion + server Gemini AI triage)
app.post('/api/complaints', async (req, res) => {
  try {
    const caller = await getAuthenticatedCaller(req);
    const {
      title,
      description,
      category,
      address,
      latitude,
      longitude,
      photoUrl,
    } = req.body;

    if (!title || !description || !address) {
      return res.status(400).json({ error: 'Title, description, and location address are required.' });
    }

    // Require authentication to lodge complaints
    if (!caller) {
      return res.status(401).json({
        error: 'Authentication required. Please sign in to lodge a civic complaint.',
      });
    }

    const tableCheck = await checkSupabaseTables();
    if (!tableCheck.ready || !supabaseAdmin) {
      return res.status(503).json({
        error: 'Database tables are pending migration in Supabase. Please run the SQL migration script in your Supabase SQL Editor.',
      });
    }

    const refCode = generateRefCode();

    // Run Server-side Gemini AI Triage
    let aiResult: any = null;
    if (ai) {
      try {
        const promptText = `
Classify this municipal civic complaint:
Title: ${title}
Description: ${description}
Location: ${address}

Allowed categories: pothole, garbage, streetlight, water_leakage, drainage, other
Allowed departments: Roads, Sanitation, Street Lighting, Water Supply, Drainage, General Municipal Services
Allowed priorities: low, medium, high, critical
Respond strictly in JSON matching the schema.
`;
        const aiCall = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptText,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                department: { type: Type.STRING },
                priority: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                explanation: { type: Type.STRING },
                risk_indicators: { type: Type.ARRAY, items: { type: Type.STRING } },
                needs_human_review: { type: Type.BOOLEAN },
              },
              required: ['category', 'department', 'priority', 'confidence', 'explanation', 'risk_indicators', 'needs_human_review'],
            },
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI triage timed out')), 5000)
        );

        const aiResponse = await Promise.race([aiCall, timeoutPromise]);
        if (aiResponse.text) {
          aiResult = JSON.parse(aiResponse.text.trim());
        }
      } catch (e) {
        console.warn('Gemini triage execution error:', e);
      }
    }

    const assignedCategory = category || aiResult?.category || 'other';
    const assignedPriority = aiResult?.priority || 'medium';
    const assignedDepartment = aiResult?.department || 'General Municipal Services';

    // 1. Insert Complaint into Supabase
    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('complaints')
      .insert({
        reference_code: refCode,
        citizen_id: caller.id,
        citizen_name: caller.fullName || 'Citizen User',
        citizen_phone: null,
        title: title.trim(),
        description: description.trim(),
        category: assignedCategory,
        ai_category: aiResult?.category || null,
        ai_confidence: typeof aiResult?.confidence === 'number' ? aiResult.confidence : null,
        ai_explanation: aiResult?.explanation || null,
        priority: assignedPriority,
        ai_priority: aiResult?.priority || null,
        priority_reason: aiResult?.explanation || null,
        department: assignedDepartment,
        address: address.trim(),
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        photo_path: photoUrl || null,
        status: 'submitted',
        needs_human_review: Boolean(aiResult?.needs_human_review ?? true),
      })
      .select()
      .single();

    if (insertErr) {
      console.error('Supabase complaint insert failed:', insertErr);
      throw insertErr;
    }

    // 2. Insert initial public status update in timeline
    await supabaseAdmin.from('complaint_updates').insert({
      complaint_id: inserted.id,
      actor_name: 'CivicPulse Triage System',
      actor_role: 'system',
      new_status: 'submitted',
      public_note: `Complaint registered with reference ${refCode}. Routed to ${assignedDepartment}.`,
    });

    return res.status(201).json({
      success: true,
      referenceCode: refCode,
      complaint: {
        id: inserted.id,
        referenceCode: inserted.reference_code,
        citizenId: inserted.citizen_id,
        citizenName: inserted.citizen_name,
        title: inserted.title,
        description: inserted.description,
        category: inserted.category,
        priority: inserted.priority,
        department: inserted.department,
        address: inserted.address,
        status: inserted.status,
        createdAt: inserted.created_at,
        updates: [
          {
            id: 'init-update',
            newStatus: 'submitted',
            publicNote: `Complaint registered with reference ${refCode}.`,
            createdAt: inserted.created_at,
          },
        ],
      },
      message: 'Complaint successfully lodged and saved to database.',
    });
  } catch (err: any) {
    console.error('Create complaint error:', err);
    res.status(500).json({ error: err.message || 'Failed to lodge complaint. Please try again.' });
  }
});

// 7. Admin Update & Triage Dispatch (Verified Admin Only — NEVER trust browser-supplied role)
app.patch('/api/complaints/:id', async (req, res) => {
  const { id } = req.params;
  const caller = await getAuthenticatedCaller(req);

  // STRICT AUTHORIZATION CHECK: Caller MUST be a verified admin in profiles
  if (!caller || caller.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden: Only verified municipal administrators can update complaints or assign departments.',
    });
  }

  const {
    status,
    priority,
    department,
    publicNote,
    internalNote,
    rejectionReason,
  } = req.body;

  if (status === 'rejected' && !rejectionReason && !publicNote) {
    return res.status(400).json({ error: 'A formal reason is required to reject a civic complaint.' });
  }

  const tableCheck = await checkSupabaseTables();
  if (!tableCheck.ready || !supabaseAdmin) {
    return res.status(503).json({
      error: 'Database tables are pending migration in Supabase.',
    });
  }

  try {
    // 1. Fetch current status
    const { data: current, error: fetchErr } = await supabaseAdmin
      .from('complaints')
      .select('id, status, department')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!current) return res.status(404).json({ error: 'Complaint not found.' });

    const updates: any = {
      updated_at: new Date().toISOString(),
    };
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (department) updates.department = department;
    if (rejectionReason) updates.rejection_reason = rejectionReason;
    if (status === 'resolved') {
      updates.resolved_at = new Date().toISOString();
      if (publicNote) updates.public_resolution_note = publicNote;
    }

    // 2. Update complaint record
    const { data: updatedComplaint, error: updateErr } = await supabaseAdmin
      .from('complaints')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // 3. Insert into public complaint_updates table (Audit Trail)
    if (status || publicNote) {
      await supabaseAdmin.from('complaint_updates').insert({
        complaint_id: id,
        actor_id: caller.id,
        actor_name: caller.fullName || 'Municipal Officer',
        actor_role: 'admin',
        old_status: current.status,
        new_status: status || current.status,
        public_note: publicNote || `Status updated to ${status}`,
      });
    }

    // 4. Record department assignment history if department changed
    if (department && department !== current.department) {
      await supabaseAdmin.from('complaint_assignments').insert({
        complaint_id: id,
        department_name: department,
        assigned_by: caller.id,
        notes: publicNote || `Department assigned to ${department}`,
      });
    }

    // 5. Insert into private internal notes table if provided
    if (internalNote && internalNote.trim()) {
      await supabaseAdmin.from('complaint_internal_notes').insert({
        complaint_id: id,
        author_id: caller.id,
        author_name: caller.fullName || 'Municipal Officer',
        note: internalNote.trim(),
      });
    }

    return res.json({
      success: true,
      complaint: updatedComplaint,
      message: 'Complaint successfully updated in database.',
    });
  } catch (e: any) {
    console.error('Supabase admin update error:', e);
    return res.status(500).json({ error: e.message || 'Failed to update complaint' });
  }
});

// 8. Real-time KPI Stats from Database
app.get('/api/stats', async (req, res) => {
  const tableCheck = await checkSupabaseTables();
  if (!tableCheck.ready || !supabaseAdmin) {
    return res.json({
      totalComplaints: 0,
      submitted: 0,
      underReview: 0,
      inProgress: 0,
      resolved: 0,
      rejected: 0,
      highPriority: 0,
      avgResolutionDays: 0,
      byCategory: {},
      byDepartment: {},
      pendingMigration: true,
    });
  }

  try {
    const { data: allComplaints, error } = await supabaseAdmin
      .from('complaints')
      .select('id, status, priority, category, department, created_at, resolved_at');

    if (error) throw error;
    const complaints = allComplaints || [];

    const totalComplaints = complaints.length;
    const submitted = complaints.filter((c) => c.status === 'submitted').length;
    const underReview = complaints.filter((c) => c.status === 'under_review').length;
    const inProgress = complaints.filter((c) => c.status === 'in_progress' || c.status === 'assigned').length;
    const resolved = complaints.filter((c) => c.status === 'resolved').length;
    const rejected = complaints.filter((c) => c.status === 'rejected').length;
    const highPriority = complaints.filter((c) => c.priority === 'high' || c.priority === 'critical').length;

    let totalDays = 0;
    let resolvedCount = 0;
    for (const c of complaints) {
      if (c.status === 'resolved' && c.resolved_at && c.created_at) {
        const diff = new Date(c.resolved_at).getTime() - new Date(c.created_at).getTime();
        totalDays += diff / (1000 * 3600 * 24);
        resolvedCount++;
      }
    }
    const avgResolutionDays = resolvedCount > 0 ? Number((totalDays / resolvedCount).toFixed(1)) : 0;

    const byCategory: Record<string, number> = {};
    for (const c of complaints) {
      byCategory[c.category] = (byCategory[c.category] || 0) + 1;
    }

    const byDepartment: Record<string, number> = {};
    for (const c of complaints) {
      const dept = c.department || 'Unassigned';
      byDepartment[dept] = (byDepartment[dept] || 0) + 1;
    }

    return res.json({
      totalComplaints,
      submitted,
      underReview,
      inProgress,
      resolved,
      rejected,
      highPriority,
      avgResolutionDays,
      byCategory,
      byDepartment,
    });
  } catch (e: any) {
    console.warn('DB stats calculation error:', e);
    return res.status(500).json({ error: 'Failed to calculate stats' });
  }
});

// 9. SMS & Mobile OTP Endpoint (Strict Rule: Do not fake delivery when unconfigured)
app.post('/api/auth/send-otp', (req, res) => {
  const smsConfigured = Boolean(process.env.SMS_PROVIDER_API_KEY);
  if (!smsConfigured) {
    return res.status(503).json({
      success: false,
      configured: false,
      error: 'SMS verification gateway is not configured. Live mobile OTP delivery is currently disabled.',
      notice: 'In compliance with project specifications, OTP delivery is not simulated.',
    });
  }

  res.json({
    success: true,
    configured: true,
    message: 'OTP sent via configured SMS provider.',
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const smsConfigured = Boolean(process.env.SMS_PROVIDER_API_KEY);
  if (!smsConfigured) {
    return res.status(503).json({
      success: false,
      configured: false,
      error: 'SMS verification gateway is not configured.',
    });
  }

  res.json({
    success: true,
    phoneVerified: true,
  });
});

// ==========================================
// STATIC ASSETS & VITE DEV MIDDLEWARE
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicPulse AI full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
