import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { createApprovalReceipt } from "../../src/lib/ad-compiler/approval.ts";
import { TECHNICAL_QA_VERSION } from "../../src/lib/ad-compiler/qa.ts";
import {
  CreativeSpecSchema,
  hashCreativeSpec,
  sha256Hex,
} from "../../src/lib/ad-compiler/schema.ts";

const defaults = {
  spec: "samples/nova-one/creative-spec.json",
  video:
    "public/media/build-week/ad-compiler/nova-one-accountable-ad.mp4",
  qa: "samples/nova-one/output/technical-qa.json",
  out: "samples/nova-one/output/approval.json",
  approver: "KreoFlow fixture owner",
};

function usage(): string {
  return [
    "Approve the exact KreoFlow spec + encoded render pair",
    "",
    "Usage:",
    "  pnpm ad:approve [--spec <json>] [--video <mp4>] [--qa <json>]",
    "                    [--out <json>] [--approver <label>]",
    "",
    "Optional reproducibility flag:",
    "  --approved-at <ISO-8601 timestamp>",
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
    if (!key.startsWith("--") || !argv[index + 1] || argv[index + 1].startsWith("--")) {
      throw new Error(`Expected --flag value, received "${key}"`);
    }
    args.set(key.slice(2), argv[index + 1]);
    index += 1;
  }
  return args;
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be a JSON object`);
  }
  return value as Record<string, unknown>;
}

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, "utf8"));
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const specPath = resolve(args.get("spec") ?? defaults.spec);
  const videoPath = resolve(args.get("video") ?? defaults.video);
  const qaPath = resolve(args.get("qa") ?? defaults.qa);
  const outputPath = resolve(args.get("out") ?? defaults.out);

  const spec = CreativeSpecSchema.parse(await readJson(specPath));
  const specHash = hashCreativeSpec(spec);
  const renderHash = sha256Hex(await readFile(videoPath));
  const qa = record(await readJson(qaPath), "QA receipt");
  const checks = Array.isArray(qa.checks) ? qa.checks : [];

  if (qa.version !== TECHNICAL_QA_VERSION) {
    throw new Error(`QA receipt version must be ${TECHNICAL_QA_VERSION}`);
  }
  if (qa.passed !== true || checks.length === 0 || checks.some((item) => record(item, "QA check").passed !== true)) {
    throw new Error("Cannot approve: technical QA is not a complete PASS");
  }
  if (qa.specHash !== specHash) {
    throw new Error("Cannot approve: QA receipt is stale for the current CreativeSpec");
  }
  if (qa.renderHash !== renderHash) {
    throw new Error("Cannot approve: QA receipt is stale for the current encoded render");
  }

  const receipt = createApprovalReceipt({
    spec,
    renderHash,
    approver: args.get("approver") ?? defaults.approver,
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
