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

    // Mutation
    const createBooking = trpc.booking.create.useMutation({
        onSuccess: (data) => {
            toast.success("Booking confirmed!");
            // Redirect to success page (we can pass the booking ID if needed)
            router.push(`/book/${slug}/success?bookingId=${data.booking.id}`);
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
                />
                {form.formState.errors.email && (
                    <p className="mt-1 text-xs text-red-500">{form.formState.errors.email.message}</p>
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
