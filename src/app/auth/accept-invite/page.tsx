'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { trpc } from '@/lib/trpc/client';
import { createClient } from '@/lib/supabase/client';

/**
 * Password validation with security requirements
 * Story 3.8: Admin/Provider Strict Authentication
 */
const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter');

const acceptInviteSchema = z.object({
    fullName: z.string().min(1, 'Name is required'),
    password: passwordSchema,
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type AcceptInviteFormData = z.infer<typeof acceptInviteSchema>;

function AcceptInviteContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Validate invitation token
    const { data: invitation, isLoading, error: validationError } = trpc.team.validateInvite.useQuery(
        { token: token || '' },
        { enabled: !!token, retry: false }
    );

    // Accept invitation mutation
    const acceptMutation = trpc.team.acceptInvite.useMutation({
        onSuccess: () => {
            setSuccess(true);
            setTimeout(() => router.push('/login'), 3000);
        },
        onError: (err) => {
            setError(err.message);
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<AcceptInviteFormData>({
        resolver: zodResolver(acceptInviteSchema),
    });

    // Google SSO state
    const [googleLoading, setGoogleLoading] = useState(false);
    const supabase = createClient();

    // Handle Google Sign-In with invitation token
    const handleGoogleSignIn = async () => {
        if (!token) return;
        try {
            setGoogleLoading(true);
            setError(null);

            // Pass the invitation token in the redirect URL
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?invite_token=${token}`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });

            if (oauthError) {
                console.error('Google sign-in error:', oauthError);
                setError('Failed to sign in with Google. Please try again.');
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            setError('An unexpected error occurred.');
        } finally {
            setGoogleLoading(false);
        }
    };

    const onSubmit = (data: AcceptInviteFormData) => {
        if (!token) return;
        setError(null);
        acceptMutation.mutate({
            token,
            fullName: data.fullName,
            password: data.password,
        }, {
            onError: (err) => {
                if (err.message.includes('already registered') || err.message.includes('already exists')) {
                    setError('User already registered');
                } else {
                    setError(err.message);
                }
            }
        });
    };

    // No token provided
    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Link</h1>
                    <p className="text-gray-600">This invitation link is invalid or incomplete.</p>
                </div>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Verifying invitation...</p>
                </div>
            </div>
        );
    }

    // Invalid or expired token
    if (validationError || !invitation) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h1 className="text-xl font-bold text-red-800 mb-2">Invalid Invitation</h1>
                        <p className="text-red-600">
                            {validationError?.message || 'This invitation link is invalid or has expired.'}
                        </p>
                        <button
                            onClick={() => router.push('/login')}
                            className="mt-4 text-teal-600 hover:text-teal-700 font-medium"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Existing User Error State
    if (error === 'User already registered') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full text-center">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="text-blue-600 text-4xl mb-4">ℹ️</div>
                        <h1 className="text-xl font-bold text-blue-900 mb-2">Account Already Exists</h1>
                        <p className="text-blue-700 mb-6">
                            You already have an account with this email address. Please sign in to access your dashboard.
                        </p>
                        <button
                            onClick={() => router.push('/login')}
                            className="w-full py-3 px-4 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full text-center">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="text-green-600 text-5xl mb-4">✓</div>
                        <h1 className="text-xl font-bold text-green-800 mb-2">Account Created!</h1>
                        <p className="text-green-600">
                            Your account has been created successfully. Redirecting to login...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Main form
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Join {invitation.tenantName}</h1>
                        <p className="text-gray-600 mt-2">
                            You have been invited to join as{' '}
                            <span className="font-semibold text-teal-600">
                                {invitation.roles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(' & ')}
                            </span>
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Email (read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={invitation.email}
                                disabled
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                            />
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                {...register('fullName')}
                                placeholder="Enter your full name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            {errors.fullName && (
                                <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                {...register('password')}
                                placeholder="Create a password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Must be 8+ characters with uppercase and lowercase letters
                            </p>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                {...register('confirmPassword')}
                                placeholder="Confirm your password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || acceptMutation.isPending}
                            className="w-full py-3 px-4 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {acceptMutation.isPending ? 'Creating Account...' : 'Create Account & Join'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    {/* Google SSO Button */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {googleLoading ? (
                            <span className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                        )}
                        <span className="text-gray-700 font-medium">
                            {googleLoading ? 'Connecting...' : 'Continue with Google'}
                        </span>
                    </button>

                    {/* Footer */}
                    <p className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <button
                            onClick={() => router.push('/login')}
                            className="text-teal-600 hover:text-teal-700 font-medium"
                        >
                            Sign in instead
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function AcceptInvitePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        }>
            <AcceptInviteContent />
        </Suspense>
    );
}
