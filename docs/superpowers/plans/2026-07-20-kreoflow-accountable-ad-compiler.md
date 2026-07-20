# KreoFlow Accountable Ad Compiler — Implementation Plan

**Goal:** ship a replayable `evidence → CreativeSpec → MP4 → QA → approval` path with a fresh exact-output receipt for every encode, plus a judge-ready proof package.

## Task 1 — Contract and red tests

**Files:**

- `src/lib/ad-compiler/schema.ts`
- `src/lib/ad-compiler/compiler.test.ts`
- `samples/nova-one/product-evidence.json`
- `samples/nova-one/creative-spec.json`

1. Add failing tests for valid compilation, unsupported claims, timing gaps, text density, early product reveal, CTA, and approval invalidation.
2. Run the focused tests and confirm they fail for the expected missing implementation.
3. Implement the minimum schema/validation/hash functions.
4. Run focused tests to green.

## Task 2 — GPT-5.6 semantic compiler

**Files:**

- `src/lib/ad-compiler/prompt.ts`
- `src/lib/ad-compiler/openai.ts`
- `src/lib/ad-compiler/openai.test.ts`
- `.env.example`

1. Add red tests around request shape and fixture/live labelling.
2. Implement the official Responses API adapter with `gpt-5.6-terra`, medium reasoning, Structured Outputs, and a stable safety identifier input.
3. Fail clearly when live mode lacks `OPENAI_API_KEY`; never silently claim GPT output.
4. Verify with an injected fake client; do not spend API money.

## Task 3 — Schema-bound, repeatable video composition

**Files:**

- `video/index.ts`
- `video/Root.tsx`
- `video/ProductAd.tsx`
- `video/styles.ts`
- `scripts/ad-compiler/render.mts`
- `samples/nova-one/assets/*`

1. Add Remotion dependencies at one matching version.
2. Build the 12-second NOVA ONE composition from the approved visual plan.
3. Render 1080×1920 H.264/AAC locally from the fixture.
4. Create a timeline contact sheet and visually critique the result.
5. Iterate until text, product visibility, pacing, and end card are commercially credible.

## Task 4 — QA and approval receipts

**Files:**

- `src/lib/ad-compiler/qa.ts`
- `src/lib/ad-compiler/approval.ts`
- `scripts/ad-compiler/qa.mts`
- `scripts/ad-compiler/approve.mts`
- `samples/nova-one/output/*.json`

1. Add red tests for ffprobe parsing, technical failures, and stale approval.
2. Run semantic preflight before render and ffprobe checks after render.
3. Write versioned receipts with hashes and explicit heuristic limitations.
4. Produce a sample approval receipt after the final render.

## Task 5 — One-command judge path

**Files:**

- `scripts/ad-compiler/demo.mts`
- `package.json`
- `README.md`
- `docs/build-week/EXPERT-PROMPTS.md`
- `docs/build-week/SUBMISSION-DRAFT.md`
- `docs/build-week/DEMO-SCRIPT.md`
- `docs/build-week/RESEARCH.md`

1. Add `pnpm demo:ad` for the keyless fixture path and `pnpm demo:ad:live` for explicit API mode.
2. Document exact setup, architecture, Build Week delta, tests, privacy, constraints, replayability, and the non-guarantee of byte-identical encodes.
3. Save three reusable prompts: creative director, adversarial video QA, and submission storyteller.
4. Draft human-editable submission copy and a sub-three-minute demo script without claiming official ranking or eligibility.

## Task 6 — Public proof page

**Files:**

- `src/app/build-week/page.tsx`
- `src/app/build-week/showcase.css`
- `public/media/build-week/*`

1. Preserve the existing editorial page and add the accountable-compiler proof trace.
2. Show source badge, blocked claim, spec summary, QA receipt, approval state, and real output.
3. Fix base-path-safe media references.
4. Verify desktop/mobile, keyboard focus, reduced motion, and no horizontal overflow with Playwright.

## Task 7 — Final verification and release

1. Run focused tests, full tests, lint, and production build from fresh commands.
2. Run the complete sample render/QA flow and inspect `ffprobe` plus contact sheet.
3. Review `git diff` for secrets, fake claims, unrelated user files, and stale documentation.
4. Commit only intended files in coherent commits.
5. Push/deploy only if remote auth and the existing deployment path work without payment or destructive changes.
6. Update the canonical KreoFlow project note and decision log with only durable state.
