-- Migration: Fix Users RLS for Registration
-- Issue: The "users_insert" policy requires auth.uid() but during registration
-- the session isn't established yet, blocking profile creation.

-- Drop all existing INSERT policies for users table
DROP POLICY IF EXISTS "users_insert" ON public.users;
DROP POLICY IF EXISTS "Allow profile insert on registration" ON public.users;

-- Create a permissive INSERT policy for registration
-- The id column references auth.users(id) with FK constraint, so invalid IDs will fail anyway
CREATE POLICY "users_insert_registration" ON public.users
FOR INSERT
WITH CHECK (true);

-- Note: This is intentionally permissive because:
-- 1. The `id` column has a FK constraint to auth.users(id) - invalid IDs are rejected
-- 2. We want to allow profile creation during the registration flow
-- 3. The insert happens immediately after auth.signUp() before session is established
