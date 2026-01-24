-- ============================================================
-- Migration 025: Team & Provider Extended Fields (Story 2.4.4b)
-- Purpose: Add position, is_active to users; name/phone/position to invitations;
--          specialization/schedule_autonomy to provider_profiles
-- ============================================================

-- ============================
-- 1. USERS TABLE
-- ============================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS position TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ============================
-- 2. TEAM_INVITATIONS TABLE
-- ============================

ALTER TABLE public.team_invitations
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS position TEXT;

-- ============================
-- 3. PROVIDERS TABLE
-- ============================

ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS specialization TEXT,
  ADD COLUMN IF NOT EXISTS schedule_autonomy TEXT DEFAULT 'self_managed';

ALTER TABLE public.providers DROP CONSTRAINT IF EXISTS providers_schedule_autonomy_check;
ALTER TABLE public.providers ADD CONSTRAINT providers_schedule_autonomy_check
  CHECK (schedule_autonomy IN ('self_managed', 'approval_required'));

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
