'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { registerFormSchema, type RegisterFormInput } from '../schemas/register';
import { createClient } from '@/lib/supabase/client';

/**
 * Registration Form Component
 * 
 * Admin-First Flow:
 * 1. User signs up with email/password
 * 2. Supabase creates auth.user
 * 3. Database trigger (handle_new_user) automatically creates tenant + profile as admin
 * 4. User is redirected to admin dashboard
 */
export function RegisterForm() {
    const router = useRouter();
    const supabase = createClient();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormInput>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            fullName: '',
        },
    });

    const onSubmit = async (data: RegisterFormInput) => {
        setError(null);
        setIsLoading(true);

        try {
            // Create auth user - database trigger handles tenant/profile creation
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.fullName,
                        phone: data.phone,
                    },
                },
            });

            if (authError) {
                if (authError.message.includes('already registered') ||
                    authError.message.includes('already exists')) {
                    setError('EMAIL_EXISTS');
                } else {
                    setError(authError.message);
                }
                return;
            }

            if (!authData.user) {
                setError('Failed to create account. Please try again.');
                return;
            }

            // Redirect based on session state
            if (authData.session) {
                // Auto-confirmed - redirect to admin dashboard
                router.refresh();
                router.push('/admin/dashboard');
            } else {
                // Email confirmation required
                setError('Registration successful! Please check your email to verify your account.');
            }

        } catch (err) {
            console.error('Registration error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Error Message */}
            {error && (
                <div className={`p-3 rounded-md text-sm ${error === 'EMAIL_EXISTS'
                    ? 'bg-blue-50 border border-blue-200 text-blue-700'
                    : 'bg-red-50 border border-red-200 text-red-600'
                    }`}>
                    {error === 'EMAIL_EXISTS' ? (
                        <>
                            <strong>Account Already Exists</strong>
                            <p className="mt-1">
                                You already have an account with this email. Please{' '}
                                <a href="/login" className="font-medium underline hover:text-blue-800">sign in</a>.
                            </p>
                        </>
                    ) : (
                        error
                    )}
                </div>
            )}

            {/* Full Name */}
            <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 mb-1">
                    Full Name
                </label>
                <input
                    id="fullName"
                    type="text"
                    {...register('fullName')}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-neutral-900"
                    placeholder="John Doe"
                />
                {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                )}
            </div>

            {/* Email */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                    Email Address
                </label>
                <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-neutral-900"
                    placeholder="you@example.com"
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
            </div>

            {/* Phone */}
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1">
                    Phone Number
                </label>
                <input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-neutral-900"
                    placeholder="+94 77 123 4567"
                />
                {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
            </div>

            {/* Password */}
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    {...register('password')}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-neutral-900"
                    placeholder="••••••••"
                />
                <p className="mt-1 text-xs text-neutral-500">
                    Must be 8+ characters with uppercase and lowercase letters
                </p>
                {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
            </div>

            {/* Confirm Password */}
            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                    Confirm Password
                </label>
                <input
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword')}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-neutral-900"
                    placeholder="••••••••"
                />
                {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            {/* Login Link */}
            <p className="text-center text-sm text-neutral-600">
                Already have an account?{' '}
                <a href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                    Sign in
                </a>
            </p>
        </form>
    );
}
