-- Migration: Create Users Table
-- Purpose: Extend auth.users with tenant association and role

-- Create users table (extends auth.users)
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

-- Create index on tenant_id for RLS performance
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON public.users(tenant_id);

-- Create index on role for filtering
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view other users in their tenant
CREATE POLICY "tenant_isolation_select"
  ON public.users FOR SELECT
  USING (tenant_id::TEXT = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'));

-- Policy: Users can update their own profile
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (id = auth.uid());

-- Policy: Allow inserts during user registration
CREATE POLICY "users_insert"
  ON public.users FOR INSERT
  WITH CHECK (id = auth.uid());
