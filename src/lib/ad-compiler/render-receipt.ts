import {z} from "zod";

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

