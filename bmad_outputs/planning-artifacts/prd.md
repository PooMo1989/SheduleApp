---
stepsCompleted: ["step-01-init", "step-02-discovery", "step-03-success", "step-04-journeys", "step-05-domain", "step-06-innovation-skipped", "step-07-project-type", "step-08-scoping", "step-09-functional", "step-10-nonfunctional", "step-11-polish", "step-12-complete"]
status: complete
inputDocuments: ["bmad_outputs/planning-artifacts/product-brief-sheduleApp-2026-01-13.md"]
workflowType: 'prd'
documentCounts:
  briefCount: 1
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 0
classification:
  projectType: "SaaS Web Application"
  domain: "Scheduling / Appointment Booking"
  complexity: "Medium-High"
  projectContext: "greenfield"
---

# Product Requirements Document - sheduleApp

**Author:** PooMO
**Date:** 2026-01-14

---

## Success Criteria

### User Success

| User | Success Moment | Measurable Outcome |
|------|----------------|-------------------|
| Client (Priya) | "I booked without calling anyone!" | Booking completed in < 3 minutes |
| Provider (Ravi) | "I see my whole day at a glance!" | Zero missed appointments due to calendar confusion |
| Admin (Anita) | "Zero payment failures this week!" | Payment success rate > 99% |

**Key User Metrics:**
- Booking Completion Rate: > 80%
- Time to Book: < 3 minutes
- Repeat Booking Rate: > 40% within 30 days
- Guest vs Signup Ratio: Tracked for conversion optimization

### Business Success

| Metric | Target | Timeline |
|--------|--------|----------|
| Total Bookings/Week | Baseline + growth | Month 1+ |
| Cancellation Rate | < 10% | Month 1+ |
| No-Show Rate | < 5% | Month 2+ (with reminders) |
| Provider Utilization | > 70% | Month 3+ |
| Payment Success Rate | > 99% | Launch |

### Technical Success

| Metric | Target | Rationale |
|--------|--------|-----------|
| API Response Time | < 500ms | Fast calendar loading |
| Google Calendar Sync Latency | < 30 seconds | Real-time double-booking prevention |
| Payment Processing Uptime | > 99.9% | Zero failed transactions |
| Mobile Page Load | < 2 seconds | Mobile-first experience |
| System Uptime | > 99.5% | Reliable service |

### Measurable Outcomes

**MVP Success Gate (2-week internal pilot):**
- [ ] All 3 providers using the system daily
- [ ] At least 20 bookings completed without issues
- [ ] Zero double-bookings
- [ ] Payment success rate > 95%
- [ ] Admin can manage all operations without developer help

---

## Product Scope

### 🚨 MVP SCOPE UPDATE (2026-01-18)

**Embed-First Strategy:** MVP focuses on embeddable booking widgets that integrate into existing business websites. Client-facing discovery UI (service browsing, filtering) is handled by the company's own website and will be offered as template-based options in Phase 2.

**MVP Client Interface:** Embeddable calendar widget (`/embed/book`) configured per service+provider, embedded via iframe on business websites.

### MVP - Minimum Viable Product

**Client Features (via Embedded Widget):**
- Embeddable booking calendar widget
- Availability calendar view (4-layer filtered)
- 1:1 Consultation booking
- Group Class booking (with capacity cap)
- Signup/Login authentication (Google SSO + email/password)
- Pay Later payment option
- Card payment via PayHere (final epic)
- Email confirmations

**Admin Features:**
- **Modules:** Services, Classes, Service Providers (shared), Widget Configuration, Dashboard
- Widget Configurator (generate embed codes per service+provider)
- Service management (CRUD, assign providers)
- Provider management (CRUD, availability schedules, overrides)
- Google Calendar OAuth connection
- Pay Later approval workflow
- Role-based permissions
- All bookings view
- Basic reports (bookings, cancellations)

**Provider Features:**
- Responsive web dashboard
- Day/Month calendar view
- Client details for appointments
- Google Calendar sync (two-way)
- Personal performance dashboard

### Phase 2 Features (Deferred from MVP)

