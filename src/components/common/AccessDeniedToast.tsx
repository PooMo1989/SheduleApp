'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Toast notification for access denied redirects
 * Shows when user is redirected due to insufficient permissions
 */
export function AccessDeniedToast() {
    const searchParams = useSearchParams();
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (searchParams.get('error') === 'access_denied') {
            setShow(true);
            const timer = setTimeout(() => setShow(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [searchParams]);

    if (!show) return null;

    return (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                    <p className="font-medium">Access Denied</p>
                    <p className="text-sm">You don't have permission to access that page.</p>
                </div>
            </div>
        </div>
    );
}
