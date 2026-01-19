# Story 3.6: Inline Registration During Booking

Status: ready-for-dev

## Story

As a **new client who hasn't registered yet**,
I want **to create my account as part of the booking process**,
so that **I can book an appointment without a separate registration step**.

## Acceptance Criteria

### Core Flow
**Given** I am NOT logged in and have selected a time slot
**When** I click "Book this slot"
**Then:**
1. I see a combined registration + booking confirmation page
2. The page shows my selected service, provider, date/time at the top
3. I see registration fields: Name, Phone, Email, Password, Confirm Password
4. I see "Continue with Google" as an alternative
5. I see "Proceed to Payment" CTA button
6. A note explains "This information will create your profile"

### Slot Holding (Race Condition Prevention)
**Given** I am filling out the inline registration form
**When** I selected a slot
**Then:**
1. Slot is temporarily held for 10 minutes
2. A countdown timer is visible showing remaining hold time
3. Other users see this slot as "on hold" (grayed out, not bookable)
4. If timer expires, slot is released and I see "Slot expired, please select again"

### Existing Email Handling
**Given** I enter an email that already exists
**When** I blur the email field (or submit)
**Then:**
1. I see message: "This email is already registered"
2. I see link: "Already have an account? Sign in"
3. Clicking link shows login form (same page, keeps slot held)
4. After login, I continue to payment with slot intact

### Account Linking (Social + Email)
**Given** I have an existing Google-linked account
**When** I try to register with the same email via password
**Then:**
1. System detects linked account
2. Shows: "This email is linked to a Google account. Continue with Google?"
3. User can click Google button to authenticate
4. After Google auth, continues to payment

### Successful Registration + Booking
**Given** I filled all fields correctly
**When** I click "Proceed to Payment"
**Then:**
1. User account created with `email_verified: false`
2. User automatically logged in (session created)
3. Temporary slot hold converted to pending booking
4. Redirected to payment page
5. Booking linked to new user account

### Email Verification Deferral (FR13)
**Given** I completed my first booking without email verification
**When** I try to book a second time
**Then:**
1. I see prompt: "Please verify your email to continue"
2. I can request verification email
3. After verification, booking proceeds

### Tenant Configuration: Guest Checkout Option
**Given** the tenant has `allow_guest_checkout: true` in settings
**When** a new client books
**Then:**
1. Password fields are optional
2. "Book as Guest" option appears
3. Guest booking creates a lightweight record (email + name + phone only)
4. Guest receives booking confirmation but no account
5. Guest can "claim" their bookings by registering later

**Given** the tenant has `allow_guest_checkout: false` (default)
**When** a new client books
**Then:**
1. Password is required
2. Full account must be created

## Tasks / Subtasks

- [ ] **Task 1: Create Inline Registration Page** (AC: Core Flow)
  - [ ] 1.1: Create page at `src/app/embed/book/[tenantSlug]/register/page.tsx`
  - [ ] 1.2: Show selected booking details at top
  - [ ] 1.3: Create RegistrationBookingForm component
  - [ ] 1.4: Add Google SSO button
  - [ ] 1.5: Add "Proceed to Payment" CTA
  - [ ] 1.6: Mobile-optimized layout (accordion/steps for long form)

- [ ] **Task 2: Implement Slot Holding** (AC: Race Condition)
  - [ ] 2.1: Create `slot_holds` table in database
  - [ ] 2.2: Create tRPC `booking.holdSlot` procedure
  - [ ] 2.3: Add countdown timer component
  - [ ] 2.4: Create background job to release expired holds
  - [ ] 2.5: Update availability engine to exclude held slots

- [ ] **Task 3: Handle Existing Email** (AC: Existing Email)
  - [ ] 3.1: Add real-time email validation (debounced)
  - [ ] 3.2: Check if email exists via tRPC
  - [ ] 3.3: Show inline login form when detected
  - [ ] 3.4: Handle login while preserving slot hold

- [ ] **Task 4: Handle Account Linking** (AC: Social + Email)
  - [ ] 4.1: Detect Google-linked accounts
  - [ ] 4.2: Show appropriate message
  - [ ] 4.3: Handle OAuth flow that preserves booking context

- [ ] **Task 5: Registration + Booking Flow** (AC: Success)
  - [ ] 5.1: Create user account in transaction
  - [ ] 5.2: Convert slot hold to pending booking
  - [ ] 5.3: Establish session
  - [ ] 5.4: Redirect to payment with booking context

- [ ] **Task 6: Email Verification Deferral** (AC: FR13)
  - [ ] 6.1: Add `email_verified` check on 2nd booking
  - [ ] 6.2: Create verification prompt component
  - [ ] 6.3: Handle verification flow

- [ ] **Task 7: Tenant Guest Checkout Setting** (AC: Guest Checkout)
  - [ ] 7.1: Add `allow_guest_checkout` to tenant settings
  - [ ] 7.2: Create `guest_bookings` table
  - [ ] 7.3: Conditional form rendering based on setting
  - [ ] 7.4: Create "claim bookings" flow

## Dev Notes

### Database Schema Additions

```sql
-- Slot holds table for race condition prevention
CREATE TABLE public.slot_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  provider_id UUID NOT NULL REFERENCES public.providers(id),
  service_id UUID NOT NULL REFERENCES public.services(id),
  slot_datetime TIMESTAMPTZ NOT NULL,
  session_id TEXT NOT NULL, -- Browser session identifier
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL, -- created_at + 10 minutes
  converted_to_booking_id UUID REFERENCES public.bookings(id)
);

CREATE INDEX idx_slot_holds_lookup 
  ON public.slot_holds(provider_id, slot_datetime, expires_at);

-- Guest bookings table (for tenants with guest checkout enabled)
CREATE TABLE public.guest_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  booking_id UUID NOT NULL REFERENCES public.bookings(id),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  claimed_by_user_id UUID REFERENCES public.users(id), -- When guest registers
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add tenant settings
ALTER TABLE public.tenants ADD COLUMN settings JSONB DEFAULT '{
  "allow_guest_checkout": false,
  "slot_hold_minutes": 10,
  "require_email_verification_after_n_bookings": 2
}'::jsonb;
```

