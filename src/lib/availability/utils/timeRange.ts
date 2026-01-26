/**
 * Time Range Utilities
 *
 * Helpers for time range operations and conflict detection.
 */

import type { TimeRange } from '../types';

/**
 * Check if two time ranges overlap
 */
export function rangesOverlap(range1: TimeRange, range2: TimeRange): boolean {
    return range1.start < range2.end && range2.start < range1.end;
}

/**
 * Check if range1 contains range2 completely
 */
export function rangeContains(container: TimeRange, contained: TimeRange): boolean {
    return container.start <= contained.start && container.end >= contained.end;
}

/**
 * Get the intersection of two time ranges (or null if no overlap)
 */
export function rangeIntersection(range1: TimeRange, range2: TimeRange): TimeRange | null {
    if (!rangesOverlap(range1, range2)) {
        return null;
    }

    return {
        start: new Date(Math.max(range1.start.getTime(), range2.start.getTime())),
        end: new Date(Math.min(range1.end.getTime(), range2.end.getTime())),
    };
}

/**
 * Subtract range2 from range1, returning the remaining ranges
 */
export function rangeSubtract(range1: TimeRange, range2: TimeRange): TimeRange[] {
    if (!rangesOverlap(range1, range2)) {
        return [range1];
    }

    const result: TimeRange[] = [];

    // Part before the subtracted range
    if (range1.start < range2.start) {
        result.push({
            start: range1.start,
            end: new Date(Math.min(range1.end.getTime(), range2.start.getTime())),
        });
    }

    // Part after the subtracted range
    if (range1.end > range2.end) {
        result.push({
            start: new Date(Math.max(range1.start.getTime(), range2.end.getTime())),
            end: range1.end,
        });
    }

    return result;
}

/**
 * Merge overlapping time ranges into a single range
 */
export function mergeRanges(ranges: TimeRange[]): TimeRange[] {
    if (ranges.length <= 1) {
        return ranges;
    }

    // Sort by start time
    const sorted = [...ranges].sort((a, b) => a.start.getTime() - b.start.getTime());

    const merged: TimeRange[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
        const current = sorted[i];
        const last = merged[merged.length - 1];

        if (current.start <= last.end) {
            // Overlapping or adjacent, extend the last range
            last.end = new Date(Math.max(last.end.getTime(), current.end.getTime()));
        } else {
            // No overlap, add as new range
            merged.push(current);
        }
    }

    return merged;
}

/**
 * Check if a time (HH:MM) falls within a time range (HH:MM - HH:MM) on the same day
 */
export function timeInRange(time: string, rangeStart: string, rangeEnd: string): boolean {
    return time >= rangeStart && time < rangeEnd;
}

/**
 * Parse HH:MM time string to minutes since midnight
 */
export function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to HH:MM format
 */
export function minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Add minutes to a Date
 */
export function addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60 * 1000);
}

/**
 * Get duration in minutes between two Dates
 */
export function getDurationMinutes(start: Date, end: Date): number {
    return Math.round((end.getTime() - start.getTime()) / (60 * 1000));
}

/**
 * Create a TimeRange from start Date and duration in minutes
 */
export function createRange(start: Date, durationMinutes: number): TimeRange {
    return {
        start,
        end: addMinutes(start, durationMinutes),
    };
}

/**
 * Check if a slot conflicts with any booking in the list
 * Considers buffer times for proper conflict detection
 */
export function hasBookingConflict(
    slotStart: Date,
    slotEnd: Date,
    bufferBefore: number,
    bufferAfter: number,
    bookings: Array<{
        startTime: string;
        endTime: string;
        bufferBeforeMinutes: number;
        bufferAfterMinutes: number;
        status: string;
    }>
): boolean {
    // Only consider active bookings
    const activeBookings = bookings.filter(
        b => !['cancelled', 'rejected'].includes(b.status)
    );

    // Calculate the slot's full range including buffers
    const slotFullStart = addMinutes(slotStart, -bufferBefore);
    const slotFullEnd = addMinutes(slotEnd, bufferAfter);

    for (const booking of activeBookings) {
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
