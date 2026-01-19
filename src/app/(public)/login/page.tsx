import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton';
import { LoginForm } from '@/features/auth/components/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="text-3xl font-bold text-primary-600">
                        sheduleApp
                    </Link>
                    <h1 className="mt-4 text-2xl font-bold text-neutral-900">
                        Welcome back
                    </h1>
                    <p className="mt-2 text-sm text-neutral-600">
                        Sign in to your account
                    </p>
                </div>

                {/* Login Form Card */}
                <div className="bg-white p-8 rounded-lg shadow-sm border border-neutral-200">
                    <LoginForm />

                    <div className="mt-6">
                        {/* Google Sign In */}
                        <GoogleSignInButton text="Sign in with Google" />
                    </div>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-neutral-500">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
