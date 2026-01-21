'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { trpc } from '@/lib/trpc/client';

interface InviteFormData {
    email: string;
    isAdmin: boolean;
    isProvider: boolean;
}

/**
 * Invite Form Component
 * Story 2.4 + 2.4.1: Form to invite team members with role selection
 */
export function InviteForm() {
    const [showSuccess, setShowSuccess] = useState(false);
    const [inviteUrl, setInviteUrl] = useState<string | null>(null);
    const utils = trpc.useUtils();

    const invite = trpc.team.invite.useMutation({
        onSuccess: (data) => {
            utils.team.getMembers.invalidate();
            setShowSuccess(true);
            setInviteUrl(data.inviteUrl);
            reset();
            setTimeout(() => {
                setShowSuccess(false);
                setInviteUrl(null);
            }, 10000);
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<InviteFormData>({
        defaultValues: {
            isAdmin: false,
            isProvider: true, // Default to provider
        },
    });

    const isAdmin = watch('isAdmin');
    const isProvider = watch('isProvider');

    const onSubmit = (data: InviteFormData) => {
        // Build roles array from checkboxes
        const roles: ('admin' | 'provider')[] = [];
        if (data.isAdmin) roles.push('admin');
        if (data.isProvider) roles.push('provider');

        // Ensure at least one role is selected
        if (roles.length === 0) {
            return; // Validation will show error
        }

        invite.mutate({ email: data.email, roles });
    };

    const noRoleSelected = !isAdmin && !isProvider;

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Invite Team Member</h3>
            <p className="text-sm text-gray-500 mb-4">
                Send an invitation to join your team
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                    </label>
                    <input
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address',
                            },
                        })}
                        type="email"
                        placeholder="colleague@example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                </div>

                {/* Role Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Roles (select at least one)
                    </label>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                {...register('isProvider')}
                                type="checkbox"
                                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-700">
                                <strong>Provider</strong> — Can be booked for services
                            </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                {...register('isAdmin')}
                                type="checkbox"
                                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-700">
                                <strong>Admin</strong> — Can manage team, services, settings
                            </span>
                        </label>
                    </div>
                    {noRoleSelected && (
                        <p className="mt-1 text-sm text-red-600">Select at least one role</p>
                    )}
                </div>

                {/* Error Display */}
                {invite.error && (
                    <p className="text-sm text-red-600">{invite.error.message}</p>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={invite.isPending || noRoleSelected}
                    className="w-full px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
                >
                    {invite.isPending ? 'Sending...' : 'Send Invitation'}
                </button>
            </form>

            {/* Success Message with Invite Link (for testing) */}
            {showSuccess && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">
                        ✓ Invitation sent!
                    </p>
                    {inviteUrl && (
                        <div className="mt-2">
                            <p className="text-xs text-gray-500">Invite link (for testing):</p>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded block mt-1 break-all">
                                {inviteUrl}
                            </code>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
