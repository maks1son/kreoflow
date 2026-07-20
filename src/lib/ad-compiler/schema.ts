import { createHash } from "node:crypto";

import { z } from "zod";

export const AD_COMPILER_SCHEMA_VERSION = "1.0.0" as const;

const schemaVersionSchema = z.literal(AD_COMPILER_SCHEMA_VERSION, {
  error: "Unsupported schema version",
});

const nonEmptyText = z.string().trim().min(1);

export const ClaimStatusSchema = z.enum([
  "source_attributed",
  "requires_approval",
  "blocked",
]);

export const ProductEvidenceSchema = z
  .object({
    schemaVersion: schemaVersionSchema,
    sourceMode: z.enum(["fixture", "live"]),
    evidenceId: nonEmptyText,
    product: z
      .object({
        id: nonEmptyText,
        name: nonEmptyText,
        category: nonEmptyText,
      })
      .strict(),
    claims: z
      .array(
        z
          .object({
            id: nonEmptyText,
            text: nonEmptyText,
            status: ClaimStatusSchema,
            source: z
              .object({
                type: z.enum([
                  "client_brief",
                  "product_page",
                  "packaging",
                  "manual_note",
                ]),
                reference: nonEmptyText,
                excerpt: nonEmptyText,
              })
              .strict(),
          })
          .strict(),
      )
      .min(1),
    assets: z
      .array(
        z
          .object({
            id: nonEmptyText,
            path: nonEmptyText,
            role: z.enum(["human_context", "clean_product", "product_detail"]),
            alt: nonEmptyText,
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

export const CreativeSceneSchema = z
  .object({
    id: nonEmptyText,
    startSeconds: z.number().finite().nonnegative(),
    endSeconds: z.number().finite().positive(),
    kind: z.enum([
      "human_context",
      "clean_product",
      "product_detail",
      "end_card",
    ]),
    assetId: nonEmptyText,
    productVisible: z.boolean(),
    overlay: z
      .object({
        text: z
          .string()
          .trim()
          .min(1)
          .max(48, "Overlay must contain at most 48 characters"),
        claimId: z.string().trim().min(1).nullable(),
      })
      .strict(),
    cta: z.string().trim().min(1).max(48).nullable(),
  })
  .strict();

export const CreativeSpecSchema = z
  .object({
    schemaVersion: schemaVersionSchema,
    sourceMode: z.enum(["fixture", "live_gpt_5_6"]),
    campaignId: nonEmptyText,
    productId: nonEmptyText,
    objective: nonEmptyText,
    platform: z.enum([
      "instagram_reels",
      "tiktok",
      "youtube_shorts",
      "generic_vertical",
    ]),
    audience: nonEmptyText,
    angle: nonEmptyText,
    visualDirection: nonEmptyText,
    supportedPromiseClaimId: nonEmptyText,
    durationSeconds: z
      .number()
      .finite()
      .min(6, "Duration must be between 6 and 30 seconds")
      .max(30, "Duration must be between 6 and 30 seconds"),
    aspectRatio: z.literal("9:16"),
    fps: z.literal(30),
    scenes: z.array(CreativeSceneSchema).min(2),
  })
  .strict();

export type ClaimStatus = z.infer<typeof ClaimStatusSchema>;
export type ProductEvidence = z.infer<typeof ProductEvidenceSchema>;
export type CreativeScene = z.infer<typeof CreativeSceneSchema>;
export type CreativeSpec = z.infer<typeof CreativeSpecSchema>;

export interface CompileCreativeSpecInput {
  evidence: unknown;
  spec: unknown;
}

export interface CompiledCreativeSpec {
  evidence: ProductEvidence;
  spec: CreativeSpec;
  usedClaimIds: string[];
  specHash: string;
}

export class AdCompilerValidationError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(issues.join("; "));
    this.name = "AdCompilerValidationError";
    this.issues = issues;
  }
}

function parseOrThrow<T>(label: string, schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);

  if (result.success) {
    return result.data;
  }

  throw new AdCompilerValidationError(
    result.error.issues.map((issue) => {
      const path = issue.path.length > 0 ? `.${issue.path.join(".")}` : "";
      return `${label}${path}: ${issue.message}`;
    }),
  );
}

function hasDuplicateIds(items: readonly { id: string }[]): boolean {
  return new Set(items.map(({ id }) => id)).size !== items.length;
}

function nearlyEqual(left: number, right: number): boolean {
  return Math.abs(left - right) <= 0.000_001;
}

function countWords(value: string): number {
  return value.trim().split(/\s+/u).filter(Boolean).length;
}

function normalizeClaimText(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function sceneAcceptsAssetRole(
  sceneKind: CreativeScene["kind"],
  assetRole: ProductEvidence["assets"][number]["role"],
): boolean {
  if (sceneKind === "end_card") {
    return assetRole === "clean_product" || assetRole === "product_detail";
  }
  return sceneKind === assetRole;
}

function claimIssue(
  claimId: string,
  claimById: ReadonlyMap<string, ProductEvidence["claims"][number]>,
): string | null {
  const claim = claimById.get(claimId);

  if (!claim) {
    return `Claim "${claimId}" is missing`;
  }

  if (claim.status === "blocked") {
    return `Claim "${claimId}" is blocked`;
  }

  if (claim.status === "requires_approval") {
    return `Claim "${claimId}" requires approval`;
  }

  return null;
}

export function compileCreativeSpec({
  evidence: evidenceInput,
  spec: specInput,
}: CompileCreativeSpecInput): CompiledCreativeSpec {
  const evidence = parseOrThrow("evidence", ProductEvidenceSchema, evidenceInput);
  const spec = parseOrThrow("spec", CreativeSpecSchema, specInput);
  const issues: string[] = [];

  if (hasDuplicateIds(evidence.claims)) {
    issues.push("Evidence claim IDs must be unique");
  }
  if (hasDuplicateIds(evidence.assets)) {
    issues.push("Evidence asset IDs must be unique");
  }
  if (hasDuplicateIds(spec.scenes)) {
    issues.push("Scene IDs must be unique");
  }

  if (spec.productId !== evidence.product.id) {
    issues.push(
      `Spec product "${spec.productId}" does not match evidence product "${evidence.product.id}"`,
    );
  }

  const scenes = spec.scenes;
  if (!nearlyEqual(scenes[0].startSeconds, 0)) {
    issues.push("Scenes must start at 0 and be contiguous");
  }

  for (let index = 0; index < scenes.length; index += 1) {
    const scene = scenes[index];
    if (scene.endSeconds <= scene.startSeconds) {
      issues.push(`Scene "${scene.id}" must have positive duration`);
    }
    if (
      index > 0 &&
      !nearlyEqual(scene.startSeconds, scenes[index - 1].endSeconds)
    ) {
      issues.push("Scenes must be contiguous");
    }
    if (countWords(scene.overlay.text) > 8) {
      issues.push(`Scene "${scene.id}" overlay must contain at most 8 words`);
    }
  }

  if (!nearlyEqual(scenes.at(-1)!.endSeconds, spec.durationSeconds)) {
    issues.push("Final scene must end at the declared duration");
  }

  const firstProductScene = scenes.find((scene) => scene.productVisible);
  if (!firstProductScene || firstProductScene.startSeconds > 1.5) {
    issues.push("Product must be visible by 1.5 seconds");
  }

  const finalScene = scenes.at(-1)!;
  if (!finalScene.cta) {
    issues.push("Final scene must include a CTA");
  }
  if (finalScene.kind !== "end_card") {
    issues.push("Final scene must be an end_card");
  }
  if (finalScene.endSeconds - finalScene.startSeconds < 1.5 - 0.000_001) {
    issues.push("Final CTA scene must remain visible for at least 1.5 seconds");
  }

  if (!scenes.some((scene) => scene.kind === "human_context")) {
    issues.push("Creative must include at least one human_context scene");
  }
  if (!scenes.some((scene) => scene.kind === "clean_product")) {
    issues.push("Creative must include at least one clean_product scene");
  }

  const assetById = new Map(evidence.assets.map((asset) => [asset.id, asset]));
  for (const scene of scenes) {
    const asset = assetById.get(scene.assetId);
    if (!asset) {
      issues.push(`Asset "${scene.assetId}" is missing`);
    } else if (!sceneAcceptsAssetRole(scene.kind, asset.role)) {
      issues.push(
        `Asset "${scene.assetId}" role "${asset.role}" cannot serve scene kind "${scene.kind}"`,
      );
    }
  }

  const claimById = new Map(evidence.claims.map((claim) => [claim.id, claim]));
  const referencedClaimIds = [
    spec.supportedPromiseClaimId,
    ...scenes.flatMap((scene) =>
      scene.overlay.claimId ? [scene.overlay.claimId] : [],
    ),
  ];

  for (const claimId of new Set(referencedClaimIds)) {
    const issue = claimIssue(claimId, claimById);
    if (issue) {
      issues.push(issue);
    }
  }

  const visibleClaimIds = new Set(
    scenes.flatMap((scene) =>
      scene.overlay.claimId ? [scene.overlay.claimId] : [],
    ),
  );
  if (!visibleClaimIds.has(spec.supportedPromiseClaimId)) {
    issues.push(
      `Supported promise claim "${spec.supportedPromiseClaimId}" must appear in a visible scene`,
    );
  }

  for (const scene of scenes) {
    if (!scene.overlay.claimId) continue;
    const claim = claimById.get(scene.overlay.claimId);
    if (
      claim &&
      normalizeClaimText(scene.overlay.text) !== normalizeClaimText(claim.text)
    ) {
      issues.push(
        `Scene "${scene.id}" visible copy must match sourced claim "${claim.id}"`,
      );
    }
  }

  if (issues.length > 0) {
    throw new AdCompilerValidationError(issues);
  }

  return {
    evidence,
    spec,
    usedClaimIds: [...new Set(referencedClaimIds)],
    specHash: hashCanonical(spec),
  };
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return JSON.stringify(value);
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError("Canonical JSON cannot contain non-finite numbers");
    }
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const entries = Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`);
    return `{${entries.join(",")}}`;
  }

  throw new TypeError(`Canonical JSON cannot contain ${typeof value}`);
}

export function sha256Hex(input: string | Uint8Array): string {
  return createHash("sha256").update(input).digest("hex");
}

export function hashCanonical(value: unknown): string {
  return sha256Hex(canonicalJson(value));
}

export function hashCreativeSpec(input: unknown): string {
  const spec = parseOrThrow("spec", CreativeSpecSchema, input);
  return hashCanonical(spec);
}
