/**
 * Availability Engine
 *
 * Main entry point for the 5-layer availability calculation system.
 * Implements the algorithm in 5 phases:
 * 1. Resolve Context - Fetch service/tenant/provider configs
 * 2. Date Boundary - Apply min_notice_hours, max_future_days
 * 3. Batch Fetch - Single DB round-trip for all layer data
 * 4. Per-Date Processing - Apply L1 → L1.5 → L2 → L3 → L4 → L5 filters
 * 5. Aggregation - Handle "Any Provider" mode, group class capacity
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
    AvailabilityRequest,
    AvailabilityResponse,
    AvailabilityContext,
    DayAvailability,
    AvailableSlot,
    LayerData,
    SlotCheckRequest,
    SlotCheckResponse,
    ServiceContext,
    TenantConfig,
    ProviderContext,
} from './types';

// Layer imports
import {
    fetchServiceSchedule,
    indexServiceScheduleByDay,
    getServiceWindowsForDay,
} from './layers/serviceSchedule';
import {
    fetchServiceOverrides,
    indexServiceOverridesByDate,
    applyServiceOverride,
} from './layers/serviceOverride';
import {
    fetchProviderSchedules,
    indexProviderSchedulesByDay,
    getProviderWindowsForDay,
    intersectWindows,
} from './layers/providerSchedule';
import {
    fetchProviderOverrides,
    indexProviderOverridesByDate,
    applyProviderOverride,
} from './layers/providerOverride';
import {
    fetchBookings,
    indexBookingsByProvider,
    hasBookingConflict,
    calculateAllBookingCounts,
} from './layers/bookingConflict';
import {
    fetchProviderCalendarConfigs,
    fetchCalendarEvents,
    indexCalendarEventsByProvider,
    hasCalendarConflict,
} from './layers/googleCalendar';

// Utility imports
import {
    getDateRange,
    getDayOfWeekInTimezone,
    getTodayInTimezone,
    addDays,
} from './utils/timezone';
import { generateSlots, filterByMinNotice } from './utils/slotGrid';
import { selectProvider } from './utils/providerAssignment';

/**
 * Main availability calculation function
 */
export async function getAvailability(
    supabase: SupabaseClient,
    request: AvailabilityRequest
): Promise<AvailabilityResponse> {
    // Phase 1: Resolve Context
    const context = await resolveContext(supabase, request);

    // Phase 2: Date Boundary - Apply constraints
    const { startDate, endDate } = applyDateBoundaries(
        request.startDate,
        request.endDate,
        context.tenant,
        request.timezone
    );

    // Early exit if no valid date range
    if (startDate > endDate) {
        return createEmptyResponse(request, context);
    }

    // Phase 3: Batch Fetch - Single round-trip for all layer data
    const providerIds = context.requestedProviderId
        ? [context.requestedProviderId]
        : context.providers.map(p => p.id);

    const layerData = await batchFetchLayerData(
        supabase,
        context.service.id,
        providerIds,
        startDate,
        endDate
    );

    // Phase 4: Per-Date Processing
    const dates = getDateRange(startDate, endDate);
    const days: DayAvailability[] = [];

    for (const dateStr of dates) {
        const dayAvailability = processSingleDay(
            dateStr,
            context,
            layerData,
            providerIds,
            request.timezone
        );
        days.push(dayAvailability);
    }

    // Phase 5: Apply min notice filter and aggregation
    const filteredDays = days.map(day => ({
        ...day,
        slots: filterByMinNotice(day.slots, context.tenant.minNoticeHours),
    }));

    // Recalculate hasAvailability after filtering
    const finalDays = filteredDays.map(day => ({
        ...day,
        hasAvailability: day.slots.length > 0,
    }));

    const totalSlots = finalDays.reduce((sum, day) => sum + day.slots.length, 0);

    return {
        serviceId: request.serviceId,
        tenantId: request.tenantId,
        dateRange: { start: startDate, end: endDate },
        days: finalDays,
        totalSlots,
        anyProviderMode: !request.providerId,
        serviceConfig: {
            name: context.service.name,
            durationMinutes: context.service.durationMinutes,
            bufferBeforeMinutes: context.service.bufferBeforeMinutes,
            bufferAfterMinutes: context.service.bufferAfterMinutes,
            type: context.service.type,
            maxParticipants: context.service.maxParticipants,
        },
    };
}

/**
 * Check if a specific slot is available (real-time check)
 */
