import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { compileCreativeSpec } from "../../src/lib/ad-compiler/schema.ts";

const defaults = {
  evidence: "samples/nova-one/product-evidence.json",
  spec: "samples/nova-one/creative-spec.json",
  video:
    "public/media/build-week/ad-compiler/nova-one-accountable-ad.mp4",
  qa: "public/media/build-week/ad-compiler/nova-one-qa-receipt.json",
};

function usage(): string {
  return [
    "Run the complete, keyless KreoFlow fixture pipeline",
    "",
    "Usage:",
    "  pnpm demo:ad [--evidence <json>] [--spec <json>] [--video <mp4>]",
    "               [--qa <json>]",
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
    if (!key.startsWith("--") || !argv[index + 1] || argv[index + 1].startsWith("--")) {
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

function runStep(label: string, scriptName: string, args: string[]): void {
  console.log(`\n${label}`);
  const scriptPath = fileURLToPath(new URL(`./${scriptName}`, import.meta.url));
  const result = spawnSync(process.execPath, ["--import", "tsx", scriptPath, ...args], {
    cwd: process.cwd(),
    stdio: "inherit",
    windowsHide: true,
  });

  if (result.error) {
    throw new Error(`${label} could not start: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status}`);
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const evidencePath = resolve(args.get("evidence") ?? defaults.evidence);
  const specPath = resolve(args.get("spec") ?? defaults.spec);
  const videoPath = resolve(args.get("video") ?? defaults.video);
  const qaPath = resolve(args.get("qa") ?? defaults.qa);
  const evidence = await readJson(evidencePath);
  const spec = await readJson(specPath);
  const compiled = compileCreativeSpec({ evidence, spec });

  if (compiled.evidence.sourceMode !== "fixture" || compiled.spec.sourceMode !== "fixture") {
    throw new Error(
      "demo:ad is intentionally keyless and accepts fixture inputs only. Run ad:strategy:live explicitly first.",
    );
  }

  console.log("KreoFlow accountable ad compiler · keyless fixture mode");
  console.log(`CreativeSpec valid · ${compiled.specHash}`);

  runStep("1/2 Deterministic render", "render.mts", [
    "--evidence",
    evidencePath,
    "--spec",
    specPath,
    "--out",
    videoPath,
  ]);

  const qaArgs = [
    "--spec",
    specPath,
    "--video",
    videoPath,
    "--out",
    qaPath,
  ];
  if (args.has("generated-at")) {
    qaArgs.push("--generated-at", args.get("generated-at")!);
  }
  runStep("2/2 Technical QA gate", "qa.mts", qaArgs);

  console.log("\nAUTOMATED PIPELINE PASS · HUMAN APPROVAL PENDING");
  console.log(`Video: ${videoPath}`);
  console.log(`QA: ${qaPath}`);
  console.log('After human review: pnpm ad:approve -- --approver "<name>"');
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
