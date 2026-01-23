
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function nuke() {
    console.log('☢️  Nuking database users and tenants...');

    // 1. Delete all users from auth.users (cascades to public.users? maybe)
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        process.exit(1);
    }

    if (users.length > 0) {
        console.log(`Found ${users.length} users. Deleting...`);
        for (const user of users) {
            const { error } = await supabase.auth.admin.deleteUser(user.id);
            if (error) console.error(`Failed to delete user ${user.id}:`, error.message);
            else console.log(`Deleted user ${user.id}`);
        }
    } else {
        console.log('No users found.');
    }

    // 2. Delete all tenants explicitly (to be safe)
    const { error: tenantError } = await supabase
        .from('tenants')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything

    if (tenantError) {
        console.log('Error deleting tenants (might have been cascaded):', tenantError.message);
    } else {
        console.log('Cleaned up tenants table.');
    }

    // 3. Delete invitations
    const { error: inviteError } = await supabase
        .from('team_invitations')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (inviteError) {
        console.log('Error deleting invitations:', inviteError.message);
    } else {
        console.log('Cleaned up team_invitations table.');
    }

    console.log('✅ Cleanup complete.');
}

nuke().catch(console.error);
