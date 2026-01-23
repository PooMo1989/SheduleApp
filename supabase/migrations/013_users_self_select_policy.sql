-- Migration: Fix Users RLS for Self-Select
-- Purpose: Allow users to SELECT their own row (needed for role-based redirect)

-- Allow users to read their own profile
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
FOR SELECT
USING (id = auth.uid());
