# KreoFlow Build Week demo script — 2:48 target

**Status:** production scaffold; record only after the complete demo command passes.  
**Rule:** show the real screen and exported file. Do not call fixture mode a live model run.

| Time | Screen | Voiceover |
| --- | --- | --- |
| 0:00–0:08 | Full-screen final NOVA ONE ad, strongest 2–3 beats | “A product seller can have good photos and still spend hours turning them into an ad that feels coherent.” |
| 0:08–0:18 | Input folder: brief + three product images | “KreoFlow turns those materials into one accountable Creative Container: one product, one promise, one finished vertical video.” |
| 0:18–0:36 | Evidence table; zoom on `best-in-class` (blocked) and `forty-hours` (requires approval) | “It starts with product evidence. Claims keep their source and approval state. Unsupported or unapproved claims stop before they can reach a scene.” |
| 0:36–0:58 | Compact Creative Spec view: audience, angle, five scenes, claim IDs | “GPT‑5.6 handles the semantic work: who this is for, the angle, and how the story should unfold. Structured Outputs make that plan executable instead of leaving it as prose.” |
| 0:58–1:18 | Trace view: validator → Remotion → ffprobe | “Deterministic code owns the hard boundaries: timing, text density, safe structure, evidence references, rendering, and the technical checks on the final file.” |
| 1:18–1:35 | Deliberately invalid overlay; red check; corrected overlay; green check | “When a line is too dense or uses an unsupported claim, export stops. The repair changes the spec, and the compiler checks it again.” |
| 1:35–1:58 | Render progress, then actual MP4 in Explorer/player | “The output is a real 1080 by 1920 H.264 MP4 with audio—not a mockup or a future-provider card.” |
| 1:58–2:16 | Causal render receipt, then QA receipt: duration, fps, codec and hashes | “The renderer first hash-binds the inputs and exact MP4 it produced. This is an inspectable audit record, not a cryptographic signature or authentication layer. QA rejects a mismatched render, then records media format and timing. Taste and ad effectiveness remain human judgments.” |
| 2:16–2:31 | Human-approval record; show the explicit command but do not run it before review | “Approval records a human decision against the exact evidence, source bytes, spec, QA receipt, and render. Change any one and the record becomes stale. This demo does not implement a publishing system.” |
| 2:31–2:44 | Git diff/commits and compact architecture | “Codex helped design, test, implement, critique, and verify the Build Week delta. GPT‑5.6 is the creative planner; the compiler is the accountability layer.” |
| 2:44–2:48 | Final ad end card | “KreoFlow: product evidence in, review-ready video out—with receipts.” |

## Capture checklist

- Keep the mouse still unless it is performing the narrated action.
- Use 125–150% UI zoom where text matters.
- Record the failed gate and subsequent pass live.
- Keep the final ad playback large enough to judge typography.
- Show command output only for a few seconds; the visual receipt is the primary proof.
- Replace “publishable craft” if the final QA does not justify it; “review-ready video” is the safe fallback.
