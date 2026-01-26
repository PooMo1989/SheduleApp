/**
 * Provider Clients Page (Story 6.0 - Placeholder)
 *
 * This page will display the provider's client list with booking history and notes.
 * Full implementation in Story 6.7 (Tier 10 - Post-Booking Features).
 */
export default function ProviderClientsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Clients</h1>
                <p className="text-neutral-600 mt-1">View clients who have booked appointments with you</p>
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
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">No clients yet</h3>
                    <p className="text-neutral-500">
                        Clients who book appointments with you will appear here. You&apos;ll be able to view their
                        booking history and add private notes.
                    </p>
                </div>
            </div>
        </div>
    );
}
