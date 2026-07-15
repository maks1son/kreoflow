# KreoFlow Email OTP Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished email-code login flow with persistent Supabase sessions, a guarded Studio route, and a configuration-ready static deployment.

**Architecture:** A provider-neutral auth service wraps the Supabase browser SDK. A root auth provider restores persisted sessions and exposes auth state; the login page owns the two-step email/OTP flow, while a protected boundary controls Studio navigation. Supabase remains optional at build time so the UI and static export work before credentials are connected.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase JS, Vitest, Testing Library, CSS, GitHub Pages static export.

## Global Constraints

- Any verified email may create an account.
- Use a six-digit email OTP, not a password or magic-link UI.
- Persist the session across browser and device restarts through Supabase refresh-token storage.
- Never expose a Supabase service-role secret.
- Client route guards are UX only; future private data requires RLS.
- Preserve existing uncommitted landing work.
- Do not require Supabase credentials for lint, unit tests, or static build.

---

### Task 1: Auth domain and test foundation

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`
- Create: `vitest.config.ts`, `src/test/setup.ts`
- Create: `src/lib/auth/validation.ts`, `src/lib/auth/errors.ts`, `src/lib/auth/return-path.ts`
- Test: `src/lib/auth/validation.test.ts`, `src/lib/auth/errors.test.ts`, `src/lib/auth/return-path.test.ts`

**Interfaces:**
- Produces `normalizeEmail(value): string`, `isValidEmail(value): boolean`, `mapAuthError(error): string`, and `safeReturnPath(value, fallback): string`.

- [ ] Install `@supabase/supabase-js`, `vitest`, `jsdom`, Testing Library, and user-event.
- [ ] Add `test` and `test:watch` scripts plus jsdom setup.
- [ ] Write failing unit tests for email normalization, unsafe external return URLs, and stable Russian provider errors.
- [ ] Run targeted tests and confirm they fail because modules are missing.
- [ ] Implement the smallest pure helpers that satisfy the tests.
- [ ] Run the targeted tests and confirm they pass.

### Task 2: Supabase adapter and persistent auth provider

**Files:**
- Create: `src/lib/auth/client.ts`, `src/lib/auth/service.ts`, `src/lib/auth/types.ts`
- Create: `src/components/auth/auth-provider.tsx`, `src/components/auth/protected-route.tsx`
- Modify: `src/app/layout.tsx`
- Test: `src/lib/auth/service.test.ts`, `src/components/auth/auth-provider.test.tsx`

**Interfaces:**
- Produces `requestEmailCode(email)`, `verifyEmailCode(email, token)`, `signOut()`, `useAuth()`, and `<ProtectedRoute>`.

- [ ] Write failing service tests using an injected narrow Supabase client contract.
- [ ] Confirm RED for OTP request, verification, and sign-out behavior.
- [ ] Implement the browser client with `persistSession: true`, `autoRefreshToken: true`, and `detectSessionInUrl: true`.
- [ ] Implement provider state restoration through `getSession()` and `onAuthStateChange()`.
- [ ] Add the provider to the root layout and run tests to GREEN.

### Task 3: Login page and interaction design

**Files:**
- Create: `src/app/login/page.tsx`, `src/app/login/login.css`
- Test: `src/app/login/page.test.tsx`

**Interfaces:**
- Consumes auth service helpers and `useAuth()`.
- Produces accessible two-state email/OTP UI and safe redirect behavior.

- [ ] Write failing component tests for email validation, transition to OTP, six-digit paste, resend cooldown, provider errors, and successful redirect.
- [ ] Confirm the tests fail against the missing page.
- [ ] Implement the editorial proof strip and focused form layout using existing KreoFlow assets and fonts.
- [ ] Implement email submission, OTP verification, code normalization, 60-second resend countdown, disabled duplicate submissions, and `aria-live` feedback.
- [ ] Render a clear setup message when public Supabase configuration is absent.
- [ ] Run component tests to GREEN and check reduced-motion/focus CSS.

### Task 4: Guard Studio and add sign-out

**Files:**
- Modify: `src/app/studio/page.tsx`
- Test: `src/components/auth/protected-route.test.tsx`

**Interfaces:**
- Consumes `<ProtectedRoute>`, `useAuth()`, and `signOut()`.

- [ ] Write failing tests for loading, unauthenticated redirect, authenticated content, and sign-out.
- [ ] Wrap Studio content in the protected boundary without changing its order-management behavior.
- [ ] Add a compact account control showing the current email and `Выйти`.
- [ ] Run guard tests and the full suite.

### Task 5: Static deployment configuration and verification

**Files:**
- Create: `.env.example`
- Modify: `.github/workflows/deploy.yml`, `README.md`

**Interfaces:**
- Documents `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

- [ ] Add public variables to the GitHub Pages build environment without adding values to git.
- [ ] Document dashboard OTP template, 10-minute expiry, 60-second resend, URLs, and persistent-session behavior.
- [ ] Run `pnpm test`, `pnpm lint`, `pnpm build`, and `GITHUB_PAGES=true pnpm build`.
- [ ] Launch locally and verify `/login` at desktop and mobile widths with screenshots, keyboard focus, no overflow, and no console errors.
- [ ] Review `git diff` to confirm existing landing changes were preserved.
