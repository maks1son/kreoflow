# KreoFlow Product Demo

KreoFlow is a product-demo MVP for an AI creative production service that turns one business offer into short video creatives, hooks, captions and a delivery page.

It shows the full service workflow:

- Video-first landing page with a generated hero creative.
- Multi-step client brief with autosave.
- Local AI-style creative plan generation.
- Internal Studio board for statuses and asset links.
- Client delivery gallery with scripts, captions, creative assets and content calendar.
- Demo media assets in `public/media`.

## Run

```bash
pnpm install --ignore-scripts
pnpm dev
```

Open `http://localhost:3000`.

Live GitHub Pages build:

- `https://maks1son.github.io/kreoflow/`

## Main Routes

- `/` - landing page.
- `/brief` - client intake.
- `/studio` - internal production board.
- `/delivery?orderId=rf-demo-beauty` - seeded client gallery.

## Notes

- Data is stored in `localStorage` under `reelsfactory.orders.v1`.
- Email OTP auth is ready for Supabase configuration; payments, video APIs and AI APIs are not connected in v1.
- Heavy video generation is represented as a manual/concierge workflow.
- The local generator in `src/lib/generator.ts` is the future adapter point for OpenAI, Claude or Gemini.
- Internal project documentation lives in local-only `project-docs/`.

## Email OTP authentication

The `/login` route implements passwordless email sign-in through Supabase. Sessions are persisted in the browser and refresh automatically, so a user remains signed in until they explicitly sign out, clear browser storage, or the session is revoked.

1. Copy `.env.example` to `.env.local` and add the public project URL and anon/publishable key.
2. In Supabase Authentication, keep email sign-ups enabled.
3. Change the email template to include the six-digit token with `{{ .Token }}`.
4. Use a 10-minute OTP expiry and the default 60-second resend interval.
5. Add the local and deployed site URLs to the project URL configuration.

For GitHub Pages, create repository variable `NEXT_PUBLIC_SUPABASE_URL` and repository secret `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Never add a service-role key to this frontend.
