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
epic_count: 10
story_count: 52
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
- FR10: All clients must register to book (no guest booking)
- FR11: Client can register with Email + Mobile + Password
- FR12: Client can register via Social Login (SSO - Google)
- FR13: Client can defer email verification until second booking
- FR14: Client can log in with existing credentials
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

### Story 1.4: User Registration (Email/Password)

As a **client**,
I want **to register with my email, mobile, and password**,
So that **I can create an account to book appointments** (FR11).

**Acceptance Criteria:**

**Given** I am on the registration page
**When** I enter valid email, mobile number, and password
**Then** my account is created in Supabase Auth
**And** a user record is created in the `users` table with `role: 'client'`
**And** the user is associated with the correct tenant
**And** I am redirected to the dashboard
**And** a welcome message is displayed

**Given** I enter an email that already exists
**When** I submit the registration form
**Then** I see an error message "Email already registered"
**And** no duplicate account is created

**Given** I enter a password less than 8 characters
**When** I submit the form
**Then** I see a validation error "Password must be at least 8 characters"

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

### Story 2.0: Admin Company Profile Setup

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

### Story 2.1: Services & Providers Database Schema

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

### Story 2.2: Provider Availability Schema

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

### Story 2.3: Admin Service CRUD

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

### Story 2.4: Team Invitations & Member Management

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
**Then** they are added to the company as a "Staff" member
**And** they appear in the Admin's Team list (status: Active)

**Given** I view the Team list
**When** a user has not accepted yet
**Then** I see their status as "Invited"
**And** I can "Resend Invitation"

---

### Story 2.5: Role Assignment & Provider Linking

As an **admin**,
I want **to assign roles (Provider/Admin) to team members**,
So that **they can perform their duties or be booked for services**.

**Acceptance Criteria:**

**Given** a staff member exists in the Team list
**When** I select "Promote to Admin"
**Then** they gain admin privileges (can invite others, manage settings)

**Given** a staff member exists
**When** I select "Make Provider"
**Then** a Provider Profile is created for them
**And** I can edit their Bio, Photo, and Display Name
**And** I can assign them to specific Services (from Story 2.3)
**And** I can set their Availability Schedule (Story 2.7)

**Given** a user is now a Provider
**When** I view the "Services" page
**Then** they appear as an available provider for their assigned services

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
**And** I see "Awaiting Admin Approval" status
**And** I see "You will receive an email once confirmed"

**Given** I am on the confirmation screen
**When** I click "View My Bookings"
**Then** I am redirected to my bookings dashboard

---

### Story 3.6: Inline Registration During Booking

As a **new client who hasn't registered yet**,
I want **to create my account as part of the booking process**,
So that **I can book an appointment without a separate registration step** (FR10, FR11, FR13).

**Acceptance Criteria:**

**Given** I am NOT logged in and have selected a time slot
**When** I click "Book this slot"
**Then** I see a combined registration + booking confirmation page
**And** the page shows my selected service, provider, date/time at the top
**And** I see registration fields: Name, Phone, Email, Password, Confirm Password
**And** I see "Continue with Google" as an alternative
**And** I see "Proceed to Payment" CTA button

**Given** I am filling out the inline registration form
**When** I selected a slot
**Then** the slot is temporarily held for 10 minutes
**And** a countdown timer is visible showing remaining hold time
**And** other users see this slot as unavailable

**Given** I enter an email that already exists
**When** I blur the email field
**Then** I see message: "This email is already registered"
**And** I see link: "Already have an account? Sign in"

**Given** I filled all fields correctly
**When** I click "Proceed to Payment"
**Then** user account created with `email_verified: false`
**And** user automatically logged in (session created)
**And** temporary slot hold converted to pending booking
**And** redirected to payment page

**Given** the tenant has `allow_guest_checkout: true` in settings
**When** a new client books
**Then** password fields are optional
**And** "Book as Guest" option appears
    **And** guest can "claim" their bookings by registering later
    
    ---

    ### Story 3.7: Hybrid Auth Infrastructure & Inline Auto-Confirm

    As a **system admin**,
    I want **clients registering via the booking widget to be automatically verified**,
    So that **they experience no friction, even though global email verification is enabled for security**.

    **Acceptance Criteria:**

    **Given** "Confirm Email" is enabled globally in Supabase (Story 2.2 prerequisite)
    **When** a client registers through the "Inline Booking" flow (Story 3.6)
    **Then** the backend (via Server Action/TrPC) automatically sets `email_confirmed_at` to `now()` using the Service Role key
    **And** the client is logged in immediately without needing to check email
    
    **Given** a user registers via the /register page (Public) or /admin/invite (Private)
    **When** they sign up
    **Then** they are **NOT** auto-confirmed (Standard strict flow applies)
    **And** they must verify email or accept invite to login

    ---

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

### Story 7.1: Booking Confirmation Email

As a **client**,
I want **to receive email confirmation after booking**,
So that **I have a record of my appointment** (FR33).

**Acceptance Criteria:**

**Given** my booking is APPROVED
**When** the approval is processed
**Then** I receive email with: service, provider, date/time, location
**And** email includes calendar attachment (.ics)

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

