/**
 * Layer 3: Provider Override
 *
 * Fetches and processes provider-level date-specific overrides.
 * These override the provider's base schedule for specific dates.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProviderOverride } from '../types';

/**
 * Fetch provider overrides for multiple providers in a date range
 */
export async function fetchProviderOverrides(
    supabase: SupabaseClient,
    providerIds: string[],
    startDate: string,
    endDate: string
): Promise<ProviderOverride[]> {
    if (providerIds.length === 0) {
        return [];
    }

    const { data, error } = await supabase
        .from('schedule_overrides')
        .select('id, provider_id, override_date, start_time, end_time, is_available, reason')
        .in('provider_id', providerIds)
        .gte('override_date', startDate)
        .lte('override_date', endDate)
        .order('provider_id')
        .order('override_date', { ascending: true });

    if (error) {
        console.error('Error fetching provider overrides:', error);
        return [];
    }

    return (data || []).map(row => ({
        id: row.id,
        providerId: row.provider_id,
        overrideDate: row.override_date,
        startTime: row.start_time,
        endTime: row.end_time,
        isAvailable: row.is_available,
        reason: row.reason,
    }));
}

/**
 * Index provider overrides by providerId, then by date
 */
export function indexProviderOverridesByDate(
    overrides: ProviderOverride[]
): Map<string, Map<string, ProviderOverride>> {
    const indexed = new Map<string, Map<string, ProviderOverride>>();

    for (const override of overrides) {
        if (!indexed.has(override.providerId)) {
            indexed.set(override.providerId, new Map());
        }
        indexed.get(override.providerId)!.set(override.overrideDate, override);
    }

    return indexed;
}

/**
 * Apply provider override to get effective windows for a provider on a date
 * Returns null if no override exists (use base schedule intersection)
 * Returns empty array if provider is unavailable
 * Returns override windows if partially available
 */
export function applyProviderOverride(
    overrideByDate: Map<string, Map<string, ProviderOverride>>,
    providerId: string,
    dateStr: string,
    baseWindows: Array<{ startTime: string; endTime: string }>
): Array<{ startTime: string; endTime: string }> | null {
    const providerOverrides = overrideByDate.get(providerId);
    if (!providerOverrides) {
        return null;
    }

    const override = providerOverrides.get(dateStr);
    if (!override) {
        return null;
    }

    if (!override.isAvailable) {
        // Provider is completely unavailable
        if (!override.startTime && !override.endTime) {
            return [];
        }

        // Partial unavailability - subtract the blocked window
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
 * Check if a provider has an override for a specific date
 */
export function hasProviderOverride(
    overrideByDate: Map<string, Map<string, ProviderOverride>>,
    providerId: string,
    dateStr: string
): boolean {
    const providerOverrides = overrideByDate.get(providerId);
    return providerOverrides?.has(dateStr) ?? false;
}

/**
 * Get the override for a specific provider and date
 */
export function getProviderOverride(
    overrideByDate: Map<string, Map<string, ProviderOverride>>,
    providerId: string,
    dateStr: string
): ProviderOverride | undefined {
    return overrideByDate.get(providerId)?.get(dateStr);
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
