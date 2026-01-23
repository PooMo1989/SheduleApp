
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);

async function testAdminFunction() {
    console.log('🧪 Testing is_admin() function...');

    const email = `test-admin-${Date.now()}@example.com`;
    const password = 'TestPassword123!';

    // 1. Sign up new user
    console.log(`Creating user ${email}...`);
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: 'Test Admin' }
        }
    });

    if (signUpError || !user) {
        console.error('Signup failed:', signUpError);
        return;
    }
    console.log('User created:', user.id);

    // Wait for trigger to run
    await new Promise(r => setTimeout(r, 2000));

    // 2. Check public.users roles
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('roles')
        .eq('id', user.id)
        .single();

    if (userError) {
        console.error('Failed to fetch user roles:', userError);
    } else {
        console.log('User roles in public table:', userData?.roles);
    }

    // 3. Call is_admin() RPC
    console.log('Calling is_admin() RPC...');
    const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin');

    if (rpcError) {
        console.error('RPC call failed:', rpcError);
    } else {
        console.log(`is_admin() returned: ${isAdmin}`);
    }

    // 4. Check get_current_tenant_id() RPC
    console.log('Calling get_current_tenant_id() RPC...');
    const { data: tenantId, error: tenantError } = await supabase.rpc('get_current_tenant_id');

    if (tenantError) {
        console.error('RPC tenant call failed:', tenantError);
    } else {
        console.log(`get_current_tenant_id() returned: ${tenantId}`);
    }

    // 5. Verify results
    if (userData?.roles?.includes('admin') && isAdmin === true) {
        console.log('✅ SUCCESS: is_admin() works correctly.');
    } else {
        console.log('❌ FAILURE: is_admin() returned false but user has admin role.');
    }
}

testAdminFunction();
