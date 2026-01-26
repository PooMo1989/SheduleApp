/**
 * Layer 5: Google Calendar
 *
 * Fetches external calendar events and filters out busy times.
 * This layer integrates with Google Calendar via OAuth.
 *
 * NOTE: This is a placeholder implementation. Full Google Calendar
 * integration requires OAuth setup and API calls which will be
 * implemented in a separate epic.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { CalendarEvent, TimeSlot } from '../types';
import { addMinutes } from '../utils/timeRange';

/**
 * Provider calendar configuration from database
 */
interface ProviderCalendarConfig {
    providerId: string;
    calendarId: string;
    accessToken: string;
    refreshToken: string;
    tokenExpiry: string;
    syncEnabled: boolean;
}

/**
 * Fetch provider calendar configurations
 */
export async function fetchProviderCalendarConfigs(
    supabase: SupabaseClient,
    providerIds: string[]
): Promise<ProviderCalendarConfig[]> {
    if (providerIds.length === 0) {
        return [];
    }

    const { data, error } = await supabase
        .from('provider_calendars')
        .select('provider_id, calendar_id, access_token, refresh_token, token_expiry, sync_enabled')
        .in('provider_id', providerIds)
        .eq('sync_enabled', true);

    if (error) {
        console.error('Error fetching provider calendar configs:', error);
        return [];
    }

    return (data || []).map(row => ({
        providerId: row.provider_id,
        calendarId: row.calendar_id,
        accessToken: row.access_token,
        refreshToken: row.refresh_token,
        tokenExpiry: row.token_expiry,
        syncEnabled: row.sync_enabled,
    }));
}

/**
 * Fetch calendar events from Google Calendar API
 * NOTE: This is a placeholder - actual implementation requires Google Calendar API setup
 */
export async function fetchCalendarEvents(
    _configs: ProviderCalendarConfig[],
    _startDate: string,
    _endDate: string
): Promise<CalendarEvent[]> {
    // TODO: Implement Google Calendar API integration
    // This will involve:
    // 1. Refreshing OAuth tokens if expired
    // 2. Calling Google Calendar API freebusy or events.list
    // 3. Parsing and normalizing the response

    // For now, return empty array (no external calendar blocking)
    return [];
}

/**
 * Index calendar events by provider
 */
export function indexCalendarEventsByProvider(
    events: CalendarEvent[]
): Map<string, CalendarEvent[]> {
    const indexed = new Map<string, CalendarEvent[]>();

    for (const event of events) {
        const existing = indexed.get(event.providerId) || [];
        existing.push(event);
        indexed.set(event.providerId, existing);
    }

    return indexed;
}

/**
 * Check if a slot conflicts with any calendar event
 */
export function hasCalendarConflict(
    calendarEventsByProvider: Map<string, CalendarEvent[]>,
    providerId: string,
    slotStart: Date,
    slotEnd: Date
): boolean {
    const events = calendarEventsByProvider.get(providerId);
    if (!events || events.length === 0) {
        return false;
    }

    for (const event of events) {
        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);

        // For all-day events, check date overlap
        if (event.isAllDay) {
            const slotDate = slotStart.toISOString().split('T')[0];
            const eventDate = eventStart.toISOString().split('T')[0];
            if (slotDate === eventDate) {
                return true;
            }
            continue;
        }

        // Check time range overlap
        if (slotStart < eventEnd && eventStart < slotEnd) {
            return true;
        }
    }

    return false;
}

/**
 * Filter slots to remove those with calendar conflicts
 */
export function filterSlotsByCalendar(
    slots: TimeSlot[],
    calendarEventsByProvider: Map<string, CalendarEvent[]>,
    providerId: string
): TimeSlot[] {
    return slots.filter(slot => {
        const slotStart = new Date(slot.startTime);
        const slotEnd = new Date(slot.endTime);

        return !hasCalendarConflict(
            calendarEventsByProvider,
            providerId,
            slotStart,
            slotEnd
        );
    });
}

/**
 * Check if a provider has calendar sync enabled
 */
export function hasCalendarSyncEnabled(
    configs: ProviderCalendarConfig[],
    providerId: string
): boolean {
    return configs.some(c => c.providerId === providerId && c.syncEnabled);
}
