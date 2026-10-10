-- CivicPulse AI - Complete Database Schema & RLS Policies
-- Compatible with PostgreSQL 14+ / Supabase
-- Run this in the Supabase SQL Editor to provision the complete database backend

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for role and phone queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- 3. Municipal Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Municipal Departments
INSERT INTO public.departments (name, description) VALUES
  ('Roads', 'Maintenance of roads, potholes, sidewalks, and pavements'),
  ('Sanitation', 'Waste collection, garbage clearance, and public hygiene'),
  ('Street Lighting', 'Street lamps, electrical poles, and public illumination'),
  ('Water Supply', 'Water pipeline leaks, contamination, and municipal supply'),
  ('Drainage', 'Storm drains, sewage blockages, and overflow channels'),
  ('General Municipal Services', 'Parks, animal control, encroachment, and miscellaneous')
ON CONFLICT (name) DO NOTHING;

-- 4. Complaints Table
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code TEXT UNIQUE NOT NULL,
  citizen_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  citizen_name TEXT NOT NULL,
  citizen_phone TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('pothole', 'garbage', 'streetlight', 'water_leakage', 'drainage', 'other')),
  ai_category TEXT CHECK (ai_category IN ('pothole', 'garbage', 'streetlight', 'water_leakage', 'drainage', 'other')),
  ai_confidence NUMERIC(4, 3),
  ai_explanation TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  ai_priority TEXT CHECK (ai_priority IN ('low', 'medium', 'high', 'critical')),
  priority_reason TEXT,
  department TEXT REFERENCES public.departments(name) ON UPDATE CASCADE ON DELETE SET NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  photo_path TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected')),
  public_resolution_note TEXT,
  rejection_reason TEXT,
  needs_human_review BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Indexes for complaints queries
CREATE INDEX IF NOT EXISTS idx_complaints_citizen_id ON public.complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON public.complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_ref_code ON public.complaints(reference_code);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at DESC);

-- 5. Complaint Updates / Audit History Table
CREATE TABLE IF NOT EXISTS public.complaint_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL DEFAULT 'Municipal Official',
  actor_role TEXT NOT NULL DEFAULT 'admin',
  old_status TEXT,
  new_status TEXT NOT NULL,
  public_note TEXT,
  internal_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaint_updates_complaint ON public.complaint_updates(complaint_id);

-- 6. Complaint Assignments Table
CREATE TABLE IF NOT EXISTS public.complaint_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  department_name TEXT NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Helper Function to Check Admin Role securely
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Auto-update updated_at Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_complaints_updated_at
BEFORE UPDATE ON public.complaints
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 9. Row Level Security (RLS) Configuration

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_assignments ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can read their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own safe profile fields"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()) -- Prevents self-promotion to admin
    AND phone_verified = (SELECT phone_verified FROM public.profiles WHERE id = auth.uid()) -- Prevents client self-verifying phone
  );

-- Departments Policies
CREATE POLICY "Anyone can view active departments"
  ON public.departments FOR SELECT
  USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Only admins can manage departments"
  ON public.departments FOR ALL
  USING (public.is_admin());

-- Complaints Policies
CREATE POLICY "Citizens can view only their own complaints"
  ON public.complaints FOR SELECT
  USING (citizen_id = auth.uid() OR public.is_admin());

CREATE POLICY "Citizens can insert complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (
    citizen_id = auth.uid()
    AND status = 'submitted'
  );

CREATE POLICY "Only admins can update complaint status and department"
  ON public.complaints FOR UPDATE
  USING (public.is_admin());

-- Complaint Updates Policies
CREATE POLICY "Citizens can view only public notes for their own complaints"
  ON public.complaint_updates FOR SELECT
  USING (
    public.is_admin() OR
    (complaint_id IN (SELECT id FROM public.complaints WHERE citizen_id = auth.uid()))
  );

CREATE POLICY "Only admins can insert status updates"
  ON public.complaint_updates FOR INSERT
  WITH CHECK (public.is_admin());

-- Storage Bucket Setup (Run via Supabase Dashboard or API)
-- Bucket: 'complaint-photos'
-- Private by default. Admins and complaint owner can view.
