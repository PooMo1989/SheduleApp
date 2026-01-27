"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton";


// Zod schema for the form
const bookingFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    phone: z.string().optional(),
    notes: z.string().max(500, "Notes limited to 500 characters").optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
    serviceId: string;
    tenantId: string;
    providerId?: string; // If pre-selected
    startTime: string; // ISO string
    slug: string;
}

export function BookingForm({
    serviceId,
    tenantId,
    providerId,
    startTime,
    slug
}: BookingFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emailExists, setEmailExists] = useState<{ exists: boolean; name?: string } | null>(null);
    const [checkingEmail, setCheckingEmail] = useState(false);


    // Mutation
    const createBooking = trpc.booking.create.useMutation({
        onSuccess: (data) => {
            toast.success("Booking confirmed!");
            // Redirect to success page (we can pass the booking ID if needed)
            router.push(`/book/${slug}/success?bookingId=${data.booking.id}&slug=${slug}`);
        },
        onError: (error) => {
            console.error("Booking failed:", error);
            const message = error.message || "Failed to create booking. Please try again.";
            toast.error(message);
            setIsSubmitting(false);
        }
    });

    // Form setup
    const form = useForm<BookingFormValues>({
        resolver: zodResolver(bookingFormSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            notes: "",
        },
    });

    const onSubmit = (values: BookingFormValues) => {
        setIsSubmitting(true);

        // We need a providerId. If the service doesn't have a specific provider selected in URL,
        // we might need to pick one or let the backend handle it.
        // However, the `booking.create` input REQUIRES `providerId`.
        // Current logic assumption: For MVP, we likely picked a provider or the system assigns one.
        // If providerId is missing here, we have a problem.
        // Let's assume for Tier 1 MVP: Single Provider or simple assignment.
        // FIX: The backend `booking.create` REQUIRES providerId.
        // If we didn't select one in the UI, we must fetch one "Any" provider logic.
        // But `getAvailability` returns slots. The slot data MIGHT contain providerId?
        // Let's check `getAvailability` types.
        // If not, we block submission if missing.

        if (!providerId) {
            // Fallback: If we don't have a providerId, we can't book currently based on the schema.
            // We should have selected a provider or the availability slot implies one.
            // For now, fail gracefully.
            toast.error("System Error: No provider selected.");
            setIsSubmitting(false);
            return;
        }

        createBooking.mutate({
            serviceId,
            tenantId,
            providerId: providerId,
            startTime,
            clientName: values.name,
            clientEmail: values.email,
            clientPhone: values.phone,
            clientNotes: values.notes,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
    };

    // tRPC utils for client-side queries
    const trpcUtils = trpc.useUtils();

    // Check if email exists (Story 3.6)
    const handleEmailCheck = async (email: string) => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailExists(null);
            return;
        }

        setCheckingEmail(true);
        try {
            const result = await trpcUtils.client.auth.checkEmail.query({ email, tenantId });

            if (result.exists) {
                setEmailExists({
                    exists: true,
                    name: result.user?.name || undefined,
                });
            } else {
                setEmailExists({ exists: false });
            }
        } catch (error) {
            console.error('Email check failed:', error);
            setEmailExists(null);
        } finally {
            setCheckingEmail(false);
        }
    };


    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                </label>
                <input
                    {...form.register("name")}
                    type="text"
                    id="name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="Jane Doe"
                />
                {form.formState.errors.name && (
                    <p className="mt-1 text-xs text-red-500">{form.formState.errors.name.message}</p>
                )}
            </div>

            {/* Email */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address
                </label>
                <input
                    {...form.register("email")}
                    type="email"
                    id="email"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="jane@example.com"
                    onBlur={(e) => handleEmailCheck(e.target.value)}
                />
                {form.formState.errors.email && (
                    <p className="mt-1 text-xs text-red-500">{form.formState.errors.email.message}</p>
                )}

                {/* Email Conflict Alert (Story 3.6) */}
                {emailExists?.exists && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3 flex-1">
                                <h3 className="text-sm font-medium text-blue-800">
                                    We found your account!
                                    {emailExists.name && ` (${emailExists.name})`}
                                </h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <p>You can:</p>
                                </div>
                                <div className="mt-2 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/auth/signin?email=${form.getValues('email')}&redirect=/book/${slug}/${serviceId}/confirm?time=${startTime}&providerId=${providerId}`)}
                                        className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                                    >
                                        Sign in to book
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEmailExists(null)}
                                        className="text-xs px-3 py-1.5 bg-white text-blue-700 border border-blue-300 rounded hover:bg-blue-50 font-medium"
                                    >
                                        Continue as guest
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {checkingEmail && (
                    <p className="mt-1 text-xs text-slate-500">Checking email...</p>
                )}
            </div>


            {/* Phone */}
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number (Optional)
                </label>
                <input
                    {...form.register("phone")}
                    type="tel"
                    id="phone"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="+1 (555) 000-0000"
                />
            </div>

            {/* Notes */}
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
                    Notes (Optional)
                </label>
                <textarea
                    {...form.register("notes")}
                    id="notes"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                    placeholder="Anything else we should know?"
                />
                {form.formState.errors.notes && (
                    <p className="mt-1 text-xs text-red-500">{form.formState.errors.notes.message}</p>
                )}
            </div>

            {/* OAuth Alternative (Story 3.6) */}
            <div className="py-4">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-white text-slate-500">Or create an account while booking</span>
                    </div>
                </div>

                <div className="mt-4">
                    <GoogleSignInButton
                        redirectTo={`/book/${slug}/${serviceId}/confirm?time=${startTime}&providerId=${providerId}`}
                        text="Continue with Google"
                    />
                </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Booking...
                        </>
                    ) : (
                        "Confirm Booking"
                    )}
                </button>
                <p className="mt-3 text-xs text-center text-slate-400">
                    By booking, you agree to our terms and cancellation policy.
                </p>
            </div>
        </form>
    );
}
