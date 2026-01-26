import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '@/lib/trpc/server';
import { TRPCError } from '@trpc/server';
import { getAvailability, checkSlot, getProvidersForSlot } from '@/lib/availability';

/**
 * Availability Router
 * Epic 4: Availability Engine
 *
 * Provides endpoints for checking service availability:
 * - getSlots: Get available time slots for a date range
 * - checkSlot: Real-time availability check for a specific slot
 * - getProvidersForSlot: Get available providers for a time slot
 */
export const availabilityRouter = router({
    /**
     * Get available time slots for a service
     *
     * Supports both specific provider and "Any Provider" modes.
     * Returns slots grouped by date with availability information.
     */
    getSlots: publicProcedure
        .input(z.object({
            serviceId: z.string().uuid(),
            tenantId: z.string().uuid(),
            startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
            endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
            providerId: z.string().uuid().optional(),
            timezone: z.string().default('UTC'),
        }))
        .query(async ({ ctx, input }) => {
            try {
                const availability = await getAvailability(ctx.supabase, {
                    serviceId: input.serviceId,
                    tenantId: input.tenantId,
                    startDate: input.startDate,
                    endDate: input.endDate,
                    providerId: input.providerId,
                    timezone: input.timezone,
                });

                return availability;
            } catch (error) {
                console.error('Error fetching availability:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to fetch availability',
                });
            }
        }),

    /**
     * Real-time check if a specific slot is available
     *
     * Use this for final validation before creating a booking.
     * Returns availability status and conflict reason if blocked.
     */
    checkSlot: publicProcedure
        .input(z.object({
            serviceId: z.string().uuid(),
            tenantId: z.string().uuid(),
            providerId: z.string().uuid(),
            startTime: z.string().datetime(),
            timezone: z.string().default('UTC'),
        }))
        .query(async ({ ctx, input }) => {
            try {
                const result = await checkSlot(ctx.supabase, {
                    serviceId: input.serviceId,
                    tenantId: input.tenantId,
                    providerId: input.providerId,
                    startTime: input.startTime,
                    timezone: input.timezone,
                });

                return result;
            } catch (error) {
                console.error('Error checking slot:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to check slot',
                });
            }
        }),

    /**
     * Get available providers for a specific time slot
     *
     * Used in "Any Provider" mode to show which providers
     * can be assigned to a selected time slot.
     */
    getProvidersForSlot: publicProcedure
        .input(z.object({
            serviceId: z.string().uuid(),
            tenantId: z.string().uuid(),
            startTime: z.string().datetime(),
            endTime: z.string().datetime(),
        }))
        .query(async ({ ctx, input }) => {
            try {
                const providers = await getProvidersForSlot(
                    ctx.supabase,
                    input.serviceId,
                    input.tenantId,
                    input.startTime,
                    input.endTime
                );

                return {
                    providers,
                    count: providers.length,
                };
            } catch (error) {
                console.error('Error fetching providers for slot:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to fetch providers',
                });
            }
        }),

    /**
     * Get service availability summary
     *
     * Returns a condensed view of availability for calendar display.
     * Shows which dates have any availability without full slot details.
     */
    getSummary: publicProcedure
        .input(z.object({
            serviceId: z.string().uuid(),
            tenantId: z.string().uuid(),
            startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
            endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
            providerId: z.string().uuid().optional(),
            timezone: z.string().default('UTC'),
        }))
        .query(async ({ ctx, input }) => {
            try {
                const availability = await getAvailability(ctx.supabase, {
                    serviceId: input.serviceId,
                    tenantId: input.tenantId,
                    startDate: input.startDate,
                    endDate: input.endDate,
                    providerId: input.providerId,
                    timezone: input.timezone,
                });

                // Return condensed summary
                return {
                    serviceId: input.serviceId,
                    dateRange: availability.dateRange,
                    totalSlots: availability.totalSlots,
                    anyProviderMode: availability.anyProviderMode,
                    dates: availability.days.map(day => ({
                        date: day.date,
                        hasAvailability: day.hasAvailability,
                        slotCount: day.slots.length,
                    })),
                };
            } catch (error) {
                console.error('Error fetching availability summary:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to fetch summary',
                });
            }
        }),
});
