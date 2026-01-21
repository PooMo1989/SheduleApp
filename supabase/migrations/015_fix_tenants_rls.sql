-- ============================================================
-- Migration 015: Fix Tenants RLS Policies  
-- Purpose: Allow admins to update their own tenant settings
-- ============================================================

-- Current issue: No UPDATE policy exists for tenants table
-- Also: SELECT policy relies on JWT app_metadata which we don't set

-- Drop old policies that rely on JWT app_metadata
DROP POLICY IF EXISTS "Users can view own tenant" ON public.tenants;

-- Allow users to SELECT their own tenant via users table lookup
CREATE POLICY "tenants_select_own" ON public.tenants
FOR SELECT
USING (
  id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);

-- Allow admins to UPDATE their own tenant
CREATE POLICY "tenants_update_admin" ON public.tenants
FOR UPDATE
USING (
  id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================
-- MIGRATION COMPLETE
-- Tenants RLS now supports SELECT and UPDATE via users table lookup
-- ============================================================
