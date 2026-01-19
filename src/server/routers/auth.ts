import { router, publicProcedure } from '@/lib/trpc/server';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createClient } from '@/lib/supabase/server';
import { registerSchema } from '@/features/auth/schemas/register';

// Default tenant ID for MVP - in production, resolve from URL/subdomain
const DEFAULT_TENANT_ID = 'a0000000-0000-0000-0000-000000000001';

/**
 * Auth Router
 * Handles user registration, login, and authentication-related procedures
 */
export const authRouter = router({
    /**
     * Register a new user with email/password
     * Creates auth user and corresponding users table record
     */
    register: publicProcedure
        .input(registerSchema.extend({
            tenantId: z.string().uuid().optional(),
        }))
        .mutation(async ({ input }) => {
            const supabase = await createClient();

            // Get tenant_id - use provided or default (MVP)
            const tenantId = input.tenantId || DEFAULT_TENANT_ID;

            // 1. Verify tenant exists
            const { data: tenant, error: tenantError } = await supabase
                .from('tenants')
                .select('id')
                .eq('id', tenantId)
                .single();

            if (tenantError || !tenant) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Invalid tenant',
                });
            }

            // 2. Create auth user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: input.email,
                password: input.password,
                options: {
                    data: {
                        full_name: input.fullName,
                        phone: input.phone,
                    },
                },
            });

            if (authError) {
                // Handle duplicate email
                if (authError.message.includes('already registered') ||
                    authError.message.includes('already exists')) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'Email already registered',
                    });
                }
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: authError.message,
                });
            }

            if (!authData.user) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create user',
                });
            }

            // 3. Create user profile in users table
            // Note: We need to use the service role for this to bypass RLS
            // For MVP, we'll use admin client or disable RLS temporarily for inserts
            const { error: profileError } = await supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    tenant_id: tenantId,
                    role: 'client',
                    full_name: input.fullName || null,
                    phone: input.phone,
                });

            if (profileError) {
                console.error('Profile creation failed:', profileError);
                // In a production system, we would rollback the auth user here
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create user profile. Please try again.',
                });
            }

            return {
                success: true,
                userId: authData.user.id,
                message: 'Account created successfully! Please check your email to verify your account.',
            };
        }),

    /**
     * Get current user session
     */
    getSession: publicProcedure.query(async () => {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return { user: null };
        }

        // Get user profile
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        return {
            user: {
                id: user.id,
                email: user.email,
                ...profile,
            },
        };
    }),
});
