-- ============================================================
-- sheduleApp Multi-Tenant Database Schema
-- Run this SQL in Supabase Dashboard > SQL Editor
-- ============================================================

-- ============================
-- 1. TENANTS TABLE
-- ============================

CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenant"
  ON public.tenants FOR SELECT
  USING (id::TEXT = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'));

CREATE POLICY "Allow tenant creation"
  ON public.tenants FOR INSERT
  WITH CHECK (true);

-- ============================
-- 2. USERS TABLE
-- ============================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'provider', 'client')),
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON public.users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select"
  ON public.users FOR SELECT
  USING (tenant_id::TEXT = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'));

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "users_insert"
  ON public.users FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================
-- 3. UPDATED_AT TRIGGER
-- ============================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_tenants_updated_at ON public.tenants;
CREATE TRIGGER handle_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_users_updated_at ON public.users;
CREATE TRIGGER handle_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================
-- 4. HELPER FUNCTIONS
-- ============================

CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::UUID;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT auth.jwt() -> 'app_metadata' ->> 'role';
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT public.get_current_user_role() = 'admin';
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION public.is_provider_or_admin()
RETURNS BOOLEAN AS $$
  SELECT public.get_current_user_role() IN ('admin', 'provider');
$$ LANGUAGE SQL STABLE;

-- ============================
-- 5. SEED DEFAULT TENANT
-- ============================

INSERT INTO public.tenants (id, name, slug, settings)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Default Tenant',
  'default',
  '{"theme": "light", "timezone": "Asia/Kolkata"}'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- DONE! Tables and RLS policies are now set up.
-- ============================================================
