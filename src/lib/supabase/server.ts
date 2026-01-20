import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/env';

/**
 * Supabase Server Client
 * 
 * Use this client in:
 * - Server Components
 * - API Routes
 * - tRPC procedures
 * - Server Actions
 * 
 * @example
 * import { createClient } from '@/lib/supabase/server';
 * 
 * async function MyServerComponent() {
 *   const supabase = await createClient();
 *   const { data } = await supabase.from('table').select();
 * }
 */
export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Called from Server Component - cookies can't be set
                        // This is expected in Server Components
                    }
                },
            },
        }
    );
}

