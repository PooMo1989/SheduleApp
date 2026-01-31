'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';

interface QuickCreateFormData {
    name: string;
    description: string;
    service_type: 'consultation' | 'class';
    duration_minutes: number;
    pricing_type: 'free' | 'fixed';
    price: number;
}

/**
 * Simple Service Creation Form
 * Quick create with minimal fields - users can configure more in edit mode
 */
export function ServiceCreateForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const utils = trpc.useUtils();

    const { data: settings } = trpc.admin.getSettings.useQuery();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<QuickCreateFormData>({
        defaultValues: {
            name: '',
            description: '',
            service_type: 'consultation',
            duration_minutes: 60,
            pricing_type: 'fixed',
            price: 0,
        },
    });

    const createService = trpc.service.create.useMutation({
        onSuccess: (result) => {
            toast.success('Service created successfully!');
            utils.service.getAll.invalidate();
            // Navigate to edit mode for full configuration
            router.push(`/admin/services/${result.service.id}/edit`);
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to create service');
            setIsSubmitting(false);
        },
    });

    const pricingType = watch('pricing_type');

    const onSubmit = async (data: QuickCreateFormData) => {
        setIsSubmitting(true);

        // Explicitly convert to numbers to ensure type safety
        const durationMinutes = typeof data.duration_minutes === 'string'
            ? parseInt(data.duration_minutes, 10)
            : data.duration_minutes;
        const price = typeof data.price === 'string'
            ? parseFloat(data.price)
            : data.price;

        await createService.mutateAsync({
            name: data.name,
            description: data.description || null,
            service_type: data.service_type,
            duration_minutes: durationMinutes,
            pricing_type: data.pricing_type,
            price: data.pricing_type === 'free' ? 0 : price,
            // Defaults for other fields
            buffer_before_minutes: 0,
            buffer_after_minutes: 0,
            location_type: 'in_person',
            max_capacity: 1,
            min_notice_hours: 24,
            max_future_days: 60,
            cancellation_hours: 24,
            auto_confirm: true,
            visibility: 'public',
        });
    };

    const handleCancel = () => {
        router.push('/admin/services');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-2xl mx-auto px-4 py-4">
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
                            <h1 className="text-xl font-bold text-gray-900">Create New Service</h1>
                            <p className="text-sm text-gray-500">Start with the basics, configure more later</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Service Name */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Service Name *
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    {...register('name', { required: 'Service name is required' })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="e.g., Initial Consultation"
                                    autoFocus
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description <span className="text-gray-400">(optional)</span>
                                </label>
                                <textarea
                                    id="description"
                                    {...register('description')}
                                    rows={2}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="Brief description of this service..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Service Type */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Service Type *
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="relative cursor-pointer">
                                <input
                                    type="radio"
                                    {...register('service_type')}
                                    value="consultation"
                                    className="peer sr-only"
                                />
                                <div className="p-4 border-2 border-gray-200 rounded-lg peer-checked:border-teal-500 peer-checked:bg-teal-50 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">1-on-1</p>
                                            <p className="text-sm text-gray-500">Individual session</p>
                                        </div>
                                    </div>
                                </div>
                            </label>

                            <label className="relative cursor-pointer">
                                <input
                                    type="radio"
                                    {...register('service_type')}
                                    value="class"
                                    className="peer sr-only"
                                />
                                <div className="p-4 border-2 border-gray-200 rounded-lg peer-checked:border-teal-500 peer-checked:bg-teal-50 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Group</p>
                                            <p className="text-sm text-gray-500">Multiple attendees</p>
                                        </div>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Duration *
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {[15, 30, 45, 60, 90, 120].map((minutes) => (
                                <label key={minutes} className="relative cursor-pointer">
                                    <input
                                        type="radio"
                                        {...register('duration_minutes', {
                                            valueAsNumber: true,
                                            setValueAs: (v) => parseInt(v, 10)
                                        })}
                                        value={minutes}
                                        className="peer sr-only"
                                    />
                                    <div className="px-4 py-2 border-2 border-gray-200 rounded-lg peer-checked:border-teal-500 peer-checked:bg-teal-50 transition-all">
                                        <span className="font-medium text-gray-900">
                                            {minutes >= 60 ? `${minutes / 60}h` : `${minutes}m`}
                                        </span>
                                    </div>
                                </label>
                            ))}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            You can set a custom duration in the full settings
                        </p>
                    </div>

                    {/* Pricing */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Pricing *
                        </label>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <label className="relative cursor-pointer">
                                    <input
                                        type="radio"
                                        {...register('pricing_type')}
                                        value="fixed"
                                        className="peer sr-only"
                                    />
                                    <div className="p-3 border-2 border-gray-200 rounded-lg peer-checked:border-teal-500 peer-checked:bg-teal-50 transition-all text-center">
                                        <span className="font-medium text-gray-900">Fixed Price</span>
                                    </div>
                                </label>

                                <label className="relative cursor-pointer">
                                    <input
                                        type="radio"
                                        {...register('pricing_type')}
                                        value="free"
                                        className="peer sr-only"
                                    />
                                    <div className="p-3 border-2 border-gray-200 rounded-lg peer-checked:border-teal-500 peer-checked:bg-teal-50 transition-all text-center">
                                        <span className="font-medium text-gray-900">Free</span>
                                    </div>
                                </label>
                            </div>

                            {pricingType === 'fixed' && (
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                        Price ({settings?.currency || 'LKR'})
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                            {settings?.currency || 'LKR'}
                                        </span>
                                        <input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            {...register('price', {
                                                valueAsNumber: true,
                                                setValueAs: (v) => parseFloat(v) || 0,
                                                min: { value: 0, message: 'Price cannot be negative' },
                                            })}
                                            className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    {errors.price && (
                                        <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* What's Next Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex gap-3">
                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="font-medium text-blue-900">What happens next?</p>
                                <p className="text-sm text-blue-700 mt-1">
                                    After creating, you&apos;ll be able to configure schedule, assign providers,
                                    customize the booking page, and more.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    Create Service
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
