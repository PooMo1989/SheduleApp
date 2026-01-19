# sheduleApp - Complete Requirements Capture

---

## 1. VISION & GOALS

### Initial Use Case
- Use for the user's center first (consultants, meditation gurus)

### SaaS Potential
- Introduce as a SaaS product to similar service provider places:
  - Consultation centers
  - Salons
  - (To be expanded with competitive analysis)

### Design Philosophy
- Modern, user-friendly, non-bloated client web app
- Mobile app for Admin and Service Providers

---

## 2. TARGET AUDIENCE

### Clients (End Users)
- People looking to book timeslots from experts or skilled workers

### Businesses
- Companies with multiple service providers needing scheduling management

---

## 3. ADMIN FEATURES

### Service Management
- Add and manage services:
  - Details
  - Time requirements
  - Resources
  - Assign providers

### Provider Management
- Add and manage service providers:
  - Details
  - Availability
  - Calendar sync

### Role-Based Permissions
- Permission system where each user can be given/revoked permissions

---

## 4. SERVICE PROVIDER FEATURES

### Profile Management
- Create and edit profiles

### Availability Management
- Set and manage availability schedule

---

## 5. CLIENT BOOKING FLOW

# User Flow Requirements - Booking Process

For the clients i just want a mobile freindly responsive web app interface

once a client come to this interface he/she can select a service (service can be catogirzed if the service portfolio is big for the client to easily find a service or a filter based on the catogries can be used)

then the client can select a service provider

once the two are selected, he will see the availability calander and in the calander days available are indicated (may be with a semi tranparent cirlce around the date)

once the client click or tocuh a date available timeslots for a specific date is listed

and the client can select the timeslot according to his preference

if the client doesnt see any available slots in the current month he can check the next months as well

once the client selects a time slot he is prompted to book as a guest, sign in or sign up

if he is recurring client is alredy signed in and sent to booking conformation pagge. if not he can select to book as guest. if he chooses that path he can input his name email and mobile number and he is processed to payment page

if he wants to sign up he can give email, password and create a proficle and then make the booking

once in the payment page he can pay wiht crdit card, debit card or select book now/paylater option

if he finisheds pay then and their he will be sent a conformation email and the service provide is also sent an email. and also service providers google calander will have an entry to avoid muliple bookings.

---

## 6. ADDITIONAL FEATURES (Confirmed by User)

### Core Features (High Priority)
- **Booking Reminders** - Automated SMS/Email reminders (24h, 1h before)
- **Cancellation & Rescheduling** - Client self-service with configurable policies
- **Buffer Time** - Gap between appointments (cleanup/prep time)
- **Recurring Appointments** - Weekly/monthly repeat bookings
- **Waitlist** - When slots are full, clients can join waitlist
- **Multi-Location Support** - If center expands

### Business Operations
- **Dashboard Analytics** - Bookings per day/week, revenue, popular services
- **Booking History** - For both clients and providers
- **Staff Calendar View** - Admin sees all providers in one view
- **Holidays/Time-Off Management** - Block dates for vacations

### Client Experience
- **Client Portal** - View upcoming/past bookings, reschedule
- **Reviews/Ratings** - After appointment completion
- **Service Add-ons** - Upsell additional services during booking

### Payments & Business
- **Partial Payment/Deposit** - Take deposit at booking, rest at service
- **Refund Management** - For cancellations
- **Invoicing** - Generate invoices automatically
- **Promo Codes/Discounts** - For marketing campaigns

### Communication
- **Custom Email Templates** - Branded confirmation emails

### Technical/SaaS Requirements
- **Multi-Tenant Architecture** - Essential for SaaS (each business is isolated)
- **Custom Branding/White-Label** - Each tenant can customize look
- **API Access** - For integrations
- **Webhook Support** - Connect to other systems

---

## 7. TARGET INDUSTRIES (SaaS Potential)

| Industry | Examples |
|----------|----------|
| Healthcare | Clinics, Physiotherapy, Dental, Mental Health |
| Wellness | Spas, Yoga Studios, Fitness Trainers, Massage Therapy |
| Professional Services | Law Firms, Accounting, Financial Advisors |
| Education | Tutoring Centers, Music Schools, Driving Schools |
| Beauty | Barbershops, Nail Salons, Tattoo Studios |
| Home Services | Plumbers, Electricians, Cleaning Services |
| Events | Photography Studios, Event Planners |
| Automotive | Car Service Centers, Detailing Shops |

---

## 8. SUCCESS METRICS (To Be Refined)

| Metric | Description |
|--------|-------------|
| Booking Conversion Rate | % of visitors who complete a booking |
| No-Show Rate | % of missed appointments |
| Average Time to Book | How quickly users complete flow |
| Client Retention Rate | % of clients who rebook |
| Provider Utilization | % of available time that's booked |
| Revenue per Booking | Average transaction value |

---

## 9. DETAILED USER INSIGHTS (From Discovery)

### Client Profile (Priya)
- **Demographics:** Working class, corporate professionals
- **Device:** Phone (mobile-first)
- **Tech Comfort:** Not very tech-savvy, need simple flows
- **Behavior:** Usually know the service they want; check availability via phone currently
- **Payment Preference:** May prefer "Pay Later" over card payments (some find cards troublesome)
- **Provider Selection:** Currently one provider per service, but want flexibility to show provider list

### Service Provider Profile (Ravi)
- **Current Workflow:** Check personal Google Calendar; admin reminds before sessions
- **Desired Control:** Limited control (not full admin access)
- **Needs:**
  - View appointments (day/month view)
  - See client details for booked sessions
  - Personal dashboard (own clients, performance)
  - Should NOT see other providers' data
- **Tech Comfort:** Mixed - some prefer Google Calendar only, others will use app

### Admin Profile (Anita)
- **Current Pain Points:**
  - Payment failures (client charged but booking not created - manual resolution)
  - Provider cancellations requiring client notification and rescheduling
- **Current Scale:** Few services, 3 providers (expected to grow)
- **Key Reports Needed:**
  - Bookings made
  - Cancellations (by party - client vs provider)

---

## 10. SERVICE TYPES (Critical Discovery)

### Type 1: One-on-One Consultations
- Single client books a single provider
- Standard appointment model

### Type 2: Group Classes
- Multiple clients can book the same session
- Same provider, same timeslot
- **Max capacity cap** per class
- Examples: Meditation classes, group workshops

**Impact:** Booking system must support both individual AND group booking models.
