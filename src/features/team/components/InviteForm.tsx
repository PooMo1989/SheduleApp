'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { trpc } from '@/lib/trpc/client';

interface InviteFormData {
    email: string;
    name: string;
    phone: string;
    position: string;
}

/**
 * Invite Form Component
 * Story 2.4.6: Simplified invite form with name, phone, position
 * v3 flow: admin and team member are the same
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
        formState: { errors },
    } = useForm<InviteFormData>({
        defaultValues: {
            email: '',
            name: '',
            phone: '',
            position: '',
        },
    });

    const onSubmit = (data: InviteFormData) => {
        invite.mutate({
            email: data.email,
            name: data.name,
            phone: data.phone || undefined,
            position: data.position || undefined,
        });
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Add Team Member</h3>
            <p className="text-sm text-gray-500 mb-4">
                Send an invitation to join your team
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('name', {
                            required: 'Name is required',
                        })}
                        type="text"
                        placeholder="John Smith"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                </div>

                {/* Email Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                </div>

                {/* Phone Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile Number
                    </label>
                    <input
                        {...register('phone')}
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                </div>

                {/* Position Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position
                    </label>
                    <input
                        {...register('position')}
                        type="text"
                        placeholder="e.g. Senior Stylist, Manager"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                </div>

                {/* Error Display */}
                {invite.error && (
                    <p className="text-sm text-red-600">{invite.error.message}</p>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={invite.isPending}
                    className="w-full px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
                >
                    {invite.isPending ? 'Sending...' : 'Send Invitation'}
                </button>
            </form>

            {/* Success Message with Invite Link (for testing) */}
            {showSuccess && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">
                        Invitation sent!
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
