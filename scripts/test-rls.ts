import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Use ANON key to simulate what browser client sees (RLS restricted)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!  // ANON key, not service key
);

async function testInsert() {
    console.log('Testing ANON key tenant insert (simulates browser)...');

    const { data, error } = await supabase
        .from('tenants')
        .insert({
            name: 'Test Company',
            slug: 'test-slug-' + Date.now(),
            settings: {},
        })
        .select('id')
        .single();

    if (error) {
        console.error('INSERT FAILED:', error.code, error.message);
        console.error('This means RLS is blocking the insert!');
    } else {
        console.log('INSERT SUCCESS:', data);
        // Clean up
        await supabase.from('tenants').delete().eq('id', data.id);
        console.log('Cleaned up test tenant.');
    }
}

testInsert();
