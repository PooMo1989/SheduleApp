/**
 * Timezone Utilities
 *
 * Helpers for timezone conversion and date handling.
 */

/**
 * Parse a date string in a given timezone and return a Date object in UTC
 */
export function parseInTimezone(dateStr: string, timezone: string): Date {
    // Create a date object treating the input as being in the specified timezone
    const date = new Date(dateStr);

    // If the date string already has timezone info, just return it
    if (dateStr.includes('T') && (dateStr.includes('Z') || dateStr.includes('+') || dateStr.includes('-'))) {
        return date;
    }

    // For date-only strings, create a date at midnight in the specified timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });

    return date;
}

/**
 * Convert a Date to a time string in a given timezone
 */
export function formatTimeInTimezone(date: Date, timezone: string): string {
    return date.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

/**
 * Convert a Date to a date string (YYYY-MM-DD) in a given timezone
 */
export function formatDateInTimezone(date: Date, timezone: string): string {
    const year = date.toLocaleString('en-US', { timeZone: timezone, year: 'numeric' });
    const month = date.toLocaleString('en-US', { timeZone: timezone, month: '2-digit' });
    const day = date.toLocaleString('en-US', { timeZone: timezone, day: '2-digit' });
    return `${year}-${month}-${day}`;
}

/**
 * Get the day of week (0-6, Sunday-Saturday) for a date in a given timezone
 */
export function getDayOfWeekInTimezone(date: Date, timezone: string): number {
    const dayStr = date.toLocaleString('en-US', { timeZone: timezone, weekday: 'short' });
    const dayMap: Record<string, number> = {
        'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6,
    };
    return dayMap[dayStr] ?? 0;
}

/**
 * Create a Date from a date string and time string in a specific timezone
 */
export function createDateTimeInTimezone(
    dateStr: string,
    timeStr: string,
    timezone: string
): Date {
    // Parse date and time components
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);

    // Create a date string that JavaScript can parse
    // We'll use the temporal API pattern for clarity
    const isoString = `${dateStr}T${timeStr.padStart(5, '0')}:00`;

    // Create a formatter to get the offset for this timezone at this date/time
    const tempDate = new Date(`${dateStr}T12:00:00Z`); // Use noon to avoid DST edge cases
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'longOffset',
    });

    const parts = formatter.formatToParts(tempDate);
    const tzPart = parts.find(p => p.type === 'timeZoneName');

    // Parse offset from format like "GMT-05:00" or "GMT+05:30"
    let offsetMinutes = 0;
    if (tzPart) {
        const match = tzPart.value.match(/GMT([+-])(\d{2}):(\d{2})/);
        if (match) {
            const sign = match[1] === '+' ? 1 : -1;
            offsetMinutes = sign * (parseInt(match[2], 10) * 60 + parseInt(match[3], 10));
        }
    }

    // Create UTC date and adjust for timezone offset
    const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
    utcDate.setMinutes(utcDate.getMinutes() - offsetMinutes);

    return utcDate;
}

/**
 * Get the start of day in a timezone (00:00:00)
 */
export function getStartOfDayInTimezone(dateStr: string, timezone: string): Date {
    return createDateTimeInTimezone(dateStr, '00:00', timezone);
}

/**
 * Get the end of day in a timezone (23:59:59)
 */
export function getEndOfDayInTimezone(dateStr: string, timezone: string): Date {
    const endTime = createDateTimeInTimezone(dateStr, '23:59', timezone);
    endTime.setSeconds(59);
    return endTime;
}

/**
 * Add days to a date string
 */
export function addDays(dateStr: string, days: number): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

/**
 * Get all dates between two date strings (inclusive)
 */
export function getDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    let current = startDate;

    while (current <= endDate) {
        dates.push(current);
        current = addDays(current, 1);
    }

    return dates;
}

/**
 * Check if a date is today or in the future (in the given timezone)
 */
export function isDateTodayOrFuture(dateStr: string, timezone: string): boolean {
    const todayStr = formatDateInTimezone(new Date(), timezone);
    return dateStr >= todayStr;
}

/**
 * Get current date string in a timezone
 */
export function getTodayInTimezone(timezone: string): string {
    return formatDateInTimezone(new Date(), timezone);
}
