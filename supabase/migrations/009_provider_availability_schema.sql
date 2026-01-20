-- ============================================================
-- Migration 009: Provider Availability Schema (Story 2.2)
-- Creates tables for provider schedules, overrides, and calendar sync
-- ============================================================

-- ============================
-- 1. PROVIDER SCHEDULES TABLE
-- Recurring weekly availability
-- ============================

CREATE TABLE IF NOT EXISTS public.provider_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  -- Day of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  -- Time slots (24-hour format, stored as TIME)
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  -- Whether this slot is available for booking
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure valid time range
  CONSTRAINT valid_time_range CHECK (start_time < end_time),
  -- Allow multiple slots per day (e.g., 9-12 and 14-17)
  CONSTRAINT unique_schedule_slot UNIQUE (provider_id, day_of_week, start_time, end_time)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_provider_schedules_provider_id 
  ON public.provider_schedules(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_schedules_day 
  ON public.provider_schedules(provider_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_provider_schedules_available 
  ON public.provider_schedules(provider_id, is_available) WHERE is_available = true;

-- Enable RLS
ALTER TABLE public.provider_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies - access through provider's tenant
CREATE POLICY "provider_schedules_select"
  ON public.provider_schedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = provider_id AND p.tenant_id = public.get_current_tenant_id()
    )
  );

CREATE POLICY "provider_schedules_insert"
  ON public.provider_schedules FOR INSERT
  WITH CHECK (
    public.is_admin() AND EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = provider_id AND p.tenant_id = public.get_current_tenant_id()
    )
  );

CREATE POLICY "provider_schedules_update"
  ON public.provider_schedules FOR UPDATE
  USING (
    public.is_admin() AND EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = provider_id AND p.tenant_id = public.get_current_tenant_id()
    )
  );

CREATE POLICY "provider_schedules_delete"
  ON public.provider_schedules FOR DELETE
  USING (
    public.is_admin() AND EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = provider_id AND p.tenant_id = public.get_current_tenant_id()
    )
  );

-- Updated at trigger
DROP TRIGGER IF EXISTS handle_provider_schedules_updated_at ON public.provider_schedules;
CREATE TRIGGER handle_provider_schedules_updated_at
  BEFORE UPDATE ON public.provider_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ============================
-- 2. SCHEDULE OVERRIDES TABLE
-- Date-specific exceptions (holidays, special hours, time off)
-- ============================

CREATE TABLE IF NOT EXISTS public.schedule_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  -- The specific date this override applies to
  override_date DATE NOT NULL,
  -- Time slots (NULL = entire day)
  start_time TIME,
  end_time TIME,
  -- Whether available during this override (false = blocked/unavailable)
  is_available BOOLEAN NOT NULL DEFAULT false,
  -- Reason for the override (for admin reference)
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure valid time range if both provided
  CONSTRAINT valid_override_time_range CHECK (
    (start_time IS NULL AND end_time IS NULL) OR 
    (start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time)
  )
);

-- Indexes for efficient date-based queries
CREATE INDEX IF NOT EXISTS idx_schedule_overrides_provider_id 
  ON public.schedule_overrides(provider_id);
CREATE INDEX IF NOT EXISTS idx_schedule_overrides_date 
  ON public.schedule_overrides(provider_id, override_date);
CREATE INDEX IF NOT EXISTS idx_schedule_overrides_date_range 
  ON public.schedule_overrides(override_date);

-- Enable RLS
ALTER TABLE public.schedule_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies - access through provider's tenant
CREATE POLICY "schedule_overrides_select"
  ON public.schedule_overrides FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = provider_id AND p.tenant_id = public.get_current_tenant_id()
    )
  );

CREATE POLICY "schedule_overrides_insert"
  ON public.schedule_overrides FOR INSERT
  WITH CHECK (
    public.is_admin() AND EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = provider_id AND p.tenant_id = public.get_current_tenant_id()
    )
  );

CREATE POLICY "schedule_overrides_update"
  ON public.schedule_overrides FOR UPDATE
  USING (
    public.is_admin() AND EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = provider_id AND p.tenant_id = public.get_current_tenant_id()
    )
  );

CREATE POLICY "schedule_overrides_delete"
  ON public.schedule_overrides FOR DELETE
  USING (
    public.is_admin() AND EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = provider_id AND p.tenant_id = public.get_current_tenant_id()
    )
  );

-- Updated at trigger
DROP TRIGGER IF EXISTS handle_schedule_overrides_updated_at ON public.schedule_overrides;
CREATE TRIGGER handle_schedule_overrides_updated_at
  BEFORE UPDATE ON public.schedule_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ============================
-- 3. PROVIDER CALENDARS TABLE
-- Google Calendar OAuth integration
-- ============================

CREATE TABLE IF NOT EXISTS public.provider_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  -- Google Calendar ID (e.g., "primary" or specific calendar ID)
  google_calendar_id TEXT NOT NULL,
  -- OAuth tokens (encrypted at rest by Supabase)
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  -- Token expiration (for refresh logic)
  token_expires_at TIMESTAMPTZ NOT NULL,
  -- Sync status
  last_synced_at TIMESTAMPTZ,
  sync_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- One calendar connection per provider
  CONSTRAINT unique_provider_calendar UNIQUE (provider_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_provider_calendars_provider_id 
  ON public.provider_calendars(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_calendars_expires 
  ON public.provider_calendars(token_expires_at) WHERE sync_enabled = true;

-- Enable RLS
ALTER TABLE public.provider_calendars ENABLE ROW LEVEL SECURITY;

-- RLS Policies - stricter access for sensitive OAuth tokens
CREATE POLICY "provider_calendars_select"
  ON public.provider_calendars FOR SELECT
  USING (
    public.is_admin() AND EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = provider_id AND p.tenant_id = public.get_current_tenant_id()
    )
  );

CREATE POLICY "provider_calendars_insert"
  ON public.provider_calendars FOR INSERT
  WITH CHECK (
    public.is_admin() AND EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = provider_id AND p.tenant_id = public.get_current_tenant_id()
    )
  );

CREATE POLICY "provider_calendars_update"
  ON public.provider_calendars FOR UPDATE
  USING (
    public.is_admin() AND EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = provider_id AND p.tenant_id = public.get_current_tenant_id()
    )
  );

CREATE POLICY "provider_calendars_delete"
  ON public.provider_calendars FOR DELETE
  USING (
    public.is_admin() AND EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = provider_id AND p.tenant_id = public.get_current_tenant_id()
    )
  );

-- Updated at trigger
DROP TRIGGER IF EXISTS handle_provider_calendars_updated_at ON public.provider_calendars;
CREATE TRIGGER handle_provider_calendars_updated_at
  BEFORE UPDATE ON public.provider_calendars
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- MIGRATION COMPLETE
-- Tables: provider_schedules, schedule_overrides, provider_calendars
-- All with RLS and indexes for the 4-layer availability engine
-- ============================================================
