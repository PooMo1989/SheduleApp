
import { Json } from '@/types/database.types';

type UserData = {
    roles: string[] | null;
    permissions: Json | null;
};

// Define the permission structure
export interface UserPermissions {
    services?: {
        view?: boolean;
        add?: boolean;
        edit?: boolean;
        delete?: boolean;
    };
    providers?: {
        view?: boolean;
        add?: boolean;
        edit?: boolean;
        delete?: boolean;
    };
    bookings?: {
        view?: boolean; // View all bookings
        manage?: boolean; // Reschedule/Cancel any
    };
    team?: {
        view?: boolean;
        invite?: boolean;
        edit?: boolean;
    };
    payments?: {
        view?: boolean;
        refund?: boolean;
    };
    company?: {
        edit?: boolean;
    };
}

// Helper to check permission
export const hasPermission = (
    user: UserData | null | undefined,
    resource: keyof UserPermissions,
    action: string
): boolean => {
    if (!user) return false;

    const roles = user.roles || [];

    // Owners and admins have full access
    if (roles.includes('owner') || roles.includes('admin')) {
        return true;
    }

    // Parse permissions
    const permissions = (user.permissions as UserPermissions) || {};
    const resourcePerms = permissions[resource] as Record<string, boolean> | undefined;

    if (!resourcePerms) return false;

    // Check specific action
    return resourcePerms[action] === true;
};

// Default permissions for roles
export const ROLE_DEFAULT_PERMISSIONS: Record<string, UserPermissions> = {
    admin: {
        // Technically implicit, but good reference
        services: { view: true, add: true, edit: true, delete: true },
        providers: { view: true, add: true, edit: true, delete: true },
        bookings: { view: true, manage: true },
        team: { view: true, invite: true, edit: true },
        payments: { view: true, refund: true },
        company: { edit: true },
    },
    provider: {
        services: { view: true },
        // Providers can only manage their own bookings typically (handled by logic, not generic perm?)
        // Or if we give them 'view' here, they can see ALL services?
        bookings: { view: false }, // Only own
    },
    client: {},
};
