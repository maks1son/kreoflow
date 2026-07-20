import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { createApprovalReceipt } from "../../src/lib/ad-compiler/approval.ts";
import { TechnicalQaReceiptSchema } from "../../src/lib/ad-compiler/qa.ts";
import {
  compileCreativeSpec,
  sha256Hex,
} from "../../src/lib/ad-compiler/schema.ts";

const defaults = {
  evidence: "samples/nova-one/product-evidence.json",
  spec: "samples/nova-one/creative-spec.json",
  video: "public/media/build-week/ad-compiler/nova-one-accountable-ad.mp4",
  qa: "public/media/build-week/ad-compiler/nova-one-qa-receipt.json",
  out: "public/media/build-week/ad-compiler/nova-one-approval-receipt.json",
};

function usage(): string {
  return [
    "Approve the exact evidence + spec + render + QA chain",
    "",
    "Usage:",
    "  pnpm ad:approve [--evidence <json>] [--spec <json>] [--video <mp4>]",
    "                  [--qa <json>] [--out <json>] --approver <human label>",
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
    if (
      !key.startsWith("--") ||
      !argv[index + 1] ||
      argv[index + 1].startsWith("--")
    ) {
      throw new Error(`Expected --flag value, received "${key}"`);
    }
    args.set(key.slice(2), argv[index + 1]);
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

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const evidencePath = resolve(args.get("evidence") ?? defaults.evidence);
  const specPath = resolve(args.get("spec") ?? defaults.spec);
  const videoPath = resolve(args.get("video") ?? defaults.video);
  const qaPath = resolve(args.get("qa") ?? defaults.qa);
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
  const qaReceipt = TechnicalQaReceiptSchema.parse(await readJson(qaPath));
  const renderHash = sha256Hex(await readFile(videoPath));
  const receipt = createApprovalReceipt({
    evidence: compiled.evidence,
    spec: compiled.spec,
    renderHash,
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
