# Story 1.7: Password Reset

Status: complete

## Story

As a **user who forgot their password**,
I want **to reset my password via email**,
so that **I can regain access to my account** (FR15).

## Acceptance Criteria

**Given** I am on the login page
**When** I click "Forgot Password" and enter my email
**Then:**
1. A password reset email is sent to my address
2. I see a confirmation message

**Given** I received the reset email
**When** I click the reset link and enter a new password
**Then:**
1. My password is updated
2. I can log in with the new password

**Given** the reset link is older than 1 hour
**When** I try to use it
**Then:**
- I see an error "Reset link has expired"
- I am prompted to request a new reset

## Tasks / Subtasks

- [ ] **Task 1: Create Forgot Password Page** (AC: 1, 2)
  - [ ] 1.1: Create page at `src/app/(public)/forgot-password/page.tsx`
  - [ ] 1.2: Create form with email input
  - [ ] 1.3: Show success message after submission

- [ ] **Task 2: Implement Reset Email Request** (AC: 1)
  - [ ] 2.1: Use Supabase `resetPasswordForEmail` method
  - [ ] 2.2: Configure redirect URL for reset link
  - [ ] 2.3: Handle "email not found" gracefully (security)

- [ ] **Task 3: Create Reset Password Page** (AC: new password)
  - [ ] 3.1: Create page at `src/app/(public)/reset-password/page.tsx`
  - [ ] 3.2: Create form with new password and confirm password
  - [ ] 3.3: Validate password requirements

- [ ] **Task 4: Handle Password Update** (AC: password updated)
  - [ ] 4.1: Use Supabase `updateUser` method
  - [ ] 4.2: Handle token validation
  - [ ] 4.3: Redirect to login on success

- [ ] **Task 5: Handle Expired Links** (AC: expired link)
  - [ ] 5.1: Detect expired token from Supabase response
  - [ ] 5.2: Show appropriate error message
  - [ ] 5.3: Provide link to request new reset

## Dev Notes

### Forgot Password Page

Create `src/app/(public)/forgot-password/page.tsx`:

```typescript
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Reset Password
        </h1>
        <p className="text-neutral-600 mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        <ForgotPasswordForm />
        
        <p className="mt-6 text-center text-sm text-neutral-600">
          Remember your password?{' '}
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
```

### Forgot Password Form

Create `src/features/auth/components/ForgotPasswordForm.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const supabase = createClient();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        // Don't reveal if email exists (security best practice)
        console.error('Reset password error:', error);
      }
      
      // Always show success to prevent email enumeration
      setIsSubmitted(true);
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-2">Check your email</h2>
        <p className="text-neutral-600">
          If an account with that email exists, we've sent you a password reset link.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Email
        </label>
        <input
          type="email"
          {...register('email')}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          autoComplete="email"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Sending...' : 'Send Reset Link'}
      </button>
    </form>
  );
}
```

### Reset Password Page

Create `src/app/(public)/reset-password/page.tsx`:

```typescript
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Set New Password
        </h1>
        <p className="text-neutral-600 mb-6">
          Enter your new password below.
        </p>
        
        <ResetPasswordForm />
      </div>
    </div>
  );
}
```

### Reset Password Form

Create `src/features/auth/components/ResetPasswordForm.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Check for expired/invalid token on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      // If there's no session and we're on reset-password page,
      // the token might be expired
      if (error?.message?.includes('expired')) {
        setIsExpired(true);
      }
    };
    
    checkSession();
  }, [supabase]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          setIsExpired(true);
        } else {
          setError(error.message);
        }
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isExpired) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-2">Reset Link Expired</h2>
        <p className="text-neutral-600 mb-4">
          This password reset link has expired. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-2">Password Updated</h2>
        <p className="text-neutral-600">
          Redirecting you to login...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          New Password
        </label>
        <input
          type="password"
          {...register('password')}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          autoComplete="new-password"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Confirm New Password
        </label>
        <input
          type="password"
          {...register('confirmPassword')}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          autoComplete="new-password"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}
```

### Project Structure

```
src/
├── app/(public)/
│   ├── forgot-password/
│   │   └── page.tsx
│   └── reset-password/
│       └── page.tsx
└── features/auth/
    └── components/
        ├── ForgotPasswordForm.tsx
        └── ResetPasswordForm.tsx
```

### Email Template (Supabase Dashboard)

Configure in Supabase Dashboard: Authentication > Email Templates > Reset Password

Customize the email template with your branding.

### Critical Rules

- **Security:** Never reveal whether an email exists (prevents enumeration)
- Always show success message even if email doesn't exist
- Reset links expire after 1 hour (Supabase default)
- Validate password requirements on client AND server
- Use `updateUser` method after user clicks reset link

### References

- [Source: bmad_outputs/planning-artifacts/epics.md#Story-1.7]
- [Source: bmad_outputs/planning-artifacts/architecture.md#Authentication-Security]
- [Supabase Password Reset Docs](https://supabase.com/docs/guides/auth/passwords)

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

- [ ] Forgot password page renders
- [ ] Email input validates correctly
- [ ] Submitting sends reset email
- [ ] Success message shows after submission
- [ ] Reset email is received
- [ ] Reset link navigates to reset password page
- [ ] New password form validates
- [ ] Valid password updates successfully
- [ ] Expired link shows error message
- [ ] "Request new link" button works
- [ ] After reset, user can log in with new password
