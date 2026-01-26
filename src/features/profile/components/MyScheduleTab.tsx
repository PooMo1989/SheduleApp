'use client';

/**
 * My Schedule Tab Component (Story 2.8.8)
 *
 * Displays the user's provider schedule/availability for dual-role users.
 * This tab is only shown when the user has both admin/owner AND provider roles.
 *
 * Full availability editor implementation in Story 2.7.1 and Story 6.5.
 */
export function MyScheduleTab() {
    return (
        <div className="p-6">
            <div className="max-w-2xl">
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-neutral-900">My Schedule</h3>
                    <p className="text-sm text-neutral-500 mt-1">
                        Manage your personal availability as a service provider.
                    </p>
                </div>

                {/* Placeholder for availability editor */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-8 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-neutral-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h4 className="font-medium text-neutral-900 mb-2">Availability Editor</h4>
                        <p className="text-sm text-neutral-500 mb-4">
                            Set your weekly recurring availability and add date-specific overrides.
                        </p>
                        <p className="text-xs text-neutral-400">
                            Full implementation coming in Story 2.7.1 (Availability Editor UI).
                        </p>
                    </div>
                </div>

                {/* Quick info cards */}
                <div className="grid gap-4 mt-6 md:grid-cols-2">
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg
                                    className="w-5 h-5 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h5 className="font-medium text-neutral-900">Weekly Schedule</h5>
                                <p className="text-sm text-neutral-500 mt-1">
                                    Set recurring availability for each day of the week.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg
                                    className="w-5 h-5 text-amber-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h5 className="font-medium text-neutral-900">Date Overrides</h5>
                                <p className="text-sm text-neutral-500 mt-1">
                                    Block specific dates or set different hours for exceptions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Google Calendar Integration Notice */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                        <svg
                            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <div>
                            <h5 className="font-medium text-blue-900">Google Calendar Sync</h5>
                            <p className="text-sm text-blue-700 mt-1">
                                Connect your Google Calendar to automatically block times when you have
                                external events. This prevents double-booking.
                            </p>
                            <button
                                type="button"
                                disabled
                                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Connect Google Calendar (Coming in Story 2.6)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
