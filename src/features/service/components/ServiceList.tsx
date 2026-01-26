'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';

/**
 * Service List Component
 * Story 2.3.1: Display list of services with links to portal
 */
export function ServiceList() {
    const { data: services, isLoading, error } = trpc.service.getAll.useQuery();
    const utils = trpc.useUtils();

    const deleteService = trpc.service.delete.useMutation({
        onSuccess: () => {
            utils.service.getAll.invalidate();
        },
    });

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            deleteService.mutate({ id });
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse bg-gray-100 h-20 rounded-lg" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                Failed to load services: {error.message}
            </div>
        );
    }

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                    Services ({services?.length || 0})
                </h2>
                <Link
                    href="/admin/services/new"
                    className="px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
                >
                    + Add Service
                </Link>
            </div>

            {/* Service List */}
            {services?.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 mb-4">No services yet</p>
                    <Link
                        href="/admin/services/new"
                        className="text-teal-600 hover:text-teal-700 font-medium"
                    >
                        Create your first service
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {services?.map(service => (
                        <div
                            key={service.id}
                            className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <Link
                                    href={`/admin/services/${service.id}/edit`}
                                    className="flex-1 group"
                                >
                                    <h3 className="font-medium text-gray-900 group-hover:text-teal-600 transition-colors">
                                        {service.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                                        {service.description || 'No description'}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2 text-sm">
                                        <span className="text-gray-600">
                                            {formatDuration(service.duration_minutes)}
                                        </span>
                                        <span className="text-gray-300">•</span>
                                        <span className="font-medium text-gray-900">
                                            {formatPrice(Number(service.price))}
                                        </span>
                                        <span className="text-gray-300">•</span>
                                        <span className={`capitalize ${service.service_type === 'class'
                                                ? 'text-purple-600'
                                                : 'text-blue-600'
                                            }`}>
                                            {service.service_type}
                                        </span>
                                    </div>
                                </Link>

                                {/* Actions */}
                                <div className="flex items-center gap-2 ml-4">
                                    <Link
                                        href={`/admin/services/${service.id}/edit`}
                                        className="p-2 text-gray-400 hover:text-teal-600 transition-colors"
                                        title="Edit"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(service.id, service.name)}
                                        disabled={deleteService.isPending}
                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                                        title="Delete"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
