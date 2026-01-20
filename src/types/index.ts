/**
 * Shared TypeScript types for sheduleApp
 * 
 * This file exports common types and interfaces used across the application.
 * Database types are auto-generated from Supabase.
 */

// Import database types for use in this file
import type {
    Tables,
    TablesInsert,
    TablesUpdate,
} from './database.types';

// Re-export all database types
export * from './database.types';

/**
 * Common response types
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * User roles for RBAC (Story 1.8)
 */
export type UserRole = 'admin' | 'provider' | 'client';

/**
 * Booking status enum
 */
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

/**
 * Service type enum (Consultations vs Classes)
 */
export type ServiceType = 'consultation' | 'class';

// ============================================================
// Convenient type aliases for database tables (Story 2.1)
// ============================================================

/**
 * Tenant type alias
 */
export type Tenant = Tables<'tenants'>;
export type TenantInsert = TablesInsert<'tenants'>;
export type TenantUpdate = TablesUpdate<'tenants'>;

/**
 * User type alias (renamed to DbUser to avoid conflict with Supabase User)
 */
export type DbUser = Tables<'users'>;
export type DbUserInsert = TablesInsert<'users'>;
export type DbUserUpdate = TablesUpdate<'users'>;

/**
 * Category type alias (Story 2.1)
 */
export type Category = Tables<'categories'>;
export type CategoryInsert = TablesInsert<'categories'>;
export type CategoryUpdate = TablesUpdate<'categories'>;

/**
 * Service type alias (Story 2.1)
 */
export type Service = Tables<'services'>;
export type ServiceInsert = TablesInsert<'services'>;
export type ServiceUpdate = TablesUpdate<'services'>;

/**
 * Provider type alias (Story 2.1)
 */
export type Provider = Tables<'providers'>;
export type ProviderInsert = TablesInsert<'providers'>;
export type ProviderUpdate = TablesUpdate<'providers'>;

/**
 * ServiceProvider junction type alias (Story 2.1)
 */
export type ServiceProvider = Tables<'service_providers'>;
export type ServiceProviderInsert = TablesInsert<'service_providers'>;
export type ServiceProviderUpdate = TablesUpdate<'service_providers'>;

// ============================================================
// Provider Availability types (Story 2.2)
// ============================================================

/**
 * Provider schedule type alias (recurring weekly hours)
 */
export type ProviderSchedule = Tables<'provider_schedules'>;
export type ProviderScheduleInsert = TablesInsert<'provider_schedules'>;
export type ProviderScheduleUpdate = TablesUpdate<'provider_schedules'>;

/**
 * Schedule override type alias (date-specific exceptions)
 */
export type ScheduleOverride = Tables<'schedule_overrides'>;
export type ScheduleOverrideInsert = TablesInsert<'schedule_overrides'>;
export type ScheduleOverrideUpdate = TablesUpdate<'schedule_overrides'>;

/**
 * Provider calendar type alias (Google Calendar OAuth)
 */
export type ProviderCalendar = Tables<'provider_calendars'>;
export type ProviderCalendarInsert = TablesInsert<'provider_calendars'>;
export type ProviderCalendarUpdate = TablesUpdate<'provider_calendars'>;
