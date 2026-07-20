import { describe, expect, it } from "vitest";

import {
  compileCreativeSpec,
  hashCanonical,
} from "./schema";
import creativeSpecFixture from "../../../samples/nova-one/creative-spec.json";
import productEvidenceFixture from "../../../samples/nova-one/product-evidence.json";

const validEvidence = {
  schemaVersion: "1.0.0",
  sourceMode: "fixture",
  evidenceId: "nova-one-demo-v1",
  product: {
    id: "nova-one",
    name: "NOVA ONE",
    category: "wireless headphones",
  },
  claims: [
    {
      id: "adaptive-anc",
      text: "Adaptive noise cancelling",
      status: "source_attributed",
      source: {
        type: "client_brief",
        reference: "Demo client brief, section 2",
        excerpt: "Adaptive noise cancelling",
      },
    },
    {
      id: "forty-hours",
      text: "Up to 40 hours of battery life",
      status: "requires_approval",
      source: {
        type: "client_brief",
        reference: "Demo client brief, unapproved note",
        excerpt: "Up to 40 hours",
      },
    },
    {
      id: "best-in-class",
      text: "Best noise cancelling in the world",
      status: "blocked",
      source: {
        type: "manual_note",
        reference: "Unsupported marketing draft",
        excerpt: "Best in class",
      },
    },
  ],
  assets: [
    {
      id: "city-portrait",
      path: "samples/nova-one/assets/city-portrait.png",
      role: "human_context",
      alt: "Commuter wearing NOVA ONE headphones",
    },
    {
      id: "clean-packshot",
      path: "samples/nova-one/assets/clean-packshot.png",
      role: "clean_product",
      alt: "NOVA ONE headphones on a neutral background",
    },
  ],
};

const validSpec = {
  schemaVersion: "1.0.0",
  sourceMode: "fixture",
  campaignId: "nova-one-city-signal-v1",
  productId: "nova-one",
  objective: "Make NOVA ONE desirable to city commuters",
  platform: "instagram_reels",
  audience: "Design-conscious city commuters",
  angle: "Turn city noise into a calm personal signal",
  visualDirection: "Rain-soaked night city with a red-to-blue waveform",
  supportedPromiseClaimId: "adaptive-anc",
  durationSeconds: 12,
  aspectRatio: "9:16",
  fps: 30,
  scenes: [
    {
      id: "chaos",
      startSeconds: 0,
      endSeconds: 1.4,
      kind: "human_context",
      assetId: "city-portrait",
      productVisible: true,
      overlay: { text: "TOO MUCH CITY?", claimId: null },
      cta: null,
    },
    {
      id: "control",
      startSeconds: 1.4,
      endSeconds: 4.4,
      kind: "human_context",
      assetId: "city-portrait",
      productVisible: true,
      overlay: { text: "TAKE BACK THE SIGNAL", claimId: null },
      cta: null,
    },
    {
      id: "feature",
      startSeconds: 4.4,
      endSeconds: 7.6,
      kind: "clean_product",
      assetId: "clean-packshot",
      productVisible: true,
      overlay: { text: "ADAPTIVE NOISE CANCELLING", claimId: "adaptive-anc" },
      cta: null,
    },
    {
      id: "identity",
      startSeconds: 7.6,
      endSeconds: 10,
      kind: "human_context",
      assetId: "city-portrait",
      productVisible: true,
      overlay: { text: "YOUR CITY. YOUR VOLUME.", claimId: null },
      cta: null,
    },
    {
      id: "end-card",
      startSeconds: 10,
      endSeconds: 12,
      kind: "end_card",
      assetId: "clean-packshot",
      productVisible: true,
      overlay: { text: "NOVA ONE", claimId: null },
      cta: "DISCOVER NOVA ONE",
    },
  ],
};

function clone<T>(value: T): T {
  return structuredClone(value);
}

