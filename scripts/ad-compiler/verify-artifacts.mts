import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

import {
  buildMediaManifestHash,
  TechnicalQaReceiptSchema,
  validateCurrentRenderReceipt,
} from "../../src/lib/ad-compiler/qa.ts";
import {
  compileCreativeSpec,
  hashCanonical,
  sha256Hex,
} from "../../src/lib/ad-compiler/schema.ts";

const defaults = {
  evidence: "samples/nova-one/product-evidence.json",
  spec: "samples/nova-one/creative-spec.json",
  audio: "public/media/build-week/ad-compiler/nova-one-score.m4a",
  video: "public/media/build-week/ad-compiler/nova-one-accountable-ad.mp4",
  renderReceipt:
    "public/media/build-week/ad-compiler/nova-one-render-receipt.json",
  qa: "public/media/build-week/ad-compiler/nova-one-qa-receipt.json",
  poster:
    "public/media/build-week/ad-compiler/nova-one-accountable-poster.jpg",
};

const allowedFlags = new Set([
  "evidence",
  "spec",
  "audio",
  "video",
  "render-receipt",
  "qa",
  "poster",
]);

function usage(): string {
  return [
    "Read-only KreoFlow public artifact freshness gate",
    "",
    "Usage:",
    "  pnpm verify:ad-artifacts [--evidence <json>] [--spec <json>]",
    "    [--audio <media>] [--video <mp4>] [--render-receipt <json>]",
    "    [--qa <json>] [--poster <image>]",
    "",
    "This detects accidental staleness. It is not authentication, forgery protection,",
    "or independent media re-measurement.",
  ].join("\n");
}

function parseArgs(argv: string[]): Map<string, string> {
  const args = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (key === "--") continue;
    if (key === "--help" || key === "-h") {
      console.log(usage());
      process.exit(0);
    }
    if (!key.startsWith("--")) {
      throw new Error(`Expected --flag value, received "${key}"`);
    }
    const flag = key.slice(2);
    if (!allowedFlags.has(flag)) {
      throw new Error(`Unknown --${flag}\n\n${usage()}`);
    }
    if (args.has(flag)) {
      throw new Error(`Duplicate --${flag} is not allowed`);
    }
    if (!argv[index + 1] || argv[index + 1].startsWith("--")) {
      throw new Error(`Expected a value for --${flag}`);
    }
    args.set(flag, argv[index + 1]);
    index += 1;
  }
  return args;
}

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, "utf8"));
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const evidencePath = resolve(args.get("evidence") ?? defaults.evidence);
  const specPath = resolve(args.get("spec") ?? defaults.spec);
  const audioInput = args.get("audio") ?? defaults.audio;
  const audioPath = resolve(audioInput);
  const videoPath = resolve(args.get("video") ?? defaults.video);
  const renderReceiptPath = resolve(
    args.get("render-receipt") ?? defaults.renderReceipt,
  );
  const qaPath = resolve(args.get("qa") ?? defaults.qa);
  const posterPath = resolve(args.get("poster") ?? defaults.poster);

  const compiled = compileCreativeSpec({
    evidence: await readJson(evidencePath),
    spec: await readJson(specPath),
  });
  if (
    compiled.evidence.sourceMode !== "fixture" ||
    compiled.spec.sourceMode !== "fixture"
  ) {
    throw new Error("Public Build Week artifacts must remain explicitly fixture-sourced");
  }
  const evidenceHash = hashCanonical(compiled.evidence);
  const renderHash = sha256Hex(await readFile(videoPath));
  const mediaManifestHash = buildMediaManifestHash({
    assets: await Promise.all(
      compiled.evidence.assets.map(async (asset) => ({
        id: asset.id,
        path: asset.path,
        sha256: sha256Hex(await readFile(resolve(asset.path))),
      })),
    ),
    audio: {
      path: audioInput,
      sha256: sha256Hex(await readFile(audioPath)),
    },
  });
  const renderReceipt = validateCurrentRenderReceipt(
    await readJson(renderReceiptPath),
    {
      evidenceHash,
      specHash: compiled.specHash,
      mediaManifestHash,
      renderHash,
      outputPath: videoPath,
    },
  );
  const qaReceipt = TechnicalQaReceiptSchema.parse(await readJson(qaPath));

  if (!qaReceipt.passed || !qaReceipt.checks.every((check) => check.passed)) {
    throw new Error("Public QA receipt is not a complete PASS");
  }
  if (qaReceipt.evidenceHash !== evidenceHash) {
    throw new Error("Public QA receipt is stale for evidence");
  }
  if (qaReceipt.specHash !== compiled.specHash) {
    throw new Error("Public QA receipt is stale for CreativeSpec");
  }
  if (qaReceipt.mediaManifestHash !== mediaManifestHash) {
    throw new Error("Public QA receipt is stale for source media bytes");
  }
  if (qaReceipt.renderHash !== renderHash) {
    throw new Error("Public QA receipt is stale for encoded video");
  }
  if (qaReceipt.renderReceiptHash !== hashCanonical(renderReceipt)) {
    throw new Error("Public QA receipt is stale for render receipt");
  }

  const poster = await stat(posterPath);
  if (!poster.isFile() || poster.size <= 0) {
    throw new Error("Public poster is missing or empty");
  }

  console.log("ARTIFACT GATE PASS · render and QA provenance are current");
  console.log("Caveat: freshness gate only; no authentication or re-measurement.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
