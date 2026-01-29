'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { trpc } from '@/lib/trpc/client';
import { HorizontalTabs } from '@/components/common';
import { ServiceBasicsTab } from './ServiceBasicsTab';
import { ServiceScheduleTab } from './ServiceScheduleTab';
import { ServiceBookingPageTab } from './ServiceBookingPageTab';

interface ServiceFormData {
    // Tab 1: Basics
    name: string;
    description: string;
    category_id: string;
    service_type: 'consultation' | 'class';
    duration_minutes: number;
    buffer_before_minutes: number;
    buffer_after_minutes: number;
    pricing_type: 'free' | 'fixed' | 'variable' | 'starting_from';
    price: number;
    currency: string;
    location_type: 'in_person' | 'virtual' | 'both';
    virtual_meeting_url: string;
    max_capacity: number;
    min_notice_hours: number;
    max_future_days: number;
    cancellation_hours: number;
    auto_confirm: boolean;
    visibility: 'public' | 'private';
    pay_later_enabled: boolean;
    pay_later_mode: 'auto_confirm' | 'pending_approval' | '';
    // Tab 3: Booking Page
    custom_url_slug: string;
    show_price: boolean;
    show_duration: boolean;
    require_account: boolean;
    confirmation_message: string;
    redirect_url: string;
}

interface ServicePortalProps {
    serviceId?: string;
}

/**
 * Service Portal Component
 * Story 2.3.1: Service Setup Tabbed Portal
 * Full-page 3-tab experience for creating/editing services
 */
