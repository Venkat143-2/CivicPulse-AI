-- CivicPulse AI - Complete Production Database Schema & Security Policies
-- Compatible with PostgreSQL 14+ / Supabase
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. User Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'Citizen User',
  phone TEXT,
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

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

CREATE INDEX IF NOT EXISTS idx_complaints_citizen_id ON public.complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON public.complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_department ON public.complaints(department);
CREATE INDEX IF NOT EXISTS idx_complaints_ref_code ON public.complaints(reference_code);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at DESC);

-- 5. Public Complaint Status Updates (Audit Trail visible to Citizen & Admin)
CREATE TABLE IF NOT EXISTS public.complaint_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL DEFAULT 'Municipal System',
  actor_role TEXT NOT NULL DEFAULT 'system',
  old_status TEXT,
  new_status TEXT NOT NULL,
  public_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaint_updates_complaint ON public.complaint_updates(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_updates_created_at ON public.complaint_updates(created_at ASC);

-- 6. Dedicated Admin-Only Internal Notes Table (Strictly partitioned from citizens)
CREATE TABLE IF NOT EXISTS public.complaint_internal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT 'Municipal Officer',
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_internal_notes_complaint ON public.complaint_internal_notes(complaint_id);

-- 7. Complaint Department Assignments History
CREATE TABLE IF NOT EXISTS public.complaint_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  department_name TEXT NOT NULL REFERENCES public.departments(name) ON UPDATE CASCADE,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assignments_complaint ON public.complaint_assignments(complaint_id);

-- 8. Helper Function to Check Admin Role Securely (Prevents Search-Path hijacking)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

-- 9. Trigger to Sync auth.users with public.profiles on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'Citizen User'),
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone'),
    CASE
      -- Admin role cannot be granted via public user metadata
      WHEN NEW.raw_app_meta_data->>'role' = 'admin' THEN 'admin'
      ELSE 'citizen'
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Trigger to Prevent Non-Admins From Escalating Role or Phone Verified Flag
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    NEW.role := OLD.role;
    NEW.phone_verified := OLD.phone_verified;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_protect_profile_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

-- 11. Trigger to Enforce Citizen Complaint Integrity (Blocks client forgery of AI/Status)
CREATE OR REPLACE FUNCTION public.protect_complaint_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    IF TG_OP = 'INSERT' THEN
      NEW.status := 'submitted';
      -- Citizens cannot self-assign AI assessment or override status
      NEW.ai_category := NULL;
      NEW.ai_confidence := NULL;
      NEW.ai_explanation := NULL;
      NEW.ai_priority := NULL;
      NEW.priority_reason := NULL;
      NEW.needs_human_review := FALSE;
      NEW.public_resolution_note := NULL;
      NEW.rejection_reason := NULL;
      NEW.resolved_at := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
      -- Citizens cannot modify status, triage, priority or assignments
      NEW.status := OLD.status;
      NEW.ai_category := OLD.ai_category;
      NEW.ai_confidence := OLD.ai_confidence;
      NEW.ai_explanation := OLD.ai_explanation;
      NEW.ai_priority := OLD.ai_priority;
      NEW.priority_reason := OLD.priority_reason;
      NEW.priority := OLD.priority;
      NEW.department := OLD.department;
      NEW.needs_human_review := OLD.needs_human_review;
      NEW.public_resolution_note := OLD.public_resolution_note;
      NEW.rejection_reason := OLD.rejection_reason;
      NEW.resolved_at := OLD.resolved_at;
      NEW.reference_code := OLD.reference_code;
      NEW.citizen_id := OLD.citizen_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_protect_complaint_fields ON public.complaints;
CREATE TRIGGER trg_protect_complaint_fields
  BEFORE INSERT OR UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.protect_complaint_fields();

-- 12. Updated_at Triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_complaints_updated_at ON public.complaints;
CREATE TRIGGER set_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 13. Row Level Security (RLS) Configuration
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_assignments ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can read their own profile or admins can read all" ON public.profiles;
CREATE POLICY "Users can read their own profile or admins can read all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

