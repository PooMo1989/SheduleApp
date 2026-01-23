-- ============================================================
-- Migration 018: Permissions, Invitation Logic, and RLS Fixes
-- Purpose: Implement granular permissions, fix helper functions, and update signup trigger
-- ============================================================

-- ============================
-- 1. SCHEMA UPDATES
-- ============================

-- Add permissions to users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;

-- Add fields to team_invitations
ALTER TABLE public.team_invitations 
ADD COLUMN IF NOT EXISTS default_permissions JSONB DEFAULT '{}'::jsonb,
-- Reference to providers table (using id as PK)
ADD COLUMN IF NOT EXISTS placeholder_provider_id UUID REFERENCES public.providers(id);

-- ============================
-- 2. FIX HELPER FUNCTIONS (RLS Helpers)
-- ============================

-- Fix get_current_tenant_id to look up from users table instead of JWT
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Fix get_current_user_role to look up from users table (returns first role)
-- Note: users.roles is an array. This returns the first one for backward compatibility if needed,
-- but preferably we use is_admin() checks.
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT roles[1] FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Fix is_admin to check roles array
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND 'admin' = ANY(roles)
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Fix is_provider_or_admin
CREATE OR REPLACE FUNCTION public.is_provider_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND ('admin' = ANY(roles) OR 'provider' = ANY(roles))
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;


-- ============================
-- 3. UPDATE AUTH TRIGGER (Invitation Logic)
-- ============================

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
  
  -- Check for pending invitation
  SELECT * INTO invitation_record 
  FROM public.team_invitations 
  WHERE email = user_email 
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
    
    -- If invitation had placeholder_provider_id, link user to that provider profile?
    -- Logic: If placeholder_provider_id exists, update that provider record locally?
    -- For now, we just link the user account. Provider linking might happen separately.
    -- (Optionally: UPDATE public.providers SET user_id = NEW.id WHERE id = invitation_record.placeholder_provider_id)
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
