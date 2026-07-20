import {z} from "zod";
import {relative, resolve} from "node:path";

export const RENDER_RECEIPT_VERSION = "1.0.0" as const;

const Sha256Schema = z
  .string()
  .regex(/^[a-f0-9]{64}$/u, "Expected a lowercase SHA-256 hash");

export const RenderReceiptSchema = z
  .object({
    version: z.literal(RENDER_RECEIPT_VERSION),
    generatedAt: z.string().datetime({offset: true}),
    outputPath: z.string().trim().min(1),
    evidenceHash: Sha256Schema,
    specHash: Sha256Schema,
    mediaManifestHash: Sha256Schema,
    renderHash: Sha256Schema,
  })
  .strict();

export type RenderReceipt = z.infer<typeof RenderReceiptSchema>;

export interface ProtectedRenderInput {
  label: string;
  path: string;
}

export interface SafeRenderTargetsInput {
  outputPath: string;
  receiptPath: string;
  protectedInputs: ProtectedRenderInput[];
}

export const samePath = (leftPath: string, rightPath: string) => {
  const left = resolve(leftPath);
  const right = resolve(rightPath);
  if (relative(left, right) === "") return true;

  return (
    process.platform === "win32" &&
    relative(left.toLocaleLowerCase("en-US"), right.toLocaleLowerCase("en-US")) === ""
  );
};

export const assertSafeRenderTargets = ({
  outputPath,
  receiptPath,
  protectedInputs,
}: SafeRenderTargetsInput) => {
  if (samePath(outputPath, receiptPath)) {
    throw new Error("--out and --receipt must point to different files");
  }

  for (const input of protectedInputs) {
    if (samePath(outputPath, input.path)) {
      throw new Error(`--out must not overwrite protected ${input.label}: ${input.path}`);
    }
    if (samePath(receiptPath, input.path)) {
      throw new Error(`--receipt must not overwrite protected ${input.label}: ${input.path}`);
    }
  }
};

export const buildRenderReceipt = ({
  generatedAt = new Date().toISOString(),
  outputPath,
  evidenceHash,
  specHash,
  mediaManifestHash,
  renderHash,
}: Omit<RenderReceipt, "version" | "generatedAt"> & {
  generatedAt?: string;
}): RenderReceipt =>
  RenderReceiptSchema.parse({
    version: RENDER_RECEIPT_VERSION,
    generatedAt,
    outputPath,
    evidenceHash,
    specHash,
    mediaManifestHash,
    renderHash,
  });
