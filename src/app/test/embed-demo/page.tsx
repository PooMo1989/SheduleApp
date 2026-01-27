import { Suspense } from 'react';

interface PageProps {
    searchParams: Promise<{
        slug?: string;
        serviceId?: string;
        providerId?: string;
        theme?: string;
    }>;
}

export default async function EmbedDemoPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const slug = params.slug || 'demo';
    const serviceId = params.serviceId || '';
    const providerId = params.providerId || '';
    const theme = params.theme || 'light';

    // Build iframe URL
    const iframeParams = new URLSearchParams();
    if (serviceId) iframeParams.set('service', serviceId);
    if (providerId) iframeParams.set('provider', providerId);
    iframeParams.set('theme', theme);

    const iframeUrl = `/book/${slug}${serviceId ? `/${serviceId}` : ''}${iframeParams.toString() ? `?${iframeParams.toString()}` : ''}`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Mock Business Website Header */}
            <header className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">W</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900">Wellness Center</h1>
                            <p className="text-xs text-slate-500">Your health, our priority</p>
                        </div>
                    </div>
                    <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
                        <a href="#" className="hover:text-indigo-600 transition-colors">Home</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">Services</a>
                        <a href="#" className="text-indigo-600">Book Appointment</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">About</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Info Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h2 className="text-sm font-semibold text-blue-900 mb-2">📋 Test Page Information</h2>
                    <p className="text-sm text-blue-800 mb-3">
                        This is a mock external website demonstrating the embedded booking widget.
                    </p>
                    <div className="text-xs text-blue-700 space-y-1">
                        <p><strong>Current URL Parameters:</strong></p>
                        <ul className="ml-4 list-disc">
                            <li>Slug: <code className="bg-blue-100 px-1 py-0.5 rounded">{slug}</code></li>
                            {serviceId && <li>Service ID: <code className="bg-blue-100 px-1 py-0.5 rounded">{serviceId}</code></li>}
                            {providerId && <li>Provider ID: <code className="bg-blue-100 px-1 py-0.5 rounded">{providerId}</code></li>}
                            <li>Theme: <code className="bg-blue-100 px-1 py-0.5 rounded">{theme}</code></li>
                        </ul>
                        <p className="mt-2"><strong>To test with your data:</strong></p>
                        <p className="ml-4">
                            <code className="bg-blue-100 px-1 py-0.5 rounded text-xs">
                                /test/embed-demo?slug=YOUR_COMPANY_SLUG&serviceId=SERVICE_ID&theme=light
                            </code>
                        </p>
                    </div>
                </div>

                {/* Embedded Widget Section */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                        <h2 className="text-2xl font-bold mb-2">Book Your Appointment</h2>
                        <p className="text-indigo-100">
                            Schedule your visit in just a few clicks. Select a time that works for you.
                        </p>
                    </div>

                    {/* The Embedded Iframe */}
                    <div className="p-6 bg-slate-50">
                        <Suspense fallback={
                            <div className="flex items-center justify-center h-96 text-slate-400">
                                <div className="text-center">
                                    <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                                    <p>Loading booking widget...</p>
                                </div>
                            </div>
                        }>
                            <iframe
                                src={iframeUrl}
                                className="w-full h-[600px] border-0 rounded-lg shadow-sm"
                                title="Booking Widget"
                                allow="payment"
                            />
                        </Suspense>
                    </div>
                </div>

                {/* Footer Mock */}
                <footer className="mt-12 text-center text-sm text-slate-500">
                    <p>© 2026 Wellness Center. All rights reserved.</p>
                    <p className="mt-1">
                        This is a demonstration page for testing the embedded booking widget functionality.
                    </p>
                </footer>
            </main>
        </div>
    );
}
