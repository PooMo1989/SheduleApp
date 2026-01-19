'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const resetPasswordSchema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isExpired, setIsExpired] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    // Check for expired/invalid token on mount by checking session
    useEffect(() => {
        const checkSession = async () => {
            // When user clicks the reset link, Supabase sets the session in URL fragment
            // The auth listener in client.ts handles storing it.
            // Here we check if we have a valid session to allow password update.
            const { data: { session }, error } = await supabase.auth.getSession();

            // If error or no session (and not just loading), the link might be invalid/expired
            if (error || !session) {
                // This is a basic check. Strictly, the user might just not be logged in. 
                // But effectively they must be logged in via the recovery link to use updateUser.
                // We'll let them try, but show error if updateUser fails due to no auth.
            }
        };

        checkSession();
    }, [supabase]);

    const onSubmit = async (data: ResetPasswordFormData) => {
        setError(null);
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: data.password,
            });

            if (error) {
                if (error.message.includes('expired') || error.message.includes('invalid') || error.message.includes('logged in')) {
                    setIsExpired(true);
                } else {
                    setError(error.message);
                }
                return;
            }

            setIsSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err) {
            console.error(err);
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (isExpired) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-2">Reset Link Invalid</h2>
                <p className="text-neutral-600 mb-4 text-sm">
                    This password reset link has expired or is invalid. Please request a new one.
                </p>
                <Link
                    href="/forgot-password"
                    className="inline-block py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                    Request New Link
                </Link>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-2">Password Updated</h2>
                <p className="text-neutral-600 text-sm">
                    Your password has been changed successfully. Redirecting to login...
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                    New Password
                </label>
                <input
                    type="password"
                    {...register('password')}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    autoComplete="new-password"
                    placeholder="••••••••"
                />
                {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Confirm New Password
                </label>
                <input
                    type="password"
                    {...register('confirmPassword')}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    autoComplete="new-password"
                    placeholder="••••••••"
                />
                {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? 'Updating Password...' : 'Update Password'}
            </button>
        </form>
    );
}
