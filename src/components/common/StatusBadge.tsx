'use client';

interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
    const getSize = () => {
        if (size === 'sm') return 'px-2 py-0.5 text-xs';
        return 'px-2.5 py-0.5 text-sm';
    };

    const getColors = () => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-gray-100 text-gray-800';
            case 'invited':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <span
            className={`inline-flex items-center font-medium rounded-full ${getSize()} ${getColors()}`}
        >
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}
