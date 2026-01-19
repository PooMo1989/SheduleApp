---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: ["docs/user_flow_requirements.md"]
date: 2026-01-13
author: PooMO
status: complete
---

# Product Brief: sheduleApp

## Executive Summary

**sheduleApp** is a modern, lightweight appointment scheduling platform designed for multi-provider service businesses. Starting as an internal solution for a wellness center (consultants, meditation gurus), it is architected from day one to scale as a SaaS product serving salons, clinics, and any business where multiple service providers need coordinated scheduling.

The platform delivers a **non-bloated, mobile-friendly booking experience** for clients, while providing Admins and Service Providers with powerful **responsive web-based dashboards** to manage services, availability, and business operations. A single unified web application (Next.js) serves all user roles.

---

## Core Vision

### Problem Statement

Multi-provider service businesses (wellness centers, salons, clinics, etc.) struggle to manage appointment scheduling efficiently. They face:
- **Double-bookings** due to lack of calendar synchronization
- **No-shows** without automated reminders
- **Manual coordination** between services, providers, and clients
- **Fragmented client experience** across booking, payment, and communication

Meanwhile, **clients** find it frustrating to:
- Navigate clunky booking systems
- Check availability across multiple providers
- Manage their appointment history

### Problem Impact

- Lost revenue from missed appointments and scheduling conflicts
- Poor client retention due to friction-filled booking experiences
- Administrative overhead consuming time that could be spent on service delivery
- Inability to scale operations without proportionally scaling admin staff

### Why Existing Solutions Fall Short

Current solutions like SimplyBook.me, Calendly, and Acuity offer scheduling, but often:
- Are feature-bloated with complex interfaces
- Lack seamless two-way Google Calendar sync
- Don't provide mobile-first admin experiences
- Require significant customization for multi-provider scenarios
- Have rigid pricing models that don't suit smaller operations

### Proposed Solution

**sheduleApp** provides:
- **For Clients:** A clean, mobile-friendly web app to discover services, check real-time availability, and book instantly
- **For Providers:** A responsive web dashboard to manage profiles, set availability, and sync with Google Calendar
- **For Admins:** Complete control over services, providers, permissions, and business insights via web interface

> **Platform Strategy (MVP):** All roles access the system via a single unified Next.js web application. Native mobile apps are deferred to Phase 2.

Built with **SaaS DNA** from day one—enabling any multi-provider business to deploy their own branded booking portal.

### Key Differentiators

| Differentiator | Description |
|----------------|-------------|
| Non-Bloated Design | Focused, clean UX without feature overload |
| Google Calendar Sync | Real-time two-way sync to prevent double-booking |
| Responsive Web-First | All users access via mobile-optimized web app (no app download required) |
| SaaS-Ready Architecture | Multi-tenant, white-label from the start |
| Flexible Payments | Pay now, pay later, deposits, refunds |

---

## Target Users

### Primary User 1: Client (Priya)

| Attribute | Details |
|-----------|---------|
| **Demographics** | Working-class corporate professionals |
| **Device** | Mobile phone (mobile-first design critical) |
| **Tech Comfort** | Low-moderate; need extremely simple flows |
| **Behavior** | Usually know which service they want |
| **Payment** | May prefer "Pay Later" – card payments can be friction |

**Success Moment:** "I booked my meditation session in under 2 minutes without calling anyone."

### Primary User 2: Service Provider (Ravi)

| Attribute | Details |
|-----------|---------|
| **Current Workflow** | Checks personal Google Calendar; admin reminds before sessions |
| **Desired Access** | Limited dashboard (NOT full admin) |
| **Needs** | Day/Month calendar view, client details, personal performance dashboard |
| **Boundary** | Should NOT see other providers' data |
| **Tech Comfort** | Mixed – some rely on Google Calendar sync only |

**Success Moment:** "I open the app and see exactly who I'm meeting today, without asking admin."

### Primary User 3: Admin (Anita)

| Attribute | Details |
|-----------|---------|
| **Pain Points** | Payment failures (client charged but booking fails), provider cancellations |
| **Current Scale** | Few services, 3 providers (scaling up) |
| **Key Reports** | Bookings count, cancellations by party |

**Success Moment:** "No more manual payment reconciliation – the system handles failed transactions gracefully."

### User Journeys

**Client Journey:**
Browse Services → Filter/Select → Choose Provider → View Availability Calendar → Pick Date → Select Timeslot → Login/Guest/Signup → Payment → Confirmation Email

**Provider Journey:**
Login (Web Dashboard) → View Today's Appointments → See Client Details → Check Calendar (synced with Google) → View Personal Dashboard

