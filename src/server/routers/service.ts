import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '@/lib/trpc/server';
import { TRPCError } from '@trpc/server';

/**
 * Zod schemas for service validation
 * Story 2.3.1: Service Setup Tabbed Portal - Extended fields
 */

// Tab 1: Basics & Settings
const serviceBasicsSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    description: z.string().max(2000).nullable().optional(),
    category_id: z.string().uuid().nullable().optional(),
    service_type: z.enum(['consultation', 'class']).default('consultation'),
    duration_minutes: z.number().min(5, 'Duration must be at least 5 minutes').max(480),
    buffer_before: z.number().min(0).max(120).default(0),
    buffer_after: z.number().min(0).max(120).default(0),
    pricing_type: z.enum(['free', 'fixed', 'variable', 'starting_from']).default('fixed'),
    price: z.number().min(0, 'Price cannot be negative').default(0),
    currency: z.string().length(3).default('LKR'),
    location_type: z.enum(['in_person', 'virtual', 'both']).default('in_person'),
    virtual_meeting_url: z.string().url().nullable().optional(),
    max_attendees: z.number().min(1).max(100).default(1),
    min_notice_hours: z.number().min(0).max(720).default(24),
    max_future_days: z.number().min(1).max(365).default(60),
    cancellation_hours: z.number().min(0).max(168).default(24),
    auto_confirm: z.boolean().default(true),
    visibility: z.enum(['public', 'private']).default('public'),
    // Pay Later (Story 3.4.1)
    pay_later_enabled: z.boolean().nullable().optional(),
    pay_later_mode: z.enum(['auto_confirm', 'pending_approval']).nullable().optional(),
});

// Tab 3: Booking Page Configuration
const serviceBookingPageSchema = z.object({
    custom_url_slug: z.string().regex(/^[a-z0-9-]*$/, 'Only lowercase letters, numbers, and hyphens').max(50).nullable().optional(),
    show_price: z.boolean().default(true),
    show_duration: z.boolean().default(true),
    require_account: z.boolean().default(false),
    confirmation_message: z.string().max(1000).nullable().optional(),
    redirect_url: z.string().url().nullable().optional(),
});

// Combined create schema
const createServiceSchema = serviceBasicsSchema.merge(serviceBookingPageSchema);

// Update schema (partial)
const updateServiceSchema = createServiceSchema.partial().extend({
    id: z.string().uuid(),
});

// Service schedule schema (Tab 2)
const serviceScheduleSchema = z.object({
    service_id: z.string().uuid(),
    schedules: z.array(z.object({
        day_of_week: z.number().min(0).max(6),
        start_time: z.string().regex(/^\d{2}:\d{2}$/),
        end_time: z.string().regex(/^\d{2}:\d{2}$/),
        is_available: z.boolean().default(true),
    })),
});

