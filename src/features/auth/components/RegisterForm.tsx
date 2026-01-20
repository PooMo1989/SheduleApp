'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { registerFormSchema, type RegisterFormInput } from '../schemas/register';
import { createClient } from '@/lib/supabase/client';

/**
 * Generate a unique slug from email address
 * e.g., "john@example.com" -> "john-example-com"
 */
function generateSlugFromEmail(email: string): string {
    return email
        .toLowerCase()
        .replace('@', '-')
        .replace(/\./g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .slice(0, 50); // Limit length
}

/**
 * Registration Form Component
 * 
 * Admin-First Flow:
 * 1. User signs up with email
 * 2. Creates a new tenant (company) with email-based slug
 * 3. User becomes the first admin of that tenant
 * 4. Redirects to admin settings to complete company setup
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
            // 1. Create auth user using client-side Supabase
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

            // 2. Create a new tenant for this admin
            const slug = generateSlugFromEmail(data.email);
            const { data: tenantData, error: tenantError } = await supabase
                .from('tenants')
                .insert({
                    name: data.fullName ? `${data.fullName}'s Company` : 'My Company',
                    slug: slug,
                    settings: {},
                })
                .select('id')
                .single();

            if (tenantError) {
                console.error('Tenant creation failed:', tenantError);
                // If slug already exists, try with a random suffix
                if (tenantError.code === '23505') {
                    const uniqueSlug = `${slug}-${Date.now().toString(36)}`;
                    const { data: retryTenant, error: retryError } = await supabase
                        .from('tenants')
                        .insert({
                            name: data.fullName ? `${data.fullName}'s Company` : 'My Company',
                            slug: uniqueSlug,
                            settings: {},
                        })
                        .select('id')
                        .single();

                    if (retryError || !retryTenant) {
                        setError('Failed to create your company. Please try again.');
                        return;
                    }

                    // Use the retry tenant
                    await createUserProfile(authData.user.id, retryTenant.id, data);
                } else {
                    setError('Failed to create your company. Please try again.');
                    return;
                }
            } else if (tenantData) {
                // 3. Create user profile as ADMIN
                await createUserProfile(authData.user.id, tenantData.id, data);
            }

            // 4. Handle Navigation - redirect to admin settings
            if (authData.session) {
                router.refresh();
                await new Promise(resolve => setTimeout(resolve, 500));
                router.push('/admin/settings'); // First time setup
            } else {
                // Try immediate login for auto-confirm setups
                try {
                    const { data: signInData } = await supabase.auth.signInWithPassword({
                        email: data.email,
                        password: data.password,
                    });

                    if (signInData.session) {
                        router.refresh();
                        await new Promise(resolve => setTimeout(resolve, 500));
                        router.push('/admin/settings');
                    } else {
                        setError('Registration successful! Please check your email to verify your account.');
                        setIsLoading(false);
                    }
                } catch {
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

    // Helper to create user profile as admin
    const createUserProfile = async (
        userId: string,
        tenantId: string,
        data: RegisterFormInput
    ) => {
        const { error: profileError } = await supabase
            .from('users')
            .insert({
                id: userId,
                tenant_id: tenantId,
                role: 'admin', // First user is always admin
                full_name: data.fullName || null,
                phone: data.phone,
            });

        if (profileError) {
            console.error('Profile creation failed:', profileError);
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
