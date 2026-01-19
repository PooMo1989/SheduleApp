# Story 1.6: User Login & Session

Status: complete

## Story

As a **registered user**,
I want **to log in with my credentials**,
so that **I can access my account and bookings** (FR14).

## Acceptance Criteria

**Given** I am on the login page
**When** I enter valid email and password
**Then:**
1. I am authenticated and a JWT session is created
2. I am redirected to my appropriate dashboard (based on role)
3. My session persists across page refreshes

**Given** I enter incorrect credentials
**When** I submit the login form
**Then:**
- I see an error "Invalid email or password"
- I remain on the login page

**Given** I am logged in
**When** I am inactive for 30 minutes
**Then:**
- My session expires (NFR10)
- I am redirected to login page on next action

## Tasks / Subtasks

- [ ] **Task 1: Create Login Page** (AC: 1, 2, 3)
  - [ ] 1.1: Create login page at `src/app/(public)/login/page.tsx`
  - [ ] 1.2: Create LoginForm component with email/password fields
  - [ ] 1.3: Add "Remember me" checkbox option
  - [ ] 1.4: Add link to registration and password reset

- [ ] **Task 2: Implement Login Logic** (AC: 1)
  - [ ] 2.1: Use Supabase `signInWithPassword` method
  - [ ] 2.2: Handle session creation and cookie storage
  - [ ] 2.3: Validate input before submission

- [ ] **Task 3: Role-Based Redirect** (AC: 2)
  - [ ] 3.1: Fetch user role after login
  - [ ] 3.2: Redirect admin to `/admin/dashboard`
  - [ ] 3.3: Redirect provider to `/provider/dashboard`
  - [ ] 3.4: Redirect client to `/dashboard`

- [ ] **Task 4: Session Persistence** (AC: 3)
  - [ ] 4.1: Configure Supabase session persistence
  - [ ] 4.2: Implement session refresh in middleware
  - [ ] 4.3: Test page refresh maintains session

- [ ] **Task 5: Error Handling** (AC: invalid credentials)
  - [ ] 5.1: Handle invalid email/password errors
  - [ ] 5.2: Handle unverified email errors
  - [ ] 5.3: Display user-friendly error messages

- [ ] **Task 6: Session Timeout** (AC: 30-min timeout)
  - [ ] 6.1: Configure session expiry in Supabase
  - [ ] 6.2: Implement inactivity detection on client
  - [ ] 6.3: Redirect to login on session expiry

## Dev Notes

### Login Page (`src/app/(public)/login/page.tsx`)

```typescript
import { LoginForm } from '@/features/auth/components/LoginForm';
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">
          Sign In
        </h1>
        
        <LoginForm />
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-neutral-500">Or continue with</span>
            </div>
          </div>
          <div className="mt-6">
            <GoogleSignInButton />
          </div>
        </div>
        
        <p className="mt-6 text-center text-sm text-neutral-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
```

### Login Form Component

Create `src/features/auth/components/LoginForm.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        setError('Invalid email or password');
        return;
      }

      if (authData.user) {
        // Fetch user role for redirect
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', authData.user.id)
          .single();

        // Redirect based on role
        const role = userData?.role || 'client';
        switch (role) {
          case 'admin':
            router.push('/admin/dashboard');
            break;
          case 'provider':
            router.push('/provider/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-neutral-700">
            Password
          </label>
          <Link 
            href="/forgot-password" 
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Forgot password?
          </Link>
        </div>
        <input
          type="password"
          {...register('password')}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          autoComplete="current-password"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
```

### Session Hook

Create `src/features/auth/hooks/useSession.ts`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface SessionState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

export function useSession() {
  const [state, setState] = useState<SessionState>({
    user: null,
    session: null,
    isLoading: true,
  });
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session,
        isLoading: false,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session,
        isLoading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return state;
}
```

### Logout Function

Create `src/features/auth/actions/logout.ts`:

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
```

### Session Timeout Configuration

Configure in Supabase Dashboard: Authentication > Settings

- **JWT Expiry**: 3600 seconds (1 hour)
- **Session Expiry**: 604800 seconds (7 days, with refresh)

For 30-minute inactivity timeout, implement client-side:

```typescript
// In a layout or provider component
'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function InactivityHandler() {
  const router = useRouter();
  const supabase = createClient();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const resetTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(async () => {
        await supabase.auth.signOut();
        router.push('/login?reason=inactivity');
      }, INACTIVITY_TIMEOUT);
    };

    // Events that reset the timer
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Initial timer
    resetTimer();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [router, supabase]);

  return null;
}
```

### Project Structure

```
src/
├── app/(public)/
│   ├── login/
│   │   └── page.tsx
│   └── forgot-password/
│       └── page.tsx       # Story 1.7
├── features/auth/
│   ├── components/
│   │   ├── LoginForm.tsx
│   │   └── GoogleSignInButton.tsx
│   ├── hooks/
│   │   └── useSession.ts
│   └── actions/
│       └── logout.ts
```

### Critical Rules

- Use `signInWithPassword` for email/password login
- Always fetch user role for correct redirect
- Session cookies handled by Supabase SSR package
- Implement inactivity timeout for security (NFR10)
- Never expose session tokens in client-side code

### References

- [Source: bmad_outputs/planning-artifacts/epics.md#Story-1.6]
- [Source: bmad_outputs/planning-artifacts/architecture.md#Authentication-Security]
- [Source: bmad_outputs/project-context.md#Database-Auth-Rules]

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

- [ ] Login page renders correctly
- [ ] Valid credentials log user in
- [ ] Admin users redirect to `/admin/dashboard`
- [ ] Provider users redirect to `/provider/dashboard`
- [ ] Client users redirect to `/dashboard`
- [ ] Invalid credentials show error message
- [ ] Session persists across page refresh
- [ ] Logout functionality works
- [ ] 30-minute inactivity triggers logout
- [ ] "Forgot password" link works
