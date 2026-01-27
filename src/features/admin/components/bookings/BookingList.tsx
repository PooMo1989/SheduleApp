'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { format } from 'date-fns';
import { Loader2, AlertCircle, Calendar, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

/**
 * Booking List Component
 * Story 5.1: Admin Booking List View
 */
export function BookingList() {
    const [statusFilter, setStatusFilter] = useState<'pending' | 'confirmed' | 'cancelled' | 'all'>('all');
    const [page, setPage] = useState(0);
    const LIMIT = 10;

    // Fetch bookings
    const { data, isLoading, isError, error } = trpc.booking.getAll.useQuery({
        limit: LIMIT,
        offset: page * LIMIT,
        status: statusFilter === 'all' ? undefined : statusFilter,
    });

    const bookings = data?.bookings || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / LIMIT);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmed</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
            case 'completed':
                return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Completed</Badge>;
            default:
                return <Badge variant="outline" className="capitalize">{status}</Badge>;
        }
    };

    if (isError) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Error loading bookings: {error.message}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter Status:</span>
                    <select
                        className="text-sm border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value as 'pending' | 'confirmed' | 'cancelled' | 'all');
                            setPage(0); // Reset page on filter change
                        }}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending Approval</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                </div>
            )}

            {/* Basic Table */}
            {!isLoading && bookings.length > 0 && (
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(booking.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900">
                                                {format(new Date(booking.start_time), 'MMM d, yyyy')}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {format(new Date(booking.start_time), 'h:mm a')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{booking.services?.name || 'Unknown Service'}</div>
                                        <div className="text-xs text-gray-500">{booking.services?.duration_minutes} mins</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{booking.client_name}</div>
                                        <div className="text-xs text-gray-500">{booking.client_email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {booking.providers?.display_name || 'Unassigned'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            href={`/admin/bookings/${booking.id}`}
                                            className="text-teal-600 hover:text-teal-900"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && bookings.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-200">
                    <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
                    <p className="text-gray-500 mt-1">
                        {statusFilter !== 'all'
                            ? `There are no ${statusFilter} bookings.`
                            : "You don't have any bookings yet."}
                    </p>
                </div>
            )}

            {/* Pagination */}
            {!isLoading && total > LIMIT && (
                <div className="flex justify-between items-center py-4">
                    <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="px-4 py-2 border rounded-md text-sm disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {page + 1} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="px-4 py-2 border rounded-md text-sm disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
