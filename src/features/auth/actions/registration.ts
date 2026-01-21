'use server';

import { createClient } from '@supabase/supabase-js';

/**
 * Server action to create tenant and user profile after auth signup.
 * Uses service role key to bypass RLS.
 */
export async function createTenantAndProfile(input: {
    userId: string;
    email: string;
    fullName?: string;
    phone?: string;
}) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        return { success: false, error: 'Server configuration error' };
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    try {
        // Generate slug from email
        const slug = input.email
            .toLowerCase()
            .replace('@', '-')
            .replace(/\./g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .slice(0, 50);

        // 1. Create tenant
        let tenantId: string;
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .insert({
                name: input.fullName ? `${input.fullName}'s Company` : 'My Company',
                slug: slug,
                settings: {},
            })
            .select('id')
            .single();

        if (tenantError) {
            // If slug collision, try with timestamp
            if (tenantError.code === '23505') {
                const uniqueSlug = `${slug}-${Date.now().toString(36)}`;
                const { data: retryTenant, error: retryError } = await supabase
                    .from('tenants')
                    .insert({
                        name: input.fullName ? `${input.fullName}'s Company` : 'My Company',
                        slug: uniqueSlug,
                        settings: {},
                    })
                    .select('id')
                    .single();

                if (retryError || !retryTenant) {
                    console.error('Tenant retry failed:', retryError);
                    return { success: false, error: 'Failed to create company' };
                }
                tenantId = retryTenant.id;
            } else {
                console.error('Tenant creation failed:', tenantError);
                return { success: false, error: 'Failed to create company' };
            }
        } else {
            tenantId = tenant.id;
        }

        // 2. Create user profile as admin
        const { error: profileError } = await supabase
            .from('users')
            .insert({
                id: input.userId,
                tenant_id: tenantId,
                role: 'admin',
                full_name: input.fullName || null,
                phone: input.phone || null,
            });

        if (profileError) {
            console.error('Profile creation failed:', profileError);
            // Cleanup tenant
            await supabase.from('tenants').delete().eq('id', tenantId);
            return { success: false, error: 'Failed to create user profile' };
        }

        return { success: true, tenantId };
    } catch (err) {
        console.error('Registration server action error:', err);
        return { success: false, error: 'Server error during registration' };
    }
}
