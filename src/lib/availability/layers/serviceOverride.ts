/**
 * Layer 1.5: Service Override
 *
 * Fetches and processes service-level date-specific overrides.
 * These override the base service schedule for specific dates.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ServiceOverride } from '../types';

/**
 * Fetch service overrides for a date range
 */
export async function fetchServiceOverrides(
    supabase: SupabaseClient,
    serviceId: string,
    startDate: string,
    endDate: string
): Promise<ServiceOverride[]> {
    const { data, error } = await supabase
        .from('service_schedule_overrides')
        .select('id, service_id, override_date, start_time, end_time, is_available, reason')
        .eq('service_id', serviceId)
        .gte('override_date', startDate)
        .lte('override_date', endDate)
        .order('override_date', { ascending: true });

    if (error) {
        console.error('Error fetching service overrides:', error);
        return [];
    }

    return (data || []).map(row => ({
        id: row.id,
        serviceId: row.service_id,
        overrideDate: row.override_date,
        startTime: row.start_time,
        endTime: row.end_time,
        isAvailable: row.is_available,
        reason: row.reason,
    }));
}

/**
 * Index service overrides by date for O(1) lookup
 */
export function indexServiceOverridesByDate(
    overrides: ServiceOverride[]
): Map<string, ServiceOverride> {
    const indexed = new Map<string, ServiceOverride>();

    for (const override of overrides) {
        indexed.set(override.overrideDate, override);
    }

    return indexed;
}

/**
 * Apply service override to get effective windows for a date
 * Returns null if no override exists (use base schedule)
 * Returns empty array if day is blocked
 * Returns override windows if partially available
 */
export function applyServiceOverride(
    overrideByDate: Map<string, ServiceOverride>,
    dateStr: string,
    baseWindows: Array<{ startTime: string; endTime: string }>
): Array<{ startTime: string; endTime: string }> | null {
    const override = overrideByDate.get(dateStr);

    if (!override) {
        // No override for this date - use base schedule
        return null;
    }

    if (!override.isAvailable) {
        // Day is completely blocked
        if (!override.startTime && !override.endTime) {
            return [];
        }

        // Partial block - remove the blocked window from base
        if (override.startTime && override.endTime) {
            return subtractWindow(baseWindows, {
                startTime: override.startTime,
                endTime: override.endTime,
            });
        }
    }

    // Override specifies available hours (replaces base)
    if (override.startTime && override.endTime) {
        return [{
            startTime: override.startTime,
            endTime: override.endTime,
        }];
    }

    // Available but no specific times - use base
    return null;
}

/**
 * Helper: Subtract a blocked window from available windows
 */
function subtractWindow(
    windows: Array<{ startTime: string; endTime: string }>,
    blocked: { startTime: string; endTime: string }
): Array<{ startTime: string; endTime: string }> {
    const result: Array<{ startTime: string; endTime: string }> = [];

    for (const window of windows) {
        // No overlap
        if (blocked.endTime <= window.startTime || blocked.startTime >= window.endTime) {
            result.push(window);
            continue;
        }

        // Before the blocked window
        if (blocked.startTime > window.startTime) {
            result.push({
                startTime: window.startTime,
                endTime: blocked.startTime,
            });
        }

        // After the blocked window
        if (blocked.endTime < window.endTime) {
            result.push({
                startTime: blocked.endTime,
                endTime: window.endTime,
            });
        }
    }

    return result;
}
