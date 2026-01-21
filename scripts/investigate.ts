import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function investigate() {
    console.log('=== DATABASE STATE INVESTIGATION ===\n');

    // 1. Auth users
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    console.log('1. AUTH USERS:');
    if (authUsers?.users.length) {
        authUsers.users.forEach(u => {
            console.log(`   - ${u.email} (id: ${u.id})`);
            console.log(`     created: ${u.created_at}`);
        });
    } else {
        console.log('   NONE');
    }

    // 2. Tenants
    const { data: tenants } = await supabase.from('tenants').select('*');
    console.log('\n2. TENANTS:');
    if (tenants?.length) {
        tenants.forEach(t => console.log(`   - ${t.name} (slug: ${t.slug}, id: ${t.id})`));
    } else {
        console.log('   NONE');
    }

    // 3. User profiles
    const { data: profiles } = await supabase.from('users').select('*');
    console.log('\n3. USER PROFILES:');
    if (profiles?.length) {
        profiles.forEach(p => console.log(`   - id: ${p.id}, role: ${p.role}, tenant: ${p.tenant_id}`));
    } else {
        console.log('   NONE');
    }

    // 4. Check if trigger exists
    const { data: triggers } = await supabase.rpc('check_trigger_exists').catch(() => ({ data: null }));

    console.log('\n=== DIAGNOSIS ===');

    if (authUsers?.users.length && !profiles?.length) {
        console.log('PROBLEM: Auth user exists but NO user profile!');
        console.log('CAUSE: The database trigger either:');
        console.log('  a) Was not created (SQL not run)');
        console.log('  b) Failed silently');
        console.log('  c) User was created before trigger existed');
    } else if (profiles?.length) {
        const profile = profiles[0];
        console.log(`User profile exists with role: "${profile.role}"`);
        if (profile.role === 'admin') {
            console.log('PROBLEM: Role is admin but still seeing client dashboard');
            console.log('CAUSE: Either:');
            console.log('  a) Vercel deployment not updated');
            console.log('  b) Login redirect code issue');
            console.log('  c) Browser cache');
        } else {
            console.log(`PROBLEM: Role is "${profile.role}", not "admin"`);
        }
    }
}

investigate();
