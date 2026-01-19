
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
    // Use a truly random valid-looking gmail address
    const email = `poorna.test.${Date.now()}@gmail.com`;
    const password = 'TestPassword123!';

    console.log(`Attempting signup with: ${email}`);
    console.log(`Project URL: ${supabaseUrl}`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'Debug User',
                phone: '+1234567890'
            }
        }
    });

    if (error) {
        console.error('Signup Error:', error);
        return;
    }

    console.log('Signup Successful!');
    console.log('User ID:', data.user?.id);

    if (data.session) {
        console.log('✅ SESSION ESTABLISHED.');
        console.log('This means Email Confirmation is OFF.');
    } else {
        console.log('❌ NO SESSION RETURNED.');
        console.log('This means Email Confirmation is ON (or Rate Limited).');
    }
}

testSignup();
