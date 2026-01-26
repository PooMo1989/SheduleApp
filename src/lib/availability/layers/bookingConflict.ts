
import type { SupabaseClient } from '@supabase/supabase-js';
import type { BookingRecord } from '../types';

/**
 * Fetch bookings for providers within a date range
 */
export async function fetchBookings(
    supabase: SupabaseClient,
    providerIds: string[],
    startDateTime: string, // ISO UTC
    endDateTime: string    // ISO UTC
): Promise<BookingRecord[]> {
    if (providerIds.length === 0) return [];

    const { data, error } = await supabase
        .from('bookings')
        .select('id, provider_id, start_time, end_time, status')
        .in('provider_id', providerIds)
        .or('status.eq.PENDING,status.eq.CONFIRMED,status.eq.APPROVED') // Filter out CANCELLED/REJECTED
        .filter('end_time', 'gt', startDateTime) // Overlap logic: Booking Ends AFTER Range Start
        .filter('start_time', 'lt', endDateTime); // AND Booking Starts BEFORE Range End

    if (error) {
        console.error('Error fetching internal bookings:', error);
        return [];
    }

    return (data || []).map(row => ({
        id: row.id,
        providerId: row.provider_id,
        startTime: row.start_time,
        endTime: row.end_time,
        status: row.status,
        bufferBeforeMinutes: 0,
        bufferAfterMinutes: 0
    }));
}

/**
 * Index bookings by provider for fast lookup
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
 * Check if a slot overlaps with any existing booking
 * Applies buffer times to the check.
 */
export function hasBookingConflict(
    bookingsByProvider: Map<string, BookingRecord[]>,
    providerId: string,
    slotStart: Date,
    slotEnd: Date,
    bufferBeforeMinutes: number = 0,
    bufferAfterMinutes: number = 0
): boolean {
    const bookings = bookingsByProvider.get(providerId);
    if (!bookings || bookings.length === 0) return false;

    // Expand slot by buffers
    // Effective Slot = [Start - BufferBefore, End + BufferAfter]
    const checkStart = new Date(slotStart.getTime() - bufferBeforeMinutes * 60000);
    const checkEnd = new Date(slotEnd.getTime() + bufferAfterMinutes * 60000);

    for (const booking of bookings) {
        const bookedStart = new Date(booking.startTime);
        const bookedEnd = new Date(booking.endTime);

        // Standard overlap check
        if (checkStart < bookedEnd && checkEnd > bookedStart) {
            return true;
        }
    }
    return false;
}

/**
 * Calculate total booking counts per provider for the date range
 * Used for "Least Busy" load balancing strategy
 */
export function calculateAllBookingCounts(
    bookingsByProvider: Map<string, BookingRecord[]>,
    providerIds: string[]
): Map<string, number> {
    const counts = new Map<string, number>();
    for (const providerId of providerIds) {
        const bookings = bookingsByProvider.get(providerId) || [];
        counts.set(providerId, bookings.length);
    }
    return counts;
}
