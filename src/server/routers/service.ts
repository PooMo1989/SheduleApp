import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '@/lib/trpc/server';
import { TRPCError } from '@trpc/server';

/**
 * Zod schemas for service validation
 * Per Story 2.3: name, description, duration, price, category, service_type
 */
const createServiceSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    description: z.string().max(1000).optional(),
    duration_minutes: z.number().min(5, 'Duration must be at least 5 minutes').max(480),
    price: z.number().min(0, 'Price cannot be negative'),
    category_id: z.string().uuid().nullable().optional(),
    service_type: z.enum(['consultation', 'class']).default('consultation'),
});

const updateServiceSchema = createServiceSchema.partial().extend({
    id: z.string().uuid(),
});

/**
 * Service Router
 * Handles service CRUD operations per Story 2.3
 */
export const serviceRouter = router({
    /**
     * Get all services for the tenant
     */
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const { data, error } = await ctx.supabase
            .from('services')
            .select(`
                *,
                category:categories(id, name, slug)
            `)
            .order('name', { ascending: true });

        if (error) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch services',
                cause: error,
            });
        }

        return data;
    }),

    /**
     * Get a single service by ID
     */
    getById: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            const { data, error } = await ctx.supabase
                .from('services')
                .select(`
                    *,
                    category:categories(id, name, slug),
                    providers:service_providers(
                        provider:providers(id, name, email, photo_url)
                    )
                `)
                .eq('id', input.id)
                .single();

            if (error || !data) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Service not found',
                });
            }

            return data;
        }),

    /**
     * Create a new service (admin only)
     */
    create: adminProcedure
        .input(createServiceSchema)
        .mutation(async ({ ctx, input }) => {
            const { data, error } = await ctx.supabase
                .from('services')
                .insert({
                    ...input,
                    tenant_id: ctx.tenantId,
                })
                .select()
                .single();

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create service',
                    cause: error,
                });
            }

            return { success: true, service: data };
        }),

    /**
     * Update a service (admin only)
     */
    update: adminProcedure
        .input(updateServiceSchema)
        .mutation(async ({ ctx, input }) => {
            const { id, ...updateData } = input;

            const { data, error } = await ctx.supabase
                .from('services')
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
                    message: 'Failed to update service',
                    cause: error,
                });
            }

            return { success: true, service: data };
        }),

    /**
     * Delete a service (admin only)
     * Per spec: soft-deleted or removed if no bookings
     */
    delete: adminProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            // Soft delete by setting is_active = false
            const { error } = await ctx.supabase
                .from('services')
                .update({ is_active: false, updated_at: new Date().toISOString() })
                .eq('id', input.id);

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to delete service',
                    cause: error,
                });
            }

            return { success: true };
        }),
});

/**
 * Category Router
 * For organizing services
 */
export const categoryRouter = router({
    /**
     * Get all categories for the tenant
     */
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const { data, error } = await ctx.supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('name', { ascending: true });

        if (error) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch categories',
                cause: error,
            });
        }

        return data;
    }),

    /**
     * Create a category (admin only)
     */
    create: adminProcedure
        .input(z.object({
            name: z.string().min(1).max(50),
            slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
            description: z.string().max(200).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { data, error } = await ctx.supabase
                .from('categories')
                .insert({
                    ...input,
                    tenant_id: ctx.tenantId,
                })
                .select()
                .single();

            if (error) {
                if (error.code === '23505') {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'A category with this slug already exists',
                    });
                }
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create category',
                    cause: error,
                });
            }

            return { success: true, category: data };
        }),
});

export type ServiceRouter = typeof serviceRouter;
export type CategoryRouter = typeof categoryRouter;
