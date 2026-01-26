/**
 * Provider Schedule Page (Story 6.0 - Placeholder)
 *
 * This page will display the provider's availability schedule editor.
 * Full implementation in Story 6.5 (Tier 8 - Provider Self-Service).
 */
export default function ProviderSchedulePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Schedule</h1>
                <p className="text-neutral-600 mt-1">Manage your availability and working hours</p>
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
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">Set your availability</h3>
                    <p className="text-neutral-500 mb-4">
                        Configure your working hours and set date-specific exceptions.
                    </p>
                    <p className="text-sm text-neutral-400">
                        The availability editor will be available in Story 6.5.
                    </p>
                </div>
            </div>
        </div>
    );
}
