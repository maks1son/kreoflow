# KreoFlow Accountable Ad Compiler — Design Specification

**Date:** 2026-07-20  
**Status:** Approved for autonomous implementation  
**Build Week delta:** all implementation in this document is new work after the event start.

## 1. Product thesis

KreoFlow is not positioned as another prompt-to-video lottery. It is an **accountable compiler for product ads**:

`product evidence → GPT-5.6 Creative Spec → deterministic video → QA receipt → human approval`

The user gives product facts and media. GPT-5.6 turns ambiguity into a typed creative direction. Deterministic code renders a repeatable 9:16 ad and refuses unsupported claims or invalid layouts. Every export carries a machine-readable receipt that explains what passed, what remains heuristic, and which source supports each claim.

## 2. Why the current output fails

The existing generator produces generic script strings and placeholder assets. Most existing KreoFlow videos are ads for KreoFlow itself: the same dark collage, dense typography, and agency CTA are reused across unrelated products. That optimizes a visual template, not the buyer's product, offer, or audience. The NOVA ONE case is the exception because it preserves one product, one person, one emotional arc, and a legible end card.

The rebuild therefore enforces:

- one product and one conversion objective per Creative Container;
- product visible in the opening 1.5 seconds;
- one core angle, one supported promise, one CTA;
- maximum one short text thought per scene;
- explicit evidence links for factual product claims;
- no export when a scene uses a blocked or missing claim;
- an output-first demo with a real rendered MP4, not a feature tour.

## 3. Scope for this iteration

### In scope

- A versioned `CreativeSpec` schema and fixtures.
- A lean GPT-5.6 creative-director prompt and optional live Responses API adapter.
- A deterministic Remotion renderer for a polished 1080×1920, 30 fps, 12-second product ad.
- Semantic preflight checks and technical post-render checks using `ffprobe`.
- A content-addressed approval receipt whose validity changes when spec or render changes.
- A one-command, keyless sample flow using committed evidence/spec fixtures.
- A public Build Week proof section that accurately exposes the pipeline, receipt, and current limits.
- Build Week research, demo script, submission copy draft, and reusable expert prompts.

### Out of scope tonight

- Paid image/video/voice generation.
- Claims of legal, platform, or factual verification.
- Arbitrary timelines, every aspect ratio, every product, or production-scale queues.
- Publishing a Devpost entry: official rules exclude residents of Russia, so the package is prepared but not submitted or represented as eligible.

## 4. Architecture

### 4.1 Evidence

Each claim includes an ID, exact text, source type, source reference, source excerpt, and status:

- `source_attributed`: allowed in the ad but not represented as independently verified;
- `requires_approval`: cannot render until explicitly approved;
- `blocked`: cannot appear in any scene.

The sample uses a fictional NOVA ONE client brief and labels it as a demo fixture. No CTR, ROAS, efficacy, or legal-compliance claims are invented.

### 4.2 GPT-5.6 semantic compiler

The live adapter uses the official Responses API, `gpt-5.6-terra`, `reasoning.effort: "medium"`, and Structured Outputs. GPT-5.6 is responsible for audience interpretation, angle selection, narrative sequencing, and choosing which evidence-backed claim belongs in each scene. The response must conform to `CreativeSpec`.

The API is optional because no API key is available in this environment. Keyless demo mode uses a checked-in Creative Spec and must label itself `fixture`, never `live GPT`.

### 4.3 Deterministic compiler

Code is responsible for invariants the model must not decide:

- schema and enum validation;
- scene timing and total duration;
- claim/evidence references;
- text density and safe-zone constraints;
- required product reveal and end card;
- media existence and supported types;
- deterministic Remotion composition and MP4 export;
- post-render codec, dimensions, fps, duration, audio, and hash checks.

### 4.4 Human approval

Approval contains the spec hash, render hash, approver label, timestamp, and receipt version. Any spec or render change invalidates the prior approval. It is an audit record, not a cryptographic or legal guarantee.

## 5. Visual direction

### Subject and job

The sample is a fictional premium noise-cancelling headphone launch for a city commuter. The video’s single job is to make the product desirable and land one evidence-backed feature: adaptive noise cancelling.

### Tokens

- `Night asphalt` `#07090C` — base.
- `Rain blue` `#2367FF` — product signal.
- `Headlight` `#F4F7FB` — primary type.
- `Wet concrete` `#A8B0BA` — secondary type.
- `Brake light` `#FF4B37` — used once for the opening interruption.
- Display: Barlow Condensed 800; body/utility: Instrument Sans 500/600; telemetry: IBM Plex Mono 500.

### Layout and signature

The video is cinematic and full-bleed. It avoids the existing scrapbook collage. Its signature is a **noise-to-signal line**: a jittering red waveform compresses into one calm blue line as the product takes control. Typography stays quiet and large; no scene exceeds eight visible words.

Storyboard:

```text
0.0–1.4  CHAOS        city portrait, interrupted type, red noise line
1.4–4.4  CONTROL      product interaction, line resolves to blue
4.4–7.6  FEATURE      packshot, evidence-backed feature
7.6–10.0 IDENTITY     human/product payoff, brand line
10–12.0 END CARD      product, CTA, source-attribution mark
```

Self-critique: dark + blue could become a generic tech ad. The rain-soaked source material and the single waveform transformation make the visual system specific to NOVA ONE. Extra glass cards, gradients, numbered sections, and decorative UI chrome are excluded.

## 6. Quality gates

The compiler blocks export when any blocking check fails.

### Semantic gates

- schema version supported;
- one objective and one platform;
- duration 6–30 seconds;
- product appears by 1.5 seconds;
- scene timing is continuous and ordered;
- every factual overlay references an allowed claim;
- blocked/unapproved claims are unused;
- scene overlay ≤ 8 words and ≤ 48 characters;
- CTA present in final scene;
- at least one human/product context scene and one clean product scene.

### Technical gates

- 1080×1920 output;
- H.264 video, yuv420p, 30 fps;
- duration within 0.15 seconds of spec;
- AAC audio present and non-empty;
- no missing assets;
- output and spec SHA-256 hashes recorded.

Contrast, visual salience, product consistency, and ad effectiveness remain heuristic/manual checks and are labelled accordingly.

## 7. Public proof and demo

The Build Week page leads with the rendered result, then shows a compact trace:

1. source-attributed claims, including one blocked claim;
2. the typed GPT-5.6 Creative Spec;
3. deterministic render and QA receipt;
4. human approval and hashes;
5. exact limitations and keyless reproduction command.

The three-minute demo is output-first and follows one SKU. It does not spend time on auth, generic dashboards, or fake campaign metrics.

## 8. Success criteria

- A clean checkout can run tests and build the site.
- One command renders the sample MP4 and writes a passing QA receipt without an API key.
- At least one intentionally invalid fixture is rejected by tests.
- The public proof page never claims a live API run when showing fixture data.
- The rendered ad is visually reviewed at desktop and mobile sizes and has a contact sheet.
- README clearly separates pre-existing work, Build Week delta, working scope, and limitations.

