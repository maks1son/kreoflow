import type { Metadata } from "next";
import Link from "next/link";

import "./showcase.css";

export const metadata: Metadata = {
  title: "KreoFlow — accountable ad compiler",
  description:
    "A proof-first KreoFlow prototype: product evidence becomes a typed CreativeSpec, a deterministic ad render, and an inspectable QA receipt.",
};

const mediaBase = process.env.GITHUB_PAGES === "true" ? "/kreoflow" : "";
const asset = (path: string) => `${mediaBase}${path}`;

const pipeline = [
  {
    id: "01",
    label: "Evidence",
    title: "Lock the product truth",
    copy: "KreoFlow accepts named product assets and source-attributed claims. Unsupported language is blocked before it can reach the ad.",
    status: "3 assets · 1 sourced claim",
  },
  {
    id: "02",
    label: "GPT-5.6",
    title: "Compile a CreativeSpec",
    copy: "GPT-5.6 turns bounded evidence into a typed scene plan. In this public replay, the checked-in fixture replaces a live API call.",
    status: "fixture replay",
  },
  {
    id: "03",
    label: "Render",
    title: "Execute, don’t improvise",
    copy: "The renderer follows scene timings, assets, overlays, CTA and sound from the validated spec. The render can be reproduced from the same inputs.",
    status: "deterministic path",
  },
  {
    id: "04",
    label: "QA + approval",
    title: "Ship with a receipt",
    copy: "FFprobe and loudness checks create a technical receipt. Human approval stays mandatory for identity, legibility, claims and commercial quality.",
    status: "publish remains locked",
  },
];

const scenes = [
  ["00.0—01.4", "Human context", "TOO MUCH CITY?"],
  ["01.4—04.4", "Human context", "TAKE BACK THE SIGNAL"],
  ["04.4—07.6", "Clean product", "ADAPTIVE NOISE CANCELLING"],
  ["07.6—10.0", "Product detail", "YOUR CITY. YOUR VOLUME."],
  ["10.0—12.0", "End card", "DISCOVER NOVA ONE"],
];

const receiptRows = [
  ["Frame", "1080 × 1920", "from ffprobe"],
  ["Video", "H.264 High / 30 fps", "from ffprobe"],
  ["Audio", "AAC / 48 kHz / stereo", "from ffprobe"],
  ["Loudness", "−18 to −14 LUFS", "from ebur128"],
  ["True peak", "≤ −1 dBFS", "from ebur128"],
  ["Approval", "matching spec + render hashes", "human sign-off"],
];

