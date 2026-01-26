import { z } from 'zod';
import { router, protectedProcedure, providerProcedure, adminProcedure } from '@/lib/trpc/server';
import { TRPCError } from '@trpc/server';

/**
 * Schedule Router
 * Story 2.7.1: Availability Editor & Story 6.5: Provider Schedule Self-Service
 * Updated to support Admin management (Tier 8)
 */
export const scheduleRouter = router({
    /**
     * Get schedule (base + overrides)
     * If providerId is provided, fetches that provider's schedule (Admin only).
     * If omitted, fetches current user's schedule (Provider only).
     */
    getSchedule: protectedProcedure
        .input(z.object({
            providerId: z.string().uuid().optional(),
        }).optional())
        .query(async ({ ctx, input }) => {
            let targetProviderId = ctx.user.id;

            // If requesting a specific provider
            if (input?.providerId) {
                // If not self, must be admin (or generic read access if we allow public profile schedules? 
                // Public usually goes through dedicated public procedure. Internal requires privs.)
                if (input.providerId !== ctx.user.id) {
                    // Check if admin
                    const { data: userRoles } = await ctx.supabase
                        .rpc('get_current_user_role');

                    // Simple role check based on established patterns 
                    // (Assuming middleware or context already has role, but RPC is safe)
                    // Actually ctx.user has roles if we put them there? 
                    // Let's rely on checking if they are admin via DB if ctx isn't sufficient.

                    const { data: isAdmin } = await ctx.supabase.rpc('is_admin');
                    if (!isAdmin) {
                        throw new TRPCError({
                            code: 'FORBIDDEN',
                            message: 'Insufficient permissions to view another provider schedule',
                        });
                    }
                    targetProviderId = input.providerId;
                }
            } else {
                // Self-access requires being a provider (or having a schedule)
                // We don't strictly enforce 'provider' role here as long as they have an ID, 
                // but practically they should be a provider.
            }

            // Fetch base schedule
            const { data: baseSchedule, error: baseError } = await ctx.supabase
                .from('provider_schedules')
                .select('*')
                .eq('provider_id', targetProviderId)
                .order('day_of_week', { ascending: true })
                .order('start_time', { ascending: true });

            if (baseError) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch base schedule',
                    cause: baseError,
                });
            }

            // Fetch overrides for next 90 days
            const today = new Date().toISOString().split('T')[0];
            const { data: overrides, error: overridesError } = await ctx.supabase
                .from('schedule_overrides')
                .select('*')
                .eq('provider_id', targetProviderId)
                .gte('override_date', today)
                .order('override_date', { ascending: true });

            if (overridesError) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch schedule overrides',
                    cause: overridesError,
                });
            }

            return {
                baseSchedule: baseSchedule || [],
                overrides: overrides || [],
            };
        }),

    // Legacy alias for self-service
    getMine: providerProcedure.query(async ({ ctx }) => {
        // ... Reusing logic or just calling the internal logic is hard in TRPC simply. 
        // We'll just duplicate the fetch for MVP or deprecate this and update frontend.
        // Let's deprecate and point frontend to getSchedule({}).
        // For now, keep it working for existing code while I refactor.
        const { data: baseSchedule } = await ctx.supabase
            .from('provider_schedules')
            .select('*')
            .eq('provider_id', ctx.user.id)
            .order('day_of_week', { ascending: true })
            .order('start_time', { ascending: true });

        const today = new Date().toISOString().split('T')[0];
        const { data: overrides } = await ctx.supabase
            .from('schedule_overrides')
            .select('*')
            .eq('provider_id', ctx.user.id)
            .gte('override_date', today)
            .order('override_date', { ascending: true });

        return {
            baseSchedule: baseSchedule || [],
            overrides: overrides || [],
        };
    }),

    /**
     * Update base weekly schedule
     */
    updateBaseSchedule: protectedProcedure
        .input(z.object({
            providerId: z.string().uuid().optional(),
            dayOfWeek: z.number().min(0).max(6),
            slots: z.array(z.object({
                startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format HH:MM'),
                endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format HH:MM'),
                isAvailable: z.boolean().default(true),
            })),
        }))
        .mutation(async ({ ctx, input }) => {
            let targetProviderId = ctx.user.id;

            if (input.providerId && input.providerId !== ctx.user.id) {
                const { data: isAdmin } = await ctx.supabase.rpc('is_admin');
                if (!isAdmin) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'Only admins can update other providers schedules',
                    });
                }
                targetProviderId = input.providerId;
            }

            const { dayOfWeek, slots } = input;

            // 1. Delete existing slots for this day
            const { error: deleteError } = await ctx.supabase
                .from('provider_schedules')
                .delete()
                .eq('provider_id', targetProviderId)
                .eq('day_of_week', dayOfWeek);

            if (deleteError) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to clear existing schedule slots',
                    cause: deleteError,
                });
            }

            // 2. Insert new slots
            if (slots.length > 0) {
                const { error: insertError } = await ctx.supabase
                    .from('provider_schedules')
                    .insert(
                        slots.map((slot) => ({
                            provider_id: targetProviderId,
                            day_of_week: dayOfWeek,
                            start_time: slot.startTime,
                            end_time: slot.endTime,
                            is_available: slot.isAvailable,
                        }))
                    );

                if (insertError) {
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to save new schedule slots',
                        cause: insertError,
                    });
                }
            }

            return { success: true };
        }),

    /**
     * Upsert override
     */
    upsertOverride: protectedProcedure
        .input(z.object({
            providerId: z.string().uuid().optional(),
            date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format YYYY-MM-DD'),
            isAvailable: z.boolean(),
            startTime: z.string().optional().nullable(),
            endTime: z.string().optional().nullable(),
            reason: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            let targetProviderId = ctx.user.id;

            if (input.providerId && input.providerId !== ctx.user.id) {
                const { data: isAdmin } = await ctx.supabase.rpc('is_admin');
                if (!isAdmin) {
                    throw new TRPCError({ code: 'FORBIDDEN', message: 'Forbidden' });
                }
                targetProviderId = input.providerId;
            }

            const { error } = await ctx.supabase
                .from('schedule_overrides')
                .upsert({
                    provider_id: targetProviderId,
                    override_date: input.date,
                    is_available: input.isAvailable,
                    start_time: input.startTime,
                    end_time: input.endTime,
                    reason: input.reason,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'provider_id,override_date' });

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to save override',
                    cause: error,
                });
            }

            return { success: true };
        }),

    /**
     * Delete override
     */
    deleteOverride: protectedProcedure
        .input(z.object({
            providerId: z.string().uuid().optional(),
            date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format YYYY-MM-DD'),
        }))
        .mutation(async ({ ctx, input }) => {
            let targetProviderId = ctx.user.id;

            if (input.providerId && input.providerId !== ctx.user.id) {
                const { data: isAdmin } = await ctx.supabase.rpc('is_admin');
                if (!isAdmin) {
                    throw new TRPCError({ code: 'FORBIDDEN', message: 'Forbidden' });
                }
                targetProviderId = input.providerId;
            }

            const { error } = await ctx.supabase
                .from('schedule_overrides')
                .delete()
                .eq('provider_id', targetProviderId)
                .eq('override_date', input.date);

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to delete override',
                    cause: error,
                });
            }

            return { success: true };
        }),
});
