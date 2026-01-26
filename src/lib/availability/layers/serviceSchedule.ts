/**
 * Layer 1: Service Schedule
 *
 * Fetches and processes service-level weekly recurring schedules.
 * This is the base layer that defines when a service is offered.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ServiceScheduleSlot } from '../types';

/**
 * Fetch service schedule from database
 */
export async function fetchServiceSchedule(
    supabase: SupabaseClient,
    serviceId: string
): Promise<ServiceScheduleSlot[]> {
    const { data, error } = await supabase
        .from('service_schedules')
        .select('id, service_id, day_of_week, start_time, end_time, is_available')
        .eq('service_id', serviceId)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

    if (error) {
        console.error('Error fetching service schedule:', error);
        return [];
    }

    return (data || []).map(row => ({
        id: row.id,
        serviceId: row.service_id,
        dayOfWeek: row.day_of_week,
        startTime: row.start_time,
        endTime: row.end_time,
        isAvailable: row.is_available,
    }));
}

/**
 * Index service schedule by day of week for O(1) lookup
 */
export function indexServiceScheduleByDay(
    schedule: ServiceScheduleSlot[]
): Map<number, ServiceScheduleSlot[]> {
    const indexed = new Map<number, ServiceScheduleSlot[]>();

    for (const slot of schedule) {
        const existing = indexed.get(slot.dayOfWeek) || [];
        existing.push(slot);
        indexed.set(slot.dayOfWeek, existing);
    }

    return indexed;
}

/**
 * Get available windows for a specific day of week from service schedule
 */
export function getServiceWindowsForDay(
    scheduleByDay: Map<number, ServiceScheduleSlot[]>,
    dayOfWeek: number
): Array<{ startTime: string; endTime: string }> {
    const slots = scheduleByDay.get(dayOfWeek) || [];

    return slots
        .filter(slot => slot.isAvailable)
        .map(slot => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
        }));
}

/**
 * Check if a service has any schedule defined
 */
export function hasServiceSchedule(
    scheduleByDay: Map<number, ServiceScheduleSlot[]>
): boolean {
    for (const slots of scheduleByDay.values()) {
        if (slots.some(s => s.isAvailable)) {
            return true;
        }
    }
    return false;
}
