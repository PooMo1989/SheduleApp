# Story 1.5: User Registration (Google SSO)

Status: complete

## Story

As a **client**,
I want **to register using my Google account**,
so that **I can quickly create an account without remembering another password** (FR12).

## Acceptance Criteria

**Given** I am on the registration/login page
**When** I click "Continue with Google"
**Then:**
1. I am redirected to Google OAuth consent screen
2. After granting permission, my account is created in Supabase Auth
3. A user record is created in `users` table with `role: 'client'`
4. My name and email are populated from Google profile
5. I am redirected to the dashboard

**Given** I already have an account with the same email (password-based)
**When** I sign in with Google
**Then:**
- My accounts are linked (same user, multiple auth methods)

## Tasks / Subtasks

- [ ] **Task 1: Configure Google OAuth in Supabase** (AC: 1)
  - [ ] 1.1: Create Google Cloud OAuth credentials
  - [ ] 1.2: Configure Google provider in Supabase Dashboard
  - [ ] 1.3: Set authorized redirect URLs

- [ ] **Task 2: Create Google Sign-In Button** (AC: 1, 2)
  - [ ] 2.1: Add "Continue with Google" button to login/register pages
  - [ ] 2.2: Style button according to Google branding guidelines
  - [ ] 2.3: Implement OAuth flow initiation

- [ ] **Task 3: Handle OAuth Callback** (AC: 2, 3, 4)
  - [ ] 3.1: Create callback route at `/auth/callback`
  - [ ] 3.2: Exchange code for session
  - [ ] 3.3: Create/update user profile in `users` table
  - [ ] 3.4: Populate profile with Google data (name, avatar)

- [ ] **Task 4: Handle Account Linking** (AC: linked accounts)
  - [ ] 4.1: Check if email already exists
  - [ ] 4.2: Link Google identity to existing account
  - [ ] 4.3: Handle edge cases gracefully

- [ ] **Task 5: Post-Auth Flow** (AC: 5)
  - [ ] 5.1: Redirect to appropriate dashboard
  - [ ] 5.2: Show success message for new users

## Dev Notes

### Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Configure OAuth consent screen
5. Create OAuth 2.0 credentials (Web application)
6. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`

### Supabase Dashboard Configuration

1. Go to Authentication > Providers
2. Enable Google provider
3. Add Client ID and Client Secret from Google Cloud
4. Configure additional options as needed

### Environment Variables

Add to `.env.local`:
```bash
# Already configured in Supabase Dashboard, but document for reference
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Google Sign-In Button Component

Create `src/features/auth/components/GoogleSignInButton.tsx`:

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';

interface GoogleSignInButtonProps {
  redirectTo?: string;
}

export function GoogleSignInButton({ redirectTo = '/dashboard' }: GoogleSignInButtonProps) {
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Google sign-in error:', error);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-neutral-300 rounded-md bg-white hover:bg-neutral-50 transition-colors"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      <span className="text-neutral-700 font-medium">Continue with Google</span>
    </button>
  );
}
```

### Auth Callback Route

Create `src/app/auth/callback/route.ts`:

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    
    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Check if user profile exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();

      // If no profile, create one
      if (!existingUser) {
        // Get tenant from session/URL (implementation depends on your tenant resolution)
        const tenantId = searchParams.get('tenant') || await getDefaultTenant(supabase);
        
        await supabase.from('users').insert({
          id: data.user.id,
          tenant_id: tenantId,
          role: 'client',
          full_name: data.user.user_metadata.full_name || data.user.user_metadata.name,
          avatar_url: data.user.user_metadata.avatar_url,
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // OAuth error - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=oauth_error`);
}

async function getDefaultTenant(supabase: any) {
  // For MVP, get the first tenant or a default one
  // In production, resolve from subdomain/URL
  const { data } = await supabase.from('tenants').select('id').limit(1).single();
  return data?.id;
}
```

### Update Login Page

Add Google button below the form:

```typescript
// In login page
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton';

// In the JSX
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
```

### Project Structure

```
src/
├── app/
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts    # OAuth callback handler
│   └── (public)/
│       ├── login/
│       │   └── page.tsx    # Add Google button
│       └── register/
│           └── page.tsx    # Add Google button
└── features/auth/
    └── components/
        └── GoogleSignInButton.tsx
```

### Critical Rules

- Always create user profile in `users` table after OAuth
- Handle account linking for existing email addresses
- Store Google profile data (name, avatar) in user record
- Use `signInWithOAuth` with proper redirect URLs
- Handle errors gracefully with user-friendly messages

### References

- [Source: bmad_outputs/planning-artifacts/epics.md#Story-1.5]
- [Source: bmad_outputs/planning-artifacts/architecture.md#Authentication-Security]
- [Supabase OAuth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)

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

- [ ] Google OAuth configured in Supabase Dashboard
- [ ] "Continue with Google" button appears on login/register pages
- [ ] Clicking button redirects to Google consent screen
- [ ] After consent, user is created in Supabase Auth
- [ ] User profile created in `users` table with correct tenant
- [ ] Google name and avatar stored in profile
- [ ] Existing email accounts can link Google identity
- [ ] User is redirected to dashboard after sign-in
- [ ] Error states handled gracefully
