import type { Metadata } from "next";
import Link from "next/link";

import qaReceipt from "../../../public/media/build-week/ad-compiler/nova-one-qa-receipt.json";
import creativeSpec from "../../../samples/nova-one/creative-spec.json";
import productEvidence from "../../../samples/nova-one/product-evidence.json";

import "./showcase.css";

export const metadata: Metadata = {
  title: "KreoFlow — accountable ad compiler",
  description:
    "A proof-first KreoFlow prototype: product evidence becomes a typed CreativeSpec, a schema-bound ad render, and an inspectable QA receipt.",
};

const mediaBase = process.env.GITHUB_PAGES === "true" ? "/kreoflow" : "";
const asset = (path: string) => `${mediaBase}${path}`;
const shortHash = (hash: string) => `${hash.slice(0, 12)}…`;
const observedAt = `${qaReceipt.generatedAt.slice(0, 16).replace("T", " ")} UTC`;
const blockingChecks = qaReceipt.checks.filter((check) => check.blocking);
const passedChecks = blockingChecks.filter((check) => check.passed).length;
const receiptCheck = (id: string) =>
  qaReceipt.checks.find((check) => check.id === id);
const checkActual = (id: string) => receiptCheck(id)?.actual ?? "missing";
const checkResult = (ids: string[], source: string) =>
  `${ids.every((id) => receiptCheck(id)?.passed === true) ? "PASS" : "FAIL"} · ${source}`;

const displaySigned = (value: number | null, unit: string) =>
  value === null ? "missing" : `${String(value).replace("-", "−")} ${unit}`;

const productName = productEvidence.product.name;
const supportedClaim =
  productEvidence.claims.find(
    (claim) => claim.id === creativeSpec.supportedPromiseClaimId,
  ) ?? productEvidence.claims[0];
const blockedClaim =
  productEvidence.claims.find((claim) => claim.status === "blocked") ??
  productEvidence.claims.at(-1)!;
const supportedClaimSceneIndex = creativeSpec.scenes.findIndex(
  (scene) => scene.overlay.claimId === supportedClaim.id,
);
const supportedClaimScene = creativeSpec.scenes[supportedClaimSceneIndex];
const referencedClaimIds = new Set(
  creativeSpec.scenes
    .map((scene) => scene.overlay.claimId)
    .filter((claimId): claimId is string => claimId !== null),
);
const allowedReferencedClaims = productEvidence.claims.filter(
  (claim) =>
    referencedClaimIds.has(claim.id) && claim.status === "source_attributed",
).length;
const sceneRoleLabels: Record<string, string> = {
  human_context: "Human context",
  clean_product: "Clean product",
  product_detail: "Product detail",
  end_card: "End card",
};

const pipeline = [
  {
    id: "01",
    label: "Evidence",
    title: "Lock the product truth",
    copy: "KreoFlow accepts named product assets and source-attributed claims. Referenced factual lines must match their evidence; semantic copy review stays human.",
    status: `${productEvidence.assets.length} assets · ${allowedReferencedClaims} sourced ${allowedReferencedClaims === 1 ? "claim" : "claims"}`,
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
    copy: "The renderer follows scene timings, assets, overlays, CTA and sound from the validated spec. The composition can be re-rendered; each encode gets its own exact receipt.",
    status: "repeatable composition",
  },
  {
    id: "04",
    label: "QA + approval",
    title: "Ship with a receipt",
    copy: "FFprobe and loudness checks create a technical receipt. Human approval stays mandatory for identity, legibility, claims and commercial quality.",
    status: "technical PASS · human pending",
  },
];

const scenes = creativeSpec.scenes.map((scene) => [
  `${scene.startSeconds.toFixed(1).padStart(4, "0")}—${scene.endSeconds.toFixed(1).padStart(4, "0")}`,
  sceneRoleLabels[scene.kind] ?? scene.kind,
  scene.cta ?? scene.overlay.text,
]);

