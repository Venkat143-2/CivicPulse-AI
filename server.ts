import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Google GenAI client (Server-side only)
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Types & Enums
type ComplaintCategory = 'pothole' | 'garbage' | 'streetlight' | 'water_leakage' | 'drainage' | 'other';
type ComplaintStatus = 'submitted' | 'under_review' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';
type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';

interface ComplaintUpdate {
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

interface Complaint {
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
  department?: string;
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
}

// In-Memory Database store (seeded with realistic municipal complaints)
const complaintsStore: Complaint[] = [
  {
    id: 'c1-pothole-mg-road',
    referenceCode: 'CP-2026-MG821',
    citizenId: 'citizen-demo-1',
    citizenName: 'Aarav Sharma',
    citizenPhone: '+91 9876543210',
    title: 'Severe deep pothole causing vehicle skids on MG Road',
    description: 'A crater-sized pothole has formed right in the middle lane near Metro Pillar 142. Two two-wheelers skidded yesterday during evening rain. Immediate asphalt patching required.',
    category: 'pothole',
    aiCategory: 'pothole',
    aiConfidence: 0.94,
    aiExplanation: 'Detailed description of a deep physical roadway cavity on a high-traffic arterial road posing active accident hazard.',
    priority: 'high',
    aiPriority: 'high',
    priorityReason: 'High vehicle traffic density and active skidding hazard reported.',
    department: 'Roads',
    address: 'Near Metro Pillar 142, MG Road, Ward 24, Bengaluru',
    latitude: 12.9716,
    longitude: 77.5946,
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    status: 'assigned',
    needsHumanReview: false,
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updates: [
      {
        id: 'u-1',
        complaintId: 'c1-pothole-mg-road',
        actorName: 'System AI',
        actorRole: 'system',
        newStatus: 'submitted',
        publicNote: 'Complaint received and registered with Reference CP-2026-MG821.',
        createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      },
      {
        id: 'u-2',
        complaintId: 'c1-pothole-mg-road',
        actorName: 'Priya Raman (Executive Engineer)',
        actorRole: 'admin',
        oldStatus: 'submitted',
        newStatus: 'assigned',
        publicNote: 'Assigned to Ward 24 Road Maintenance Quick Response Crew.',
        internalNote: 'Contractor crew dispatched with cold-mix asphalt patch unit for night repair.',
        createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'c2-garbage-market',
    referenceCode: 'CP-2026-GB403',
    citizenId: 'citizen-demo-1',
    citizenName: 'Aarav Sharma',
    citizenPhone: '+91 9876543210',
    title: 'Overflowing community garbage dump near Vegetable Market',
    description: 'Unattended municipal bins overflowing onto the pedestrian walkway for 4 days. Strong foul odor, stray cattle feeding, and flies buzzing around school crossing.',
    category: 'garbage',
    aiCategory: 'garbage',
    aiConfidence: 0.96,
    aiExplanation: 'Solid waste accumulation blocking public walkway, creating sanitation risk near educational zone.',
    priority: 'high',
    aiPriority: 'high',
    priorityReason: 'Sanitation emergency in proximity to pedestrian market and school route.',
    department: 'Sanitation',
    address: 'Gate 2, Central Vegetable Market, 4th Cross, Indiranagar',
    latitude: 12.9784,
    longitude: 77.6408,
    photoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    status: 'in_progress',
    needsHumanReview: false,
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    updates: [
      {
        id: 'u-3',
        complaintId: 'c2-garbage-market',
        actorName: 'System AI',
        actorRole: 'system',
        newStatus: 'submitted',
        publicNote: 'Complaint logged and prioritized.',
        createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      },
      {
        id: 'u-4',
        complaintId: 'c2-garbage-market',
        actorName: 'Ramesh Babu (Sanitation Supervisor)',
        actorRole: 'admin',
        oldStatus: 'submitted',
        newStatus: 'in_progress',
        publicNote: 'Compactor vehicle scheduled for 10:30 AM clearance. Disinfectant spray team mobilized.',
        internalNote: 'Compactor truck #KA-04-E-1823 assigned. Disinfection protocol activated.',
        createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'c3-water-pipeline-leak',
    referenceCode: 'CP-2026-WL912',
    citizenId: 'citizen-demo-2',
    citizenName: 'Meera Deshmukh',
    citizenPhone: '+91 9765432109',
    title: 'High-pressure clean water main line burst',
    description: 'Potable water is gushing under high pressure from beneath the pavement, flooding 200 meters of the residential lane and wasting thousands of liters.',
    category: 'water_leakage',
    aiCategory: 'water_leakage',
    aiConfidence: 0.98,
    aiExplanation: 'Major pressurized potable water pipeline rupture causing urban water loss and pavement destabilization.',
    priority: 'critical',
    aiPriority: 'critical',
    priorityReason: 'Pressurized water main rupture leading to severe resource wastage and structural undermining.',
    department: 'Water Supply',
    address: 'Opposite Community Hall, 7th Main Road, Malleshwaram',
    latitude: 13.0031,
    longitude: 77.5693,
    photoUrl: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80',
    status: 'under_review',
    needsHumanReview: true,
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    updates: [
      {
        id: 'u-5',
        complaintId: 'c3-water-pipeline-leak',
        actorName: 'System AI',
        actorRole: 'system',
        newStatus: 'submitted',
        publicNote: 'Complaint registered. Marked as Critical priority by AI triage.',
        createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'c4-dark-streetlight',
    referenceCode: 'CP-2026-SL105',
    citizenId: 'citizen-demo-1',
    citizenName: 'Aarav Sharma',
    citizenPhone: '+91 9876543210',
    title: 'Non-functional streetlights creating dark zone on Ring Road service lane',
    description: 'Four consecutive LED street light poles (Pole #SL-88 to #SL-92) have been off for three nights. Woman commuters and pedestrians feel unsafe after 7 PM.',
    category: 'streetlight',
    aiCategory: 'streetlight',
    aiConfidence: 0.92,
    aiExplanation: 'Electrical infrastructure blackout across consecutive fixtures creating safety hazard in public transit corridor.',
    priority: 'medium',
    aiPriority: 'medium',
    priorityReason: 'Pedestrian safety and dark corridor risk.',
    department: 'Street Lighting',
    address: 'Ring Road Service Lane, near Silk Board Flyover',
    latitude: 12.9172,
    longitude: 77.6228,
    status: 'resolved',
    needsHumanReview: false,
    createdAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    publicResolutionNote: 'Faulty MCB electrical box repaired and high-mast LED bulb modules replaced. All four luminaires tested functional.',
    updates: [
      {
        id: 'u-6',
        complaintId: 'c4-dark-streetlight',
        actorName: 'System AI',
        actorRole: 'system',
        newStatus: 'submitted',
        publicNote: 'Complaint registered with reference CP-2026-SL105.',
        createdAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
      },
      {
        id: 'u-7',
        complaintId: 'c4-dark-streetlight',
        actorName: 'Sanjay Gowda (Electrical Engineer)',
        actorRole: 'admin',
        oldStatus: 'submitted',
        newStatus: 'resolved',
        publicNote: 'Faulty MCB electrical box repaired and high-mast LED bulb modules replaced. All four luminaires tested functional.',
        internalNote: 'Replaced 4x 120W LED fixtures and re-terminated copper feeder line.',
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'c5-clogged-drain',
    referenceCode: 'CP-2026-DR771',
    citizenId: 'citizen-demo-3',
    citizenName: 'Sunita Rao',
    citizenPhone: '+91 9845123456',
    title: 'Pre-monsoon storm drain clogged with construction debris',
    description: 'Stormwater drain grating completely blocked by dumped cement plaster and silt. Rainwater starting to back up onto ground floor house verandas.',
    category: 'drainage',
    aiCategory: 'drainage',
    aiConfidence: 0.93,
    aiExplanation: 'Stormwater runoff blockage threatening domestic waterlogging ahead of rainfall.',
    priority: 'medium',
    aiPriority: 'medium',
    priorityReason: 'Localized waterlogging hazard.',
    department: 'Drainage',
    address: 'Cross 3, 2nd Stage, Koramangala',
    latitude: 12.9352,
    longitude: 77.6245,
    status: 'submitted',
    needsHumanReview: false,
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updates: [
      {
        id: 'u-8',
        complaintId: 'c5-clogged-drain',
        actorName: 'System AI',
        actorRole: 'system',
        newStatus: 'submitted',
        publicNote: 'Complaint registered. Queued for municipal review.',
        createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      },
    ],
  },
];

// In-Memory Mobile OTP Verification Store
interface OTPRecord {
  phone: string;
  code: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
}
const otpStore = new Map<string, OTPRecord>();

// Deterministic rule-based fallback triage for when Gemini is unreachable or key not present
function runRuleBasedHeuristicTriage(title: string, description: string): {
  category: ComplaintCategory;
  department: string;
  priority: ComplaintPriority;
  confidence: number;
  explanation: string;
  risk_indicators: string[];
  needs_human_review: boolean;
} {
  const text = `${title} ${description}`.toLowerCase();
  let category: ComplaintCategory = 'other';
  let department = 'General Municipal Services';
  let priority: ComplaintPriority = 'medium';
  const risk_indicators: string[] = [];

  if (/pothole|crater|road|asphalt|tar|tarmac|cavity|skid|accident/.test(text)) {
    category = 'pothole';
    department = 'Roads';
    if (/skid|accident|death|injur|deep|night|highway|main road/.test(text)) {
      priority = 'high';
      risk_indicators.push('Road accident risk', 'Arterial roadway disruption');
    }
  } else if (/garbage|waste|trash|dump|stench|odor|flies|bins|rubbish/.test(text)) {
    category = 'garbage';
    department = 'Sanitation';
    if (/school|hospital|rot|disease|overflow/.test(text)) {
      priority = 'high';
      risk_indicators.push('Public health contamination', 'Pedestrian obstruction');
    }
  } else if (/light|lamp|pole|dark|wire|spark|shock|blackout/.test(text)) {
    category = 'streetlight';
    department = 'Street Lighting';
    if (/wire|spark|shock|open|electrocution/.test(text)) {
      priority = 'critical';
      risk_indicators.push('Electrocution hazard', 'Live wire risk');
    } else {
      priority = 'medium';
      risk_indicators.push('Night visibility hazard');
    }
  } else if (/water|leak|pipe|burst|gush|meter|drinking|contamination/.test(text)) {
    category = 'water_leakage';
    department = 'Water Supply';
    if (/burst|gush|flooding|drinking water|massive/.test(text)) {
      priority = 'critical';
      risk_indicators.push('Major resource wastage', 'Infrastructure flooding');
    }
  } else if (/drain|drainage|sewage|sewer|manhole|clog|stink|gutter/.test(text)) {
    category = 'drainage';
    department = 'Drainage';
    if (/open manhole|fall|overflow into house/.test(text)) {
      priority = 'critical';
      risk_indicators.push('Open manhole life hazard', 'Severe waterlogging');
    }
  }

  const needs_human_review = priority === 'critical' || priority === 'high' || category === 'other';

  return {
    category,
    department,
    priority,
    confidence: 0.85,
    explanation: `Rule-based civic heuristics classified as ${category} under ${department} based on infrastructure keywords.`,
    risk_indicators: risk_indicators.length > 0 ? risk_indicators : ['Standard civic issue'],
    needs_human_review,
  };
}

// Generate Reference Code (e.g. CP-2026-K9P3)
function generateReferenceCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 5; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const year = new Date().getFullYear();
  return `CP-${year}-${rand}`;
}

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. System & Integration Health Endpoint
app.get('/api/health', (req, res) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  const hasSupabaseUrl = Boolean(process.env.VITE_SUPABASE_URL);
  const hasSMSProvider = Boolean(process.env.SMS_PROVIDER_API_KEY);

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    integrations: {
      gemini: {
        configured: hasGeminiKey,
        model: 'gemini-3.8-flash',
        mode: hasGeminiKey ? 'active' : 'fallback_heuristic',
      },
      supabase: {
        configured: hasSupabaseUrl,
        mode: hasSupabaseUrl ? 'connected' : 'in_memory_primary',
      },
      sms: {
        configured: hasSMSProvider,
        mode: hasSMSProvider ? 'live_provider' : 'demo_verification',
      },
      aadhaar: {
        configured: false,
        status: 'intentionally_disabled_statutory_boundary',
        disclaimer: 'Aadhaar verification requires authorized UIDAI statutory integration. Ordinary mobile OTP verifies phone control only.',
      },
    },
  });
});

// 2. Server-Side Gemini AI Complaint Classification
app.post('/api/ai/classify-complaint', async (req, res) => {
  try {
    const { title, description, address } = req.body;

    if (!title || typeof title !== 'string' || !description || typeof description !== 'string') {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    // Sanitize and limit inputs (never pass personal identifiers to AI)
    const safeTitle = title.trim().slice(0, 300);
    const safeDescription = description.trim().slice(0, 1500);
    const safeAddress = address ? String(address).trim().slice(0, 300) : 'Unspecified';

    // If Gemini is configured, use official @google/genai SDK with gemini-3.8-flash
    if (ai) {
      try {
        const promptText = `
You are an expert municipal infrastructure triage AI for a municipal city corporation.
Analyze this citizen-reported civic issue and produce a strictly validated classification.

Title: ${safeTitle}
Description: ${safeDescription}
Location Context: ${safeAddress}

Classification Rules:
- Allowed categories: 'pothole', 'garbage', 'streetlight', 'water_leakage', 'drainage', 'other'
- Allowed departments: 'Roads', 'Sanitation', 'Street Lighting', 'Water Supply', 'Drainage', 'General Municipal Services'
- Allowed priority: 'low', 'medium', 'high', 'critical'
- Priority guideline:
  * 'critical': immediate threat to human life or safety (open manhole, live electrical wire sparking, major pipeline burst flooding streets)
  * 'high': significant accident risk, major health hazard, or high-traffic arterial road blockage
  * 'medium': standard civic repair needed within standard SLA (dark streetlight in residential area, moderate garbage)
  * 'low': minor aesthetic or low-impact wear and tear
- Confidence: estimated value between 0.1 and 0.99
- Needs human review: true if critical/high priority or ambiguous.
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptText,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: {
                  type: Type.STRING,
                  description: "One of: 'pothole', 'garbage', 'streetlight', 'water_leakage', 'drainage', 'other'",
                },
                department: {
                  type: Type.STRING,
                  description: "One of: 'Roads', 'Sanitation', 'Street Lighting', 'Water Supply', 'Drainage', 'General Municipal Services'",
                },
                priority: {
                  type: Type.STRING,
                  description: "One of: 'low', 'medium', 'high', 'critical'",
                },
                confidence: {
                  type: Type.NUMBER,
                  description: "Confidence value between 0 and 1",
                },
                explanation: {
                  type: Type.STRING,
                  description: "Concise 1-2 sentence explanation for municipal officers",
                },
                risk_indicators: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Key civic hazard factors identified",
                },
                needs_human_review: {
                  type: Type.BOOLEAN,
                  description: "Whether manual official inspection is recommended",
                },
              },
              required: ['category', 'department', 'priority', 'confidence', 'explanation', 'risk_indicators', 'needs_human_review'],
            },
          },
        });

        const rawJson = response.text?.trim();
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          return res.json({
            ...parsed,
            model: 'gemini-3.8-flash',
            source: 'gemini',
          });
        }
      } catch (geminiError: any) {
        console.warn('Gemini classification fallback triggered:', geminiError?.message || geminiError);
      }
    }

    // Heuristic fallback if Gemini is offline or unavailable
    const fallback = runRuleBasedHeuristicTriage(safeTitle, safeDescription);
    return res.json({
      ...fallback,
      model: 'heuristic-rules-v1',
      source: 'heuristic_fallback',
    });
  } catch (err: any) {
    console.error('AI Classify Error:', err);
    const fallback = runRuleBasedHeuristicTriage(req.body?.title || '', req.body?.description || '');
    return res.json({
      ...fallback,
      model: 'heuristic-emergency',
      source: 'heuristic_fallback',
    });
  }
});

// 3. Complaints Collection API
app.get('/api/complaints', (req, res) => {
  const { citizenId, role, status, category, priority, department, search } = req.query;

  let results = [...complaintsStore];

  // Role isolation: if requested as citizen, restrict to citizen's own complaints
  if (role === 'citizen' && citizenId) {
    results = results.filter((c) => c.citizenId === String(citizenId));
  }

  // Admin filters
  if (status && status !== 'all') {
    results = results.filter((c) => c.status === status);
  }
  if (category && category !== 'all') {
    results = results.filter((c) => c.category === category);
  }
  if (priority && priority !== 'all') {
    results = results.filter((c) => c.priority === priority);
  }
  if (department && department !== 'all') {
    results = results.filter((c) => c.department === department);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (c) =>
        c.referenceCode.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
    );
  }

  // Sort newest first
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    total: results.length,
    complaints: results,
  });
});

// 4. Single Complaint Detail
app.get('/api/complaints/:id', (req, res) => {
  const { id } = req.params;
  const { citizenId, role } = req.query;

  const complaint = complaintsStore.find((c) => c.id === id || c.referenceCode.toUpperCase() === id.toUpperCase());
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found.' });
  }

  // If citizen, verify ownership
  if (role === 'citizen' && citizenId && complaint.citizenId !== String(citizenId)) {
    return res.status(403).json({ error: 'Access forbidden: you may only view your own complaints.' });
  }

  // If citizen, strip internal admin notes from updates
  if (role === 'citizen') {
    const sanitizedUpdates = complaint.updates.map((u) => ({
      ...u,
      internalNote: undefined,
    }));
    return res.json({ ...complaint, updates: sanitizedUpdates });
  }

  res.json(complaint);
});

// 5. Public Tracking Endpoint (Secure Minimal View by Reference Code)
app.get('/api/complaints/track/:refCode', (req, res) => {
  const refCode = req.params.refCode.trim().toUpperCase();
  const complaint = complaintsStore.find((c) => c.referenceCode.toUpperCase() === refCode);

  if (!complaint) {
    return res.status(404).json({
      found: false,
      error: 'No complaint found matching this reference code. Please verify the code and try again.',
    });
  }

  // Return strictly sanitized public view - NEVER expose citizen name, phone, or internal notes
  res.json({
    found: true,
    referenceCode: complaint.referenceCode,
    title: complaint.title,
    category: complaint.category,
    status: complaint.status,
    department: complaint.department || 'Under Assessment',
    priority: complaint.priority,
    addressArea: complaint.address,
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt,
    resolvedAt: complaint.resolvedAt,
    publicResolutionNote: complaint.publicResolutionNote,
    timeline: complaint.updates.map((u) => ({
      id: u.id,
      status: u.newStatus,
      note: u.publicNote || 'Status updated by municipal system',
      actorRole: u.actorRole,
      createdAt: u.createdAt,
    })),
  });
});

// 6. Create Complaint Endpoint
app.post('/api/complaints', async (req, res) => {
  try {
    const {
      citizenId,
      citizenName,
      citizenPhone,
      title,
      description,
      category,
      address,
      latitude,
      longitude,
      photoUrl,
    } = req.body;

    if (!title || !description || !address) {
      return res.status(400).json({ error: 'Title, description, and location are required.' });
    }

    const refCode = generateReferenceCode();
    const newId = `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // Run AI triage
    let aiResult;
    try {
      if (ai) {
        const promptText = `
Classify this municipal civic complaint:
Title: ${title}
Description: ${description}
Location: ${address}
Respond with category (pothole|garbage|streetlight|water_leakage|drainage|other), department (Roads|Sanitation|Street Lighting|Water Supply|Drainage|General Municipal Services), priority (low|medium|high|critical), confidence (0-1), explanation, risk_indicators (array of string), needs_human_review (bool).
`;
        const aiResponse = await ai.models.generateContent({
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
        if (aiResponse.text) {
          aiResult = JSON.parse(aiResponse.text.trim());
        }
      }
    } catch (e) {
      console.warn('AI Triage error during complaint creation, falling back:', e);
    }

    if (!aiResult) {
      aiResult = runRuleBasedHeuristicTriage(title, description);
    }

    const assignedCategory = category || aiResult.category || 'other';
    const assignedPriority = (aiResult.priority as ComplaintPriority) || 'medium';
    const assignedDepartment = aiResult.department || 'General Municipal Services';

    const now = new Date().toISOString();

    const newComplaint: Complaint = {
      id: newId,
      referenceCode: refCode,
      citizenId: citizenId || 'citizen-demo-1',
      citizenName: citizenName || 'Verified Citizen',
      citizenPhone: citizenPhone || undefined,
      title: title.trim(),
      description: description.trim(),
      category: assignedCategory,
      aiCategory: aiResult.category,
      aiConfidence: aiResult.confidence,
      aiExplanation: aiResult.explanation,
      priority: assignedPriority,
      aiPriority: assignedPriority,
      priorityReason: aiResult.explanation,
      department: assignedDepartment,
      address: address.trim(),
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      photoUrl: photoUrl || undefined,
      status: 'submitted',
      needsHumanReview: Boolean(aiResult.needs_human_review),
      createdAt: now,
      updatedAt: now,
      updates: [
        {
          id: `u-${Date.now()}-init`,
          complaintId: newId,
          actorName: 'CivicPulse Triage Engine',
          actorRole: 'system',
          newStatus: 'submitted',
          publicNote: `Complaint registered under reference ${refCode}. Automatically routed to ${assignedDepartment}.`,
          createdAt: now,
        },
      ],
    };

    complaintsStore.unshift(newComplaint);

    res.status(201).json({
      success: true,
      complaint: newComplaint,
      referenceCode: refCode,
      message: 'Complaint lodged successfully.',
    });
  } catch (err: any) {
    console.error('Error creating complaint:', err);
    res.status(500).json({ error: 'Failed to lodge complaint. Please try again.' });
  }
});

// 7. Admin Complaint Update / Review / Status Transition
app.patch('/api/complaints/:id', (req, res) => {
  const { id } = req.params;
  const {
    status,
    priority,
    department,
    publicNote,
    internalNote,
    rejectionReason,
    actorName = 'Municipal Officer',
    actorRole = 'admin',
  } = req.body;

  const complaint = complaintsStore.find((c) => c.id === id);
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found.' });
  }

  // Rejection requires explicit reason
  if (status === 'rejected' && !rejectionReason && !publicNote) {
    return res.status(400).json({ error: 'Rejection requires a formal reason.' });
  }

  const oldStatus = complaint.status;
  const now = new Date().toISOString();

  if (status) complaint.status = status;
  if (priority) complaint.priority = priority;
  if (department) complaint.department = department;
  if (rejectionReason) complaint.rejectionReason = rejectionReason;
  if (status === 'resolved') {
    complaint.resolvedAt = now;
    if (publicNote) complaint.publicResolutionNote = publicNote;
  }
  complaint.updatedAt = now;

  // Add audit update entry
  const updateLog: ComplaintUpdate = {
    id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    complaintId: complaint.id,
    actorName,
    actorRole: 'admin',
    oldStatus,
    newStatus: complaint.status,
    publicNote: publicNote || (status === 'rejected' ? `Rejected: ${rejectionReason}` : `Status updated to ${complaint.status}`),
    internalNote: internalNote || undefined,
    createdAt: now,
  };

  complaint.updates.push(updateLog);

  res.json({
    success: true,
    complaint,
    message: 'Complaint updated successfully.',
  });
});

// 8. Real-time KPI Statistics Endpoint
app.get('/api/stats', (req, res) => {
  const totalComplaints = complaintsStore.length;
  const submitted = complaintsStore.filter((c) => c.status === 'submitted').length;
  const underReview = complaintsStore.filter((c) => c.status === 'under_review').length;
  const inProgress = complaintsStore.filter((c) => c.status === 'in_progress' || c.status === 'assigned').length;
  const resolved = complaintsStore.filter((c) => c.status === 'resolved').length;
  const rejected = complaintsStore.filter((c) => c.status === 'rejected').length;
  const highPriority = complaintsStore.filter((c) => c.priority === 'high' || c.priority === 'critical').length;

  // Calculate average resolution time for resolved items
  let totalResolvedDays = 0;
  let resolvedCount = 0;
  for (const c of complaintsStore) {
    if (c.status === 'resolved' && c.resolvedAt) {
      const diffMs = new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime();
      totalResolvedDays += diffMs / (1000 * 3600 * 24);
      resolvedCount++;
    }
  }
  const avgResolutionDays = resolvedCount > 0 ? Number((totalResolvedDays / resolvedCount).toFixed(1)) : 2.4;

  // Category distribution
  const byCategory: Record<string, number> = {};
  for (const c of complaintsStore) {
    byCategory[c.category] = (byCategory[c.category] || 0) + 1;
  }

  // Department distribution
  const byDepartment: Record<string, number> = {};
  for (const c of complaintsStore) {
    const dept = c.department || 'Unassigned';
    byDepartment[dept] = (byDepartment[dept] || 0) + 1;
  }

  res.json({
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
});

// 9. Mobile OTP Verification Endpoints (With Explicit Aadhaar Boundary)
app.post('/api/auth/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone || typeof phone !== 'string') {
    return res.status(400).json({ error: 'Valid mobile number is required.' });
  }

  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  if (cleanPhone.length < 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
  }

  const existing = otpStore.get(cleanPhone);
  const now = Date.now();

  // Cooldown check (60 seconds)
  if (existing && now - existing.lastSentAt < 60000) {
    const remaining = Math.ceil((60000 - (now - existing.lastSentAt)) / 1000);
    return res.status(429).json({
      error: `Please wait ${remaining} seconds before requesting a new OTP.`,
      cooldownRemaining: remaining,
    });
  }

  // Generate 6-digit numeric OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(cleanPhone, {
    phone: cleanPhone,
    code,
    expiresAt: now + 5 * 60 * 1000, // 5 minutes validity
    attempts: 0,
    lastSentAt: now,
  });

  const smsConfigured = Boolean(process.env.SMS_PROVIDER_API_KEY);

  // Note: We explicitly clarify ordinary mobile OTP vs Aadhaar in the response
  res.json({
    success: true,
    phone: cleanPhone,
    expiresInSeconds: 300,
    cooldownSeconds: 60,
    smsGatewayConfigured: smsConfigured,
    // Demo helper code for hackathon testing when SMS provider is not active
    demoHelperCode: smsConfigured ? undefined : code,
    disclaimer: 'Mobile OTP verifies phone ownership only. This is NOT Aadhaar verification.',
    message: smsConfigured
      ? 'Verification OTP sent to your registered mobile number.'
      : 'Demo OTP generated. (Configure SMS_PROVIDER_API_KEY in server secrets for live carrier SMS delivery).',
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ error: 'Mobile number and OTP code are required.' });
  }

  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const record = otpStore.get(cleanPhone);

  if (!record) {
    return res.status(400).json({ error: 'No OTP was requested for this phone number or it has expired.' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanPhone);
    return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
  }

  record.attempts += 1;
  if (record.attempts > 4) {
    otpStore.delete(cleanPhone);
    return res.status(429).json({ error: 'Too many incorrect attempts. Please request a new OTP.' });
  }

  if (record.code !== String(code).trim()) {
    return res.status(400).json({
      error: `Incorrect OTP code. ${4 - record.attempts} attempts remaining.`,
    });
  }

  // Verified successfully
  otpStore.delete(cleanPhone);

  res.json({
    success: true,
    phoneVerified: true,
    verifiedPhone: cleanPhone,
    message: 'Mobile number verified successfully.',
    aadhaarBoundaryNotice: 'Control of mobile number confirmed. Note: Aadhaar verification remains a separate statutory arrangement.',
  });
});

// ==========================================
// STATIC ASSETS & VITE MIDDLEWARE
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
    console.log(`CivicPulse AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
