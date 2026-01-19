# Story 1.4: User Registration (Email/Password)

Status: complete

## Story

As a **client**,
I want **to register with my email, mobile, and password**,
so that **I can create an account to book appointments** (FR11).

## Acceptance Criteria

**Given** I am on the registration page
**When** I enter valid email, mobile number, and password
**Then:**
1. My account is created in Supabase Auth
2. A user record is created in the `users` table with `role: 'client'`
3. The user is associated with the correct tenant
4. I am redirected to the dashboard
5. A welcome message is displayed

**Given** I enter an email that already exists
**When** I submit the registration form
**Then:**
- I see an error message "Email already registered"
- No duplicate account is created

**Given** I enter a password less than 8 characters
**When** I submit the form
**Then:**
- I see a validation error "Password must be at least 8 characters"

## Tasks / Subtasks

- [ ] **Task 1: Create Registration UI** (AC: 1-5)
  - [ ] 1.1: Create registration page at `src/app/(public)/register/page.tsx`
  - [ ] 1.2: Create RegisterForm component with fields: email, phone, password, confirm password
  - [ ] 1.3: Apply design tokens (Teal primary, Inter font)
  - [ ] 1.4: Add form validation with Zod

- [ ] **Task 2: Create Registration API** (AC: 1, 2, 3)
  - [ ] 2.1: Create tRPC `auth.register` procedure
  - [ ] 2.2: Create user in Supabase Auth
  - [ ] 2.3: Create user record in `users` table with tenant_id
  - [ ] 2.4: Handle transaction (rollback if either fails)

- [ ] **Task 3: Handle Tenant Resolution** (AC: 3)
  - [ ] 3.1: Determine tenant from URL slug or subdomain
  - [ ] 3.2: Pass tenant_id to registration procedure
  - [ ] 3.3: Validate tenant exists

- [ ] **Task 4: Post-Registration Flow** (AC: 4, 5)
  - [ ] 4.1: Auto-login user after registration
  - [ ] 4.2: Redirect to client dashboard
  - [ ] 4.3: Show welcome toast message

- [ ] **Task 5: Error Handling** (AC: duplicate email, validation)
  - [ ] 5.1: Handle duplicate email error from Supabase
  - [ ] 5.2: Display user-friendly error messages
  - [ ] 5.3: Handle network errors gracefully

## Dev Notes

### Registration Page (`src/app/(public)/register/page.tsx`)

```typescript
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">
          Create Account
        </h1>
        <RegisterForm />
      </div>
    </div>
  );
}
```

### Registration Form Component

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { trpc } from '@/lib/trpc/client';
import { useRouter } from 'next/navigation';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      router.push('/dashboard');
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    setError(null);
    registerMutation.mutate({
      email: data.email,
      phone: data.phone,
      password: data.password,
    });
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
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          {...register('phone')}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Password
        </label>
        <input
          type="password"
          {...register('password')}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Confirm Password
        </label>
        <input
          type="password"
          {...register('confirmPassword')}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
}
```

### tRPC Auth Router (`src/server/routers/auth.ts`)

```typescript
import { router, publicProcedure } from '@/lib/trpc/server';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createClient } from '@/lib/supabase/server';

const registerSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(8),
  tenantId: z.string().uuid().optional(), // From context/URL
});

export const authRouter = router({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      const supabase = await createClient();
      
      // Get tenant_id from context (resolved from URL/subdomain)
      const tenantId = input.tenantId || ctx.tenantId;
      
      if (!tenantId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Tenant not found',
        });
      }

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email already registered',
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: authError.message,
        });
      }

      if (!authData.user) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user',
        });
      }

      // 2. Create user profile in users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          tenant_id: tenantId,
          role: 'client',
          phone: input.phone,
        });

      if (profileError) {
        // Rollback: Delete auth user if profile creation fails
        // Note: In production, use a transaction or handle cleanup
        console.error('Profile creation failed:', profileError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user profile',
        });
      }

      return {
        success: true,
        userId: authData.user.id,
      };
    }),
});
```

### Project Structure

```
src/
├── app/(public)/
│   └── register/
│       └── page.tsx
├── features/auth/
│   ├── components/
│   │   └── RegisterForm.tsx
│   └── schemas/
│       └── register.ts
└── server/routers/
    └── auth.ts
```

### Validation Schema (Shared)

Create `src/features/auth/schemas/register.ts`:

```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
```

### Critical Rules

- Use Zod schema for BOTH client and server validation
- Handle duplicate email error gracefully
- Always associate user with a tenant
- Default role is 'client' for self-registration

### References

- [Source: bmad_outputs/planning-artifacts/epics.md#Story-1.4]
- [Source: bmad_outputs/planning-artifacts/architecture.md#Authentication-Security]
- [Source: bmad_outputs/project-context.md#Framework-Specific-Rules]

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

- [ ] Registration page renders correctly
- [ ] Form validation works (client-side)
- [ ] Valid submission creates auth user
- [ ] Valid submission creates users table record
- [ ] User is associated with correct tenant
- [ ] Duplicate email shows error message
- [ ] Short password shows validation error
- [ ] Successful registration redirects to dashboard
- [ ] Welcome message is displayed
