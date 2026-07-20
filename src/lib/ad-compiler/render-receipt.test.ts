import {describe, expect, it} from "vitest";

import {
  buildRenderReceipt,
  RENDER_RECEIPT_VERSION,
  RenderReceiptSchema,
} from "./render-receipt";

const hashes = {
  evidenceHash: "1".repeat(64),
  specHash: "2".repeat(64),
  mediaManifestHash: "3".repeat(64),
  renderHash: "4".repeat(64),
};

describe("render-time causal receipt", () => {
  it("builds a strict versioned receipt for the exact inputs and output", () => {
    const receipt = buildRenderReceipt({
      ...hashes,
      generatedAt: "2026-07-20T15:30:00.000Z",
      outputPath: "public/media/campaign.mp4",
    });

    expect(receipt).toEqual({
      version: RENDER_RECEIPT_VERSION,
      generatedAt: "2026-07-20T15:30:00.000Z",
      outputPath: "public/media/campaign.mp4",
      ...hashes,
    });
    expect(RenderReceiptSchema.parse(receipt)).toEqual(receipt);
  });

  it.each([
    "evidenceHash",
    "specHash",
    "mediaManifestHash",
    "renderHash",
  ] as const)("rejects an invalid %s", (field) => {
    expect(() =>
      RenderReceiptSchema.parse({...buildRenderReceipt({...hashes, outputPath: "out.mp4"}), [field]: "ABC"}),
    ).toThrow(/SHA-256/i);
  });

  it("rejects unknown provenance fields", () => {
    expect(() =>
      RenderReceiptSchema.parse({
        ...buildRenderReceipt({...hashes, outputPath: "out.mp4"}),
        untrackedInput: "silent-default.mp3",
      }),
    ).toThrow();
  });

  it("validates informational timestamp and output path", () => {
    const receipt = buildRenderReceipt({...hashes, outputPath: "out.mp4"});

    expect(() => RenderReceiptSchema.parse({...receipt, generatedAt: "yesterday"})).toThrow();
    expect(() => RenderReceiptSchema.parse({...receipt, outputPath: "  "})).toThrow();
  });
});

