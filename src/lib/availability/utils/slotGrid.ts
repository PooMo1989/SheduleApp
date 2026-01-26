/**
 * Slot Grid Utilities
 *
 * Generates time slots based on service configuration and schedule windows.
 */

import type { TimeSlot, TimeRange } from '../types';
import { addMinutes, getDurationMinutes, timeToMinutes, minutesToTime } from './timeRange';
import { createDateTimeInTimezone, formatTimeInTimezone } from './timezone';

/**
 * Generate time slots for a given day within available windows
 */
export function generateSlots(
    dateStr: string,
    availableWindows: Array<{ startTime: string; endTime: string }>,
    durationMinutes: number,
    intervalMinutes: number,
    timezone: string
): TimeSlot[] {
    const slots: TimeSlot[] = [];

    for (const window of availableWindows) {
        const windowStartMinutes = timeToMinutes(window.startTime);
        const windowEndMinutes = timeToMinutes(window.endTime);

        // Generate slots at regular intervals within this window
        let currentMinutes = windowStartMinutes;

        while (currentMinutes + durationMinutes <= windowEndMinutes) {
            const startTimeStr = minutesToTime(currentMinutes);
            const endTimeStr = minutesToTime(currentMinutes + durationMinutes);

            // Create actual Date objects in the target timezone
            const startTime = createDateTimeInTimezone(dateStr, startTimeStr, timezone);
            const endTime = createDateTimeInTimezone(dateStr, endTimeStr, timezone);

            slots.push({
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                durationMinutes,
            });

            currentMinutes += intervalMinutes;
        }
    }

    return slots;
}

/**
 * Generate slots from available time ranges (Date objects)
 */
export function generateSlotsFromRanges(
    ranges: TimeRange[],
    durationMinutes: number,
    intervalMinutes: number
): TimeSlot[] {
    const slots: TimeSlot[] = [];

    for (const range of ranges) {
        let currentStart = range.start;

        while (getDurationMinutes(currentStart, range.end) >= durationMinutes) {
            const endTime = addMinutes(currentStart, durationMinutes);

            slots.push({
                startTime: currentStart.toISOString(),
                endTime: endTime.toISOString(),
                durationMinutes,
            });

            currentStart = addMinutes(currentStart, intervalMinutes);
        }
    }

    return slots;
}

/**
 * Filter slots based on minimum notice time
 */
export function filterByMinNotice(
    slots: TimeSlot[],
    minNoticeHours: number
): TimeSlot[] {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() + minNoticeHours);

    return slots.filter(slot => new Date(slot.startTime) >= cutoffTime);
}

/**
 * Combine multiple schedule windows for a day
 * Handles overlapping windows by merging them
 */
export function combineScheduleWindows(
    windows: Array<{ startTime: string; endTime: string; isAvailable: boolean }>
): Array<{ startTime: string; endTime: string }> {
    // Filter to only available windows
    const available = windows
        .filter(w => w.isAvailable)
        .map(w => ({
            startMinutes: timeToMinutes(w.startTime),
            endMinutes: timeToMinutes(w.endTime),
        }))
        .sort((a, b) => a.startMinutes - b.startMinutes);

    if (available.length === 0) {
        return [];
    }

    // Merge overlapping windows
    const merged: Array<{ startMinutes: number; endMinutes: number }> = [available[0]];

    for (let i = 1; i < available.length; i++) {
        const current = available[i];
        const last = merged[merged.length - 1];

        if (current.startMinutes <= last.endMinutes) {
            // Overlapping or adjacent
            last.endMinutes = Math.max(last.endMinutes, current.endMinutes);
        } else {
            merged.push(current);
        }
    }

    return merged.map(w => ({
        startTime: minutesToTime(w.startMinutes),
        endTime: minutesToTime(w.endMinutes),
    }));
}

/**
 * Subtract blocked windows from available windows
 */
export function subtractBlockedWindows(
    availableWindows: Array<{ startTime: string; endTime: string }>,
    blockedWindows: Array<{ startTime: string; endTime: string }>
): Array<{ startTime: string; endTime: string }> {
    if (blockedWindows.length === 0) {
        return availableWindows;
    }

    let result = availableWindows.map(w => ({
        startMinutes: timeToMinutes(w.startTime),
        endMinutes: timeToMinutes(w.endTime),
    }));

    for (const blocked of blockedWindows) {
        const blockStart = timeToMinutes(blocked.startTime);
        const blockEnd = timeToMinutes(blocked.endTime);

        const newResult: Array<{ startMinutes: number; endMinutes: number }> = [];

        for (const window of result) {
            // No overlap - keep the window
            if (blockEnd <= window.startMinutes || blockStart >= window.endMinutes) {
                newResult.push(window);
                continue;
            }

            // Partial overlap - split the window
            if (blockStart > window.startMinutes) {
                newResult.push({
                    startMinutes: window.startMinutes,
                    endMinutes: blockStart,
                });
            }

            if (blockEnd < window.endMinutes) {
                newResult.push({
                    startMinutes: blockEnd,
                    endMinutes: window.endMinutes,
                });
            }
        }

        result = newResult;
    }

    return result.map(w => ({
        startTime: minutesToTime(w.startMinutes),
        endTime: minutesToTime(w.endMinutes),
    }));
}

/**
 * Calculate effective available windows for a day after applying all layers
 */
export function calculateEffectiveWindows(
    baseWindows: Array<{ startTime: string; endTime: string }>,
    overrideWindows: Array<{ startTime: string; endTime: string; isAvailable: boolean }> | null
): Array<{ startTime: string; endTime: string }> {
    // If there's an override for this day, it replaces the base schedule
    if (overrideWindows !== null) {
        return combineScheduleWindows(
            overrideWindows.map(w => ({ ...w, isAvailable: w.isAvailable ?? true }))
        );
    }

    return baseWindows;
}
