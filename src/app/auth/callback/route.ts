import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * OAuth Callback Handler
 * 
 * This route handles the callback from OAuth providers (Google, etc.)
 * 
 * Flow:
 * 1. Exchange auth code for session
 * 2. Fetch user's role from users table (created by database trigger)
 * 3. Redirect based on role:
 *    - admin → /admin/dashboard
 *    - provider → /provider/dashboard
 *    - client → /dashboard
 */
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
        const supabase = await createClient();

        // Exchange code for session
        const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code);

        if (!authError && authData.user) {
            // Fetch user role from users table
            // The database trigger (handle_new_user) creates the profile automatically
            const { data: userData } = await supabase
                .from('users')
                .select('role')
                .eq('id', authData.user.id)
                .single();

            // Determine redirect based on role
            const role = userData?.role || 'client';
            let redirectPath = '/dashboard';

            switch (role) {
                case 'admin':
                    redirectPath = '/admin/dashboard';
                    break;
                case 'provider':
                    redirectPath = '/provider/dashboard';
                    break;
                default:
                    redirectPath = '/dashboard';
            }

            return NextResponse.redirect(`${origin}${redirectPath}`);
        }
    }

    // Auth error handling
    return NextResponse.redirect(`${origin}/login?error=auth_code_error`);
}
