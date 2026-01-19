import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

/**
 * Public routes that don't require authentication
 */
const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/auth/callback',
    '/api/trpc/health',
    '/api/trpc/dbHealth',
];

/**
 * Check if a pathname matches any public route
 */
function isPublicRoute(pathname: string): boolean {
    return publicRoutes.some(route =>
        pathname === route || pathname.startsWith(route + '/')
    );
}

/**
 * Next.js Middleware
 * 
 * Handles:
 * - Supabase session refresh
 * - Route protection (redirect unauthenticated users)
 * - Role-based access control (admin/provider/client)
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes without auth check
    if (isPublicRoute(pathname)) {
        return await updateSession(request);
    }

    // For protected routes, check authentication
    const response = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Redirect to login if not authenticated
    if (!user) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Get user role from database for role-based routing
    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    const role = userData?.role || 'client';

    // Role-based route protection
    if (pathname.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard?error=access_denied', request.url));
    }

    if (pathname.startsWith('/provider') && role !== 'provider' && role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard?error=access_denied', request.url));
    }

    return await updateSession(request);
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
