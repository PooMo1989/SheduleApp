/**
 * Provider Appointments Page (Story 6.0 - Placeholder)
 *
 * This page will display the provider's appointments with filtering options.
 * Full implementation in Story 6.6 (Tier 10 - Post-Booking Features).
 */
export default function ProviderAppointmentsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Appointments</h1>
                <p className="text-neutral-600 mt-1">View and manage your upcoming appointments</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
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
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">No appointments yet</h3>
                    <p className="text-neutral-500">
                        Your upcoming and past appointments will appear here once clients start booking with you.
                    </p>
                </div>
            </div>
        </div>
    );
}
