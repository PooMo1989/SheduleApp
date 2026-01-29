'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { trpc } from '@/lib/trpc/client';
import { FileUpload } from '@/components/common/FileUpload';

interface TeamMember {
    id: string;
    name: string | null;
    phone: string | null;
    position: string | null;
    avatarUrl: string | null;
    roles: string[];
    isActive: boolean;
    createdAt: string | null;
}

interface TeamMemberDetailsTabProps {
    member: TeamMember;
}

interface DetailsFormData {
    name: string;
    phone: string;
    position: string;
}

/**
 * Inner component that resets when member ID changes
 */
function TeamMemberDetailsTabInner({ member }: TeamMemberDetailsTabProps) {
    const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const utils = trpc.useUtils();

    // Use uploaded avatar if available, otherwise use member's avatar
    const displayAvatarUrl = uploadedAvatarUrl ?? member.avatarUrl;

    const updateMember = trpc.team.updateMember.useMutation({
        onSuccess: () => {
            utils.team.getById.invalidate({ userId: member.id });
            utils.team.getMembers.invalidate();
            setSuccessMessage('Changes saved successfully');
            setTimeout(() => setSuccessMessage(null), 3000);
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
    } = useForm<DetailsFormData>({
        defaultValues: {
            name: member.name || '',
            phone: member.phone || '',
            position: member.position || '',
        },
    });

    const onSubmit = (data: DetailsFormData) => {
        updateMember.mutate({
            userId: member.id,
            name: data.name,
            phone: data.phone || undefined,
            position: data.position || undefined,
            avatarUrl: displayAvatarUrl,
        });
    };

    const handleAvatarUpload = (url: string) => {
        setUploadedAvatarUrl(url);
        // Immediately save avatar
        updateMember.mutate({
            userId: member.id,
            avatarUrl: url,
        });
    };

    const handleToggleActive = () => {
        updateMember.mutate({
            userId: member.id,
            isActive: !member.isActive,
        });
    };

    const formatDate = (date: string | null) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="p-6 max-w-xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        {displayAvatarUrl ? (
                            <img
                                src={displayAvatarUrl}
                                alt={member.name || ''}
                                className="w-20 h-20 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
                                <span className="text-teal-700 text-2xl font-medium">
                                    {member.name?.charAt(0).toUpperCase() || '?'}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Profile Photo
                        </label>
                        <FileUpload
                            bucket="tenant-assets"
                            path={`team/${member.id}`}
                            accept="image/*"
                            maxSize={5 * 1024 * 1024}
                            onUpload={handleAvatarUpload}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            JPG, PNG or WebP. Max 5MB.
                        </p>
                    </div>
                </div>

                {/* Name Field */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        {...register('name', { required: 'Name is required' })}
                        className={`
                            w-full px-3 py-2 border rounded-lg transition-colors
                            focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                            ${errors.name ? 'border-red-500' : 'border-gray-300'}
                        `}
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                </div>

                {/* Phone Field */}
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                    </label>
                    <input
                        id="phone"
                        type="tel"
                        {...register('phone')}
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                </div>

                {/* Position Field */}
                <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                        Position
                    </label>
                    <input
                        id="position"
                        type="text"
                        {...register('position')}
                        placeholder="e.g. Senior Stylist, Manager"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between py-3 border-t border-gray-200">
                    <div>
                        <p className="text-sm font-medium text-gray-700">Status</p>
                        <p className="text-xs text-gray-500">
                            {member.isActive ? 'Member can access the system' : 'Member access is disabled'}
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={member.isActive}
                            onChange={handleToggleActive}
                            disabled={updateMember.isPending}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                        <span className="ml-3 text-sm text-gray-600">
                            {member.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </label>
                </div>

                {/* Metadata */}
                <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                        Joined {formatDate(member.createdAt)}
                    </p>
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

                {/* Error Message */}
                {updateMember.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <span className="text-sm text-red-700">{updateMember.error.message}</span>
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={updateMember.isPending || !isDirty}
                        className={`
                            px-4 py-2 rounded-lg font-medium transition-colors
                            ${updateMember.isPending || !isDirty
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-teal-600 text-white hover:bg-teal-700'
                            }
                        `}
                    >
                        {updateMember.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}

/**
 * Team Member Details Tab
 * Story 2.4.5: Personal info editing for team members
 * Uses key prop to reset internal state when member changes
 */
export function TeamMemberDetailsTab({ member }: TeamMemberDetailsTabProps) {
    return <TeamMemberDetailsTabInner key={member.id} member={member} />;
}
