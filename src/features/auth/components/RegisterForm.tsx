'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { registerFormSchema, type RegisterFormInput } from '../schemas/register';
import { createClient } from '@/lib/supabase/client';

// Default tenant ID for MVP
const DEFAULT_TENANT_ID = 'a0000000-0000-0000-0000-000000000001';

/**
 * Registration Form Component
 * Handles user registration with email, phone, and password
 * Uses client-side Supabase auth for automatic session creation
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
            // 1. Create auth user using client-side Supabase (establishes session)
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
                    setError('Email already registered. Please login instead.');
                } else {
                    setError(authError.message);
                }
                return;
            }

            if (!authData.user) {
                setError('Failed to create account. Please try again.');
                return;
            }

            // 2. Create user profile in users table
            const { error: profileError } = await supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    tenant_id: DEFAULT_TENANT_ID,
                    role: 'client',
                    full_name: data.fullName || null,
                    phone: data.phone,
                });

            if (profileError) {
                console.error('Profile creation failed:', profileError);
                // User is already logged in, but profile creation failed
                // We'll still redirect to dashboard - profile can be recreated later
            }

            // 3. Handle Navigation based on Session
            if (authData.session) {
                // Auto-login active (Standard flow)
                router.refresh();
                await new Promise(resolve => setTimeout(resolve, 500));
                router.push('/dashboard');
            } else {
                // Session missing.
                // Scenario A: Verification Required -> User is not confirmed.
                // Scenario B: Verification Disabled -> User IS confirmed, but signUp didn't return session (authentication quirk).

                // standard fallback: Try to login immediately.
                // If it works, Scenario B was true.
                // If it fails, Scenario A is true (User needs to check email).
                try {
                    const { data: signInData } = await supabase.auth.signInWithPassword({
                        email: data.email,
                        password: data.password,
                    });

                    if (signInData.session) {
                        // Success! Redirect.
                        router.refresh();
                        await new Promise(resolve => setTimeout(resolve, 500));
                        router.push('/dashboard');
                    } else {
                        // Login failed, so verification is definitely required.
                        setError('Registration successful! Please check your email to verify your account.');
                        setIsLoading(false);
                    }
                } catch {
                    // Login errored imply verification needed
                    setError('Registration successful! Please check your email to verify your account.');
                    setIsLoading(false);
                }
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
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                    {error}
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
