'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function logout() {
    const supabase = createClient();
    // Using custom session updates could potentially modify cookies.
    // We use supabase.auth.signOut() which handles removal of cookies.
    await (await supabase).auth.signOut();
    redirect('/login');
}
