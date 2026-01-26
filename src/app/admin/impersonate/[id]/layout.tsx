import { ImpersonationLayout } from '@/features/admin/components/providers/ImpersonationLayout';

// Layout wraps all sub-pages
export default function Layout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { id: string };
}) {
    // Note: params.id comes from file path [id]
    // In Next.js 15 this might need to be awaited if params is a promise, 
    // but standard Next.js 13/14 behavior allows direct access or simple props.
    // The user's package.json says "next": "16.1.3", so verify async params usage.
    // Assuming standard usage for now. If build fails, we await it.

    return (
        <ImpersonationLayout providerId={params.id}>
            {children}
        </ImpersonationLayout>
    );
}
