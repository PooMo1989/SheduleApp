'use client';

import { useState } from 'react';
import { Clock, MapPin, MoreVertical, Copy, Share2, Trash2, ExternalLink } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';

interface Service {
    id: string;
    name: string;
    service_type: string;
    duration_minutes: number;
    price: number;
    location_type: string | null;
    is_active: boolean | null;
    custom_url_slug: string | null;
}

interface ServiceListSidebarProps {
    services: Service[];
    selectedServiceId: string | null;
    onSelectService: (serviceId: string) => void;
    onDeleteService: (service: Service) => void;
    isCompact: boolean;
}

/**
 * Service List Sidebar
 * Shows all services with quick actions
 * - Active/Inactive toggle
 * - Duplicate button
 * - Dropdown menu (...): Share Link, View Page, Delete
 */
export function ServiceListSidebar({ services, selectedServiceId, onSelectService, onDeleteService, isCompact }: ServiceListSidebarProps) {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [localActiveState, setLocalActiveState] = useState<Record<string, boolean>>({});
    const utils = trpc.useUtils();
    const { data: settings } = trpc.admin.getSettings.useQuery();

    const setActive = trpc.service.setActive.useMutation({
        onSuccess: () => utils.service.getAll.invalidate(),
        onError: (_, variables) => {
            // Revert on error
            setLocalActiveState(prev => {
                const next = { ...prev };
                delete next[variables.id];
                return next;
            });
        },
    });

    const handleDuplicate = (service: Service, e: React.MouseEvent) => {
        e.stopPropagation();
        // TODO: Implement duplicate functionality
        toast.info('Duplicate feature coming soon');
    };

    const handleShareLink = (service: Service, e: React.MouseEvent) => {
        e.stopPropagation();
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const slug = service.custom_url_slug || service.id;
        const shareUrl = `${baseUrl}/book/${settings?.slug || 'your-company'}/${slug}`;

        navigator.clipboard.writeText(shareUrl);
        toast.success('Booking link copied to clipboard');
        setOpenMenuId(null);
    };

    const handleViewPage = (service: Service, e: React.MouseEvent) => {
        e.stopPropagation();
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const slug = service.custom_url_slug || service.id;
        const bookingUrl = `${baseUrl}/book/${settings?.slug || 'your-company'}/${slug}`;

        window.open(bookingUrl, '_blank');
        setOpenMenuId(null);
    };

    const handleDelete = (service: Service, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenMenuId(null);
        onDeleteService(service);
    };

    return (
        <div className={`${isCompact ? 'p-6 space-y-3' : 'p-8 space-y-4'}`}>
            {services.map((service) => {
                const isSelected = selectedServiceId === service.id;
                const isActive = localActiveState[service.id] ?? service.is_active ?? true;
                const isMenuOpen = openMenuId === service.id;

                return (
                    <div
                        key={service.id}
                        className={`group relative rounded-lg transition-all ${
                            isSelected
                                ? 'bg-teal-50 border-2 border-teal-200'
                                : 'bg-white border-2 border-gray-100 hover:border-gray-200 hover:shadow-sm'
                        } ${isCompact ? 'p-3' : 'p-4'}`}
                    >
                        <div
                            onClick={() => onSelectService(service.id)}
                            className="cursor-pointer"
                        >
                            {/* Service Header */}
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-semibold truncate ${
                                        isSelected ? 'text-teal-900' : 'text-gray-900'
                                    } ${isCompact ? 'text-sm' : 'text-base'}`}>
                                        {service.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                            {service.service_type === 'consultation' ? '1-on-1' : 'Group'}
                                        </span>
                                        {!isActive && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions - Always Visible */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    {/* Active/Inactive Toggle */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const newStatus = !isActive;
                                            setLocalActiveState(prev => ({ ...prev, [service.id]: newStatus }));
                                            setActive.mutate({ id: service.id, is_active: newStatus });
                                        }}
                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                            isActive ? 'bg-teal-600' : 'bg-gray-300'
                                        }`}
                                    >
                                        <span className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${
                                            isActive ? 'translate-x-5' : 'translate-x-1'
                                        }`} />
                                    </button>

                                    {/* Duplicate Button */}
                                    {!isCompact && (
                                        <button
                                            onClick={(e) => handleDuplicate(service, e)}
                                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                            title="Duplicate service"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    )}

                                    {/* More Menu */}
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(isMenuOpen ? null : service.id);
                                            }}
                                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                            title="More actions"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {isMenuOpen && (
                                            <>
                                                {/* Backdrop */}
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenuId(null);
                                                    }}
                                                />
                                                {/* Menu */}
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                                    {isCompact && (
                                                        <button
                                                            onClick={(e) => handleDuplicate(service, e)}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                            Duplicate
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => handleShareLink(service, e)}
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Share2 className="w-4 h-4" />
                                                        Copy booking link
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleViewPage(service, e)}
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                        View booking page
                                                    </button>
                                                    <div className="border-t border-gray-100 my-1" />
                                                    <button
                                                        onClick={(e) => handleDelete(service, e)}
                                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Service Details */}
                            <div className={`flex items-center gap-4 text-gray-600 ${isCompact ? 'text-xs' : 'text-sm'}`}>
                                <span className="flex items-center gap-1.5">
                                    <Clock className={isCompact ? 'w-3 h-3' : 'w-4 h-4'} />
                                    {service.duration_minutes}m
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <MapPin className={isCompact ? 'w-3 h-3' : 'w-4 h-4'} />
                                    {service.location_type === 'in_person' ? 'In-person' :
                                     service.location_type === 'virtual' ? 'Virtual' :
                                     service.location_type === 'both' ? 'Both' : 'In-person'}
                                </span>
                                {service.price > 0 && (
                                    <span className="font-semibold text-gray-900">
                                        ${service.price.toFixed(2)}
                                    </span>
                                )}
                            </div>

                        </div>
                    </div>
                );
            })}
        </div>
    );
}
