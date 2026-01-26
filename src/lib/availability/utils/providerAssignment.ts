/**
 * Provider Assignment Utilities
 *
 * Strategies for assigning providers in "Any Provider" mode.
 */

import type { ProviderAssignmentStrategy, ProviderContext, BookingRecord } from '../types';

/**
 * Track provider booking counts for load balancing
 */
export interface ProviderBookingCount {
    providerId: string;
    count: number;
}

/**
 * Select a provider using round-robin strategy
 * Rotates through providers in order based on a slot index
 */
export function selectRoundRobin(
    availableProviderIds: string[],
    slotIndex: number
): string {
    if (availableProviderIds.length === 0) {
        throw new Error('No available providers');
    }
    return availableProviderIds[slotIndex % availableProviderIds.length];
}

/**
 * Select a provider with the least bookings
 * Falls back to first available if all have equal bookings
 */
export function selectLeastBooked(
    availableProviderIds: string[],
    bookingCounts: Map<string, number>
): string {
    if (availableProviderIds.length === 0) {
        throw new Error('No available providers');
    }

    let minCount = Infinity;
    let selectedProviderId = availableProviderIds[0];

    for (const providerId of availableProviderIds) {
        const count = bookingCounts.get(providerId) ?? 0;
        if (count < minCount) {
            minCount = count;
            selectedProviderId = providerId;
        }
    }

    return selectedProviderId;
}

/**
 * Select a random provider
 */
export function selectRandom(availableProviderIds: string[]): string {
    if (availableProviderIds.length === 0) {
        throw new Error('No available providers');
    }
    const index = Math.floor(Math.random() * availableProviderIds.length);
    return availableProviderIds[index];
}

/**
 * Select a provider using the specified strategy
 */
export function selectProvider(
    availableProviderIds: string[],
    strategy: ProviderAssignmentStrategy,
    context: {
        slotIndex?: number;
        bookingCounts?: Map<string, number>;
    }
): string {
    switch (strategy) {
        case 'round_robin':
            return selectRoundRobin(availableProviderIds, context.slotIndex ?? 0);

        case 'least_booked':
            return selectLeastBooked(
                availableProviderIds,
                context.bookingCounts ?? new Map()
            );

        case 'random':
            return selectRandom(availableProviderIds);

        default:
            return selectRoundRobin(availableProviderIds, 0);
    }
}

/**
 * Calculate booking counts for providers within a date range
 */
export function calculateBookingCounts(
    bookings: BookingRecord[],
    providerIds: string[],
    startDate: string,
    endDate: string
): Map<string, number> {
    const counts = new Map<string, number>();

    // Initialize all providers with 0
    for (const providerId of providerIds) {
        counts.set(providerId, 0);
    }

    // Count active bookings
    for (const booking of bookings) {
        if (
            providerIds.includes(booking.providerId) &&
            !['cancelled', 'rejected'].includes(booking.status)
        ) {
            const bookingDate = booking.startTime.split('T')[0];
            if (bookingDate >= startDate && bookingDate <= endDate) {
                const current = counts.get(booking.providerId) ?? 0;
                counts.set(booking.providerId, current + 1);
            }
        }
    }

    return counts;
}

/**
 * Sort providers by preference for display
 * Returns providers with display names, sorted by availability
 */
export function sortProvidersByPreference(
    providers: ProviderContext[],
    bookingCounts: Map<string, number>
): ProviderContext[] {
    return [...providers].sort((a, b) => {
        const countA = bookingCounts.get(a.id) ?? 0;
        const countB = bookingCounts.get(b.id) ?? 0;

        // Sort by least bookings first
        if (countA !== countB) {
            return countA - countB;
        }

        // Tie-breaker: alphabetical by name
        return a.displayName.localeCompare(b.displayName);
    });
}