/**
 * Service Router
 * Story 2.3.1: Service Setup Tabbed Portal
 * Story 3.4.1: Pay Later Mode Configuration
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
            .eq('is_active', true)
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
     * Get a single service by ID with all extended fields
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

            // Type assertion for extended fields
            type ExtendedService = typeof data & {
                pricing_type?: string | null;
                location_type?: string | null;
                virtual_meeting_url?: string | null;
                buffer_before?: number | null;
                buffer_after?: number | null;
                min_notice_hours?: number | null;
                max_future_days?: number | null;
                cancellation_hours?: number | null;
                auto_confirm?: boolean | null;
                visibility?: string | null;
                pay_later_enabled?: boolean | null;
                pay_later_mode?: string | null;
                max_attendees?: number | null;
                custom_url_slug?: string | null;
                show_price?: boolean | null;
                show_duration?: boolean | null;
                require_account?: boolean | null;
                confirmation_message?: string | null;
                redirect_url?: string | null;
            };

            const extendedData = data as ExtendedService;

            return {
                ...data,
                // Extended fields with defaults
                pricing_type: extendedData.pricing_type ?? 'fixed',
                location_type: extendedData.location_type ?? 'in_person',
                virtual_meeting_url: extendedData.virtual_meeting_url ?? null,
                buffer_before: extendedData.buffer_before ?? 0,
                buffer_after: extendedData.buffer_after ?? 0,
                min_notice_hours: extendedData.min_notice_hours ?? 24,
                max_future_days: extendedData.max_future_days ?? 60,
                cancellation_hours: extendedData.cancellation_hours ?? 24,
                auto_confirm: extendedData.auto_confirm ?? true,
                visibility: extendedData.visibility ?? 'public',
                pay_later_enabled: extendedData.pay_later_enabled ?? null,
                pay_later_mode: extendedData.pay_later_mode ?? null,
                max_attendees: extendedData.max_attendees ?? 1,
                custom_url_slug: extendedData.custom_url_slug ?? null,
                show_price: extendedData.show_price ?? true,
                show_duration: extendedData.show_duration ?? true,
                require_account: extendedData.require_account ?? false,
                confirmation_message: extendedData.confirmation_message ?? null,
                redirect_url: extendedData.redirect_url ?? null,
            };
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
                if (error.code === '23505' && error.message.includes('custom_slug')) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'This URL slug is already taken',
                    });
                }
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
                if (error.code === '23505' && error.message.includes('custom_slug')) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'This URL slug is already taken',
                    });
                }
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to update service',
                    cause: error,
                });
            }

            return { success: true, service: data };
        }),

    /**
     * Delete a service (admin only) - soft delete
     */
    delete: adminProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
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

    /**
     * Get service schedules (Tab 2)
     * Note: Uses raw query since service_schedules not in generated types
     */
    getSchedules: protectedProcedure
        .input(z.object({ serviceId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            // Type assertion for table not in generated types
            const supabase = ctx.supabase as unknown as {
                from: (table: string) => {
                    select: (cols: string) => {
                        eq: (col: string, val: string) => {
                            order: (col: string, opts: { ascending: boolean }) => {
                                order: (col: string, opts: { ascending: boolean }) => Promise<{
                                    data: Array<{
                                        id: string;
                                        service_id: string;
                                        day_of_week: number;
                                        start_time: string;
                                        end_time: string;
                                        is_available: boolean | null;
                                    }> | null;
                                    error: { message: string } | null;
                                }>;
                            };
                        };
                    };
                };
            };

            const { data, error } = await supabase
                .from('service_schedules')
                .select('*')
                .eq('service_id', input.serviceId)
                .order('day_of_week', { ascending: true })
                .order('start_time', { ascending: true });

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch schedules',
                    cause: error,
                });
            }

            return data || [];
        }),

    /**
     * Update service schedules (Tab 2)
     * Replaces all schedules for a service
     * Note: Uses raw query since service_schedules not in generated types
     */
    updateSchedules: adminProcedure
        .input(serviceScheduleSchema)
        .mutation(async ({ ctx, input }) => {
            // Type assertion for table not in generated types
            const supabase = ctx.supabase as unknown as {
                from: (table: string) => {
                    delete: () => {
                        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
                    };
                    insert: (data: unknown) => Promise<{ error: { message: string } | null }>;
                };
            };

            // Delete existing schedules
            await supabase
                .from('service_schedules')
                .delete()
                .eq('service_id', input.service_id);

            // Insert new schedules
            if (input.schedules.length > 0) {
                const { error } = await supabase
                    .from('service_schedules')
                    .insert(
                        input.schedules.map(s => ({
                            ...s,
                            service_id: input.service_id,
                            tenant_id: ctx.tenantId,
                        }))
                    );

                if (error) {
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to update schedules',
                        cause: error,
                    });
                }
            }

            return { success: true };
        }),

    /**
     * Get assigned providers for a service
     */
    getProviders: protectedProcedure
        .input(z.object({ serviceId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            const { data, error } = await ctx.supabase
                .from('service_providers')
                .select(`
                    provider_id,
                    provider:providers(id, name, email, photo_url, is_active)
                `)
                .eq('service_id', input.serviceId);

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch providers',
                    cause: error,
                });
            }

            return data?.map(sp => sp.provider) || [];
        }),

    /**
     * Update assigned providers for a service
     */
    updateProviders: adminProcedure
        .input(z.object({
            serviceId: z.string().uuid(),
            providerIds: z.array(z.string().uuid()),
        }))
        .mutation(async ({ ctx, input }) => {
            // Delete existing assignments
            await ctx.supabase
                .from('service_providers')
                .delete()
                .eq('service_id', input.serviceId);

            // Insert new assignments
            if (input.providerIds.length > 0) {
                const { error } = await ctx.supabase
                    .from('service_providers')
                    .insert(
                        input.providerIds.map(providerId => ({
                            service_id: input.serviceId,
                            provider_id: providerId,
                            tenant_id: ctx.tenantId,
                        }))
                    );

                if (error) {
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to update providers',
                        cause: error,
                    });
                }
            }

            return { success: true };
        }),

    /**
     * Check if URL slug is available
     */
    checkSlugAvailability: protectedProcedure
        .input(z.object({
            slug: z.string(),
            excludeServiceId: z.string().uuid().optional(),
        }))
        .query(async ({ ctx, input }) => {
            let query = ctx.supabase
                .from('services')
                .select('id')
                .eq('custom_url_slug', input.slug);

            if (input.excludeServiceId) {
                query = query.neq('id', input.excludeServiceId);
            }

            const { data } = await query.single();

            return { available: !data, slug: input.slug };
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
