
import { NextRequest, NextResponse } from 'next/server';
import { getTokens } from '@/lib/google/auth';
import { createClient } from '@/lib/supabase/server';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This contains providerId
    const error = searchParams.get('error');

    // 1. Handle Errors/Cancellation
    if (error) {
        return NextResponse.redirect(
            new URL(`/admin/error?message=Google Auth Error: ${error}`, request.url)
        );
    }

    if (!code || !state) {
        return NextResponse.redirect(
            new URL('/admin/error?message=Missing code or state', request.url)
        );
    }

    const providerId = state;

    try {
        // 2. Exchange Code for Tokens
        const tokens = await getTokens(code);

        if (!tokens.access_token || !tokens.refresh_token) {
            // If no refresh token, we might need to prompt for consent again
            console.error('Missing refresh token inside response:', tokens);
            throw new Error('Failed to retrieve refresh token. Try revoking access and connecting again.');
        }

        const supabase = await createClient();

        // 3. Get User Email (to store as calendar ID usually, or just metadata)
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials(tokens);
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data: userInfo } = await oauth2.userinfo.get();
        const calendarEmail = userInfo.email || 'primary';

        // 4. Store Tokens in Database
        // Note: provider_calendars table has unique constraint on provider_id
        const { error: dbError } = await supabase
            .from('provider_calendars')
            .upsert({
                provider_id: providerId,
                google_calendar_id: calendarEmail,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                token_expires_at: new Date(tokens.expiry_date || Date.now() + 3600 * 1000).toISOString(),
                sync_enabled: true,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'provider_id' });

        if (dbError) {
            console.error('Database error storing tokens:', dbError);
            throw new Error(`Database error: ${dbError.message}`);
        }

        // 5. Redirect Success
        // We assume the user came from the provider detail page schedule tab
        // The URL pattern typically: /admin/providers/[id]?tab=schedule
        return NextResponse.redirect(
            new URL(`/admin/providers/${providerId}?tab=schedule&success=google-connected`, request.url)
        );

    } catch (err) {
        console.error('Google Callback Error:', err);
        return NextResponse.redirect(
            new URL(`/admin/error?message=Failed to connect Google Calendar: ${err instanceof Error ? err.message : 'Unknown error'}`, request.url)
        );
    }
}
