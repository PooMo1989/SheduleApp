-- Migration: Seed Default Tenant
-- Purpose: Create a default tenant for development

-- Insert default tenant
INSERT INTO public.tenants (id, name, slug, settings)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Default Tenant',
  'default',
  '{"theme": "light", "timezone": "Asia/Kolkata"}'
)
ON CONFLICT (slug) DO NOTHING;
