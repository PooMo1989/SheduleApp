import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkPolicies() {
    console.log('Checking RLS policies on users table...\n');

    const { data, error } = await supabase.rpc('exec_sql', {
        sql: `SELECT policyname, cmd, qual, with_check 
          FROM pg_policies 
          WHERE tablename = 'users' AND schemaname = 'public'`
    });

    if (error) {
        // RPC might not exist, try direct query via REST
        console.log('RPC not available, checking via Supabase SQL directly...');

        // Just force-apply the policy fix
        const fixSql = `
      DROP POLICY IF EXISTS "users_insert" ON public.users;
      DROP POLICY IF EXISTS "Allow profile insert on registration" ON public.users;
      DROP POLICY IF EXISTS "users_insert_registration" ON public.users;
      
      CREATE POLICY "allow_all_inserts_for_registration" ON public.users
      FOR INSERT
      WITH CHECK (true);
    `;

        console.log('Applying direct fix...');
        console.log('SQL:', fixSql);
        console.log('\nPlease run this SQL in Supabase Dashboard > SQL Editor');

    } else {
        console.log(data);
    }
}

checkPolicies();
