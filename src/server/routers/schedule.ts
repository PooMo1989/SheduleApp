import { z } from 'zod';
import { router, protectedProcedure, providerProcedure, adminProcedure } from '@/lib/trpc/server';
import { TRPCError } from '@trpc/server';

/**
 * Schedule Router
 * Story 2.7.1: Availability Editor & Story 6.5: Provider Schedule Self-Service
 * Updated to support Admin management (Tier 8)
 * Fixed: Provider ID lookup for self-service (Tier 8.1)
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
            let targetProviderId: string;

            // 1. Determine Target Provider ID
            if (input?.providerId) {
                // Admin Mode: accessing a specific provider
                if (input.providerId !== ctx.user.id) {
                    const { data: isAdmin } = await ctx.supabase.rpc('is_admin');
                    if (!isAdmin) {
                        throw new TRPCError({
                            code: 'FORBIDDEN',
                            message: 'Insufficient permissions to view another provider schedule',
                        });
                    }
                }
                targetProviderId = input.providerId;
            } else {
                // Self-Service Mode: Resolve Provider ID from User ID
                const { data: provider, error } = await ctx.supabase
                    .from('providers')
                    .select('id')
                    .eq('user_id', ctx.user.id)
                    .single();

                if (error || !provider) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'No provider profile found for this user',
                    });
                }
                targetProviderId = provider.id;
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

    // Legacy alias - mapped to new logic
    getMine: providerProcedure.query(async ({ ctx }) => {
        // Resolve Provider ID
        const { data: provider } = await ctx.supabase
            .from('providers')
            .select('id')
            .eq('user_id', ctx.user.id)
            .single();

        if (!provider) throw new TRPCError({ code: 'NOT_FOUND', message: 'Provider not found' });

        const { data: baseSchedule } = await ctx.supabase
            .from('provider_schedules')
            .select('*')
            .eq('provider_id', provider.id)
            .order('day_of_week', { ascending: true })
            .order('start_time', { ascending: true });

        const today = new Date().toISOString().split('T')[0];
        const { data: overrides } = await ctx.supabase
            .from('schedule_overrides')
            .select('*')
            .eq('provider_id', provider.id)
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
            let targetProviderId: string;

            if (input.providerId) {
                if (input.providerId !== ctx.user.id) {
                    const { data: isAdmin } = await ctx.supabase.rpc('is_admin');
                    if (!isAdmin) throw new TRPCError({ code: 'FORBIDDEN', message: 'Forbidden' });
                }
                targetProviderId = input.providerId;
            } else {
                const { data: provider } = await ctx.supabase
                    .from('providers')
                    .select('id')
                    .eq('user_id', ctx.user.id)
                    .single();
                if (!provider) throw new TRPCError({ code: 'NOT_FOUND', message: 'Provider not found' });
                targetProviderId = provider.id;
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

            // 2. Insert new slots (only available ones)
            // Note: Filter at app layer before DB to keep DB clean
            const activeSlots = slots.filter(s => s.isAvailable);

            if (activeSlots.length > 0) {
                const { error: insertError } = await ctx.supabase
                    .from('provider_schedules')
                    .insert(
                        activeSlots.map((slot) => ({
                            provider_id: targetProviderId,
                            day_of_week: dayOfWeek,
                            start_time: slot.startTime,
                            end_time: slot.endTime,
                            is_available: true, // Always true if inserted, unless we support stored blocked slots
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
            let targetProviderId: string;

            if (input.providerId) {
                if (input.providerId !== ctx.user.id) {
                    const { data: isAdmin } = await ctx.supabase.rpc('is_admin');
                    if (!isAdmin) throw new TRPCError({ code: 'FORBIDDEN', message: 'Forbidden' });
                }
                targetProviderId = input.providerId;
            } else {
                const { data: provider } = await ctx.supabase
                    .from('providers')
                    .select('id')
                    .eq('user_id', ctx.user.id)
                    .single();
                if (!provider) throw new TRPCError({ code: 'NOT_FOUND', message: 'Provider not found' });
                targetProviderId = provider.id;
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
            let targetProviderId: string;

            if (input.providerId) {
                if (input.providerId !== ctx.user.id) {
                    const { data: isAdmin } = await ctx.supabase.rpc('is_admin');
                    if (!isAdmin) throw new TRPCError({ code: 'FORBIDDEN', message: 'Forbidden' });
                }
                targetProviderId = input.providerId;
            } else {
                const { data: provider } = await ctx.supabase
                    .from('providers')
                    .select('id')
                    .eq('user_id', ctx.user.id)
                    .single();
                if (!provider) throw new TRPCError({ code: 'NOT_FOUND', message: 'Provider not found' });
                targetProviderId = provider.id;
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
