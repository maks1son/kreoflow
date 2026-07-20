import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

import { createApprovalReceipt } from "../../src/lib/ad-compiler/approval.ts";
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
  video: "public/media/build-week/ad-compiler/nova-one-accountable-ad.mp4",
  qa: "public/media/build-week/ad-compiler/nova-one-qa-receipt.json",
  renderReceipt:
    "public/media/build-week/ad-compiler/nova-one-render-receipt.json",
  out: "public/media/build-week/ad-compiler/nova-one-approval-receipt.json",
};

const allowedFlags = new Set([
  "evidence",
  "spec",
  "audio",
  "video",
  "qa",
  "render-receipt",
  "out",
  "approver",
  "approved-at",
]);

function usage(): string {
  return [
    "Approve the exact evidence + spec + render + QA chain",
    "",
    "Usage:",
    "  pnpm ad:approve [--evidence <json>] [--spec <json>] --audio <media>",
    "                  [--video <mp4>] [--render-receipt <json>]",
    "                  [--qa <json>] [--out <json>]",
    "                  --approver <human label>",
    "                  [--approved-at <ISO-8601 timestamp>]",
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

async function writeJson(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function invalidateOutput(
  outputPath: string,
  protectedInputs: readonly string[],
): Promise<void> {
  if (protectedInputs.some((inputPath) => relative(inputPath, outputPath) === "")) {
    throw new Error(
      "Approval --out must not overwrite an evidence, spec, audio, video, QA, or render receipt input",
    );
  }
  await mkdir(dirname(outputPath), { recursive: true });
  await rm(outputPath, { force: true });
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
    throw new Error("Human approval requires explicit --audio source media");
  }
  const audioPath = resolve(audioInput);
  const videoPath = resolve(args.get("video") ?? defaults.video);
  const qaPath = resolve(args.get("qa") ?? defaults.qa);
  const renderReceiptPath = resolve(
    args.get("render-receipt") ?? defaults.renderReceipt,
  );
  const outputPath = resolve(args.get("out") ?? defaults.out);
  const approver = args.get("approver")?.trim();
  if (!approver) {
    throw new Error(
      "Human approval requires an explicit --approver label after reviewing the rendered video",
    );
  }
  const evidence = await readJson(evidencePath);
  const spec = await readJson(specPath);
  const compiled = compileCreativeSpec({ evidence, spec });
  await invalidateOutput(outputPath, [
    evidencePath,
    specPath,
    audioPath,
    videoPath,
    qaPath,
    renderReceiptPath,
    ...compiled.evidence.assets.map((asset) => resolve(asset.path)),
  ]);
  const qaReceipt = TechnicalQaReceiptSchema.parse(await readJson(qaPath));
  const renderHash = sha256Hex(await readFile(videoPath));
  const mediaManifestHash = await mediaManifestHashFor(
    compiled.evidence.assets,
    audioInput,
    audioPath,
  );
  const renderReceipt = validateCurrentRenderReceipt(
    await readJson(renderReceiptPath),
    {
      evidenceHash: hashCanonical(compiled.evidence),
      specHash: compiled.specHash,
      mediaManifestHash,
      renderHash,
      outputPath: videoPath,
    },
  );
  const receipt = createApprovalReceipt({
    evidence: compiled.evidence,
    spec: compiled.spec,
    renderHash,
    mediaManifestHash,
    renderReceipt,
    qaReceipt,
    approver,
    approvedAt: args.get("approved-at"),
  });

  await writeJson(outputPath, receipt);
  console.log(`APPROVED · ${receipt.approver}`);
  console.log(`Approval: ${outputPath}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
