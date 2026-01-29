'use client';

import { useFormContext } from 'react-hook-form';
import { trpc } from '@/lib/trpc/client';

interface ServiceFormData {
    custom_url_slug: string;
    show_price: boolean;
    show_duration: boolean;
    require_account: boolean;
    confirmation_message: string;
    redirect_url: string;
}

interface ServiceBookingPageTabProps {
    serviceId: string | null;
}

/**
 * Service Booking Page Tab
 * Story 2.3.1: Tab 3 - Booking Page Configuration
 */
export function ServiceBookingPageTab({ serviceId }: ServiceBookingPageTabProps) {
    const { data: settings } = trpc.admin.getSettings.useQuery();

    const {
        register,
        watch,
        formState: { errors },
    } = useFormContext<ServiceFormData>();

    const customSlug = watch('custom_url_slug');

    // Preview URL
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const tenantSlug = settings?.slug || 'your-company';
    const previewUrl = customSlug
        ? `${baseUrl}/book/${tenantSlug}/${customSlug}`
        : `${baseUrl}/book/${tenantSlug}/service-name`;

    return (
        <div className="p-6 space-y-6 max-w-3xl">
            {/* URL Configuration */}
            <section className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Page URL</h3>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="custom_url_slug" className="block text-sm font-medium text-gray-700 mb-1">
                            Custom URL Slug
                        </label>
                        <div className="flex">
                            <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">
                                /book/{tenantSlug}/
                            </span>
                            <input
                                id="custom_url_slug"
                                type="text"
                                {...register('custom_url_slug', {
                                    pattern: {
                                        value: /^[a-z0-9-]*$/,
                                        message: 'Only lowercase letters, numbers, and hyphens',
                                    },
                                })}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                placeholder="initial-consultation"
                            />
                        </div>
                        {errors.custom_url_slug && (
                            <p className="mt-1 text-sm text-red-600">{errors.custom_url_slug.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Leave blank to use an auto-generated URL
                        </p>
                    </div>

                    {/* Preview */}
                    {customSlug && (
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Preview URL:</p>
                            <code className="text-sm text-teal-600 break-all">{previewUrl}</code>
                        </div>
                    )}
                </div>
            </section>

            {/* Display Settings */}
            <section className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Settings</h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium text-gray-900">Show Price</p>
                            <p className="text-sm text-gray-500">Display pricing on the booking page</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                {...register('show_price')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between py-2 border-t">
                        <div>
                            <p className="font-medium text-gray-900">Show Duration</p>
                            <p className="text-sm text-gray-500">Display service duration on the booking page</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                {...register('show_duration')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between py-2 border-t">
                        <div>
                            <p className="font-medium text-gray-900">Require Client Account</p>
                            <p className="text-sm text-gray-500">Clients must sign in to book (no guest checkout)</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                {...register('require_account')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                        </label>
                    </div>
                </div>
            </section>

            {/* Confirmation Settings */}
            <section className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">After Booking</h3>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="confirmation_message" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirmation Message
                        </label>
                        <textarea
                            id="confirmation_message"
                            {...register('confirmation_message')}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="Thank you for booking! We look forward to seeing you."
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Custom message shown after a successful booking
                        </p>
                    </div>

                    <div>
                        <label htmlFor="redirect_url" className="block text-sm font-medium text-gray-700 mb-1">
                            Redirect URL (optional)
                        </label>
                        <input
                            id="redirect_url"
                            type="url"
                            {...register('redirect_url')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="https://your-website.com/thank-you"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Redirect clients to this URL after booking confirmation
                        </p>
                    </div>
                </div>
            </section>

            {/* Embed Code Preview */}
            {serviceId && (
                <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Embed Code</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Use this code to embed the booking widget for this service on your website.
                    </p>

                    <div className="bg-gray-900 rounded-lg p-4">
                        <code className="text-sm text-green-400 font-mono break-all">
                            {`<iframe src="${previewUrl}" width="100%" height="600" frameborder="0"></iframe>`}
                        </code>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            navigator.clipboard.writeText(
                                `<iframe src="${previewUrl}" width="100%" height="600" frameborder="0"></iframe>`
                            );
                        }}
                        className="mt-3 text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                        Copy to clipboard
                    </button>
                </section>
            )}

            {!serviceId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="font-medium text-blue-900">Embed code will be available after saving</p>
                            <p className="text-sm text-blue-700">
                                Save the service first to generate the booking page embed code.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
