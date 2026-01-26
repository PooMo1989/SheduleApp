---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories"]
status: complete
inputDocuments: 
  - "bmad_outputs/planning-artifacts/prd.md"
  - "bmad_outputs/planning-artifacts/architecture.md"
  - "bmad_outputs/planning-artifacts/ux-design-specification.md"
  - "bmad_outputs/project-context.md"
project_name: 'sheduleApp'
user_name: 'PooMO'
date: '2026-01-18'
epic_count: 11
story_count: 76
fr_count: 60
nfr_count: 19
---

# sheduleApp - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for sheduleApp, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**Service Discovery & Browsing (FR1-FR4)**
- FR1: Client can browse available services by category
- FR2: Client can view service details (duration, price, description)
- FR3: Client can filter services by type (Consultations vs Classes)
- FR4: Client can see available providers for each service

**Provider Selection & Availability (FR5-FR9)**
- FR5: Client can view provider profiles (photo, bio, services offered)
- FR6: Client can view provider availability calendar (4-layer filtered)
- FR7: System filters availability by: Service window + Provider schedule + Date overrides + Google Calendar
- FR8: Client can only see slots that pass all 4 availability layers
- FR9: Client can see remaining capacity for Group Classes

**Client Registration & Authentication (FR10-FR15)**
- FR10: Clients can book as guest (name, email, phone) with optional account creation
- FR11: Client can optionally set password to create full account
- FR12: Client can register via Social Login (SSO - Google)
- FR13: Guest clients receive magic links in emails to manage their bookings
- FR14: Client can log in with existing credentials (if account created)
- FR15: Client can reset password via email

**Booking Management (FR16-FR21)**
- FR16: Client can book 1:1 consultation with a provider
- FR17: Client can book Group Class (with capacity enforcement)
- FR18: Registered Client can set up recurring appointments
- FR19: Client can reschedule an existing booking (via dashboard)
- FR20: Client can cancel an existing booking (via dashboard)
- FR21: Client can view booking history in personal dashboard

**Payment Processing (FR22-FR27)**
- FR22: Client can pay via Credit/Debit Card (PayHere SDK)
- FR23: Client can select "Pay Later" option
- FR24: Pay Later bookings are created as PENDING status
- FR25: System handles payment failures gracefully (idempotent)
- FR26: System sends payment confirmation to client
- FR27: System supports recurring payments for recurring appointments

**Pay Later Approval Workflow (FR28-FR32)**
- FR28: Admin receives notification for Pay Later bookings
- FR29: Admin can view pending Pay Later bookings list
- FR30: Admin can approve pending bookings manually
- FR31: Admin can reject pending bookings with reason
- FR32: Confirmation emails and calendar sync only after admin approval

**Notifications & Reminders (FR33-FR37)**
- FR33: System sends booking confirmation email to client (after approval if Pay Later)
- FR34: System sends booking notification to provider (after approval if Pay Later)
- FR35: System sends reminder email 24 hours before appointment
- FR36: System sends reminder email 1 hour before appointment
- FR37: System notifies provider of rescheduling/cancellation

**Provider Dashboard (FR38-FR42)**
- FR38: Provider can view today's appointments
- FR39: Provider can view day/month calendar view
- FR40: Provider can see client details for each booking
- FR41: Provider can see personal performance metrics
- FR42: System syncs bookings to provider's Google Calendar (two-way)

**Service & Provider Administration (FR43-FR50)**
- FR43: Admin can create/edit/delete services
- FR44: Admin can create services within respective modules (Consultations or Classes)
- FR45: Admin can set service capacity (for Group Classes)
- FR46: Admin can assign providers to services
- FR47: Admin can create/edit/delete providers
- FR48: Admin can set provider recurring availability schedule
- FR49: Admin can set provider date-specific overrides/exceptions
- FR50: Admin can link provider's Google Calendar (OAuth)

**Booking Administration (FR51-FR54)**
- FR51: Admin can view all bookings
- FR52: Admin can manage cancellations and rescheduling
- FR53: Admin can view basic reports (bookings count, cancellations)
- FR54: Admin can configure email templates

