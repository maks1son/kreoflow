# KreoFlow Email OTP Authentication

Date: 2026-07-15
Status: ready for implementation review

## Goal

Add passwordless authentication to KreoFlow. Any person who controls a valid email address may create an account and sign in by entering a six-digit code received by email.

The first release must work with the current static GitHub Pages deployment, introduce no required paid infrastructure, and create a foundation for private projects, credits, generations, and deliveries.

## Decision basis

Взял за основу из базы: KreoFlow is currently a Next.js static product demo on GitHub Pages; its future model requires users, projects, assets, credit ledger, production jobs, and deliveries. Максим explicitly chose open registration for any verified email and a numeric code instead of passwords or a magic link.

Вывод: use Supabase Auth with email OTP. Keep the browser integration behind a small auth adapter and protect data with Supabase Row Level Security rather than relying on client-side route guards.

Почему: Supabase supports six-digit email OTP, has a sufficient free tier for validation, works from a static frontend, and can later provide the Postgres/storage foundation KreoFlow already needs.

## Alternatives considered

### Supabase Auth — selected

- Native passwordless email OTP.
- Free plan currently includes 50,000 monthly active users.
- Fits the future Postgres, Storage, RLS, and credit-ledger architecture.
- Requires configuring the email template to show `{{ .Token }}`.
- Built-in outbound email is suitable only for early testing; production should move to custom SMTP.

### Firebase Auth — rejected

- Mature client SDK and static-hosting compatibility.
- Its no-cost email-link sending limit is too restrictive for this validation flow, and numeric email OTP is less direct.
- Would split auth from the likely future Postgres data layer.

### Clerk — rejected for now

- Excellent ready-made auth UX and custom OTP flows.
- Adds another platform and encourages coupling the UI to its components.
- Supabase provides a better path from authentication into KreoFlow's application data.

## User experience

### Route

`/login`

### State 1: email

- Heading: `Войти в KreoFlow`
- Supporting copy: `Пришлём шестизначный код. Пароль не нужен.`
- One email field with a visible label and autocomplete `email`.
- Primary action: `Получить код`
- Footer reassurance: no marketing subscription is created by signing in.

Submitting a valid email calls `signInWithOtp({ email })`. The interface always displays a neutral success response to avoid revealing whether an account already exists.

### State 2: verification code

- Shows the destination email in masked or explicit user-provided form.
- Six-character numeric input with `autocomplete="one-time-code"`.
- Paste of a full code is supported.
- Primary action: `Войти`
- Secondary action: `Изменить почту`.
- Resend becomes available after 60 seconds.

Submitting calls `verifyOtp({ email, token, type: "email" })`.

### State 3: success

- The authenticated session is persisted by the Supabase browser client.
- Redirect to the original protected destination when present and safe.
- Default destination: `/studio` for the current prototype. This can later change to `/app` without changing the auth provider.

### Error states

- Invalid email: `Проверь адрес почты.`
- Invalid or expired code: `Код не подошёл или истёк. Запроси новый.`
- Rate limit: `Слишком много попыток. Подожди немного и попробуй снова.`
- Network failure: `Не удалось связаться с сервисом. Проверь интернет и повтори.`
- Configuration missing in a development build: show an explicit setup state, never a fake success.

Errors must not expose raw provider messages or reveal account existence.

## Visual direction

The login screen belongs to the product UI, not the marketing landing. It keeps KreoFlow's editorial identity but becomes quieter and operational.

### Tokens

- `ink`: `#171719`
- `paper`: `#F4F0E9`
- `white`: `#FFFDFC`
- `signal`: `#FF5A5F`
- `line`: `#D9D1C6`
- `muted`: `#706B65`

Typography reuses the project fonts. Display typography is used only for the KreoFlow signature and short heading; form copy remains highly readable.

### Layout

Desktop uses a two-part composition:

```text
┌──────────────────────────────┬─────────────────────────┐
│ KreoFlow editorial proof     │ Sign-in form            │
│ one art-directed campaign    │ email → six-digit code  │
│ fragment, cropped boldly     │ quiet security details  │
└──────────────────────────────┴─────────────────────────┘
```

Mobile collapses to a single focused form with a shallow campaign fragment above it. The form remains usable at 320 px, without horizontal scrolling.

### Signature element

A single campaign proof strip shows `BRIEF → FRAME → DELIVERY`, using one existing KreoFlow campaign asset. It connects authentication to the product's actual creative-production workflow without turning the page into another landing page.

Motion is limited to one state transition between email and code. Reduced-motion preferences disable it.

## Application architecture

