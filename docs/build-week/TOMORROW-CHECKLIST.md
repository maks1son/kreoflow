# KreoFlow — tomorrow checklist

No payment, API purchase, competition submission, proxy entry, or false-location setup was made during the autonomous build.

## 1. Resolve eligibility before any submission action

- Read the current official Build Week rules again.
- A Russia-resident entrant is excluded by the published rules; a parent or proxy does not remove the residence rule.
- Submit only if the actual entrant can truthfully satisfy every eligibility condition. Do not route the entry through another person.

## 2. Human-review the exact output

Watch the full file with sound:

`public/media/build-week/ad-compiler/nova-one-accountable-ad.mp4`

Check product identity, factual-vs-creative language, safe zones, pacing, CTA, and whether the fictional/demo disclosure is clear. If the exact current render is approved, run:

```powershell
pnpm ad:approve -- --approver "Максим" --audio public/media/build-week/ad-compiler/nova-one-score.m4a --render-receipt public/media/build-week/ad-compiler/nova-one-render-receipt.json
```

Any later evidence, source-media, spec, render receipt, QA receipt, or MP4 change
invalidates that approval. A failed repeat QA/approval must leave no stale green
receipt behind.

## 3. Use live GPT-5.6 only from a compliant environment

- Russia is not on OpenAI's current API-supported countries list.
- Do not buy, share, or route an account through a false location.
- If the actual account and location become officially supported, add the server-only `OPENAI_API_KEY` and use the explicit `pnpm ad:strategy:live` path. The public fixture must never be labelled as a live run.

## 4. Replace the fictional SKU with a rights-cleared product

- Obtain a real client brief, approved claims, landing/product page, and rights-cleared human/packshot/detail media.
- Treat this as the highest-leverage next validation: produce multiple hook variants for one real product and ask for a concrete paid pilot, rather than adding more receipt machinery.
- Update ProductEvidence, generate/review the CreativeSpec, render, and preserve each output's causal render and QA receipts.
- Do not reuse the NOVA result as client-performance proof; it is a fictional spec demo.

## 5. Commercial/licensing decision before paid automation

- Re-check Remotion's current commercial/automator licensing for the intended SaaS/team usage.
- Choose a generative-video provider only after a small paid yield test with identity, latency, and usable-output thresholds.
- Do not add a subscription merely to make the prototype look more “AI.” The local schema-bound finish remains valuable even when provider footage is added.

## 6. Demo package only if eligibility is truthfully resolved

- Record a public, voice-over demo under three minutes.
- Show output first, then one failed claim gate, CreativeSpec, render, QA PASS, and the pending human-approval state.
- Explain the separate roles of GPT-5.6, Codex, deterministic code, and the human reviewer.
- Include the repository, README, and required Codex feedback/session evidence.
