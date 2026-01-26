import { z } from 'zod';
import { router, adminProcedure, protectedProcedure, providerProcedure } from '@/lib/trpc/server';
import { TRPCError } from '@trpc/server';

/**
 * Provider Router
 * Story 2.5: Role Assignment & Provider Linking
 */
export const providerRouter = router({
    /**
     * Get all providers for the tenant
     */
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const { data, error } = await ctx.supabase
            .from('providers')
            .select(`
                *,
                services:service_providers(
                    service:services(id, name)
                )
            `)
            .order('name', { ascending: true });

        if (error) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch providers',
                cause: error,
            });
        }

        return data;
    }),

    /**
     * Get a single provider by ID
     */
    getById: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            const { data, error } = await ctx.supabase
                .from('providers')
                .select(`
                    *,
                    services:service_providers(
                        service:services(id, name)
                    )
                `)
                .eq('id', input.id)
                .single();

            if (error || !data) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Provider not found',
                });
            }

            return data;
        }),

    /**
     * Update provider profile (bio, photo, display name, etc)
     */
    update: adminProcedure
        .input(z.object({
            id: z.string().uuid(),
            name: z.string().min(1).max(100).optional(),
            bio: z.string().max(1000).optional(),
            phone: z.string().optional(),
            photo_url: z.string().url().nullable().optional(),
            specialization: z.string().optional(),
            schedule_autonomy: z.enum(['self_managed', 'approval_required']).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { id, ...updateData } = input;

            const { data, error } = await ctx.supabase
                .from('providers')
                .update({
                    ...updateData,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to update provider',
                    cause: error,
                });
            }

            return { success: true, provider: data };
        }),

    /**
     * Get services assigned to a provider
     */
    getAssignedServices: protectedProcedure
        .input(z.object({ providerId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            const { data, error } = await ctx.supabase
                .from('service_providers')
                .select(`
                    service:services(id, name, duration_minutes, price, description)
                `)
                .eq('provider_id', input.providerId);

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch assigned services',
                    cause: error,
                });
            }

            // Flatten the response to return Service objects
            // Supabase returns { service: { ... } }
            return data?.map((item: any) => item.service) || [];
        }),

    /**
     * Update single service assignment (toggle)
     */
    updateServiceAssignment: adminProcedure
        .input(z.object({
            providerId: z.string().uuid(),
            serviceId: z.string().uuid(),
            assigned: z.boolean(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { providerId, serviceId, assigned } = input;

            if (assigned) {
                // Insert if not exists
                const { error } = await ctx.supabase
                    .from('service_providers')
                    .upsert({
                        provider_id: providerId,
                        service_id: serviceId,
                    }, { onConflict: 'provider_id,service_id' }); // Assuming composite key/unique constraint exists

                // If onConflict fails because constraints aren't set up for unique (provider, service), 
                // we should check existence first or use insert with ignore.
                // Standard setup usually has unique constraint.

                if (error) {
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to assign service',
                        cause: error,
                    });
                }
            } else {
                // Delete
                const { error } = await ctx.supabase
                    .from('service_providers')
                    .delete()
                    .eq('provider_id', providerId)
                    .eq('service_id', serviceId);

                if (error) {
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to unassign service',
                        cause: error,
                    });
                }
            }

            return { success: true };
        }),

    // Legacy method maintained if needed, or removed.
    // keeping getByService for reverse lookup if needed elsewhere.
    // Legacy method maintained if needed, or removed.
    // keeping getByService for reverse lookup if needed elsewhere.
    getByService: protectedProcedure
        .input(z.object({ serviceId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            const { data, error } = await ctx.supabase
                .from('service_providers')
                .select(`
                    provider:providers(id, name, email, photo_url, bio)
                `)
                .eq('service_id', input.serviceId);

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch providers',
                    cause: error,
                });
            }

            return data?.map(sp => sp.provider).filter(Boolean) || [];
        }),

    /**
     * Update current user's provider profile
     */
    updateOwn: providerProcedure
        .input(z.object({
            name: z.string().min(1).max(100).optional(),
            bio: z.string().max(1000).optional(),
            phone: z.string().optional(),
            photo_url: z.string().url().nullable().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            // Providers can only update the provider record linked to their user_id
            const { data, error } = await ctx.supabase
                .from('providers')
                .update({
                    ...input,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', ctx.user.id)
                .select()
                .single();

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to update profile',
                    cause: error,
                });
            }

            return { success: true, provider: data };
        }),

    /**
     * Get current user's provider profile
     */
    getMine: providerProcedure.query(async ({ ctx }) => {
        const { data, error } = await ctx.supabase
            .from('providers')
            .select(`
                *,
                services:service_providers(
                    service:services(id, name)
                )
            `)
            .eq('user_id', ctx.user.id)
            .single();

        if (error || !data) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Provider profile not found',
                cause: error
            });
        }

        return data;
    }),

    /**
     * Google Calendar Integration
     * ---------------------------
     */

    /**
     * Get Google OAuth Authorization URL
     */
    getGoogleAuthUrl: protectedProcedure
        .input(z.object({ providerId: z.string().uuid() }))
        .query(async ({ input }) => {
            const { getAuthUrl } = await import('@/lib/google/auth');
            return { url: getAuthUrl(input.providerId) };
        }),

    /**
     * Get Calendar Connection Status
     */
    getCalendarStatus: protectedProcedure
        .input(z.object({ providerId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            const { data, error } = await ctx.supabase
                .from('provider_calendars')
                .select('google_calendar_id, sync_enabled, last_synced_at')
                .eq('provider_id', input.providerId)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "No Data" (Row not found)
                console.error('Error fetching calendar status:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch calendar status',
                });
            }

            return {
                isConnected: !!data,
                calendarEmail: data?.google_calendar_id || null,
                syncEnabled: data?.sync_enabled || false,
                lastSyncedAt: data?.last_synced_at || null,
            };
        }),

    /**
     * Disconnect Google Calendar (Revoke Access)
     */
    disconnectCalendar: adminProcedure
        .input(z.object({ providerId: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            // 1. Delete from DB
            const { error } = await ctx.supabase
                .from('provider_calendars')
                .delete()
                .eq('provider_id', input.providerId);

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to disconnect calendar',
                    cause: error,
                });
            }

            // TODO: Ideally we should also revoke the token via Google API here
            // to be thorough, but deleting it from our DB effectively stops access.

            return { success: true };
        }),
});

export type ProviderRouter = typeof providerRouter;
