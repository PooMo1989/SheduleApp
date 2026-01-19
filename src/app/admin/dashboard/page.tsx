import { LogoutButton } from '@/components/common/LogoutButton';

export default function AdminDashboardPage() {
    return (
        <div className="min-h-screen bg-neutral-50">
            <header className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-primary-600">sheduleApp</h1>
                            <span className="text-xs text-neutral-500">Admin Dashboard</span>
                        </div>
                        <LogoutButton />
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                    <h2 className="text-xl font-semibold text-neutral-900 mb-4">Welcome, Administrator</h2>
                    <p className="text-neutral-600">Manage providers, services, and view reports.</p>
                </div>
            </main>
        </div>
    );
}
