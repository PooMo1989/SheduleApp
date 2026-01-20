'use client';

import { useState } from 'react';
import { ServiceList, ServiceForm } from '@/features/service/components';
import type { Service } from '@/types';

/**
 * Admin Services Page
 * Story 2.3: Service CRUD Management
 */
export default function AdminServicesPage() {
    const [showForm, setShowForm] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setShowForm(true);
    };

    const handleAddNew = () => {
        setEditingService(null);
        setShowForm(true);
    };

    const handleClose = () => {
        setShowForm(false);
        setEditingService(null);
    };

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
                <ServiceList onEdit={handleEdit} onAddNew={handleAddNew} />

                {/* Service Form Modal */}
                {showForm && (
                    <ServiceForm
                        service={editingService}
                        onClose={handleClose}
                        onSuccess={handleClose}
                    />
                )}
            </div>
        </div>
    );
}
