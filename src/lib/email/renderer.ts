/**
 * Simple template renderer
 * Replaces {{variable}} with value from data object
 */
export function renderTemplate(template: string, data: Record<string, string | number | undefined | null>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key]?.toString() ?? match;
    });
}

/**
 * Common email data interface
 */
export interface EmailData {
    client_name: string;
    service_name: string;
    date: string;
    time: string;
    provider_name?: string;
    location?: string;
    [key: string]: string | number | undefined | null;
}
