# Guest Account Upgrade - Email Verification Strategy

## Overview

This document explains why guest account upgrades are auto-verified and how this maintains both security and frictionless UX.

---

## Problem Statement

**Scenario:**
1. Guest books appointment (no account) → Receives magic link
2. Later, guest wants to create full account (with password)
3. If "Confirm email" is enabled in Supabase → Guest must verify email before login

**Issue:**
- Creates friction for guests who want to upgrade
- They already proved email ownership via magic link
- Requiring email verification again is redundant

---

## Solution: Auto-Verify Guest Upgrades

### Implementation

**File:** `src/server/routers/auth.ts`
**Mutation:** `upgradeGuestAccount`

```typescript
// Create user profile
const { error: profileError } = await supabase
    .from('users')
    .insert({
        id: authData.user.id,
        tenant_id: tenantId,
        role: 'client',
        email: input.email,
        email_verified: true, // ← Auto-verify (guest proved email via magic link)
    });
```

### Rationale

**Why auto-verify is secure:**

1. **Email Already Verified:** Guest received magic link at this email
2. **Magic Link Clicked:** Guest clicked link, proving email ownership
3. **Bookings Linked:** Guest's bookings are associated with this email
4. **Trust Chain:** Same as team invitations (invited users trusted)

**Flow:**
```
Guest books → Email sent with magic link → Guest clicks link (verifies email)
         ↓
Later: Guest upgrades → Create auth account → Auto-verify (email already proved)
```

---

## Security Comparison

### Team Invitations (Already Implemented)
```typescript
// team.ts:837
email_verified: true, // Auto-verified for invited users
```

**Reason:** Admin invited this user → Trusted

### Guest Upgrades (New Implementation)
```typescript
// auth.ts:258
email_verified: true, // Auto-verified (guest proved email via magic link)
```

**Reason:** Guest clicked magic link → Email proved → Trusted

### Similar Security Level
Both approaches trust that:
- Team invitation: Admin trusts the invitee
- Guest upgrade: Guest proved email via magic link

---

## Impact on "Confirm Email" Setting

### With Auto-Verify Fix ✅

| Flow | "Confirm Email" OFF | "Confirm Email" ON |
|------|---------------------|-------------------|
| **Admin Signup** | No verification | ✅ Verification required |
| **Team Invitation** | Auto-verified | ✅ Auto-verified |
| **Google OAuth** | Auto-verified | ✅ Auto-verified |
| **Guest Upgrade** | Auto-verified | ✅ Auto-verified |
| **Guest Booking** | No auth account | No auth account |

**Result:** Safe to enable "Confirm email" without affecting UX!

---

## User Experience

### Without Auto-Verify (Problem)
```
1. Guest books appointment
2. Receives magic link → Clicks link (proves email)
3. Later upgrades to full account
4. ❌ Must verify email AGAIN before login
5. Friction point for users
```

### With Auto-Verify (Solution)
```
1. Guest books appointment
2. Receives magic link → Clicks link (proves email)
3. Later upgrades to full account
4. ✅ Can login immediately (email already verified)
5. Frictionless experience
```

---

## Code Flow

### Guest Booking (No Auth Account)
```typescript
// booking.ts - Create booking
{
    client_user_id: null,        // No auth account
    client_email: "guest@example.com",
    booking_token: "abc123...",  // Magic link token
}
```

**Email sent with magic link:**
- URL: `/booking/manage?token=abc123...`
- No Supabase Auth account created
- No email verification needed

### Guest Upgrade (Create Auth Account)
```typescript
// auth.ts - upgradeGuestAccount
1. Find guest bookings by email
2. Create Supabase Auth account (signUp)
3. Create user profile with email_verified: true
4. Link all guest bookings to new user
```

**Why email_verified: true is safe:**
- Guest clicked magic link (proved email)
- Same security as team invitations
- Prevents friction on upgrade

---

## Testing

### Test Case 1: Guest Booking Flow
```bash
1. Book as guest with email: test@example.com
2. Check inbox → Receive magic link
3. Click magic link → Access booking
Expected: ✅ No password needed, frictionless
```

### Test Case 2: Guest Upgrade Flow
```bash
1. After booking, click "Create Account"
2. Set password: "Password123"
3. Submit upgrade
Expected: ✅ Can login immediately (no email verification)
```

### Test Case 3: With "Confirm Email" Enabled
```bash
Supabase Dashboard: Enable "Confirm email"

1. Admin signs up → Must verify email ✅
2. Team invitation → Auto-verified ✅
3. Guest upgrade → Auto-verified ✅
4. Guest booking → No auth account, frictionless ✅

Expected: All flows work correctly
```

---

## Database Schema

**users table:**
```sql
email_verified BOOLEAN DEFAULT FALSE
```

**Who sets email_verified to true:**
1. Team invitation acceptance (`team.ts:837`)
2. Google OAuth (Supabase automatic)
3. Guest account upgrade (`auth.ts:258`) ← New
4. Manual verification via email link (Supabase automatic)

---

## Rollback Plan

If issues arise with auto-verify:

**Quick Fix:** Remove auto-verify from guest upgrades
```typescript
// auth.ts - Remove this line
email_verified: true,
```

**Impact:** Guests must verify email after upgrade
**Trade-off:** More secure, but adds friction

---

## Comparison with Other Auth Strategies

### Strategy 1: Always Require Verification (Not Implemented)
```typescript
email_verified: false, // Guest must verify
```
**Pros:** More secure
**Cons:** Friction for guests, redundant verification

### Strategy 2: Auto-Verify Guest Upgrades (Implemented) ✅
```typescript
email_verified: true, // Auto-verify
```
**Pros:** Frictionless UX, email already proved via magic link
**Cons:** Slight security trade-off (mitigated by magic link proof)

### Strategy 3: Skip Verification Entirely (Not Recommended)
```typescript
// Disable "Confirm email" in Supabase
```
**Pros:** Zero friction
**Cons:** Admin accounts not verified, lower security

---

## Recommendation

**Current Implementation (Strategy 2) is optimal because:**

✅ **Security:** Admin signups verified, guests proved email via magic link
✅ **UX:** Zero friction for guest bookings and upgrades
✅ **Trust Chain:** Same security model as team invitations
✅ **Supabase Compatible:** Safe to enable "Confirm email" setting

---

## Related Documentation

- `docs/story-3.8-implementation.md` - Full authentication implementation
- `STORY-3.8-SUMMARY.md` - Implementation summary
- `bmad_outputs/planning-artifacts/epics.md` - Story 3.6, 3.7, 3.8

---

**Implementation Date:** 2026-01-28
**Status:** ✅ IMPLEMENTED
**Safe to enable "Confirm email" in Supabase:** YES
