import { z } from 'zod';
import { Json } from '@/types/database.types';
import { resend } from '@/lib/email';
import { getInvitationEmail } from '@/lib/email/templates/invitation';
import { env } from '@/env';
import { router, adminProcedure, protectedProcedure, publicProcedure } from '@/lib/trpc/server';
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
     * Story 2.4.7: Extended member data including position, avatar, isActive
     */
    getMembers: adminProcedure.query(async ({ ctx }) => {
        // Extended user type with new columns from migration 025
        type ExtendedUser = {
            id: string;
            full_name: string | null;
            phone: string | null;
            avatar_url: string | null;
            roles: string[] | null;
            permissions: Json | null;
            created_at: string | null;
            position: string | null;
            is_active: boolean | null;
        };

        // Extended invitation type with new columns from migration 025
        type ExtendedInvitation = {
            id: string;
            email: string;
            name: string | null;
            phone: string | null;
            position: string | null;
            roles: string[] | null;
            status: string;
            created_at: string | null;
            expires_at: string;
        };

        // Get all users in the tenant with extended fields
        const { data: users, error: usersError } = await ctx.supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (usersError) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch team members',
                cause: usersError,
            });
        }

        // Get pending invitations with extended fields
        const { data: invitations, error: invitationsError } = await ctx.supabase
            .from('team_invitations')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (invitationsError) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch invitations',
                cause: invitationsError,
            });
        }

        // Transform to unified list with extended fields
        const members = (users as unknown as ExtendedUser[])?.map(user => ({
            id: user.id,
            name: user.full_name,
            phone: user.phone ?? null,
            position: user.position ?? null,
            avatarUrl: user.avatar_url,
            roles: (user.roles as Role[]) || [],
            permissions: user.permissions as Record<string, unknown> | null,
            isActive: user.is_active ?? true,
            joinedAt: user.created_at,
        })) || [];

        const pendingInvites = (invitations as unknown as ExtendedInvitation[])?.map(inv => ({
            id: inv.id,
            email: inv.email,
            name: inv.name ?? null,
            phone: inv.phone ?? null,
            position: inv.position ?? null,
            roles: (inv.roles as Role[]) || ['admin'],
            invitedAt: inv.created_at,
            expiresAt: inv.expires_at,
        })) || [];

        return {
            members,
            pendingInvites,
            total: members.length + pendingInvites.length,
        };
    }),

    /**
     * Update a team member's profile fields
     * Story 2.4.7: Toggle active/inactive and update profile
     */
    updateMember: adminProcedure
        .input(z.object({
            userId: z.string().uuid(),
            name: z.string().min(1).optional(),
            phone: z.string().optional(),
            position: z.string().optional(),
            avatarUrl: z.string().url().optional().nullable(),
            isActive: z.boolean().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { userId, name, phone, position, avatarUrl, isActive } = input;

            // Build update object with only provided fields
            const updateData: Record<string, unknown> = {
                updated_at: new Date().toISOString(),
            };
            if (name !== undefined) updateData.full_name = name;
            if (phone !== undefined) updateData.phone = phone;
            if (position !== undefined) updateData.position = position;
            if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;
            if (isActive !== undefined) updateData.is_active = isActive;

            const { error } = await ctx.supabase
                .from('users')
                .update(updateData)
                .eq('id', userId);

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to update team member',
                    cause: error,
                });
            }

            return { success: true };
        }),

    /**
     * Get a single team member by ID
     * Story 2.4.5: Team Member Detail View
     */
    getById: adminProcedure
        .input(z.object({
            userId: z.string().uuid(),
        }))
        .query(async ({ ctx, input }) => {
            // Extended user type with new columns from migration 025
            type ExtendedUser = {
                id: string;
                full_name: string | null;
                phone: string | null;
                avatar_url: string | null;
                roles: string[] | null;
                permissions: Json | null;
                created_at: string | null;
                position: string | null;
                is_active: boolean | null;
            };

            const { data, error } = await ctx.supabase
                .from('users')
                .select('*')
                .eq('id', input.userId)
                .single();

            if (error || !data) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Team member not found',
                });
            }

            const user = data as unknown as ExtendedUser;

            return {
                id: user.id,
                name: user.full_name,
                phone: user.phone ?? null,
                position: user.position ?? null,
                avatarUrl: user.avatar_url,
                roles: (user.roles as Role[]) || [],
                permissions: user.permissions as Record<string, Record<string, boolean>> | null,
                isActive: user.is_active ?? true,
                createdAt: user.created_at,
            };
        }),

    /**
     * Update a team member's permissions
     * Story 2.4.5: Permissions tab in detail view
     */
    updatePermissions: adminProcedure
        .input(z.object({
            userId: z.string().uuid(),
            permissions: z.object({
                services: z.object({
                    view: z.boolean().optional(),
                    add: z.boolean().optional(),
                    edit: z.boolean().optional(),
                    delete: z.boolean().optional(),
                }).optional(),
                providers: z.object({
                    view: z.boolean().optional(),
                    add: z.boolean().optional(),
                    edit: z.boolean().optional(),
                    delete: z.boolean().optional(),
                }).optional(),
                bookings: z.object({
                    view: z.boolean().optional(),
                    manage: z.boolean().optional(),
                }).optional(),
                team: z.object({
                    view: z.boolean().optional(),
                    invite: z.boolean().optional(),
                    edit: z.boolean().optional(),
                }).optional(),
                payments: z.object({
                    view: z.boolean().optional(),
                    refund: z.boolean().optional(),
                }).optional(),
                company: z.object({
                    edit: z.boolean().optional(),
                }).optional(),
            }),
        }))
        .mutation(async ({ ctx, input }) => {
            const { userId, permissions } = input;

            // Get existing permissions
            const { data: user, error: fetchError } = await ctx.supabase
                .from('users')
                .select('permissions')
                .eq('id', userId)
                .single();

            if (fetchError) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Team member not found',
                });
            }

            // Merge new permissions with existing
            const existingPermissions = (user?.permissions as Record<string, unknown>) || {};
            const mergedPermissions = {
                ...existingPermissions,
                ...permissions,
            };

            // Update permissions
            const { error } = await ctx.supabase
                .from('users')
                .update({
                    permissions: mergedPermissions as unknown as Json,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', userId);

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to update permissions',
                    cause: error,
                });
            }

            return { success: true, permissions: mergedPermissions };
        }),

    /**
     * Send an invitation to a new team member
     * Story 2.4.6: Simplified invite with name, phone, position
     * v3 flow: admin and team member are the same, default role = ['admin']
     */
    invite: adminProcedure
        .input(z.object({
            email: z.string().email('Invalid email address'),
            name: z.string().min(1, 'Name is required'),
            phone: z.string().optional(),
            position: z.string().optional(),
            roles: z.array(z.enum(validRoles)).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { name, phone, position } = input;
            const email = input.email.toLowerCase();
            // Default to admin if not specified (backward compatibility)
            const roles: Role[] = input.roles || ['admin'];

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

            // Create the invitation with name, phone, position
            const { data: invitation, error } = await ctx.supabase
                .from('team_invitations')
                .insert({
                    tenant_id: ctx.tenantId,
                    email,
                    name,
                    phone: phone ?? null,
                    position: position ?? null,
                    roles,
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

            // Fetch tenant and inviter details for email
            const { data: tenant } = await ctx.supabase
                .from('tenants')
                .select('name')
                .eq('id', ctx.tenantId)
                .single();

            const { data: inviter } = await ctx.supabase
                .from('users')
                .select('full_name')
                .eq('id', ctx.userId)
                .single();

            // Send email with invitation link
            const baseUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const fullInviteUrl = `${baseUrl}/auth/accept-invite?token=${token}`;

            const { subject, html } = getInvitationEmail({
                inviteUrl: fullInviteUrl,
                inviterName: inviter?.full_name || 'An admin',
                organizationName: tenant?.name || 'ScheduleApp',
                role: roles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join('/'),
            });

            // Send via Resend (fire and forget to avoid blocking, or await to catch error?)
            // We await to ensure delivery starts, but catch errors to not fail the transaction
            try {
                if (env.RESEND_API_KEY) {
                    await resend.emails.send({
                        from: 'ScheduleApp <team@shedule.life>',
                        to: email,
                        subject,
                        html,
                    });
                } else {
                    console.log('Skipping email: RESEND_API_KEY not set');
                    console.log('Invite Link:', fullInviteUrl);
                }
            } catch (emailError) {
                console.error('Failed to send invitation email:', emailError);
                // We don't throw - user can use the link or resend
            }

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
                    .from('providers')
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
                            .from('providers')
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
                    .from('providers')
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
                        await ctx.supabase.from('providers').insert({
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
                    .from('providers')
                    .update({ is_active: false })
                    .eq('user_id', userId);
            }

            return { success: true, roles: newRoles };
        }),

    /**
     * Validate an invitation token (PUBLIC - for signup flow)
     * Story 2.4.4: Invitation Acceptance Flow
     */
    validateInvite: publicProcedure
        .input(z.object({
            token: z.string().min(1),
        }))
        .query(async ({ ctx, input }) => {
            const { data: invitation, error } = await ctx.supabase
                .from('team_invitations')
                .select(`
                    id,
                    email,
                    roles,
                    status,
                    expires_at,
                    tenant_id,
                    tenants!inner(name)
                `)
                .eq('token', input.token)
                .eq('status', 'pending')
                .single();

            if (error || !invitation) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Invalid or expired invitation link',
                });
            }

            // Check expiration
            if (new Date(invitation.expires_at) < new Date()) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'This invitation has expired',
                });
            }

            const tenantData = invitation.tenants as unknown as { name: string };

            return {
                valid: true,
                email: invitation.email,
                roles: invitation.roles as Role[],
                tenantName: tenantData?.name || 'Organization',
                tenantId: invitation.tenant_id,
            };
        }),

    /**
     * Accept an invitation and create account (PUBLIC)
     * Story 2.4.4: Invitation Acceptance Flow
     */
    acceptInvite: publicProcedure
        .input(z.object({
            token: z.string().min(1),
            password: z.string().min(8, 'Password must be at least 8 characters'),
            fullName: z.string().min(1, 'Name is required'),
        }))
        .mutation(async ({ ctx, input }) => {
            // First validate the token
            const { data: invitation, error: inviteError } = await ctx.supabase
                .from('team_invitations')
                .select('id, email, roles, status, expires_at, tenant_id')
                .eq('token', input.token)
                .eq('status', 'pending')
                .single();

            if (inviteError || !invitation) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Invalid or expired invitation link',
                });
            }

            if (new Date(invitation.expires_at) < new Date()) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'This invitation has expired',
                });
            }

            // Create user in Supabase Auth
            const { data: authData, error: authError } = await ctx.supabase.auth.signUp({
                email: invitation.email,
                password: input.password,
                options: {
                    data: {
                        full_name: input.fullName,
                        tenant_id: invitation.tenant_id,
                    },
                },
            });

            if (authError || !authData.user) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: authError?.message || 'Failed to create account',
                });
            }

            // Create user record in users table
            const { error: userError } = await ctx.supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    tenant_id: invitation.tenant_id,
                    full_name: input.fullName,
                    roles: invitation.roles,
                    email_verified: true,
                });

            if (userError) {
                console.error('Failed to create user record:', userError);
                // Don't throw - auth user exists, they can still login
            }

            // If user has provider role, create provider profile
            const roles = invitation.roles as Role[];
            if (roles.includes('provider')) {
                await ctx.supabase
                    .from('providers')
                    .insert({
                        user_id: authData.user.id,
                        tenant_id: invitation.tenant_id,
                        name: input.fullName,
                        is_active: true,
                    });
            }

            // Mark invitation as accepted
            await ctx.supabase
                .from('team_invitations')
                .update({ status: 'accepted' })
                .eq('id', invitation.id);

            return {
                success: true,
                message: 'Account created successfully. Please sign in.',
            };
        }),
});

export type TeamRouter = typeof teamRouter;
