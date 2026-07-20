# KreoFlow video quality audit

**Date:** 2026-07-20  
**Pre-implementation verdict:** none of the earlier MP4s audited below was ready to be called a finished performance ad. They were motion/spec studies; most sold KreoFlow’s production style rather than the client’s product.

This is a preflight assessment, not a CTR/CVR prediction.

## Scorecard

| Existing output | Score / 100 | Verdict |
| --- | ---: | --- |
| `kreoflow-ten-v6/deliverables-site-style/*` | 22 | Reject |
| `kreoflow-ten-v6/deliverables-v2/*` | 31 | Reject; best raw material for a recut |
| `kreoflow-feeling-v5` | 31 | Reject |
| `kreoflow-scrollstop-v3` | 35 | Reject |
| `kreoflow-motion-v4` | 41 | Reject; strongest isolated product-motion shot |
| `kreoflow-tiktok-ep01` | 47 | Reject |
| `nova-one` | 50 | Portfolio mood film, not a conversion ad |
| `kreoflow-tiktok-redo` | 54 | Closest KreoFlow meta-ad; hard reject for circular proof |

## Root causes

### 1. The product never reaches production

The website brief is converted into canned beauty/fitness text and placeholder assets in `src/lib/generator.ts`. The offline render scripts consume unrelated, hard-coded media. There is no shared product truth, claim ledger, Creative Spec, shot manifest, provider job, or QA contract.

### 2. One site style was mistaken for ten ad ideas

The batch uses the same 8.4-second timing and KreoFlow end tag across products. Only a noun, source still, and decorative effect change. The site’s scrapbook/editorial language shrinks the product into a card and covers it with agency copy. Landing-page identity and client-product advertising are different jobs.

### 3. Hooks describe KreoFlow’s customer pain, not the buyer’s desire

“Your product gets scrolled,” “your product just stands there,” and “a product is not a photo” sell creative services. They do not identify a perfume, shoe, watch, speaker, or headphone buyer, product reason-to-believe, offer, or action.

### 4. The strongest case still has identity and conversion gaps

NOVA ONE has the best emotional arc and sound design, but the human shots and packshot do not preserve all product geometry. The benefit arrives late, the brand arrives after nine seconds, and there is no conversion CTA. It is retained as a clearly labelled fictional spec case, not represented as a verified client campaign.

### 5. One proof video is circular

`kreoflow-tiktok-redo` labels poster frames derived from finished output videos as `INPUT.JPG`, then claims `4 photos → 4 videos`. That is not valid input/output proof and must never be used in a commercial or judge-facing claim.

### 6. Audio and delivery are inconsistent

- Existing masters cluster around acceptable average loudness, but the batch loops have almost no loudness range.
- Some `ten-v6` outputs exceed the safe true-peak target before platform transcoding.
- The batch exports AAC at 96 kHz while the rest use 48 kHz.
- The current QA records intent and codec facts but does not block unsupported claims, product drift, missing CTA, safe-zone failures, or circular evidence.

## New acceptance rubric

Passing score: **80/100 and no hard reject**.

| Dimension | Weight |
| --- | ---: |
| Product truth, offer, audience | 20 |
| Hook and payoff | 15 |
| Identity, continuity, provenance | 15 |
| Ad structure and pacing | 15 |
| Framing and visual craft | 10 |
| Copy, CTA, safe zones | 10 |
| Sound | 10 |
| Delivery spec | 5 |

Measurable preflight targets:

- By 0.5 seconds, the product/category occupies at least 15% of the frame or the problem/benefit is understandable without sound.
- By 1.5 seconds, a viewer can name the product category and main promise.
- By 3 seconds, the benefit is clear; by 5 seconds, the ad shows proof or a product demonstration.
- No silent static beat lasts longer than 1.5 seconds in the opening.
- Essential text is at least 44 px at 1080×1920, no more than seven words in the hook, with a minimum 0.8-second hold.
- Essential text stays around `x=80–1000`, `y=150–1500`.
- A conversion CTA names a real action and destination and remains visible for at least 1.5 seconds.
- Audio target is `-16 ±2 LUFS`, true peak `≤ -1 dBFS`, stereo AAC 48 kHz.
- Delivery is H.264 High, yuv420p, CFR 24/30, 1080×1920, faststart, and fully decodable.

Hard reject:

- fake or circular input/output proof;
- unsupported factual claim;
- product/logo/material/colour/geometry drift presented as the same SKU;
- client ad sells KreoFlow instead of the product;
- product and benefit remain unclear at 1.5 seconds;
- no payoff for the hook;
- essential copy outside the safe zone or unreadable;
- missing CTA for a conversion objective;
- true peak above -1 dBFS, decode error, or wrong delivery format;
- missing source-rights/provenance record.

## What remains usable

- `runway-sneaker-motion.mp4`: strongest existing product-motion source; reuse without old overlays.
- `runway-product-film.mp4`: usable perfume/paint transformation.
- `runway-watch-feeling.mp4`: usable as a calm insert, not a complete ad.
- `ten-v6/deliverables-v2` raw full-bleed material, especially concepts 01–03; do not reuse the site-style frame.
- The pacing/layout idea from `tiktok-redo`, but only with authentic source images.
- NOVA ONE human and packshot fragments when clearly marked as a fictional AI spec case and not overclaimed as identity-verified.

## System decision

Stop iterating one long provider prompt. The minimum reliable path is:

`Brief → CreativeSpec → Asset/Provenance Ledger → Shot Manifest → Render → Automated Preflight → Human Commercial QA → Delivery`

The renderer must not start until product truth and provenance pass. A provider generation is raw footage, not a ready ad.

## Post-implementation observations — accountable compiler replay

Artifact: `public/media/build-week/ad-compiler/nova-one-accountable-ad.mp4`

These are internal, non-independent heuristic observations. They are not a score,
external validation, campaign-performance evidence, or human commercial approval.
Human review remains pending.

| Dimension | Observed evidence |
|---|---|
| Product clarity and desire | Headphones dominate frame zero; the clean packshot makes the fictional SKU legible. |
| Hook and payoff | “TOO MUCH CITY?” resolves into control/ANC; the intended payoff is understandable without sound. |
| Identity, continuity, provenance | Human and packshot sources are visually coherent and disclosed as fictional; a human must still confirm identity. |
| Ad structure and pacing | Problem, emotional shift, sourced feature, identity, and two-second CTA form a complete 12-second arc. |
| Framing and visual craft | Controlled crop, blue/red signal system, and restrained motion; limited by still-source material. |
| Copy, CTA, safe zones | Short copy, clear hierarchy, safe-zone placement, and a specific final action. |
| Sound | Existing score measured -17.3 LUFS and -3.6 dBFS true peak; no original product sound design was created. |
| Delivery spec | H.264 High, yuv420p, 1080x1920, 30 fps, AAC LC 48 kHz stereo, 12.053 seconds. |

No hard reject was observed in the internal contact-sheet, keyframe, full-decode, or technical-probe pass. The generic renderer used all three declared image assets by `scene.assetId`; its source-byte manifest also includes the explicit audio file. This is not a performance result or legal/platform approval. The MP4 is public as a fictional proof artifact but is not approved for campaign use; this prototype records human approval against current evidence, source-media, spec, QA, and render hashes but does not implement publishing enforcement.