const receiptRows = [
  [
    "Frame",
    `${qaReceipt.summary.width ?? "missing"} × ${qaReceipt.summary.height ?? "missing"}`,
    checkResult(["dimensions"], "ffprobe"),
  ],
  [
    "Video",
    `${checkActual("video_codec").toUpperCase()} ${checkActual("video_profile")} / ${checkActual("pixel_format")} / ${checkActual("fps")} fps`,
    checkResult(
      ["video_codec", "video_profile", "pixel_format", "fps"],
      "ffprobe",
    ),
  ],
  [
    "Runtime",
    `${qaReceipt.summary.durationSeconds.toFixed(3)} seconds`,
    checkResult(["duration"], "target ±0.15"),
  ],
  [
    "Audio",
    `${checkActual("audio_codec").toUpperCase()} / ${qaReceipt.summary.audioSampleRate === null ? "missing" : `${qaReceipt.summary.audioSampleRate / 1000} kHz`} / ${checkActual("audio_channels") === "2" ? "stereo" : `${checkActual("audio_channels")} channels`}`,
    checkResult(
      ["audio_stream", "audio_codec", "audio_sample_rate", "audio_channels"],
      "ffprobe",
    ),
  ],
  [
    "Loudness",
    displaySigned(qaReceipt.summary.integratedLufs, "LUFS"),
    checkResult(["loudness"], "ebur128"),
  ],
  [
    "True peak",
    displaySigned(qaReceipt.summary.truePeakDbfs, "dBFS"),
    checkResult(["true_peak"], "ebur128"),
  ],
  [
    "Media manifest",
    shortHash(qaReceipt.mediaManifestHash),
    `${productEvidence.assets.length} images + audio bytes`,
  ],
  [
    "Causal render",
    shortHash(qaReceipt.renderReceiptHash),
    "BOUND · receipt matched",
  ],
];

