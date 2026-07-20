import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

import { compileCreativeSpecWithOpenAI } from "../../src/lib/ad-compiler/openai.ts";
import {
  compileCreativeSpec,
  ProductEvidenceSchema,
} from "../../src/lib/ad-compiler/schema.ts";

const requiredFlags = [
  "evidence",
  "out",
  "platform",
  "objective",
  "audience",
  "caller-id",
] as const;

const allowedFlags = new Set<string>(requiredFlags);

function usage(): string {
  return [
    "Explicit live GPT-5.6 CreativeSpec generation (no fallback)",
    "",
    "Usage:",
    "  pnpm ad:strategy:live -- --evidence <json> --out <json>",
    "    --platform <name> --objective <text> --audience <text> --caller-id <internal-id>",
    "",
    "Requires OPENAI_API_KEY. This command is never called by demo:ad.",
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

  for (const flag of requiredFlags) {
    if (!args.get(flag)?.trim()) {
      throw new Error(`Missing required --${flag}\n\n${usage()}`);
    }
  }
  return args;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const evidencePath = resolve(args.get("evidence")!);
  const outputPath = resolve(args.get("out")!);
  const evidence = ProductEvidenceSchema.parse(
    JSON.parse(await readFile(evidencePath, "utf8")),
  );

  console.log("LIVE GPT-5.6 strategy requested · no fixture fallback");
  const protectedInputs = [
    evidencePath,
    ...evidence.assets.map((asset) => resolve(asset.path)),
  ];
  if (protectedInputs.some((inputPath) => relative(inputPath, outputPath) === "")) {
    throw new Error(
      "Live strategy --out must not overwrite evidence or declared media assets",
    );
  }

  const result = await compileCreativeSpecWithOpenAI({
    evidence,
    platform: args.get("platform")!,
    objective: args.get("objective")!,
    audience: args.get("audience")!,
    callerId: args.get("caller-id")!,
  });

  const compiled = compileCreativeSpec({ evidence, spec: result.spec });
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(compiled.spec, null, 2)}\n`, "utf8");

  console.log(`CreativeSpec PASS · ${compiled.specHash}`);
  console.log(`OpenAI response: ${result.metadata.responseId} · ${result.metadata.model}`);
  console.log(`Spec: ${outputPath}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
