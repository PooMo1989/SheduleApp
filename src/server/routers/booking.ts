import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, adminProcedure, providerProcedure } from '@/lib/trpc/server';
import { TRPCError } from '@trpc/server';
import { checkSlot } from '@/lib/availability';
import { resend } from '@/lib/email';
import { renderTemplate } from '@/lib/email/renderer';
import { DEFAULT_EMAIL_TEMPLATES } from '@/lib/email/templates/defaults';
import { type SupabaseClient } from '@supabase/supabase-js';

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

// Helper to get template
async function getEmailTemplate(supabase: SupabaseClient, tenantId: string, eventType: keyof typeof DEFAULT_EMAIL_TEMPLATES) {
    const { data } = await supabase
        .from('email_templates')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('event_type', eventType)
        .single();

    if (data) {
        return { subject: data.subject_template, body: data.body_template };
    }
    return DEFAULT_EMAIL_TEMPLATES[eventType];
}

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


            // 2. Fetch service, provider, and tenant settings
            const [{ data: service, error: serviceError }, { data: provider, error: providerError }, { data: tenant, error: tenantError }] = await Promise.all([
                ctx.supabase
                    .from('services')
                    .select('name, duration_minutes, buffer_before_minutes, buffer_after_minutes, price, currency')
                    .eq('id', input.serviceId)
                    .single(),
                ctx.supabase
                    .from('providers')
                    .select('name, email')
                    .eq('id', input.providerId)
                    .single(),
                ctx.supabase
                    .from('tenants')
                    .select('pay_later_mode')
                    .eq('id', input.tenantId)
                    .single()
            ]);

            if (serviceError || !service) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Service not found',
                });
            }
            if (providerError || !provider) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Provider not found',
                });
            }
            if (tenantError || !tenant) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Tenant configuration not found',
                });
            }

            // Determine initial status based on settings
            // Default to 'pending' if mode is 'pending_approval' or null
            const initialStatus = tenant.pay_later_mode === 'auto_confirm' ? 'confirmed' : 'pending';

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
                    status: initialStatus,
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



            // 5. Send Emails (Async - don't block response if possible)
            (async () => {
                try {
                    // Generate magic link for guest bookings (Story 3.7)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const bookingToken = (booking as any).booking_token;
                    const magicLink = bookingToken
                        ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/booking/manage?token=${bookingToken}`
                        : null;

                    // Prepare data
                    const emailData = {
                        client_name: input.clientName,
                        service_name: service.name,
                        date: startTime.toLocaleDateString(),
                        time: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        provider_name: provider.name,
                        location: 'Business Location', // Placeholder or from tenant settings
                        magic_link: magicLink || 'N/A', // Magic link for guest bookings (Story 3.7)
                    };

                    // A. Client Confirmation
                    const clientTemplate = await getEmailTemplate(ctx.supabase, input.tenantId, 'booking_confirmation');
                    await resend.emails.send({
                        from: 'SheduleApp <noreply@resend.dev>', // Use verified domain in prod
                        to: input.clientEmail,
                        subject: renderTemplate(clientTemplate.subject, emailData),
                        text: renderTemplate(clientTemplate.body, emailData),
                    });

                    // B. Provider Notification
                    if (provider.email) {
                        const providerTemplate = await getEmailTemplate(ctx.supabase, input.tenantId, 'provider_notification');
                        await resend.emails.send({
                            from: 'SheduleApp <noreply@resend.dev>',
                            to: provider.email,
                            subject: renderTemplate(providerTemplate.subject, emailData),
                            text: renderTemplate(providerTemplate.body, emailData),
                        });
                    }
                } catch (err) {
                    console.error('Failed to send booking emails:', err);
                    // Don't fail the request, just log it
                }
            })();

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
                    providers (id, name)
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
                    providers (id, name, user_id)
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
                .select(`
                                        id, 
                                        client_user_id, 
                                        status, 
                                        start_time,
                                        client_name,
                                        client_email,
                                        services (name),
                                        providers (name, email)
                                    `)
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

            // Send Cancellation Emails
            (async () => {
                try {
                    const startTime = new Date(booking.start_time);
                    const emailData = {
                        client_name: booking.client_name,
                        service_name: booking.services?.name || 'Service',
                        date: startTime.toLocaleDateString(),
                        time: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        provider_name: booking.providers?.name || 'Provider',
                    };

                    // Client Cancellation Email
                    const cancelTemplate = await getEmailTemplate(ctx.supabase, ctx.tenantId, 'booking_cancellation');
                    if (booking.client_email) {
                        await resend.emails.send({
                            from: 'SheduleApp <noreply@resend.dev>',
                            to: booking.client_email,
                            subject: renderTemplate(cancelTemplate.subject, emailData),
                            text: renderTemplate(cancelTemplate.body, emailData),
                        });
                    }

                    // Provider Notification (Cancellation)
                    if (booking.providers?.email) {
                        await resend.emails.send({
                            from: 'SheduleApp <noreply@resend.dev>',
                            to: booking.providers.email,
                            subject: `Cancelled: ${emailData.service_name}`,
                            text: `The booking for ${emailData.client_name} on ${emailData.date} at ${emailData.time} has been cancelled by the client.`,
                        });
                    }

                } catch (err) {
                    console.error('Failed to send cancellation emails:', err);
                }
            })();

            return {
                booking: updated,
                message: 'Booking cancelled successfully',
            };
        }),

    /**
     * Get a single booking by ID
     */
    getById: publicProcedure
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
                    providers (id, name, user_id)
                `)
                .eq('id', input.bookingId)
                .single();

            if (error || !booking) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Booking not found',
                });
            }

            // Public access for guest bookings
            // UUIDs are hard to guess, providing reasonable security
            // Story 3.7: Now using booking_token for magic links
            return booking;
        }),

    /**
     * Get booking(s) by magic link token
     * Story 3.7: Magic link system
     */
    getByToken: publicProcedure
        .input(z.object({
            token: z.string(),
        }))
        .query(async ({ ctx, input }) => {
            // Fetch booking with this token
            const { data: booking, error } = await ctx.supabase
                .from('bookings')
                .select(`
                    *,
                    services (id, name, duration_minutes, service_type, price, currency),
                    providers (id, name, user_id)
                `)
                .eq('booking_token', input.token)
                .single();

            if (error || !booking) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Invalid or expired booking link',
                });
            }

            // Check if token is expired
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const tokenExpiresAt = (booking as any).token_expires_at;
            if (tokenExpiresAt && new Date(tokenExpiresAt) < new Date()) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'This link has expired. Please request a new one.',
                });
            }

            // Get all bookings for this email (guest bookings only)
            const { data: allBookings } = await ctx.supabase
                .from('bookings')
                .select(`
                    *,
                    services (id, name, duration_minutes, service_type, price, currency),
                    providers (id, name)
                `)
                .eq('client_email', booking.client_email)
                .is('client_user_id', null)
                .order('start_time', { ascending: false });

            return {
                booking,
                allBookings: allBookings || [],
                email: booking.client_email,
            };
        }),

    /**
     * Refresh booking token (generate new magic link)
     * Story 3.7: Token refresh for expired links
     */
    refreshToken: publicProcedure
        .input(z.object({
            email: z.string().email(),
        }))
        .mutation(async ({ ctx, input }) => {
            // Find guest bookings for this email
            const { data: bookings } = await ctx.supabase
                .from('bookings')
                .select('id, client_email, booking_token')
                .eq('client_email', input.email)
                .is('client_user_id', null)
                .limit(1);

            if (!bookings || bookings.length === 0) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'No guest bookings found for this email',
                });
            }

            // Generate new token (will be auto-generated by trigger on update)
            // For now, we'll generate it manually
            const newToken = Array.from(crypto.getRandomValues(new Uint8Array(24)))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('')
                .replace(/[^a-zA-Z0-9]/g, '')
                .substring(0, 32);

            const newExpiry = new Date();
            newExpiry.setDate(newExpiry.getDate() + 30);

            // Update all guest bookings for this email with new token
            const { data: updated, error } = await ctx.supabase
                .from('bookings')
                .update({
                    booking_token: newToken,
                    token_expires_at: newExpiry.toISOString(),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any) // Type assertion for new fields not in generated types yet
                .eq('client_email', input.email)
                .is('client_user_id', null)
                .select()
                .limit(1)
                .single();

            if (error || !updated) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to generate new magic link',
                });
            }

            // Send email with new magic link
            try {
                const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/booking/manage?token=${newToken}`;

                await resend.emails.send({
                    from: 'SheduleApp <noreply@resend.dev>',
                    to: input.email,
                    subject: 'Your New Booking Management Link',
                    text: `Here's your new link to manage your bookings:\n\n${magicLink}\n\nThis link will expire in 30 days.`,
                });
            } catch (emailError) {
                console.error('Failed to send magic link email:', emailError);
                // Don't fail the request, token is still generated
            }

            return {
                success: true,
                message: 'A new magic link has been sent to your email',
            };
        }),
});
