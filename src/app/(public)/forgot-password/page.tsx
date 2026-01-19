import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
            <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-sm border border-neutral-200">
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                    Reset Password
                </h1>
                <p className="text-neutral-600 mb-6 text-sm">
                    Enter your email address and we will send you a link to reset your password.
                </p>

                <ForgotPasswordForm />

                <p className="mt-6 text-center text-sm text-neutral-600">
                    Remember your password?{' '}
                    <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
