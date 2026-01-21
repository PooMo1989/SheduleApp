import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function nukeAll() {
    console.log('=== Cleaning up database ===\n');

    // List current users
    const { data: users } = await supabase.auth.admin.listUsers();
    console.log('Auth users found:', users?.users.map(u => u.email).join(', ') || 'none');

    // Delete all auth users
    for (const user of users?.users || []) {
        console.log('Deleting:', user.email);
        await supabase.auth.admin.deleteUser(user.id);
    }

    // Delete all tenants (will cascade to users profiles)
    const { error: tenantError } = await supabase
        .from('tenants')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (tenantError) console.log('Tenant cleanup:', tenantError.message);
    else console.log('Tenants deleted.');

    console.log('\n✅ Done! Go to /register and sign up with Google SSO.');
}

nukeAll();