- **Client Discovery UI:** Template-based service browsing/filtering
- **Template-based booking pages:** Standalone sheduleApp portal for companies without websites
- **Recurring appointments:** Recurring booking and payment scheduling
- Waitlist functionality
- Reviews and ratings
- Promo codes/Discounts
- SMS reminders (Twilio integration)

### Vision (Future)

- Multi-tenant SaaS platform
- Multi-location support
- Native mobile apps (iOS/Android)
- Advanced analytics & forecasting
- Third-party integrations (Stripe Connect, Zoom)
- Marketplace for client discovery

---

## User Journeys

### Journey 1: Priya (Client) - Booking a Meditation Session

**Opening Scene:**
Priya, a 32-year-old marketing manager, just wrapped up a stressful client call. Her shoulders are tense. She remembers the meditation sessions at the wellness center but dreads calling to book.

**Rising Action:**
She opens the sheduleApp **web app** on her phone. Taps "Meditation" → sees Guru Ravi's photo → calendar shows tomorrow at 6 PM is available. She taps it. Prompted to sign in → Quick sign up with Google SSO → "Pay Later" → Done.

**Climax:**
Confirmation email arrives: "Your session with Ravi is confirmed for Tomorrow, 6 PM." Total time: under 2 minutes.

**Resolution:**
Priya feels relief. No phone tag. No waiting. Her account is created for easy future bookings.

**Requirements:** Service browsing, provider selection, calendar availability, registration/login (SSO), pay later, email confirmation.

---

### Journey 2: Ravi (Provider) - Starting His Day

**Opening Scene:**
Ravi, a meditation guru, wakes at 5:30 AM. He used to check three conflicting calendars.

**Rising Action:**
He opens the sheduleApp **mobile app**. Dashboard shows: "Today: 4 sessions." He taps "6 PM - Priya (First-time client)" → sees her contact details.

**Climax:**
His Google Calendar already has all entries synced. Notification: "New recurring booking: Client Meera, every Tuesday 7 AM."

**Resolution:**
Ravi knows exactly who's coming without asking admin.

**Requirements:** Provider dashboard, day view, client details, Google Calendar sync, recurring visibility.

---

### Journey 3: Anita (Admin) - Adding a New Service

**Opening Scene:**
Anita receives word: "We're adding Sound Healing sessions next week."

**Rising Action:**
Admin **mobile app** → Services → Add New → "Sound Healing, 90 min, ₹2,500, requires Sound Room" → Assigns provider Maya → Sets availability window.

**Climax:**
"Service Published." A client books the first session within minutes.

**Resolution:**
Service is live without IT involvement.

**Requirements:** Service CRUD, duration/pricing, resource assignment, provider assignment.

---

### Journey 4: Priya (Client) - Cancelling & Rescheduling

**Opening Scene:**
Priya's boss schedules an urgent meeting at 6 PM tomorrow—her booked session time.

**Rising Action:**
Opens confirmation email → "Manage Booking" → "Reschedule" → Wednesday 6 PM is available → Confirms.

**Climax:**
New confirmation email. Ravi gets notification. Google Calendar updates.

**Resolution:**
Graceful self-service without guilt.

**Requirements:** Client booking management, cancellation, rescheduling, provider notifications.

---

### Journey 5: Anita (Admin) - Adding a New Provider

**Opening Scene:**
A new yoga instructor, Maya, joins the center.

**Rising Action:**
Admin App → Providers → Add New → Name, Photo, Bio → **Set Recurring Availability:**
- Tue-Sat: 10:00-11:00, 3:00-4:00
→ **Add Exception:** May 19th: 9:00-11:00 (override)
→ **Link Google Calendar** → Publish

**Climax:**
Maya is now visible to clients booking yoga services.

**Requirements:** Provider CRUD, recurring availability builder, date-specific overrides, Google Calendar OAuth.

---

### Journey 6: Anita (Admin) - Adding a Group Class

**Opening Scene:**
The center wants "Group Meditation" with max 10 participants.

**Rising Action:**
Admin App → Services → Add New → "Group Meditation" → Type: **Class** → **Max Capacity: 10** → Duration: 60 min → Price: ₹500/person → Assign: Guru Ravi → Availability: Mon-Fri 6-7 PM

**Climax:**
Clients can now book the class; system shows "8/10 spots left."

