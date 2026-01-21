import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testFullFlow() {
    console.log('=== Testing Full Registration Flow ===\n');

    // Get the existing auth user
    const { data: users } = await createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    ).auth.admin.listUsers();

    const testUser = users?.users[0];
    if (!testUser) {
        console.log('No auth user found. Please register first.');
        return;
    }
    console.log('Auth user:', testUser.email, testUser.id);

    // 1. Try tenant insert
    console.log('\n1. Testing tenant insert...');
    const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
            name: 'Debug Company',
            slug: 'debug-' + Date.now(),
            settings: {},
        })
        .select('id')
        .single();

    if (tenantError) {
        console.error('Tenant ERROR:', tenantError);
        return;
    }
    console.log('Tenant created:', tenant.id);

    // 2. Try user profile insert
    console.log('\n2. Testing user profile insert...');
    const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert({
            id: testUser.id,
            tenant_id: tenant.id,
            role: 'admin',
            full_name: 'Debug User',
            phone: '+1234567890',
        })
        .select()
        .single();

    if (profileError) {
        console.error('Profile ERROR:', profileError);
    } else {
        console.log('Profile created:', profile);
    }

    // Cleanup
    console.log('\nCleaning up...');
    await createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    ).from('users').delete().eq('id', testUser.id);
    await createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    ).from('tenants').delete().eq('id', tenant.id);
    console.log('Done.');
}

testFullFlow();
