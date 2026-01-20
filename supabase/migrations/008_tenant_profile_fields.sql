-- ============================================================
-- Migration 008: Tenant Profile Fields (Story 2.0)
-- Adds company profile, branding, and business settings to tenants
-- ============================================================

-- ============================
-- 1. ADD COLUMNS TO TENANTS TABLE
-- ============================

-- Logo URL for company branding
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Timezone for scheduling (IANA timezone name)
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata';

-- Currency for pricing display
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'LKR';

-- Business hours - JSON structure for default provider availability
-- Format: { "monday": { "open": "09:00", "close": "17:00", "enabled": true }, ... }
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '{
  "monday": { "open": "09:00", "close": "17:00", "enabled": true },
  "tuesday": { "open": "09:00", "close": "17:00", "enabled": true },
  "wednesday": { "open": "09:00", "close": "17:00", "enabled": true },
  "thursday": { "open": "09:00", "close": "17:00", "enabled": true },
  "friday": { "open": "09:00", "close": "17:00", "enabled": true },
  "saturday": { "open": "09:00", "close": "13:00", "enabled": true },
  "sunday": { "open": null, "close": null, "enabled": false }
}'::jsonb;

-- Branding colors for embed widget
-- Format: { "primary": "#0D9488", "secondary": "#...", "background": "#...", "text": "#..." }
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{
  "primary_color": "#0D9488",
  "secondary_color": "#5EEAD4",
  "background_color": "#FFFFFF",
  "text_color": "#1F2937"
}'::jsonb;

-- Allow guest checkout (booking without full account)
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS allow_guest_checkout BOOLEAN DEFAULT true;

-- Address/Location for display
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Contact information
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Website URL
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- ============================
-- 2. CREATE INDEX FOR PERFORMANCE
-- ============================

-- Index already exists for slug from migration 001

-- ============================================================
-- MIGRATION COMPLETE
-- Tenants table now has all fields needed for company profile
-- ============================================================