**Requirements:** Service type (1:1 vs Class), max capacity, class booking logic (multiple clients, same slot).

---

### Journey 7: System - Availability Filtering Logic

**Behind the Scenes (When Client Opens Calendar):**

```
LAYER 1: Service Availability
└── Is Meditation available on this date? (Mon-Fri 8-5)

LAYER 2: Provider Recurring Schedule
└── Does Guru Ravi have a slot at this time? (10-11, 12-1)

LAYER 3: Provider Date Overrides
└── Any exceptions for this specific date?

LAYER 4: Google Calendar Real-Time Check
└── Is Ravi's Google Calendar free at this time?

FINAL RESULT:
└── Only show slots that pass ALL 4 layers
```

**Client Experience:**
Priya only sees slots that are **truly bookable**. No frustration from unavailable times.

**Requirements:** Multi-layer availability computation, real-time Google Calendar query, smart slot filtering.

---

### Journey Requirements Summary

| Journey | Key Capabilities |
|---------|------------------|
| Priya: Booking | Booking flow, guest checkout, pay later |
| Ravi: Daily View | Provider app, calendar sync, client details |
| Anita: New Service | Service CRUD, resources |
| Priya: Reschedule | Self-service cancellation, notifications |
| Anita: New Provider | Provider CRUD, availability builder, overrides |
| Anita: Group Class | Class type, capacity management |
| System: Filtering | 4-layer availability logic, Google Calendar integration |

---

## Domain-Specific Requirements

### Data Privacy & Compliance

| Requirement | Notes |
|-------------|-------|
| Client PII Protection | Name, email, phone, booking history stored securely |
| GDPR-like Practices | Data access/deletion requests, consent management |
| Payment Data | Never store raw card data; use tokenized gateway |

### Technical Constraints

| Constraint | Requirement |
|------------|-------------|
| Google Calendar API | OAuth 2.0, rate limit management (quota: ~1M requests/day) |
| Payment Gateway | PCI-compliant hosted checkout (Razorpay/Stripe) |
| Email Deliverability | SPF/DKIM, transactional email service (SendGrid, SES) |
| Availability Computation | Multi-layer logic; optimize for < 500ms response |
| Mobile-First Web | PWA-ready, responsive, < 2s load time |

### Integration Requirements

| System | Purpose | Technical Notes |
|--------|---------|-----------------|
| Google Calendar API | Two-way sync | OAuth 2.0, read/write events, webhook for changes |
| Payment Gateway | Card + Pay Later | Razorpay recommended for India; webhook confirmation |
| Email Service | Transactional | Confirmations, reminders; SendGrid/SES |
| SMS Gateway (Phase 2) | Text reminders | Twilio, MSG91 |

### Risk Mitigations

| Risk | Mitigation |
|------|------------|
| Double-booking | 4-layer availability check + DB transaction locking |
| Payment failures (charged but not booked) | Idempotent payment flow; webhook-based confirmation |
| Google Calendar API rate limits | Caching, batch sync, graceful degradation |
| No-shows | Automated reminders (24h, 1h before) |
| Data breach | Encryption at rest and in transit, access controls |

---

## SaaS Web Application Specific Requirements

### Multi-Tenancy & RBAC

| Requirement | Approach |
|-------------|----------|
| Multi-Tenancy | Single DB with tenant isolation (tenant_id on all tables) |
| Role-Based Access Control | Admin, Provider, Client roles with granular permissions |
| Data Isolation | Strict tenant separation; no cross-tenant data access |
| Onboarding | Quick tenant setup flow (for future SaaS expansion) |
| White-Label (Phase 2) | Custom branding per tenant |

### Technical Architecture Considerations

> **STRATEGIC DECISION (2026-01-15):** All user roles (Client, Provider, Admin) access the system via a single unified Next.js web application. Native mobile apps are deferred to Phase 2.

#### Unified Web Application
- Framework: **Next.js 14+** (App Router, Server Components)
- Mobile-First: Fully responsive, PWA-ready
- Performance: < 2s initial load, < 500ms interactions
- Offline: Basic caching via service worker; full offline mode deferred
- Auth: OAuth 2.0 (Google SSO), credentials-based login

