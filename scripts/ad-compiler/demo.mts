import { spawnSync } from "node:child_process";
import { mkdir, readFile, rm } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { compileCreativeSpec } from "../../src/lib/ad-compiler/schema.ts";

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
  approval:
    "public/media/build-week/ad-compiler/nova-one-approval-receipt.json",
};

const allowedFlags = new Set([
  "evidence",
  "spec",
  "audio",
  "video",
  "render-receipt",
  "qa",
  "poster",
  "approval",
  "generated-at",
]);

function usage(): string {
  return [
    "Run the complete, keyless KreoFlow fixture pipeline",
    "",
    "Usage:",
    "  pnpm demo:ad [--evidence <json>] [--spec <json>] [--audio <media>]",
    "               [--video <mp4>] [--render-receipt <json>] [--qa <json>]",
    "               [--poster <jpg>]",
    "               [--approval <json>]",
    "               [--generated-at <ISO-8601 timestamp>]",
    "",
    "This command never calls OpenAI and never creates a human approval.",
    "Use ad:strategy:live explicitly for live strategy, then ad:approve after review.",
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

function runStep(label: string, scriptName: string, args: string[]): void {
  console.log(`\n${label}`);
  const scriptPath = fileURLToPath(new URL(`./${scriptName}`, import.meta.url));
  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", scriptPath, ...args],
    {
      cwd: process.cwd(),
      stdio: "inherit",
      windowsHide: true,
    },
  );

  if (result.error) {
    throw new Error(`${label} could not start: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status}`);
  }
}

const samePath = (left: string, right: string): boolean =>
  relative(left, right) === "";

function assertSafeArtifacts(
  sourcePaths: readonly string[],
  artifacts: readonly { label: string; path: string }[],
): void {
  for (const artifact of artifacts) {
    if (sourcePaths.some((sourcePath) => samePath(sourcePath, artifact.path))) {
      throw new Error(
        `Demo ${artifact.label} must not overwrite evidence, spec, audio, or declared media assets`,
      );
    }
  }
  for (let leftIndex = 0; leftIndex < artifacts.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < artifacts.length; rightIndex += 1) {
      if (samePath(artifacts[leftIndex].path, artifacts[rightIndex].path)) {
        throw new Error(
          `Demo ${artifacts[leftIndex].label} and ${artifacts[rightIndex].label} must use different paths`,
        );
      }
    }
  }
}

async function invalidateDownstream(paths: readonly string[]): Promise<void> {
  await Promise.all(
    paths.map(async (path) => {
      await mkdir(dirname(path), { recursive: true });
      await rm(path, { force: true });
    }),
  );
}

function extractPoster(videoPath: string, posterPath: string): void {
  console.log("\n3/3 Current-render poster");
  const result = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-v",
      "error",
      "-ss",
      "0.5",
      "-i",
      videoPath,
      "-frames:v",
      "1",
      "-vf",
      "scale=540:960",
      "-q:v",
      "2",
      "-map_metadata",
      "-1",
      posterPath,
    ],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      windowsHide: true,
    },
  );
  if (result.error) {
    throw new Error(`Poster extraction could not start: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(
      `Poster extraction failed with exit code ${result.status}: ${(result.stderr || result.stdout).trim()}`,
    );
  }
  console.log(`Poster: ${posterPath}`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const evidencePath = resolve(args.get("evidence") ?? defaults.evidence);
  const specPath = resolve(args.get("spec") ?? defaults.spec);
  const audioPath = resolve(args.get("audio") ?? defaults.audio);
  const videoPath = resolve(args.get("video") ?? defaults.video);
  const renderReceiptPath = resolve(
    args.get("render-receipt") ?? defaults.renderReceipt,
  );
  const qaPath = resolve(args.get("qa") ?? defaults.qa);
  const posterPath = resolve(args.get("poster") ?? defaults.poster);
  const approvalPath = resolve(args.get("approval") ?? defaults.approval);
  const compiled = compileCreativeSpec({
    evidence: await readJson(evidencePath),
    spec: await readJson(specPath),
  });
  assertSafeArtifacts(
    [
      evidencePath,
      specPath,
      audioPath,
      ...compiled.evidence.assets.map((asset) => resolve(asset.path)),
    ],
    [
      { label: "--video", path: videoPath },
      { label: "--render-receipt", path: renderReceiptPath },
      { label: "--qa", path: qaPath },
      { label: "--poster", path: posterPath },
      { label: "--approval", path: approvalPath },
    ],
  );
  await invalidateDownstream([qaPath, posterPath, approvalPath]);

  if (
    compiled.evidence.sourceMode !== "fixture" ||
    compiled.spec.sourceMode !== "fixture"
  ) {
    throw new Error(
      "demo:ad is intentionally keyless and accepts fixture inputs only. Run ad:strategy:live explicitly first.",
    );
  }

  console.log("KreoFlow accountable ad compiler · keyless fixture mode");
  console.log(`CreativeSpec valid · ${compiled.specHash}`);

  runStep("1/3 Schema-bound render", "render.mts", [
    "--evidence",
    evidencePath,
    "--spec",
    specPath,
    "--audio",
    audioPath,
    "--out",
    videoPath,
    "--receipt",
    renderReceiptPath,
  ]);

  const qaArgs = [
    "--evidence",
    evidencePath,
    "--spec",
    specPath,
    "--audio",
    audioPath,
    "--video",
    videoPath,
    "--render-receipt",
    renderReceiptPath,
    "--out",
    qaPath,
  ];
  if (args.has("generated-at")) {
    qaArgs.push("--generated-at", args.get("generated-at")!);
  }
  runStep("2/3 Technical QA gate", "qa.mts", qaArgs);
  extractPoster(videoPath, posterPath);

  console.log("\nAUTOMATED PIPELINE PASS · HUMAN APPROVAL PENDING");
  console.log(`Video: ${videoPath}`);
  console.log(`QA: ${qaPath}`);
  console.log(`Poster: ${posterPath}`);
  console.log(
    `After human review: pnpm ad:approve -- --audio "${audioPath}" --render-receipt "${renderReceiptPath}" --approver "<name>"`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
