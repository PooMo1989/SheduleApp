import { Suspense } from 'react';

// Separate component to handle useSearchParams in a purely client-side or suspense boundary
function BookingPageContent({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const serviceId = searchParams.service as string | undefined;
    const providerId = searchParams.provider as string | undefined;
    const theme = searchParams.theme as string || 'light';

    return (
        <div className={`min-h-screen p-8 flex items-center justify-center ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
            <div className={`max-w-md w-full p-8 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-100'}`}>
                <div className="space-y-4 text-center">
                    <h1 className="text-2xl font-bold">Booking Request</h1>
                    <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
                        Public Stub
                    </div>

                    <div className="pt-4 text-left space-y-3">
                        <div className="p-3 bg-slate-50/50 rounded-lg border">
                            <p className="text-xs text-neutral-500 uppercase font-semibold">Service ID</p>
                            <p className="font-mono text-sm truncate">{serviceId || 'None (User selects)'}</p>
                        </div>

                        <div className="p-3 bg-slate-50/50 rounded-lg border">
                            <p className="text-xs text-neutral-500 uppercase font-semibold">Provider ID</p>
                            <p className="font-mono text-sm truncate">{providerId || 'None (User selects)'}</p>
                        </div>

                        <div className="p-3 bg-slate-50/50 rounded-lg border">
                            <p className="text-xs text-neutral-500 uppercase font-semibold">Theme</p>
                            <p className="font-mono text-sm">{theme}</p>
                        </div>
                    </div>

                    <p className="text-sm text-neutral-500 pt-4">
                        This is a placeholder page content for testing Tier 9 links.
                        <br />
                        Actual Booking Logic comes in Epic 3.
                    </p>
                </div>
            </div>
        </div>
    );
}

// Main Page Component
export default function BookingPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    // Next.js 15+ async searchParams handling (or standard if using older version, adjusting for safety)
    // We'll treat it as standard props for now but wrapped for safety if needed. 
    // Assuming simple page structure for this stub.

    // Using a default async wrapper pattern for modern Next.js
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AsyncParamsWrapper searchParamsPromise={props.searchParams} />
        </Suspense>
    );
}

// Wrapper to unwrap the promise if it is one (Next.js 15), or use directly
async function AsyncParamsWrapper({ searchParamsPromise }: { searchParamsPromise: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await searchParamsPromise;
    return <BookingPageContent searchParams={params} />;
}
