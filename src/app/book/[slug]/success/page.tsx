'use client';

import { CheckCircle2, Calendar, Clock, User, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { format } from "date-fns";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

const passwordSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function BookingSuccessPage() {
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('bookingId');
    const slug = searchParams.get('slug');

    const [showAccountCreation, setShowAccountCreation] = useState(true);

    // Fetch booking details
    const { data: booking, isLoading } = trpc.booking.getById.useQuery(
        { bookingId: bookingId || '' },
        { enabled: !!bookingId }
    );

    // Get session to check if user is logged in
    const { data: session } = trpc.auth.getSession.useQuery();
    const isLoggedIn = !!session?.user;

    // Account upgrade mutation (to be implemented)
    const upgradeAccount = trpc.auth.upgradeGuestAccount.useMutation({
        onSuccess: () => {
            toast.success("Account created successfully!");
            setShowAccountCreation(false);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create account");
        }
    });

    const form = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = (values: PasswordFormValues) => {
        if (!booking?.client_email) return;

        upgradeAccount.mutate({
            email: booking.client_email,
            password: values.password,
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="animate-pulse text-slate-400">Loading booking details...</div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 max-w-md w-full text-center">
                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-slate-900 mb-2">Booking Not Found</h1>
                    <p className="text-slate-600 mb-6">We couldn&apos;t find your booking details.</p>
                    {slug && (
                        <Link
                            href={`/book/${slug}`}
                            className="inline-block px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Back to Booking
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    const bookingDate = new Date(booking.start_time);
    const isPending = booking.status === 'pending';
    const isGuest = !booking.client_user_id; // Guest if no user ID associated

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 max-w-2xl w-full overflow-hidden">
                {/* Success Header */}
                <div className="p-8 md:p-12 text-center border-b border-slate-100">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h1>
                    <p className="text-slate-600">
                        {isPending
                            ? "Your booking request has been received and is awaiting confirmation."
                            : "Your appointment has been successfully scheduled."}
                    </p>
                </div>

                {/* Booking Details */}
                <div className="p-8 md:p-12 bg-slate-50/50 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Booking Details</h2>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                        {/* Service Name */}
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Service</p>
                            <p className="font-semibold text-slate-900">{booking.services?.name || 'Service'}</p>
                        </div>

                        {/* Date */}
                        <div className="flex items-center text-sm text-slate-600">
                            <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                            <span>{format(bookingDate, "EEEE, MMMM d, yyyy")}</span>
                        </div>

                        {/* Time */}
                        <div className="flex items-center text-sm text-slate-600">
                            <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                            <span>{format(bookingDate, "h:mm a")} ({booking.services?.duration_minutes || 0} mins)</span>
                        </div>

                        {/* Provider */}
                        {booking.providers && (
                            <div className="flex items-center text-sm text-slate-600">
                                <User className="w-4 h-4 mr-2 text-indigo-500" />
                                <span>{booking.providers.name}</span>
                            </div>
                        )}

                        {/* Status Badge */}
                        {isPending && (
                            <div className="pt-3 mt-3 border-t border-slate-100">
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
                                    Awaiting Admin Approval
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Email Confirmation Message */}
                    <p className="mt-4 text-sm text-slate-500 text-center">
                        {isPending
                            ? "You will receive an email once your booking is confirmed."
                            : "A confirmation email has been sent to your inbox."}
                    </p>
                </div>

                {/* Guest Account Creation Prompt */}
                {isGuest && showAccountCreation && (
                    <div className="p-8 md:p-12 bg-indigo-50/30 border-b border-indigo-100">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                Want to easily track and manage your bookings?
                            </h3>
                            <p className="text-sm text-slate-600">
                                Create an account to view your booking history, reschedule appointments, and more.
                            </p>
                        </div>

                        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md mx-auto space-y-4">
                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                                    Password
                                </label>
                                <input
                                    {...form.register("password")}
                                    type="password"
                                    id="password"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                    placeholder="At least 8 characters"
                                />
                                {form.formState.errors.password && (
                                    <p className="mt-1 text-xs text-red-500">{form.formState.errors.password.message}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                                    Confirm Password
                                </label>
                                <input
                                    {...form.register("confirmPassword")}
                                    type="password"
                                    id="confirmPassword"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                    placeholder="Re-enter your password"
                                />
                                {form.formState.errors.confirmPassword && (
                                    <p className="mt-1 text-xs text-red-500">{form.formState.errors.confirmPassword.message}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={upgradeAccount.isPending}
                                className="w-full py-2.5 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {upgradeAccount.isPending ? "Creating Account..." : "Create Account"}
                            </button>

                            {/* Skip Button */}
                            <button
                                type="button"
                                onClick={() => setShowAccountCreation(false)}
                                className="w-full text-sm text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                Skip for now
                            </button>
                        </form>
                    </div>
                )}

                {/* Actions */}
                <div className="p-8 md:p-12 space-y-3">
                    {/* View My Bookings button - only for logged-in users */}
                    {isLoggedIn && (
                        <Link
                            href="/my-bookings"
                            className="block w-full py-2.5 px-4 bg-white border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors text-center"
                        >
                            View My Bookings
                        </Link>
                    )}

                    {/* Book Another Appointment button */}
                    {slug && (
                        <Link
                            href={`/book/${slug}`}
                            className="block w-full py-2.5 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-center"
                        >
                            Book Another Appointment
                        </Link>
                    )}

                    {/* Magic link info - only for guests who skipped account creation */}
                    {!isLoggedIn && !showAccountCreation && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 text-left">
                            <p className="font-medium mb-1">Check Your Email</p>
                            <p>We&apos;ve sent you a magic link to manage this booking. Click the link in your email to view, reschedule, or cancel your appointment.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
