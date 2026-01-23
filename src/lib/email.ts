import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey && process.env.NODE_ENV !== 'test') {
    // console.warn('Warning: RESEND_API_KEY is not set. Emails will fail.');
}

export const resend = new Resend(apiKey || 're_123_build_placeholder');
