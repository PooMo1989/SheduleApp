'use client';

import { ServiceList } from '@/features/service/components';

/**
 * Admin Services Page
 * Story 2.3.1: Service Setup Tabbed Portal
 *
 * Services are now managed via full-page portal at:
 * - /admin/services/new (create)
 * - /admin/services/[id]/edit (edit)
 */
export default function AdminServicesPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Services</h1>
                    <p className="text-gray-500 mt-1">
                        Manage your service catalog. Clients will see these when booking.
                    </p>
                </div>

                {/* Service List */}
                <ServiceList />
            </div>
        </div>
    );
}
