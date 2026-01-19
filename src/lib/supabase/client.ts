import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase Browser Client
 * 
 * Use this client in Client Components ('use client').
 * For Server Components, use the server client from './server.ts'.
 * 
 * @example
 * 'use client';
 * import { createClient } from '@/lib/supabase/client';
 * 
 * function MyComponent() {
 *   const supabase = createClient();
 *   // Use supabase client...
 * }
 */
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}
