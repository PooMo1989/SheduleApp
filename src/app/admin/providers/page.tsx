/**
 * Admin Providers Page (Story 2.8.4 - Placeholder)
 *
 * This page will display the list of all service providers with detail view.
 * Full implementation in Story 2.8.5 (Tier 7 - Provider Admin Management).
 */
export default function AdminProvidersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Providers</h1>
                <p className="text-neutral-600 mt-1">Manage service providers and their assignments</p>
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
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">Provider Management</h3>
                    <p className="text-neutral-500 mb-4">
                        View and manage all providers in your organization. Assign services, view schedules,
                        and monitor appointments.
                    </p>
                    <p className="text-sm text-neutral-400">
                        Full implementation coming in Story 2.8.5 (Tier 7).
                    </p>
                </div>
            </div>
        </div>
    );
}
