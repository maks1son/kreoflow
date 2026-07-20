# KreoFlow — accountable product-ad compiler

KreoFlow turns attributable product evidence and approved product stills into a render-ready
Creative Spec, a schema-bound vertical ad, a machine-readable QA receipt, and a
human approval receipt.

The Build Week prototype is deliberately narrow: one product, one audience, one
conversion objective, one finished 9:16 ad. Referenced factual claims must match
source-attributed evidence; missing, blocked, pending, or text-mismatched references
are rejected before rendering. Human review still catches factual language that was
incorrectly labelled as non-factual creative copy.

```text
ProductEvidence → GPT-5.6 CreativeSpec → Remotion render receipt → FFmpeg QA → human approval
```

The repository includes a keyless fictional NOVA ONE replay so the entire output
path can be verified without an API account. The live strategy adapter uses the
OpenAI Responses API with `gpt-5.6-terra`, Structured Outputs, medium reasoning,
and `store: false`; it is only invoked explicitly and never presented as having run
when the fixture path was used.

## Replay the ad compiler

```bash
pnpm install
pnpm demo:ad
pnpm verify:ad-artifacts
```

Expected public output:

- `public/media/build-week/ad-compiler/nova-one-accountable-ad.mp4`
- `public/media/build-week/ad-compiler/nova-one-accountable-poster.jpg`
- `public/media/build-week/ad-compiler/nova-one-render-receipt.json`
- `public/media/build-week/ad-compiler/nova-one-qa-receipt.json`

The command validates claim provenance and scene constraints, renders H.264 at
1080×1920/30 fps with AAC audio, measures output with `ffprobe` and FFmpeg
`ebur128`, regenerates the public poster from that exact MP4, writes a causal
render receipt and a hash-bound technical receipt, and ends with `HUMAN APPROVAL
PENDING`. After inputs validate, a failed render or QA rerun invalidates stale
downstream receipts and the poster; the build preflight separately fails closed on
any invalid or stale public chain. The command requires Node.js 24, pnpm, FFmpeg,
and ffprobe on `PATH`.

`verify:ad-artifacts` is also the build preflight. It recomputes the current
evidence, source-media, spec, render, render-receipt, and QA bindings before the
public case can deploy. It catches accidental staleness; it is not authentication,
forgery protection, or an independent replacement for the FFmpeg producer gate.

After a real human watches the exact MP4, approval is explicit:

```bash
pnpm ad:approve -- --approver "Reviewer name" --audio public/media/build-week/ad-compiler/nova-one-score.m4a --render-receipt public/media/build-week/ad-compiler/nova-one-render-receipt.json
```

That command re-validates the current evidence, source-media bytes, spec, causal
render receipt, encoded MP4, and full QA receipt before writing
`nova-one-approval-receipt.json`. It never runs inside `demo:ad`.

For live strategy compilation, set the server-only `OPENAI_API_KEY` and call the
adapter in `src/lib/ad-compiler/openai.ts`. API access must only be used from an
officially supported country or territory; the keyless replay remains the default.

## Run the product demo

```bash
pnpm dev
```

Open `http://localhost:3000` and visit `/build-week` for the proof-first case page.

Live GitHub Pages build:

- `https://maks1son.github.io/kreoflow/`

## Main Routes

- `/` - landing page.
- `/brief` - client intake.
- `/studio` - internal production board.
- `/delivery?orderId=rf-demo-beauty` - seeded client gallery.
- `/build-week` - accountable compiler proof and limitations.

## Notes

- Data is stored in `localStorage` under `reelsfactory.orders.v1`.
- Email OTP auth is ready for Supabase configuration; payments and external generative-video providers are not connected in v1.
- The new compiler produces a real finished ad from declared PNG, JPEG, or WebP product stills plus an explicit audio file. Video inputs, footage synthesis, and autonomous legal/platform approval are not supported yet.
- `src/lib/generator.ts` still powers the legacy browser demo; the accountable compiler contract lives in `src/lib/ad-compiler`.
- Internal project documentation lives in local-only `project-docs/`.

## Build Week evidence

- Research and rule check: `docs/build-week/RESEARCH.md`
- Current-video audit and acceptance rubric: `docs/build-week/VIDEO-AUDIT.md`
- Expert implementation prompts: `docs/build-week/EXPERT-PROMPTS.md`
- Demo script and submission draft: `docs/build-week/DEMO-SCRIPT.md`, `docs/build-week/SUBMISSION-DRAFT.md`

The public project gallery was not available during implementation, so the research
does not label any global “top submissions.” Comparisons use public local-winner and
builder-demo evidence only. No competition submission is represented by this repo.

## Email OTP authentication

The `/login` route implements passwordless email sign-in through Supabase. Sessions are persisted in the browser and refresh automatically, so a user remains signed in until they explicitly sign out, clear browser storage, or the session is revoked.

1. Copy `.env.example` to `.env.local` and add the public project URL and anon/publishable key.
2. In Supabase Authentication, keep email sign-ups enabled.
3. Change the email template to include the six-digit token with `{{ .Token }}`.
4. Use a 10-minute OTP expiry and the default 60-second resend interval.
5. Add the local and deployed site URLs to the project URL configuration.

For GitHub Pages, create repository variable `NEXT_PUBLIC_SUPABASE_URL` and repository secret `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Never add a service-role key to this frontend.

## Analytics funnel

PostHog tracks the acquisition funnel without collecting the email address, contact field, offer text, or audience text:

```text
$pageview -> email_auth_started -> email_auth_completed -> brief_started -> brief_submitted
```

Create a free PostHog project in the EU region, then add these GitHub repository variables:

```text
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

The next GitHub Pages deployment will start collecting page views and funnel events. Confirmed email accounts remain visible in Supabase under `Authentication -> Users`; conversion and traffic are viewed in PostHog. The complete event dictionary and dashboard setup are in `project-docs/21-analytics-funnel.md`.
