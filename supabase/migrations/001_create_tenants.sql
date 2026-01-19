-- Migration: Create Tenants Table
-- Purpose: Foundation for multi-tenancy - each business/organization is a tenant

-- Create tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view their own tenant
CREATE POLICY "Users can view own tenant"
  ON public.tenants FOR SELECT
  USING (id::TEXT = (auth.jwt() -> 'app_metadata' ->> 'tenant_id'));

-- Allow inserts during tenant creation (temporarily - will be restricted via admin API)
CREATE POLICY "Allow tenant creation"
  ON public.tenants FOR INSERT
  WITH CHECK (true);
