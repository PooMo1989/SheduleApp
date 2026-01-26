/**
 * Admin Clients Page (Story 2.8.4 - Placeholder)
 *
 * This page will display the global client list across all providers.
 * Full implementation in Story 2.8.6 (Tier 10 - Post-Booking Features).
 */
export default function AdminClientsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Clients</h1>
                <p className="text-neutral-600 mt-1">View all clients across your organization</p>
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
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">No clients yet</h3>
                    <p className="text-neutral-500 mb-4">
                        Clients who book appointments will appear here. You&apos;ll be able to view booking
                        history and payment records.
                    </p>
                    <p className="text-sm text-neutral-400">
                        Full implementation coming in Story 2.8.6 (Tier 10).
                    </p>
                </div>
            </div>
        </div>
    );
}
