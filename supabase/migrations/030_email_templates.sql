-- Create email_templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('booking_confirmation', 'booking_cancellation', 'provider_notification')),
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one template per event type per tenant
  UNIQUE(tenant_id, event_type)
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admin can view/edit their tenant's templates
CREATE POLICY "Admins can view own templates"
  ON public.email_templates
  FOR SELECT
  USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Admins can update own templates"
  ON public.email_templates
  FOR UPDATE
  USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Admins can insert own templates"
  ON public.email_templates
  FOR INSERT
  WITH CHECK (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Admins can delete own templates"
  ON public.email_templates
  FOR DELETE
  USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Trigger to update updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
