import { LogoutButton } from '@/components/common/LogoutButton';

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <header className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-primary-600">sheduleApp</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-neutral-600">Dashboard</span>
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </header>

            {/* Welcome Message */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                            Welcome to sheduleApp! 🎉
                        </h2>
                        <p className="text-neutral-600 max-w-md mx-auto">
                            Your account has been created successfully. You can now start booking appointments.
                        </p>
                    </div>
                </div>

                {/* Placeholder for future dashboard content */}
                <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                        <h3 className="font-semibold text-neutral-900 mb-2">Upcoming Appointments</h3>
                        <p className="text-sm text-neutral-500">No appointments scheduled yet.</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                        <h3 className="font-semibold text-neutral-900 mb-2">Quick Actions</h3>
                        <p className="text-sm text-neutral-500">Book your first appointment!</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                        <h3 className="font-semibold text-neutral-900 mb-2">Profile</h3>
                        <p className="text-sm text-neutral-500">Complete your profile settings.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