export default function BuildWeekPage() {
  return (
    <main className="bw-page" lang="en">
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
            <span>{productName}</span>
            <span>{creativeSpec.aspectRatio}</span>
          </div>
          <div className="bw-video-stage">
            <video
              controls
              playsInline
              preload="metadata"
              poster={asset(
                "/media/build-week/ad-compiler/nova-one-accountable-poster.jpg",
              )}
              aria-label={`${productName} fictional product advertisement, rendered by the KreoFlow fixture pipeline`}
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
            <span className="bw-badge bw-badge-ready">Live adapter implemented</span>
          </div>
          <p className="bw-kicker">Product evidence → finished vertical ad</p>
          <h1 id="bw-title">A finished ad with a receipt.</h1>
          <p className="bw-lede">
            KreoFlow is an accountable compiler for product advertising. It constrains the
            strategy to sourced product facts, renders the validated scene plan, then records
            what passed and what still needs a human decision.
          </p>

          <div className="bw-hero-proof" aria-label="Current proof state">
            <div>
              <span>Output</span>
              <strong>{qaReceipt.summary.durationSeconds.toFixed(3)} s</strong>
              <p>Vertical H.264 master</p>
            </div>
            <div>
              <span>Claim safety</span>
              <strong>
                {allowedReferencedClaims} / {referencedClaimIds.size}
              </strong>
              <p>Visible claim is sourced</p>
            </div>
            <div>
              <span>Human review</span>
              <strong>Pending</strong>
              <p>Required before campaign use</p>
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
              <span>claim / {supportedClaim.id}</span>
              <strong>Source attributed</strong>
            </div>
            <blockquote>“{supportedClaim.text}”</blockquote>
            <dl>
              <div>
                <dt>Source</dt>
                <dd>{supportedClaim.source.reference}</dd>
              </div>
              <div>
                <dt>Used at</dt>
                <dd>
                  Scene {String(supportedClaimSceneIndex + 1).padStart(2, "0")} ·{" "}
                  {supportedClaimScene.startSeconds.toFixed(1)}—
                  {supportedClaimScene.endSeconds.toFixed(1)}
                </dd>
              </div>
            </dl>
          </article>

          <article className="bw-claim-card bw-claim-card-blocked">
            <div className="bw-claim-topline">
              <span>claim / {blockedClaim.id}</span>
              <strong>Blocked</strong>
            </div>
            <blockquote>“{blockedClaim.text}”</blockquote>
            <p>
              No substantiating source supplied. The compiler refuses the line instead of
              quietly turning a marketing draft into product evidence.
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
            <span>Human commercial review</span>
            <strong>Pending</strong>
            <p>
              <a href="https://github.com/maks1son/kreoflow/blob/main/docs/build-week/VIDEO-AUDIT.md">
                Inspect the rubric ↗
              </a>
            </p>
          </div>
        </header>

        <div className="bw-receipt-grid">
          <article className="bw-tech-receipt">
            <header>
              <div>
                <span>Technical receipt</span>
                <strong>
                  {passedChecks} / {blockingChecks.length} blocking checks
                </strong>
              </div>
              <span
                className={qaReceipt.passed ? "bw-receipt-pass" : "bw-receipt-pending"}
              >
                {qaReceipt.passed ? "Pass" : "Fail"}
              </span>
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
              Observed {observedAt}. Evidence <code>{shortHash(qaReceipt.evidenceHash)}</code>,
              spec <code>{shortHash(qaReceipt.specHash)}</code>, render{" "}
              <code>{shortHash(qaReceipt.renderHash)}</code>, source media{" "}
              <code>{shortHash(qaReceipt.mediaManifestHash)}</code>, and causal render receipt{" "}
              <code>{shortHash(qaReceipt.renderReceiptHash)}</code> are content-bound in the
              fresh QA receipt. {" "}
              <a
                href={asset(
                  "/media/build-week/ad-compiler/nova-one-qa-receipt.json",
                )}
                download
              >
                Inspect QA JSON ↓
              </a>{" "}
              <a
                href={asset(
                  "/media/build-week/ad-compiler/nova-one-render-receipt.json",
                )}
                download
              >
                Inspect render JSON ↓
              </a>
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
            <p>
              Approval expires whenever evidence, source media, spec, QA receipt, or rendered
              file changes.
            </p>
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
          <li>{productName} is a fictional spec product, not a client performance case.</li>
          <li>The public route replays a fixture; it does not perform a live GPT-5.6 call.</li>
          <li>Technical QA cannot prove identity fidelity, legality or conversion lift.</li>
          <li>Human review must catch factual copy incorrectly labelled as creative language.</li>
          <li>Provider generation and live product-page ingestion are not part of this proof.</li>
          <li>The current renderer accepts declared PNG, JPEG or WebP stills; video inputs are not implemented.</li>
          <li>The browser brief is still a legacy intake and is not connected to this local render CLI.</li>
          <li>No Build Week submission is claimed while the eligibility blocker remains.</li>
        </ul>
      </section>

      <section className="bw-cta" aria-labelledby="cta-title">
        <p className="bw-kicker">Inspect the work</p>
        <h2 id="cta-title">Replay one accountable ad. Inspect every artifact.</h2>
        <div className="bw-cta-actions">
          <a
            href={asset(
              "/media/build-week/ad-compiler/nova-one-qa-receipt.json",
            )}
            className="bw-button bw-button-primary"
            download
          >
            Download QA receipt <span aria-hidden="true">↓</span>
          </a>
          <a
            href="https://github.com/maks1son/kreoflow"
            className="bw-button bw-button-secondary"
          >
            Inspect the repository <span aria-hidden="true">↗</span>
          </a>
          <Link href="/" className="bw-button bw-button-secondary">
            See the KreoFlow service <span aria-hidden="true">→</span>
          </Link>
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