describe("compileCreativeSpec", () => {
  it("compiles the committed NOVA ONE fixture", () => {
    const result = compileCreativeSpec({
      evidence: productEvidenceFixture,
      spec: creativeSpecFixture,
    });

    expect(result.spec.campaignId).toBe("nova-one-city-signal-v1");
    expect(result.usedClaimIds).toEqual(["adaptive-anc"]);
  });

  it("compiles a valid evidence-backed creative spec", () => {
    const result = compileCreativeSpec({
      evidence: validEvidence,
      spec: validSpec,
    });

    expect(result.spec.durationSeconds).toBe(12);
    expect(result.usedClaimIds).toEqual(["adaptive-anc"]);
    expect(result.specHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("blocks an unknown schema version", () => {
    const spec = clone(validSpec) as Record<string, unknown>;
    spec.schemaVersion = "2.0.0";

    expect(() =>
      compileCreativeSpec({ evidence: validEvidence, spec }),
    ).toThrow(/unsupported schema version/i);
  });

  it.each([5.9, 30.1])("blocks duration %s outside 6-30 seconds", (durationSeconds) => {
    const spec = clone(validSpec);
    spec.durationSeconds = durationSeconds;
    spec.scenes.at(-1)!.endSeconds = durationSeconds;

    expect(() =>
      compileCreativeSpec({ evidence: validEvidence, spec }),
    ).toThrow(/duration must be between 6 and 30 seconds/i);
  });

  it("blocks timing gaps", () => {
    const spec = clone(validSpec);
    spec.scenes[1].startSeconds = 1.5;

    expect(() =>
      compileCreativeSpec({ evidence: validEvidence, spec }),
    ).toThrow(/scenes must be contiguous/i);
  });

  it("blocks a product reveal later than 1.5 seconds", () => {
    const spec = clone(validSpec);
    spec.scenes[0].productVisible = false;
    spec.scenes[1].startSeconds = 1.6;
    spec.scenes[0].endSeconds = 1.6;

    expect(() =>
      compileCreativeSpec({ evidence: validEvidence, spec }),
    ).toThrow(/product must be visible by 1\.5 seconds/i);
  });

  it("blocks overlays longer than eight words", () => {
    const spec = clone(validSpec);
    spec.scenes[0].overlay.text = "ONE TWO THREE FOUR FIVE SIX SEVEN EIGHT NINE";

    expect(() =>
      compileCreativeSpec({ evidence: validEvidence, spec }),
    ).toThrow(/overlay must contain at most 8 words/i);
  });

  it("blocks overlays longer than 48 characters", () => {
    const spec = clone(validSpec);
    spec.scenes[0].overlay.text = "A".repeat(49);

    expect(() =>
      compileCreativeSpec({ evidence: validEvidence, spec }),
    ).toThrow(/overlay must contain at most 48 characters/i);
  });

  it("requires a CTA in the final scene", () => {
    const spec = clone(validSpec);
    spec.scenes.at(-1)!.cta = null;

    expect(() =>
      compileCreativeSpec({ evidence: validEvidence, spec }),
    ).toThrow(/final scene must include a CTA/i);
  });

  it.each(["human_context", "clean_product"] as const)(
    "requires a %s scene",
    (requiredKind) => {
      const spec = clone(validSpec);
      spec.scenes = spec.scenes.map((scene) => ({
        ...scene,
        kind:
          scene.kind === requiredKind
            ? requiredKind === "human_context"
              ? "clean_product"
              : "human_context"
            : scene.kind,
      }));

      expect(() =>
        compileCreativeSpec({ evidence: validEvidence, spec }),
      ).toThrow(new RegExp(`at least one ${requiredKind} scene`, "i"));
    },
  );

  it.each([
    ["missing", "unknown-claim"],
    ["blocked", "best-in-class"],
    ["requires approval", "forty-hours"],
  ])("blocks a %s claim reference", (_label, claimId) => {
    const spec = clone(validSpec);
    spec.scenes[2].overlay.claimId = claimId;

    expect(() =>
      compileCreativeSpec({ evidence: validEvidence, spec }),
    ).toThrow(/claim .* (missing|blocked|requires approval)/i);
  });

  it("blocks claim laundering through unrelated visible copy", () => {
    const spec = clone(validSpec);
    spec.scenes[2].overlay.text = "CURES HEARING LOSS";

    expect(() =>
      compileCreativeSpec({ evidence: validEvidence, spec }),
    ).toThrow(/visible copy .* match sourced claim/i);
  });

  it("requires the supported promise claim to appear in a scene", () => {
    const spec = clone(validSpec);
    spec.scenes[2].overlay.claimId = null;

    expect(() =>
      compileCreativeSpec({ evidence: validEvidence, spec }),
    ).toThrow(/supported promise claim .* visible scene/i);
  });

  it("blocks scene assets whose evidence role does not match the scene kind", () => {
    const spec = clone(validSpec);
    spec.scenes[2].assetId = "city-portrait";

    expect(() =>
      compileCreativeSpec({ evidence: validEvidence, spec }),
    ).toThrow(/asset .* role .* cannot serve scene kind "clean_product"/i);
  });

  it("blocks media that the still-image renderer cannot decode", () => {
    const evidence = clone(validEvidence);
    evidence.assets[0].path = "samples/nova-one/assets/source-video.mp4";

    expect(() =>
      compileCreativeSpec({ evidence, spec: validSpec }),
    ).toThrow(/supported still-image format/i);
  });

  it("requires the final CTA scene to remain visible for at least 1.5 seconds", () => {
    const spec = clone(validSpec);
    spec.scenes[3].endSeconds = 11.95;
    spec.scenes[4].startSeconds = 11.95;

    expect(() =>
      compileCreativeSpec({ evidence: validEvidence, spec }),
    ).toThrow(/final CTA scene .* at least 1\.5 seconds/i);
  });
});

describe("canonical content hashing", () => {
  it("hashes canonical JSON independently of object key order", () => {
    expect(hashCanonical({ b: 2, a: { d: 4, c: 3 } })).toBe(
      hashCanonical({ a: { c: 3, d: 4 }, b: 2 }),
    );
  });
});
