'use client';

import { trpc } from '@/lib/trpc/client';
import { format } from 'date-fns';
import { Calendar, Clock, User, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function MyBookingsPage() {
    const { data, isLoading } = trpc.booking.getMyBookings.useQuery({
        // No status filter = show all bookings
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
            </div>
        );
    }

    const bookings = data?.bookings || [];

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">My Bookings</h1>

                {bookings.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-slate-900 mb-2">No bookings yet</h2>
                        <p className="text-slate-600 mb-6">You haven&apos;t made any appointments.</p>
                        <Link
                            href="/"
                            className="inline-block px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Book an Appointment
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">
                                            {booking.services?.name || 'Service'}
                                        </h3>
                                        {booking.status === 'pending' && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mt-1">
                                                Awaiting Approval
                                            </span>
                                        )}
                                        {booking.status === 'confirmed' && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                                Confirmed
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-slate-600">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                                        <span>{format(new Date(booking.start_time), 'EEEE, MMMM d, yyyy')}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                                        <span>
                                            {format(new Date(booking.start_time), 'h:mm a')}
                                            {booking.services?.duration_minutes && ` (${booking.services.duration_minutes} mins)`}
                                        </span>
                                    </div>
                                    {booking.providers && (
                                        <div className="flex items-center">
                                            <User className="w-4 h-4 mr-2 text-indigo-500" />
                                            <span>{booking.providers.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
