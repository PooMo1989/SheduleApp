import { z } from 'zod';
import { router, adminProcedure, protectedProcedure } from '@/lib/trpc/server';
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
                        tenant_id: ctx.tenantId,
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
});

export type ProviderRouter = typeof providerRouter;
