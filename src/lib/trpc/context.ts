import { createClient } from '@/lib/supabase/server';
import type { User, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * tRPC Context
 * 
 * Contains user authentication info and roles for access control.
 * Passed to all tRPC procedures.
 */
export interface Context {
    supabase: SupabaseClient<Database>;
    user: User | null;
    userId: string | null;
    tenantId: string | null;
    roles: ('admin' | 'provider' | 'client')[];
}

/**
 * Creates tRPC context with authenticated user info
 */
export async function createContext(): Promise<Context> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { supabase, user: null, userId: null, tenantId: null, roles: [] };
    }

    // Get user profile with tenant and roles
    const { data: profile } = await supabase
        .from('users')
        .select('tenant_id, roles')
        .eq('id', user.id)
        .single();

    return {
        supabase,
        user,
        userId: user.id,
        tenantId: profile?.tenant_id || null,
        roles: (profile?.roles as ('admin' | 'provider' | 'client')[]) || ['client'],
    };
}

// Legacy export for compatibility
export type TRPCContext = Context;

