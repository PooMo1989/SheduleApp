-- ============================================================
-- Migration 026: Fix Provider Availability RLS & Constraints (Tier 8.1)
-- Fixed RLS policies to allow provider self-service
-- Adds missing unique constraint for schedule overrides
-- ============================================================

-- 1. Fix RLS Policies for provider_schedules
-- Drop restrictive policies
DROP POLICY IF EXISTS "provider_schedules_insert" ON public.provider_schedules;
DROP POLICY IF EXISTS "provider_schedules_update" ON public.provider_schedules;
DROP POLICY IF EXISTS "provider_schedules_delete" ON public.provider_schedules;

-- Create permissive policies (Admin OR Provider Owner)
CREATE POLICY "provider_schedules_insert_policy"
  ON public.provider_schedules FOR INSERT
  WITH CHECK (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = provider_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "provider_schedules_update_policy"
  ON public.provider_schedules FOR UPDATE
  USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = provider_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "provider_schedules_delete_policy"
  ON public.provider_schedules FOR DELETE
  USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = provider_id 
      AND p.user_id = auth.uid()
    )
  );

-- 2. Fix RLS Policies for schedule_overrides
-- Drop restrictive policies
DROP POLICY IF EXISTS "schedule_overrides_insert" ON public.schedule_overrides;
DROP POLICY IF EXISTS "schedule_overrides_update" ON public.schedule_overrides;
DROP POLICY IF EXISTS "schedule_overrides_delete" ON public.schedule_overrides;

-- Create permissive policies (Admin OR Provider Owner)
CREATE POLICY "schedule_overrides_insert_policy"
  ON public.schedule_overrides FOR INSERT
  WITH CHECK (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = provider_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "schedule_overrides_update_policy"
  ON public.schedule_overrides FOR UPDATE
  USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = provider_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "schedule_overrides_delete_policy"
  ON public.schedule_overrides FOR DELETE
  USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = provider_id 
      AND p.user_id = auth.uid()
    )
  );

-- 3. Add Unique Constraint for Schedule Overrides
-- This ensures upsert works correctly by (provider_id, override_date)
ALTER TABLE public.schedule_overrides
  ADD CONSTRAINT unique_provider_date_override UNIQUE (provider_id, override_date);
