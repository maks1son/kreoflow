# OpenAI Build Week — KreoFlow research brief

**Research date:** 2026-07-20  
**Method:** official OpenAI/Devpost sources, public repositories/demos, and `last30days` social/code search.  
**Important limitation:** the global [project gallery](https://openai.devpost.com/project-gallery) is not published yet. There are no defensible global “top submissions”, finalists, or winners as of this research date.

The raw `last30days` evidence is stored outside the repository at:

`C:\Users\user\Documents\Last30Days\openai-build-week-codex-gpt-5-6-top-submissions-and-project-demos-raw-builderweek.md`

## Official facts

- Official event: [OpenAI Build Week](https://openai.com/build-week/), hosted on [Devpost](https://openai.devpost.com/).
- Submission deadline: July 21, 2026, 5:00 PM PDT — July 22, 04:00 in Syzran.
- Required technology: meaningful use of both Codex and GPT-5.6.
- Required package: project description, code repository, and a public voice-over demo under three minutes that shows a working product and explains both technologies.
- Judges may not run every repository. The video, README, sample data, and clean reproduction path are part of the product.
- Equal scored dimensions: technological implementation, design, potential impact, and quality of idea. Technical implementation is the first tie-break.
- The submission should distinguish pre-existing work from the Build Week delta.
- Do not paste AI copy unchanged into the submission. The draft in this repository is a factual scaffold for a human rewrite.

## Eligibility blocker

The [official rules](https://openai.devpost.com/rules) exclude residents of Russia. Every team member must independently satisfy eligibility. A parent can represent an under-18 student where allowed, but this does not remove the residence exclusion.

Therefore this repository can be made submission-ready and used as portfolio/community proof, but it must **not** be submitted through a proxy, with false residence, or represented as eligible. Re-check only if the entrant can truthfully establish eligibility under the rules.

## Public signal shortlist

This is not a global leaderboard. Signals are labelled so popularity and local judging are not confused with official global placement.

| Project | Public signal | What KreoFlow should learn |
| --- | --- | --- |
| DDJ400 Codex Controller | 1st at a local Tokyo community event | Physical, immediate reveal beats a long feature tour. Show `product → agent → finished ad` as a performance. |
| [File Viewer](https://github.com/flyfish-dev/file-viewer) | Strong public GitHub adoption | Give judges a live/sample sandbox and separate the Build Week delta from the older product. |
| [1flowbase](https://github.com/taichuy/1flowbase) | Strong public GitHub adoption | Make the black box observable: trace, model, latency, checks, and cost. |
| [Remnic Relay](https://github.com/joshuaswarren/remnic) | Strong public GitHub adoption | Use the dramatic sequence `failure → evidence → approval → fresh verification`. |
| [Hakushiki Kanojo](https://github.com/arugo11/hakushiki-kanojyo) | Co-leader in local Tokyo auto-judge | Provenance is UI. Separate source-backed, inferred, ambiguous, and blocked information. |
| [Player Two](https://github.com/forgottencow77/player-two) | Co-leader in local Tokyo auto-judge | A review loop is stronger than one-shot generation: observe, diagnose, repair, re-check. |
| [Nemawashi](https://github.com/pegstringer/nemawashi-fog-of-work) | Co-leader in local Tokyo auto-judge | Give invisible reasoning a coherent visual metaphor rather than another dashboard. |
| [Harigami](https://github.com/solaoi/harigami) | Co-leader in local Tokyo auto-judge | End with a tangible approved artifact and a memorable ritual. |
| [WhyMorph](https://github.com/rin0908/WhyMorph) | High local Tokyo auto-judge score | GPT proposes structured semantics; deterministic code validates and executes them. |
| [Presentation Partner](https://github.com/aya-exai/presentation-partner-public) | Public demo and local score | The AI should be a focused co-producer, and the workflow must end in a real MP4. |

## Winning pattern for KreoFlow

The strongest defensible framing is:

> KreoFlow is an accountable compiler for product ads. GPT-5.6 converts messy product evidence into a typed creative plan; deterministic rendering and QA stop unsupported claims and broken exports; a human approves the exact hashed MP4.

This is more specific and trustworthy than “AI makes videos”. It also answers the current product failure: generic visual templates are not evidence that the system understood the product.

## Demo formula

- `0–10s`: show the finished ad and the pain of manual production.
- `10–45s`: one real SKU, evidence ingestion, one deliberately blocked claim.
- `45–90s`: GPT-5.6 creates the typed Creative Spec; show only the useful fields.
- `90–130s`: deterministic render, one failed QA check, automated correction, passing receipt.
- `130–155s`: real MP4 playback, render/spec hashes, human approval.
- `155–175s`: exactly why GPT-5.6 and Codex were necessary; honest current limits.

## Claims to avoid

- “official finalist”, “top submission”, or “winner” before the gallery/results exist;
- “fully automated” or “one click” while assets and approval require human work;
- “fact-checked”, “zero hallucinations”, or “legally/platform compliant”;
- “any product”, “all formats”, “production-grade”, or “fully local” outside proven scope;
- CTR, ROAS, conversion, time, or cost improvements without a measured experiment;
- “live GPT-5.6” when the keyless demo is replaying a committed fixture.