export async function checkSlot(
    supabase: SupabaseClient,
    request: SlotCheckRequest
): Promise<SlotCheckResponse> {
    const slotStart = new Date(request.startTime);
    const dateStr = request.startTime.split('T')[0];

    // Fetch service config
    const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('id, duration_minutes, buffer_before_minutes, buffer_after_minutes')
        .eq('id', request.serviceId)
        .single();

    if (serviceError || !service) {
        return { available: false, reason: 'Service not found' };
    }

    const slotEnd = new Date(slotStart.getTime() + service.duration_minutes * 60 * 1000);

    // Check bookings (L4)
    // Note: bookings table will exist after migration 027 is applied
    const { data: conflictingBookings } = await (supabase as any)
        .from('bookings')
        .select('id')
        .eq('provider_id', request.providerId)
        .not('status', 'in', '("cancelled","rejected")')
        .lt('start_time', slotEnd.toISOString())
        .gt('end_time', slotStart.toISOString())
        .limit(1);

    if (conflictingBookings && conflictingBookings.length > 0) {
        return { available: false, reason: 'Time slot already booked', conflictType: 'booking' };
    }

    // Check provider override (L3)
    const { data: override } = await supabase
        .from('schedule_overrides')
        .select('is_available')
        .eq('provider_id', request.providerId)
        .eq('override_date', dateStr)
        .single();

    if (override && !override.is_available) {
        return { available: false, reason: 'Provider unavailable on this date', conflictType: 'override' };
    }

    return { available: true };
}

/**
 * Get available providers for a specific slot
 */
export async function getProvidersForSlot(
    supabase: SupabaseClient,
    serviceId: string,
    tenantId: string,
    startTime: string,
    endTime: string
): Promise<ProviderContext[]> {
    // Get all providers linked to this service
    const { data: serviceProviders } = await supabase
        .from('service_providers')
        .select(`
            provider_id,
            providers (
                id,
                user_id,
                display_name,
                is_active
            )
        `)
        .eq('service_id', serviceId);

    if (!serviceProviders || serviceProviders.length === 0) {
        return [];
    }

    const slotStart = new Date(startTime);
    const slotEnd = new Date(endTime);
    const dateStr = startTime.split('T')[0];

    const availableProviders: ProviderContext[] = [];

    for (const sp of serviceProviders) {
        const provider = sp.providers as unknown as {
            id: string;
            user_id: string;
            display_name: string;
            is_active: boolean;
        } | null;

        if (!provider || !provider.is_active) continue;

        // Check for booking conflicts
        // Note: bookings table will exist after migration 027 is applied
        const { data: conflicts } = await (supabase as any)
            .from('bookings')
            .select('id')
            .eq('provider_id', provider.id)
            .not('status', 'in', '("cancelled","rejected")')
            .lt('start_time', endTime)
            .gt('end_time', startTime)
            .limit(1);

        if (conflicts && conflicts.length > 0) continue;

        // Check for override blocking
        const { data: override } = await supabase
            .from('schedule_overrides')
            .select('is_available')
            .eq('provider_id', provider.id)
            .eq('override_date', dateStr)
            .single();

        if (override && !override.is_available) continue;

        availableProviders.push({
            id: provider.id,
            userId: provider.user_id,
            displayName: provider.display_name || 'Provider',
            isActive: provider.is_active,
        });
    }

    return availableProviders;
}

// ============================================================
// Internal Helper Functions
// ============================================================

/**
 * Phase 1: Resolve context - fetch service, tenant, and provider configs
 */
