import { api } from "@/lib/trpc/api";
import { BookingManagementUI } from "@/components/booking/BookingManagementUI";
import { RequestNewLinkForm } from "@/components/booking/RequestNewLinkForm";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface PageProps {
    searchParams: Promise<{
        token?: string;
    }>;
}

export default async function BookingManagePage({ searchParams }: PageProps) {
    const { token } = await searchParams;

    if (!token) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 max-w-md w-full text-center">
                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-slate-900 mb-2">No Token Provided</h1>
                    <p className="text-slate-600 mb-6">
                        This page requires a valid booking token to access.
                    </p>
                    <p className="text-sm text-slate-500">
                        Check your email for the booking management link, or enter your email below to request a new one.
                    </p>
                    <div className="mt-6">
                        <RequestNewLinkForm />
                    </div>
                </div>
            </div>
        );
    }

    // Fetch booking data using the token
    const trpc = await api();

    try {
        const data = await trpc.booking.getByToken({ token });

        // Valid token - show booking management UI
        // eslint-disable-next-line react-hooks/error-boundaries
        return <BookingManagementUI initialData={data} token={token} />;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        // Token error - show appropriate message
        const isExpired = error?.message?.includes('expired');

        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 max-w-md w-full text-center">
                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-slate-900 mb-2">
                        {isExpired ? 'Link Expired' : 'Invalid Link'}
                    </h1>
                    <p className="text-slate-600 mb-6">
                        {isExpired
                            ? 'This booking link has expired. Enter your email below to receive a new one.'
                            : 'This booking link is invalid or has been deactivated.'}
                    </p>
                    <RequestNewLinkForm />
                </div>
            </div>
        );
    }
}
