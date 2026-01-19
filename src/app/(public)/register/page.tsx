import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton';
import Link from 'next/link';

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="text-3xl font-bold text-primary-600">
                        sheduleApp
                    </Link>
                    <h1 className="mt-4 text-2xl font-bold text-neutral-900">
                        Create your account
                    </h1>
                    <p className="mt-2 text-sm text-neutral-600">
                        Start booking appointments in minutes
                    </p>
                </div>

                {/* Registration Form Card */}
                <div className="bg-white p-8 rounded-lg shadow-sm border border-neutral-200">
                    <RegisterForm />

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-neutral-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-neutral-500">Or continue with</span>
                            </div>
                        </div>
                        <div className="mt-6">
                            <GoogleSignInButton text="Sign up with Google" />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-neutral-500">
                    By creating an account, you agree to our{' '}
                    <a href="/terms" className="text-primary-600 hover:text-primary-700">
                        Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-primary-600 hover:text-primary-700">
                        Privacy Policy
                    </a>
                </p>
            </div>
        </div>
    );
}