### Slot Hold Logic

```typescript
// src/server/services/slot-hold.ts
const SLOT_HOLD_MINUTES = 10;

export async function holdSlot({
  tenantId,
  providerId,
  serviceId,
  slotDatetime,
  sessionId,
}: HoldSlotInput) {
  const supabase = await createClient();
  
  // Check if slot is already held or booked
  const { data: existingHold } = await supabase
    .from('slot_holds')
    .select('id')
    .eq('provider_id', providerId)
    .eq('slot_datetime', slotDatetime)
    .gt('expires_at', new Date().toISOString())
    .is('converted_to_booking_id', null)
    .single();
    
  if (existingHold) {
    throw new TRPCError({ code: 'CONFLICT', message: 'Slot is currently on hold' });
  }
  
  // Create hold
  const expiresAt = new Date(Date.now() + SLOT_HOLD_MINUTES * 60 * 1000);
  
  const { data: hold } = await supabase
    .from('slot_holds')
    .insert({
      tenant_id: tenantId,
      provider_id: providerId,
      service_id: serviceId,
      slot_datetime: slotDatetime,
      session_id: sessionId,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();
    
  return { holdId: hold.id, expiresAt };
}
```

### Countdown Timer Component

```typescript
// src/features/booking/components/SlotHoldTimer.tsx
'use client';

import { useEffect, useState } from 'react';

interface SlotHoldTimerProps {
  expiresAt: Date;
  onExpired: () => void;
}

export function SlotHoldTimer({ expiresAt, onExpired }: SlotHoldTimerProps) {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = expiresAt.getTime() - Date.now();
      if (diff <= 0) {
        clearInterval(interval);
        onExpired();
        return;
      }
      setRemaining(Math.ceil(diff / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>
        Slot held for {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
```

### Mobile UX: Step-Based Form

For mobile, use a step-based form instead of long scroll:

```typescript
// src/features/booking/components/InlineRegistrationForm.tsx
'use client';

import { useState } from 'react';

type Step = 'contact' | 'account' | 'confirm';

export function InlineRegistrationForm() {
  const [step, setStep] = useState<Step>('contact');
  
  // Mobile: show steps
  // Desktop: show all fields
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  if (isMobile) {
    return (
      <div>
        <StepIndicator current={step} steps={['Contact', 'Account', 'Confirm']} />
        
        {step === 'contact' && (
          <ContactStep onNext={() => setStep('account')} />
        )}
        {step === 'account' && (
          <AccountStep onNext={() => setStep('confirm')} onBack={() => setStep('contact')} />
        )}
        {step === 'confirm' && (
          <ConfirmStep onBack={() => setStep('account')} />
        )}
      </div>
    );
  }
  
  // Desktop: single form
  return <FullRegistrationForm />;
}
```

### Tenant Settings Helper

```typescript
// src/lib/utils/tenant-settings.ts
export interface TenantSettings {
  allow_guest_checkout: boolean;
  slot_hold_minutes: number;
  require_email_verification_after_n_bookings: number;
}

export function getTenantSettings(tenant: Tenant): TenantSettings {
  const defaults: TenantSettings = {
    allow_guest_checkout: false,
    slot_hold_minutes: 10,
    require_email_verification_after_n_bookings: 2,
  };
  
  return { ...defaults, ...(tenant.settings as Partial<TenantSettings>) };
}
```

### Project Structure

```
src/
├── app/embed/book/[tenantSlug]/
│   ├── page.tsx              # Widget calendar (Story 3.1)
│   ├── register/
│   │   └── page.tsx          # Inline registration page (NEW)
│   ├── payment/
│   │   └── page.tsx          # Payment page
│   └── confirmation/
│       └── page.tsx          # Confirmation page
├── features/booking/
│   └── components/
│       ├── InlineRegistrationForm.tsx
│       ├── SlotHoldTimer.tsx
│       ├── EmailCheckInput.tsx
│       └── GuestCheckoutForm.tsx
└── server/services/
    └── slot-hold.ts
```

### Critical Rules

- **Slot holds expire after 10 minutes** - configurable per tenant
- **Never leave orphaned holds** - background job cleans expired holds
- **Transaction safety** - registration + booking in single transaction
- **Session preservation** - keep slot context through OAuth flow
- **Mobile-first UX** - step-based form on small screens

### References

- [Source: bmad_outputs/planning-artifacts/prd.md#FR13]
- [Source: bmad_outputs/planning-artifacts/architecture.md#Data-Architecture]
- [Source: bmad_outputs/planning-artifacts/ux-design-specification.md]

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

- [ ] Unauthenticated user can browse availability
- [ ] Selecting slot shows inline registration form
- [ ] Slot is held for 10 minutes with visible countdown
- [ ] Other users cannot book held slot
- [ ] Existing email shows "Already registered" message
- [ ] Login option preserves slot hold
- [ ] Google OAuth preserves booking context
- [ ] Successful registration creates account + booking
- [ ] User is logged in after registration
- [ ] Payment page receives booking context
- [ ] 2nd booking prompts email verification
- [ ] Guest checkout works when tenant enables it
- [ ] Mobile form uses step-based UX
- [ ] Expired slot hold shows appropriate message
