/**
 * Availability Engine - Public API
 *
 * 5-Layer Availability System:
 * - L1: Service Schedule (weekly recurring)
 * - L1.5: Service Override (date-specific)
 * - L2: Provider Schedule (weekly recurring)
 * - L3: Provider Override (date-specific)
 * - L4: Internal Bookings (conflict check)
 * - L5: External Calendar (Google Calendar)
 *
 * Usage:
 * ```typescript
 * import { getAvailability, checkSlot } from '@/lib/availability';
 *
 * const availability = await getAvailability(supabase, {
 *   serviceId: 'xxx',
 *   tenantId: 'xxx',
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-07',
 *   timezone: 'America/New_York',
 * });
 * ```
 */

// Main engine functions
export {
    getAvailability,
    checkSlot,
    getProvidersForSlot,
} from './engine';

// Types
export type {
    // Request/Response types
    AvailabilityRequest,
    AvailabilityResponse,
    SlotCheckRequest,
    SlotCheckResponse,

    // Slot types
    TimeSlot,
    AvailableSlot,
    DayAvailability,

    // Context types
    AvailabilityContext,
    ServiceContext,
    TenantConfig,
    ProviderContext,

    // Layer data types
    ServiceScheduleSlot,
    ServiceOverride,
    ProviderScheduleSlot,
    ProviderOverride,
    BookingRecord,
    CalendarEvent,

    // Internal types
    TimeRange,
    LayerData,
    SlotFilterResult,
    ProviderAssignmentStrategy,
} from './types';

// Re-export utilities for advanced usage
export * as availabilityUtils from './utils';
export * as availabilityLayers from './layers';
