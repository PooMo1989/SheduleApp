import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
    searchParams: Promise<{
        bookingId?: string;
    }>;
}

export default async function BookingSuccessPage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    // We could use bookingId to fetch details if we wanted to show them again,
    // but a simple success message is fine for MVP.

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h1>
                <p className="text-slate-600 mb-8">
                    Your appointment has been successfully scheduled. We&apos;ve sent a confirmation email to your inbox.
                </p>

                <div className="space-y-3">
                    <Link
                        href={`/book/${slug}`}
                        className="block w-full py-2.5 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Book Another Appointment
                    </Link>
                </div>
            </div>
        </div>
    );
}
