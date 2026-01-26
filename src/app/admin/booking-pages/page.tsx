'use client';

import { AdminLayoutShell } from '@/features/admin/components';
import { BookingPageConfig } from '@/features/admin/components/booking-pages';

export default function AdminBookingPages() {
    return (
        <AdminLayoutShell>
            <div className="max-w-5xl mx-auto">
                <BookingPageConfig />
            </div>
        </AdminLayoutShell>
    );
}