-- Departments Policies
DROP POLICY IF EXISTS "Anyone can view active departments" ON public.departments;
CREATE POLICY "Anyone can view active departments"
  ON public.departments FOR SELECT
  USING (is_active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "Only admins can manage departments" ON public.departments;
CREATE POLICY "Only admins can manage departments"
  ON public.departments FOR ALL
  USING (public.is_admin());

-- Complaints Policies
DROP POLICY IF EXISTS "Citizens can view only their own complaints or admins can view all" ON public.complaints;
CREATE POLICY "Citizens can view only their own complaints or admins can view all"
  ON public.complaints FOR SELECT
  USING (citizen_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Citizens can insert complaints" ON public.complaints;
CREATE POLICY "Citizens can insert complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (
    citizen_id = auth.uid()
    AND status = 'submitted'
  );

DROP POLICY IF EXISTS "Only admins can update complaints" ON public.complaints;
CREATE POLICY "Only admins can update complaints"
  ON public.complaints FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Only admins can delete complaints" ON public.complaints;
CREATE POLICY "Only admins can delete complaints"
  ON public.complaints FOR DELETE
  USING (public.is_admin());

-- Complaint Updates (Public Timeline) Policies
DROP POLICY IF EXISTS "Citizens can view public timeline for their own complaints or admins can view all" ON public.complaint_updates;
CREATE POLICY "Citizens can view public timeline for their own complaints or admins can view all"
  ON public.complaint_updates FOR SELECT
  USING (
    public.is_admin() OR
    (complaint_id IN (SELECT id FROM public.complaints WHERE citizen_id = auth.uid()))
  );

DROP POLICY IF EXISTS "Only admins can insert status updates" ON public.complaint_updates;
CREATE POLICY "Only admins can insert status updates"
  ON public.complaint_updates FOR INSERT
  WITH CHECK (public.is_admin());

-- Internal Notes (Admin-Only, Private) Policies
DROP POLICY IF EXISTS "Only admins can select internal notes" ON public.complaint_internal_notes;
CREATE POLICY "Only admins can select internal notes"
  ON public.complaint_internal_notes FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Only admins can insert internal notes" ON public.complaint_internal_notes;
CREATE POLICY "Only admins can insert internal notes"
  ON public.complaint_internal_notes FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admins can update internal notes" ON public.complaint_internal_notes;
CREATE POLICY "Only admins can update internal notes"
  ON public.complaint_internal_notes FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Only admins can delete internal notes" ON public.complaint_internal_notes;
CREATE POLICY "Only admins can delete internal notes"
  ON public.complaint_internal_notes FOR DELETE
  USING (public.is_admin());

-- Complaint Assignments Policies
DROP POLICY IF EXISTS "Only admins can view assignments" ON public.complaint_assignments;
CREATE POLICY "Only admins can view assignments"
  ON public.complaint_assignments FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Only admins can manage assignments" ON public.complaint_assignments;
CREATE POLICY "Only admins can manage assignments"
  ON public.complaint_assignments FOR ALL
  USING (public.is_admin());

-- 14. Public Safe Tracking Function (Anonymized & Sanitized)
CREATE OR REPLACE FUNCTION public.get_public_complaint_status(p_ref_code TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'found', true,
    'reference_code', c.reference_code,
    'title', c.title,
    'category', c.category,
    'status', c.status,
    'department', COALESCE(c.department, 'Under Assessment'),
    'priority', c.priority,
    'address', c.address,
    'created_at', c.created_at,
    'updated_at', c.updated_at,
    'resolved_at', c.resolved_at,
    'public_resolution_note', c.public_resolution_note,
    'timeline', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', u.id,
        'status', u.new_status,
        'note', COALESCE(u.public_note, 'Status update logged'),
        'actor_role', u.actor_role,
        'created_at', u.created_at
      ) ORDER BY u.created_at ASC), '[]'::jsonb)
      FROM public.complaint_updates u
      WHERE u.complaint_id = c.id
    )
  ) INTO result
  FROM public.complaints c
  WHERE UPPER(c.reference_code) = UPPER(TRIM(p_ref_code));

  IF result IS NULL THEN
    RETURN jsonb_build_object('found', false, 'error', 'No complaint found matching this reference code.');
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.get_public_complaint_status(TEXT) TO anon, authenticated;

-- 15. Private Storage Bucket for Complaint Photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-photos', 'complaint-photos', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Authenticated users can upload complaint photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload complaint photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'complaint-photos');

DROP POLICY IF EXISTS "Users can view their complaint photos or admins can view all" ON storage.objects;
CREATE POLICY "Users can view their complaint photos or admins can view all"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'complaint-photos'
    AND (
      public.is_admin()
      OR owner = auth.uid()
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );
