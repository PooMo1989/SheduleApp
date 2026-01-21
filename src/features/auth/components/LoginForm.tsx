'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
    const router = useRouter();
    const supabase = createClient();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setError(null);
        setIsLoading(true);

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (authError) {
                if (authError.message.includes('Invalid login credentials')) {
                    setError('Invalid email or password');
                } else {
                    setError(authError.message);
                }
                return;
            }

            if (authData.user) {
                // Fetch user roles for redirect
                const { data: userData } = await supabase
                    .from('users')
                    .select('roles')
                    .eq('id', authData.user.id)
                    .single();

                // Redirect based on roles (admin first, then provider)
                const roles: string[] = userData?.roles || ['client'];
                if (roles.includes('admin')) {
                    router.push('/admin/dashboard');
                } else if (roles.includes('provider')) {
                    router.push('/provider/dashboard');
                } else {
                    router.push('/dashboard');
                }
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Email
                </label>
                <input
                    type="email"
                    {...register('email')}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-neutral-900"
                    autoComplete="email"
                    placeholder="you@example.com"
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
            </div>

            <div>
                <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-neutral-700">
                        Password
                    </label>
                    <Link
                        href="/forgot-password"
                        className="text-sm text-primary-600 hover:text-primary-700"
                    >
                        Forgot password?
                    </Link>
                </div>
                <input
                    type="password"
                    {...register('password')}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-neutral-900"
                    autoComplete="current-password"
                    placeholder="••••••••"
                />
                {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
        </form>
    );
}
