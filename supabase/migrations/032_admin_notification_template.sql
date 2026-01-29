-- Epic 4, Story 4.5: Admin Notification Template
-- First, update the event_type constraint to allow 'admin_notification'

ALTER TABLE public.email_templates
DROP CONSTRAINT IF EXISTS email_templates_event_type_check;

ALTER TABLE public.email_templates
ADD CONSTRAINT email_templates_event_type_check
CHECK (event_type IN ('booking_confirmation', 'booking_cancellation', 'provider_notification', 'admin_notification'));

-- Insert default admin notification email template
INSERT INTO public.email_templates (tenant_id, event_type, subject_template, body_template)
SELECT
    id as tenant_id,
    'admin_notification' as event_type,
    'New Booking Request Pending Approval' as subject_template,
    '<h2>New Booking Request</h2>
<p>A new booking request requires your approval:</p>
<ul>
  <li><strong>Client:</strong> {{client_name}} ({{client_email}})</li>
  <li><strong>Service:</strong> {{service_name}}</li>
  <li><strong>Provider:</strong> {{provider_name}}</li>
  <li><strong>Date & Time:</strong> {{date}} at {{time}}</li>
</ul>
<p><a href="{{admin_link}}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">Review Booking</a></p>' as body_template
FROM public.tenants
ON CONFLICT (tenant_id, event_type) DO NOTHING;
