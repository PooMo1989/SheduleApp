import { AdminLayoutShell } from '@/features/admin/components';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
