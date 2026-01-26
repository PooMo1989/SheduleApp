import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, adminProcedure, providerProcedure } from '@/lib/trpc/server';
import { TRPCError } from '@trpc/server';
import { checkSlot } from '@/lib/availability';

/**
 * Booking Status enum matching database
 */
const BookingStatusEnum = z.enum([
    'pending',
    'confirmed',
    'cancelled',
    'rejected',
    'completed',
    'no_show',
]);

/**
 * Booking Router
 * Epic 4: Availability Engine
 *
 * Provides endpoints for managing bookings:
 * - create: Create a new booking (public - for widget)
 * - getMyBookings: Client view of their bookings
 * - getAll: Admin view of all bookings
 * - updateStatus: Admin/Provider status updates
 * - cancel: Client cancellation
 */
export const bookingRouter = router({
    /**
     * Create a new booking
     *
     * Public endpoint for embeddable widget.
     * Validates slot availability before creating.
     */
    create: publicProcedure
        .input(z.object({
            serviceId: z.string().uuid(),
            tenantId: z.string().uuid(),
            providerId: z.string().uuid(),
            startTime: z.string().datetime(),
            // Client info
            clientName: z.string().min(1).max(255),
            clientEmail: z.string().email().max(255),
            clientPhone: z.string().max(50).optional(),
            clientNotes: z.string().max(1000).optional(),
            // Optional user ID for authenticated clients
            clientUserId: z.string().uuid().optional(),
            timezone: z.string().default('UTC'),
        }))
        .mutation(async ({ ctx, input }) => {
            // 1. Verify slot is still available
            const slotCheck = await checkSlot(ctx.supabase, {
                serviceId: input.serviceId,
                tenantId: input.tenantId,
                providerId: input.providerId,
                startTime: input.startTime,
                timezone: input.timezone,
            });

            if (!slotCheck.available) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: slotCheck.reason || 'Time slot is no longer available',
                });
            }

            // 2. Fetch service details for snapshot
            const { data: service, error: serviceError } = await ctx.supabase
                .from('services')
                .select('duration_minutes, buffer_before_minutes, buffer_after_minutes, price, currency')
                .eq('id', input.serviceId)
                .single();

            if (serviceError || !service) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Service not found',
                });
            }

            // 3. Calculate end time
            const startTime = new Date(input.startTime);
            const endTime = new Date(startTime.getTime() + service.duration_minutes * 60 * 1000);

            // 4. Create the booking
            // Note: bookings table will exist after migration 027 is applied
            const { data: booking, error: bookingError } = await ctx.supabase
                .from('bookings')
                .insert({
                    tenant_id: input.tenantId,
                    service_id: input.serviceId,
                    provider_id: input.providerId,
                    client_user_id: input.clientUserId || null,
                    start_time: input.startTime,
                    end_time: endTime.toISOString(),
                    // Snapshot fields
                    duration_minutes: service.duration_minutes,
                    buffer_before_minutes: service.buffer_before_minutes || 0,
                    buffer_after_minutes: service.buffer_after_minutes || 0,
                    price: service.price,
                    currency: service.currency || 'USD',
                    // Client info
                    client_name: input.clientName,
                    client_email: input.clientEmail,
                    client_phone: input.clientPhone,
                    client_notes: input.clientNotes,
                    // Status
                    status: 'pending',
                })
                .select()
                .single();

            if (bookingError) {
                // Check for exclusion constraint violation (double booking)
                if (bookingError.code === '23P01') {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'Time slot was just booked by someone else',
                    });
                }

                console.error('Booking creation error:', bookingError);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create booking',
                });
            }

            return {
                booking,
                message: 'Booking created successfully',
            };
        }),

    /**
     * Get bookings for the current authenticated client
     */
    getMyBookings: protectedProcedure
        .input(z.object({
            status: BookingStatusEnum.optional(),
            limit: z.number().min(1).max(100).default(50),
            offset: z.number().min(0).default(0),
        }).optional())
        .query(async ({ ctx, input }) => {
            // Note: bookings table will exist after migration 027 is applied
            let query = ctx.supabase
                .from('bookings')
                .select(`
                    *,
                    services (id, name, duration_minutes),
                    providers (id, display_name)
                `)
                .eq('client_user_id', ctx.userId)
                .order('start_time', { ascending: false });

            if (input?.status) {
                query = query.eq('status', input.status);
            }

            const { data, error, count } = await query
                .range(input?.offset ?? 0, (input?.offset ?? 0) + (input?.limit ?? 50) - 1);

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch bookings',
                });
            }

            return {
                bookings: data || [],
                total: count ?? data?.length ?? 0,
            };
        }),

    /**
     * Get all bookings for admin view
     */
    getAll: adminProcedure
        .input(z.object({
            status: BookingStatusEnum.optional(),
            providerId: z.string().uuid().optional(),
            serviceId: z.string().uuid().optional(),
            startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
            endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
            limit: z.number().min(1).max(100).default(50),
            offset: z.number().min(0).default(0),
        }).optional())
        .query(async ({ ctx, input }) => {
            // Note: bookings table will exist after migration 027 is applied
            let query = ctx.supabase
                .from('bookings')
                .select(`
                    *,
                    services (id, name, duration_minutes, service_type),
                    providers (id, display_name, user_id)
                `, { count: 'exact' })
                .eq('tenant_id', ctx.tenantId)
                .order('start_time', { ascending: false });

            if (input?.status) {
                query = query.eq('status', input.status);
            }
            if (input?.providerId) {
                query = query.eq('provider_id', input.providerId);
            }
            if (input?.serviceId) {
                query = query.eq('service_id', input.serviceId);
            }
            if (input?.startDate) {
                query = query.gte('start_time', `${input.startDate}T00:00:00Z`);
            }
            if (input?.endDate) {
                query = query.lte('start_time', `${input.endDate}T23:59:59Z`);
            }

            const { data, error, count } = await query
                .range(input?.offset ?? 0, (input?.offset ?? 0) + (input?.limit ?? 50) - 1);

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch bookings',
                });
            }

            return {
                bookings: data || [],
                total: count ?? 0,
            };
        }),

    /**
     * Get bookings for the current provider
     */
    getProviderBookings: providerProcedure
        .input(z.object({
            status: BookingStatusEnum.optional(),
            startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
            endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
            limit: z.number().min(1).max(100).default(50),
            offset: z.number().min(0).default(0),
        }).optional())
        .query(async ({ ctx, input }) => {
            // Get provider ID for current user
            const { data: provider, error: providerError } = await ctx.supabase
                .from('providers')
                .select('id')
                .eq('user_id', ctx.userId)
                .single();

            if (providerError || !provider) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Provider profile not found',
                });
            }

            // Note: bookings table will exist after migration 027 is applied
            let query = ctx.supabase
                .from('bookings')
                .select(`
                    *,
                    services (id, name, duration_minutes, service_type)
                `, { count: 'exact' })
                .eq('provider_id', provider.id)
                .order('start_time', { ascending: true });

            if (input?.status) {
                query = query.eq('status', input.status);
            }
            if (input?.startDate) {
                query = query.gte('start_time', `${input.startDate}T00:00:00Z`);
            }
            if (input?.endDate) {
                query = query.lte('start_time', `${input.endDate}T23:59:59Z`);
            }

            const { data, error, count } = await query
                .range(input?.offset ?? 0, (input?.offset ?? 0) + (input?.limit ?? 50) - 1);

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch bookings',
                });
            }

            return {
                bookings: data || [],
                total: count ?? 0,
            };
        }),

    /**
     * Update booking status (admin/provider)
     */
    updateStatus: protectedProcedure
        .input(z.object({
            bookingId: z.string().uuid(),
            status: BookingStatusEnum,
            internalNotes: z.string().max(1000).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            // Verify user has permission (admin or assigned provider)
            // Note: bookings table will exist after migration 027 is applied
            const { data: booking, error: fetchError } = await ctx.supabase
                .from('bookings')
                .select(`
                    id,
                    provider_id,
                    status,
                    providers (user_id)
                `)
                .eq('id', input.bookingId)
                .single();

            if (fetchError || !booking) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Booking not found',
                });
            }

            // Check if user is admin or the assigned provider
            const { data: isAdmin } = await ctx.supabase.rpc('is_admin');
            const isAssignedProvider = (booking.providers as unknown as { user_id: string } | null)?.user_id === ctx.userId;

            if (!isAdmin && !isAssignedProvider) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Insufficient permissions',
                });
            }

            // Update the booking
            const updateData: Record<string, unknown> = {
                status: input.status,
            };

            if (input.internalNotes !== undefined) {
                updateData.internal_notes = input.internalNotes;
            }

            if (input.status === 'cancelled') {
                updateData.cancelled_at = new Date().toISOString();
                updateData.cancelled_by = ctx.userId;
            }

            // Note: bookings table will exist after migration 027 is applied
            const { data: updated, error: updateError } = await ctx.supabase
                .from('bookings')
                .update(updateData)
                .eq('id', input.bookingId)
                .select()
                .single();

            if (updateError) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to update booking',
                });
            }

            return {
                booking: updated,
                message: `Booking status updated to ${input.status}`,
            };
        }),

    /**
     * Cancel booking (client self-service)
     */
    cancel: protectedProcedure
        .input(z.object({
            bookingId: z.string().uuid(),
            reason: z.string().max(500).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            // Verify the booking belongs to this user
            // Note: bookings table will exist after migration 027 is applied
            const { data: booking, error: fetchError } = await ctx.supabase
                .from('bookings')
                .select('id, client_user_id, status, start_time')
                .eq('id', input.bookingId)
                .single();

            if (fetchError || !booking) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Booking not found',
                });
            }

            if (booking.client_user_id !== ctx.userId) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'You can only cancel your own bookings',
                });
            }

            // Check if booking can be cancelled
            if (['completed', 'no_show', 'cancelled'].includes(booking.status)) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: `Cannot cancel a booking with status: ${booking.status}`,
                });
            }

            // Cancel the booking
            // Note: bookings table will exist after migration 027 is applied
            const { data: updated, error: updateError } = await ctx.supabase
                .from('bookings')
                .update({
                    status: 'cancelled',
                    cancelled_at: new Date().toISOString(),
                    cancelled_by: ctx.userId,
                    cancellation_reason: input.reason,
                })
                .eq('id', input.bookingId)
                .select()
                .single();

            if (updateError) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to cancel booking',
                });
            }

            return {
                booking: updated,
                message: 'Booking cancelled successfully',
            };
        }),

    /**
     * Get a single booking by ID
     */
    getById: protectedProcedure
        .input(z.object({
            bookingId: z.string().uuid(),
        }))
        .query(async ({ ctx, input }) => {
            // Note: bookings table will exist after migration 027 is applied
            const { data: booking, error } = await ctx.supabase
                .from('bookings')
                .select(`
                    *,
                    services (id, name, duration_minutes, service_type, price, currency),
                    providers (id, display_name, user_id)
                `)
                .eq('id', input.bookingId)
                .single();

            if (error || !booking) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Booking not found',
                });
            }

            // Verify access (client, provider, or admin)
            const isClient = booking.client_user_id === ctx.userId;
            const isProvider = (booking.providers as unknown as { user_id: string } | null)?.user_id === ctx.userId;
            const { data: isAdmin } = await ctx.supabase.rpc('is_admin');

            if (!isClient && !isProvider && !isAdmin) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Access denied',
                });
            }

            return { booking };
        }),
});
