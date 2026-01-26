/**
 * Admin Appointments Page (Story 2.8.4 - Dual-Role Support)
 *
 * This page is shown to admin/owner users who are also providers.
 * It displays their own appointments separate from the bookings management view.
 * Only visible in sidebar if user has both admin/owner AND provider roles.
 */
export default function AdminAppointmentsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">My Appointments</h1>
                <p className="text-neutral-600 mt-1">View and manage your personal appointments as a provider</p>
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
                        Your personal appointments as a service provider will appear here.
                        This is separate from the organization-wide bookings view.
                    </p>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
                        <h4 className="font-medium text-blue-900">Dual-Role View</h4>
                        <p className="text-sm text-blue-700 mt-1">
                            You&apos;re seeing this because you have both admin and provider roles.
                            Use the &quot;Bookings&quot; menu to manage all organization bookings.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
