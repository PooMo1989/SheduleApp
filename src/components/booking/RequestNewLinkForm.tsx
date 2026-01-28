"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { trpc } from "@/lib/trpc/client";
import { Loader2, CheckCircle } from "lucide-react";

const emailSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

type EmailFormData = z.infer<typeof emailSchema>;

export function RequestNewLinkForm() {
    const [success, setSuccess] = useState(false);

    const form = useForm<EmailFormData>({
        resolver: zodResolver(emailSchema),
    });

    const requestLink = trpc.booking.refreshToken.useMutation({
        onSuccess: () => {
            setSuccess(true);
            form.reset();
        },
        onError: (error) => {
            form.setError("email", {
                message: error.message || "Failed to send link. Please try again.",
            });
        },
    });

    const onSubmit = (data: EmailFormData) => {
        setSuccess(false);
        requestLink.mutate(data);
    };

    if (success) {
        return (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    <div>
                        <p className="font-medium text-sm">Link sent!</p>
                        <p className="text-xs text-green-700 mt-1">
                            Check your email for the new booking management link.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address
                </label>
                <input
                    {...form.register("email")}
                    type="email"
                    id="email"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="your@email.com"
                />
                {form.formState.errors.email && (
                    <p className="mt-1 text-xs text-red-500">{form.formState.errors.email.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={requestLink.isPending}
                className="w-full px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {requestLink.isPending ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Sending...
                    </>
                ) : (
                    "Send New Link"
                )}
            </button>
        </form>
    );
}