**Authorization & Data Isolation (FR55-FR57)**
- FR55: System supports role-based access (Admin, Provider, Client)
- FR56: Providers can only see their own data (not other providers')
- FR57: System enforces tenant data isolation (for SaaS)

**Modular Architecture (FR58-FR60)**
- FR58: System supports modular design (Consultations module, Classes module)
- FR59: SaaS admin can enable/disable modules per tenant
- FR60: Provider list is shared across modules

### Non-Functional Requirements

**Performance (NFR1-NFR4)**
- NFR1: Page load time < 2 seconds on mobile 3G
- NFR2: Calendar availability response < 500ms
- NFR3: Booking confirmation < 3 seconds end-to-end
- NFR4: System handles 100 concurrent users (MVP)

**Security (NFR5-NFR10)**
- NFR5: All data encrypted in transit (TLS 1.2+)
- NFR6: All data encrypted at rest (AES-256)
- NFR7: Payment data never stored; use PayHere tokenization
- NFR8: Google OAuth tokens stored securely (refresh token rotation)
- NFR9: Role-based access enforced at API level
- NFR10: Session timeout after 30 minutes of inactivity

**Scalability (NFR11-NFR13)**
- NFR11: Architecture supports 10x user growth without redesign
- NFR12: Database supports multi-tenant isolation
- NFR13: Stateless API design for horizontal scaling

**Reliability (NFR14-NFR16)**
- NFR14: System uptime > 99.5% (excluding scheduled maintenance)
- NFR15: No data loss on payment or booking transactions
- NFR16: Graceful degradation if Google Calendar API is unavailable

**Integration (NFR17-NFR19)**
- NFR17: Google Calendar sync latency < 30 seconds
- NFR18: PayHere webhook processing < 5 seconds
- NFR19: Email delivery within 1 minute of trigger

### Additional Requirements

**From Architecture:**
- Starter Template: Modified T3 Stack (Next.js 14+ with create-next-app, tRPC, Supabase)
- Multi-Tenancy: Single DB with tenant_id column + PostgreSQL RLS
- Authentication: Supabase Auth (Google OAuth + email/password)
- API Layer: tRPC with Zod validation
- Caching: React Query (via tRPC) + Vercel Edge
- State Management: tRPC for server state, Zustand for UI state
- Calendar Sync: Polling (5-min interval) + real-time check at booking
- Deployment: Vercel + Supabase (managed PostgreSQL)

**From UX Design:**
- Design Direction: Calendly-inspired minimal list-based UI
- Typography: Inter font family
- Color System: Calm Teal (#0D9488) primary
- Responsive: Mobile-first with sm/md/lg breakpoints
- Accessibility: WCAG AA compliance, 44x44px touch targets
- Component Library: Headless UI + TailwindCSS + FullCalendar
- Animations: Framer Motion for micro-interactions

**From Project Context (Implementation Rules):**
- TypeScript strict mode (no `any` types)
- Use tRPC for all client-server communication
- Default to Server Components, use 'use client' only for interactive leaves
- All DB queries filtered by tenant_id via RLS
- Store dates in UTC, display in local timezone

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1-FR4 | Removed | Client Discovery (handled by company website) |
| FR5-FR8 | Epic 3 | Provider Availability (in embed widget) |
| FR9 | Epic 9 | Group Class Capacity Display |
| FR10-FR15 | Epic 1 | Client Registration & Authentication |
| FR16 | Epic 3 | 1:1 Consultation Booking |
| FR17 | Epic 9 | Group Class Booking |
| FR18, FR27 | Phase 2 | Recurring Appointments & Payments (Deferred) |
| FR19-FR21 | Epic 5 | Booking Management (Reschedule/Cancel) |
| FR22, FR25-FR26 | Epic 10 | Payment Processing - Card (Final MVP Epic) |
| FR23-FR24 | Epic 3, Epic 4 | Pay Later Option |
| FR28-FR32 | Epic 4 | Pay Later Approval Workflow |
| FR33-FR37 | Epic 7 | Notifications & Reminders (Email only for MVP) |
| FR38-FR42 | Epic 6 | Provider Dashboard & Calendar Sync |
| FR43-FR50 | Epic 2 | Service & Provider Administration |
| FR51-FR54 | Epic 8 | Booking Administration & Reports |
| FR55-FR57 | Epic 1 | Authorization & Data Isolation |
| FR58-FR60 | Epic 2 | Modular Architecture | |

---

## Epic List

### Epic 1: Project Foundation & Infrastructure
**Goal:** Development team has a fully configured, deployable project with authentication working end-to-end.

**User Outcome:** Users can access the app, register, login, and the system enforces role-based access.

**Covers:** FR10-FR15, FR55-FR57 + Architecture infrastructure requirements

---

### Epic 2: Admin Service & Provider Management
**Goal:** Admin can create services, providers, set availability schedules, and connect Google Calendar.

**User Outcome:** Anita can configure all services and providers before embedding.

**Covers:** FR43-FR50, FR58-FR60

**Stories:** 2.1-2.6 (DB schemas, Admin CRUD, Google Calendar, Availability Engine)

---

### Story 2.10: Unified Sign-Up UX
**Goal:** Ensure every sign-up point (Admin, Provider Invite, Client Checkout) gracefully handles "User already exists" by offering a clear "Sign In" option.

**User Outcome:** Users who forget they have an account aren't blocked by confusing errors; they are guided to log in.

**Acceptance Criteria:**
**Given** a user with an existing account
**When** they try to sign up via Invitation Link
**Then** they see "You already have an account. Please sign in."
**And** a "Sign In" button is displayed

**Given** a user with an existing account
**When** they try to sign up via Register Page
**Then** they see "You already have an account. Please sign in."
**And** they can easily switch to login

**Given** a client in checkout (TBD)
**When** they try to create an account with existing email
**Then** they are guided to sign in without losing their booking flow

---

### Epic 3: Embeddable Booking Widget
**Goal:** Business websites can embed a booking calendar widget that shows provider availability and accepts bookings.

**User Outcome:** Admin generates embed code; clients book via iframe on business website.

**Covers:** FR5-FR8, FR16, FR23-FR24

**Stories:** 3.1-3.5 (Widget, Configurator, Mock Test, Booking, Confirmation)

---

### Epic 4: Pay Later Approval Workflow
**Goal:** Admins can approve or reject pending Pay Later bookings.

**User Outcome:** Clients who prefer not to pay online can still book; Admins maintain control.

**Covers:** FR28-FR32

---

### Epic 5: Booking Management
**Goal:** Clients can reschedule, cancel, and view their booking history.

**User Outcome:** Priya can manage her bookings without calling the center.

**Covers:** FR19-FR21

---

### Epic 6: Provider Dashboard & Calendar Sync
**Goal:** Providers can view their schedule and sync with Google Calendar.

**User Outcome:** Ravi sees his whole day at a glance with zero surprises.

**Covers:** FR38-FR42

---

### Epic 7: Notifications & Reminders
**Goal:** All users receive timely email notifications for bookings, changes, and reminders.

**User Outcome:** No one misses an appointment due to lack of communication.

**Covers:** FR33-FR37

---

### Epic 8: Admin Booking Reports
**Goal:** Admins can view all bookings, manage issues, and view reports.

**User Outcome:** Anita has full visibility into business operations.

**Covers:** FR51-FR54

---

### Epic 9: Group Classes & Capacity
**Goal:** Clients can book group classes with capacity enforcement.

**User Outcome:** Clients can join group meditation classes and see remaining spots.

**Covers:** FR9, FR17, FR45

---

### Epic 10: Card Payment Integration
**Goal:** Clients can pay for bookings via credit/debit card through PayHere.

**User Outcome:** Clients can complete payment at booking time instead of Pay Later.

**Covers:** FR22, FR25-FR26

---

### Phase 2: Recurring Appointments (Deferred)
**Goal:** Registered clients can set up recurring appointments with automated scheduling.

**Note:** Deferred to Phase 2 to reduce MVP complexity. Covers FR18, FR27.

---

### Phase 2: Subdomain-Based Multi-Tenancy (Deferred)
**Goal:** Each company gets a branded subdomain for their booking portal.

**Implementation:**
- Route pattern: `companyA.sheduleapp.com`, `companyB.sheduleapp.com`
- Middleware reads subdomain and resolves tenant
- Single wildcard SSL certificate (`*.sheduleapp.com`)
- Tenant lookup via `slug` column in `tenants` table

**User Outcome:** Companies have a semi-branded URL without custom domain complexity.

**Prerequisites (Security Audit Before Implementation):**
- [ ] Verify session cookies are host-only (not domain-wide wildcard)
- [ ] Confirm `SameSite=Strict` on all session cookies
- [ ] Test that sessions don't bleed between `tenant1.app.com` and `tenant2.app.com`
- [ ] Verify cache keys include tenant_id prefix
- [ ] Confirm Supabase Auth redirect URLs work with subdomains

**Note:** Implement after MVP when onboarding multiple tenants.

---

### Phase 3: Custom Domain Support (Deferred)
**Goal:** Paid tier customers can use their own domain for full white-label experience.

**Implementation:**
- Companies configure: `booking.theircompany.com` → CNAME to Vercel
- Add `custom_domain` column to `tenants` table
- Middleware resolves tenant by hostname
- Vercel handles SSL automatically per domain
- OAuth redirect flows through central auth domain (`auth.sheduleapp.com`)

**User Outcome:** True white-label experience where clients only see the company's brand.

**Technical Considerations:**
- OAuth requires central redirect URI (keep auth on main domain)
- DNS verification flow for custom domains
- Vercel domain configuration via API or dashboard

**Note:** Implement as paid feature after Phase 2 is stable.

---

### Phase 4: SaaS Payment Architecture (Research Required)
**Goal:** Enable multi-tenant payment collection and distribution for SaaS model.

**Key Questions to Resolve:**
1. **Centralized Model:** All payments → Platform's PayHere account → Distribute to tenants (simpler, more regulatory burden)
2. **Per-Tenant Model:** Each tenant connects their own PayHere Merchant ID → Direct payments (complex onboarding, less liability)

**Technical Considerations:**
- PayHere uses Merchant ID + Merchant Secret per integration
- Per-tenant approach: Store `payhere_merchant_id` and `payhere_merchant_secret` (encrypted) in `tenants` table
- Centralized approach: Build internal ledger + payout system
- Neither approach requires white-label/subdomain - works with embed widget model
- Sri Lanka doesn't have Stripe Connect; PayHere has no native split-payment feature

**Research Needed:**
- Contact PayHere about platform/marketplace support
- Evaluate Paddle/Lemon Squeezy as Merchant of Record alternatives
- Review compliance/regulatory requirements for holding tenant funds

**Note:** Defer until after Epic 10 (basic PayHere integration) is complete. Epic 10 can use centralized model for initial implementation.

---

### Phase 5: Modular Feature Flags & Business Type Support
**Goal:** Support different business types (solo consultants, multi-provider centers, studios, resource rentals) with configurable modules that feel "installed/uninstalled" per tenant.

**Target Business Types:**
| Type | Example | Enabled Modules |
|------|---------|-----------------|
| **Solo Consultant** | Psychologist, tutor, lawyer | Bookings only (no Team, no Classes) |
| **Multi-Provider Center** | Wellness center, salon | Bookings + Team |
| **Studio/Gym** | Yoga studio, fitness center | Bookings + Team + Classes |
| **Resource Rental** | Courts, pools, meeting rooms | Resources module (booking *things* not *people*) |

---

**Module Architecture Approach: Feature Flags + Code Splitting**

We use a hybrid approach that combines database-level feature flags with frontend code splitting. This gives tenants the experience of "installing/uninstalling" modules while keeping implementation simple.

| Layer | Approach | Purpose |
|-------|----------|---------|
| **Database** | Feature Flags | Control which modules are enabled |
| **Backend** | tRPC Procedure Guards | Block API access to disabled modules |
| **Frontend** | Dynamic Imports | Only load module code when enabled |
| **UI** | Conditional Rendering | Hide navigation/UI for disabled modules |

**Why NOT True Plugin Architecture:**
True plugin systems (like WordPress) are needed only if:
- Third-party developers create modules
- There's a marketplace for plugins
- Tenants build custom modules

For ScheduleApp, Feature Flags + Code Splitting provides:
- ✅ Modules feel "installed/uninstalled" to tenants
- ✅ Smaller bundle size (unused modules not loaded)
- ✅ Simple implementation
- ✅ No separate deployment per tenant

---

**Architectural Requirements:**

1. **Feature Flags Table:**
```sql
CREATE TABLE tenant_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id),
  feature_key text NOT NULL, -- 'team', 'classes', 'resources', 'payments', etc.
  enabled boolean DEFAULT false,
  config jsonb, -- Optional per-feature settings
  UNIQUE(tenant_id, feature_key)
);
```

2. **Tenant Business Type:**
```sql
ALTER TABLE tenants ADD COLUMN business_type text DEFAULT 'center';
-- Values: 'solo', 'center', 'studio', 'rental'
```

3. **Backend: tRPC Feature Guard:**
```typescript
// Reusable middleware for feature-gated procedures
const requireFeature = (feature: string) => t.middleware(async ({ ctx, next }) => {
  const enabled = await hasFeature(ctx.tenantId, feature);
  if (!enabled) throw new TRPCError({ code: 'FORBIDDEN', message: `${feature} module not enabled` });
  return next();
});

// Usage in router
export const classesRouter = router({
  list: protectedProcedure
    .use(requireFeature('classes'))
    .query(async ({ ctx }) => { /* ... */ }),
});
```

4. **Frontend: Dynamic Module Loading:**
```typescript
// Only download module code when feature is enabled
const ResourcesModule = dynamic(
  () => import('@/features/resources/ResourcesPage'),
  { loading: () => <ModuleSkeleton /> }
);

// In layout/page
{hasFeature('resources') && <ResourcesModule />}
```

5. **Client-Side Feature Hook:**
```typescript
const { hasFeature, enabledFeatures, isLoading } = useTenantFeatures();

// Navigation example
{hasFeature('team') && <SidebarItem href="/admin/team" icon={Users} label="Team" />}
{hasFeature('classes') && <SidebarItem href="/admin/classes" icon={Calendar} label="Classes" />}
{hasFeature('resources') && <SidebarItem href="/admin/resources" icon={Building} label="Resources" />}
```

6. **Onboarding Wizard:**
- New signup asks: "What do you want to schedule?"
  - [ ] Appointments with people (1:1 consultations)
  - [ ] Group classes or sessions
  - [ ] Resources (rooms, courts, equipment)
- Auto-enables relevant modules based on selection
- Can be changed later in Settings → Modules

---

**Implementation Phases:**
- **5.1:** Add `tenant_features` table and `useTenantFeatures()` hook
- **5.2:** Add `requireFeature()` tRPC middleware for API guards
- **5.3:** Refactor sidebar/navigation to use dynamic imports + feature checks
- **5.4:** Add onboarding wizard with business type selection
- **5.5:** Build Resource Booking module (for courts/pools - different UX from people booking)

**Note:** Defer until after core MVP is stable. Current MVP targets Multi-Provider Center business type. Solo consultants can use the same product (Team module auto-hidden if they're the only user).

---

# Epic Stories

## Epic 1: Project Foundation & Infrastructure

### Story 1.1: Project Initialization

As a **developer**,
I want **a Next.js 14 project with TypeScript, TailwindCSS, ESLint, and tRPC configured**,
So that **I have a solid foundation to build the application**.

**Acceptance Criteria:**

**Given** the project directory is empty
**When** the initialization script is run
**Then** a Next.js 14+ project is created with App Router enabled
**And** TypeScript is configured in strict mode
**And** TailwindCSS is installed and configured with the design tokens from UX spec
**And** ESLint is configured with recommended rules
**And** tRPC is installed and a basic router is set up at `/api/trpc`
**And** the project structure matches the Architecture document
**And** `npm run dev` starts the development server without errors

---

### Story 1.2: Supabase Setup & Connection

As a **developer**,
I want **Supabase connected to the application**,
So that **I can use PostgreSQL database and authentication services**.

**Acceptance Criteria:**

**Given** the Next.js project is initialized
**When** Supabase is configured
**Then** a Supabase project exists with PostgreSQL database
**And** `@supabase/supabase-js` and `@supabase/auth-helpers-nextjs` are installed
**And** environment variables are configured (SUPABASE_URL, SUPABASE_ANON_KEY)
**And** `.env.example` contains all required variables (without secrets)
**And** Supabase client is created in `lib/supabase/client.ts` (browser)
**And** Supabase server client is created in `lib/supabase/server.ts`
**And** a basic health check query confirms database connectivity

---

### Story 1.3: Multi-Tenant Database Schema

As a **system administrator**,
I want **multi-tenant data isolation enforced at the database level**,
So that **each tenant's data is completely isolated from other tenants** (FR57).

**Acceptance Criteria:**

**Given** Supabase is connected
**When** the tenant schema is created
**Then** a `tenants` table exists with columns: `id`, `name`, `slug`, `created_at`
**And** a `users` table exists with `tenant_id` foreign key
**And** Row-Level Security (RLS) is enabled on both tables
**And** RLS policy `tenant_isolation` filters all queries by `tenant_id` from JWT
**And** a test confirms users cannot access data from other tenants
**And** database types are generated via Supabase CLI to `types/database.types.ts`

---

### Story 1.4: Admin Registration & Tenant Creation ✅ UPDATED

As an **admin (first user)**,
I want **to register and create my company account**,
So that **I can set up my business and invite team members** (FR11, FR57).

> **UPDATED (2026-01-21):** Registration now creates a new tenant per signup. The first user becomes the admin. Clients register via invitation or lazy signup during booking.

**Acceptance Criteria:**

**Given** I am on the registration page
**When** I enter valid email, mobile number, and password
**Then** a new tenant is created with an email-based slug (e.g., `john-example-com`)
**And** my account is created as role `admin` of that tenant
**And** I am redirected to `/admin/settings` to complete company setup
**And** I can then invite team members via `/admin/team`

**Given** I enter an email that already exists
**When** I submit the registration form
**Then** I see an error message "Email already registered"
**And** no duplicate account is created

**Given** I enter a password less than 8 characters
**When** I submit the form
**Then** I see a validation error "Password must be at least 8 characters"

**User Flows:**
- **Admin Registration:** Register → Create tenant → Admin role → Setup company → Invite team
- **Team Onboarding:** Receive invite → Accept → Join tenant as admin/provider
- **Client Onboarding:** Book appointment → Inline registration (Story 3.6) → Join tenant as client

---

### Story 1.5: User Registration (Google SSO)

As a **client**,
I want **to register using my Google account**,
So that **I can quickly create an account without remembering another password** (FR12).

**Acceptance Criteria:**

**Given** I am on the registration/login page
**When** I click "Continue with Google"
**Then** I am redirected to Google OAuth consent screen
**And** after granting permission, my account is created in Supabase Auth
**And** a user record is created in `users` table with `role: 'client'`
**And** my name and email are populated from Google profile
**And** I am redirected to the dashboard

**Given** I already have an account with the same email (password-based)
**When** I sign in with Google
**Then** my accounts are linked (same user, multiple auth methods)

---

### Story 1.6: User Login & Session

As a **registered user**,
I want **to log in with my credentials**,
So that **I can access my account and bookings** (FR14).

**Acceptance Criteria:**

**Given** I am on the login page
**When** I enter valid email and password
**Then** I am authenticated and a JWT session is created
**And** I am redirected to my appropriate dashboard (based on role)
**And** my session persists across page refreshes

**Given** I enter incorrect credentials
**When** I submit the login form
**Then** I see an error "Invalid email or password"
**And** I remain on the login page

**Given** I am logged in
**When** I am inactive for 30 minutes
**Then** my session expires (NFR10)
**And** I am redirected to login page on next action

---

### Story 1.7: Password Reset

As a **user who forgot their password**,
I want **to reset my password via email**,
So that **I can regain access to my account** (FR15).

**Acceptance Criteria:**

**Given** I am on the login page
**When** I click "Forgot Password" and enter my email
**Then** a password reset email is sent to my address
**And** I see a confirmation message

**Given** I received the reset email
**When** I click the reset link and enter a new password
**Then** my password is updated
**And** I can log in with the new password

**Given** the reset link is older than 1 hour
**When** I try to use it
**Then** I see an error "Reset link has expired"
**And** I am prompted to request a new reset

---

### Story 1.8: RBAC Foundation

As a **system**,
I want **role-based access control enforced**,
So that **users can only access features appropriate to their role** (FR55-FR56).

**Acceptance Criteria:**

**Given** a user has role `client`
**When** they try to access `/admin/*` routes
**Then** they are redirected to `/dashboard` with "Access Denied" message

**Given** a user has role `provider`
**When** they access the provider dashboard
**Then** they see only their own appointments (not other providers')

**Given** a user has role `admin`
**When** they access the admin dashboard
**Then** they have full access to all tenant data

**Given** the API receives a request
**When** role verification is performed
**Then** the role is extracted from JWT claims
**And** tRPC protected procedures enforce role requirements

**Given** Next.js middleware runs
**When** a protected route is accessed
**Then** unauthenticated users are redirected to `/login`

---

### Story 1.9: GitHub & CI/CD Setup

As a **developer**,
I want **version control and automated CI/CD**,
So that **code changes are tested and deployed automatically**.

**Acceptance Criteria:**

**Given** the project code exists
**When** it is pushed to GitHub
**Then** a repository exists with proper `.gitignore`
**And** `main` branch has protection rules (require PR, no force push)
**And** a `develop` branch exists for integration

**Given** a pull request is opened
**When** GitHub Actions runs
**Then** ESLint checks pass
**And** TypeScript compilation succeeds
**And** any existing tests pass
**And** a Vercel preview deployment is created

**Given** a PR is merged to `main`
**When** the merge completes
**Then** production deployment is triggered automatically

---

### Story 1.10: Vercel Deployment

As a **team**,
I want **the application deployed to Vercel**,
So that **we can access the live app and share progress**.

**Acceptance Criteria:**

**Given** GitHub repository is connected to Vercel
**When** deployment is configured
**Then** the project deploys to `*.vercel.app` domain
**And** environment variables are configured in Vercel dashboard
**And** Preview deployments work for PRs
**And** Production deployment is on `main` branch

**Given** the deployed app is accessed
**When** I visit the URL
**Then** the home page loads in < 2 seconds (NFR1)
**And** Supabase connection works in production
**And** Auth flows work with correct redirect URLs

---

## Epic 2: Admin Service & Provider Management

### Story 2.0: Admin Company Profile Setup ✅ DONE

As a **tenant admin**,
I want **to set up my company profile and branding**,
So that **my booking page reflects my business identity** (FR58, FR59).

**Acceptance Criteria:**

**Given** I am logged in as an admin (first time)
**When** I access the Company Settings page
**Then** I can update my company Name and Logo
**And** I can set my company Timezone and Currency
**And** I can configure my business hours (default for new providers)
**And** I can generate my booking page URL slug (e.g., `schedule.com/mycompany`)

**Given** I update the branding colors
**When** I save
**Then** the embedded widget and booking pages reflect the new colors

**Given** I update the tenant settings
**When** I toggle "Allow Guest Checkout"
**Then** the setting is saved to the database (supporting Story 3.6)


---

### Story 2.0.1: Streamlined Company Onboarding
**Goal:** Enforce the "Basic Essentials Only" setup flow to reduce initialization friction.

**User Outcome:** Admin completes setup in < 60 seconds without decision fatigue.

**Acceptance Criteria:**
**Given** I am on the Company Profile setup page
**When** the form loads
**Then** I see ONLY the following fields:
*   Company Name (Text)
*   Company Logo (Upload)
*   Branding Color Primary (Color Picker)
*   Branding Color Secondary (Color Picker)

**Given** I want to set business hours or integrations
**When** I look for these options
**Then** they are HIDDEN from this initial view (Deferred to 'Settings' tab)
**And** I can proceed without configuring them


### Story 2.1: Services & Providers Database Schema ✅ DONE

As a **developer**,
I want **database tables for services, providers, and their relationships**,
So that **I can store and query service/provider data**.

**Acceptance Criteria:**

**Given** Supabase is connected
**When** the schema migration runs
**Then** `categories` table exists (id, name, slug, tenant_id)
**And** `services` table exists (id, name, description, duration_minutes, price, category_id, service_type [consultation/class], tenant_id)
**And** `providers` table exists (id, name, email, phone, bio, photo_url, tenant_id)
**And** `service_providers` junction table exists (service_id, provider_id)
**And** RLS policies enforce tenant isolation on all tables
**And** database types are regenerated

---

### Story 2.2: Provider Availability Schema ✅ DONE

As a **developer**,
I want **database tables for provider schedules and overrides**,
So that **I can store availability configuration**.

**Acceptance Criteria:**

**Given** providers table exists
**When** the availability schema migration runs
**Then** `provider_schedules` table exists (id, provider_id, day_of_week, start_time, end_time, is_available)
**And** `schedule_overrides` table exists (id, provider_id, date, start_time, end_time, is_available, reason)
**And** `provider_calendars` table exists (id, provider_id, google_calendar_id, access_token, refresh_token, token_expires_at)
**And** RLS policies enforce tenant isolation
**And** indexes exist for efficient availability queries

---

### Story 2.3: Admin Service CRUD ✅ DONE

As an **admin**,
I want **to create, edit, and delete services**,
So that **I can manage the service catalog** (FR43-FR44).

**Acceptance Criteria:**

**Given** I am logged in as admin
**When** I access the Services management page
**Then** I see a list of existing services

**Given** I click "Add Service"
**When** I fill in name, description, duration, price, category, and service type
**Then** the service is created in the database
**And** I see a success message

**Given** I edit an existing service
**When** I update the fields and save
**Then** the service is updated in the database

**Given** I delete a service
**When** I confirm deletion
**Then** the service is soft-deleted (or removed if no bookings)

---

### Story 2.4: Team Invitations & Member Management ✅ DONE

As an **admin**,
I want **to invite team members by email**,
So that **they can create their own accounts and join the company** (FR60).

**Acceptance Criteria:**

**Given** I am logged in as admin
**When** I go to "Team Management" > "Invite Member"
**Then** I can enter an email address
**And** an invitation link is emailed to them

**Given** the user accepts the invitation
**When** they sign up (Google or Password)
**Then** they are added to the company as a "Team" member
**And** they appear in the Admin's Team list (status: Active)

**Given** I view the Team list
**When** a user has not accepted yet
**Then** I see their status as "Invited"
**And** I can "Resend Invitation"


---

### Story 2.4.1: Enhanced Team Invitation Fields
**Goal:** Align Team invitation form with specific user requirements for role and contact info.

**Pre-requisite:** Story 2.4 code structure.

**Acceptance Criteria:**
**Given** I click "Add Team Member"
**When** the form opens (Modal or Slide-over)
**Then** I see exactly these fields:
*   **Name** (Mandatory)
*   **Email** (Mandatory)
*   **Mobile Number** (Optional)
*   **Role/Position** (Optional text field)

**Given** I submit the form
**When** I click "Send Invitation"
**Then** the user status becomes "Invited"
**And** an email is sent to the address provided

---

### Story 2.5: Role Assignment & Provider Linking ✅ DONE

As an **admin**,
I want **to assign roles (Provider/Admin) to team members**,
So that **they can perform their duties or be booked for services**.

**Acceptance Criteria:**

**Given** a user exists in the Team list
**When** I select "Promote to Admin"
**Then** they gain admin privileges (can invite others, manage settings)

**Given** a user exists
**When** I select "Make Provider"
**Then** a Provider Profile is created for them
**And** I can edit their Bio, Photo, and Display Name
**And** I can assign them to specific Services (from Story 2.3)

**Given** I am editing a Provider's profile (FR48, FR49)
**When** I access the "Availability" tab
**Then** I see a visual weekly schedule builder
**And** I can drag to set recurring time blocks (e.g., Mon 9AM-5PM)
**And** I can add/edit/delete date-specific overrides (e.g., "Dec 25: Unavailable")
**And** overrides show with a visual indicator (different color)
**And** changes are saved to `provider_schedules` and `schedule_overrides` tables

**Given** a user is now a Provider
**When** I view the "Services" page
**Then** they appear as an available provider for their assigned services

**Implementation Note (File Uploads):**
- Provider photos must be stored in tenant-isolated paths: `storage/tenants/{tenant_id}/providers/{provider_id}/...`
- Validate file types: `image/jpeg`, `image/png`, `image/webp` only
- Max file size: 5MB
- See `project-context.md` for full file validation rules

---

### Story 2.5.1: File Upload Infrastructure (Supabase Storage) ✅ DONE

As a **developer**,
I want **a file upload system using Supabase Storage with S3-compatible patterns**,
So that **users and companies can upload photos while maintaining portability**.

**Acceptance Criteria:**

**Given** the storage infrastructure needs setup
**When** the configuration is complete
**Then** a Supabase Storage bucket `tenant-assets` exists
**And** RLS policies restrict access to tenant's own files
**And** files are organized by path: `{tenant_id}/{type}/{entity_id}/{filename}`

**Given** an admin uploads a company logo
**When** the upload completes
**Then** the file is stored at `{tenant_id}/company/logo.{ext}`
**And** `tenants.logo_url` is updated with the public URL
**And** old logo is deleted if exists

**Given** any user (client, provider, admin) uploads their profile photo
**When** the upload completes
**Then** the file is stored at `{tenant_id}/users/{user_id}/avatar.{ext}`
**And** `users.avatar_url` is updated with the public URL
**And** old photo is deleted if exists
**And** the photo is visible on their profile page

**Given** a provider uploads their own public-facing photo (for booking display)
**When** the upload completes
**Then** the file is stored at `{tenant_id}/providers/{provider_id}/photo.{ext}`
**And** `providers.photo_url` is updated
**And** old photo is deleted if exists

**Given** an admin needs to change a provider's photo
**When** the admin accesses the provider's profile
**Then** the admin can upload/replace the provider's photo
**Note:** Provider photo is separate from user avatar - it's the public-facing image shown in booking widgets

**Given** file validation is needed
**When** a file is selected for upload
**Then** client validates: type (jpeg, png, webp), size (max 5MB)
**And** server re-validates before storage
**And** invalid files show clear error message

**Technical Notes (Portability):**
- Use Supabase Storage's S3-compatible API patterns
- Avoid Supabase-specific features that don't exist in standard S3
- File URLs use public bucket or signed URLs (prefer public for profile photos)
- Reusable `<FileUpload />` component with progress indicator
- See `project-context.md` for file validation rules

**Reusable Component API:**
```typescript
<FileUpload 
  bucket="tenant-assets"
  path={`${tenantId}/users/${userId}`}
  accept="image/*"
  maxSize={5 * 1024 * 1024}
  onUpload={(url) => updateProfile({ avatarUrl: url })}
/>
```

**Storage Path Structure:**
| Type | Path | Database Field |
|------|------|----------------|
| Company Logo | `{tenant_id}/company/logo.{ext}` | `tenants.logo_url` |
| User Avatar | `{tenant_id}/users/{user_id}/avatar.{ext}` | `users.avatar_url` |
| Provider Photo | `{tenant_id}/providers/{provider_id}/photo.{ext}` | `providers.photo_url` |

---

### Story 2.6: Google Calendar OAuth

As an **admin**,
I want **to connect a provider's Google Calendar**,
So that **their external appointments block availability** (FR50).

**Acceptance Criteria:**

**Given** I am on the provider edit page
**When** I click "Connect Google Calendar"
**Then** I am redirected to Google OAuth consent screen

**Given** the provider grants calendar access
**When** OAuth completes
**Then** access and refresh tokens are stored in `provider_calendars`
**And** the provider's calendar ID is stored
**And** I see "Google Calendar Connected" status

**Given** the OAuth token expires
**When** an API call is made
**Then** the system refreshes the token automatically (NFR8)

**Given** a provider disconnects their calendar
**When** they click "Disconnect"
**Then** tokens are deleted from the database

---

### Story 2.7: 4-Layer Availability Engine

As a **system**,
I want **to compute available slots using 4-layer filtering**,
So that **clients only see truly bookable times** (FR6-FR8).

**Acceptance Criteria:**

**Given** a request for provider X's availability for service Y on date Z
**When** the availability engine runs
**Then** Layer 1 checks: Is the service available on this day?
**And** Layer 2 checks: Does the provider have scheduled time blocks?
**And** Layer 3 checks: Are there any overrides for this date?
**And** Layer 4 checks: Is the provider's Google Calendar free?
**And** only slots passing ALL 4 layers are returned

**Given** the provider's Google Calendar shows a meeting at 10:00
**When** availability is computed
**Then** the 10:00 slot is NOT returned

**Given** Google Calendar API is unavailable
**When** availability is computed
**Then** the system returns cached availability with warning (NFR16)
**And** response time remains < 500ms (NFR2)

**Schema Prerequisites (Migration):**
Before implementing this story, add to `services` table:
- `min_notice_hours INTEGER DEFAULT 24` - How far ahead clients must book
- `max_future_days INTEGER DEFAULT 60` - How far into future clients can book
- `payment_requirement TEXT DEFAULT 'OPTIONAL'` - FULL / OPTIONAL / NONE

**Booking Rule Validation:**
**Given** a service has `min_notice_hours: 24`
**When** a client tries to book a slot 2 hours from now
**Then** the slot is NOT returned (fails Layer 1)

**Given** a service has `max_future_days: 60`
**When** a client views dates 90 days in the future
**Then** those dates are greyed out / not selectable

---

### Story 2.8: Admin Dashboard & Navigation Shell ✅ DONE

As an **admin**,
I want **a persistent navigation sidebar**,
So that **I can access all management modules from one place**.

**Acceptance Criteria:**

**Given** I am logged in as admin
**When** I view the sidebar
**Then** I see the following primary navigation links:
1.  **Dashboard** (Overview & Stats)
2.  **Bookings** (Link to Epic 8: Master calendar & list)
3.  **Services** (Link to Epic 2: Manage services)
4.  **Team** (Link to Epic 2: Manage providers & team)
5.  **Company** (Link to Story 2.0: Profile, Branding, Hours)
6.  **Widget** (Link to Epic 3: Configuration & Embed code)
7.  **Settings** (General system settings)

**Given** I am on a mobile device
**When** I view the admin area
**Then** the sidebar is collapsible (hamburger menu)

---
---

### Story 2.5.2: Permissions Schema & Team Enhancement ✅ DONE

As a **developer**,
I want **granular permissions stored on users and enhanced team invitations**,
So that **admins can control what each team member can access**.

**Schema Migration:**
```sql
-- Add permissions to users
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;

-- Add placeholder linking to team_invitations
ALTER TABLE public.team_invitations 
  ADD COLUMN IF NOT EXISTS placeholder_provider_id UUID REFERENCES provider_profiles(user_id),
  ADD COLUMN IF NOT EXISTS default_permissions JSONB DEFAULT '{}'::jsonb;
```

**Default Permissions Structure:**
```json
{
  "services": { "add": true, "edit": true },
  "providers": { "add": true, "edit": true },
  "bookings": { "manage": true },
  "team": { "add": false, "edit": false },
  "payments": { "view": false, "refund": false, "settings": false },
  "company": { "edit": false }
}
```

**Acceptance Criteria:**

**Given** a team invitation is sent
**When** the admin selects permissions
**Then** `default_permissions` is stored on the invitation

**Given** the invitee accepts
**When** their user record is created
**Then** `users.permissions` is populated from invitation defaults

**Given** an admin is logged in
**When** they check permission for an action
**Then** utility function `hasPermission(user, 'services.edit')` returns boolean

---

### Story 2.5.3: Owner Role & Deletion Security (Backend)

As an **owner**,
I want **strict hierarchy rules for account deletion**,
So that **I cannot be locked out and my company data is safe**.

**Database Updates:**
1.  Update `users` constraint: `roles` includes `'owner'`
2.  Update `handle_new_user`: First user of new tenant gets `['owner']`
3.  Update RLS: Only `owner` can DELETE from `tenants`

**Acceptance Criteria:**
**Given** a new user signs up
**When** they create a new company
**Then** they satisfy `roles.includes('owner')`

**Given** an admin tries to delete a user
**When** target user is 'owner'
**Then** the action fails (API returns 403)

**Given** a user tries to delete their own account
**When** they are the last owner
**Then** they are blocked until they transfer ownership or delete company

---


---

### Story 2.4.3: Email Integration (Resend) ✅ DONE

As an **admin**,
I want **invitations to send real emails**,
So that **team members can join easily**.

**Acceptance Criteria:**
**Given** I invite a user
**When** I switch on `RESEND_API_KEY`
**Then** an email is sent to the user via Resend
**And** the email contains a direct link to accept
**And** the email comes from `team@shedule.life` (Verified Domain)

---

### Story 2.7.1: Provider Availability Editor UI

As an **admin or provider**,
I want **a visual weekly schedule builder**,
So that **I can set recurring availability with drag-to-select**.

**Acceptance Criteria:**

**Given** I am on the provider's Schedule tab
**When** the page loads
**Then** I see a weekly grid (Mon-Sun, 7am-9pm)
**And** existing time blocks are highlighted
**And** I can drag to create new time blocks
**And** I can click a block to edit or delete it

**Given** I need to set split shifts
**When** I create two blocks on the same day (e.g., 9-12, 14-17)
**Then** both blocks are saved separately
**And** availability respects the gap (12-14 is unavailable)

**Given** I need to set a date-specific override
**When** I click "Add Override"
**Then** I see a date picker + time range + reason field
**And** overrides are displayed with a different color

**Given** the provider has Google Calendar connected
**When** I view the schedule
**Then** I see a notice "Google Calendar conflicts will block these times"

**UI Reference:** Follow Calendly's availability editor pattern.

---

### Story 2.9: Responsive UI Patterns (Calendly-Style)

As a **user on any device**,
I want **consistent responsive behavior across all admin screens**,
So that **I can manage bookings effectively on mobile**.

**Acceptance Criteria:**

**Desktop Behavior (≥1024px):**
**Given** I am on a list page (Team, Providers, Services)
**When** I click an item
**Then** a detail panel slides in from the right
**And** the list remains visible on the left
**And** the sidebar stays expanded

**Tablet Behavior (768px-1023px):**
**Given** I am on a list page
**When** I click an item
**Then** the detail panel takes more width
**And** the list compresses or hides
**And** sidebar collapses to icons only

**Mobile Behavior (<768px):**
**Given** I am on any admin page
**When** the page loads
**Then** the sidebar is a hamburger menu (top-left)
**And** lists are full-screen
**And** clicking an item navigates to a full-screen detail view
**And** an X button (top-right) returns to the list

**Tabbed Detail Views:**
**Given** I am viewing a single item (Provider, Service, Team Member)
**When** the detail loads
**Then** I see horizontal tabs at the top:
- Provider: Details | Services | Schedule | Appointments
- Team Member: Details | Permissions | Activity
- Service: Basics | Booking Rules | Providers

**UI Reference:** Study Calendly's mobile app and admin panel for exact patterns.

**Owner/Admin UI Logic:**
**Given** I view the Team List
**When** a user has 'owner' role
**Then** I see an "Owner" badge next to their name
**And** the "Delete" action is disabled/hidden (unless I am the Owner myself removing a co-owner)

**Given** I am on the Company Profile
**When** I am NOT the owner
**Then** the "Delete Company" button is hidden

---

### Story 2.8.2: Enhanced Responsive Admin Shell
**Goal:** Enforce strict responsive behavior standards on top of the existing dashboard.

**Pre-requisite:** Story 2.8 (Dashboard Shell).

**Acceptance Criteria:**
**Desktop (Example: > 1024px):**
**Given** the Admin sidebar is visible
**Then** it MUST have **distinct tabs** for "Team" (Admins/Staff) and "Providers" (Bookable Staff) — **DO NOT MERGE THESE.**
**And** the sidebar is expanded by default

**Given** I click an item in a list (e.g. a Team Member)
**When** the action triggers
**Then** a **Side Sheet / Slide-over pane** opens on the right
**And** the list view remains visible on the left (Context preserved)

**Mobile (Example: < 768px):**
**Given** the Admin sidebar is viewed
**Then** it collapses into a **Hamburger Menu**
**And** the "Team" vs "Providers" bifurcation is maintained

**Given** I click an item in a list
**When** the action triggers
**Then** the view **replaces the list** (Full Screen push) with the Details Pane
**And** a prominent **"X" or "Back" button** is visible to return to the list

---

### Story 2.8.3: Admin Provider "Impersonation" View
**Goal:** Implement the "View as Provider" dashboard for Admins to manage providers with the same fidelity as the provider themselves.

**Pre-requisite:** Story 2.8 and Provider Portal logic.

**Acceptance Criteria:**
**Given** I am in the "Providers" tab
**When** I click a specific Provider
**Then** I enter the "Impersonation View" for that provider

**UI Layout Requirements:**
**The view MUST duplicate the Provider Portal layout exactly with these tabs:**
1.  **Appointments**: List of upcoming/past appointments with filters (Date, Status)
2.  **Schedule**: Availability editor (Weekly recurring + Overrides)
3.  **Clients**: List of clients assigned to this provider
4.  **Profile**: Edit Name, Bio, Photo

**Data Visibility Rule:**
**Given** I view the "Clients" tab or any client detail
**When** I am an Admin (not the Assignee)
**Then** **Private Notes MUST be hidden**
**And** I can see all other contact info and history

**Comparison Validation:**
"I see everything the provider sees EXCEPT personal notes."

---

## Epic 3: Embeddable Booking Widget

### Story 3.1: Embeddable Calendar Widget

As a **client visiting an external website**,
I want **to see available slots and book directly in an embedded widget**,
So that **I can book without leaving the business's website**.

**Acceptance Criteria:**

**Given** I load `/embed/book?tenant=X&provider=Y&service=Z`
**When** the page renders
**Then** I see the provider's name and photo
**And** I see the service name, duration, and price
**And** I see a calendar with available dates highlighted
**And** the theme matches the query param (light/dark/minimal)

**Given** I click an available date
**When** slots are displayed
**Then** I see time slots that passed the 4-layer filter

**Given** I select a time slot
**When** I am not logged in
**Then** I am prompted to register or log in

**Given** I complete the booking form
**When** I click "Book (Pay Later)"
**Then** a booking is created with status PENDING
**And** I see a confirmation screen

**Given** the widget is embedded in an iframe
**When** it loads
**Then** it works correctly with proper CORS headers
**And** responsive design fits the iframe dimensions

---

### Story 3.2: Widget Configurator UI

As an **admin**,
I want **to configure and preview embed widgets**,
So that **I can generate embed codes for external websites**.

**Acceptance Criteria:**

**Given** I am on the Widget Configurator page
**When** I select a service from dropdown
**Then** the provider dropdown is filtered to show only assigned providers

**Given** I select service and provider
**When** I choose a theme (light/dark/minimal) and width
**Then** the preview panel updates in real-time

**Given** the preview is satisfactory
**When** I view the embed code section
**Then** I see a copyable iframe code with correct parameters

**Given** I click "Copy Embed Code"
**When** the code is copied
**Then** I see a success toast "Embed code copied!"
**And** the clipboard contains the complete iframe HTML

---

### Story 3.3: Mock Test Page

As a **developer/tester**,
I want **a test page simulating an external website with embedded widget**,
So that **I can verify the embed functionality works correctly**.

**Acceptance Criteria:**

**Given** I access `/test/embed-demo`
**When** the page loads
**Then** I see a mock "business website" layout
**And** an embedded booking widget is displayed in an iframe

**Given** the widget is loaded
**When** I interact with the calendar
**Then** all functionality works as expected (slot selection, booking)

**Given** I change the embed parameters in the URL
**When** the page reloads
**Then** the widget reflects the new configuration (different provider, theme, etc.)

---

### Story 3.4: Booking Creation (Pay Later)

As a **client**,
I want **to book an appointment with "Pay Later" option**,
So that **I can reserve a slot without immediate payment** (FR23-FR24).

**Acceptance Criteria:**

**Given** I have selected a time slot
**When** I click "Book (Pay Later)"
**Then** a `bookings` table record is created with status: PENDING
**And** the booking includes: client_id, provider_id, service_id, date_time, tenant_id

**Given** the booking is created
**When** I view my booking
**Then** I see "Pending Admin Approval" status

**Given** the slot I'm booking
**When** another user tries to book the same slot
**Then** they see "Slot no longer available" (race condition handled)

---

### Story 3.5: Booking Confirmation UI

As a **client**,
I want **to see a confirmation after booking**,
So that **I know my booking was successful**.

**Acceptance Criteria:**

**Given** I complete the booking
**When** the confirmation screen displays
**Then** I see a success animation (check mark)
**And** I see booking details (service, provider, date, time)
**And** I see "Awaiting Admin Approval" status (for Pay Later)
**And** I see "You will receive an email once confirmed"

**Given** I booked as a guest (no password set)
**When** the confirmation screen displays
**Then** I see a prominent "Create Account" section
**And** the section says: "Want to easily track and manage your bookings?"
**And** I see fields: Password, Confirm Password
**And** I see "Create Account" button
**And** I see "Skip for now" link (dismisses the prompt)

**Given** I booked as a guest and set a password on confirmation
**When** I click "Create Account"
**Then** my account is upgraded with password
**And** I am logged in automatically
**And** I see "Account created! You can now manage all your bookings"

**Given** I am on the confirmation screen
**When** I click "View My Bookings"
**Then** I am redirected to my bookings dashboard (if logged in)
**Or** I see a prompt to check my email for booking management link (if guest)

---

### Story 3.6: Guest Booking Flow (Lazy Registration)

As a **new client**,
I want **to book an appointment without creating an account upfront**,
So that **I can complete my booking quickly without friction** (FR10, FR13).

**Acceptance Criteria:**

**Given** I am NOT logged in and have selected a time slot
**When** I click "Book this slot"
**Then** I see a simple booking details form
**And** the page shows my selected service, provider, date/time at the top
**And** I see required fields: Name, Phone, Email
**And** I see "Continue with Google" as an alternative (creates full account)
**And** I see "Proceed to Payment" CTA button

**Given** I am filling out the booking form
**When** I selected a slot
**Then** the slot is temporarily held for 10 minutes
**And** a countdown timer is visible showing remaining hold time
**And** other users see this slot as unavailable

**Given** I enter an email that already exists in the system
**When** I blur the email field
**Then** I see message: "We found your account!"
**And** I see options: "Sign in to book" or "Continue as guest"
**And** if I continue as guest, booking is linked to existing client record

**Given** I filled all required fields (Name, Phone, Email)
**When** I click "Proceed to Payment"
**Then** client record created with `password_hash: null` (guest)
**And** `booking_token` generated (unique, secure, expiring in 30 days)
**And** temporary slot hold converted to pending booking
**And** redirected to payment page (or confirmation for Pay Later)
    
---

### Story 3.7: Guest Magic Link & Account Claim

As a **guest client**,
I want **to access and manage my bookings via a secure link**,
So that **I can reschedule or cancel without needing an account** (FR13).

**Acceptance Criteria:**

**Given** I booked as a guest
**When** I receive my confirmation email
**Then** the email contains a unique "Manage Booking" link
**And** the link format is `/booking/manage?token={booking_token}`
**And** the token expires after 30 days (but refreshes on each booking)
**And** clicking the link shows my booking(s) for that email

**Given** I click the magic link from my email
**When** the page loads
**Then** I see all my bookings (for this email address)
**And** I can reschedule individual bookings (if policy allows)
**And** I can cancel bookings (if policy allows)
**And** I see a prominent "Create Account" banner at the top

**Given** the magic link token has expired (30+ days)
**When** I click the link
**Then** I see "Link expired. Enter your email to get a new link"
**And** I can request a new magic link via email

**Given** I am on the guest booking management page
**When** I click "Create Account"
**Then** I see password fields (Password, Confirm Password)
**And** I can set a password to activate my account
**And** all my past bookings are linked to my new account

---

### Story 3.8: Admin/Provider Strict Authentication

As a **system admin**,
I want **admins and providers to have strict account verification**,
So that **business-side accounts are secure** (FR55).

**Acceptance Criteria:**

**Given** "Confirm Email" is enabled globally in Supabase
**When** a user registers via /admin/invite (team invitation)
**Then** they must verify email to activate account
**And** they must set a strong password (8+ chars, mixed case)

**Given** a user signs up via Google SSO for Admin/Provider role
**When** they complete OAuth
**Then** they are automatically verified (Google email trusted)
**And** they are assigned their invited role

**Note:** Guest clients (Story 3.6) bypass email verification since they don't have passwords - security is via magic link tokens instead.

---


## Epic 4: Pay Later Approval Workflow

### Story 4.1: Pay Later Booking Status Schema

As a **developer**,
I want **booking status tracking in the database**,
So that **Pay Later bookings can be managed through approval workflow**.

**Acceptance Criteria:**

**Given** the bookings table exists
**When** the schema migration runs
**Then** `bookings` table has `status` column with enum: PENDING, APPROVED, REJECTED, CANCELLED
**And** `bookings` table has `rejection_reason` column (nullable text)
**And** `bookings` table has `approved_at` and `approved_by` columns
**And** default status for Pay Later bookings is PENDING

---

### Story 4.2: Admin Pending Bookings List

As an **admin**,
I want **to see all pending Pay Later bookings**,
So that **I can review and take action on them** (FR29).

**Acceptance Criteria:**

**Given** I am logged in as admin
**When** I access the Pending Approvals page
**Then** I see a list of all PENDING status bookings
**And** each item shows: client name, service, provider, date/time, booking timestamp
**And** bookings are sorted by oldest first (FIFO)
**And** I can filter by service or provider

**Given** there are no pending bookings
**When** I view the page
**Then** I see "No pending bookings" message

---

### Story 4.3: Admin Approve Booking

As an **admin**,
I want **to approve a pending booking with one click**,
So that **the client receives confirmation and calendar sync occurs** (FR30, FR32).

**Acceptance Criteria:**

**Given** I am viewing a pending booking
**When** I click "Approve"
**Then** booking status changes to APPROVED
**And** `approved_at` is set to current timestamp
**And** `approved_by` is set to my user ID
**And** confirmation email is sent to client
**And** booking notification is sent to provider
**And** Google Calendar event is created (if provider has calendar connected)
**And** I see success toast "Booking approved"

**Given** I approve a booking
**When** the approval is processed
**Then** the booking is removed from pending list

---

### Story 4.4: Admin Reject Booking

As an **admin**,
I want **to reject a pending booking with a reason**,
So that **the client is informed why their booking was declined** (FR31).

**Acceptance Criteria:**

**Given** I am viewing a pending booking
**When** I click "Reject"
**Then** a modal appears asking for rejection reason

**Given** I enter a rejection reason and confirm
**When** the rejection is processed
**Then** booking status changes to REJECTED
**And** `rejection_reason` is stored
**And** rejection email is sent to client with the reason
**And** the slot becomes available again for others to book
**And** I see success toast "Booking rejected"

**Given** I try to reject without a reason
**When** I click confirm
**Then** I see validation error "Reason is required"

---

### Story 4.5: Admin Notification for New Pending Bookings

As an **admin**,
I want **to be notified when new Pay Later bookings arrive**,
So that **I can review them promptly** (FR28).

**Acceptance Criteria:**

**Given** a client creates a Pay Later booking
**When** the booking is saved with PENDING status
**Then** an email notification is sent to admin(s)
**And** the email includes: client name, service, provider, requested date/time

**Given** I am on the admin dashboard
**When** new pending bookings exist
**Then** I see a badge/count indicator on the Pending Approvals menu item

---

## Epic 5: Booking Management

### Story 5.1: Client Bookings Dashboard

As a **client**,
I want **to see all my bookings in one place**,
So that **I can track upcoming and past appointments** (FR21).

**Acceptance Criteria:**

**Given** I am logged in as a client
**When** I access My Bookings page
**Then** I see tabs for "Upcoming" and "Past" bookings
**And** each booking shows: service, provider, date/time, status
**And** upcoming bookings show "Reschedule" and "Cancel" buttons
**And** PENDING bookings show "Awaiting Approval" badge

---

### Story 5.2: Reschedule Booking

As a **client**,
I want **to reschedule my booking to a different time**,
So that **I can adjust when plans change** (FR19).

**Acceptance Criteria:**

**Given** I have an upcoming APPROVED booking
**When** I click "Reschedule"
**Then** I see the availability calendar for the same service/provider
**And** I can select a new date/time slot

**Given** I select a new slot
**When** I confirm reschedule
**Then** the booking is updated with new date/time
**And** provider is notified of the change
**And** Google Calendar event is updated
**And** I see confirmation message

**Given** the booking is within 24 hours
**When** I try to reschedule
**Then** I see warning "Cannot reschedule within 24 hours"

---

### Story 5.3: Cancel Booking

As a **client**,
I want **to cancel my booking**,
So that **I can free up the slot if I can't attend** (FR20).

**Acceptance Criteria:**

**Given** I have an upcoming booking
**When** I click "Cancel"
**Then** I see a confirmation modal with cancellation policy

**Given** I confirm cancellation
**When** the cancellation is processed
**Then** booking status changes to CANCELLED
**And** provider is notified
**And** Google Calendar event is deleted
**And** the slot becomes available for others
**And** I see confirmation message

---

### Story 5.4: Booking History

As a **client**,
I want **to view my past bookings**,
So that **I can reference previous appointments**.

**Acceptance Criteria:**

**Given** I am on the Past bookings tab
**When** bookings load
**Then** I see completed and cancelled bookings
**And** each shows: service, provider, date, status
**And** I can click to view details

---

## Epic 6: Provider Dashboard & Calendar Sync

### Story 6.1: Provider Dashboard Overview

As a **provider**,
I want **to see my schedule at a glance**,
So that **I know what's happening today** (FR38).

**Acceptance Criteria:**

**Given** I am logged in as a provider
**When** I access my dashboard
**Then** I see today's appointments in timeline view
**And** I see upcoming appointments count
**And** I see quick stats (bookings this week, month)

---



As a **provider**,
I want **to view my schedule in day and month view**,
So that **I can plan ahead** (FR39).

**Acceptance Criteria:**

**Given** I am on the calendar page
**When** I view day mode
**Then** I see hourly timeline with booked slots highlighted
**And** I can click appointments to see details

**Given** I switch to month view
**When** the calendar loads
**Then** I see days with appointment counts
**And** I can click a day to see that day's appointments

---

### Story 6.3: Provider Client Details View

As a **provider**,
I want **to see client details for each booking**,
So that **I can prepare for sessions** (FR40).

**Acceptance Criteria:**

**Given** I click on a booking
**When** the details modal opens
**Then** I see client name, email, phone
**And** I see service name, duration
**And** I see booking notes (if any)

---

### Story 6.4: Google Calendar Two-Way Sync

As a **provider**,
I want **bookings to sync to my Google Calendar**,
So that **I see all appointments in one place** (FR42).

**Acceptance Criteria:**

**Given** my Google Calendar is connected
**When** a booking is approved
**Then** a calendar event is created with client details
**And** the event includes service name and duration

**Given** I have events in Google Calendar
**When** availability is calculated
**Then** those times are blocked (4-layer filter)

---

## Epic 7: Notifications & Reminders

### Story 7.0: Background Jobs Infrastructure

As a **developer**,
I want **a background job system for sending notifications**,
So that **emails and reminders are processed reliably without blocking requests**.

**Acceptance Criteria:**

**Given** the notification system needs background processing
**When** the infrastructure is set up
**Then** a job queue system is configured (Vercel Cron, Trigger.dev, or Inngest)
**And** jobs can be scheduled for future execution (reminders)
**And** job payloads include `tenant_id` for context isolation
**And** failed jobs are logged with tenant context for debugging

**Given** a background job runs
**When** tenant context is needed
**Then** tenant_id is extracted from job payload
**And** tenant context is restored before processing
**And** all database queries use restored tenant context

**Technical Options:**
- **Vercel Cron** - Simple, free tier, good for scheduled tasks
- **Trigger.dev** - More features, webhooks, retries
- **Inngest** - Event-driven, complex workflows

**Note:** Start with Vercel Cron for MVP (simplest). Migrate to Trigger.dev if advanced features needed.

---

### Story 7.1: Booking Confirmation Email

As a **client**,
I want **to receive email confirmation after booking**,
So that **I have a record of my appointment** (FR33).

**Acceptance Criteria:**

**Given** my booking is APPROVED (or Pay Later is confirmed)
**When** the confirmation email is sent
**Then** I receive email with: service, provider, date/time, location
**And** email includes calendar attachment (.ics)

**Given** I am a guest client (no password set)
**When** I receive the confirmation email
**Then** the email includes a "Manage Booking" button with magic link
**And** the email includes a section: "Create an account to easily manage all your bookings"
**And** there is a "Create Account" button linking to account activation page
**And** the magic link token is valid for 30 days

**Given** I am a registered client (has password)
**When** I receive the confirmation email
**Then** the email includes a "View My Bookings" button linking to dashboard
**And** no account creation prompt is shown

---

### Story 7.2: Provider Booking Notification

As a **provider**,
I want **to be notified of new bookings**,
So that **I know when clients book with me** (FR34).

**Acceptance Criteria:**

**Given** a booking is approved for me
**When** the notification triggers
**Then** I receive email with client name, service, date/time

---

### Story 7.3: 24-Hour Reminder Email

As a **client**,
I want **to receive a reminder 24 hours before my appointment**,
So that **I don't forget** (FR35).

**Acceptance Criteria:**

**Given** I have an approved booking tomorrow
**When** 24 hours before the booking
**Then** I receive reminder email with booking details

---

### Story 7.4: 1-Hour Reminder Email

As a **client**,
I want **a final reminder 1 hour before**,
So that **I'm prepared** (FR36).

**Acceptance Criteria:**

**Given** I have an approved booking in 1 hour
**When** the reminder triggers
**Then** I receive email reminder

---

### Story 7.5: Reschedule/Cancel Notifications

As a **provider**,
I want **to be notified when clients reschedule or cancel**,
So that **I'm aware of schedule changes** (FR37).

**Acceptance Criteria:**

**Given** a client reschedules their booking
**When** the change is saved
**Then** provider receives email with old and new times

**Given** a client cancels their booking
**When** the cancellation is confirmed
**Then** provider receives email notification

---

## Epic 8: Admin Booking Reports

### Story 8.1: All Bookings View

As an **admin**,
I want **to see all bookings across providers**,
So that **I have full visibility** (FR51).

**Acceptance Criteria:**

**Given** I am logged in as admin
**When** I access All Bookings page
**Then** I see list with filters: date range, provider, service, status
**And** I can export to CSV

---

### Story 8.2: Admin Booking Management

As an **admin**,
I want **to manage any booking**,
So that **I can handle issues** (FR52).

**Acceptance Criteria:**

**Given** I select a booking
**When** I view details
**Then** I can reschedule on behalf of client
**And** I can cancel on behalf of client
**And** actions are logged with admin user

---

### Story 8.3: Basic Reports Dashboard

As an **admin**,
I want **to see booking statistics**,
So that **I can track business performance** (FR53).

**Acceptance Criteria:**

**Given** I access Reports page
**When** the dashboard loads
**Then** I see: total bookings (by period), cancellation rate, popular services, popular providers
**And** I can filter by date range

---

### Story 8.4: Email Template Configuration

As an **admin**,
I want **to configure email templates**,
So that **communications match our brand** (FR54).

**Acceptance Criteria:**

**Given** I access Email Settings
**When** I edit a template
**Then** I can customize subject and body
**And** I can use variables ({{client_name}}, {{service}}, etc.)
**And** I can preview before saving

---

## Epic 9: Group Classes & Capacity

### Story 9.1: Service Capacity Configuration

As an **admin**,
I want **to set max capacity for group classes**,
So that **bookings are limited appropriately** (FR45).

**Acceptance Criteria:**

**Given** I am editing a service with type "Class"
**When** I set max_capacity to 10
**Then** the value is saved to the service record
**And** only 10 clients can book that slot

---

### Story 9.2: Capacity Display in Widget

As a **client**,
I want **to see remaining spots for group classes**,
So that **I know if there's room** (FR9).

**Acceptance Criteria:**

**Given** I am viewing a group class slot
**When** 7 of 10 spots are booked
**Then** I see "3 spots remaining"

**Given** all spots are filled
**When** I view the slot
**Then** I see "Class Full" and cannot book

---

### Story 9.3: Group Class Booking

As a **client**,
I want **to book a spot in a group class**,
So that **I can attend with others** (FR17).

**Acceptance Criteria:**

**Given** I select a group class slot with availability
**When** I complete booking
**Then** my booking is created
**And** capacity count is incremented
**And** other clients can still book remaining spots

---

## Epic 10: Card Payment Integration

### Story 10.1: PayHere SDK Integration

As a **developer**,
I want **PayHere payment gateway integrated**,
So that **clients can pay by card** (FR22).

**Acceptance Criteria:**

**Given** PayHere credentials are configured
**When** the SDK is initialized
**Then** payment can be initiated
**And** sandbox mode works for testing

---

### Story 10.2: Pay Now Booking Flow

As a **client**,
I want **to pay for my booking immediately**,
So that **my appointment is confirmed instantly**.

**Acceptance Criteria:**

**Given** I am on the booking confirmation step
**When** I select "Pay Now"
**Then** PayHere payment modal opens
**And** I can enter card details

**Given** payment succeeds
**When** webhook is received
**Then** booking status is set to APPROVED
**And** confirmation email is sent immediately

---

### Story 10.3: Payment Failure Handling

As a **client**,
I want **graceful handling if payment fails**,
So that **I can retry or choose Pay Later** (FR25).

**Acceptance Criteria:**

**Given** my card payment fails
**When** error is returned
**Then** I see friendly error message
**And** I can retry with different card
**Or** I can switch to Pay Later option

---

### Story 10.4: Payment Confirmation

As a **client**,
I want **payment confirmation**,
So that **I know the transaction succeeded** (FR26).

**Acceptance Criteria:**

**Given** payment succeeds
**When** confirmation is displayed
**Then** I see payment amount and transaction ID
**And** I receive email receipt

---

<!-- All MVP epic stories complete -->

---

## Epic 11: Client Records & Private Notes
**Goal:** Secure, private record-keeping for providers and owners, ensuring medical-grade privacy for sensitive client notes.

**User Outcome:** Providers can safely document session notes knowing they are private to them and the company owner.

### Story 11.1: Client Notes Schema & Security
**Goal:** Create the database structure for private notes with strict Author-Only visibility laws.

**Acceptance Criteria:**
**Given** the database is configured
**When** the migration runs
**Then** a `client_notes` table is created with:
*   `id` (uuid, PK)
*   `client_id` (uuid, FK users)
*   `author_id` (uuid, FK users - The Provider)
*   `note_text` (text, encrypted at rest if possible)
*   `created_at`, `updated_at`
*   `tenant_id` (uuid)

**RLS Security Policy (CRITICAL - Author-Only):**
**Given** a user queries `client_notes`
**Then** they can ONLY see rows where:
*   `author_id` == `auth.uid()` (They wrote it - the specific provider who created the note)
*   **No other role (owner, admin, team member) can access these notes.**
*   Future: Optional `shared_with_client` boolean to allow the author to share a note with the specific client.

### Story 11.2: Note UI - Timeline View
**Goal:** Display notes in a timeline format on the Client Detail profile.

**Acceptance Criteria:**
**Given** I am a Provider viewing a Client
**When** I access the "Notes" tab
**Then** I see a chronological timeline of notes I have written
**And** I see a "Add Note" text area

**Given** I add a note
**When** I click save
**Then** it appears instantly in the timeline with timestamp

**Given** I am an Admin (Non-Owner)
**When** I view the same Client
**Then** the "Notes" tab is either:
*   Hidden entirely
*   Or shows "No permission to view private notes" (if tab structure is fixed)

---
---

# New Stories (User Flow v3 Gap Analysis - 2026-01-24)

The following stories were identified through the comprehensive gap analysis of User Flow v3 against the existing codebase, database schema, and UI implementation.

---

## Schema & Foundation Stories

### Story 1.8.1: Owner Role Schema Update [DONE]

As a **system**,
I want **the 'owner' role to be distinct from 'admin' in the database**,
So that **ownership-specific actions (delete company, transfer ownership) can be enforced**.

**Acceptance Criteria:**

**Given** the roles CHECK constraint exists on users table
**When** the migration runs
**Then** the constraint is updated to: `roles <@ ARRAY['owner','admin','provider','client']`

**Given** a new user signs up (no invitation)
**When** `handle_new_user()` trigger fires
**Then** the user is assigned `roles: ['owner']` (not 'admin')
**And** a new tenant is created

**Given** an existing tenant
**When** checking role hierarchy
**Then** owner > admin > provider > client
**And** owner has all admin permissions plus: delete company, delete members, transfer ownership

**Given** I am an admin (not owner)
**When** I try to delete the company or other team members
**Then** the action is denied (API returns 403)

**Migration:**
```sql
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_roles_check;
ALTER TABLE public.users ADD CONSTRAINT users_roles_check
  CHECK (roles <@ ARRAY['owner','admin','provider','client']::text[]);
```

---

### Story 2.0.3: Tenant Payment & Configuration Fields [DONE]

As an **owner**,
I want **to configure payment payout details and company-level booking settings**,
So that **the SAAS platform can process payouts and booking defaults are set**.

**Acceptance Criteria:**

**Given** I am on Settings > Payments
**When** the page loads
**Then** I see a form with:
- Bank Name (text, required for payout)
- Account Number (text, required)
- Account Holder Name (text, required)
- Branch / Branch Code (text, optional)
- Pay Later Enabled (toggle, default: true)
- Pay Later Mode (select: auto_confirm / pending_approval, default: pending_approval)
- Payment status indicator (Bank Details Saved / Not Configured)

**Given** I am on Settings > Company Info
**When** I view company settings
**Then** I also see:
- Business Category/Industry (text/select)
- Slot Interval (select: 5/10/15/20/30/45/60 minutes, default: 15)

**Given** I save bank details
**When** all required fields are filled
**Then** the data is saved to the tenants table
**And** I see "Bank Details Saved" indicator

**Schema Migration:**
```sql
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS business_category TEXT,
  ADD COLUMN IF NOT EXISTS slot_interval_minutes INTEGER DEFAULT 15
    CHECK (slot_interval_minutes IN (5, 10, 15, 20, 30, 45, 60)),
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_holder TEXT,
  ADD COLUMN IF NOT EXISTS bank_branch TEXT,
  ADD COLUMN IF NOT EXISTS pay_later_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS pay_later_mode TEXT DEFAULT 'pending_approval'
    CHECK (pay_later_mode IN ('auto_confirm', 'pending_approval'));
```

---

### Story 2.1.1: Service Extended Fields Migration [DONE]

As a **developer**,
I want **extended service configuration fields in the database**,
So that **services can support pricing types, location, booking policies, and pay later settings as defined in User Flow v3**.

**Acceptance Criteria:**

**Given** the services table exists
**When** the migration runs
**Then** the following columns are added:
- `pricing_type` TEXT DEFAULT 'fixed' CHECK IN ('free', 'fixed', 'variable', 'starting_from')
- `location_type` TEXT DEFAULT 'in_person' CHECK IN ('in_person', 'virtual', 'both')
- `virtual_meeting_url` TEXT
- `min_notice_hours` INTEGER DEFAULT 24
- `max_future_days` INTEGER DEFAULT 60
- `cancellation_hours` INTEGER DEFAULT 24
- `auto_confirm` BOOLEAN DEFAULT true
- `visibility` TEXT DEFAULT 'public' CHECK IN ('public', 'private')
- `pay_later_enabled` BOOLEAN
- `pay_later_mode` TEXT CHECK IN ('auto_confirm', 'pending_approval')
- `custom_url_slug` TEXT UNIQUE per tenant
- `show_price` BOOLEAN DEFAULT true
- `show_duration` BOOLEAN DEFAULT true
- `require_account` BOOLEAN
- `confirmation_message` TEXT
- `redirect_url` TEXT

**Given** the service.create tRPC procedure exists
**When** the input schema is updated
**Then** all new fields are accepted as optional inputs
**And** defaults are applied for omitted fields

**Given** the service.update tRPC procedure exists
**When** updated
**Then** all new fields can be partially updated

---

### Story 2.1.2: Service Schedule Tables [DONE]

As a **developer**,
I want **database tables for service-level availability schedules**,
So that **Layer 1 of the 4-layer availability engine can query when a service operates**.

**Acceptance Criteria:**

**Given** the services table exists
**When** the migration runs
**Then** a `service_schedules` table is created with:
- `id` (uuid, PK)
- `service_id` (uuid, FK services, ON DELETE CASCADE)
- `tenant_id` (uuid, FK tenants, ON DELETE CASCADE)
- `day_of_week` (INTEGER, CHECK 0-6, 0=Sunday)
- `start_time` (TIME, NOT NULL)
- `end_time` (TIME, NOT NULL)
- `is_available` (BOOLEAN, DEFAULT true)
- `created_at`, `updated_at`

**And** a `service_schedule_overrides` table is created with:
- `id` (uuid, PK)
- `service_id` (uuid, FK services, ON DELETE CASCADE)
- `tenant_id` (uuid, FK tenants, ON DELETE CASCADE)
- `override_date` (DATE, NOT NULL)
- `start_time` (TIME, nullable)
- `end_time` (TIME, nullable)
- `is_available` (BOOLEAN, NOT NULL, DEFAULT false)
- `reason` (TEXT)
- `created_at`, `updated_at`

**And** RLS policies enforce tenant isolation on both tables
**And** indexes exist for efficient queries (service_id + day_of_week, service_id + override_date)

**And** constraint: `start_time < end_time` on both tables
**And** unique constraint on service_schedules: (service_id, day_of_week, start_time, end_time)

---

### Story 2.4.4b: Team & Provider Extended Fields [DONE]

As a **developer**,
I want **extended fields on users, team_invitations, and providers tables**,
So that **team management and provider configuration match User Flow v3 requirements**.

**Acceptance Criteria:**

**Given** the users table exists
**When** the migration runs
**Then** the following columns are added:
- `position` TEXT (display-only job title)
- `is_active` BOOLEAN DEFAULT true (active/inactive toggle)

**Given** the team_invitations table exists
**When** the migration runs
**Then** the following columns are added:
- `name` TEXT (invitee's name, pre-fill)
- `phone` TEXT (invitee's phone)
- `position` TEXT (invited position)

**Given** the providers table exists
**When** the migration runs
**Then** the following columns are added:
- `specialization` TEXT (area of expertise)
- `schedule_autonomy` TEXT DEFAULT 'self_managed' CHECK IN ('self_managed', 'approval_required')

**Given** a team invitation is accepted
**When** the user record is created
**Then** `users.position` is populated from `team_invitations.position`
**And** `users.full_name` is populated from `team_invitations.name` (if not already set)

---

## UI Pattern Stories

### Story 2.9.2: List-Detail Split View Component [DONE]

As a **user on any admin/provider page**,
I want **a consistent list-to-detail interaction pattern**,
So that **I can browse items and view details without losing context**.

**Acceptance Criteria:**

**Desktop (≥1024px):**
**Given** I am on a list page (Team, Providers, Services, Clients)
**When** I click an item
**Then** the list pane compresses to ~35% width on the left
**And** a detail panel slides in from the right (~65% width)
**And** the sidebar collapses to icon-only mode
**And** an X button appears in the detail panel header

**Given** I click the X button
**When** the detail closes
**Then** the list expands back to full width
**And** the sidebar expands back to full labels

**Mobile (<768px):**
**Given** I am on a list page
**When** I tap an item
**Then** the detail view pushes in as full-screen
**And** an X/Back button is visible at top-left

**Given** I tap the X/Back button
**When** the detail closes
**Then** I return to the list view

**Component API:**
```typescript
<ListDetailSplitView
  list={<TeamList />}
  detail={selectedItem ? <TeamMemberDetail id={selectedItem.id} /> : null}
  onClose={() => setSelectedItem(null)}
/>
```

**Animation:** Use Framer Motion for slide transitions (200ms ease-out)

---

### Story 2.9.3: Horizontal Tab Component [DONE]

As a **user**,
I want **a consistent tabbed interface for detail views**,
So that **I can navigate between different aspects of an item**.

**Acceptance Criteria:**

**Given** a tabbed section has ≤3 tabs
**When** viewed on any screen size
**Then** all tabs are fully visible

**Given** a tabbed section has 4+ tabs
**When** viewed on mobile (<768px)
**Then** tabs are horizontally scrollable
**And** a subtle gradient/shadow on the right edge indicates more tabs

**Given** I click/tap a tab
**When** the content switches
**Then** the active tab is visually highlighted (underline + bold)
**And** content transitions smoothly (no page reload)

**Component API:**
```typescript
<HorizontalTabs
  tabs={[
    { id: 'details', label: 'Details', content: <DetailsTab /> },
    { id: 'permissions', label: 'Permissions', content: <PermissionsTab /> },
    { id: 'activity', label: 'Activity', content: <ActivityTab /> },
  ]}
  defaultTab="details"
/>
```

---

### Story 2.9.4: Search & Filter Bar Component [DONE]

As a **user viewing any list**,
I want **to quickly search and filter items**,
So that **I can find what I need efficiently**.

**Acceptance Criteria:**

**Given** a list has search enabled
**When** I type in the search field
**Then** the list filters in real-time (debounced 300ms)
**And** matching text is highlighted in results

**Given** a list has filter dropdowns
**When** I select a filter option
**Then** the list filters immediately
**And** active filters show as chips/badges
**And** I can clear individual filters or "Clear All"

**Component API:**
```typescript
<SearchFilterBar
  searchPlaceholder="Search by name or email..."
  filters={[
    { id: 'status', label: 'Status', options: ['Active', 'Inactive'] },
    { id: 'service', label: 'Service', options: services },
  ]}
  onSearch={(query) => setSearchQuery(query)}
  onFilter={(filters) => setActiveFilters(filters)}
/>
```

---

## Admin Navigation & Layout Stories

### Story 2.8.4: Admin Sidebar Restructure ✅ DONE

As an **owner/admin**,
I want **the sidebar to reflect the User Flow v3 navigation structure**,
So that **I can access all management modules logically**.

**Acceptance Criteria:**

**Given** I am logged in as owner/admin
**When** I view the sidebar
**Then** I see the following items in order:
1. Dashboard
2. Appointments (only visible if user also has 'provider' role)
3. Services
4. Team
5. Providers
6. Clients
7. Booking Pages
8. Settings
9. ─── (separator)
10. Profile

**Given** I am logged in as provider only
**When** I view the sidebar
**Then** I see:
1. Appointments
2. Schedule
3. Clients
4. ─── (separator)
5. Profile

**Given** I have dual role (admin + provider)
**When** I view the sidebar
**Then** I see the merged view (admin items + Appointments + Schedule under Profile)

**Given** the old sidebar exists
**When** this story is implemented
**Then** "Widget" is renamed to "Booking Pages"
**And** "Company" standalone page is removed (content moved to Settings > Company Info)
**And** "Settings" standalone page is replaced with tabbed version (Story 2.8.7)
**And** "Bookings" is removed (replaced by "Appointments" for providers)

---

### Story 2.8.5: Admin Providers Page

As an **owner/admin**,
I want **a dedicated Providers page in the admin area**,
So that **I can manage all service providers separately from team members**.

**Acceptance Criteria:**

**Given** I navigate to Providers in the sidebar
**When** the page loads
**Then** I see a list of all providers with: profile photo, name, assigned services, status (Active/Pending/Inactive)
**And** I see a search bar at the top
**And** I see an "Add New Provider" button

**Given** I click a provider in the list
**When** the detail panel opens (ListDetailSplitView)
**Then** I see tabbed content:
- Tab 1: **Details** (name, email, phone, bio, specialization, photo, schedule autonomy setting)
- Tab 2: **Services** (assigned services list with add/remove)
- Tab 3: **Schedule/Availability** (weekly schedule view + overrides)
- Tab 4: **Appointments** (upcoming/past bookings - after Epic 3)
- Tab 5: **Clients** (client list without private notes - after Epic 3)

**Given** I am in the Details tab
**When** I edit fields
**Then** changes save inline (auto-save or explicit save button)

**Given** I click "Add New Provider"
**When** the form opens
**Then** I see: Name (required), Email (required), Mobile (optional), Specialization (optional), Services (multi-select, optional), Schedule Autonomy (select)
**And** clicking "Send Invitation" sends email and adds provider as Pending

---

### Story 2.8.6: Admin Clients Page

As an **owner/admin**,
I want **a global view of all clients across all providers**,
So that **I can manage client relationships and view booking history**.

**Pre-requisite:** Epic 3 (bookings table must exist for meaningful data)

**Acceptance Criteria:**

**Given** I navigate to Clients in the sidebar
**When** the page loads
**Then** I see a list of all clients with: name, email, phone, total bookings, last booking date, status (Active/Inactive)
**And** I see search bar (name, email, phone)
**And** I see filters: Service, Provider, Recency (Active/Lapsed), Booking count (New/Returning/Frequent)

**Given** I click a client
**When** the detail panel opens
**Then** I see tabbed content:
- Tab 1: **Details** (contact info, account status)
- Tab 2: **Bookings** (full history across all providers and services)
- Tab 3: **Payments** (payment history, transaction records)

**Given** I view a client's bookings
**When** filtering by provider or service
**Then** the list narrows appropriately

---

### Story 2.8.7: Settings Page (Tabbed) ✅ DONE

As an **owner/admin**,
I want **a unified Settings page with sub-tabs**,
So that **all configuration is in one logical place**.

**Acceptance Criteria:**

**Given** I navigate to Settings in the sidebar
**When** the page loads
**Then** I see horizontal sub-tabs:
1. **Company Info** (name, slug, timezone, currency, slot interval, business category, address, contact info, business hours)
2. **Branding** (logo, primary colour, secondary colour, background, text colour, preview)
3. **Payments** (bank details, pay later defaults, payment status indicator)
4. **Notifications** (email templates list, enable/disable, timing config - Story 8.4)
5. **Permissions** (default permission sets, role configuration)

**Given** I am on Company Info tab
**When** I edit and save
**Then** the existing CompanyProfileForm + BusinessHoursForm content is used

**Given** I am on Branding tab
**When** I edit and save
**Then** the existing BrandingForm content is used

**Given** I am on Payments tab
**When** I see the form
**Then** it shows all fields from Story 2.0.3

**Given** I switch between tabs
**When** I have unsaved changes
**Then** I see a warning "You have unsaved changes"

---

### Story 2.8.8: Profile Page (All Roles) ✅ DONE

As a **user of any role**,
I want **a Profile page to manage my personal information**,
So that **I can update my details and preferences**.

**Acceptance Criteria:**

**Given** I am any authenticated user (owner, admin, provider)
**When** I navigate to Profile
**Then** I see a form with:
- Display Name
- Profile Photo (FileUpload component)
- Email (read-only, shows current)
- Phone
- Password change (current + new + confirm)

**Given** I am a dual-role user (admin + provider)
**When** I view Profile
**Then** I see an additional sub-tab: **My Schedule/Availability**
**And** this sub-tab shows the same availability editor as Story 2.7.1
**And** it manages my own provider schedule (provider_schedules + schedule_overrides)
**And** Google Calendar connection option is available here

**Given** I am a provider-only user
**When** I view Profile
**Then** I see additional fields: Bio/About, Notification preferences

**Given** I update my profile photo
**When** the upload completes
**Then** `users.avatar_url` is updated
**And** the new photo appears immediately in the sidebar/header

**API Requirements:**
- New `profile.getOwn` query (protectedProcedure)
- New `profile.updateOwn` mutation (protectedProcedure)
- New `profile.updatePhoto` mutation (protectedProcedure)

---

## Service & Provider Feature Stories

### Story 2.3.1: Service Setup Tabbed Portal ✅ DONE

As an **owner/admin**,
I want **a full-page tabbed service setup experience**,
So that **I can configure all aspects of a service in a structured flow**.

**Acceptance Criteria:**

**Given** I click "Add Service" or edit an existing service
**When** the portal opens
**Then** I see a full-page view (not modal) with 3 tabs:
- Tab 1: **Basics & Settings**
- Tab 2: **Schedule & Provider Assignment**
- Tab 3: **Booking Page Configuration**

**Tab 1: Basics & Settings**
**Given** I am on the first tab
**When** I fill in details
**Then** I see all fields from User Flow v3 Section 6.2 Tab 1:
- Service name (required)
- Category (select/create)
- Description (rich text)
- Duration (minutes, required)
- Buffer before/after (minutes)
- Pricing type (Free/Fixed/Variable/Starting from)
- Price (conditional on pricing type)
- Currency (default from company)
- Location type (In-person/Virtual/Both)
- Virtual meeting URL (conditional)
- Max attendees (default: 1)
- Booking window (min notice hours + max future days)
- Cancellation policy (hours)
- Auto-confirm (toggle)
- Visibility (Public/Private)
- Pay Later enabled (toggle)
- Pay Later mode (auto-confirm/pending approval)

**Tab 2: Schedule & Provider Assignment**
**Given** I am on the second tab
**When** I configure the schedule
**Then** I see:
- Available days (checkboxes for each day)
- Available hours per day (time range inputs)
- Break times (add recurring breaks)
- Provider assignment (dropdown of existing providers + team members with provider role)
- "Invite New Provider" button (triggers invitation email flow)
- Conflict detection banner (if assigned provider has overlapping schedules with other services)

**Tab 3: Booking Page Configuration**
**Given** I am on the third tab
**When** I configure the booking page
**Then** I see:
- Custom URL slug
- Public description
- Show price toggle
- Show duration toggle
- Require client account toggle
- Confirmation message (text area)
- Redirect URL after booking

**Navigation:**
- Tabs can be navigated in any order (not wizard-style)
- Save button persists all tabs' data
- Cancel returns to services list
- Edit mode pre-fills all fields

---

### Story 2.4.5: Team Member Detail View ✅ DONE

As an **owner/admin**,
I want **to view and manage team member details in a side panel**,
So that **I can see their info and configure permissions without leaving the list**.

**Acceptance Criteria:**

**Given** I am on the Team page
**When** I click a team member's name
**Then** the ListDetailSplitView opens with their detail panel
**And** I see tabbed content:

**Tab 1: Details**
- Profile photo (with upload/change)
- Full name
- Email (read-only)
- Phone
- Position
- Status (Active/Inactive toggle)
- Role badges
- Date joined

**Tab 2: Permissions**
- Granular permission toggles matching the JSONB structure:
  - Services: view, add, edit, delete
  - Providers: view, add, edit, delete
  - Bookings: view, manage
  - Team: view, invite, edit
  - Payments: view, refund
  - Company: edit
- Save button for permission changes

**Tab 3: Activity** (Phase 2 - show placeholder)
- "Coming soon" placeholder
- Future: chronological list of actions taken by this member

**API Requirements:**
- New `team.getById` query
- New `team.updatePermissions` mutation
- Extend `team.updateRoles` to validate owner-only restrictions

---

### Story 2.4.6: Enhanced Invite Form (v3 Aligned) ✅ DONE

As an **owner/admin**,
I want **the team invitation form to collect name, phone, and position**,
So that **invited members have pre-filled profiles on acceptance**.

**Acceptance Criteria:**

**Given** I click "Add Team Member"
**When** the inline form opens
**Then** I see:
- Name (required text input)
- Email (required email input)
- Mobile Number (optional)
- Position (optional text input, e.g., "Receptionist", "Manager")
- Send Email Invitation button

**Given** I do NOT see role checkboxes
**When** submitting the form
**Then** the invitation is created with default role = admin (matching v3: admin and team member are the same)
**And** system roles are assigned/adjusted separately via the Team Member Detail View (Story 2.4.5)

**Given** I submit with valid data
**When** the invitation is sent
**Then** the member appears in the Pending section
**And** name, phone, position are stored on the invitation record

**Given** the invitee accepts
**When** their account is created
**Then** `users.full_name` = invitation.name (if not overridden during signup)
**And** `users.phone` = invitation.phone
**And** `users.position` = invitation.position

---

### Story 2.4.7: Team List UI Enhancements ✅ DONE

As an **owner/admin**,
I want **the team list to show avatars, positions, active toggles, and search**,
So that **I can quickly find and manage team members**.

**Acceptance Criteria:**

**Given** I am on the Team page
**When** the list loads
**Then** I see two sections:
1. **Pending Invitations** (top, collapsible) - email, name, position, invited date, resend/cancel buttons
2. **Active Members** (below) - list of accepted members

**Given** I view an active member in the list
**When** the row renders
**Then** I see:
- Profile photo (or initials avatar if no photo)
- Full name
- Position (if set)
- Active/Inactive toggle switch
- (No date joined, no role badges in list - these are in detail view)

**Given** I toggle a member's active status
**When** I switch to inactive
**Then** `users.is_active` is set to false
**And** the member remains in the list but visually dimmed
**And** they cannot log in while inactive

**Given** I type in the search bar
**When** matching results exist
**Then** the list filters by name or position (client-side filter for <50 members)

---

### Story 6.0: Provider Layout Shell ✅ DONE

As a **provider**,
I want **a dedicated navigation layout when I'm logged in**,
So that **I can access my appointments, schedule, clients, and profile**.

**Acceptance Criteria:**

**Given** I am logged in with role = provider (only)
**When** I access the app
**Then** I am directed to `/provider/appointments`
**And** I see a sidebar with:
1. Appointments
2. Schedule
3. Clients
4. ─── (separator)
5. Profile

**Given** I am on mobile (<768px)
**When** I view the layout
**Then** the sidebar is a hamburger menu
**And** the navigation items are the same

**Given** I am a dual-role user (admin + provider)
**When** I access the app
**Then** I see the merged admin sidebar (Story 2.8.4) not the provider-only layout

**Technical Implementation:**
- New `ProviderLayoutShell` component (mirrors AdminLayoutShell pattern)
- New `/provider/` layout.tsx using ProviderLayoutShell
- Middleware routes provider-only users to `/provider/appointments`
- Dual-role users go to `/admin/dashboard`

---

### Story 6.1.1: Provider Profile Page

As a **provider**,
I want **to edit my public-facing profile**,
So that **clients see accurate information when booking with me**.

**Acceptance Criteria:**

**Given** I navigate to Profile in my sidebar
**When** the page loads
**Then** I see an editable form with:
- Display Name
- Bio/About (textarea, max 1000 chars)
- Profile Photo (FileUpload with preview)
- Phone
- Notification preferences (email on new booking, email on cancellation - toggles)

**Given** I update my photo
**When** the upload completes
**Then** `providers.photo_url` is updated
**And** the new photo is reflected in booking widgets

**Given** I update my bio
**When** I save
**Then** the bio is visible to clients on the booking page

**API:** Uses `provider.updateProfile` (already exists) + extend with notification prefs

---

### Story 6.5: Provider Schedule Self-Service

As a **provider**,
I want **to manage my own availability schedule**,
So that **I can set when I'm available for bookings**.

**Acceptance Criteria:**

**Given** I navigate to Schedule in my sidebar (or Profile > My Schedule for dual-role)
**When** the page loads
**Then** I see a weekly availability grid (Mon-Sun)
**And** I see my current recurring time blocks highlighted
**And** I see a section for date-specific overrides

**Given** I add a time block (e.g., Monday 9:00-17:00)
**When** I save
**Then** a record is created in `provider_schedules`
**And** if my schedule_autonomy = 'self_managed': change takes effect immediately, admin is notified
**And** if my schedule_autonomy = 'approval_required': change is pending, admin must approve

**Given** I add a date override (e.g., Jan 30: Unavailable, reason: "Holiday")
**When** I save
**Then** a record is created in `schedule_overrides`
**And** the date is visually marked in the calendar

**Given** I have Google Calendar connected
**When** I view my schedule
**Then** I see a notice: "Google Calendar events will also block your availability"
**And** I can click "Connect/Disconnect Google Calendar"

**Given** I view the combined calendar
**When** it renders
**Then** I see one calendar view showing:
- My availability blocks (green)
- Booked appointments overlaid (blue) - after Epic 3
- Google Calendar events (grey)
- Date overrides (orange)

**API Requirements:**
- New `schedule.getByProvider` (providerProcedure - provider can query own)
- New `schedule.updateSchedule` (providerProcedure)
- New `schedule.addOverride` (providerProcedure)
- New `schedule.removeOverride` (providerProcedure)
- If approval_required: notification sent to admin (Epic 7)

---

### Story 9.2.1: Booking Pages Configuration

As an **owner/admin**,
I want **to generate embed codes and direct booking links**,
So that **I can add booking capabilities to external websites or share links with clients**.

**Acceptance Criteria:**

**Given** I navigate to "Booking Pages" in the sidebar
**When** the page loads
**Then** I see two sub-tabs:
1. **Generate Embed Code**
2. **Generate Direct Link**

**Given** I am on either tab
**When** I configure the booking page
**Then** I see the same configuration interface:
- Service dropdown (optional - "All Services" if not selected)
- Provider dropdown (optional - "All Providers" if not selected, filtered by selected service)
- Theme (light/dark/minimal)
- Preview panel (live preview of the resulting booking page)

**Given** I am on "Generate Embed Code" tab
**When** I've configured options
**Then** I see a copyable iframe HTML snippet
**And** the snippet includes correct query params (tenant, service, provider, theme)
**And** a "Copy" button copies to clipboard with success toast

**Given** I am on "Generate Direct Link" tab
**When** I've configured options
**Then** I see a copyable URL (e.g., `app.scheduleapp.com/book?tenant=X&service=Y&provider=Z`)
**And** a "Copy" button copies to clipboard
**And** a "Open in New Tab" button tests the link

---

### Story 3.4.1: Pay Later Mode Configuration ✅ DONE

As an **owner/admin**,
I want **Pay Later behavior to be configurable per-service**,
So that **some services auto-confirm while others require my approval**.

**Pre-requisite:** Story 2.1.1 (service extended fields), Epic 3 (bookings)

**Acceptance Criteria:**

**Given** I am editing a service (Tab 1: Basics & Settings)
**When** I toggle "Pay Later Enabled" ON
**Then** I see a "Pay Later Mode" dropdown: Auto-confirm / Pending Approval
**And** default is inherited from company settings (Story 2.0.3)

**Given** a client books with "Pay Later" and service mode = Auto-confirm
**When** the booking is created
**Then** booking status = CONFIRMED immediately
**And** confirmation email sent to client
**And** provider is notified
**And** Google Calendar event created

**Given** a client books with "Pay Later" and service mode = Pending Approval
**When** the booking is created
**Then** booking status = PENDING
**And** client receives "Booking received, awaiting confirmation" email
**And** admin is notified of new pending booking
**And** no calendar event until approved

---

## Booking & Post-Booking Stories

### Story 5.5: Provider-Initiated Reschedule

As a **provider**,
I want **to reschedule a client's appointment**,
So that **I can adjust when I have conflicts or changes**.

**Pre-requisite:** Epic 3 (bookings), Epic 5 (client reschedule flow)

**Acceptance Criteria:**

**Given** I am viewing an upcoming appointment in my Appointments tab
**When** I click "Reschedule"
**Then** I see a date/time picker showing my available slots

**Given** I select a new time
**When** I confirm the reschedule
**Then** the booking date/time is updated
**And** client receives notification with new proposed time
**And** client can accept or request alternative
**And** Google Calendar event is updated

---

### Story 5.6: Provider-Initiated Cancellation

As a **provider**,
I want **to cancel a client's appointment when necessary**,
So that **the client is informed and can rebook**.

**Pre-requisite:** Epic 3, Epic 5

**Acceptance Criteria:**

**Given** I am viewing an upcoming appointment
**When** I click "Cancel"
**Then** I see a modal requiring a reason (text field, required)

**Given** I enter a reason and confirm
**When** the cancellation is processed
**Then** booking status = CANCELLED
**And** cancellation reason is stored
**And** client receives immediate notification with reason
**And** client is shown rebooking options (same provider different time, or different provider)
**And** Google Calendar event is deleted
**And** the time slot becomes available

---

### Story 6.6: Provider Appointments View

As a **provider**,
I want **to see my appointments in a structured view**,
So that **I can manage my daily schedule effectively**.

**Pre-requisite:** Epic 3 (bookings table)

**Acceptance Criteria:**

**Given** I navigate to Appointments in my sidebar
**When** the page loads
**Then** I see:
- Service filter dropdown at top (All Services / specific service)
- View toggle: Calendar view / List view
- Tabs: Upcoming | Past | Date Range

**Given** I am on the Upcoming tab
**When** bookings exist
**Then** I see a chronological list with: client name, service, date, time, status
**And** each item has actions: Mark Complete, Mark No-show, Reschedule, Cancel

**Given** I select Calendar view
**When** it renders
**Then** I see a weekly/daily calendar with appointments as blocks
**And** clicking an appointment shows details in a popover

**Given** I select Date Range tab
**When** I pick a custom range
**Then** I see all bookings within that period

---

### Story 6.7: Provider Client List & Notes

As a **provider**,
I want **to see my clients and add private notes**,
So that **I can track client history and prepare for sessions**.

**Pre-requisite:** Epic 3 (bookings for client discovery), Epic 11 (notes schema)

**Acceptance Criteria:**

**Given** I navigate to Clients in my sidebar
**When** the page loads
**Then** I see a list of all clients who have booked with me
**And** I see a filter dropdown for service (if I offer multiple)
**And** I see a search bar (name, email)

**Given** I click a client name
**When** the detail opens
**Then** I see:
- Client contact info (name, email, phone)
- Booking history (with this provider only)
- Personal Notes section

**Given** I am in the Notes section
**When** I click "Add Note"
**Then** I see a text area to write a free-form note
**And** saving adds it to a chronological timeline
**And** only I (the author) can see these notes
**And** no other user role can access them

---

### Story 8.5: Dashboard Stats & Activity Feed

As an **owner/admin**,
I want **the Dashboard to show meaningful statistics and recent activity**,
So that **I have an at-a-glance overview of business operations**.

**Pre-requisite:** Epic 3 (bookings data)

**Acceptance Criteria:**

**Given** I am on the admin Dashboard
**When** the page loads
**Then** I see:

**Quick Stats Cards (top row):**
- Bookings this week (count + trend ↑↓ vs last week)
- Pending confirmations (count, clickable → goes to pending list)
- Cancellations this week (count)
- Revenue this week (sum of confirmed paid bookings, if payments configured)

**Today's Schedule (section):**
- Timeline view of today's appointments across all providers
- Each entry: time, client name, provider name, service

**Upcoming Appointments (section):**
- Next 5 appointments with client, service, provider, time
- "View All" link → goes to bookings management

**Action Items (section):**
- Pending invitations count
- Unconfirmed bookings count
- Schedule conflicts (if any)
- Each item is clickable and navigates to the relevant page

**API Requirements:**
- New `admin.getDashboardStats` query (aggregation queries on bookings)
- New `admin.getRecentActivity` query

---

### Story 11.3: Client Management Admin API

As a **developer**,
I want **API endpoints for managing clients**,
So that **the admin Clients page can query and display client data**.

**Pre-requisite:** Epic 3 (bookings create client relationships)

**Acceptance Criteria:**

**Given** the bookings table has data
**When** `client.getAll` is called
**Then** it returns all users with role='client' in the tenant
**And** includes: name, email, phone, total bookings count, last booking date, primary provider

**Given** a search query is provided
**When** `client.search` is called
**Then** results filter by name, email, or phone (ILIKE matching)

**Given** filters are provided
**When** `client.getAll` is called with filters
**Then** results can be filtered by: service_id, provider_id, recency (days since last booking), booking_count range

**Given** a client ID is provided
**When** `client.getById` is called
**Then** it returns full client details + booking history + payment records

**Router:** New `clientRouter` with procedures: getAll, getById, search

---

## Widget & Booking Infrastructure Adjustments

### Story 3.2.1: Direct Link Generation Tab

As an **owner/admin**,
I want **to generate shareable direct booking links in addition to embed codes**,
So that **I can share booking URLs via email, social media, or messaging**.

**Pre-requisite:** Story 3.2 (Widget Configurator)

**Acceptance Criteria:**

**Given** I am on the Booking Pages page
**When** I switch to the "Generate Direct Link" tab
**Then** I see the same service/provider configuration as the embed tab
**And** the output is a URL instead of iframe code
**And** the URL format is: `{app_url}/book?tenant={id}&service={id}&provider={id}`

**Given** I click "Copy Link"
**When** the link is copied
**Then** I see a success toast
**And** the clipboard contains the full URL

**Given** I click "Open in New Tab"
**When** a new tab opens
**Then** it shows the booking page with selected configuration

