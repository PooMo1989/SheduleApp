-- ============================================================
-- Migration 028: Owner Security & Last Owner Protection
-- Purpose: Prevent accidental lockout by ensuring at least one owner remains
-- ============================================================

-- ============================
-- 1. TENANT DELETION RLS
-- ============================

-- Only owners can delete their tenant
DROP POLICY IF EXISTS "Enable delete for owners" ON public.tenants;

CREATE POLICY "Enable delete for owners" ON public.tenants
FOR DELETE
USING (
  public.is_owner() AND 
  id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);

-- ============================
-- 2. LAST OWNER PROTECTION TRIGGER
-- ============================

CREATE OR REPLACE FUNCTION public.check_last_owner_deletion()
RETURNS TRIGGER AS $$
DECLARE
  is_target_owner BOOLEAN;
  owner_count INTEGER;
BEGIN
  -- Check if the user being deleted is an owner
  is_target_owner := 'owner' = ANY(OLD.roles);

  IF is_target_owner THEN
    -- Count remaining owners for this tenant
    SELECT COUNT(*) INTO owner_count
    FROM public.users
    WHERE tenant_id = OLD.tenant_id
    AND 'owner' = ANY(roles)
    AND id != OLD.id; -- Exclude the user being deleted

    -- If no other owners exist, block deletion
    IF owner_count = 0 THEN
      RAISE EXCEPTION 'Cannot delete the last owner of the tenant. Transfer ownership or delete the tenant instead.';
    END IF;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Register the trigger
DROP TRIGGER IF EXISTS ensure_last_owner_exists ON public.users;

CREATE TRIGGER ensure_last_owner_exists
BEFORE DELETE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.check_last_owner_deletion();

-- ============================
-- 3. ENSURE OWNER ROLE FOR FIRST USER (Safety Net)
-- ============================
-- Just in case 021 trigger logic was overridden, let's re-assert the Owner logic for new tenants
-- (This effectively reimplements the logic from 021 to be safe)

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
  
  -- Check for pending invitation (CASE INSENSITIVE)
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

    UPDATE public.team_invitations 
    SET status = 'accepted',
        accepted_at = NOW(),
        accepted_by_user_id = NEW.id
    WHERE id = invitation_record.id;
    
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
    
    -- FORCE 'owner' role for new tenant creators
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
