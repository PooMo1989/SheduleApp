import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';
    const tenantSlug = searchParams.get('tenant'); // Optional tenant slug

    if (code) {
        const supabase = await createClient();

        // Exchange code for session
        const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code);

        if (!authError && authData.user) {
            // Check if user profile exists in users table
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('id', authData.user.id)
                .single();

            // If no profile, create one
            // This is crucial for Google Sign-In where registration happens automatically
            if (!existingUser) {
                // Resolve tenant
                // 1. From URL param
                // 2. Default tenant (for MVP)
                let tenantId = 'a0000000-0000-0000-0000-000000000001'; // Fallback default

                if (tenantSlug) {
                    const { data: tenant } = await supabase
                        .from('tenants')
                        .select('id')
                        .eq('slug', tenantSlug)
                        .single();
                    if (tenant) tenantId = tenant.id;
                } else {
                    // Or fetch the default one dynamically if needed
                    const { data: defaultTenant } = await supabase
                        .from('tenants')
                        .select('id')
                        .eq('slug', 'default')
                        .single();
                    if (defaultTenant) tenantId = defaultTenant.id;
                }

                // Extract metadata
                const metadata = authData.user.user_metadata;
                const fullName = metadata.full_name || metadata.name || '';
                const avatarUrl = metadata.avatar_url || metadata.picture || '';

                // Insert user profile
                // Uses the service role capability of the server client implicitly?
                // Note: The createClient in @/lib/supabase/server uses cookies. 
                // For inserting into 'users' table which has RLS, the user is technically authenticated now via exchangeCodeForSession.
                // However, the 'users_insert' policy requires id = auth.uid(). 
                // Since we exchanged the code, supabase.auth.getUser() should return the user, allowing the insert.

                const { error: insertError } = await supabase.from('users').insert({
                    id: authData.user.id,
                    tenant_id: tenantId,
                    role: 'client',
                    full_name: fullName,
                    avatar_url: avatarUrl,
                    email_verified: true, // Google emails are verified
                });

                if (insertError) {
                    console.error('Error creating user profile:', insertError);
                    return NextResponse.redirect(`${origin}/login?error=profile_creation_failed`);
                }
            }

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // Auth error handling
    return NextResponse.redirect(`${origin}/login?error=auth_code_error`);
}
