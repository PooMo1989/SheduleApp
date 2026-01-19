/**
 * Supabase Client Exports
 * 
 * This module provides access to Supabase clients for different contexts:
 * 
 * - **Browser (Client Components):** Use `createClient` from './client'
 * - **Server (Server Components, API Routes, tRPC):** Use `createClient` from './server'
 * - **Middleware:** Use `updateSession` from './middleware'
 * 
 * @example
 * // Server Component or tRPC procedure
 * import { createClient } from '@/lib/supabase/server';
 * const supabase = await createClient();
 * 
 * // Client Component
 * 'use client';
 * import { createClient } from '@/lib/supabase/client';
 * const supabase = createClient();
 */

// Re-export from submodules for convenient access
export { createClient as createBrowserClient } from './client';
export { createClient as createServerClient } from './server';
export { updateSession } from './middleware';
