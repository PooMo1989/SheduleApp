-- ============================================================
-- Migration 023: Service Extended Fields (Story 2.1.1)
-- Purpose: Add pricing types, location, booking policies, pay later to services
-- ============================================================

-- ============================
-- 1. PRICING & LOCATION
-- ============================

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS pricing_type TEXT DEFAULT 'fixed',
  ADD COLUMN IF NOT EXISTS location_type TEXT DEFAULT 'in_person',
  ADD COLUMN IF NOT EXISTS virtual_meeting_url TEXT;

ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_pricing_type_check;
ALTER TABLE public.services ADD CONSTRAINT services_pricing_type_check
  CHECK (pricing_type IN ('free', 'fixed', 'variable', 'starting_from'));

ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_location_type_check;
ALTER TABLE public.services ADD CONSTRAINT services_location_type_check
  CHECK (location_type IN ('in_person', 'virtual', 'both'));

-- ============================
-- 2. BOOKING POLICIES
-- ============================

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS min_notice_hours INTEGER DEFAULT 24,
  ADD COLUMN IF NOT EXISTS max_future_days INTEGER DEFAULT 60,
  ADD COLUMN IF NOT EXISTS cancellation_hours INTEGER DEFAULT 24,
  ADD COLUMN IF NOT EXISTS auto_confirm BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';

ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_visibility_check;
ALTER TABLE public.services ADD CONSTRAINT services_visibility_check
  CHECK (visibility IN ('public', 'private'));

-- ============================
-- 3. PAY LATER (PER-SERVICE)
-- ============================

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS pay_later_enabled BOOLEAN,
  ADD COLUMN IF NOT EXISTS pay_later_mode TEXT;

ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_pay_later_mode_check;
ALTER TABLE public.services ADD CONSTRAINT services_pay_later_mode_check
  CHECK (pay_later_mode IS NULL OR pay_later_mode IN ('auto_confirm', 'pending_approval'));

-- ============================
-- 4. BOOKING PAGE CONFIGURATION
-- ============================

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS custom_url_slug TEXT,
  ADD COLUMN IF NOT EXISTS show_price BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_duration BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS require_account BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS confirmation_message TEXT,
  ADD COLUMN IF NOT EXISTS redirect_url TEXT;

-- Custom URL slug must be unique within a tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_services_custom_slug
  ON public.services(tenant_id, custom_url_slug)
  WHERE custom_url_slug IS NOT NULL;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
