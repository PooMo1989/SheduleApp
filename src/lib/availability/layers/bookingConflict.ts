/**
 * Layer 4: Booking Conflict
 *
 * Fetches existing bookings and checks for conflicts.
 * Prevents double-booking by filtering out slots with active bookings.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { BookingRecord, TimeSlot } from '../types';
import { addMinutes } from '../utils/timeRange';

/**
 * Fetch bookings for multiple providers in a date range
 * Only fetches active bookings (not cancelled/rejected)
 */
export async function fetchBookings(
    supabase: SupabaseClient,
    providerIds: string[],
    startDate: string,
    endDate: string
): Promise<BookingRecord[]> {
    if (providerIds.length === 0) {
        return [];
    }

    // Convert date strings to full timestamps for the query
    const startTimestamp = `${startDate}T00:00:00Z`;
    const endTimestamp = `${endDate}T23:59:59Z`;

    // Note: bookings table will exist after migration 027 is applied
    const { data, error } = await (supabase as any)
        .from('bookings')
        .select('id, provider_id, start_time, end_time, buffer_before_minutes, buffer_after_minutes, status')
        .in('provider_id', providerIds)
        .gte('start_time', startTimestamp)
        .lte('start_time', endTimestamp)
        .not('status', 'in', '("cancelled","rejected")')
        .order('provider_id')
        .order('start_time', { ascending: true });

    if (error) {
        console.error('Error fetching bookings:', error);
        return [];
    }

    return (data || []).map((row: {
        id: string;
        provider_id: string;
        start_time: string;
        end_time: string;
        buffer_before_minutes: number;
        buffer_after_minutes: number;
        status: string;
    }) => ({
        id: row.id,
        providerId: row.provider_id,
        startTime: row.start_time,
        endTime: row.end_time,
        bufferBeforeMinutes: row.buffer_before_minutes,
        bufferAfterMinutes: row.buffer_after_minutes,
        status: row.status,
    }));
}

/**
 * Index bookings by provider for O(1) lookup
 */
export function indexBookingsByProvider(
    bookings: BookingRecord[]
): Map<string, BookingRecord[]> {
    const indexed = new Map<string, BookingRecord[]>();

    for (const booking of bookings) {
        const existing = indexed.get(booking.providerId) || [];
        existing.push(booking);
        indexed.set(booking.providerId, existing);
    }

    return indexed;
}

/**
 * Check if a slot conflicts with any existing booking for a provider
 */
export function hasBookingConflict(
    bookingsByProvider: Map<string, BookingRecord[]>,
    providerId: string,
    slotStart: Date,
    slotEnd: Date,
    bufferBefore: number,
    bufferAfter: number
): boolean {
    const bookings = bookingsByProvider.get(providerId);
    if (!bookings || bookings.length === 0) {
        return false;
    }

    // Calculate the slot's full range including buffers
    const slotFullStart = addMinutes(slotStart, -bufferBefore);
    const slotFullEnd = addMinutes(slotEnd, bufferAfter);

    for (const booking of bookings) {
        // Skip cancelled/rejected bookings (should already be filtered, but be safe)
        if (['cancelled', 'rejected'].includes(booking.status)) {
            continue;
        }

        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);
        const bookingFullStart = addMinutes(bookingStart, -booking.bufferBeforeMinutes);
        const bookingFullEnd = addMinutes(bookingEnd, booking.bufferAfterMinutes);

        // Check if the full ranges overlap
        if (slotFullStart < bookingFullEnd && bookingFullStart < slotFullEnd) {
            return true;
        }
    }

    return false;
}

/**
 * Filter slots to remove those with booking conflicts
 */
export function filterSlotsByBookings(
    slots: TimeSlot[],
    bookingsByProvider: Map<string, BookingRecord[]>,
    providerId: string,
    bufferBefore: number,
    bufferAfter: number
): TimeSlot[] {
    return slots.filter(slot => {
        const slotStart = new Date(slot.startTime);
        const slotEnd = new Date(slot.endTime);

        return !hasBookingConflict(
            bookingsByProvider,
            providerId,
            slotStart,
            slotEnd,
            bufferBefore,
            bufferAfter
        );
    });
}

/**
 * Get booking count for a provider in the date range
 * Useful for load balancing in "Any Provider" mode
 */
export function getProviderBookingCount(
    bookingsByProvider: Map<string, BookingRecord[]>,
    providerId: string
): number {
    const bookings = bookingsByProvider.get(providerId);
    if (!bookings) {
        return 0;
    }

    // Only count active bookings
    return bookings.filter(b => !['cancelled', 'rejected'].includes(b.status)).length;
}

/**
 * Calculate booking counts for all providers
 */
export function calculateAllBookingCounts(
    bookingsByProvider: Map<string, BookingRecord[]>,
    providerIds: string[]
): Map<string, number> {
    const counts = new Map<string, number>();

    for (const providerId of providerIds) {
        counts.set(providerId, getProviderBookingCount(bookingsByProvider, providerId));
    }

    return counts;
}