#### Backend API
- Architecture: RESTful API (GraphQL optional)
- Auth: JWT tokens with refresh token rotation
- Real-Time: WebSockets for calendar updates (optional)
- Database: PostgreSQL (relational with JSONB flexibility)

### Implementation Considerations

| Area | Preliminary Direction |
|------|----------------------|
| State Management | Redux/Zustand; React Query for data fetching |
| Calendar Component | FullCalendar or custom React component |
| Availability Engine | Dedicated backend service for 4-layer computation |
| Payment Gateway | PayHere SDK with webhook handlers |
| Email Service | SendGrid or AWS SES with templating |
| Google Calendar | googleapis npm package, OAuth consent screen |

> **Note:** Technology choices will be critically evaluated in the Architecture workflow.

---

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-Solving MVP
- Focus on proving core booking + calendar sync solves double-booking problem
- Validate through 2-week internal pilot with 3 providers

**Resource Requirements:** 
- 1-2 full-stack developers (Next.js/TypeScript)
- 1 designer (UI/UX)
- 1 PM/Product Owner (can be shared role)

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
1. Priya: Complete 1:1 or Group booking flow
2. Ravi: View daily schedule with client details
3. Anita: Manage services and providers

**Must-Have Capabilities (Unified Web App):**
- **Client Features:** Service browsing (via embed), provider selection, 4-layer availability calendar, 1:1 + Group booking, Signup/Login (SSO + email/password), Card + Pay Later, Email confirmation
- **Provider Features:** Responsive web dashboard, day/month calendar, client details, Google Calendar sync
- **Admin Features:** Service CRUD, Provider CRUD (with availability builder + overrides), Booking management, Basic reports
- **System:** 4-layer availability filtering, Email reminders

### Post-MVP Features

**Phase 2 (Growth + Native Mobile):**
- **Native iOS/Android mobile apps for Provider/Admin**
- Waitlist functionality
- Reviews & Ratings
- Promo codes & Discounts
- SMS reminders
- Custom email templates
- Cancellation policies

**Phase 3 (SaaS Expansion):**
- White-label/Custom branding
- Multi-tenant onboarding
- API access & Webhooks
- Multi-location support
- Advanced analytics & reporting

### Risk Mitigation Strategy

| Risk Type | Risk | Mitigation |
|-----------|------|------------|
| **Technical** | Google Calendar API complexity | Start with read-only sync MVP; add write later |
| **Technical** | 4-layer availability performance | Optimize with caching; DB indexes |
| **Market** | User adoption friction | Internal pilot first; refine before external |
| **Technical** | Mobile web limitations (no push) | Implement SMS/WhatsApp notifications for critical events |

---

## Functional Requirements

> **CAPABILITY CONTRACT:** This section defines what will be built. If a capability is not listed here, it will NOT exist in the final product.

### 1. Service Discovery & Browsing

- **FR1**: Client can browse available services by category
- **FR2**: Client can view service details (duration, price, description)
- **FR3**: Client can filter services by type (Consultations vs Classes)
- **FR4**: Client can see available providers for each service

### 2. Provider Selection & Availability

- **FR5**: Client can view provider profiles (photo, bio, services offered)
- **FR6**: Client can view provider availability calendar (4-layer filtered)
- **FR7**: System filters availability by: Service window + Provider schedule + Date overrides + Google Calendar
- **FR8**: Client can only see slots that pass all 4 availability layers
- **FR9**: Client can see remaining capacity for Group Classes

### 3. Client Registration & Authentication

- **FR10**: All clients must register to book (no guest booking)
- **FR11**: Client can register with Email + Mobile + Password
- **FR12**: Client can register via Social Login (SSO - Google)
- **FR13**: Client can defer email verification until second booking
- **FR14**: Client can log in with existing credentials
- **FR15**: Client can reset password via email

### 4. Booking Management

- **FR16**: Client can book 1:1 consultation with a provider
- **FR17**: Client can book Group Class (with capacity enforcement)
- **FR18**: Registered Client can set up recurring appointments
- **FR19**: Client can reschedule an existing booking (via dashboard)
- **FR20**: Client can cancel an existing booking (via dashboard)
- **FR21**: Client can view booking history in personal dashboard

### 5. Payment Processing (PayHere Integration)

