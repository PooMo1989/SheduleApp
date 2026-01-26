/**
 * Layer 2: Provider Schedule
 *
 * Fetches and processes provider-level weekly recurring schedules.
 * Availability is the INTERSECTION of service schedule and provider schedule.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProviderScheduleSlot } from '../types';

/**
 * Fetch provider schedules for multiple providers
 */
export async function fetchProviderSchedules(
    supabase: SupabaseClient,
    providerIds: string[]
): Promise<ProviderScheduleSlot[]> {
    if (providerIds.length === 0) {
        return [];
    }

    const { data, error } = await supabase
        .from('provider_schedules')
        .select('id, provider_id, day_of_week, start_time, end_time, is_available')
        .in('provider_id', providerIds)
        .order('provider_id')
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

    if (error) {
        console.error('Error fetching provider schedules:', error);
        return [];
    }

    return (data || []).map(row => ({
        id: row.id,
        providerId: row.provider_id,
        dayOfWeek: row.day_of_week,
        startTime: row.start_time,
        endTime: row.end_time,
        isAvailable: row.is_available,
    }));
}

/**
 * Index provider schedules by providerId, then by day of week
 */
export function indexProviderSchedulesByDay(
    schedules: ProviderScheduleSlot[]
): Map<string, Map<number, ProviderScheduleSlot[]>> {
    const indexed = new Map<string, Map<number, ProviderScheduleSlot[]>>();

    for (const slot of schedules) {
        if (!indexed.has(slot.providerId)) {
            indexed.set(slot.providerId, new Map());
        }
        const providerMap = indexed.get(slot.providerId)!;

        const existing = providerMap.get(slot.dayOfWeek) || [];
        existing.push(slot);
        providerMap.set(slot.dayOfWeek, existing);
    }

    return indexed;
}

/**
 * Get available windows for a provider on a specific day of week
 */
export function getProviderWindowsForDay(
    scheduleByDay: Map<string, Map<number, ProviderScheduleSlot[]>>,
    providerId: string,
    dayOfWeek: number
): Array<{ startTime: string; endTime: string }> {
    const providerSchedule = scheduleByDay.get(providerId);
    if (!providerSchedule) {
        return [];
    }

    const slots = providerSchedule.get(dayOfWeek) || [];

    return slots
        .filter(slot => slot.isAvailable)
        .map(slot => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
        }));
}

/**
 * Calculate intersection of service windows and provider windows
 * Returns the time ranges where both are available
 */
export function intersectWindows(
    serviceWindows: Array<{ startTime: string; endTime: string }>,
    providerWindows: Array<{ startTime: string; endTime: string }>
): Array<{ startTime: string; endTime: string }> {
    const result: Array<{ startTime: string; endTime: string }> = [];

    for (const serviceWindow of serviceWindows) {
        for (const providerWindow of providerWindows) {
            // Find the overlap
            const start = serviceWindow.startTime > providerWindow.startTime
                ? serviceWindow.startTime
                : providerWindow.startTime;
            const end = serviceWindow.endTime < providerWindow.endTime
                ? serviceWindow.endTime
                : providerWindow.endTime;

            // Only add if there's a valid overlap
            if (start < end) {
                result.push({ startTime: start, endTime: end });
            }
        }
    }

    return result;
}

/**
 * Check if a provider has any schedule defined
 */
export function hasProviderSchedule(
    scheduleByDay: Map<string, Map<number, ProviderScheduleSlot[]>>,
    providerId: string
): boolean {
    const providerSchedule = scheduleByDay.get(providerId);
    if (!providerSchedule) {
        return false;
    }

    for (const slots of providerSchedule.values()) {
        if (slots.some(s => s.isAvailable)) {
            return true;
        }
    }
    return false;
}
