import { z } from 'zod';
import { router, adminProcedure, protectedProcedure } from '@/lib/trpc/server';
import { TRPCError } from '@trpc/server';
import crypto from 'crypto';

/**
 * Generate a secure random token for invitations
 */
function generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Team Router
 * Story 2.4: Team Invitations & Member Management
 */
export const teamRouter = router({
    /**
     * Get all team members for the tenant
     * Includes both active users and pending invitations
     */
    getMembers: adminProcedure.query(async ({ ctx }) => {
        // Get all users in the tenant
        const { data: users, error: usersError } = await ctx.supabase
            .from('users')
            .select('id, full_name, email_verified, role, created_at')
            .order('created_at', { ascending: false });

        if (usersError) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch team members',
                cause: usersError,
            });
        }

        // Get pending invitations
        const { data: invitations, error: invitationsError } = await ctx.supabase
            .from('team_invitations')
            .select('id, email, status, created_at, expires_at')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (invitationsError) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch invitations',
                cause: invitationsError,
            });
        }

        // Transform to unified list
        const members = users?.map(user => ({
            id: user.id,
            email: null, // We don't have email in users table, need to get from auth
            name: user.full_name,
            role: user.role,
            status: 'active' as const,
            invitedAt: null,
            joinedAt: user.created_at,
        })) || [];

        const pendingInvites = invitations?.map(inv => ({
            id: inv.id,
            email: inv.email,
            name: null,
            role: 'staff',
            status: 'invited' as const,
            invitedAt: inv.created_at,
            joinedAt: null,
            expiresAt: inv.expires_at,
        })) || [];

        return {
            members,
            pendingInvites,
            total: members.length + pendingInvites.length,
        };
    }),

    /**
     * Send an invitation to a new team member
     */
    invite: adminProcedure
        .input(z.object({
            email: z.string().email('Invalid email address'),
        }))
        .mutation(async ({ ctx, input }) => {
            const { email } = input;

            // Check if user already exists with this email in this tenant
            // (We'd need to check auth.users, but that requires service role)

            // Check if there's already a pending invitation
            const { data: existingInvite } = await ctx.supabase
                .from('team_invitations')
                .select('id')
                .eq('email', email)
                .eq('status', 'pending')
                .single();

            if (existingInvite) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'An invitation has already been sent to this email',
                });
            }

            // Generate invitation token
            const token = generateToken();

            // Create the invitation
            const { data: invitation, error } = await ctx.supabase
                .from('team_invitations')
                .insert({
                    tenant_id: ctx.tenantId,
                    email,
                    token,
                    invited_by: ctx.userId,
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
                })
                .select()
                .single();

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create invitation',
                    cause: error,
                });
            }

            // TODO: Send email with invitation link
            // For now, we'll return the token (in production, this would be emailed)
            const inviteUrl = `/auth/accept-invite?token=${token}`;

            return {
                success: true,
                invitation: {
                    id: invitation.id,
                    email: invitation.email,
                    expiresAt: invitation.expires_at,
                },
                // In production, remove this - just for testing
                inviteUrl,
            };
        }),

    /**
     * Resend an invitation
     */
    resendInvite: adminProcedure
        .input(z.object({
            invitationId: z.string().uuid(),
        }))
        .mutation(async ({ ctx, input }) => {
            // Generate new token and extend expiry
            const token = generateToken();
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

            const { data: invitation, error } = await ctx.supabase
                .from('team_invitations')
                .update({
                    token,
                    expires_at: expiresAt,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', input.invitationId)
                .eq('status', 'pending')
                .select()
                .single();

            if (error || !invitation) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Invitation not found or already accepted',
                });
            }

            // TODO: Resend email
            const inviteUrl = `/auth/accept-invite?token=${token}`;

            return {
                success: true,
                inviteUrl,
            };
        }),

    /**
     * Cancel/revoke a pending invitation
     */
    cancelInvite: adminProcedure
        .input(z.object({
            invitationId: z.string().uuid(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { error } = await ctx.supabase
                .from('team_invitations')
                .delete()
                .eq('id', input.invitationId)
                .eq('status', 'pending');

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to cancel invitation',
                    cause: error,
                });
            }

            return { success: true };
        }),

    /**
     * Verify an invitation token (used during signup)
     */
    verifyToken: protectedProcedure
        .input(z.object({
            token: z.string(),
        }))
        .query(async ({ ctx, input }) => {
            const { data: invitation, error } = await ctx.supabase
                .from('team_invitations')
                .select('id, email, tenant_id, status, expires_at')
                .eq('token', input.token)
                .single();

            if (error || !invitation) {
                return { valid: false, reason: 'Invitation not found' };
            }

            if (invitation.status !== 'pending') {
                return { valid: false, reason: 'Invitation already used' };
            }

            if (new Date(invitation.expires_at) < new Date()) {
                return { valid: false, reason: 'Invitation expired' };
            }

            return {
                valid: true,
                email: invitation.email,
                tenantId: invitation.tenant_id,
            };
        }),

    /**
     * Story 2.5: Promote a team member to Admin role
     */
    promoteToAdmin: adminProcedure
        .input(z.object({
            userId: z.string().uuid(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { error } = await ctx.supabase
                .from('users')
                .update({
                    role: 'admin',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', input.userId);

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to promote user to admin',
                    cause: error,
                });
            }

            return { success: true };
        }),

    /**
     * Story 2.5: Make a team member a Provider
     * Creates a Provider Profile for them
     */
    makeProvider: adminProcedure
        .input(z.object({
            userId: z.string().uuid(),
        }))
        .mutation(async ({ ctx, input }) => {
            // Get user details
            const { data: user, error: userError } = await ctx.supabase
                .from('users')
                .select('id, full_name')
                .eq('id', input.userId)
                .single();

            if (userError || !user) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'User not found',
                });
            }

            // Check if provider already exists
            const { data: existingProvider } = await ctx.supabase
                .from('providers')
                .select('id')
                .eq('user_id', input.userId)
                .single();

            if (existingProvider) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'User is already a provider',
                });
            }

            // Create provider record
            const { data: provider, error: providerError } = await ctx.supabase
                .from('providers')
                .insert({
                    tenant_id: ctx.tenantId,
                    user_id: input.userId,
                    name: user.full_name || 'Provider',
                    is_active: true,
                })
                .select()
                .single();

            if (providerError) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create provider profile',
                    cause: providerError,
                });
            }

            // Update user role to provider
            await ctx.supabase
                .from('users')
                .update({
                    role: 'provider',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', input.userId);

            return { success: true, providerId: provider.id };
        }),
});

export type TeamRouter = typeof teamRouter;