export function ServicePortal({ serviceId }: ServicePortalProps) {
    const router = useRouter();
    const isEditing = !!serviceId;
    const [activeTab, setActiveTab] = useState('basics');
    const [savedServiceId, setSavedServiceId] = useState<string | null>(serviceId || null);

    const { data: existingService, isLoading } = trpc.service.getById.useQuery(
        { id: serviceId! },
        { enabled: isEditing }
    );

    const { data: settings } = trpc.admin.getSettings.useQuery();

    const utils = trpc.useUtils();

    const createService = trpc.service.create.useMutation({
        onSuccess: (result) => {
            setSavedServiceId(result.service.id);
            utils.service.getAll.invalidate();
        },
    });

    const updateService = trpc.service.update.useMutation({
        onSuccess: () => {
            utils.service.getAll.invalidate();
            utils.service.getById.invalidate({ id: serviceId });
        },
    });

    const methods = useForm<ServiceFormData>({
        defaultValues: {
            name: '',
            description: '',
            category_id: '',
            service_type: 'consultation',
            duration_minutes: 60,
            buffer_before_minutes: 0,
            buffer_after_minutes: 0,
            pricing_type: 'fixed',
            price: 0,
            currency: settings?.currency || 'LKR',
            location_type: 'in_person',
            virtual_meeting_url: '',
            max_capacity: 1,
            min_notice_hours: 24,
            max_future_days: 60,
            cancellation_hours: 24,
            auto_confirm: true,
            visibility: 'public',
            pay_later_enabled: false,
            pay_later_mode: '',
            custom_url_slug: '',
            show_price: true,
            show_duration: true,
            require_account: false,
            confirmation_message: '',
            redirect_url: '',
        },
    });

    // Load existing service data
    useEffect(() => {
        if (existingService) {
            methods.reset({
                name: existingService.name,
                description: existingService.description || '',
                category_id: existingService.category_id || '',
                service_type: existingService.service_type as 'consultation' | 'class',
                duration_minutes: existingService.duration_minutes,
                buffer_before_minutes: existingService.buffer_before_minutes ?? 0,
                buffer_after_minutes: existingService.buffer_after_minutes ?? 0,
                pricing_type: (existingService.pricing_type as ServiceFormData['pricing_type']) || 'fixed',
                price: Number(existingService.price) || 0,
                currency: settings?.currency || 'LKR',
                location_type: (existingService.location_type as ServiceFormData['location_type']) || 'in_person',
                virtual_meeting_url: existingService.virtual_meeting_url || '',
                max_capacity: existingService.max_capacity ?? 1,
                min_notice_hours: existingService.min_notice_hours ?? 24,
                max_future_days: existingService.max_future_days ?? 60,
                cancellation_hours: existingService.cancellation_hours ?? 24,
                auto_confirm: existingService.auto_confirm ?? true,
                visibility: (existingService.visibility as 'public' | 'private') || 'public',
                pay_later_enabled: existingService.pay_later_enabled ?? false,
                pay_later_mode: (existingService.pay_later_mode as ServiceFormData['pay_later_mode']) || '',
                custom_url_slug: existingService.custom_url_slug || '',
                show_price: existingService.show_price ?? true,
                show_duration: existingService.show_duration ?? true,
                require_account: existingService.require_account ?? false,
                confirmation_message: existingService.confirmation_message || '',
                redirect_url: existingService.redirect_url || '',
            });
        }
    }, [existingService, methods, settings?.currency]);

    const onSubmit = async (data: ServiceFormData) => {
        const payload = {
            name: data.name,
            description: data.description || null,
            category_id: data.category_id || null,
            service_type: data.service_type,
            duration_minutes: data.duration_minutes,
            buffer_before_minutes: data.buffer_before_minutes,
            buffer_after_minutes: data.buffer_after_minutes,
            pricing_type: data.pricing_type,
            price: data.pricing_type === 'free' ? 0 : data.price,
            location_type: data.location_type,
            virtual_meeting_url: data.virtual_meeting_url || null,
            max_capacity: data.service_type === 'class' ? data.max_capacity : 1,
            min_notice_hours: data.min_notice_hours,
            max_future_days: data.max_future_days,
            cancellation_hours: data.cancellation_hours,
            auto_confirm: data.auto_confirm,
            visibility: data.visibility,
            pay_later_enabled: data.pay_later_enabled || null,
            pay_later_mode: data.pay_later_mode || null,
            custom_url_slug: data.custom_url_slug || null,
            show_price: data.show_price,
            show_duration: data.show_duration,
            require_account: data.require_account,
            confirmation_message: data.confirmation_message || null,
            redirect_url: data.redirect_url || null,
        };

        if (isEditing || savedServiceId) {
            await updateService.mutateAsync({ id: savedServiceId || serviceId!, ...payload });
        } else {
            await createService.mutateAsync(payload);
        }
    };

    const handleCancel = () => {
        router.push('/admin/services');
    };

    const isPending = createService.isPending || updateService.isPending;
    const error = createService.error || updateService.error;

    if (isEditing && isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse bg-gray-100 h-96 rounded-lg" />
                </div>
            </div>
        );
    }

    const tabs = [
        {
            id: 'basics',
            label: 'Basics & Settings',
            content: <ServiceBasicsTab />,
        },
        {
            id: 'schedule',
            label: 'Schedule & Providers',
            content: <ServiceScheduleTab serviceId={savedServiceId} />,
        },
        {
            id: 'booking-page',
            label: 'Booking Page',
            content: <ServiceBookingPageTab serviceId={savedServiceId} />,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    {/* Header */}
                    <div className="bg-white border-b sticky top-0 z-10">
                        <div className="max-w-6xl mx-auto px-4 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                    </button>
                                    <div>
                                        <h1 className="text-xl font-bold text-gray-900">
                                            {isEditing ? 'Edit Service' : 'Create Service'}
                                        </h1>
                                        {savedServiceId && !isEditing && (
                                            <p className="text-sm text-green-600">Service created - continue configuring</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
                                    >
                                        {isPending ? 'Saving...' : isEditing || savedServiceId ? 'Save Changes' : 'Create Service'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="max-w-6xl mx-auto px-4 pt-4">
                            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                                {error.message}
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {(createService.isSuccess || updateService.isSuccess) && (
                        <div className="max-w-6xl mx-auto px-4 pt-4">
                            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Service saved successfully
                            </div>
                        </div>
                    )}

                    {/* Tabbed Content */}
                    <div className="max-w-6xl mx-auto px-4 py-6">
                        <div className="bg-white rounded-lg border border-gray-200 min-h-[600px]">
                            <HorizontalTabs
                                tabs={tabs}
                                defaultTab={activeTab}
                                onChange={setActiveTab}
                            />
                        </div>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
