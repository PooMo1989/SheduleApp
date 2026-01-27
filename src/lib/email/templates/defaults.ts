export const DEFAULT_EMAIL_TEMPLATES = {
    booking_confirmation: {
        subject: 'Appointment Confirmed: {{service_name}}',
        body: `Hi {{client_name}},

Your appointment for {{service_name}} on {{date}} at {{time}} is confirmed.

Provider: {{provider_name}}
Location: {{location}}

See you there!
`
    },
    booking_cancellation: {
        subject: 'Appointment Cancelled: {{service_name}}',
        body: `Hi {{client_name}},

Your appointment for {{service_name}} on {{date}} at {{time}} has been cancelled.

Please visit our website to reschedule if needed.
`
    },
    provider_notification: {
        subject: 'New Booking: {{service_name}}',
        body: `Hi {{provider_name}},

You received a new booking.

Client: {{client_name}}
Service: {{service_name}}
Date: {{date}}
Time: {{time}}
`
    }
};
