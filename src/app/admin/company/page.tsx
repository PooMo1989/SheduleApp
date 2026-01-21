import {
    CompanyProfileForm,
    BusinessHoursForm,
    BrandingForm,
} from '@/features/admin/components';

export default function AdminCompanyPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Company Profile</h1>
                <p className="text-neutral-600 mt-1">
                    Manage your business identity, branding, and operating hours.
                </p>
            </div>

            {/* Company Profile Section */}
            <section className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                    Basic Information
                </h2>
                <CompanyProfileForm />
            </section>

            {/* Business Hours Section */}
            <section className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                    Business Hours
                </h2>
                <BusinessHoursForm />
            </section>

            {/* Branding Section */}
            <section className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                    Branding Colors
                </h2>
                <BrandingForm />
            </section>
        </div>
    );
}
