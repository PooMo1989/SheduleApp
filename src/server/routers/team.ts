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
 * Valid roles for team members
 */
const validRoles = ['admin', 'provider', 'client'] as const;
type Role = typeof validRoles[number];

/**
 * Team Router
 * Story 2.4: Team Invitations & Member Management
 * Story 2.4.1: Multi-Role Support
 */
export const teamRouter = router({
    /**
     * Get all team members for the tenant
     * Includes both active users and pending invitations
     */
    getMembers: adminProcedure.query(async ({ ctx }) => {
        // Get all users in the tenant (except clients)
        const { data: users, error: usersError } = await ctx.supabase
            .from('users')
            .select('id, full_name, email_verified, roles, created_at')
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
            .select('id, email, roles, status, created_at, expires_at')
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
            email: null, // Need auth.users for email
            name: user.full_name,
            roles: user.roles as Role[],
            status: 'active' as const,
            invitedAt: null,
            joinedAt: user.created_at,
        })) || [];

        const pendingInvites = invitations?.map(inv => ({
            id: inv.id,
            email: inv.email,
            name: null,
            roles: (inv.roles as Role[]) || ['provider'],
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
     * Supports multiple roles
     */
    invite: adminProcedure
        .input(z.object({
            email: z.string().email('Invalid email address'),
            roles: z.array(z.enum(validRoles)).min(1, 'At least one role required'),
        }))
        .mutation(async ({ ctx, input }) => {
            const { email, roles } = input;

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

            // Create the invitation with roles
            const { data: invitation, error } = await ctx.supabase
                .from('team_invitations')
                .insert({
                    tenant_id: ctx.tenantId,
                    email,
                    roles, // Store roles array
                    token,
                    invited_by: ctx.userId,
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
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
            const inviteUrl = `/auth/accept-invite?token=${token}`;

            return {
                success: true,
                invitation: {
                    id: invitation.id,
                    email: invitation.email,
                    roles: invitation.roles,
                    expiresAt: invitation.expires_at,
                },
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
                .select('id, email, tenant_id, roles, status, expires_at')
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
                roles: invitation.roles as Role[],
            };
        }),

    /**
     * Update a user's roles
     * Can add or remove roles
     */
    updateRoles: adminProcedure
        .input(z.object({
            userId: z.string().uuid(),
            roles: z.array(z.enum(validRoles)).min(1, 'User must have at least one role'),
        }))
        .mutation(async ({ ctx, input }) => {
            const { userId, roles } = input;

            // Can't modify your own roles
            if (userId === ctx.userId) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Cannot modify your own roles',
                });
            }

            // Update user roles
            const { error } = await ctx.supabase
                .from('users')
                .update({
                    roles,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', userId);

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to update user roles',
                    cause: error,
                });
            }

            // If adding 'provider' role, create provider_profile if not exists
            if (roles.includes('provider')) {
                const { data: existingProfile } = await ctx.supabase
                    .from('provider_profiles')
                    .select('user_id')
                    .eq('user_id', userId)
                    .single();

                if (!existingProfile) {
                    // Get user info for profile
                    const { data: user } = await ctx.supabase
                        .from('users')
                        .select('full_name, tenant_id')
                        .eq('id', userId)
                        .single();

                    if (user) {
                        await ctx.supabase
                            .from('provider_profiles')
                            .insert({
                                user_id: userId,
                                tenant_id: user.tenant_id,
                                name: user.full_name || 'Provider',
                                is_active: true,
                            });
                    }
                }
            }

            return { success: true, roles };
        }),

    /**
     * Add a role to a user
     */
    addRole: adminProcedure
        .input(z.object({
            userId: z.string().uuid(),
            role: z.enum(validRoles),
        }))
        .mutation(async ({ ctx, input }) => {
            const { userId, role } = input;

            // Get current roles
            const { data: user, error: userError } = await ctx.supabase
                .from('users')
                .select('roles')
                .eq('id', userId)
                .single();

            if (userError || !user) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'User not found',
                });
            }

            const currentRoles = (user.roles as Role[]) || [];
            if (currentRoles.includes(role)) {
                return { success: true, roles: currentRoles }; // Already has role
            }

            const newRoles = [...currentRoles, role];

            // Update using updateRoles logic
            const { error } = await ctx.supabase
                .from('users')
                .update({
                    roles: newRoles,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', userId);

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to add role',
                    cause: error,
                });
            }

            // Create provider profile if adding provider role
            if (role === 'provider') {
                const { data: existingProfile } = await ctx.supabase
                    .from('provider_profiles')
                    .select('user_id')
                    .eq('user_id', userId)
                    .single();

                if (!existingProfile) {
                    const { data: userData } = await ctx.supabase
                        .from('users')
                        .select('full_name, tenant_id')
                        .eq('id', userId)
                        .single();

                    if (userData) {
                        await ctx.supabase.from('provider_profiles').insert({
                            user_id: userId,
                            tenant_id: userData.tenant_id,
                            name: userData.full_name || 'Provider',
                            is_active: true,
                        });
                    }
                }
            }

            return { success: true, roles: newRoles };
        }),

    /**
     * Remove a role from a user
     */
    removeRole: adminProcedure
        .input(z.object({
            userId: z.string().uuid(),
            role: z.enum(validRoles),
        }))
        .mutation(async ({ ctx, input }) => {
            const { userId, role } = input;

            // Can't modify your own roles
            if (userId === ctx.userId) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Cannot modify your own roles',
                });
            }

            // Get current roles
            const { data: user, error: userError } = await ctx.supabase
                .from('users')
                .select('roles')
                .eq('id', userId)
                .single();

            if (userError || !user) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'User not found',
                });
            }

            const currentRoles = (user.roles as Role[]) || [];
            const newRoles = currentRoles.filter(r => r !== role);

            if (newRoles.length === 0) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'User must have at least one role',
                });
            }

            const { error } = await ctx.supabase
                .from('users')
                .update({
                    roles: newRoles,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', userId);

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to remove role',
                    cause: error,
                });
            }

            // If removing provider role, deactivate provider profile
            if (role === 'provider') {
                await ctx.supabase
                    .from('provider_profiles')
                    .update({ is_active: false })
                    .eq('user_id', userId);
            }

            return { success: true, roles: newRoles };
        }),
});

export type TeamRouter = typeof teamRouter;
