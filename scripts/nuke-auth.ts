import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function nuke() {
    console.log('Deleting all auth users...');
    const { data: users } = await supabase.auth.admin.listUsers();
    for (const user of users?.users || []) {
        console.log('Deleting:', user.email);
        await supabase.auth.admin.deleteUser(user.id);
    }
    console.log('Done! Go to /register to start fresh.');
}

nuke();
