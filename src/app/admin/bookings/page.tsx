import { BookingList } from '@/features/admin/components';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Bookings | Admin Dashboard',
    description: 'Manage all company bookings',
};

export default function AdminBookingsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        View and manage all appointments across your business.
                    </p>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <BookingList />
                </div>
            </div>
        </div>
    );
}
