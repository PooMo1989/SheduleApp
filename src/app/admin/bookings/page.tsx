import { Calendar } from 'lucide-react';

export default function AdminBookingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Bookings</h1>
                <p className="text-neutral-600 mt-1">
                    View and manage all bookings across your business.
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-12 text-center">
                <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-neutral-700 mb-2">
                    Coming Soon
                </h2>
                <p className="text-neutral-500 max-w-md mx-auto">
                    Booking management will be available after the booking flow is implemented (Epic 3 & 4).
                </p>
            </div>
        </div>
    );
}
