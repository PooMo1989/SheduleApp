'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileUpload } from '@/components/common/FileUpload';
import { useUserProfile } from '@/features/auth/hooks/useUserProfile';
import { trpc } from '@/lib/trpc/client';

const personalInfoSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

/**
 * Personal Info Tab Component (Story 2.8.8)
 *
 * Allows users to edit their personal information including:
 * - Profile photo
 * - Name
 * - Email (read-only, managed by auth)
 * - Phone number
 */
export function PersonalInfoTab() {
    const { profile, isLoading: profileLoading } = useUserProfile();
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        reset,
    } = useForm<PersonalInfoFormData>({
        resolver: zodResolver(personalInfoSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
        },
    });

    // Update form when profile loads
    useEffect(() => {
        if (profile) {
            reset({
                name: profile.name || '',
                email: profile.email || '',
                phone: '',
            });
            setAvatarUrl(profile.avatarUrl);
        }
    }, [profile, reset]);

    const onSubmit = async (data: PersonalInfoFormData) => {
        setIsSaving(true);
        setSuccessMessage(null);

        try {
            // TODO: Implement profile update via tRPC
            console.log('Saving profile:', data, avatarUrl);

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setSuccessMessage('Profile updated successfully');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = (url: string) => {
        setAvatarUrl(url);
    };

    if (profileLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-neutral-200 rounded-full" />
                        <div className="h-4 bg-neutral-200 rounded w-32" />
                    </div>
                    <div className="space-y-3">
                        <div className="h-10 bg-neutral-200 rounded" />
                        <div className="h-10 bg-neutral-200 rounded" />
                        <div className="h-10 bg-neutral-200 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="Profile"
                                className="w-20 h-20 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-20 h-20 bg-neutral-200 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-10 h-10 text-neutral-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Profile Photo
                        </label>
                        {profile?.tenantId ? (
                            <FileUpload
                                bucket="tenant-assets"
                                path={`${profile.tenantId}/users/${profile.id}`}
                                accept="image/*"
                                maxSize={5 * 1024 * 1024}
                                onUpload={handleAvatarUpload}
                            />
                        ) : (
                            <div className="text-sm text-neutral-500">
                                Loading upload settings...
                            </div>
                        )}
                        <p className="mt-1 text-xs text-neutral-500">
                            JPG, PNG or WebP. Max 5MB.
                        </p>
                    </div>
                </div>

                {/* Name Field */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
                        Full Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        {...register('name')}
                        className={`
                            w-full px-3 py-2 border rounded-lg transition-colors
                            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                            ${errors.name ? 'border-red-500' : 'border-neutral-300'}
                        `}
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                </div>

                {/* Email Field (Read-only) */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        {...register('email')}
                        disabled
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-500 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                        Email cannot be changed. Contact support if needed.
                    </p>
                </div>

                {/* Phone Field */}
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1">
                        Phone Number
                    </label>
                    <input
                        id="phone"
                        type="tel"
                        {...register('phone')}
                        placeholder="+1 (555) 123-4567"
                        className={`
                            w-full px-3 py-2 border rounded-lg transition-colors
                            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                            ${errors.phone ? 'border-red-500' : 'border-neutral-300'}
                        `}
                    />
                    {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                        <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        <span className="text-sm text-green-700">{successMessage}</span>
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving || !isDirty}
                        className={`
                            px-4 py-2 rounded-lg font-medium transition-colors
                            ${isSaving || !isDirty
                                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                                : 'bg-primary-600 text-white hover:bg-primary-700'
                            }
                        `}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
