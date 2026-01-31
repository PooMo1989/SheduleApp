'use client';

import { useFormContext } from 'react-hook-form';
import { trpc } from '@/lib/trpc/client';

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
}

/**
 * Service Basics Tab - MODERNIZED
 * Story 2.3.1: Tab 1 - Basics & Settings
 * Story 3.4.1: Pay Later Mode Configuration
 */
export function ServiceBasicsTab() {
    const { data: categories } = trpc.category.getAll.useQuery();
    const { data: settings } = trpc.admin.getSettings.useQuery();

    const {
        register,
        watch,
        formState: { errors },
    } = useFormContext<ServiceFormData>();

    const pricingType = watch('pricing_type');
    const locationType = watch('location_type');
    const serviceType = watch('service_type');
    const payLaterEnabled = watch('pay_later_enabled');

    return (
        <div className="p-8 space-y-8 max-w-3xl">
            {/* Basic Information */}
            <section className="border-t border-gray-100 pt-8 pb-8 first:border-t-0 first:pt-0">
                <h3 className="text-base font-semibold text-gray-900 mb-6 tracking-tight">Basic Information</h3>

                <div className="space-y-6">
                    {/* Service Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                            Service Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            {...register('name', { required: 'Name is required' })}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg
                                bg-white shadow-sm text-gray-900 text-sm
                                placeholder:text-gray-400
                                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                                transition-all duration-150"
                            placeholder="e.g., Initial Consultation"
                        />
                        {errors.name && (
                            <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Category & Type */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="category_id" className="block text-sm font-medium text-gray-900 mb-2">
                                Category
                            </label>
                            <select
                                id="category_id"
                                {...register('category_id')}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg
                                    bg-white shadow-sm text-gray-900 text-sm
                                    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                                    transition-all duration-150"
                            >
                                <option value="">No category</option>
                                {categories?.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="service_type" className="block text-sm font-medium text-gray-900 mb-2">
                                Service Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="service_type"
                                {...register('service_type')}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg
                                    bg-white shadow-sm text-gray-900 text-sm
                                    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                                    transition-all duration-150"
                            >
                                <option value="consultation">Consultation (1:1)</option>
                                <option value="class">Group Class</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            {...register('description')}
                            rows={3}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg
                                bg-white shadow-sm text-gray-900 text-sm
                                placeholder:text-gray-400
                                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                                transition-all duration-150 resize-none"
                            placeholder="Describe what this service includes..."
                        />
                    </div>
                </div>
            </section>

            {/* Duration & Buffers */}
            <section className="border-t border-gray-100 pt-8 pb-8">
                <h3 className="text-base font-semibold text-gray-900 mb-6 tracking-tight">Duration & Timing</h3>

                <div className="grid grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-900 mb-2">
                            Duration (min) <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="duration_minutes"
                            type="number"
                            {...register('duration_minutes', {
                                required: 'Required',
                                min: { value: 5, message: 'Min 5' },
                                valueAsNumber: true,
                            })}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg
                                bg-white shadow-sm text-gray-900 text-sm
                                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                                transition-all duration-150"
                        />
                        {errors.duration_minutes && (
                            <p className="mt-2 text-sm text-red-600">{errors.duration_minutes.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="buffer_before" className="block text-sm font-medium text-gray-900 mb-2">
                            Buffer Before (min)
                        </label>
                        <input
                            id="buffer_before"
                            type="number"
                            {...register('buffer_before_minutes', { valueAsNumber: true, min: 0 })}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg
                                bg-white shadow-sm text-gray-900 text-sm
                                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                                transition-all duration-150"
                        />
                    </div>

                    <div>
                        <label htmlFor="buffer_after" className="block text-sm font-medium text-gray-900 mb-2">
                            Buffer After (min)
                        </label>
                        <input
                            id="buffer_after"
                            type="number"
                            {...register('buffer_after_minutes', { valueAsNumber: true, min: 0 })}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg
                                bg-white shadow-sm text-gray-900 text-sm
                                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                                transition-all duration-150"
                        />
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="border-t border-gray-100 pt-8 pb-8">
                <h3 className="text-base font-semibold text-gray-900 mb-6 tracking-tight">Pricing</h3>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="pricing_type" className="block text-sm font-medium text-gray-900 mb-2">
                            Pricing Type
                        </label>
                        <select
                            id="pricing_type"
                            {...register('pricing_type')}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg
                                bg-white shadow-sm text-gray-900 text-sm
                                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                                transition-all duration-150"
                        >
                            <option value="fixed">Fixed Price</option>
                            <option value="free">Free</option>
                            <option value="variable">Variable</option>
                            <option value="starting_from">Starting From</option>
                        </select>
                    </div>

                    {pricingType !== 'free' && (
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-900 mb-2">
                                Price ({settings?.currency || 'LKR'})
                            </label>
                            <input
                                id="price"
                                type="number"
                                step="0.01"
                                {...register('price', {
                                    valueAsNumber: true,
                                    min: { value: 0, message: 'Cannot be negative' },
                                })}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg
                                    bg-white shadow-sm text-gray-900 text-sm
                                    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                                    transition-all duration-150"
                            />
                            {errors.price && (
                                <p className="mt-2 text-sm text-red-600">{errors.price.message}</p>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Location */}
            <section className="border-t border-gray-100 pt-8 pb-8">
                <h3 className="text-base font-semibold text-gray-900 mb-6 tracking-tight">Location</h3>

                <div className="space-y-6">
                    <div>
                        <label htmlFor="location_type" className="block text-sm font-medium text-gray-900 mb-2">
                            Location Type
                        </label>
                        <select
                            id="location_type"
                            {...register('location_type')}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg
                                bg-white shadow-sm text-gray-900 text-sm
                                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                                transition-all duration-150"
                        >
                            <option value="in_person">In-Person</option>
                            <option value="virtual">Virtual</option>
                            <option value="both">Both (Client Chooses)</option>
                        </select>
                    </div>

                    {(locationType === 'virtual' || locationType === 'both') && (
                        <div>
                            <label htmlFor="virtual_meeting_url" className="block text-sm font-medium text-gray-900 mb-2">
                                Virtual Meeting URL
                            </label>
                            <input
                                id="virtual_meeting_url"
                                type="url"
                                {...register('virtual_meeting_url')}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg
                                    bg-white shadow-sm text-gray-900 text-sm
                                    placeholder:text-gray-400
                                    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                                    transition-all duration-150"
                                placeholder="https://zoom.us/j/..."
                            />
                            <p className="mt-2 text-xs text-gray-600">
                                Leave blank to auto-generate or use provider-specific links
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Capacity (for Group Classes) */}
            {serviceType === 'class' && (
                <section className="border-t border-gray-100 pt-8 pb-8">
                    <h3 className="text-base font-semibold text-gray-900 mb-6 tracking-tight">Capacity</h3>

                    <div>
                        <label htmlFor="max_attendees" className="block text-sm font-medium text-gray-900 mb-2">
                            Maximum Attendees
                        </label>
                        <input
                            id="max_attendees"
                            type="number"
                            {...register('max_capacity', { valueAsNumber: true, min: 1 })}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg
                                bg-white shadow-sm text-gray-900 text-sm
                                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                                transition-all duration-150 max-w-xs"
                        />
                    </div>
                </section>
            )}

            {/* Booking Policies */}
            <section className="border-t border-gray-100 pt-8 pb-8">
                <h3 className="text-base font-semibold text-gray-900 mb-6 tracking-tight">Booking Policies</h3>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="min_notice_hours" className="block text-sm font-medium text-gray-900 mb-2">
                                Minimum Notice (hours)
                            </label>
                            <input
                                id="min_notice_hours"
                                type="number"
                                {...register('min_notice_hours', { valueAsNumber: true, min: 0 })}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg
                                    bg-white shadow-sm text-gray-900 text-sm
                                    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                                    transition-all duration-150"
                            />
                            <p className="mt-2 text-xs text-gray-600">How far in advance clients must book</p>
                        </div>

                        <div>
                            <label htmlFor="max_future_days" className="block text-sm font-medium text-gray-900 mb-2">
                                Booking Window (days)
                            </label>
                            <input
                                id="max_future_days"
                                type="number"
                                {...register('max_future_days', { valueAsNumber: true, min: 1 })}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg
                                    bg-white shadow-sm text-gray-900 text-sm
                                    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                                    transition-all duration-150"
                            />
                            <p className="mt-2 text-xs text-gray-600">How far into the future clients can book</p>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="cancellation_hours" className="block text-sm font-medium text-gray-900 mb-2">
                            Cancellation Policy (hours)
                        </label>
                        <input
                            id="cancellation_hours"
                            type="number"
                            {...register('cancellation_hours', { valueAsNumber: true, min: 0 })}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg
                                bg-white shadow-sm text-gray-900 text-sm
                                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                                transition-all duration-150 max-w-xs"
                        />
                        <p className="mt-2 text-xs text-gray-600">Clients must cancel at least this many hours before</p>
                    </div>

                    {/* Toggle switches */}
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between py-3">
                            <div>
                                <p className="font-medium text-gray-900 text-sm">Auto-confirm Bookings</p>
                                <p className="text-sm text-gray-600 mt-0.5">Bookings are confirmed immediately</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register('auto_confirm')}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full
                                    shadow-inner
                                    peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300
                                    peer-checked:bg-teal-600 peer-checked:shadow-none
                                    after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                                    after:bg-white after:border-gray-300 after:border after:rounded-full
                                    after:h-5 after:w-5 after:transition-all
                                    peer-checked:after:translate-x-full peer-checked:after:border-white
                                    transition-all duration-200">
                                </div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between py-3 border-t border-gray-100">
                            <div>
                                <p className="font-medium text-gray-900 text-sm">Visibility</p>
                                <p className="text-sm text-gray-600 mt-0.5">Public services appear on booking pages</p>
                            </div>
                            <select
                                {...register('visibility')}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm
                                    bg-white shadow-sm
                                    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                                    transition-all duration-150"
                            >
                                <option value="public">Public</option>
                                <option value="private">Private (Invite-only)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pay Later Settings (Story 3.4.1) */}
            <section className="border-t border-gray-100 pt-8 pb-8">
                <h3 className="text-base font-semibold text-gray-900 mb-6 tracking-tight">Pay Later Settings</h3>

                <div className="space-y-6">
                    <div className="flex items-center justify-between py-3">
                        <div>
                            <p className="font-medium text-gray-900 text-sm">Enable Pay Later</p>
                            <p className="text-sm text-gray-600 mt-0.5">Allow clients to book without immediate payment</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                {...register('pay_later_enabled')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full
                                shadow-inner
                                peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300
                                peer-checked:bg-teal-600 peer-checked:shadow-none
                                after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                                after:bg-white after:border-gray-300 after:border after:rounded-full
                                after:h-5 after:w-5 after:transition-all
                                peer-checked:after:translate-x-full peer-checked:after:border-white
                                transition-all duration-200">
                            </div>
                        </label>
                    </div>

                    {payLaterEnabled && (
                        <div>
                            <label htmlFor="pay_later_mode" className="block text-sm font-medium text-gray-900 mb-2">
                                Pay Later Mode
                            </label>
                            <select
                                id="pay_later_mode"
                                {...register('pay_later_mode')}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg
                                    bg-white shadow-sm text-gray-900 text-sm
                                    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                                    transition-all duration-150 max-w-md"
                            >
                                <option value="">Use company default ({settings?.pay_later_mode === 'auto_confirm' ? 'Auto-confirm' : 'Pending Approval'})</option>
                                <option value="auto_confirm">Auto-confirm bookings</option>
                                <option value="pending_approval">Require admin approval</option>
                            </select>
                            <p className="mt-2 text-xs text-gray-600">
                                {settings?.pay_later_mode === 'auto_confirm'
                                    ? 'Company default: Bookings confirmed immediately'
                                    : 'Company default: Bookings require admin approval'}
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
