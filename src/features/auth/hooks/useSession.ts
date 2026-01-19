'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface SessionState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
}

export function useSession() {
    const [state, setState] = useState<SessionState>({
        user: null,
        session: null,
        isLoading: true,
    });
    const supabase = createClient();

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setState({
                user: session?.user ?? null,
                session,
                isLoading: false,
            });
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setState({
                user: session?.user ?? null,
                session,
                isLoading: false,
            });
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    return state;
}