**Admin Journey:**
Login (Web Dashboard) → Manage Services/Providers → View All Bookings → Handle Exceptions → View Reports

---

## Service Types

### Type 1: One-on-One Consultations
- Single client books a single provider
- Standard appointment model

### Type 2: Group Classes
- Multiple clients can book the same session
- Same provider, same timeslot
- **Max capacity cap** per class
- Examples: Meditation classes, group workshops

---

## MVP Scope

> **Embed-First Strategy (2026-01-18):** Client booking is delivered via embeddable widgets integrated into business websites. Standalone discovery UI deferred to Phase 2.

### Core Features (Phase 1)

| Feature | User | Priority |
|---------|------|----------|
| Embeddable Booking Widget | Client | 🔴 Critical |
| 1:1 Consultation Booking | Client | 🔴 Critical |
| Group Class Booking (with capacity cap) | Client | 🔴 Critical |
| Sign-up / Login Authentication (SSO + email/password) | Client | 🔴 Critical |
| Pay Later with Admin Approval | Client | 🔴 Critical |
| Card Payment Integration (PayHere) | Client | 🔴 Critical |
| Email Confirmations & Reminders | Client/Provider | 🔴 Critical |
| Google Calendar Sync (Two-way) | Provider | 🔴 Critical |
| Service Management (Add/Edit/Assign) | Admin | 🔴 Critical |
| Provider Management (Add/Edit/Availability) | Admin | 🔴 Critical |
| Widget Configurator (embed code generation) | Admin | 🔴 Critical |
| Provider Web Dashboard (Calendar + Client Details) | Provider | 🟡 High |
| Admin Web Dashboard (All Bookings + Reports) | Admin | 🟡 High |
| Role-Based Permissions | Admin | 🟡 High |
| Cancellation & Rescheduling | Client/Admin | 🟡 High |

### Out of Scope for MVP (Phase 2)

| Feature | Reason |
|---------|--------|
| Recurring Appointments | Reduces MVP complexity |
| SMS Reminders (Twilio) | Email sufficient for pilot |
| Client Discovery UI | Embed-first strategy |
| Multi-location support | Not needed for initial center |
| Waitlist | Nice-to-have |
| Reviews/Ratings | Post-booking feature |
| Promo codes/Discounts | Marketing feature |
| Invoicing | Accounting integration |
| White-label/Custom branding | SaaS feature |
| API/Webhooks | Integration feature |

---

## Success Metrics

### User Success Metrics

| Metric | What It Measures | Target |
|--------|------------------|--------|
| Booking Completion Rate | % of users who start booking and finish | > 80% |
| Time to Book | How long from opening app to confirmed booking | < 3 minutes |
| Guest vs Signup Ratio | How many book as guests vs create accounts | Track trend |
| Repeat Booking Rate | % of clients who book again within 30 days | > 40% |

### Business Success Metrics

| Metric | What It Measures | Why It Matters |
|--------|------------------|----------------|
| Total Bookings/Week | Volume of appointments | Core business health |
| Cancellation Rate | % of bookings cancelled (by client or provider) | Revenue leakage indicator |
| No-Show Rate | % of missed appointments | Reminder effectiveness |
| Provider Utilization | % of available slots that are booked | Capacity optimization |
| Payment Success Rate | % of payments completed without issues | Addresses payment failure pain |
| Failed Payment Resolution Time | Time to resolve payment failures | Operational efficiency |

### MVP Launch Success Criteria

| Milestone | Definition |
|-----------|------------|
| ✅ Functional MVP | Clients can book 1:1 consultations AND group classes |
| ✅ Calendar Sync Works | Bookings appear in provider Google Calendars |
| ✅ Payments Flow | Card + Pay Later options work end-to-end |
| ✅ Admin Can Operate | Services, providers, and bookings are manageable |
| ✅ Internal Pilot | Center runs on sheduleApp for 2 weeks without critical issues |

---

## Future Vision

### Post-MVP Roadmap

**Phase 2: Native Mobile & SaaS Foundation**
- Native mobile companion app for Providers/Admins (iOS/Android)
- Multi-tenant architecture deployment
- White-label/Custom branding per tenant
- API access for integrations
- Webhook support

**Phase 3: Growth Features**
- Waitlist functionality
- Reviews and ratings system
- Promo codes and discounts
- SMS reminders

**Phase 4: Scale**
- Multi-location support
- Advanced analytics and forecasting
- Native mobile apps (iOS/Android)
- Third-party integrations (Stripe Connect, Zoom)

### Long-Term Vision
Transform sheduleApp into the go-to scheduling platform for multi-provider service businesses, enabling any wellness center, salon, clinic, or professional service firm to offer a premium booking experience without the complexity of enterprise solutions.
