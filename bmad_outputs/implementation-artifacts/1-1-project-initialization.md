# Story 1.1: Project Initialization

Status: complete

## Story

As a **developer**,
I want **a Next.js 14 project with TypeScript, TailwindCSS, ESLint, and tRPC configured**,
so that **I have a solid foundation to build the application**.

## Acceptance Criteria

**Given** the project directory is empty
**When** the initialization script is run
**Then:**
1. A Next.js 14+ project is created with App Router enabled
2. TypeScript is configured in strict mode
3. TailwindCSS is installed and configured with the design tokens from UX spec
4. ESLint is configured with recommended rules
5. tRPC is installed and a basic router is set up at `/api/trpc`
6. The project structure matches the Architecture document
7. `npm run dev` starts the development server without errors

## Tasks / Subtasks

- [x] **Task 1: Initialize Next.js Project** (AC: 1, 2, 3, 4)
  - [x] 1.1: Run `npx create-next-app@latest` with TypeScript, Tailwind, ESLint, App Router, src-dir options
  - [x] 1.2: Verify TypeScript strict mode is enabled in `tsconfig.json`
  - [x] 1.3: Configure absolute imports (`@/*`) in `tsconfig.json`

- [x] **Task 2: Configure TailwindCSS with Design Tokens** (AC: 3)
  - [x] 2.1: Updated `globals.css` with Tailwind v4 design tokens
  - [x] 2.2: Add design tokens: Primary Teal (#0D9488), spacing scale, typography
  - [x] 2.3: Configure Inter font family via Google Fonts

- [x] **Task 3: Install and Configure tRPC** (AC: 5)
  - [x] 3.1: Install tRPC dependencies: `@trpc/server`, `@trpc/client`, `@trpc/react-query`, `@tanstack/react-query`
  - [x] 3.2: Install Zod for validation: `zod`
  - [x] 3.3: Create tRPC server configuration at `src/lib/trpc/server.ts`
  - [x] 3.4: Create tRPC client configuration at `src/lib/trpc/client.tsx`
  - [x] 3.5: Create root router at `src/server/routers/_app.ts`
  - [x] 3.6: Create API route handler at `src/app/api/trpc/[trpc]/route.ts`
  - [x] 3.7: Create a health check procedure to verify tRPC is working

- [x] **Task 4: Establish Project Structure** (AC: 6)
  - [x] 4.1: Create directory structure per Architecture document
  - [x] 4.2: Create placeholder files for key directories
  - [x] 4.3: Create `.env.example` with required environment variables
  - [x] 4.4: Update `.gitignore` for Supabase and environment files

- [x] **Task 5: Verification** (AC: 7)
  - [x] 5.1: Run `npm run dev` and verify no errors
  - [x] 5.2: Access localhost:3000 and verify page loads
  - [x] 5.3: Test tRPC health endpoint via browser devtools or curl
  - [x] 5.4: Run `npm run build` to verify production build works

## Dev Notes

### Technology Stack (Verified Versions)

| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | 14.x (latest LTS) | React framework with App Router |
| TypeScript | 5.x | Type safety |
| TailwindCSS | 3.x | Utility-first CSS |
| tRPC | 10.x or 11.x | Type-safe API layer |
| React Query | 5.x (via @tanstack) | Data fetching/caching |
| Zod | 3.x | Schema validation |

### Initialization Command

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --use-npm
```

> **Note:** Use `--use-npm` to ensure consistent package manager. Run in an empty directory or use `.` to initialize in current directory.

### Project Structure Notes

Create the following directory structure per Architecture document:

```
src/
├── app/                    # Next.js App Router pages
│   ├── globals.css
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Landing page
│   ├── (public)/           # Public routes (no auth)
│   ├── (auth)/             # Auth-required routes
│   └── api/
│       └── trpc/[trpc]/route.ts  # tRPC handler
│
├── components/
│   ├── ui/                 # Primitives (Button, Input, Modal)
│   └── common/             # Shared (Header, Footer)
│
├── features/               # Feature modules (empty for now)
│   ├── booking/
│   ├── service/
│   ├── provider/
│   └── admin/
│
├── lib/
│   ├── supabase/          # Supabase client (Story 1.2)
│   ├── trpc/
│   │   ├── client.ts       # tRPC client
│   │   ├── server.ts       # tRPC server
│   │   └── context.ts      # Request context
│   └── utils/
│       └── index.ts        # General utilities
│
├── server/
│   ├── routers/
│   │   └── _app.ts         # Root router
│   └── services/           # Business logic (future)
│
├── types/
│   └── index.ts            # Shared TypeScript types
│
└── middleware.ts           # Next.js middleware (placeholder)
```

### Design Tokens (from UX Spec)

Configure in `tailwind.config.ts`:

```typescript
const config = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D9488', // Calm Teal
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        // Use default Tailwind spacing, but document key values
        // 4px base unit: 1 = 4px, 2 = 8px, 4 = 16px, 6 = 24px, 8 = 32px
      },
    },
  },
};
```

### tRPC Configuration

**Server Setup (`src/lib/trpc/server.ts`):**

```typescript
import { initTRPC } from '@trpc/server';
import { ZodError } from 'zod';

