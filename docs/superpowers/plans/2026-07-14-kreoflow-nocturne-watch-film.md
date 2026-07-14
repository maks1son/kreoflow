# KreoFlow Nocturne Watch Film Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce one 12–15 second vertical Nocturne watch Product Flow in InVideo from five identity-consistent generated keyframes and export a verified 1080 × 1920 MP4.

**Architecture:** One generated master frame defines the fictional watch identity. Four derivative frames reuse that master as a strict visual reference; InVideo performs only restrained animation, edit, audio and typography. Local prompts, frames, export and QA notes live in one output folder.

**Tech Stack:** OpenAI built-in image generation, InVideo web editor, Chrome browser control, ffprobe/ffmpeg for local verification.

## Global Constraints

- One video equals one coherent Creative Container.
- Aspect ratio is 9:16; final resolution is 1080 × 1920.
- Runtime is 12–15 seconds; target is 13 seconds.
- No speech, hook, stock footage, generated text, visible brand or watermark.
- The same black-titanium watch identity must survive all five scenes.
- Only one restrained cobalt-blue accent is allowed.
- Text is added only in InVideo: `KreoFlow` and `PRODUCT FLOW`.
- Do not overwrite unrelated files or modify the KreoFlow application.

---

### Task 1: Master Watch Identity

**Files:**
- Create: `output/kreoflow-nocturne-watch/prompts.md`
- Create: `output/kreoflow-nocturne-watch/frames/01-master-full-reveal.png`

**Interfaces:**
- Consumes: `docs/superpowers/specs/2026-07-14-kreoflow-nocturne-watch-film-design.md`
- Produces: one approved identity reference used by every derivative frame.

- [ ] **Step 1: Create the output structure and prompt manifest**

Create the folders `output/kreoflow-nocturne-watch/frames` and `output/kreoflow-nocturne-watch/qa`. Save this exact master brief in `prompts.md`:

```markdown
# Nocturne generation prompts

## Master identity
Vertical 9:16 ultra-premium commercial product photograph of one fictional mechanical wristwatch, three-quarter full reveal. Round case made from matte black titanium, deep graphite dial with no logo and no text, thin polished hands, twelve minimal baton hour markers, precise radial-knurled crown, smooth black technical-leather strap, domed sapphire crystal, one extremely thin cobalt-blue luminous inner ring. The watch rests slightly elevated above a monolithic black-glass plinth in a dark graphite studio. One narrow cold-white strip light reveals the case geometry; controlled reflections; faint smoky atmosphere; high-end real camera product photography, 100mm macro lens character, physically believable materials, meticulous industrial design, calm minimal composition, generous negative space above. Preserve exact object geometry for a multi-shot campaign. No people, no hands, no brand, no words, no numerals, no date window, no smartwatch display, no extra buttons, no gemstones, no sci-fi interface, no neon overload, no watermark.
```

- [ ] **Step 2: Generate the master frame**

Use the built-in image generation tool with the master identity prompt. Save the selected project asset as `output/kreoflow-nocturne-watch/frames/01-master-full-reveal.png`.

- [ ] **Step 3: Visually reject identity failures**

Inspect the frame at original detail. Reject and regenerate if any of these occur: readable pseudo-text, smartwatch display, duplicated crown, extra buttons, asymmetrical lugs, broken strap, blue neon spill, generic plastic materials or cropped watch.

- [ ] **Step 4: Verify the source file**

Run:

```powershell
ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 output/kreoflow-nocturne-watch/frames/01-master-full-reveal.png
```

Expected: a valid portrait image with height greater than width. Exact source size may vary; InVideo will perform the final 1080 × 1920 export.

- [ ] **Step 5: Commit the manifest and approved master**

```powershell
git add output/kreoflow-nocturne-watch/prompts.md output/kreoflow-nocturne-watch/frames/01-master-full-reveal.png
git commit -m "Create Nocturne watch master frame"
```

### Task 2: Identity-Consistent Keyframes

**Files:**
- Modify: `output/kreoflow-nocturne-watch/prompts.md`
- Create: `output/kreoflow-nocturne-watch/frames/02-crown-macro.png`
- Create: `output/kreoflow-nocturne-watch/frames/03-dial-macro.png`
- Create: `output/kreoflow-nocturne-watch/frames/04-side-profile.png`
- Create: `output/kreoflow-nocturne-watch/frames/05-signature.png`

**Interfaces:**
- Consumes: `01-master-full-reveal.png` as the strict identity reference.
- Produces: an ordered five-frame sequence ready for InVideo.

- [ ] **Step 1: Append the derivative prompt contract**

Append to `prompts.md`:

```markdown
## Shared derivative invariant
Use the supplied master image as an exact product identity reference. Preserve the identical round matte-black titanium case, graphite dial, polished hands, twelve baton markers, radial-knurled crown, black technical-leather strap, domed sapphire crystal and thin cobalt-blue inner ring. Change only camera position and crop. Do not redesign, add, remove, recolor or relabel any watch component. No text, logo, watermark or human hand.

## Crown macro
Extreme macro from a low three-quarter side angle, crown and case curvature dominate the frame, cold-white edge light traveling across the radial knurling, most of the dial falling into soft darkness, shallow depth of field, black-glass environment, physically believable premium watch photography, portrait 9:16.

## Dial macro
Extreme macro across the graphite dial, one polished hand edge, precise baton markers and the very thin cobalt-blue inner ring in focus, camera grazing the sapphire crystal, restrained cold reflections, deep blacks with visible material texture, portrait 9:16.

## Side profile
Low side-profile photograph of the same watch resting on black glass, crown visible, matte titanium case and domed sapphire silhouette revealed by one cold-white strip light, clean single reflection, dark graphite background, portrait 9:16.

## Signature
The same three-quarter full reveal as the master, watch centered slightly below mid-frame, almost-black background, wider clean negative space above for editor typography, cobalt ring restrained, premium real-camera product photograph, portrait 9:16.
```

