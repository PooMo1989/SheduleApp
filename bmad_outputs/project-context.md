---
project_name: 'sheduleApp'
user_name: 'PooMO'
date: '2026-01-15'
sections_completed: ['technology_stack', 'critical_rules', 'language_rules', 'framework_rules', 'testing_rules', 'naming_conventions', 'critical_dont_miss']
existing_patterns_found: 4
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

_Documented after discovery phase_

## Critical Implementation Rules

_Documented after discovery phase_

## Technology Stack & Versions

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript 5.x (Strict)
- **Styling:** TailwindCSS 3.x
- **API:** tRPC 10.x + React Query
- **Database:** Supabase (PostgreSQL) + RLS
- **Auth:** Supabase Auth
- **Deployment:** Vercel

## Critical Implementation Rules

### Language-Specific Rules

- **Strict TypeScript:** No `any` types allowed. Use Zod schemas for runtime validation.
- **Async/Await:** Prefer async/await over raw Promises. Handle errors with try/catch or tRPC error boundaries.
- **Imports:** Use absolute imports (`@/components/...`) defined in `tsconfig.json`.

### Framework-Specific Rules

- **Next.js Pattern:** Default to Server Components. Use `'use client'` only for interactive UI leaves.
- **API Communication:** ALWAYS use tRPC for client-server data fetching. NO `fetch` calls in components unless calling external 3rd party APIs directly (rare).
- **State Management:** Use tRPC (React Query) for server state. Use `useState`/`useReducer` for local UI state. Avoid global state stores unless absolutely necessary (e.g., simple Zustand store for user session).

### Database & Auth Rules

- **Multi-Tenancy:** ALL database queries must be filtered by `tenant_id`. reliable RLS policies are the primary enforcement mechanism.
- **Auth:** Use Supabase Auth helpers. Protect routes via Next.js middleware and tRPC protected procedures.

### Testing Rules

- **Unit Tests:** Co-locate with components (`Component.test.tsx`).
- **Integration:** Test tRPC routers to verify business logic and DB interactions.
- **E2E:** Use Playwright for critical flows (Booking, Login).

### Naming Conventions

- **DB Tables:** `snake_case`, plural (e.g., `bookings`, `users`).
- **Columns:** `snake_case` (e.g., `created_at`, `tenant_id`).
- **Files:** `PascalCase` for React components (`BookingCard.tsx`), `camelCase` for utilities/hooks (`useBooking.ts`).
- **Functions/Vars:** `camelCase` (e.g., `calculateTotal`, `isAvailable`).

### Critical Don't-Miss Rules

- **Anti-Pattern:** Do NOT expose sensitive environment variables (starts with `NEXT_PUBLIC_`) unless required by the client.
- **Anti-Pattern:** Do NOT bypass RLS using the service role key in client-facing code.
- **Edge Case:** Always handle timezone conversions explicitly (store in UTC, display in local).

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-01-15