async function resolveContext(
    supabase: SupabaseClient,
    request: AvailabilityRequest
): Promise<AvailabilityContext> {
    // Fetch service
    const { data: service, error: serviceError } = await supabase
        .from('services')
        .select(`
            id,
            tenant_id,
            name,
            service_type,
            duration_minutes,
            buffer_before_minutes,
            buffer_after_minutes,
            max_participants,
            is_active
        `)
        .eq('id', request.serviceId)
        .single();

    if (serviceError || !service) {
        throw new Error('Service not found');
    }

    // Fetch tenant config
    const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select(`
            id,
            timezone,
            slot_interval_minutes,
            min_notice_hours,
            max_future_days
        `)
        .eq('id', request.tenantId)
        .single();

    if (tenantError || !tenant) {
        throw new Error('Tenant not found');
    }

    // Fetch providers linked to this service
    const { data: serviceProviders } = await supabase
        .from('service_providers')
        .select(`
            provider_id,
            providers (
                id,
                user_id,
                display_name,
                is_active
            )
        `)
        .eq('service_id', request.serviceId);

    const providers: ProviderContext[] = (serviceProviders || [])
        .filter(sp => {
            const p = sp.providers as unknown as { is_active: boolean } | null;
            return p && p.is_active;
        })
        .map(sp => {
            const p = sp.providers as unknown as {
                id: string;
                user_id: string;
                display_name: string;
                is_active: boolean;
            };
            return {
                id: p.id,
                userId: p.user_id,
                displayName: p.display_name || 'Provider',
                isActive: p.is_active,
            };
        });

    // If specific provider requested, validate they're linked to service
    if (request.providerId) {
        const isLinked = providers.some(p => p.id === request.providerId);
        if (!isLinked) {
            throw new Error('Provider not linked to service');
        }
    }

    return {
        service: {
            id: service.id,
            tenantId: service.tenant_id,
            name: service.name,
            type: service.service_type as 'consultation' | 'class',
            durationMinutes: service.duration_minutes,
            bufferBeforeMinutes: service.buffer_before_minutes || 0,
            bufferAfterMinutes: service.buffer_after_minutes || 0,
            maxParticipants: service.max_participants,
            isActive: service.is_active,
        },
        tenant: {
            id: tenant.id,
            timezone: tenant.timezone || 'UTC',
            slotIntervalMinutes: tenant.slot_interval_minutes || 30,
            minNoticeHours: tenant.min_notice_hours || 1,
            maxFutureDays: tenant.max_future_days || 60,
        },
        providers,
        requestedProviderId: request.providerId,
    };
}

/**
 * Phase 2: Apply date boundary constraints
 */
function applyDateBoundaries(
    requestedStart: string,
    requestedEnd: string,
    tenant: TenantConfig,
    timezone: string
): { startDate: string; endDate: string } {
    const today = getTodayInTimezone(timezone);

    // Calculate earliest bookable date based on min_notice_hours
    // (Simplified - actual implementation would be more precise)
    const earliestDate = today;

    // Calculate latest bookable date based on max_future_days
    const latestDate = addDays(today, tenant.maxFutureDays);

    // Clamp requested range to allowed boundaries
    let startDate = requestedStart;
    let endDate = requestedEnd;

    if (startDate < earliestDate) {
        startDate = earliestDate;
    }
    if (endDate > latestDate) {
        endDate = latestDate;
    }

    return { startDate, endDate };
}

/**
 * Phase 3: Batch fetch all layer data in parallel
 */
async function batchFetchLayerData(
    supabase: SupabaseClient,
    serviceId: string,
    providerIds: string[],
    startDate: string,
    endDate: string
): Promise<LayerData> {
    // Fetch all layer data in parallel
    const [
        serviceSchedule,
        serviceOverrides,
        providerSchedules,
        providerOverrides,
        bookings,
        calendarConfigs,
    ] = await Promise.all([
        fetchServiceSchedule(supabase, serviceId),
        fetchServiceOverrides(supabase, serviceId, startDate, endDate),
        fetchProviderSchedules(supabase, providerIds),
        fetchProviderOverrides(supabase, providerIds, startDate, endDate),
        fetchBookings(supabase, providerIds, startDate, endDate),
        fetchProviderCalendarConfigs(supabase, providerIds),
    ]);

    // Fetch calendar events (L5) - currently returns empty
    const calendarEvents = await fetchCalendarEvents(calendarConfigs, startDate, endDate);

    // Index all data for O(1) lookups
    return {
        serviceScheduleByDay: indexServiceScheduleByDay(serviceSchedule),
        serviceOverrideByDate: indexServiceOverridesByDate(serviceOverrides),
        providerScheduleByDay: indexProviderSchedulesByDay(providerSchedules),
        providerOverrideByDate: indexProviderOverridesByDate(providerOverrides),
        bookingsByProvider: indexBookingsByProvider(bookings),
        calendarEventsByProvider: indexCalendarEventsByProvider(calendarEvents),
    };
}

/**
 * Phase 4: Process a single day through all layers
 */
