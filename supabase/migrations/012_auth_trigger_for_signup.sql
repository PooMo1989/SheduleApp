-- Migration: Create Auth Trigger for Tenant & Profile Creation
-- Purpose: Automatically create tenant and user profile when ANY user signs up
-- This handles all auth methods: email/password, Google SSO, any future SSO

-- Function that runs when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_tenant_id UUID;
  user_email TEXT;
  user_name TEXT;
  tenant_slug TEXT;
BEGIN
  -- Get email and name from the new user
  user_email := NEW.email;
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '');
  
  -- Generate slug from email
  tenant_slug := LOWER(REPLACE(REPLACE(user_email, '@', '-'), '.', '-'));
  tenant_slug := REGEXP_REPLACE(tenant_slug, '[^a-z0-9-]', '', 'g');
  tenant_slug := LEFT(tenant_slug, 50);
  
  -- Handle slug collision by appending timestamp
  IF EXISTS (SELECT 1 FROM public.tenants WHERE slug = tenant_slug) THEN
    tenant_slug := tenant_slug || '-' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;
  END IF;
  
  -- Create new tenant
  INSERT INTO public.tenants (name, slug, settings)
  VALUES (
    COALESCE(NULLIF(user_name, '') || '''s Company', 'My Company'),
    tenant_slug,
    '{}'::jsonb
  )
  RETURNING id INTO new_tenant_id;
  
  -- Create user profile as admin
  INSERT INTO public.users (id, tenant_id, role, full_name, phone)
  VALUES (
    NEW.id,
    new_tenant_id,
    'admin',
    NULLIF(user_name, ''),
    NEW.phone
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth signup
    RAISE WARNING 'handle_new_user failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.tenants TO supabase_auth_admin;
GRANT ALL ON public.users TO supabase_auth_admin;
