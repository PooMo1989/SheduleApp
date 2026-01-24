-- ============================================================
-- Migration 024: Service Schedule Tables (Story 2.1.2)
-- Purpose: Layer 1 of 4-layer availability engine - service-level schedules
-- ============================================================

-- ============================
-- 1. SERVICE_SCHEDULES TABLE
-- ============================

CREATE TABLE IF NOT EXISTS public.service_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure no duplicate slots
  CONSTRAINT service_schedules_unique UNIQUE (service_id, day_of_week, start_time, end_time),
  -- Ensure start < end
  CONSTRAINT service_schedules_time_order CHECK (start_time < end_time)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_schedules_service_day
  ON public.service_schedules(service_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_service_schedules_tenant
  ON public.service_schedules(tenant_id);

-- Enable RLS
ALTER TABLE public.service_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "service_schedules_select"
  ON public.service_schedules FOR SELECT
  USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "service_schedules_insert"
  ON public.service_schedules FOR INSERT
  WITH CHECK (tenant_id = public.get_current_tenant_id() AND public.is_admin());

CREATE POLICY "service_schedules_update"
  ON public.service_schedules FOR UPDATE
  USING (tenant_id = public.get_current_tenant_id() AND public.is_admin());

CREATE POLICY "service_schedules_delete"
  ON public.service_schedules FOR DELETE
  USING (tenant_id = public.get_current_tenant_id() AND public.is_admin());

-- Updated at trigger
CREATE TRIGGER handle_service_schedules_updated_at
  BEFORE UPDATE ON public.service_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================
-- 2. SERVICE_SCHEDULE_OVERRIDES TABLE
-- ============================

CREATE TABLE IF NOT EXISTS public.service_schedule_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  override_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN NOT NULL DEFAULT false,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure start < end when both provided
  CONSTRAINT service_overrides_time_order CHECK (
    start_time IS NULL OR end_time IS NULL OR start_time < end_time
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_overrides_service_date
  ON public.service_schedule_overrides(service_id, override_date);
CREATE INDEX IF NOT EXISTS idx_service_overrides_tenant
  ON public.service_schedule_overrides(tenant_id);

-- Enable RLS
ALTER TABLE public.service_schedule_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "service_overrides_select"
  ON public.service_schedule_overrides FOR SELECT
  USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "service_overrides_insert"
  ON public.service_schedule_overrides FOR INSERT
  WITH CHECK (tenant_id = public.get_current_tenant_id() AND public.is_admin());

CREATE POLICY "service_overrides_update"
  ON public.service_schedule_overrides FOR UPDATE
  USING (tenant_id = public.get_current_tenant_id() AND public.is_admin());

CREATE POLICY "service_overrides_delete"
  ON public.service_schedule_overrides FOR DELETE
  USING (tenant_id = public.get_current_tenant_id() AND public.is_admin());

-- Updated at trigger
CREATE TRIGGER handle_service_overrides_updated_at
  BEFORE UPDATE ON public.service_schedule_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
