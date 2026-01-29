'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { trpc } from '@/lib/trpc/client';
import { FileUpload } from '@/components/common';

/**
 * Company Profile Settings Form
 * Story 2.0: Admin Company Profile Setup
 * Story 2.5.1: File Upload Infrastructure (Logo upload)
 * 
 * Per spec: Name, Logo, Timezone, Currency, URL slug, Guest Checkout
 */
export function CompanyProfileForm() {
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    const { data: settings, isLoading, error } = trpc.admin.getSettings.useQuery();
    const utils = trpc.useUtils();

    const updateSettings = trpc.admin.updateSettings.useMutation({
        onMutate: () => setSaveStatus('saving'),
        onSuccess: () => {
            setSaveStatus('saved');
            utils.admin.getSettings.invalidate();
            setTimeout(() => setSaveStatus('idle'), 2000);
        },
        onError: () => setSaveStatus('error'),
    });

    const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
        values: settings ? {
            name: settings.name,
            slug: settings.slug,
            timezone: settings.timezone || 'Asia/Kolkata',
            currency: settings.currency || 'LKR',
            allow_guest_checkout: settings.allow_guest_checkout ?? true,
            business_category: settings.business_category || '',
            slot_interval_minutes: settings.slot_interval_minutes ?? 15,
        } : undefined,
    });

    const onSubmit = (data: {
        name: string;
        slug: string;
        timezone: string;
        currency: string;
        allow_guest_checkout: boolean;
        business_category: string;
        slot_interval_minutes: number;
    }) => {
        updateSettings.mutate({
            name: data.name,
            slug: data.slug,
            timezone: data.timezone,
            currency: data.currency,
            allow_guest_checkout: data.allow_guest_checkout,
            business_category: data.business_category || null,
            slot_interval_minutes: Number(data.slot_interval_minutes),
        });
    };

    const handleLogoUpload = (url: string) => {
        updateSettings.mutate({ logo_url: url });
    };

    const handleLogoDelete = () => {
        updateSettings.mutate({ logo_url: null });
    };

    if (isLoading) {
        return <div className="animate-pulse bg-gray-100 h-64 rounded-lg" />;
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                Failed to load settings: {error.message}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Company Logo */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Logo</h3>
                <FileUpload
                    bucket="tenant-assets"
                    path={`${settings?.id}/company/logo`}
                    currentUrl={settings?.logo_url}
                    onUpload={handleLogoUpload}
                    onDelete={handleLogoDelete}
                    label="Logo"
                    helperText="This logo will appear on your booking page and emails"
                />
            </div>

            {/* Company Name & URL Slug */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company Name *
                        </label>
                        <input
                            {...register('name', { required: 'Company name is required' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="Your Company Name"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Booking URL Slug *
                        </label>
                        <div className="flex">
                            <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">
                                sheduleapp.com/
                            </span>
                            <input
                                {...register('slug', {
                                    required: 'URL slug is required',
                                    pattern: {
                                        value: /^[a-z0-9-]+$/,
                                        message: 'Only lowercase letters, numbers, and hyphens',
                                    },
                                })}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                placeholder="your-company"
                            />
                        </div>
                        {errors.slug && (
                            <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Regional Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Timezone
                        </label>
                        <select
                            {...register('timezone')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                            <option value="Asia/Colombo">Asia/Colombo (SLT)</option>
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">America/New_York (EST)</option>
                            <option value="Europe/London">Europe/London (GMT)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Currency
                        </label>
                        <select
                            {...register('currency')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="LKR">LKR - Sri Lankan Rupee</option>
                            <option value="INR">INR - Indian Rupee</option>
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Business Category
                        </label>
                        <select
                            {...register('business_category')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="">Select a category...</option>
                            <option value="wellness">Wellness & Spa</option>
                            <option value="salon">Salon & Beauty</option>
                            <option value="fitness">Fitness & Gym</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="consulting">Consulting</option>
                            <option value="education">Education & Tutoring</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Slot Interval
                        </label>
                        <select
                            {...register('slot_interval_minutes', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value={5}>5 minutes</option>
                            <option value={10}>10 minutes</option>
                            <option value={15}>15 minutes</option>
                            <option value={20}>20 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={45}>45 minutes</option>
                            <option value={60}>60 minutes</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            Time intervals for the booking calendar
                        </p>
                    </div>
                </div>
            </div>

            {/* Booking Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Settings</h3>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900">Allow Guest Checkout</p>
                        <p className="text-sm text-gray-500">
                            Clients can book without creating a full account
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            {...register('allow_guest_checkout')}
                            type="checkbox"
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between">
                <div>
                    {saveStatus === 'saved' && (
                        <span className="text-green-600 text-sm">✓ Settings saved successfully</span>
                    )}
                    {saveStatus === 'error' && (
                        <span className="text-red-600 text-sm">✗ Failed to save settings</span>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={!isDirty || saveStatus === 'saving'}
                    className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}
