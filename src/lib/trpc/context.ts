import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

/**
 * tRPC Context
 * 
 * Contains user authentication info and role for access control.
 * Passed to all tRPC procedures.
 */
export interface Context {
    user: User | null;
    userId: string | null;
    tenantId: string | null;
    role: 'admin' | 'provider' | 'client' | null;
}

/**
 * Creates tRPC context with authenticated user info
 */
export async function createContext(): Promise<Context> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { user: null, userId: null, tenantId: null, role: null };
    }

    // Get user profile with tenant and role
    const { data: profile } = await supabase
        .from('users')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single();

    return {
        user,
        userId: user.id,
        tenantId: profile?.tenant_id || null,
        role: (profile?.role as 'admin' | 'provider' | 'client') || 'client',
    };
}

// Legacy export for compatibility
export type TRPCContext = Context;
