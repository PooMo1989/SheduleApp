'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Clock, Check, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ServiceDetailProps {
    serviceId: string;
}

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
    location_type: 'in_person' | 'virtual' | 'both';
    virtual_meeting_url: string;
    max_capacity: number;
    visibility: 'public' | 'private';
}

/**
 * Service Detail Component
 * Used in the SplitView to show service details with inline editing.
 */
export function ServiceDetail({ serviceId }: ServiceDetailProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const { data: service, isLoading, error } = trpc.service.getById.useQuery({ id: serviceId });
    const { data: categories } = trpc.category.getAll.useQuery();
    const utils = trpc.useUtils();

    const updateService = trpc.service.update.useMutation({
        onSuccess: () => {
            toast.success('Service updated successfully');
            utils.service.getById.invalidate({ id: serviceId });
            utils.service.getAll.invalidate();
            setIsEditing(false);
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update service');
        },
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ServiceFormData>();

    const onEdit = () => {
        if (service) {
            reset({
                name: service.name,
                description: service.description || '',
                category_id: service.category_id || '',
                service_type: service.service_type as 'consultation' | 'class',
                duration_minutes: service.duration_minutes,
                buffer_before_minutes: service.buffer_before_minutes ?? 0,
                buffer_after_minutes: service.buffer_after_minutes ?? 0,
                pricing_type: (service.pricing_type as ServiceFormData['pricing_type']) || 'fixed',
                price: Number(service.price) || 0,
                location_type: (service.location_type as ServiceFormData['location_type']) || 'in_person',
                virtual_meeting_url: service.virtual_meeting_url || '',
                max_capacity: service.max_capacity ?? 1,
                visibility: (service.visibility as 'public' | 'private') || 'public',
            });
            setIsEditing(true);
        }
    };

    const onSave = handleSubmit(async (data) => {
        await updateService.mutateAsync({
            id: serviceId,
            ...data,
            category_id: data.category_id || null,
            description: data.description || null,
            virtual_meeting_url: data.virtual_meeting_url || null,
        });
    });

    const onCancel = () => {
        setIsEditing(false);
        reset();
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-4 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-32 bg-gray-200 rounded" />
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="p-6 text-center text-red-500">
                Failed to load service details.
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        {isEditing ? 'Edit Service' : service.name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 capitalize">
                        {!isEditing && `${service.service_type} Service`}
                    </p>
                </div>
                {!isEditing ? (
                    <Button
                        onClick={onEdit}
                        size="sm"
                        className="gap-2"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button
                            onClick={onCancel}
                            size="sm"
                            variant="outline"
                            className="gap-2"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </Button>
                        <Button
                            onClick={onSave}
                            size="sm"
                            className="gap-2"
                            disabled={updateService.isPending}
                        >
                            <Save className="w-4 h-4" />
                            {updateService.isPending ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                {!isEditing ? (
                    <>
                        {/* Read-only View */}
                        {/* Status */}
                        <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${service.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {service.is_active ? 'Active' : 'Inactive'}
                            </span>
                            {service.visibility === 'private' && (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Hidden from Booking
                                </span>
                            )}
                        </div>

                        {/* Main Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Price</span>
                                <div className="mt-1 text-lg font-semibold text-gray-900">
                                    {service.price > 0
                                        ? `$${service.price.toFixed(2)}`
                                        : 'Free'
                                    }
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Duration</span>
                                <div className="mt-1 text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    {service.duration_minutes} min
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 whitespace-pre-wrap">
                                {service.description || 'No description provided.'}
                            </div>
                        </div>

                        {/* Settings Summary */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Configuration</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center gap-2">
                                    {(service.providers?.length || 0) > 0
                                        ? <Check className="w-4 h-4 text-green-500" />
                                        : <X className="w-4 h-4 text-gray-300" />
                                    }
                                    <span>{(service.providers?.length || 0)} Providers Assigned</span>
                                </li>
                            </ul>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Edit Form */}
                        <form onSubmit={onSave} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Service Name *
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    {...register('name', { required: 'Name is required' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Category & Type */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                                        Category
                                    </label>
                                    <select
                                        id="category_id"
                                        {...register('category_id')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    >
                                        <option value="">No category</option>
                                        {categories?.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 mb-1">
                                        Service Type *
                                    </label>
                                    <select
                                        id="service_type"
                                        {...register('service_type')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    >
                                        <option value="consultation">Consultation (1:1)</option>
                                        <option value="class">Class (Group)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    {...register('description')}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>

                            {/* Duration & Price */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-1">
                                        Duration (minutes) *
                                    </label>
                                    <input
                                        id="duration_minutes"
                                        type="number"
                                        {...register('duration_minutes', { required: true, min: 5, valueAsNumber: true })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                        Price *
                                    </label>
                                    <input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        {...register('price', { required: true, min: 0, valueAsNumber: true })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>
                            </div>

                            {/* Visibility */}
                            <div>
                                <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
                                    Visibility
                                </label>
                                <select
                                    id="visibility"
                                    {...register('visibility')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                >
                                    <option value="public">Public (Shown in booking pages)</option>
                                    <option value="private">Private (Hidden from booking)</option>
                                </select>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
