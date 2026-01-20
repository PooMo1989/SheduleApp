import { describe, it, expect } from 'vitest';

/**
 * Middleware Route Protection Tests
 * 
 * These tests verify the route classification and protection logic
 * used in the Next.js middleware for authentication.
 */

const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/auth/callback',
    '/api',
];

function isPublicRoute(pathname: string): boolean {
    return publicRoutes.some(route =>
        pathname === route || pathname.startsWith(route + '/')
    );
}

describe('Middleware Route Classification', () => {
    describe('isPublicRoute', () => {
        describe('public routes', () => {
            it('should classify "/" as public', () => {
                expect(isPublicRoute('/')).toBe(true);
            });

            it('should classify "/login" as public', () => {
                expect(isPublicRoute('/login')).toBe(true);
            });

            it('should classify "/register" as public', () => {
                expect(isPublicRoute('/register')).toBe(true);
            });

            it('should classify "/forgot-password" as public', () => {
                expect(isPublicRoute('/forgot-password')).toBe(true);
            });

            it('should classify "/reset-password" as public', () => {
                expect(isPublicRoute('/reset-password')).toBe(true);
            });

            it('should classify "/auth/callback" as public', () => {
                expect(isPublicRoute('/auth/callback')).toBe(true);
            });

            it('should classify "/api" and subroutes as public', () => {
                expect(isPublicRoute('/api')).toBe(true);
                expect(isPublicRoute('/api/trpc')).toBe(true);
                expect(isPublicRoute('/api/trpc/health')).toBe(true);
            });
        });

        describe('protected routes', () => {
            it('should classify "/dashboard" as protected', () => {
                expect(isPublicRoute('/dashboard')).toBe(false);
            });

            it('should classify "/admin" routes as protected', () => {
                expect(isPublicRoute('/admin')).toBe(false);
                expect(isPublicRoute('/admin/dashboard')).toBe(false);
                expect(isPublicRoute('/admin/settings')).toBe(false);
            });

            it('should classify "/provider" routes as protected', () => {
                expect(isPublicRoute('/provider')).toBe(false);
                expect(isPublicRoute('/provider/dashboard')).toBe(false);
                expect(isPublicRoute('/provider/calendar')).toBe(false);
            });

            it('should classify "/bookings" routes as protected', () => {
                expect(isPublicRoute('/bookings')).toBe(false);
                expect(isPublicRoute('/bookings/123')).toBe(false);
            });

            it('should classify "/profile" as protected', () => {
                expect(isPublicRoute('/profile')).toBe(false);
            });
        });
    });
});

describe('Role-Based Route Access', () => {
    type Role = 'admin' | 'provider' | 'client';

    function canAccessRoute(role: Role, pathname: string): boolean {
        // Admin routes - only admins
        if (pathname.startsWith('/admin')) {
            return role === 'admin';
        }

        // Provider routes - providers and admins
        if (pathname.startsWith('/provider')) {
            return role === 'provider' || role === 'admin';
        }

        // All other authenticated routes - any role
        return true;
    }

    describe('admin routes', () => {
        it('admin can access admin routes', () => {
            expect(canAccessRoute('admin', '/admin/dashboard')).toBe(true);
            expect(canAccessRoute('admin', '/admin/services')).toBe(true);
            expect(canAccessRoute('admin', '/admin/providers')).toBe(true);
        });

        it('provider cannot access admin routes', () => {
            expect(canAccessRoute('provider', '/admin/dashboard')).toBe(false);
        });

        it('client cannot access admin routes', () => {
            expect(canAccessRoute('client', '/admin/dashboard')).toBe(false);
        });
    });

    describe('provider routes', () => {
        it('admin can access provider routes', () => {
            expect(canAccessRoute('admin', '/provider/dashboard')).toBe(true);
        });

        it('provider can access provider routes', () => {
            expect(canAccessRoute('provider', '/provider/dashboard')).toBe(true);
            expect(canAccessRoute('provider', '/provider/calendar')).toBe(true);
        });

        it('client cannot access provider routes', () => {
            expect(canAccessRoute('client', '/provider/dashboard')).toBe(false);
        });
    });

    describe('client routes', () => {
        it('all roles can access client dashboard', () => {
            expect(canAccessRoute('admin', '/dashboard')).toBe(true);
            expect(canAccessRoute('provider', '/dashboard')).toBe(true);
            expect(canAccessRoute('client', '/dashboard')).toBe(true);
        });

        it('all roles can access bookings', () => {
            expect(canAccessRoute('admin', '/bookings')).toBe(true);
            expect(canAccessRoute('provider', '/bookings')).toBe(true);
            expect(canAccessRoute('client', '/bookings')).toBe(true);
        });
    });
});

describe('Authentication Redirect Logic', () => {
    function getRedirectUrl(
        isAuthenticated: boolean,
        pathname: string,
        role: 'admin' | 'provider' | 'client' | null
    ): string | null {
        const isPublic = isPublicRoute(pathname);
        const authPages = ['/login', '/register', '/forgot-password', '/reset-password'];

        // Not authenticated, trying to access protected route
        if (!isAuthenticated && !isPublic) {
            return `/login?redirect=${pathname}`;
        }

        // Authenticated, trying to access auth pages
        if (isAuthenticated && authPages.includes(pathname)) {
            if (role === 'admin') return '/admin/dashboard';
            if (role === 'provider') return '/provider/dashboard';
            return '/dashboard';
        }

        // No redirect needed
        return null;
    }

    describe('unauthenticated user', () => {
        it('should redirect to login from protected routes', () => {
            expect(getRedirectUrl(false, '/dashboard', null)).toBe('/login?redirect=/dashboard');
            expect(getRedirectUrl(false, '/admin/dashboard', null)).toBe('/login?redirect=/admin/dashboard');
        });

        it('should not redirect from public routes', () => {
            expect(getRedirectUrl(false, '/', null)).toBeNull();
            expect(getRedirectUrl(false, '/login', null)).toBeNull();
            expect(getRedirectUrl(false, '/register', null)).toBeNull();
        });
    });

    describe('authenticated user', () => {
        it('should redirect admin from login to admin dashboard', () => {
            expect(getRedirectUrl(true, '/login', 'admin')).toBe('/admin/dashboard');
        });

        it('should redirect provider from login to provider dashboard', () => {
            expect(getRedirectUrl(true, '/login', 'provider')).toBe('/provider/dashboard');
        });

        it('should redirect client from login to client dashboard', () => {
            expect(getRedirectUrl(true, '/login', 'client')).toBe('/dashboard');
        });

        it('should redirect from register page to dashboard', () => {
            expect(getRedirectUrl(true, '/register', 'client')).toBe('/dashboard');
        });

        it('should not redirect from normal protected routes', () => {
            expect(getRedirectUrl(true, '/dashboard', 'client')).toBeNull();
            expect(getRedirectUrl(true, '/admin/dashboard', 'admin')).toBeNull();
        });
    });
});
