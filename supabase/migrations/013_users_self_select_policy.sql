-- Migration: Fix Users RLS for Self-Select
-- Purpose: Allow users to SELECT their own row (needed for role-based redirect)

-- Allow users to read their own profile
CREATE POLICY IF NOT EXISTS "users_select_own" ON public.users
FOR SELECT
USING (id = auth.uid());
