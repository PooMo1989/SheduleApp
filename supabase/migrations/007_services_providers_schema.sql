-- ============================================================
-- Migration 007: Services & Providers Schema (Story 2.1)
-- Creates tables for services, providers, and their relationships
-- ============================================================

-- ============================
-- 1. CATEGORIES TABLE
-- ============================

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure slug is unique within a tenant
  CONSTRAINT categories_tenant_slug_unique UNIQUE (tenant_id, slug)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_categories_tenant_id ON public.categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(tenant_id, display_order);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenant isolation
CREATE POLICY "categories_tenant_isolation_select"
  ON public.categories FOR SELECT
  USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "categories_tenant_isolation_insert"
  ON public.categories FOR INSERT
  WITH CHECK (tenant_id = public.get_current_tenant_id() AND public.is_admin());

CREATE POLICY "categories_tenant_isolation_update"
  ON public.categories FOR UPDATE
  USING (tenant_id = public.get_current_tenant_id() AND public.is_admin());

CREATE POLICY "categories_tenant_isolation_delete"
  ON public.categories FOR DELETE
  USING (tenant_id = public.get_current_tenant_id() AND public.is_admin());

-- Updated at trigger
DROP TRIGGER IF EXISTS handle_categories_updated_at ON public.categories;
CREATE TRIGGER handle_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ============================
-- 2. SERVICES TABLE
-- ============================

-- Create enum for service type
DO $$ BEGIN
  CREATE TYPE service_type AS ENUM ('consultation', 'class');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  currency TEXT DEFAULT 'LKR',
  service_type service_type NOT NULL DEFAULT 'consultation',
  -- For group classes
  max_capacity INTEGER DEFAULT 1 CHECK (max_capacity > 0),
  -- Metadata
  color TEXT, -- For calendar display
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  -- Buffer time between appointments
  buffer_before_minutes INTEGER DEFAULT 0,
  buffer_after_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_services_tenant_id ON public.services(tenant_id);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_service_type ON public.services(tenant_id, service_type);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON public.services(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_services_display_order ON public.services(tenant_id, display_order);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenant isolation
-- Allow public read for booking widget (clients can view services)
CREATE POLICY "services_tenant_isolation_select"
  ON public.services FOR SELECT
  USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "services_tenant_isolation_insert"
  ON public.services FOR INSERT
  WITH CHECK (tenant_id = public.get_current_tenant_id() AND public.is_admin());

CREATE POLICY "services_tenant_isolation_update"
  ON public.services FOR UPDATE
  USING (tenant_id = public.get_current_tenant_id() AND public.is_admin());

CREATE POLICY "services_tenant_isolation_delete"
  ON public.services FOR DELETE
  USING (tenant_id = public.get_current_tenant_id() AND public.is_admin());

-- Updated at trigger
DROP TRIGGER IF EXISTS handle_services_updated_at ON public.services;
CREATE TRIGGER handle_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ============================
-- 3. PROVIDERS TABLE
-- ============================

CREATE TABLE IF NOT EXISTS public.providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  -- Link to user if the provider has a user account
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  -- Provider profile
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  bio TEXT,
  photo_url TEXT,
  -- Provider metadata
  title TEXT, -- e.g., "Senior Therapist", "Yoga Instructor"
  color TEXT, -- For calendar display
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_providers_tenant_id ON public.providers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON public.providers(user_id);
CREATE INDEX IF NOT EXISTS idx_providers_is_active ON public.providers(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_providers_email ON public.providers(tenant_id, email);

-- Enable RLS
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenant isolation
-- Allow clients to view providers (needed for booking widget)
CREATE POLICY "providers_tenant_isolation_select"
  ON public.providers FOR SELECT
  USING (tenant_id = public.get_current_tenant_id());

-- Only admins can create/update/delete providers
CREATE POLICY "providers_tenant_isolation_insert"
  ON public.providers FOR INSERT
  WITH CHECK (tenant_id = public.get_current_tenant_id() AND public.is_admin());

CREATE POLICY "providers_tenant_isolation_update"
  ON public.providers FOR UPDATE
  USING (tenant_id = public.get_current_tenant_id() AND public.is_admin());

CREATE POLICY "providers_tenant_isolation_delete"
  ON public.providers FOR DELETE
  USING (tenant_id = public.get_current_tenant_id() AND public.is_admin());

-- Updated at trigger
DROP TRIGGER IF EXISTS handle_providers_updated_at ON public.providers;
CREATE TRIGGER handle_providers_updated_at
  BEFORE UPDATE ON public.providers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ============================
-- 4. SERVICE_PROVIDERS JUNCTION TABLE
-- ============================

CREATE TABLE IF NOT EXISTS public.service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  -- Provider-specific settings for this service (optional overrides)
  custom_price DECIMAL(10, 2), -- NULL = use service default
  custom_duration_minutes INTEGER, -- NULL = use service default
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure a provider is only linked once per service
  CONSTRAINT service_providers_unique UNIQUE (service_id, provider_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_service_providers_service_id ON public.service_providers(service_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_provider_id ON public.service_providers(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_is_active ON public.service_providers(is_active);

-- Enable RLS
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Use a subquery to check tenant through the linked service or provider
CREATE POLICY "service_providers_select"
  ON public.service_providers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id AND s.tenant_id = public.get_current_tenant_id()
    )
  );

CREATE POLICY "service_providers_insert"
  ON public.service_providers FOR INSERT
  WITH CHECK (
    public.is_admin() AND EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id AND s.tenant_id = public.get_current_tenant_id()
    )
  );

CREATE POLICY "service_providers_update"
  ON public.service_providers FOR UPDATE
  USING (
    public.is_admin() AND EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id AND s.tenant_id = public.get_current_tenant_id()
    )
  );

CREATE POLICY "service_providers_delete"
  ON public.service_providers FOR DELETE
  USING (
    public.is_admin() AND EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id AND s.tenant_id = public.get_current_tenant_id()
    )
  );

-- Updated at trigger
DROP TRIGGER IF EXISTS handle_service_providers_updated_at ON public.service_providers;
CREATE TRIGGER handle_service_providers_updated_at
  BEFORE UPDATE ON public.service_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- MIGRATION COMPLETE
-- Tables created: categories, services, providers, service_providers
-- All tables have RLS enabled with tenant isolation policies
-- ============================================================
