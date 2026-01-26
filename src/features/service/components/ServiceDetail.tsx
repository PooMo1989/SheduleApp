'use client';

import { useRouter } from 'next/navigation';
import { Pencil, Clock, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';

interface ServiceDetailProps {
    serviceId: string;
}

/**
 * Service Detail Component
 * Used in the SplitView to show service details without full edit form overhead.
 */
export function ServiceDetail({ serviceId }: ServiceDetailProps) {
    const router = useRouter();
    const { data: service, isLoading, error } = trpc.service.getById.useQuery({ id: serviceId });

    if (isLoading) {
        return (
            <div className="p-6 space-y-4 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-32 bg-gray-200 rounded" />
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="p-6 text-center text-red-500">
                Failed to load service details.
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{service.name}</h2>
                    <p className="text-sm text-gray-500 mt-1 capitalize">{service.service_type} Service</p>
                </div>
                <Button
                    onClick={() => router.push(`/admin/services/${serviceId}/edit`)}
                    size="sm"
                    className="gap-2"
                >
                    <Pencil className="w-4 h-4" />
                    Edit
                </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">

                {/* Status */}
                <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${service.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {service.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {service.visibility === 'private' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Hidden from Booking
                        </span>
                    )}
                </div>

                {/* Main Details */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Price</span>
                        <div className="mt-1 text-lg font-semibold text-gray-900">
                            {service.price > 0
                                ? `$${service.price.toFixed(2)}`
                                : 'Free'
                            }
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Duration</span>
                        <div className="mt-1 text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {service.duration_minutes} min
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                    <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 whitespace-pre-wrap">
                        {service.description || 'No description provided.'}
                    </div>
                </div>

                {/* Settings Summary */}
                <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Configuration</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                            {(service.providers?.length || 0) > 0
                                ? <Check className="w-4 h-4 text-green-500" />
                                : <X className="w-4 h-4 text-gray-300" />
                            }
                            <span>{(service.providers?.length || 0)} Providers Assigned</span>
                        </li>
                        {/* Add more fields here as needed */}
                    </ul>
                </div>

            </div>
        </div>
    );
}
