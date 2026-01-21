import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * OAuth Callback Handler
 * 
 * This route handles the callback from OAuth providers (Google, etc.)
 * 
 * Flow:
 * 1. Exchange auth code for session
 * 2. Fetch user's roles from users table (created by database trigger)
 * 3. Redirect based on roles:
 *    - has 'admin' → /admin/dashboard
 *    - has 'provider' → /provider/dashboard
 *    - default → /dashboard
 */
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
        const supabase = await createClient();

        // Exchange code for session
        const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code);

        if (!authError && authData.user) {
            // Fetch user roles from users table
            // The database trigger (handle_new_user) creates the profile automatically
            const { data: userData } = await supabase
                .from('users')
                .select('roles')
                .eq('id', authData.user.id)
                .single();

            // Determine redirect based on roles (check admin first, then provider)
            const roles: string[] = userData?.roles || ['client'];
            let redirectPath = '/dashboard';

            if (roles.includes('admin')) {
                redirectPath = '/admin/dashboard';
            } else if (roles.includes('provider')) {
                redirectPath = '/provider/dashboard';
            }

            return NextResponse.redirect(`${origin}${redirectPath}`);
        }
    }

    // Auth error handling
    return NextResponse.redirect(`${origin}/login?error=auth_code_error`);
}
