# KreoFlow — Build Week submission scaffold

> **Do not submit this verbatim.** Rewrite it in the builder’s own voice after the final implementation and demo are verified. Official eligibility currently blocks a Russia-resident entrant.

## Recommended track

**Work & Productivity** — KreoFlow reduces the fragmented production work between product evidence and a review-ready ad asset. The technical “compiler” framing is important, but the end user is a seller or marketer rather than a developer.

## One line

KreoFlow compiles product evidence into a typed creative plan, a schema-bound vertical ad, a QA receipt, and an explicit human-approval record.

## Problem

Small product teams do not lack AI tools. They lack a reliable production path. Product facts live in one place, images in another, prompts in a third, and the final edit often cannot explain which claims are supported or whether the exported file matches the approved plan.

## Solution

KreoFlow treats each ad as a Creative Container. GPT‑5.6 converts source-attributed product evidence into a schema-validated Creative Spec. A schema-driven Remotion renderer turns the spec and supplied media into a 9:16 MP4. Preflight rejects missing, blocked, pending, or text-mismatched claim references, while post-render checks block broken deliverables. Human semantic review and approval bind the exact evidence, spec, QA receipt, and video hashes.

## Why GPT-5.6

Rules can validate a plan but cannot choose a persuasive audience, angle, or scene logic from ambiguous product material. GPT‑5.6 performs that semantic planning and returns it through Structured Outputs. KreoFlow keeps model judgment on the creative side and deterministic enforcement on the execution side.

## How Codex was used

Codex mapped the pre-existing product, audited every prior video, researched the event and public projects, wrote the design contract and tests, implemented the compiler and renderer, performed visual/browser QA, and documented the repeatable judge path. Add the primary Codex Session ID here only after using `/feedback` in the real primary task.

## Build Week delta

Before Build Week, KreoFlow had a polished product shell, a deterministic text planner, and manually produced portfolio videos. During Build Week it gained the versioned evidence/Creative Spec contract, GPT‑5.6 adapter, schema-driven product-ad renderer, blocking QA gates, approval receipts, one-command sample, and judge-facing proof flow.

## Honest limits

- The committed sample can be re-rendered without an API key by replaying a labelled fixture; repeated encoded bytes are not promised to be identical.
- Live GPT mode needs valid GPT‑5.6 API access and is never silently substituted.
- The current renderer supports one 9:16 template and supplied media.
- Claim provenance does not guarantee factual truth, legality, or platform approval.
- Ad effectiveness still requires human judgment and real campaign testing.

## Proof fields to fill after verification

- Sample command: `{{command}}`
- Fresh test result: `{{tests}}`
- Render time and machine: `{{measured_result}}`
- Output SHA-256: `{{render_hash}}`
- Spec SHA-256: `{{spec_hash}}`
- QA receipt: `{{path_or_url}}`
- Public demo: `{{url}}`
- Repository: `{{url}}`
- Codex Session ID: `{{session_id}}`