const t = initTRPC.create({
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
export const createCallerFactory = t.createCallerFactory;
```

**Root Router (`src/server/routers/_app.ts`):**

```typescript
import { router, publicProcedure } from '@/lib/trpc/server';
import { z } from 'zod';

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
});

export type AppRouter = typeof appRouter;
```

**API Route Handler (`src/app/api/trpc/[trpc]/route.ts`):**

```typescript
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}),
  });

export { handler as GET, handler as POST };
```

### Environment Variables Template

Create `.env.example`:

```bash
# Supabase (Story 1.2 will configure these)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google OAuth (Story 2.5)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# PayHere (Epic 10)
PAYHERE_MERCHANT_ID=
PAYHERE_SECRET=

# Email Service (Epic 7)
RESEND_API_KEY=

# SMS Service (Epic 7, Phase 2)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
```

### Critical Implementation Rules

From `project-context.md`:

1. **TypeScript Strict Mode:** No `any` types allowed. Set `"strict": true` in tsconfig.
2. **Absolute Imports:** Configure `@/*` path alias for clean imports.
3. **Server Components Default:** Use `'use client'` only for interactive components.
4. **API via tRPC:** All client-server data fetching MUST use tRPC (no `fetch` in components).

### References

- [Source: bmad_outputs/planning-artifacts/architecture.md#Starter-Template-Evaluation]
- [Source: bmad_outputs/planning-artifacts/architecture.md#Project-Structure-Boundaries]
- [Source: bmad_outputs/planning-artifacts/architecture.md#Implementation-Patterns]
- [Source: bmad_outputs/project-context.md#Technology-Stack-Versions]
- [Source: bmad_outputs/planning-artifacts/ux-design-specification.md#Color-System]

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

_(To be filled during development)_

### Completion Notes List

_(To be filled during development)_

### File List

**Created/Modified:**
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript strict mode + path aliases
- `vitest.config.ts` - Test configuration
- `vitest.setup.ts` - Test setup file
- `.env.example` - Environment template
- `src/app/layout.tsx` - Root layout with TRPCProvider
- `src/app/globals.css` - Tailwind v4 design tokens
- `src/lib/trpc/server.ts` - tRPC initialization
- `src/lib/trpc/client.tsx` - tRPC React client
- `src/lib/trpc/context.ts` - tRPC context
- `src/lib/utils/index.ts` - Utility functions
- `src/lib/supabase/client.ts` - Supabase placeholder
- `src/lib/supabase/server.ts` - Supabase server placeholder
- `src/server/routers/_app.ts` - Root tRPC router
- `src/app/api/trpc/[trpc]/route.ts` - API handler
- `src/middleware.ts` - Next.js middleware placeholder
- `src/types/index.ts` - Shared types
- Directory placeholders for features, components, services

---

## Verification Checklist

Before marking this story as complete:

- [x] `npm run dev` starts without errors
- [x] `npm run build` completes successfully
- [x] `npm run lint` passes with no errors (0 errors, 1 warning)
- [x] Access http://localhost:3000 shows Next.js page
- [x] tRPC health endpoint returns `{ status: 'ok' }`
- [x] Project structure matches Architecture document
- [x] TypeScript strict mode is enabled
- [x] TailwindCSS with design tokens is configured
- [x] `.env.example` contains all required variables
