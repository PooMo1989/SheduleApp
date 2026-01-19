'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { registerFormSchema, type RegisterFormInput } from '../schemas/register';
import { trpc } from '@/lib/trpc/client';

/**
 * Registration Form Component
 * Handles user registration with email, phone, and password
 */
export function RegisterForm() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
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

    const registerMutation = trpc.auth.register.useMutation({
        onSuccess: (data) => {
            setSuccess(data.message);
            // Redirect to dashboard after a short delay to show success message
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        },
        onError: (err) => {
            setError(err.message);
        },
    });

    const onSubmit = (data: RegisterFormInput) => {
        setError(null);
        setSuccess(null);
        registerMutation.mutate({
            email: data.email,
            phone: data.phone,
            password: data.password,
            fullName: data.fullName,
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Error Message */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                    {error}
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
                    {success}
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
                disabled={isSubmitting || registerMutation.isPending}
                className="w-full py-2.5 px-4 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isSubmitting || registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
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
