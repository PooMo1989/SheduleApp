'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { trpc } from '@/lib/trpc/client';
import type { Service } from '@/types';

interface ServiceFormData {
    name: string;
    description: string;
    duration_minutes: number;
    price: number;
    category_id: string;
    service_type: 'consultation' | 'class';
}

interface ServiceFormProps {
    service?: Service | null;
    onClose: () => void;
    onSuccess: () => void;
}

/**
 * Service Form Component
 * Story 2.3: Create and edit services
 * 
 * Fields per spec: name, description, duration, price, category, service_type
 */
export function ServiceForm({ service, onClose, onSuccess }: ServiceFormProps) {
    const isEditing = !!service;

    const { data: categories } = trpc.category.getAll.useQuery();
    const utils = trpc.useUtils();

    const createService = trpc.service.create.useMutation({
        onSuccess: () => {
            utils.service.getAll.invalidate();
            onSuccess();
        },
    });

    const updateService = trpc.service.update.useMutation({
        onSuccess: () => {
            utils.service.getAll.invalidate();
            onSuccess();
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ServiceFormData>({
        defaultValues: {
            name: '',
            description: '',
            duration_minutes: 60,
            price: 0,
            category_id: '',
            service_type: 'consultation',
        },
    });

    useEffect(() => {
        if (service) {
            reset({
                name: service.name,
                description: service.description || '',
                duration_minutes: service.duration_minutes,
                price: Number(service.price),
                category_id: service.category_id || '',
                service_type: service.service_type as 'consultation' | 'class',
            });
        }
    }, [service, reset]);

    const onSubmit = async (data: ServiceFormData) => {
        const payload = {
            ...data,
            category_id: data.category_id || null,
            description: data.description || undefined,
        };

        if (isEditing && service) {
            await updateService.mutateAsync({ id: service.id, ...payload });
        } else {
            await createService.mutateAsync(payload);
        }
    };

    const isPending = createService.isPending || updateService.isPending;
    const error = createService.error || updateService.error;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {isEditing ? 'Edit Service' : 'Add New Service'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                            {error.message}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Service Name *
                        </label>
                        <input
                            {...register('name', { required: 'Name is required' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="e.g., Initial Consultation"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            {...register('description')}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="Brief description of the service"
                        />
                    </div>

                    {/* Duration & Price */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration (minutes) *
                            </label>
                            <input
                                type="number"
                                {...register('duration_minutes', {
                                    required: 'Duration is required',
                                    min: { value: 5, message: 'Min 5 minutes' },
                                    valueAsNumber: true,
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                            {errors.duration_minutes && (
                                <p className="mt-1 text-sm text-red-600">{errors.duration_minutes.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                {...register('price', {
                                    required: 'Price is required',
                                    min: { value: 0, message: 'Cannot be negative' },
                                    valueAsNumber: true,
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                            {errors.price && (
                                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Type & Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Service Type *
                            </label>
                            <select
                                {...register('service_type')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="consultation">Consultation (1:1)</option>
                                <option value="class">Group Class</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                {...register('category_id')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="">No category</option>
                                {categories?.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
                        >
                            {isPending ? 'Saving...' : isEditing ? 'Update Service' : 'Create Service'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