function processSingleDay(
    dateStr: string,
    context: AvailabilityContext,
    layerData: LayerData,
    providerIds: string[],
    timezone: string
): DayAvailability {
    const dayOfWeek = getDayOfWeekInTimezone(new Date(dateStr + 'T12:00:00Z'), timezone);

    // L1: Get service schedule for this day
    let serviceWindows = getServiceWindowsForDay(
        layerData.serviceScheduleByDay,
        dayOfWeek
    );

    // L1.5: Apply service override if exists
    const serviceOverrideResult = applyServiceOverride(
        layerData.serviceOverrideByDate,
        dateStr,
        serviceWindows
    );
    if (serviceOverrideResult !== null) {
        serviceWindows = serviceOverrideResult;
    }

    // If no service windows, no availability
    if (serviceWindows.length === 0) {
        return { date: dateStr, hasAvailability: false, slots: [] };
    }

    // Calculate booking counts for provider selection
    const bookingCounts = calculateAllBookingCounts(
        layerData.bookingsByProvider,
        providerIds
    );

    // Process each provider
    const allSlots: AvailableSlot[] = [];
    let slotIndex = 0;

    for (const providerId of providerIds) {
        // L2: Get provider schedule and intersect with service
        const providerWindows = getProviderWindowsForDay(
            layerData.providerScheduleByDay,
            providerId,
            dayOfWeek
        );

        let effectiveWindows = intersectWindows(serviceWindows, providerWindows);

        // L3: Apply provider override if exists
        const providerOverrideResult = applyProviderOverride(
            layerData.providerOverrideByDate,
            providerId,
            dateStr,
            effectiveWindows
        );
        if (providerOverrideResult !== null) {
            effectiveWindows = providerOverrideResult;
        }

        if (effectiveWindows.length === 0) {
            continue;
        }

        // Generate time slots from effective windows
        const slots = generateSlots(
            dateStr,
            effectiveWindows,
            context.service.durationMinutes,
            context.tenant.slotIntervalMinutes,
            timezone
        );

        // Filter slots through L4 (bookings) and L5 (calendar)
        for (const slot of slots) {
            const slotStart = new Date(slot.startTime);
            const slotEnd = new Date(slot.endTime);

            // L4: Check booking conflicts
            const hasBooking = hasBookingConflict(
                layerData.bookingsByProvider,
                providerId,
                slotStart,
                slotEnd,
                context.service.bufferBeforeMinutes,
                context.service.bufferAfterMinutes
            );

            if (hasBooking) {
                continue;
            }

            // L5: Check calendar conflicts
            const hasCalendar = hasCalendarConflict(
                layerData.calendarEventsByProvider,
                providerId,
                slotStart,
                slotEnd
            );

            if (hasCalendar) {
                continue;
            }

            // Slot is available!
            const provider = context.providers.find(p => p.id === providerId);

            allSlots.push({
                ...slot,
                providerId: context.requestedProviderId ? providerId : undefined,
                providerName: provider?.displayName,
                availableProviderIds: context.requestedProviderId ? undefined : [providerId],
            });

            slotIndex++;
        }
    }

    // Aggregate slots for "Any Provider" mode
    const aggregatedSlots = context.requestedProviderId
        ? allSlots
        : aggregateSlotsAnyProvider(allSlots);

    return {
        date: dateStr,
        hasAvailability: aggregatedSlots.length > 0,
        slots: aggregatedSlots,
    };
}

/**
 * Aggregate slots when in "Any Provider" mode
 * Combines slots at the same time from different providers
 */
function aggregateSlotsAnyProvider(slots: AvailableSlot[]): AvailableSlot[] {
    const slotMap = new Map<string, AvailableSlot>();

    for (const slot of slots) {
        const key = slot.startTime;
        const existing = slotMap.get(key);

        if (existing) {
            // Combine provider IDs
            existing.availableProviderIds = [
                ...(existing.availableProviderIds || []),
                ...(slot.availableProviderIds || []),
            ];
        } else {
            slotMap.set(key, { ...slot });
        }
    }

    return Array.from(slotMap.values()).sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
    );
}

/**
 * Create an empty response (used when no valid date range)
 */
function createEmptyResponse(
    request: AvailabilityRequest,
    context: AvailabilityContext
): AvailabilityResponse {
    return {
        serviceId: request.serviceId,
        tenantId: request.tenantId,
        dateRange: { start: request.startDate, end: request.endDate },
        days: [],
        totalSlots: 0,
        anyProviderMode: !request.providerId,
        serviceConfig: {
            name: context.service.name,
            durationMinutes: context.service.durationMinutes,
            bufferBeforeMinutes: context.service.bufferBeforeMinutes,
            bufferAfterMinutes: context.service.bufferAfterMinutes,
            type: context.service.type,
            maxParticipants: context.service.maxParticipants,
        },
    };
}
