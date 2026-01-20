import { CompanyProfileForm, BusinessHoursForm, BrandingForm } from '@/features/admin/components';

/**
 * Admin Settings Page
 * Story 2.0: Company Profile Setup
 * 
 * Allows admins to configure:
 * - Company name, logo, URL slug
 * - Contact information
 * - Regional settings (timezone, currency)
 * - Default business hours
 * - Branding colors
 * - Guest checkout setting
 */
export default function AdminSettingsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
                    <p className="text-gray-500 mt-1">
                        Configure your company profile, branding, and booking settings.
                    </p>
                </div>

                {/* Forms */}
                <div className="space-y-8">
                    {/* Company Profile */}
                    <section>
                        <CompanyProfileForm />
                    </section>

                    {/* Business Hours */}
                    <section>
                        <BusinessHoursForm />
                    </section>

                    {/* Branding */}
                    <section>
                        <BrandingForm />
                    </section>
                </div>
            </div>
        </div>
    );
}
