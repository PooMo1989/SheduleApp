-- Migration: Helper Functions
-- Purpose: Utility functions for tenant and user management

-- Function to get current user's tenant_id from JWT
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::UUID;
$$ LANGUAGE SQL STABLE;

-- Function to get current user's role from JWT
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT auth.jwt() -> 'app_metadata' ->> 'role';
$$ LANGUAGE SQL STABLE;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT public.get_current_user_role() = 'admin';
$$ LANGUAGE SQL STABLE;

-- Function to check if current user is provider or admin
CREATE OR REPLACE FUNCTION public.is_provider_or_admin()
RETURNS BOOLEAN AS $$
  SELECT public.get_current_user_role() IN ('admin', 'provider');
$$ LANGUAGE SQL STABLE;
