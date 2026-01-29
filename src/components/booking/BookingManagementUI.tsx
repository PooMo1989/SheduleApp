"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { format } from "date-fns";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

interface BookingManagementUIProps {
    initialData: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        booking: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        allBookings: any[];
        email: string;
    };
    token: string;
}

const passwordSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don&apos;t match",
    path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export function BookingManagementUI({ initialData, token: _token }: BookingManagementUIProps) {
    const router = useRouter();
    const [showAccountForm, setShowAccountForm] = useState(false);
    const [isUpgrading, setIsUpgrading] = useState(false);

    const upgradeAccount = trpc.auth.upgradeGuestAccount.useMutation({
        onSuccess: () => {
            toast.success("Account created successfully! You can now sign in.");
            setTimeout(() => router.push('/auth/signin'), 2000);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create account");
        },
    });

    const cancelBooking = trpc.booking.cancel.useMutation({
        onSuccess: () => {
            toast.success("Booking cancelled successfully");
            router.refresh();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to cancel booking");
        },
    });

    const form = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
    });

    const handleUpgrade = async (data: PasswordFormData) => {
        setIsUpgrading(true);
        try {
            await upgradeAccount.mutateAsync({
                email: initialData.email,
                password: data.password,
            });
        } finally {
            setIsUpgrading(false);
        }
    };

    const handleCancel = (bookingId: string) => {
        if (confirm("Are you sure you want to cancel this booking?")) {
            cancelBooking.mutate({ bookingId });
        }
    };

    const getStatusBadge = (status: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
            pending: { color: "bg-amber-100 text-amber-800", icon: AlertCircle, label: "Pending" },
            confirmed: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Confirmed" },
            cancelled: { color: "bg-red-100 text-red-800", icon: XCircle, label: "Cancelled" },
            completed: { color: "bg-slate-100 text-slate-800", icon: CheckCircle, label: "Completed" },
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Account Upgrade Banner */}
                {!showAccountForm && (
                    <div className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-bold mb-2">Create Your Account</h2>
                                <p className="text-indigo-100 text-sm mb-4">
                                    Set a password to easily manage all your bookings and get access to more features.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAccountForm(!showAccountForm)}
                                className="px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors text-sm"
                            >
                                Create Account
                            </button>
                        </div>
                    </div>
                )}

                {/* Account Creation Form */}
                {showAccountForm && (
                    <div className="mb-6 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-start justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900">Create Your Account</h2>
                            <button
                                onClick={() => setShowAccountForm(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={form.handleSubmit(handleUpgrade)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={initialData.email}
                                    disabled
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-gray-900 bg-slate-50 text-slate-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Password
                                </label>
                                <input
                                    {...form.register("password")}
                                    type="password"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                    placeholder="Min. 8 characters"
                                />
                                {form.formState.errors.password && (
                                    <p className="mt-1 text-xs text-red-500">{form.formState.errors.password.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Confirm Password
                                </label>
                                <input
                                    {...form.register("confirmPassword")}
                                    type="password"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                />
                                {form.formState.errors.confirmPassword && (
                                    <p className="mt-1 text-xs text-red-500">{form.formState.errors.confirmPassword.message}</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={isUpgrading}
                                className="w-full px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isUpgrading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Account"
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">Your Bookings</h1>
                    <p className="text-slate-600 mt-1">Manage your appointments for {initialData.email}</p>
                </div>

                {/* Bookings List */}
                <div className="space-y-4">
                    {initialData.allBookings.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500">No bookings found</p>
                        </div>
                    ) : (
                        initialData.allBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">
                                            {booking.services?.name || "Service"}
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            with {booking.providers?.name || "Provider"}
                                        </p>
                                    </div>
                                    {getStatusBadge(booking.status)}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                    <div className="flex items-center text-sm text-slate-600">
                                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                        {format(new Date(booking.start_time), "EEEE, MMMM d, yyyy")}
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600">
                                        <Clock className="w-4 h-4 mr-2 text-slate-400" />
                                        {format(new Date(booking.start_time), "h:mm a")}
                                        {booking.services?.duration_minutes && ` (${booking.services.duration_minutes} min)`}
                                    </div>
                                </div>

                                {booking.client_notes && (
                                    <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                                        <p className="text-sm text-slate-600">
                                            <span className="font-medium">Notes:</span> {booking.client_notes}
                                        </p>
                                    </div>
                                )}

                                {/* Actions */}
                                {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleCancel(booking.id)}
                                            disabled={cancelBooking.isPending}
                                            className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                                        >
                                            Cancel Booking
                                        </button>
                                        {/* Future: Reschedule button */}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
