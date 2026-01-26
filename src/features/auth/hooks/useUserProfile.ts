'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types';

interface UserProfile {
    id: string;
    tenantId: string | null;
    roles: UserRole[];
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
}

interface UserProfileState {
    profile: UserProfile | null;
    isLoading: boolean;
    error: string | null;
}

/**
 * Hook to fetch the current user's profile including roles
 *
 * Used by layout shells to determine navigation visibility
 * based on user roles (admin, provider, etc.)
 */
export function useUserProfile() {
    const [state, setState] = useState<UserProfileState>({
        profile: null,
        isLoading: true,
        error: null,
    });
    const supabase = createClient();

    useEffect(() => {
        async function fetchProfile() {
            try {
                // Get current user
                const {
                    data: { user },
                    error: authError,
                } = await supabase.auth.getUser();

                if (authError || !user) {
                    setState({ profile: null, isLoading: false, error: null });
                    return;
                }

                // Fetch user profile with roles
                const { data: profile, error: profileError } = await supabase
                    .from('users')
                    .select('id, tenant_id, roles, name, email, avatar_url')
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    setState({
                        profile: null,
                        isLoading: false,
                        error: profileError.message,
                    });
                    return;
                }

                setState({
                    profile: {
                        id: profile.id,
                        tenantId: profile.tenant_id,
                        roles: (profile.roles as UserRole[]) || ['client'],
                        name: profile.name,
                        email: profile.email,
                        avatarUrl: profile.avatar_url,
                    },
                    isLoading: false,
                    error: null,
                });
            } catch (err) {
                setState({
                    profile: null,
                    isLoading: false,
                    error: err instanceof Error ? err.message : 'Failed to fetch profile',
                });
            }
        }

        fetchProfile();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(() => {
            fetchProfile();
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    return state;
}
