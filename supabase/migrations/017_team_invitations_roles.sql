-- ============================================================
-- Migration 017: Add roles to team_invitations
-- Purpose: Support multi-role invitations
-- ============================================================

-- Add roles column to team_invitations
ALTER TABLE public.team_invitations 
ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT ARRAY['provider']::TEXT[];

-- Add check constraint for valid roles
ALTER TABLE public.team_invitations DROP CONSTRAINT IF EXISTS team_invitations_valid_roles;
ALTER TABLE public.team_invitations ADD CONSTRAINT team_invitations_valid_roles 
CHECK (roles <@ ARRAY['admin', 'provider', 'client']::TEXT[]);

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
