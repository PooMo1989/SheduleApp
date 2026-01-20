'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { trpc } from '@/lib/trpc/client';

interface InviteFormData {
    email: string;
}

/**
 * Invite Form Component
 * Story 2.4: Form to invite team members by email
 */
export function InviteForm() {
    const [showSuccess, setShowSuccess] = useState(false);
    const utils = trpc.useUtils();

    const invite = trpc.team.invite.useMutation({
        onSuccess: () => {
            utils.team.getMembers.invalidate();
            setShowSuccess(true);
            reset();
            setTimeout(() => setShowSuccess(false), 3000);
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<InviteFormData>();

    const onSubmit = (data: InviteFormData) => {
        invite.mutate({ email: data.email });
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Invite Team Member</h3>
            <p className="text-sm text-gray-500 mb-4">
                Send an invitation to join your team
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3">
                <div className="flex-1">
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
                    {invite.error && (
                        <p className="mt-1 text-sm text-red-600">{invite.error.message}</p>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={invite.isPending}
                    className="px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                    {invite.isPending ? 'Sending...' : 'Send Invitation'}
                </button>
            </form>

            {showSuccess && (
                <p className="mt-3 text-sm text-green-600">
                    ✓ Invitation sent! They will receive an email with a link to join.
                </p>
            )}
        </div>
    );
}
