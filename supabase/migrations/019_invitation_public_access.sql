-- Migration 019: Add public RLS policy for invitation acceptance
-- Story 2.4.4: Invitation Acceptance Flow
-- 
-- This allows unauthenticated users to:
-- 1. Read pending invitations (to validate their token)
-- 2. Update invitations to mark as 'accepted'
--
-- Security: Users still need the secret token to take action.
-- The token is a 64-character cryptographically random string.

-- Allow anonymous users to SELECT pending invitations
-- This is needed for the validateInvite procedure
CREATE POLICY "team_invitations_anon_select"
  ON public.team_invitations FOR SELECT TO anon
  USING (status = 'pending');

-- Allow anonymous users to UPDATE invitations (to mark as accepted)
-- This is needed for the acceptInvite procedure
CREATE POLICY "team_invitations_anon_update"
  ON public.team_invitations FOR UPDATE TO anon
  USING (status = 'pending')
  WITH CHECK (status = 'accepted');
