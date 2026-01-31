'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { ServiceBasicsTab } from './ServiceBasicsTab';
import { ServiceScheduleTab, ServiceScheduleTabRef } from './ServiceScheduleTab';
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
    serviceId: string;
}

/**
 * Service Portal Component (Edit Mode Only)
 * Story 2.3.1: Service Setup Tabbed Portal
 * Full-page 3-tab experience for editing existing services
 * Unified save button for all tabs
 */
export function ServicePortal({ serviceId }: ServicePortalProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'basics' | 'schedule' | 'booking'>('basics');
    const [formDirty, setFormDirty] = useState(false);
    const [scheduleTabDirty, setScheduleTabDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [savedFormValues, setSavedFormValues] = useState<ServiceFormData | null>(null);

    // Ref for schedule tab to trigger save
    const scheduleTabRef = useRef<ServiceScheduleTabRef>(null);

    // Combined dirty state
    const hasUnsavedChanges = formDirty || scheduleTabDirty;

    const { data: existingService, isLoading, error } = trpc.service.getById.useQuery(
        { id: serviceId },
        { enabled: !!serviceId }
    );

    const { data: settings } = trpc.admin.getSettings.useQuery();

    const utils = trpc.useUtils();

    const updateService = trpc.service.update.useMutation({
        onSuccess: () => {
            setSavedFormValues(methods.getValues());
            utils.service.getAll.invalidate();
            utils.service.getById.invalidate({ id: serviceId });
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to save changes');
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

    // Track form changes
    useEffect(() => {
        const subscription = methods.watch((formValues) => {
            if (savedFormValues) {
                const hasChanges = JSON.stringify(formValues) !== JSON.stringify(savedFormValues);
                setFormDirty(hasChanges);
            }
        });
        return () => subscription.unsubscribe();
    }, [methods, savedFormValues]);

    // Load existing service data
    useEffect(() => {
        if (existingService) {
            const values: ServiceFormData = {
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
            };
            methods.reset(values);
            setSavedFormValues(values);
            setFormDirty(false);
        }
    }, [existingService, methods, settings?.currency]);

    // Unified save handler
    const handleSave = useCallback(async () => {
        // Check for schedule validation errors
        if (scheduleTabRef.current?.hasErrors()) {
            toast.error('Please fix schedule validation errors before saving');
            setActiveTab('schedule');
            return;
        }

        setIsSaving(true);

        try {
            const data = methods.getValues();
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

            // Save form data
            await updateService.mutateAsync({ id: serviceId, ...payload });

            // Save schedule tab data
            if (scheduleTabRef.current) {
                await scheduleTabRef.current.save();
            }

            // Mark as saved
            setFormDirty(false);
            setScheduleTabDirty(false);
            toast.success('Changes saved');
        } catch (error) {
            // Error already handled by mutation onError
        } finally {
            setIsSaving(false);
        }
    }, [serviceId, updateService, methods]);

    const handleBack = () => {
        if (hasUnsavedChanges) {
            if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
                router.push('/admin/services');
            }
        } else {
            router.push('/admin/services');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3" />
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                        <div className="h-96 bg-gray-100 rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !existingService) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Service not found</h2>
                    <p className="text-gray-500 mb-4">The service you&apos;re looking for doesn&apos;t exist.</p>
                    <button
                        onClick={() => router.push('/admin/services')}
                        className="text-teal-600 hover:text-teal-700 font-medium"
                    >
                        Back to Services
                    </button>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'basics' as const, label: 'Basics & Settings' },
        { id: 'schedule' as const, label: 'Schedule & Providers' },
        { id: 'booking' as const, label: 'Booking Page' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <FormProvider {...methods}>
                {/* Header */}
                <div className="bg-white border-b">
                    <div className="max-w-6xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </button>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">
                                        {existingService.name}
                                    </h1>
                                    <p className="text-sm text-gray-500">
                                        Edit service settings
                                    </p>
                                </div>
                            </div>
                            {hasUnsavedChanges && (
                                <span className="text-sm text-amber-600 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Unsaved changes
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {updateService.error && (
                    <div className="max-w-6xl mx-auto px-4 pt-4">
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                            {updateService.error.message}
                        </div>
                    </div>
                )}

                {/* Tabbed Content */}
                <div className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
                    <div className="bg-white rounded-lg border border-gray-200 min-h-[500px] flex flex-col">
                        {/* Tab Bar */}
                        <div className="border-b border-gray-200">
                            <div className="flex">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors
                                            border-b-2 -mb-px
                                            ${activeTab === tab.id
                                                ? 'border-teal-600 text-teal-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }
                                        `}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content - All tabs stay mounted */}
                        <div className="flex-1 overflow-y-auto">
                            <div className={activeTab === 'basics' ? '' : 'hidden'}>
                                <ServiceBasicsTab />
                            </div>
                            <div className={activeTab === 'schedule' ? '' : 'hidden'}>
                                <ServiceScheduleTab
                                    ref={scheduleTabRef}
                                    serviceId={serviceId}
                                    onDirtyChange={setScheduleTabDirty}
                                />
                            </div>
                            <div className={activeTab === 'booking' ? '' : 'hidden'}>
                                <ServiceBookingPageTab serviceId={serviceId} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Footer with Save Button */}
                <div className="bg-white border-t sticky bottom-0">
                    <div className="max-w-6xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Back to Services
                            </button>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaving || !hasUnsavedChanges}
                                    className="px-6 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </FormProvider>
        </div>
    );
}
