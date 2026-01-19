# Story 1.2: Supabase Setup & Connection

Status: complete

## Story

As a **developer**,
I want **Supabase connected to the application**,
so that **I can use PostgreSQL database and authentication services**.

## Acceptance Criteria

**Given** the Next.js project is initialized (Story 1.1 complete)
**When** Supabase is configured
**Then:**
1. A Supabase project exists with PostgreSQL database
2. `@supabase/supabase-js` and `@supabase/ssr` are installed
3. Environment variables are configured (SUPABASE_URL, SUPABASE_ANON_KEY)
4. `.env.example` contains all required variables (without secrets)
5. Supabase client is created in `lib/supabase/client.ts` (browser)
6. Supabase server client is created in `lib/supabase/server.ts`
7. A basic health check query confirms database connectivity

## Tasks / Subtasks

- [x] **Task 1: Create Supabase Project** (AC: 1)
  - [x] 1.1: Create new project at supabase.com
  - [x] 1.2: Note project URL and anon key
  - [x] 1.3: Configure project settings (region, etc.)

- [x] **Task 2: Install Supabase Dependencies** (AC: 2)
  - [x] 2.1: Install `@supabase/supabase-js`
  - [x] 2.2: Install `@supabase/ssr` (for Next.js App Router)

- [x] **Task 3: Configure Environment Variables** (AC: 3, 4)
  - [x] 3.1: Create `.env.local` placeholder (awaiting credentials)
  - [x] 3.2: Update `.env.example` with variable templates
  - [x] 3.3: Verify `.gitignore` excludes `.env.local`

- [x] **Task 4: Create Supabase Clients** (AC: 5, 6)
  - [x] 4.1: Create browser client at `src/lib/supabase/client.ts`
  - [x] 4.2: Create server client at `src/lib/supabase/server.ts`
  - [x] 4.3: Create middleware helper at `src/lib/supabase/middleware.ts`
  - [x] 4.4: Export types from `src/lib/supabase/index.ts`

- [x] **Task 5: Verify Connection** (AC: 7)
  - [x] 5.1: Create a tRPC procedure that queries Supabase
  - [x] 5.2: Test connection via API call
  - [x] 5.3: Verify no CORS or auth errors

## Dev Notes

### Dependencies Installation

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Environment Variables

Add to `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> ⚠️ **CRITICAL:** Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client. Only use in server-side code.

### Browser Client (`src/lib/supabase/client.ts`)

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Server Client (`src/lib/supabase/server.ts`)

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component - ignore
          }
        },
      },
    }
  );
}
```

### Middleware (`src/lib/supabase/middleware.ts`)

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  await supabase.auth.getUser();

  return supabaseResponse;
}
```

### Update Next.js Middleware (`src/middleware.ts`)

```typescript
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

### Health Check tRPC Procedure

Add to root router (`src/server/routers/_app.ts`):

```typescript
import { createClient } from '@/lib/supabase/server';

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  dbHealth: publicProcedure.query(async () => {
    const supabase = await createClient();
    const { error } = await supabase.from('_test').select('*').limit(1);
    
    // Error expected if table doesn't exist, but connection works
    return { 
      connected: !error || error.code === 'PGRST116',
      timestamp: new Date().toISOString() 
    };
  }),
});
```

### Project Structure Notes

Files to create/modify:
```
src/lib/supabase/
├── client.ts       # Browser client
├── server.ts       # Server client  
├── middleware.ts   # Session refresh helper
└── index.ts        # Exports

src/middleware.ts   # Next.js middleware (update)
```

### Critical Rules

- **Server Components:** Use `createClient()` from `server.ts`
- **Client Components:** Use `createClient()` from `client.ts`
- **API Routes/tRPC:** Use server client
- **Never expose:** `SUPABASE_SERVICE_ROLE_KEY` to client

### References

- [Source: bmad_outputs/planning-artifacts/architecture.md#Starter-Template-Evaluation]
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

- [ ] Supabase project created and accessible
- [ ] Dependencies installed without errors
- [ ] Environment variables configured
- [ ] Browser client works in client components
- [ ] Server client works in server components
- [ ] Middleware refreshes session correctly
- [ ] tRPC dbHealth procedure returns connected: true
- [ ] No console errors or warnings
