# Story 1.10: Vercel Deployment

Status: complete

## Story

As a **team**,
I want **the application deployed to Vercel**,
so that **we can access the live app and share progress**.

## Acceptance Criteria

**Given** GitHub repository is connected to Vercel
**When** deployment is configured
**Then:**
1. The project deploys to `*.vercel.app` domain
2. Environment variables are configured in Vercel dashboard
3. Preview deployments work for PRs
4. Production deployment is on `main` branch

**Given** the deployed app is accessed
**When** I visit the URL
**Then:**
1. The home page loads in < 2 seconds (NFR1)
2. Supabase connection works in production
3. Auth flows work with correct redirect URLs

## Tasks / Subtasks

- [ ] **Task 1: Import Project to Vercel** (AC: 1)
  - [ ] 1.1: Sign up/login to Vercel
  - [ ] 1.2: Import GitHub repository
  - [ ] 1.3: Configure project settings

- [ ] **Task 2: Configure Environment Variables** (AC: 2)
  - [ ] 2.1: Add `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] 2.2: Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] 2.3: Add `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] 2.4: Configure for production scope

- [ ] **Task 3: Configure Build Settings** (AC: 1, 3, 4)
  - [ ] 3.1: Verify build command: `npm run build`
  - [ ] 3.2: Verify output directory: `.next`
  - [ ] 3.3: Configure auto-deploy for `main`
  - [ ] 3.4: Enable preview deployments

- [ ] **Task 4: Update Auth Redirect URLs** (AC: 3)
  - [ ] 4.1: Add Vercel domain to Supabase redirect URLs
  - [ ] 4.2: Add Vercel domain to Google OAuth authorized URLs
  - [ ] 4.3: Test auth flow on production

- [ ] **Task 5: Verify Deployment** (AC: all)
  - [ ] 5.1: Access production URL
  - [ ] 5.2: Test page load time (< 2 seconds)
  - [ ] 5.3: Test database connectivity
  - [ ] 5.4: Test login/register flows
  - [ ] 5.5: Create PR and verify preview deployment

## Dev Notes

### Vercel Project Import Steps

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import from GitHub: Select `sheduleapp` repository
4. Configure:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `.` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (auto-detected)
5. Add Environment Variables
6. Click "Deploy"

### Environment Variables in Vercel

Add these in Vercel Project Settings > Environment Variables:

| Variable | Value | Environments |
|----------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | Production, Preview |

> ⚠️ **CRITICAL:** Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code or `NEXT_PUBLIC_` prefix.

### Update Supabase Auth Settings

In Supabase Dashboard > Authentication > URL Configuration:

**Site URL:**
```
https://your-app.vercel.app
```

**Redirect URLs (add all):**
```
https://your-app.vercel.app/**
https://*.vercel.app/**
http://localhost:3000/**
```

### Update Google OAuth Redirect URIs

In Google Cloud Console > APIs & Services > Credentials:

Add to Authorized redirect URIs:
```
https://your-project.supabase.co/auth/v1/callback
```

Add to Authorized JavaScript origins:
```
https://your-app.vercel.app
https://*.vercel.app
http://localhost:3000
```

### Vercel Configuration (Optional)

Create `vercel.json` for custom settings:

```json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Performance Optimization

For sub-2-second load times (NFR1):

1. **Image Optimization:** Use `next/image` for all images
2. **Code Splitting:** Next.js handles this automatically
3. **Edge Functions:** Use Vercel Edge for static pages
4. **Caching:** Configure React Query for API responses

### Testing Production Deployment

**Page Load Time Test:**
```bash
# Using curl to check response time
curl -o /dev/null -s -w "Total: %{time_total}s\n" https://your-app.vercel.app
```

**Or use browser DevTools:**
1. Open Network tab
2. Refresh page
3. Check "Load" time in footer (should be < 2 seconds)

**Database Connectivity Test:**
```bash
# In browser console on the deployed app
await fetch('/api/trpc/health').then(r => r.json())
```

### Deployment Workflow

```
develop branch → PR → Preview Deployment (auto)
                  ↓
              Code Review
                  ↓
              Merge to main → Production Deployment (auto)
```

### Custom Domain (Future)

When ready for custom domain:

1. Go to Vercel Project Settings > Domains
2. Add your domain: `book.yourbusiness.com`
3. Configure DNS records as shown
4. Update Supabase redirect URLs
5. Update Google OAuth origins

### Monitoring & Analytics

Vercel provides built-in:
- **Analytics:** Page views, Web Vitals
- **Speed Insights:** Performance monitoring
- **Logs:** Function logs and errors

Enable in Vercel Project Settings > Analytics.

### Project Structure

```
vercel.json          # Optional custom configuration
.vercel/             # Gitignored, created by Vercel CLI
```

### Critical Rules

- Production secrets only in Vercel dashboard (never in code)
- Test auth flows after each deployment
- Monitor Web Vitals for performance
- Keep region close to users (iad1 for US East)

### References

- [Source: bmad_outputs/planning-artifacts/epics.md#Story-1.10]
- [Source: bmad_outputs/planning-artifacts/architecture.md#Infrastructure-Deployment]
- [Vercel Next.js Docs](https://vercel.com/docs/frameworks/nextjs)

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

- [ ] Vercel account created/accessed
- [ ] GitHub repository imported to Vercel
- [ ] Environment variables configured
- [ ] First deployment successful
- [ ] Production URL accessible
- [ ] Page loads in < 2 seconds
- [ ] Database queries work in production
- [ ] Login with email/password works
- [ ] Google OAuth works
- [ ] Password reset email works
- [ ] Preview deployment works for PRs
- [ ] Auth redirect URLs updated in Supabase
- [ ] Google OAuth URLs updated for production

---

## Epic 1 Completion Notes

This is the final story in Epic 1: Project Foundation & Infrastructure.

**What's Been Established:**
- ✅ Next.js 14 project with TypeScript, Tailwind, tRPC
- ✅ Supabase connection and client setup
- ✅ Multi-tenant database schema with RLS
- ✅ User registration (email + Google SSO)
- ✅ User login and session management
- ✅ Password reset flow
- ✅ Role-based access control
- ✅ GitHub repository with CI/CD
- ✅ Production deployment on Vercel

**Ready for Epic 2:** Admin Service & Provider Management
