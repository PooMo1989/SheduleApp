-- ============================================================
-- Migration 016: RBAC Schema Refactor
-- Purpose: Simplify role management and provider structure
-- ============================================================

-- ============================
-- 1. USERS TABLE: role → roles
-- ============================

-- Add roles array column
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT ARRAY['client']::TEXT[];

-- Migrate existing data
UPDATE public.users SET roles = ARRAY[role]::TEXT[] WHERE roles = ARRAY['client']::TEXT[];

-- Drop old role column (after data migration)
ALTER TABLE public.users DROP COLUMN IF EXISTS role;

-- Add check constraint for valid roles
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_valid_roles;
ALTER TABLE public.users ADD CONSTRAINT users_valid_roles 
CHECK (roles <@ ARRAY['admin', 'provider', 'client']::TEXT[]);

-- ============================
-- 2. RENAME providers → provider_profiles
-- ============================

-- First, drop the old RLS policies
DROP POLICY IF EXISTS "providers_tenant_isolation_select" ON public.providers;
DROP POLICY IF EXISTS "providers_tenant_isolation_insert" ON public.providers;
DROP POLICY IF EXISTS "providers_tenant_isolation_update" ON public.providers;
DROP POLICY IF EXISTS "providers_tenant_isolation_delete" ON public.providers;

-- Rename table
ALTER TABLE IF EXISTS public.providers RENAME TO provider_profiles;

-- The existing user_id column becomes the primary key
-- First drop the old primary key
ALTER TABLE public.provider_profiles DROP CONSTRAINT IF EXISTS providers_pkey;

-- Drop the old id column 
ALTER TABLE public.provider_profiles DROP COLUMN IF EXISTS id;

-- Make user_id the primary key
ALTER TABLE public.provider_profiles ADD PRIMARY KEY (user_id);

-- Ensure user_id is NOT NULL and references users
ALTER TABLE public.provider_profiles 
ALTER COLUMN user_id SET NOT NULL;

-- Add is_active column if not exists
ALTER TABLE public.provider_profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create new RLS policies for provider_profiles
CREATE POLICY "provider_profiles_select"
ON public.provider_profiles FOR SELECT
USING (
  tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);

CREATE POLICY "provider_profiles_insert"
ON public.provider_profiles FOR INSERT
WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'admin' = ANY(roles))
);

CREATE POLICY "provider_profiles_update"
ON public.provider_profiles FOR UPDATE
USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'admin' = ANY(roles))
);

CREATE POLICY "provider_profiles_delete"
ON public.provider_profiles FOR DELETE
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'admin' = ANY(roles))
);

-- ============================
-- 3. RENAME service_providers → service_assignments
-- ============================

-- Drop old RLS policies
DROP POLICY IF EXISTS "service_providers_select" ON public.service_providers;
DROP POLICY IF EXISTS "service_providers_insert" ON public.service_providers;
DROP POLICY IF EXISTS "service_providers_update" ON public.service_providers;
DROP POLICY IF EXISTS "service_providers_delete" ON public.service_providers;

-- Rename table
ALTER TABLE IF EXISTS public.service_providers RENAME TO service_assignments;

-- Rename provider_id to user_id
ALTER TABLE public.service_assignments RENAME COLUMN provider_id TO user_id;

-- Update foreign key to reference users instead of providers
ALTER TABLE public.service_assignments 
DROP CONSTRAINT IF EXISTS service_providers_provider_id_fkey;

ALTER TABLE public.service_assignments
ADD CONSTRAINT service_assignments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Update unique constraint
ALTER TABLE public.service_assignments 
DROP CONSTRAINT IF EXISTS service_providers_unique;

ALTER TABLE public.service_assignments 
ADD CONSTRAINT service_assignments_unique UNIQUE (service_id, user_id);

-- Create new RLS policies for service_assignments
CREATE POLICY "service_assignments_select"
ON public.service_assignments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.services s
    WHERE s.id = service_id 
    AND s.tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  )
);

CREATE POLICY "service_assignments_insert"
ON public.service_assignments FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'admin' = ANY(roles))
);

CREATE POLICY "service_assignments_update"
ON public.service_assignments FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'admin' = ANY(roles))
);

CREATE POLICY "service_assignments_delete"
ON public.service_assignments FOR DELETE
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'admin' = ANY(roles))
);

-- ============================
-- 4. UPDATE AUTH TRIGGER
-- ============================

-- Update the signup trigger to use roles array
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_tenant_id UUID;
  user_email TEXT;
  user_name TEXT;
  tenant_slug TEXT;
BEGIN
  user_email := NEW.email;
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '');
  
  tenant_slug := LOWER(REPLACE(REPLACE(user_email, '@', '-'), '.', '-'));
  tenant_slug := REGEXP_REPLACE(tenant_slug, '[^a-z0-9-]', '', 'g');
  tenant_slug := LEFT(tenant_slug, 50);
  
  IF EXISTS (SELECT 1 FROM public.tenants WHERE slug = tenant_slug) THEN
    tenant_slug := tenant_slug || '-' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;
  END IF;
  
  INSERT INTO public.tenants (name, slug, settings)
  VALUES (COALESCE(NULLIF(user_name, '') || '''s Company', 'My Company'), tenant_slug, '{}'::jsonb)
  RETURNING id INTO new_tenant_id;
  
  -- Use roles array instead of single role
  INSERT INTO public.users (id, tenant_id, roles, full_name, phone)
  VALUES (NEW.id, new_tenant_id, ARRAY['admin']::TEXT[], NULLIF(user_name, ''), NEW.phone);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================
-- 5. UPDATE USERS RLS POLICIES
-- ============================

-- Drop old policies that reference 'role'
DROP POLICY IF EXISTS "users_insert" ON public.users;
DROP POLICY IF EXISTS "tenant_isolation_select" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_select_own" ON public.users;

-- Recreate policies for roles array
CREATE POLICY "users_select_own"
ON public.users FOR SELECT
USING (id = auth.uid());

CREATE POLICY "users_select_tenant"
ON public.users FOR SELECT
USING (
  tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);

CREATE POLICY "users_insert"
ON public.users FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_own"
ON public.users FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "users_update_admin"
ON public.users FOR UPDATE
USING (
  tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'admin' = ANY(roles))
);

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
