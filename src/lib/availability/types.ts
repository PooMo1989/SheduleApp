/**
 * Availability Engine Types
 *
 * TypeScript interfaces for the 5-layer availability engine.
 */

/**
 * Time slot representing an available booking window
 */
export interface TimeSlot {
    /** Start time in ISO 8601 format */
    startTime: string;
    /** End time in ISO 8601 format */
    endTime: string;
    /** Duration in minutes */
    durationMinutes: number;
}

/**
 * Available slot with provider information
 */
export interface AvailableSlot extends TimeSlot {
    /** Provider ID if specific provider */
    providerId?: string;
    /** Provider display name */
    providerName?: string;
    /** List of available provider IDs for "Any Provider" mode */
    availableProviderIds?: string[];
    /** Number of remaining spots (for class-type services) */
    remainingCapacity?: number;
}

/**
 * Day availability summary
 */
export interface DayAvailability {
    /** Date in YYYY-MM-DD format */
    date: string;
    /** Whether the day has any available slots */
    hasAvailability: boolean;
    /** Available time slots for this day */
    slots: AvailableSlot[];
}

/**
 * Input parameters for availability calculation
 */
export interface AvailabilityRequest {
    /** Service ID to check availability for */
    serviceId: string;
    /** Tenant ID (required for multi-tenancy) */
    tenantId: string;
    /** Start date for availability window (YYYY-MM-DD) */
    startDate: string;
    /** End date for availability window (YYYY-MM-DD) */
    endDate: string;
    /** Specific provider ID (optional - omit for "Any Provider" mode) */
    providerId?: string;
    /** Client timezone (IANA format, e.g., "America/New_York") */
    timezone: string;
}

/**
 * Response from availability calculation
 */
export interface AvailabilityResponse {
    /** Service ID */
    serviceId: string;
    /** Tenant ID */
    tenantId: string;
    /** Requested date range */
    dateRange: {
        start: string;
        end: string;
    };
    /** Availability by date */
    days: DayAvailability[];
    /** Total available slots count */
    totalSlots: number;
    /** Whether this is "Any Provider" mode */
    anyProviderMode: boolean;
    /** Service configuration snapshot */
    serviceConfig: {
        name: string;
        durationMinutes: number;
        bufferBeforeMinutes: number;
        bufferAfterMinutes: number;
        type: 'consultation' | 'class';
        maxParticipants?: number;
    };
}

/**
 * Input for checking a specific slot
 */
export interface SlotCheckRequest {
    serviceId: string;
    tenantId: string;
    providerId: string;
    startTime: string;
    timezone: string;
}

/**
 * Response from slot check
 */
export interface SlotCheckResponse {
    available: boolean;
    reason?: string;
    conflictType?: 'booking' | 'schedule' | 'override' | 'calendar';
}

/**
 * Service schedule (L1) - weekly recurring hours
 */
export interface ServiceScheduleSlot {
    id: string;
    serviceId: string;
    dayOfWeek: number; // 0-6, Sunday-Saturday
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    isAvailable: boolean;
}

/**
 * Service override (L1.5) - date-specific exceptions
 */
export interface ServiceOverride {
    id: string;
    serviceId: string;
    overrideDate: string; // YYYY-MM-DD
    startTime?: string; // HH:MM (null = full day)
    endTime?: string; // HH:MM (null = full day)
    isAvailable: boolean;
    reason?: string;
}

/**
 * Provider schedule (L2) - weekly recurring hours
 */
export interface ProviderScheduleSlot {
    id: string;
    providerId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}

/**
 * Provider override (L3) - date-specific exceptions
 */
export interface ProviderOverride {
    id: string;
    providerId: string;
    overrideDate: string;
    startTime?: string;
    endTime?: string;
    isAvailable: boolean;
    reason?: string;
}

/**
 * Booking record (L4) - existing bookings
 */
export interface BookingRecord {
    id: string;
    providerId: string;
    startTime: string;
    endTime: string;
    bufferBeforeMinutes: number;
    bufferAfterMinutes: number;
    status: string;
}

/**
 * External calendar event (L5) - from Google Calendar
 */
export interface CalendarEvent {
    id: string;
    providerId: string;
    calendarId: string;
    startTime: string;
    endTime: string;
    title?: string;
    isAllDay: boolean;
}

/**
 * Time range for internal calculations
 */
export interface TimeRange {
    start: Date;
    end: Date;
}

/**
 * Provider info with availability context
 */
export interface ProviderContext {
    id: string;
    userId: string;
    displayName: string;
    isActive: boolean;
}

/**
 * Service info with configuration
 */
export interface ServiceContext {
    id: string;
    tenantId: string;
    name: string;
    type: 'consultation' | 'class';
    durationMinutes: number;
    bufferBeforeMinutes: number;
    bufferAfterMinutes: number;
    maxParticipants?: number;
    isActive: boolean;
}

/**
 * Tenant configuration relevant to availability
 */
export interface TenantConfig {
    id: string;
    timezone: string;
    slotIntervalMinutes: number;
    minNoticeHours: number;
    maxFutureDays: number;
}

/**
 * Full context for availability calculation
 */
export interface AvailabilityContext {
    service: ServiceContext;
    tenant: TenantConfig;
    providers: ProviderContext[];
    requestedProviderId?: string;
}

/**
 * Indexed data structures for O(1) lookups during filtering
 */
export interface LayerData {
    /** L1: Service schedule by day of week */
    serviceScheduleByDay: Map<number, ServiceScheduleSlot[]>;
    /** L1.5: Service overrides by date string */
    serviceOverrideByDate: Map<string, ServiceOverride>;
    /** L2: Provider schedules by providerId, then by day of week */
    providerScheduleByDay: Map<string, Map<number, ProviderScheduleSlot[]>>;
    /** L3: Provider overrides by providerId, then by date string */
    providerOverrideByDate: Map<string, Map<string, ProviderOverride>>;
    /** L4: Bookings by providerId, stored as time ranges */
    bookingsByProvider: Map<string, BookingRecord[]>;
    /** L5: Calendar events by providerId */
    calendarEventsByProvider: Map<string, CalendarEvent[]>;
}

/**
 * Result of applying layers to a time slot
 */
export interface SlotFilterResult {
    isAvailable: boolean;
    blockedBy?: 'service_schedule' | 'service_override' | 'provider_schedule' | 'provider_override' | 'booking' | 'calendar';
    providerId?: string;
}

/**
 * Provider assignment strategy for "Any Provider" mode
 */
export type ProviderAssignmentStrategy = 'round_robin' | 'least_booked' | 'random';
