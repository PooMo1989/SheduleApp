import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
            <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-sm border border-neutral-200">
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                    Set New Password
                </h1>
                <p className="text-neutral-600 mb-6 text-sm">
                    Please enter your new password below.
                </p>

                <ResetPasswordForm />
            </div>
        </div>
    );
}