- [ ] **Step 2: Generate four referenced derivatives**

For each derivative, use `01-master-full-reveal.png` as the image reference and combine the shared invariant with the scene-specific prompt. Save each result at its specified path.

- [ ] **Step 3: Compare object identity**

Inspect all five images together. The crown count, case outline, strap attachment, marker count, hand design and blue ring must match. Regenerate only the failing derivative; never silently accept a redesigned watch.

- [ ] **Step 4: Verify all images are readable**

Run:

```powershell
Get-ChildItem output/kreoflow-nocturne-watch/frames/*.png | ForEach-Object { ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 $_.FullName }
```

Expected: five valid portrait images.

- [ ] **Step 5: Commit the approved keyframes**

```powershell
git add output/kreoflow-nocturne-watch/prompts.md output/kreoflow-nocturne-watch/frames
git commit -m "Add Nocturne watch campaign keyframes"
```

### Task 3: InVideo Assembly And Export

**Files:**
- Create: `output/kreoflow-nocturne-watch/invideo-edit-spec.md`
- Create: `output/kreoflow-nocturne-watch/kreoflow-nocturne-watch-v1.mp4`

**Interfaces:**
- Consumes: the five approved frames in storyboard order `02`, `03`, `04`, `01`, `05`.
- Produces: one exported MP4 and a reproducible edit specification.

- [ ] **Step 1: Save the exact timeline**

Create `invideo-edit-spec.md` with:

```markdown
# InVideo edit specification

- Canvas: 9:16, 1080 × 1920
- 00.0–02.2: 02-crown-macro, subtle macro push-in, metal click
- 02.2–04.8: 03-dial-macro, slow left-to-right slide, one quiet tick
- 04.8–07.4: 04-side-profile, shallow 10-degree arc, low ambient pulse enters
- 07.4–10.8: 01-master-full-reveal, slow 10–15 degree orbit or restrained push-in
- 10.8–13.0: 05-signature, movement settles; overlay KreoFlow / PRODUCT FLOW
- Transitions: direct cuts or dissolve no longer than 6 frames
- Audio: dark minimal ambient, no trailer hit, no corporate beat, no vocals
- Typography: white/off-white neutral grotesk, centered, no per-letter animation
- Forbidden: stock replacement, auto-script, voiceover, captions, glitch, particles, lens flare, speed ramps
```

- [ ] **Step 2: Open InVideo and create the project**

Use the signed-in Chrome session. Create a vertical blank project rather than a stock/template-led workflow. Upload only the five approved frames.

- [ ] **Step 3: Assemble the timeline**

Place frames in `02 → 03 → 04 → 01 → 05` order with the exact durations above. Apply the least deforming available motion; if image-to-video changes watch geometry, replace it with editor pan/zoom.

- [ ] **Step 4: Add audio and typography**

Choose or generate a dark minimal ambient bed with no vocals. Add restrained metal/tick accents if available. Add the final two-line overlay exactly as specified; do not place text inside generated imagery.

- [ ] **Step 5: Export**

Export 1080 × 1920 MP4 without watermark to `output/kreoflow-nocturne-watch/kreoflow-nocturne-watch-v1.mp4`. If the signed-in plan blocks clean export, preserve the project and record the exact plan/paywall message instead of attempting to remove a watermark.

- [ ] **Step 6: Commit reproducible edit metadata**

```powershell
git add output/kreoflow-nocturne-watch/invideo-edit-spec.md
git commit -m "Document Nocturne InVideo edit"
```

### Task 4: Final Video QA

**Files:**
- Create: `output/kreoflow-nocturne-watch/qa/verification.md`
- Create: `output/kreoflow-nocturne-watch/qa/contact-sheet.jpg`

**Interfaces:**
- Consumes: `kreoflow-nocturne-watch-v1.mp4`.
- Produces: objective technical and visual acceptance evidence.

- [ ] **Step 1: Verify codec, dimensions and duration**

Run:

```powershell
ffprobe -v error -show_entries format=duration -show_entries stream=codec_name,width,height -of default=noprint_wrappers=1 output/kreoflow-nocturne-watch/kreoflow-nocturne-watch-v1.mp4
```

Expected: H.264-compatible MP4, 1080 × 1920, duration from 12.0 through 15.0 seconds.

- [ ] **Step 2: Extract a contact sheet**

Run:

```powershell
ffmpeg -y -i output/kreoflow-nocturne-watch/kreoflow-nocturne-watch-v1.mp4 -vf "fps=1/2.5,scale=270:480,tile=5x1" -frames:v 1 output/kreoflow-nocturne-watch/qa/contact-sheet.jpg
```

Expected: one five-frame strip representing the complete visual arc.

- [ ] **Step 3: Perform visual acceptance**

Inspect the contact sheet and video. Confirm one watch identity, no deformation, no accidental stock, no generated pseudo-text, no watermark, physically believable motion, readable final title and a coherent dark visual rhythm.

- [ ] **Step 4: Record verification**

Write `qa/verification.md` with the ffprobe result, visual checklist, InVideo project URL if available, export date and any known limitation. No unchecked or ambiguous status is allowed.

- [ ] **Step 5: Commit QA artifacts**

```powershell
git add output/kreoflow-nocturne-watch/qa
git commit -m "Verify Nocturne product film"
```
