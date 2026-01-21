import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Prefer service key for full access, else anon key (RLS restricted)
const activeKey = supabaseServiceKey || supabaseAnonKey;

if (!supabaseUrl || !activeKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, activeKey);

async function main() {
    console.log('Connecting to:', supabaseUrl);
    console.log('Using Service Key:', !!supabaseServiceKey);

    // 1. List Tenants
    console.log('\nFetching Tenants...');
    const { data: tenants, error: tenantError } = await supabase
        .from('tenants')
        .select('*');

    if (tenantError) console.error('Error tenants:', tenantError.message);
    else {
        console.table(tenants?.map(t => ({
            id: t.id,
            name: t.name,
            slug: t.slug
        })) || []);
    }

    // 2. List Public Profiles
    console.log('\nFetching Public Profiles (users table)...');
    const { data: profiles, error: profileError } = await supabase
        .from('users')
        .select('*');

    if (profileError) console.error('Error profiles:', profileError.message);
    else {
        console.table(profiles?.map(u => ({
            id: u.id,
            name: u.full_name,
            role: u.role,
            tenant: u.tenant_id
        })) || []);
    }

    // 3. List Auth Users (only if service key)
    if (supabaseServiceKey) {
        console.log('\nFetching Auth Users (auth.users)...');
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) console.error('Error auth:', authError.message);
        else {
            console.table(authData.users.map(u => ({
                id: u.id,
                email: u.email,
                last_sign_in: u.last_sign_in_at,
                created: u.created_at
            })));
        }
    } else {
        console.log('\n(Skipping Auth Users list - requires SUPABASE_SERVICE_ROLE_KEY)');
    }
}

main();
