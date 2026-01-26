import { ImpersonationLayout } from '@/features/admin/components/providers/ImpersonationLayout';

// Layout wraps all sub-pages
export default async function Layout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <ImpersonationLayout providerId={id}>
            {children}
        </ImpersonationLayout>
    );
}
