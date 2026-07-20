import {describe, expect, it} from "vitest";

import {
  assertSafeRenderTargets,
  buildRenderReceipt,
  RENDER_RECEIPT_VERSION,
  RenderReceiptSchema,
  samePath,
} from "./render-receipt";
import {resolve} from "node:path";

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

describe("destructive render path guards", () => {
  const protectedInputs = [
    {label: "evidence", path: resolve("samples/product/evidence.json")},
    {label: "spec", path: resolve("samples/product/spec.json")},
    {label: "audio", path: resolve("public/media/score.m4a")},
    {label: 'asset "hero"', path: resolve("public/media/Hero.webp")},
  ];

  it("treats normalized aliases as the same file", () => {
    const canonical = resolve("public/media/Hero.webp");
    const normalizedAlias = resolve("public/media/../media/Hero.webp");

    expect(samePath(canonical, normalizedAlias)).toBe(true);
  });

  it.runIf(process.platform === "win32")(
    "treats Windows case-variant paths as the same file",
    () => {
      const canonical = resolve("public/media/Hero.webp");
      const caseVariant = canonical.replace(/Hero\.webp$/u, "hero.WEBP");

      expect(samePath(canonical, caseVariant)).toBe(true);
    },
  );

  it("rejects output and receipt aliases", () => {
    const output = resolve("public/media/ad.mp4");
    expect(() =>
      assertSafeRenderTargets({
        outputPath: output,
        receiptPath: output,
        protectedInputs,
      }),
    ).toThrow(/--out.*--receipt/i);
  });

  it.each(["outputPath", "receiptPath"] as const)(
    "rejects %s aliases of every protected input",
    (target) => {
      for (const input of protectedInputs) {
        expect(() =>
          assertSafeRenderTargets({
            outputPath: resolve("public/media/new-ad.mp4"),
            receiptPath: resolve("public/media/new-receipt.json"),
            protectedInputs,
            [target]: input.path,
          }),
        ).toThrow(new RegExp(input.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
      }
    },
  );

  it.runIf(process.platform === "win32")(
    "rejects Windows case-variant aliases before destructive work",
    () => {
      expect(() =>
        assertSafeRenderTargets({
          outputPath: resolve("public/media/new-ad.mp4"),
          receiptPath: protectedInputs.at(-1)!.path.toUpperCase(),
          protectedInputs,
        }),
      ).toThrow(/asset "hero"/i);
    },
  );

  it("allows distinct output and receipt targets", () => {
    expect(() =>
      assertSafeRenderTargets({
        outputPath: resolve("public/media/new-ad.mp4"),
        receiptPath: resolve("public/media/new-receipt.json"),
        protectedInputs,
      }),
    ).not.toThrow();
  });
});
