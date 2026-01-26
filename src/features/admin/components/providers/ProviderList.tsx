'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SplitView, StatusBadge, SearchFilterBar, HorizontalTabs } from '@/components/common'; // SplitView is aliased ListDetailSplitView
import { Button } from '@/components/ui/button';
import { Plus, User } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { ProviderInviteForm } from './ProviderInviteForm';
import { ProviderDetail } from './ProviderDetail';

/**
 * Provider List Component
 * Story 2.8.5: Displays list of providers with search, filter, and detail view.
 */
export function ProviderList() {
    // const router = useRouter(); // Unused for now
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: providers, isLoading, refetch } = trpc.provider.getAll.useQuery();

    const filteredProviders = providers?.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handleSelect = (id: string) => {
        setSelectedId(id);
    };

    // --- Render Helpers ---

    const renderProviderList = (list: typeof filteredProviders) => {
        if (list.length === 0) {
            return (
                <div className="p-8 text-center text-gray-500">
                    {searchTerm ? 'No providers match your search' : 'No providers found'}
                </div>
            );
        }
        return (
            <ul className="divide-y divide-neutral-100">
                {list.map((p) => (
                    <li
                        key={p.id}
                        onClick={() => handleSelect(p.id)}
                        className={`
                            flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors
                            ${selectedId === p.id ? 'bg-blue-50 border-l-4 border-blue-500 pl-[12px]' : 'border-l-4 border-transparent'}
                        `}
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                            {p.photo_url ? (
                                <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 text-gray-400" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{p.name || p.email}</h3>
                            <p className="text-xs text-gray-500 truncate">
                                {p.specialization || p.title || 'Service Provider'}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <StatusBadge
                                status={!p.is_active ? 'inactive' : p.user_id ? 'active' : 'invited'}
                                size="sm"
                            />
                            <span className="text-xs text-gray-400">
                                {p.services?.length || 0} services
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        );
    };

    // --- Filter Logic for Tabs ---

    const activeProviders = filteredProviders.filter(p => p.user_id && p.is_active);
    const pendingProviders = filteredProviders.filter(p => !p.user_id); // Invited but not joined
    // Note: Inactive providers (user_id exists but !is_active) are shown in 'All' but not 'Active' or 'Pending'.

    const tabs = [
        {
            id: 'all',
            label: `All (${filteredProviders.length})`,
            content: <div className="pt-2">{renderProviderList(filteredProviders)}</div>
        },
        {
            id: 'active',
            label: `Active (${activeProviders.length})`,
            content: <div className="pt-2">{renderProviderList(activeProviders)}</div>
        },
        {
            id: 'pending',
            label: `Pending (${pendingProviders.length})`,
            content: <div className="pt-2">{renderProviderList(pendingProviders)}</div>
        }
    ];

    // Render the List Pane
    const listContent = (
        <div className="flex flex-col h-full bg-white">
            {/* Header / Actions */}
            <div className="p-4 border-b border-neutral-200 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">Providers</h1>
                    <Button onClick={() => setIsInviteOpen(true)} size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Invite
                    </Button>
                </div>
                <SearchFilterBar
                    onSearch={setSearchTerm}
                    searchPlaceholder="Search providers..."
                />
            </div>

            {/* Tabs & List Items */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : (
                    <div className="h-full flex flex-col">
                        {/* HorizontalTabs handles external container height if passed properly, 
                             but here we are inside a flex-col. 
                             HorizontalTabs style: 'flex flex-col h-full'. Perfect.
                         */}
                        <HorizontalTabs tabs={tabs} defaultTab="all" />
                    </div>
                )}
            </div>
        </div>
    );

    // Render Detail Pane
    const detailContent = selectedId ? (
        <ProviderDetail providerId={selectedId} />
    ) : null;

    return (
        <div className="h-[calc(100vh-64px)]">
            <SplitView
                list={listContent}
                detail={detailContent}
                onClose={() => setSelectedId(null)}
            />

            <ProviderInviteForm
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                onSuccess={() => {
                    setIsInviteOpen(false);
                    refetch();
                }}
            />
        </div>
    );
}