### Dependencies

- `@supabase/supabase-js`
- Existing React/Next.js stack

Do not add a separate state-management or form library.

### Environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The browser anon/publishable key is expected to be public. The Supabase service-role key must never be placed in the frontend, repository, GitHub Pages variables, logs, screenshots, or Obsidian.

### Modules

- `src/lib/auth/client.ts`: lazily creates the browser Supabase client from public configuration.
- `src/lib/auth/service.ts`: provider-neutral functions for requesting and verifying an email code.
- `src/lib/auth/errors.ts`: converts provider errors into stable product messages.
- `src/components/auth/auth-provider.tsx`: owns current session loading and auth-state subscription.
- `src/components/auth/protected-route.tsx`: client-side navigation guard and loading state.
- `src/app/login/page.tsx`: page composition and auth flow state.
- `src/app/login/login.css`: isolated visual system for the login page.

The service layer prevents UI components from depending directly on Supabase response shapes.

## Route behavior

GitHub Pages uses a static export, so Next.js middleware and server-only cookie guards are not available in the current deployment.

- `/login` is public.
- `/studio` and future account routes use a client-side protected-route boundary.
- An unauthenticated visit records a local relative return path and redirects to `/login`.
- An authenticated visit to `/login` redirects to the default product route.
- `/brief` remains public for acquisition until a separate product decision requires authentication.
- Public delivery links remain unchanged until delivery authorization is designed.

The route guard is UX, not the security boundary. All private Supabase tables and storage objects must be protected with RLS policies based on `auth.uid()`.

## Supabase project configuration

When Максим authorizes connection after the login page work is ready:

1. Create or select the KreoFlow Supabase project in Максим's account.
2. Enable Email auth and allow new user sign-ups.
3. Change the email template from magic link to a six-digit OTP using `{{ .Token }}`.
4. Set OTP expiry to 10 minutes and keep resend throttling at 60 seconds.
5. Add local development and the deployed GitHub Pages origin to allowed URLs where applicable.
6. Put public project values in local `.env.local` and GitHub Actions secrets/variables used during static build.
7. Never copy a service-role secret into the browser application.

Custom SMTP is not required for the first private test. Before public traffic, configure a transactional mail provider and a KreoFlow sender domain because Supabase's built-in sender is rate-limited and not the final branded delivery path.

## Security

- Open registration means any verified email can create a user.
- Do not disclose whether an email already exists.
- Do not accept arbitrary external return URLs; allow only local application paths.
- Clear OTP values after success and when the email changes.
- Apply resend cooldown and disable duplicate submissions.
- Treat localStorage/session state as convenience, never authorization.
- Create RLS policies before storing any private user data.
- Add bot protection before paid public acquisition if abuse appears.

## Testing strategy

### Unit tests

- Email normalization and validation.
- Safe local return-path validation.
- Provider error mapping.
- Auth service success and failure contracts through a narrow injected client boundary.

### Component/browser tests

- Email state renders with correct accessible label.
- Invalid email never sends a request.
- Successful request moves to code state.
- Six-digit paste and keyboard entry work.
- Invalid code displays the stable product error.
- Resend stays disabled for 60 seconds.
- Successful verification redirects to the safe intended route.
- Missing environment configuration renders setup guidance.

### Visual and accessibility checks

- Desktop, tablet, and 320–375 px mobile screenshots.
- Visible keyboard focus.
- Logical tab order.
- Screen-reader announcement for errors and state changes.
- Sufficient contrast.
- Reduced motion honored.
- No horizontal overflow or console errors.

### Integration check after Supabase connection

- Use a real test email to receive a code.
- Verify first sign-in creates a Supabase user.
- Verify a later sign-in reuses the same identity.
- Refresh `/studio` and confirm session restoration.
- Sign out and confirm the protected route returns to `/login`.

## Scope boundaries

Included now:

- login UI;
- email OTP request and verification adapters;
- session provider;
- `/studio` route guard;
- sign-out action;
- configuration and tests.

Not included now:

- Google OAuth;
- passwords;
- teams or organizations;
- user profile editing;
- billing and credits;
- private delivery authorization;
- transactional production email setup;
- backend product tables beyond any minimum profile row required later.

## Acceptance criteria

- A new visitor can enter any valid email, receive a six-digit code, verify it, and open `/studio`.
- A returning user repeats the same flow without creating a duplicate identity.
- Sessions restore after a page refresh.
- Unauthenticated `/studio` visits redirect to `/login` and return after success.
- No private key ships to the browser.
- All automated checks, static build, and responsive browser checks pass before deployment.
