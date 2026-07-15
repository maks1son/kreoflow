# KreoFlow Brief Email Auth Gate — Design

## Context

KreoFlow already has persistent Supabase email OTP authentication, a polished `/login` route, an app-wide `AuthProvider`, and a reusable `ProtectedRoute`. The `/studio` route is protected, but `/brief` currently mounts the form for everyone.

The requested behavior is strict: a visitor must confirm their email before seeing or filling the brief.

## Considered approaches

### 1. Redirect to the existing login route — selected

An unauthenticated visitor opening `/brief` is sent to `/login?returnTo=/brief`. After the six-digit email code is verified, the existing login flow returns the visitor to `/brief`.

Advantages: one authentication UI, no duplicated OTP state, clear route boundary, and the form never mounts before authentication.

### 2. Embed the OTP form inside `/brief`

This keeps the visitor on one URL, but duplicates the login UI and logic and increases the chance that the brief mounts or autosaves before authentication.

### 3. Show an authentication modal over the brief

This preserves visual context, but exposes the form underneath the gate, complicates keyboard/focus handling, and makes the access boundary feel less trustworthy.

## Selected UX flow

1. Visitor opens `/brief`.
2. While the Supabase session is checked, show a neutral full-page session-checking state.
3. If there is no authenticated user, replace the route with `/login?returnTo=/brief`.
4. The visitor enters an email and the six-digit OTP on the existing login screen.
5. Successful verification returns them to `/brief`.
6. Only then does the brief component mount and allow input/autosave.
7. A visitor with a valid persisted session opens the brief directly.

## Access behavior

- `/brief` uses `ProtectedRoute` with a strict configuration requirement.
- If Supabase configuration is missing, the brief fails closed and does not render the form.
- Existing `/studio` behavior is not changed unless explicitly requested later.
- Authentication remains a client-side route guard for UX. Supabase RLS remains the required security boundary for protected remote data.

## Implementation shape

- Extend `ProtectedRoute` with a `requireConfigured` option.
- Add a clear unavailable state when strict protection is requested but Supabase is not configured.
- Split the current brief export into a lightweight protected wrapper and the existing form content.
- Wrap the guard in `Suspense`, matching the established `/studio` pattern because the guard reads search parameters.
- Preserve the existing `returnTo` safety validation and OTP flow.

## Visual direction

The authentication experience remains the existing KreoFlow login page. The brief itself does not gain a modal, disabled overlay, or new decorative layer. The transition should feel intentional and clean: session check, login, then brief.

## Acceptance criteria

- An unauthenticated visitor cannot see, focus, or fill any brief field.
- They are redirected to `/login` with a safe `returnTo=/brief` value.
- Completing email OTP returns them to `/brief`.
- An authenticated visitor sees the current brief without an extra login step.
- Missing Supabase configuration does not expose the brief.
- Existing login and Studio behavior remains intact.
- Desktop and mobile layouts show no horizontal overflow or console errors.

## Test strategy

- TDD component tests for strict missing-configuration behavior, unauthenticated redirect, and authenticated child rendering.
- Existing auth unit tests continue to pass.
- Playwright verifies that the live `/brief` route redirects when signed out and that no form fields are visible before login.
- Lint, full test suite, and production build must pass before deployment.

## Self-review

- No placeholder decisions remain.
- Redirect destination and failure behavior are explicit.
- The brief form is not mounted before authentication.
- Scope is limited to gating `/brief`; the OTP implementation is reused unchanged.
- Security wording distinguishes the client UX guard from Supabase RLS.
