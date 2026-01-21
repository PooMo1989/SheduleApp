import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Service role client bypasses RLS
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { db: { schema: 'public' } }
);

async function fixAndTest() {
    console.log('=== Creating tenant and user with SERVICE KEY (bypasses RLS) ===\n');

    // Get auth user
    const { data: users } = await supabase.auth.admin.listUsers();
    const testUser = users?.users[0];
    if (!testUser) {
        console.log('No auth user found.');
        return;
    }
    console.log('Auth user:', testUser.email, testUser.id);

    // Create tenant (service key bypasses RLS)
    console.log('\n1. Creating tenant...');
    const { data: tenant, error: te } = await supabase
        .from('tenants')
        .insert({ name: 'Test Corp', slug: 'test-' + Date.now(), settings: {} })
        .select('id')
        .single();

    if (te) {
        console.error('Tenant error:', te);
        return;
    }
    console.log('Tenant:', tenant.id);

    // Create user profile
    console.log('\n2. Creating user profile...');
    const { data: profile, error: pe } = await supabase
        .from('users')
        .insert({
            id: testUser.id,
            tenant_id: tenant.id,
            role: 'admin',
            full_name: 'Test Admin',
            phone: '+1234567890',
        })
        .select()
        .single();

    if (pe) {
        console.error('Profile error:', pe);
        // Cleanup tenant
        await supabase.from('tenants').delete().eq('id', tenant.id);
        return;
    }
    console.log('Profile created:', profile);
    console.log('\n✅ SUCCESS! Tenant and user profile created.');
    console.log('\nNow go to your deployed app and login. You should see the admin dashboard!');
}

fixAndTest();
