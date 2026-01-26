import { ProviderLayoutShell } from '@/features/provider/components';

/**
 * Provider Layout (Story 6.0)
 *
 * Root layout for all provider pages. Wraps children with the provider
 * layout shell which includes sidebar navigation and header.
 */
export default function ProviderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ProviderLayoutShell>{children}</ProviderLayoutShell>;
}
