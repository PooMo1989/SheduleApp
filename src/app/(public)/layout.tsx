/**
 * Public Layout
 * Layout for public pages (registration, login, landing page)
 * No authentication required
 */
export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
