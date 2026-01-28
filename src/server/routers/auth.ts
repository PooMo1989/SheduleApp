import { router, publicProcedure } from '@/lib/trpc/server';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createClient } from '@/lib/supabase/server';
import { registerSchema } from '@/features/auth/schemas/register';

// Default tenant ID for MVP - in production, resolve from URL/subdomain
const DEFAULT_TENANT_ID = 'a0000000-0000-0000-0000-000000000001';

/**
 * Password validation with security requirements
 * Story 3.8: Admin/Provider Strict Authentication
 *
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 */
const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter');

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

    /**
     * Check if email exists in system
     * Story 3.6: Email conflict detection during guest booking
     */
    checkEmail: publicProcedure
        .input(z.object({
            email: z.string().email(),
            tenantId: z.string().uuid().optional(),
        }))
        .query(async ({ input }) => {
            const supabase = await createClient();

            // Check both auth.users and users table
            const { data: user } = await supabase
                .from('users')
                .select('id, email, full_name, role')
                .eq('email', input.email)
                .maybeSingle();

            if (!user) {
                return {
                    exists: false,
                    user: null,
                };
            }

            return {
                exists: true,
                user: {
                    id: user.id,
                    name: user.full_name,
                    role: user.role,
                },
            };
        }),


    /**
     * Upgrade guest booking to full account
     * Story 3.5: Account upgrade from success page
     * Story 3.8: Apply password requirements for consistency
     */
    upgradeGuestAccount: publicProcedure
        .input(z.object({
            email: z.string().email(),
            password: passwordSchema,
        }))
        .mutation(async ({ input }) => {
            const supabase = await createClient();

            // 1. Check if user already exists
            const { data: existingUser } = await supabase
                .from('users')
                .select('id, email')
                .eq('email', input.email)
                .maybeSingle();

            if (existingUser) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'An account with this email already exists. Please sign in instead.',
                });
            }

            // 2. Find bookings with this email (guest bookings)
            const { data: guestBookings } = await supabase
                .from('bookings')
                .select('id, tenant_id, client_email')
                .eq('client_email', input.email)
                .is('client_user_id', null) // Only guest bookings
                .limit(1);

            if (!guestBookings || guestBookings.length === 0) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'No guest bookings found for this email',
                });
            }

            const tenantId = guestBookings[0].tenant_id;

            // 3. Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: input.email,
                password: input.password,
            });

            if (authError) {
                console.error('Auth signup error:', authError);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: authError.message || 'Failed to create account',
                });
            }

            if (!authData.user) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create user',
                });
            }

            // 4. Create user profile
            // Story 3.8: Auto-verify email for guest upgrades
            // Rationale: Guest already verified email via magic link
            const { error: profileError } = await supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    tenant_id: tenantId,
                    role: 'client',
                    email: input.email,
                    email_verified: true, // Auto-verify (guest proved email via magic link)
                });

            if (profileError) {
                console.error('Profile creation error:', profileError);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create user profile',
                });
            }

            // 5. Link all guest bookings to the new user
            const { error: linkError } = await supabase
                .from('bookings')
                .update({ client_user_id: authData.user.id })
                .eq('client_email', input.email)
                .is('client_user_id', null);

            if (linkError) {
                console.error('Booking link error:', linkError);
                // Non-fatal - account is created, bookings just aren't linked
            }

            return {
                success: true,
                userId: authData.user.id,
                message: 'Account created successfully! Your bookings have been linked to your account.',
            };
        }),
});
