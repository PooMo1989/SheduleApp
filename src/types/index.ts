/**
 * Shared TypeScript types for sheduleApp
 * 
 * This file exports common types and interfaces used across the application.
 * Database types will be auto-generated from Supabase in Story 1.2.
 */

// Re-export database types when available (Story 1.2)
// export * from './database.types';

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
