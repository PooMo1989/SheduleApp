/**
 * Admin Booking Pages (Story 2.8.4 - Renamed from Widget)
 *
 * This page handles embed code and direct link generation.
 * Based on user-flow-v3.md Section 9.2 - Link & Widget Generation.
 * Full implementation in Story 9.2.1 (Tier 9 - Booking Pages & Links).
 */
export default function AdminBookingPagesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Booking Pages</h1>
                <p className="text-neutral-600 mt-1">Generate embed code and shareable booking links</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                <div className="max-w-2xl">
                    <h2 className="text-lg font-semibold text-neutral-900 mb-4">Generate Booking Links</h2>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Embed Code Option */}
                        <div className="border border-neutral-200 rounded-lg p-4">
                            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-3">
                                <svg
                                    className="w-6 h-6 text-primary-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                                    />
                                </svg>
                            </div>
                            <h3 className="font-medium text-neutral-900 mb-1">Embed Widget</h3>
                            <p className="text-sm text-neutral-500 mb-3">
                                Add a booking calendar to your website with an iframe embed code.
                            </p>
                            <span className="text-xs text-neutral-400">Coming in Story 9.2.1</span>
                        </div>

                        {/* Direct Link Option */}
                        <div className="border border-neutral-200 rounded-lg p-4">
                            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-3">
                                <svg
                                    className="w-6 h-6 text-primary-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                    />
                                </svg>
                            </div>
                            <h3 className="font-medium text-neutral-900 mb-1">Direct Link</h3>
                            <p className="text-sm text-neutral-500 mb-3">
                                Share a direct booking link via email, social media, or messaging.
                            </p>
                            <span className="text-xs text-neutral-400">Coming in Story 3.2.1</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
