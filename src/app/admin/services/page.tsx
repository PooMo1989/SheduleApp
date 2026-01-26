'use client';

import { useState } from 'react';
import { ServiceList, ServiceDetail } from '@/features/service/components';
import { ListDetailSplitView } from '@/components/common';

/**
 * Admin Services Page
 * Story 2.3.1: Service Setup Tabbed Portal
 * Refactored for Story 2.11: UI Consistency (Split View)
 */
export default function AdminServicesPage() {
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

    return (
        <div className="h-[calc(100vh-4rem)] bg-gray-50">
            <ListDetailSplitView
                list={
                    <div className="h-full overflow-y-auto p-4 md:p-6">
                        {/* Header Content is now inside ServiceList for reuse/consistency, 
                            OR we can keep page title here.
                            ServiceList already has a header "Services (N) + Add Service".
                            Let's wrap it nicely.
                        */}
                        <div className="mb-4">
                            <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
                            <p className="text-gray-500 mt-1">
                                Manage your service catalog.
                            </p>
                        </div>

                        <ServiceList
                            onSelect={setSelectedServiceId}
                            selectedId={selectedServiceId}
                        />
                    </div>
                }
                detail={
                    selectedServiceId ? (
                        <ServiceDetail serviceId={selectedServiceId} />
                    ) : null
                }
                onClose={() => setSelectedServiceId(null)}
            />
        </div>
    );
}
