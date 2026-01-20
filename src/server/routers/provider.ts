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
     * Update provider profile (bio, photo, display name)
     * Per spec: edit Bio, Photo, Display Name
     */
    updateProfile: adminProcedure
        .input(z.object({
            id: z.string().uuid(),
            name: z.string().min(1).max(100).optional(),
            bio: z.string().max(1000).optional(),
            photo_url: z.string().url().nullable().optional(),
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
     * Assign provider to services
     * Per spec: assign them to specific Services
     */
    assignServices: adminProcedure
        .input(z.object({
            providerId: z.string().uuid(),
            serviceIds: z.array(z.string().uuid()),
        }))
        .mutation(async ({ ctx, input }) => {
            const { providerId, serviceIds } = input;

            // First, remove all existing service assignments
            await ctx.supabase
                .from('service_providers')
                .delete()
                .eq('provider_id', providerId);

            // Then, add new assignments
            if (serviceIds.length > 0) {
                const assignments = serviceIds.map(serviceId => ({
                    provider_id: providerId,
                    service_id: serviceId,
                    tenant_id: ctx.tenantId,
                }));

                const { error } = await ctx.supabase
                    .from('service_providers')
                    .insert(assignments);

                if (error) {
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to assign services',
                        cause: error,
                    });
                }
            }

            return { success: true };
        }),

    /**
     * Get providers assigned to a specific service
     */
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
