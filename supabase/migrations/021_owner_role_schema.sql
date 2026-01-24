-- ============================================================
-- Migration 021: Owner Role Schema Update (Story 1.8.1)
-- Purpose: Add 'owner' as distinct role from 'admin'
-- ============================================================

-- ============================
-- 1. UPDATE ROLES CHECK CONSTRAINT
-- ============================

-- Users table: allow 'owner' role
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_valid_roles;
ALTER TABLE public.users ADD CONSTRAINT users_valid_roles
  CHECK (roles <@ ARRAY['owner', 'admin', 'provider', 'client']::TEXT[]);

-- Team invitations: allow 'owner' role (edge case: transferring ownership)
ALTER TABLE public.team_invitations DROP CONSTRAINT IF EXISTS team_invitations_valid_roles;
ALTER TABLE public.team_invitations ADD CONSTRAINT team_invitations_valid_roles
  CHECK (roles <@ ARRAY['owner', 'admin', 'provider', 'client']::TEXT[]);

-- ============================
-- 2. UPDATE AUTH TRIGGER
-- ============================

-- New signups (no invitation) get 'owner' role instead of 'admin'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_tenant_id UUID;
  user_email TEXT;
  user_name TEXT;
  tenant_slug TEXT;
  invitation_record RECORD;
  user_roles TEXT[];
BEGIN
  user_email := NEW.email;
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '');

  -- Check for pending invitation (case-insensitive)
  SELECT * INTO invitation_record
  FROM public.team_invitations
  WHERE LOWER(email) = LOWER(user_email)
  AND status = 'pending'
  LIMIT 1;

  IF invitation_record.id IS NOT NULL THEN
    -- JOIN EXISTING TENANT via Invitation
    new_tenant_id := invitation_record.tenant_id;
    user_roles := invitation_record.roles;

    INSERT INTO public.users (id, tenant_id, roles, full_name, phone, permissions)
    VALUES (
      NEW.id,
      new_tenant_id,
      user_roles,
      NULLIF(user_name, ''),
      NEW.phone,
      COALESCE(invitation_record.default_permissions, '{}'::jsonb)
    );

    -- Mark invitation as accepted
    UPDATE public.team_invitations
    SET status = 'accepted',
        accepted_at = NOW(),
        accepted_by_user_id = NEW.id
    WHERE id = invitation_record.id;

    -- Link placeholder provider if exists
    IF invitation_record.placeholder_provider_id IS NOT NULL THEN
        UPDATE public.providers
        SET user_id = NEW.id,
            email = user_email
        WHERE id = invitation_record.placeholder_provider_id;
    END IF;

  ELSE
    -- CREATE NEW TENANT (Owner Flow)
    tenant_slug := LOWER(REPLACE(REPLACE(user_email, '@', '-'), '.', '-'));
    tenant_slug := REGEXP_REPLACE(tenant_slug, '[^a-z0-9-]', '', 'g');
    tenant_slug := LEFT(tenant_slug, 50);

    IF EXISTS (SELECT 1 FROM public.tenants WHERE slug = tenant_slug) THEN
      tenant_slug := tenant_slug || '-' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;
    END IF;

    INSERT INTO public.tenants (name, slug, settings)
    VALUES (COALESCE(NULLIF(user_name, '') || '''s Company', 'My Company'), tenant_slug, '{}'::jsonb)
    RETURNING id INTO new_tenant_id;

    -- Owner role (not admin) for new tenant creators
    INSERT INTO public.users (id, tenant_id, roles, full_name, phone, permissions)
    VALUES (
      NEW.id,
      new_tenant_id,
      ARRAY['owner']::TEXT[],
      NULLIF(user_name, ''),
      NEW.phone,
      '{}'::jsonb
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================
-- 3. UPDATE HELPER FUNCTIONS
-- ============================

-- is_admin() should also return true for 'owner' (owner has all admin powers)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND ('admin' = ANY(roles) OR 'owner' = ANY(roles))
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- New helper: is_owner()
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND 'owner' = ANY(roles)
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================
-- 4. MIGRATE EXISTING OWNERS
-- ============================

-- For existing tenants, the first admin (oldest created_at) becomes owner
-- This is a one-time data migration
UPDATE public.users u
SET roles = ARRAY['owner']::TEXT[]
WHERE u.id = (
  SELECT u2.id
  FROM public.users u2
  WHERE u2.tenant_id = u.tenant_id
  AND 'admin' = ANY(u2.roles)
  ORDER BY u2.created_at ASC
  LIMIT 1
)
AND 'admin' = ANY(u.roles)
AND NOT ('owner' = ANY(u.roles));

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
