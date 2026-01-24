-- ============================================================
-- Migration 022: Tenant Payment & Configuration Fields (Story 2.0.3)
-- Purpose: Add payment payout details and booking config to tenants
-- ============================================================

-- ============================
-- 1. PAYMENT FIELDS
-- ============================

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_holder TEXT,
  ADD COLUMN IF NOT EXISTS bank_branch TEXT;

-- ============================
-- 2. PAY LATER CONFIGURATION
-- ============================

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS pay_later_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS pay_later_mode TEXT DEFAULT 'pending_approval';

-- Add check constraint for valid pay_later_mode
ALTER TABLE public.tenants DROP CONSTRAINT IF EXISTS tenants_pay_later_mode_check;
ALTER TABLE public.tenants ADD CONSTRAINT tenants_pay_later_mode_check
  CHECK (pay_later_mode IS NULL OR pay_later_mode IN ('auto_confirm', 'pending_approval'));

-- ============================
-- 3. COMPANY CONFIGURATION
-- ============================

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS business_category TEXT,
  ADD COLUMN IF NOT EXISTS slot_interval_minutes INTEGER DEFAULT 15;

-- Add check constraint for valid slot intervals
ALTER TABLE public.tenants DROP CONSTRAINT IF EXISTS tenants_slot_interval_check;
ALTER TABLE public.tenants ADD CONSTRAINT tenants_slot_interval_check
  CHECK (slot_interval_minutes IS NULL OR slot_interval_minutes IN (5, 10, 15, 20, 30, 45, 60));

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