- **FR22**: Client can pay via Credit/Debit Card (PayHere SDK)
- **FR23**: Client can select "Pay Later" option
- **FR24**: Pay Later bookings are created as PENDING status
- **FR25**: System handles payment failures gracefully (idempotent)
- **FR26**: System sends payment confirmation to client
- **FR27**: System supports recurring payments for recurring appointments

### 6. Pay Later Approval Workflow

- **FR28**: Admin receives notification for Pay Later bookings
- **FR29**: Admin can view pending Pay Later bookings list
- **FR30**: Admin can approve pending bookings manually
- **FR31**: Admin can reject pending bookings with reason
- **FR32**: Confirmation emails and calendar sync only after admin approval

### 7. Notifications & Reminders

- **FR33**: System sends booking confirmation email to client (after approval if Pay Later)
- **FR34**: System sends booking notification to provider (after approval if Pay Later)
- **FR35**: System sends reminder email 24 hours before appointment
- **FR36**: System sends reminder email 1 hour before appointment
- **FR37**: System notifies provider of rescheduling/cancellation

### 8. Provider Dashboard

- **FR38**: Provider can view today's appointments
- **FR39**: Provider can view day/month calendar view
- **FR40**: Provider can see client details for each booking
- **FR41**: Provider can see personal performance metrics
- **FR42**: System syncs bookings to provider's Google Calendar (two-way)

### 9. Service & Provider Administration

- **FR43**: Admin can create/edit/delete services
- **FR44**: Admin can create services within respective modules (Consultations or Classes)
- **FR45**: Admin can set service capacity (for Group Classes)
- **FR46**: Admin can assign providers to services
- **FR47**: Admin can create/edit/delete providers
- **FR48**: Admin can set provider recurring availability schedule
- **FR49**: Admin can set provider date-specific overrides/exceptions
- **FR50**: Admin can link provider's Google Calendar (OAuth)

### 10. Booking Administration

- **FR51**: Admin can view all bookings
- **FR52**: Admin can manage cancellations and rescheduling
- **FR53**: Admin can view basic reports (bookings count, cancellations)
- **FR54**: Admin can configure email templates

### 11. Authorization & Data Isolation

- **FR55**: System supports role-based access (Admin, Provider, Client)
- **FR56**: Providers can only see their own data (not other providers')
- **FR57**: System enforces tenant data isolation (for SaaS)

### 12. Modular Architecture

- **FR58**: System supports modular design (Consultations module, Classes module)
- **FR59**: SaaS admin can enable/disable modules per tenant
- **FR60**: Provider list is shared across modules

---

## Non-Functional Requirements

### Performance

| NFR | Requirement |
|-----|-------------|
| NFR1 | Page load time < 2 seconds on mobile 3G |
| NFR2 | Calendar availability response < 500ms |
| NFR3 | Booking confirmation < 3 seconds end-to-end |
| NFR4 | System handles 100 concurrent users (MVP) |

### Security

| NFR | Requirement |
|-----|-------------|
| NFR5 | All data encrypted in transit (TLS 1.2+) |
| NFR6 | All data encrypted at rest (AES-256) |
| NFR7 | Payment data never stored; use PayHere tokenization |
| NFR8 | Google OAuth tokens stored securely (refresh token rotation) |
| NFR9 | Role-based access enforced at API level |
| NFR10 | Session timeout after 30 minutes of inactivity |

### Scalability

| NFR | Requirement |
|-----|-------------|
| NFR11 | Architecture supports 10x user growth without redesign |
| NFR12 | Database supports multi-tenant isolation |
| NFR13 | Stateless API design for horizontal scaling |

### Reliability

| NFR | Requirement |
|-----|-------------|
| NFR14 | System uptime > 99.5% (excluding scheduled maintenance) |
| NFR15 | No data loss on payment or booking transactions |
| NFR16 | Graceful degradation if Google Calendar API is unavailable |

### Integration

| NFR | Requirement |
|-----|-------------|
| NFR17 | Google Calendar sync latency < 30 seconds |
| NFR18 | PayHere webhook processing < 5 seconds |
| NFR19 | Email delivery within 1 minute of trigger |

<!-- Content will be appended sequentially through collaborative workflow steps -->
