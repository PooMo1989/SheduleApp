'use client';

interface ProviderAppointmentsContentProps {
    providerId?: string;
}

/**
 * Provider Appointments Content (Reusable)
 */
export function ProviderAppointmentsContent({ providerId }: ProviderAppointmentsContentProps) {
    // Note: providerId is currently unused as this is a placeholder
    // In Story 6.6, we would use it to fetch appointments for this provider

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Appointments</h1>
                <p className="text-neutral-600 mt-1">View and manage upcoming appointments</p>
                {providerId && (
                    <p className="text-xs text-neutral-400 mt-4 bg-yellow-50 p-2 rounded border border-yellow-100 inline-block">
                        Impersonation View: Managing appointments as if you were the provider.
                    </p>
                )}
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