export default function BuildWeekPage() {
  return (
    <main className="bw-page">
      <header className="bw-nav">
        <Link href="/" className="bw-wordmark" aria-label="KreoFlow home">
          KreoFlow
        </Link>
        <p className="bw-nav-build">Accountable ad compiler / proof build 0.1</p>
        <nav className="bw-nav-links" aria-label="Case study navigation">
          <a href="#pipeline">Pipeline</a>
          <a href="#receipt">Receipt</a>
          <a href="https://github.com/maks1son/kreoflow">GitHub ↗</a>
        </nav>
      </header>

      <section className="bw-hero" aria-labelledby="bw-title">
        <div className="bw-hero-film">
          <div className="bw-video-header" aria-hidden="true">
            <span>Output / 001</span>
            <span>NOVA ONE</span>
            <span>9:16</span>
          </div>
          <div className="bw-video-stage">
            <video
              controls
              playsInline
              preload="metadata"
              poster={asset("/media/build-week/nova-one-poster.jpg")}
              aria-label="NOVA ONE fictional product advertisement, rendered by the KreoFlow fixture pipeline"
            >
              <source
                src={asset(
                  "/media/build-week/ad-compiler/nova-one-accountable-ad.mp4",
                )}
                type="video/mp4"
              />
              Your browser does not support embedded video. Use the download link beside the case.
            </video>
            <div className="bw-signal-rail" aria-hidden="true">
              <span>00</span>
              <span>03</span>
              <span>06</span>
              <span>09</span>
              <span>12</span>
            </div>
          </div>
          <div className="bw-video-footer">
            <p>Fictional product · source assets disclosed</p>
            <a
              href={asset(
                "/media/build-week/ad-compiler/nova-one-accountable-ad.mp4",
              )}
              download
            >
              Download MP4 ↓
            </a>
          </div>
        </div>

        <div className="bw-hero-copy">
          <div className="bw-status-row" aria-label="Prototype status">
            <span className="bw-badge bw-badge-fixture">Fixture replay</span>
            <span className="bw-badge bw-badge-ready">Live adapter ready</span>
          </div>
          <p className="bw-kicker">Product evidence → finished vertical ad</p>
          <h1 id="bw-title">A finished ad with a receipt.</h1>
          <p className="bw-lede">
            KreoFlow is an accountable compiler for product advertising. It constrains the
            strategy to sourced product facts, renders the approved scene plan, then records
            what passed and what still needs a human decision.
          </p>

          <div className="bw-hero-proof" aria-label="Current proof state">
            <div>
              <span>Output</span>
              <strong>12.0 s</strong>
              <p>Vertical H.264 master</p>
            </div>
            <div>
              <span>Claim safety</span>
              <strong>1 / 1</strong>
              <p>Visible claim is sourced</p>
            </div>
            <div>
              <span>Publish state</span>
              <strong>Locked</strong>
              <p>Until QA + approval match</p>
            </div>
          </div>

          <p className="bw-disclosure">
            This page is an independent research build. It does not claim a Build Week entry or
            submission; the current maintainer’s region is blocked by the published eligibility
            rules.
          </p>
        </div>
      </section>

      <section className="bw-pipeline" id="pipeline" aria-labelledby="pipeline-title">
        <header className="bw-section-heading">
          <p className="bw-kicker">One inspectable chain</p>
          <h2 id="pipeline-title">The model proposes. The contract decides.</h2>
          <p>
            A persuasive idea is not enough. Each stage leaves an artifact the next stage can
            validate, replay and reject.
          </p>
        </header>

        <div className="bw-pipeline-list">
          {pipeline.map((step) => (
            <article className="bw-pipeline-step" key={step.id}>
              <p className="bw-step-id">{step.id}</p>
              <div>
                <p className="bw-step-label">{step.label}</p>
                <h3>{step.title}</h3>
              </div>
              <p className="bw-step-copy">{step.copy}</p>
              <p className="bw-step-status">{step.status}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bw-contract" aria-labelledby="contract-title">
        <header className="bw-contract-heading">
          <p className="bw-kicker">What entered the compiler</p>
          <h2 id="contract-title">Truth stays attached to the frame.</h2>
        </header>

        <div className="bw-contract-grid">
          <article className="bw-claim-card bw-claim-card-supported">
            <div className="bw-claim-topline">
              <span>claim / adaptive-anc</span>
              <strong>Source attributed</strong>
            </div>
            <blockquote>“Adaptive noise cancelling”</blockquote>
            <dl>
              <div>
                <dt>Source</dt>
                <dd>Client brief / product evidence fixture</dd>
              </div>
              <div>
                <dt>Used at</dt>
                <dd>Scene 03 · 04.4—07.6</dd>
              </div>
            </dl>
          </article>

          <article className="bw-claim-card bw-claim-card-blocked">
            <div className="bw-claim-topline">
              <span>claim / superlative-01</span>
              <strong>Blocked</strong>
            </div>
            <blockquote>“The world’s best silence”</blockquote>
            <p>
              No source supplied. The compiler refuses the line instead of quietly turning it
              into advertising copy.
            </p>
          </article>
        </div>
      </section>

      <section className="bw-spec" aria-labelledby="spec-title">
        <div className="bw-spec-copy">
          <p className="bw-kicker">Typed CreativeSpec / fixture replay</p>
          <h2 id="spec-title">A scene plan a renderer can execute.</h2>
          <p>
            GPT-5.6’s job is creative strategy inside a schema: angle, promise, timing, asset
            role, overlay and CTA. It does not get to invent product proof or silently change the
            delivery contract.
          </p>
          <div className="bw-role-note">
            <span>Live mode</span>
            <p>
              The Responses API adapter is ready for a supported, configured environment. This
              public case deliberately replays the checked-in spec and makes no claim that a live
              model call produced this page load.
            </p>
          </div>
        </div>

        <div className="bw-scene-table" role="table" aria-label="CreativeSpec scene timeline">
          <div className="bw-scene-row bw-scene-head" role="row">
            <span role="columnheader">Time</span>
            <span role="columnheader">Asset role</span>
            <span role="columnheader">Visible copy</span>
          </div>
          {scenes.map(([time, role, copy]) => (
            <div className="bw-scene-row" role="row" key={time}>
              <span role="cell">{time}</span>
              <strong role="cell">{role}</strong>
              <span role="cell">{copy}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bw-receipt" id="receipt" aria-labelledby="receipt-title">
        <header className="bw-receipt-heading">
          <div>
            <p className="bw-kicker">Machine checks + human decision</p>
            <h2 id="receipt-title">No green badge without fresh evidence.</h2>
          </div>
          <div className="bw-score-card">
            <span>Acceptance gate</span>
            <strong>80 / 100</strong>
            <p>Target · commercial review still required</p>
          </div>
        </header>

        <div className="bw-receipt-grid">
          <article className="bw-tech-receipt">
            <header>
              <div>
                <span>Technical receipt</span>
                <strong>Awaiting generated JSON</strong>
              </div>
              <span className="bw-receipt-pending">Pending</span>
            </header>
            <div className="bw-receipt-table">
              {receiptRows.map(([check, target, source]) => (
                <div key={check}>
                  <strong>{check}</strong>
                  <span>{target}</span>
                  <em>{source}</em>
                </div>
              ))}
            </div>
            <p className="bw-receipt-foot">
              These are gates, not fabricated results. The demo command writes observed values,
              spec hash and render hash into the receipt after a fresh render.
            </p>
          </article>

          <aside className="bw-human-review" aria-labelledby="human-review-title">
            <span>Human review / required</span>
            <h3 id="human-review-title">A codec cannot judge desire.</h3>
            <ul>
              <li>Product identity stays consistent</li>
              <li>First frame stops the right audience</li>
              <li>Claim meaning matches the source</li>
              <li>Type stays legible in platform safe zones</li>
              <li>CTA earns its final 1.5 seconds</li>
            </ul>
            <p>Approval expires whenever the spec or rendered file hash changes.</p>
          </aside>
        </div>
      </section>

      <section className="bw-roles" aria-labelledby="roles-title">
        <header>
          <p className="bw-kicker">Division of responsibility</p>
          <h2 id="roles-title">Intelligence is useful when its boundary is visible.</h2>
        </header>
        <div className="bw-role-grid">
          <article>
            <span>GPT-5.6</span>
            <h3>Creative reasoning</h3>
            <p>
              Interprets evidence, chooses an angle and returns a schema-valid CreativeSpec. A
              fixture provides the same interface when a live call is unavailable.
            </p>
          </article>
          <article>
            <span>Codex</span>
            <h3>System construction</h3>
            <p>
              Built the contract, tests, renderer, QA path and this proof surface across the
              repository. The work remains inspectable in code and commits.
            </p>
          </article>
          <article>
            <span>Human</span>
            <h3>Commercial accountability</h3>
            <p>
              Owns the product truth, creative taste, legal review and final approval. KreoFlow
              does not convert an automated check into permission to publish.
            </p>
          </article>
        </div>
      </section>

      <section className="bw-limits" aria-labelledby="limits-title">
        <div>
          <p className="bw-kicker">Current boundary</p>
          <h2 id="limits-title">Honest prototype, useful next step.</h2>
        </div>
        <ul>
          <li>NOVA ONE is a fictional spec product, not a client performance case.</li>
          <li>The public route replays a fixture; it does not perform a live GPT-5.6 call.</li>
          <li>Technical QA cannot prove identity fidelity, legality or conversion lift.</li>
          <li>Provider generation and live product-page ingestion are not part of this proof.</li>
          <li>No Build Week submission is claimed while the eligibility blocker remains.</li>
        </ul>
      </section>

      <section className="bw-cta" aria-labelledby="cta-title">
        <p className="bw-kicker">Inspect the work</p>
        <h2 id="cta-title">Bring one real product. Leave with one accountable ad.</h2>
        <div className="bw-cta-actions">
          <Link href="/brief" className="bw-button bw-button-primary">
            Open the product brief <span aria-hidden="true">→</span>
          </Link>
          <a
            href="https://github.com/maks1son/kreoflow"
            className="bw-button bw-button-secondary"
          >
            Inspect the repository <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <footer className="bw-footer">
        <p>KreoFlow / accountable ad compiler</p>
        <p>Independent proof build · 2026</p>
        <a href="#bw-title">Back to output ↑</a>
      </footer>
    </main>
  );
}
