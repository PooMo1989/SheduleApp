-- ============================================================
-- Migration 010: Team Invitations (Story 2.4)
-- Creates table for tracking team member invitations
-- ============================================================

CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  -- Email address being invited
  email TEXT NOT NULL,
  -- Invitation token (unique, for acceptance URL)
  token TEXT NOT NULL UNIQUE,
  -- Status: pending, accepted, expired
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  -- Who sent the invitation
  invited_by UUID REFERENCES public.users(id),
  -- When the invitation expires
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  -- When the invitation was accepted
  accepted_at TIMESTAMPTZ,
  -- The user that was created when invitation was accepted
  accepted_by_user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Only one pending invitation per email per tenant
  CONSTRAINT unique_pending_invitation UNIQUE (tenant_id, email, status)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_team_invitations_tenant_id 
  ON public.team_invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email 
  ON public.team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token 
  ON public.team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status 
  ON public.team_invitations(tenant_id, status);

-- Enable RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "team_invitations_select"
  ON public.team_invitations FOR SELECT
  USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "team_invitations_insert"
  ON public.team_invitations FOR INSERT
  WITH CHECK (public.is_admin() AND tenant_id = public.get_current_tenant_id());

CREATE POLICY "team_invitations_update"
  ON public.team_invitations FOR UPDATE
  USING (public.is_admin() AND tenant_id = public.get_current_tenant_id());

CREATE POLICY "team_invitations_delete"
  ON public.team_invitations FOR DELETE
  USING (public.is_admin() AND tenant_id = public.get_current_tenant_id());

-- Updated at trigger
DROP TRIGGER IF EXISTS handle_team_invitations_updated_at ON public.team_invitations;
CREATE TRIGGER handle_team_invitations_updated_at
  BEFORE UPDATE ON public.team_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
