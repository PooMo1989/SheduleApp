# Story 1.8: RBAC Foundation

Status: complete

## Story

As a **system**,
I want **role-based access control enforced**,
so that **users can only access features appropriate to their role** (FR55-FR56).

## Acceptance Criteria

**Given** a user has role `client`
**When** they try to access `/admin/*` routes
**Then:**
- They are redirected to `/dashboard` with "Access Denied" message

**Given** a user has role `provider`
**When** they access the provider dashboard
**Then:**
- They see only their own appointments (not other providers')

**Given** a user has role `admin`
**When** they access the admin dashboard
**Then:**
- They have full access to all tenant data

**Given** the API receives a request
**When** role verification is performed
**Then:**
- The role is extracted from JWT claims
- tRPC protected procedures enforce role requirements

**Given** Next.js middleware runs
**When** a protected route is accessed
**Then:**
- Unauthenticated users are redirected to `/login`

## Tasks / Subtasks

- [ ] **Task 1: Implement Auth Middleware** (AC: public/protected routes)
  - [ ] 1.1: Update `src/middleware.ts` to check auth status
  - [ ] 1.2: Define public routes that don't require auth
  - [ ] 1.3: Redirect unauthenticated users to login

- [ ] **Task 2: Implement Role-Based Route Protection** (AC: redirects)
  - [ ] 2.1: Extract role from user session
  - [ ] 2.2: Block client access to admin routes
  - [ ] 2.3: Block client access to provider routes
  - [ ] 2.4: Show access denied message

- [ ] **Task 3: Create tRPC Protected Procedures** (AC: API protection)
  - [ ] 3.1: Create `protectedProcedure` (requires auth)
  - [ ] 3.2: Create `adminProcedure` (requires admin role)
  - [ ] 3.3: Create `providerProcedure` (requires provider role)
  - [ ] 3.4: Extract role from JWT claims

- [ ] **Task 4: Create Dashboard Layouts** (AC: role dashboards)
  - [ ] 4.1: Create client dashboard layout
  - [ ] 4.2: Create provider dashboard layout
  - [ ] 4.3: Create admin dashboard layout
  - [ ] 4.4: Create shared navigation components

- [ ] **Task 5: Implement Data Isolation** (AC: own data only)
  - [ ] 5.1: Add provider_id filter to provider queries
  - [ ] 5.2: Verify RLS policies work correctly
  - [ ] 5.3: Test cross-provider data access is blocked

## Dev Notes

### Updated Middleware (`src/middleware.ts`)

```typescript
import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
  '/book', // Public booking widget
];

// Role-based route access
const roleRoutes = {
  admin: ['/admin'],
  provider: ['/provider'],
  client: ['/dashboard'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return await updateSession(request);
  }

  // Check auth for protected routes
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

  // Get user role from database
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = userData?.role || 'client';

  // Check role-based access
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
```

### tRPC Context with User (`src/lib/trpc/context.ts`)

```typescript
import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

export interface Context {
  user: User | null;
  userId: string | null;
  tenantId: string | null;
  role: 'admin' | 'provider' | 'client' | null;
}

export async function createContext(): Promise<Context> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, userId: null, tenantId: null, role: null };
  }

  // Get user profile with tenant and role
  const { data: profile } = await supabase
    .from('users')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  return {
    user,
    userId: user.id,
    tenantId: profile?.tenant_id || null,
    role: profile?.role || 'client',
  };
}
```

### Protected Procedures (`src/lib/trpc/server.ts`)

```typescript
import { initTRPC, TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import type { Context } from './context';

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Requires authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user || !ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      userId: ctx.userId,
      tenantId: ctx.tenantId!,
      role: ctx.role!,
    },
  });
});

// Requires admin role
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

// Requires provider or admin role
export const providerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.role !== 'provider' && ctx.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Provider access required' });
  }
  return next({ ctx });
});
```

### Update API Route Handler

Update `src/app/api/trpc/[trpc]/route.ts`:

```typescript
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/lib/trpc/context';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };
```

### Dashboard Layouts

**Client Dashboard (`src/app/(auth)/dashboard/layout.tsx`):**

```typescript
import { DashboardSidebar } from '@/components/common/DashboardSidebar';

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <DashboardSidebar role="client" />
      <main className="lg:pl-64 py-6 px-4 lg:px-8">
        {children}
      </main>
    </div>
  );
}
```

**Admin Dashboard (`src/app/(auth)/admin/layout.tsx`):**

```typescript
import { DashboardSidebar } from '@/components/common/DashboardSidebar';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <DashboardSidebar role="admin" />
      <main className="lg:pl-64 py-6 px-4 lg:px-8">
        {children}
      </main>
    </div>
  );
}
```

### Access Denied Component

Create `src/components/common/AccessDenied.tsx`:

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function AccessDeniedToast() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get('error') === 'access_denied') {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg">
      <p className="font-medium">Access Denied</p>
      <p className="text-sm">You don't have permission to access that page.</p>
    </div>
  );
}
```

### Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   └── dashboard/
│   │   │       └── page.tsx
│   │   └── provider/
│   │       ├── layout.tsx
│   │       └── dashboard/
│   │           └── page.tsx
│   └── api/trpc/[trpc]/route.ts
├── components/common/
│   ├── DashboardSidebar.tsx
│   └── AccessDenied.tsx
├── lib/trpc/
│   ├── server.ts      # With protected procedures
│   └── context.ts     # With role extraction
└── middleware.ts      # Route protection
```

### Example Protected Router

```typescript
// src/server/routers/booking.ts
import { router, protectedProcedure } from '@/lib/trpc/server';

export const bookingRouter = router({
  // All users can see their own bookings
  getMyBookings: protectedProcedure.query(async ({ ctx }) => {
    const supabase = await createClient();
    
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('client_id', ctx.userId);
      
    return data;
  }),
});
```

### Critical Rules

- **Never trust client-side role checks alone** - always verify on server
- Use middleware for route protection
- Use tRPC procedures for API protection
- RLS policies provide database-level protection
- Providers can only see their own data (enforced by RLS + application logic)

### References

- [Source: bmad_outputs/planning-artifacts/epics.md#Story-1.8]
- [Source: bmad_outputs/planning-artifacts/architecture.md#Authentication-Security]
- [Source: bmad_outputs/project-context.md#Database-Auth-Rules]

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Completion Notes List

_(To be filled during development)_

### File List

_(To be filled during development)_

---

## Verification Checklist

- [ ] Unauthenticated users redirected to login
- [ ] Client cannot access /admin/* routes
- [ ] Client cannot access /provider/* routes
- [ ] Provider can access /provider/* routes
- [ ] Admin can access all routes
- [ ] Access denied message shows correctly
- [ ] tRPC protectedProcedure blocks unauthenticated requests
- [ ] tRPC adminProcedure blocks non-admin requests
- [ ] Providers can only query their own data
- [ ] Role is correctly extracted from JWT/database
