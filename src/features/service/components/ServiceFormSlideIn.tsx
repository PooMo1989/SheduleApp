'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { X, Check, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { ServiceBasicsTab } from './ServiceBasicsTab';
import { ServiceScheduleTab, ServiceScheduleTabRef } from './ServiceScheduleTab';
import { ServiceBookingPageTab } from './ServiceBookingPageTab';

interface ServiceFormData {
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
    custom_url_slug: string;
    show_price: boolean;
    show_duration: boolean;
    require_account: boolean;
    confirmation_message: string;
    redirect_url: string;
}

interface ServiceFormSlideInProps {
    serviceId: string | null;
    isCreating: boolean;
    onClose: () => void;
    onServiceCreated: (serviceId: string) => void;
    onUnsavedChangesChange?: (hasChanges: boolean) => void;
}

/**
 * Service Form Slide-In
 * Unified save button for all tabs
 * All tabs stay mounted to preserve state
 */
export function ServiceFormSlideIn({ serviceId, isCreating, onClose, onServiceCreated, onUnsavedChangesChange }: ServiceFormSlideInProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'schedule' | 'booking'>('info');
    const [isSaving, setIsSaving] = useState(false);
    const [justSaved, setJustSaved] = useState(false);
    // For first-time creation, enable save button with defaults
    const [formDirty, setFormDirty] = useState(isCreating);
    const [scheduleTabDirty, setScheduleTabDirty] = useState(false);
    const [createdServiceId, setCreatedServiceId] = useState<string | null>(serviceId);
    const [isFirstSave, setIsFirstSave] = useState(isCreating);
    const [savedFormValues, setSavedFormValues] = useState<ServiceFormData | null>(null);

    // Ref for schedule tab to trigger save
    const scheduleTabRef = useRef<ServiceScheduleTabRef>(null);

    // Combined dirty state
    const hasUnsavedChanges = formDirty || scheduleTabDirty;

    const utils = trpc.useUtils();
    const { data: settings } = trpc.admin.getSettings.useQuery();

    // Reset state when switching services
    useEffect(() => {
        if (serviceId && !isCreating) {
            // Switching to edit a different service
            setCreatedServiceId(null);
            setFormDirty(false);
            setScheduleTabDirty(false);
            setJustSaved(false);
            setIsFirstSave(false);
        } else if (isCreating) {
            // Starting to create a new service
            setCreatedServiceId(null);
            setFormDirty(true);
            setScheduleTabDirty(false);
            setJustSaved(false);
            setIsFirstSave(true);
        }
    }, [serviceId, isCreating]);

    // Determine which service ID to fetch
    const currentServiceId = isCreating ? createdServiceId : serviceId;

    // Fetch existing service if editing
    const { data: existingService } = trpc.service.getById.useQuery(
        { id: currentServiceId! },
        { enabled: !!currentServiceId }
    );

    const createService = trpc.service.create.useMutation({
        onSuccess: (result) => {
            setCreatedServiceId(result.service.id);
            setIsFirstSave(false);

            // Store current form values as saved state
            setSavedFormValues(methods.getValues());

            utils.service.getAll.invalidate({ includeInactive: true });
            toast.success('Service created');
            onServiceCreated(result.service.id);
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to create service');
        },
    });

    const updateService = trpc.service.update.useMutation({
        onSuccess: () => {
            // Store current form values as saved state
            setSavedFormValues(methods.getValues());

            utils.service.getAll.invalidate({ includeInactive: true });
            if (createdServiceId || serviceId) {
                utils.service.getById.invalidate({ id: createdServiceId || serviceId! });
            }
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to save changes');
        },
    });

    const methods = useForm<ServiceFormData>({
        defaultValues: {
            name: 'New Service',
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

    // Track form changes - compare with saved values
    useEffect(() => {
        const subscription = methods.watch((formValues) => {
            setJustSaved(false);

            // If first save (creating new), always has unsaved changes
            if (isFirstSave) {
                setFormDirty(true);
                return;
            }

            // Compare current values with saved values
            if (savedFormValues) {
                const hasChanges = JSON.stringify(formValues) !== JSON.stringify(savedFormValues);
                setFormDirty(hasChanges);
            } else {
                setFormDirty(true);
            }
        });
        return () => subscription.unsubscribe();
    }, [methods, savedFormValues, isFirstSave]);

    // Notify parent of unsaved changes
    useEffect(() => {
        onUnsavedChangesChange?.(hasUnsavedChanges);
    }, [hasUnsavedChanges, onUnsavedChangesChange]);

    // Reset form when switching to create mode
    useEffect(() => {
        if (isCreating && !existingService) {
            const defaultValues = {
                name: 'New Service',
                description: '',
                category_id: '',
                service_type: 'consultation' as const,
                duration_minutes: 60,
                buffer_before_minutes: 0,
                buffer_after_minutes: 0,
                pricing_type: 'fixed' as const,
                price: 0,
                currency: settings?.currency || 'LKR',
                location_type: 'in_person' as const,
                virtual_meeting_url: '',
                max_capacity: 1,
                min_notice_hours: 24,
                max_future_days: 60,
                cancellation_hours: 24,
                auto_confirm: true,
                visibility: 'public' as const,
                pay_later_enabled: false,
                pay_later_mode: '' as const,
                custom_url_slug: '',
                show_price: true,
                show_duration: true,
                require_account: false,
                confirmation_message: '',
                redirect_url: '',
            };
            methods.reset(defaultValues);
            setSavedFormValues(null);
            setFormDirty(true);
            setIsFirstSave(true);
        }
    }, [isCreating, existingService, methods, settings?.currency]);

    // Load existing service data when editing
    useEffect(() => {
        if (existingService && !isCreating && serviceId) {
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

            // Store loaded values as saved state
            const loadedValues = methods.getValues();
            setSavedFormValues(loadedValues);
            setFormDirty(false);
            setJustSaved(false);
        }
    }, [existingService, isCreating, serviceId, methods, settings?.currency]);

    // Unified save handler - saves form data and schedule tab data
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
                name: data.name || 'New Service',
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

            // Save form data (create or update)
            if (createdServiceId || serviceId) {
                await updateService.mutateAsync({ id: createdServiceId || serviceId!, ...payload });
            } else {
                await createService.mutateAsync(payload);
            }

            // Save schedule tab data (only if service exists)
            if ((createdServiceId || serviceId) && scheduleTabRef.current) {
                await scheduleTabRef.current.save();
            }

            // Mark as saved
            setFormDirty(false);
            setScheduleTabDirty(false);
            setJustSaved(true);
            setTimeout(() => setJustSaved(false), 3000);
        } catch (error) {
            // Error already handled by mutation onError
        } finally {
            setIsSaving(false);
        }
    }, [createdServiceId, serviceId, createService, updateService, methods]);

    // Tab change handler
    const handleTabChange = (tab: 'info' | 'schedule' | 'booking') => {
        setActiveTab(tab);
    };

    const tabs = [
        { id: 'info' as const, label: '1. Info & Settings', number: 1 },
        { id: 'schedule' as const, label: '2. Scheduling & Providers', number: 2 },
        { id: 'booking' as const, label: '3. Booking Page', number: 3 },
    ];

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden">
            <FormProvider {...methods}>
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={onClose}
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {isCreating ? 'Create Service' : existingService?.name || 'Edit Service'}
                            </h2>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={!hasUnsavedChanges || isSaving}
                            className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                justSaved
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : hasUnsavedChanges
                                    ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : justSaved ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Saved
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>

                    {/* Minimal Tabs - Bottom line style */}
                    <div className="flex gap-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`pb-3 text-sm font-medium transition-all relative ${
                                    activeTab === tab.id
                                        ? 'text-teal-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content - All tabs stay mounted, only active one is visible */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    <div className={activeTab === 'info' ? '' : 'hidden'}>
                        <ServiceBasicsTab />
                    </div>
                    <div className={activeTab === 'schedule' ? '' : 'hidden'}>
                        <ServiceScheduleTab
                            ref={scheduleTabRef}
                            serviceId={createdServiceId || serviceId}
                            onDirtyChange={setScheduleTabDirty}
                        />
                    </div>
                    <div className={activeTab === 'booking' ? '' : 'hidden'}>
                        <ServiceBookingPageTab serviceId={createdServiceId || serviceId} />
                    </div>
                </div>
            </FormProvider>
        </div>
    );
}
