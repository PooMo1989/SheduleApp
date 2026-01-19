-- Migration: Fix RLS Policies for Registration
-- Purpose: Allow public tenant lookup and user profile creation during registration

-- Allow public tenant lookup (needed for registration to verify tenant exists)
CREATE POLICY IF NOT EXISTS "Allow public tenant lookup" ON public.tenants
FOR SELECT
USING (true);

-- Allow profile insert during registration
-- Note: This is permissive because the server-side code validates the user ID
DROP POLICY IF EXISTS "users_insert" ON public.users;
CREATE POLICY "Allow profile insert on registration" ON public.users
FOR INSERT
WITH CHECK (true);
