import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import {
  buildMediaManifestHash,
  buildTechnicalQaReceipt,
  parseEbur128Summary,
  parseFfprobeJson,
} from "../../src/lib/ad-compiler/qa.ts";
import {
  compileCreativeSpec,
  hashCanonical,
  sha256Hex,
} from "../../src/lib/ad-compiler/schema.ts";

const defaults = {
  evidence: "samples/nova-one/product-evidence.json",
  spec: "samples/nova-one/creative-spec.json",
  video: "public/media/build-week/ad-compiler/nova-one-accountable-ad.mp4",
  out: "public/media/build-week/ad-compiler/nova-one-qa-receipt.json",
};

const allowedFlags = new Set([
  "evidence",
  "spec",
  "audio",
  "video",
  "out",
  "generated-at",
]);

function usage(): string {
  return [
    "Technical QA for a rendered KreoFlow ad",
    "",
    "Usage:",
    "  pnpm ad:qa [--evidence <json>] [--spec <json>] --audio <media>",
    "             [--video <mp4>] [--out <json>]",
    "             [--generated-at <ISO-8601 timestamp>]",
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

function runRequired(binary: string, args: string[]): { stdout: string; stderr: string } {
  const result = spawnSync(binary, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) {
    throw new Error(`${binary} could not start: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || "no diagnostic output").trim();
    throw new Error(`${binary} exited ${result.status}: ${detail}`);
  }
  return { stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

function measureLoudness(videoPath: string): string | null {
  const result = spawnSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-nostats",
      "-i",
      videoPath,
      "-map",
      "0:a:0",
      "-filter:a",
      "ebur128=peak=true",
      "-f",
      "null",
      "-",
    ],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 64 * 1024 * 1024,
    },
  );

  if (result.error) {
    throw new Error(`ffmpeg could not start: ${result.error.message}`);
  }
  if (result.status === null) {
    throw new Error("ffmpeg loudness measurement ended without an exit status");
  }
  if (result.status !== 0) {
    console.warn(
      "Loudness measurement unavailable; writing a diagnostic FAIL receipt.",
    );
    return null;
  }
  return `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
}

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, "utf8"));
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function mediaManifestHashFor(
  assets: readonly { id: string; path: string }[],
  audioInput: string,
  audioPath: string,
): Promise<string> {
  return buildMediaManifestHash({
    assets: await Promise.all(
      assets.map(async (asset) => ({
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
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const evidencePath = resolve(args.get("evidence") ?? defaults.evidence);
  const specPath = resolve(args.get("spec") ?? defaults.spec);
  const audioInput = args.get("audio")?.trim();
  if (!audioInput) {
    throw new Error("Technical QA requires explicit --audio source media");
  }
  const audioPath = resolve(audioInput);
  const videoPath = resolve(args.get("video") ?? defaults.video);
  const outputPath = resolve(args.get("out") ?? defaults.out);
  const compiled = compileCreativeSpec({
    evidence: await readJson(evidencePath),
    spec: await readJson(specPath),
  });
  const renderHash = sha256Hex(await readFile(videoPath));
  const probeOutput = runRequired("ffprobe", [
    "-v",
    "error",
    "-show_streams",
    "-show_format",
    "-of",
    "json",
    videoPath,
  ]);
  const probe = parseFfprobeJson(JSON.parse(probeOutput.stdout));
  const loudnessOutput = probe.audio ? measureLoudness(videoPath) : null;

  const receipt = buildTechnicalQaReceipt({
    probe,
    loudness: loudnessOutput ? parseEbur128Summary(loudnessOutput) : null,
    expectedDurationSeconds: compiled.spec.durationSeconds,
    evidenceHash: hashCanonical(compiled.evidence),
    mediaManifestHash: await mediaManifestHashFor(
      compiled.evidence.assets,
      audioInput,
      audioPath,
    ),
    specHash: compiled.specHash,
    renderHash,
    generatedAt: args.get("generated-at"),
  });

  await writeJson(outputPath, receipt);
  const failingChecks = receipt.checks
    .filter((check) => !check.passed)
    .map((check) => check.id);
  if (!receipt.passed) {
    throw new Error(
      `Technical QA blocked the render (${failingChecks.join(", ")}). Receipt: ${outputPath}`,
    );
  }

  console.log(
    `QA PASS · ${receipt.summary.width}x${receipt.summary.height} · ${receipt.summary.durationSeconds}s`,
  );
  console.log(`Receipt: ${outputPath}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
