-- Migration 020: Fix handle_new_user trigger email matching
-- Purpose: Make invitation lookup case-insensitive to prevent failures when email casing differs

-- Update the handle_new_user function
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
    
    -- Insert user attached to existing tenant
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
    
    -- Link provider profile if placeholder exists
    IF invitation_record.placeholder_provider_id IS NOT NULL THEN
        UPDATE public.providers 
        SET user_id = NEW.id,
            email = user_email -- Ensure email matches
        WHERE id = invitation_record.placeholder_provider_id;
    END IF;

  ELSE
    -- CREATE NEW TENANT (Default Flow)

    tenant_slug := LOWER(REPLACE(REPLACE(user_email, '@', '-'), '.', '-'));
    tenant_slug := REGEXP_REPLACE(tenant_slug, '[^a-z0-9-]', '', 'g');
    tenant_slug := LEFT(tenant_slug, 50);
    
    IF EXISTS (SELECT 1 FROM public.tenants WHERE slug = tenant_slug) THEN
      tenant_slug := tenant_slug || '-' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;
    END IF;
    
    INSERT INTO public.tenants (name, slug, settings)
    VALUES (COALESCE(NULLIF(user_name, '') || '''s Company', 'My Company'), tenant_slug, '{}'::jsonb)
    RETURNING id INTO new_tenant_id;
    
    INSERT INTO public.users (id, tenant_id, roles, full_name, phone, permissions)
    VALUES (
      NEW.id, 
      new_tenant_id, 
      ARRAY['admin']::TEXT[], 
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
