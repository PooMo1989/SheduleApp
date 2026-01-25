'use client';

/**
 * Settings Notifications Tab (Placeholder)
 * Story 2.8.7: Email templates and notification configuration
 * Full implementation in Story 8.4
 */
export function SettingsNotificationsTab() {
    return (
        <div className="p-6 max-w-2xl">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Email Notifications</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Configure email templates and notification settings
                </p>

                {/* Placeholder Content */}
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-gray-600 font-medium mb-2">Coming Soon</p>
                    <p className="text-sm text-gray-500">
                        Email template configuration will be available in Story 8.4.
                        This will include booking confirmations, reminders, and cancellation notifications.
                    </p>
                </div>

                {/* Preview of future features */}
                <div className="mt-6 space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Planned Features:</h4>
                    <ul className="text-sm text-gray-500 space-y-2">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                            Booking confirmation emails
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                            24-hour reminder emails
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                            1-hour reminder emails
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                            Cancellation notifications
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                            Custom email templates
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
