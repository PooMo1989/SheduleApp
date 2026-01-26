'use client';

import { HorizontalTabs } from '@/components/common';
import { trpc } from '@/lib/trpc/client';
import { ProviderDetailsTab } from './ProviderDetailsTab';
import { ProviderServicesTab } from './ProviderServicesTab';
import { ProviderScheduleTab } from './ProviderScheduleTab';
import { Loader2, Eye } from 'lucide-react';

interface ProviderDetailProps {
    providerId: string;
}

export function ProviderDetail({ providerId }: ProviderDetailProps) {
    const { data: provider, isLoading, error } = trpc.provider.getById.useQuery({ id: providerId });

    if (isLoading) {
        return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
    }

    if (error || !provider) {
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                    Provider not found or error loading details.
                </div>
            </div>
        );
    }

    const tabs = [
        {
            id: 'details',
            label: 'Details',
            content: <ProviderDetailsTab provider={provider} />,
        },
        {
            id: 'services',
            label: 'Services',
            content: <ProviderServicesTab providerId={provider.id} />,
        },
        {
            id: 'schedule',
            label: 'Schedule',
            content: <ProviderScheduleTab providerId={provider.id} />,
        },
        {
            id: 'appointments',
            label: 'Appointments',
            content: <div className="p-8 text-center text-gray-500">Appointments view coming in Tier 10</div>,
        },
        {
            id: 'clients',
            label: 'Clients',
            content: <div className="p-8 text-center text-gray-500">Clients view coming in Tier 10</div>,
        },
    ];

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b bg-white flex items-center gap-4">
                {provider.photo_url ? (
                    <img src={provider.photo_url} alt={provider.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-lg">
                        {provider.name.charAt(0)}
                    </div>
                )}
                <div>
                    <h2 className="text-lg font-bold text-gray-900">{provider.name}</h2>
                    <p className="text-sm text-gray-500">{provider.specialization || 'Service Provider'}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <a
                        href={`/admin/impersonate/${provider.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition-colors"
                        title="View portal as this provider"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        View as Provider
                    </a>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${provider.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {provider.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex-1 overflow-hidden bg-gray-50">
                <HorizontalTabs tabs={tabs} defaultTab="details" />
            </div>
        </div>
    );
}
