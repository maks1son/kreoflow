import {describe, expect, it, vi} from "vitest";

import type {CreativeScene, CreativeSpec, ProductEvidence} from "../src/lib/ad-compiler/schema";
import {
  buildProductAdProps,
  requireAudioSource,
  resolveSceneAsset,
} from "./render-contract";

const evidence: ProductEvidence = {
  schemaVersion: "1.0.0",
  sourceMode: "fixture",
  evidenceId: "orbit-evidence",
  product: {id: "orbit", name: "ORBIT X", category: "headphones"},
  claims: [
    {
      id: "verified-feature",
      text: "Adaptive sound",
      status: "source_attributed",
      source: {
        type: "client_brief",
        reference: "brief",
        excerpt: "Adaptive sound",
      },
    },
  ],
  assets: [
    {
      id: "human-a",
      path: "products/orbit/human-a.png",
      role: "human_context",
      alt: "Person wearing ORBIT X",
    },
    {
      id: "packshot-b",
      path: "products/orbit/packshot-b.png",
      role: "clean_product",
      alt: "ORBIT X packshot",
    },
  ],
};

const scene = (overrides: Partial<CreativeScene> = {}): CreativeScene => ({
  id: "opening",
  startSeconds: 0,
  endSeconds: 6,
  kind: "human_context",
  assetId: "human-a",
  productVisible: true,
  overlay: {text: "OWN THE COMMUTE", claimId: null},
  cta: null,
  ...overrides,
});

const spec: CreativeSpec = {
  schemaVersion: "1.0.0",
  sourceMode: "fixture",
  campaignId: "orbit-campaign",
  productId: "orbit",
  objective: "Create desire",
  platform: "instagram_reels",
  audience: "Commuters",
  angle: "Personal calm",
  visualDirection: "Night city",
  supportedPromiseClaimId: "verified-feature",
  durationSeconds: 8,
  aspectRatio: "9:16",
  fps: 30,
  scenes: [
    scene(),
    scene({
      id: "end",
      startSeconds: 6,
      endSeconds: 8,
      kind: "end_card",
      assetId: "packshot-b",
      overlay: {text: "ORBIT X", claimId: null},
      cta: "SHOP ORBIT X",
    }),
  ],
};

describe("generic Remotion render contract", () => {
  it("carries the supplied product, scene copy, CTA, and audio into props", () => {
    const props = buildProductAdProps({
      evidence,
      spec,
      audio: "audio/orbit-score.m4a",
      resolveAssetPath: (asset) => `staged/${asset.path}`,
    });

    expect(props.evidence.product.name).toBe("ORBIT X");
    expect(props.spec.scenes[0].overlay.text).toBe("OWN THE COMMUTE");
    expect(props.spec.scenes[1].cta).toBe("SHOP ORBIT X");
    expect(props.audio).toBe("audio/orbit-score.m4a");
  });

  it("resolves every declared evidence asset through the supplied resolver", () => {
    const resolver = vi.fn((asset: ProductEvidence["assets"][number]) =>
      `staged/${asset.id}.webp`,
    );

    const props = buildProductAdProps({
      evidence,
      spec,
      audio: "audio/score.m4a",
      resolveAssetPath: resolver,
    });

    expect(resolver).toHaveBeenCalledTimes(evidence.assets.length);
    expect(props.assets).toEqual({
      "human-a": "staged/human-a.webp",
      "packshot-b": "staged/packshot-b.webp",
    });
  });

  it("chooses media only by scene.assetId, independent of scene id or kind", () => {
    const props = buildProductAdProps({
      evidence,
      spec,
      audio: "audio/score.m4a",
      resolveAssetPath: (asset) => `staged/${asset.id}.webp`,
    });
    const deliberatelyMismatchedScene = scene({
      id: "not-a-packshot-name",
      kind: "human_context",
      assetId: "packshot-b",
    });

    expect(resolveSceneAsset(deliberatelyMismatchedScene, props)).toEqual({
      src: "staged/packshot-b.webp",
      alt: "ORBIT X packshot",
    });
  });

  it("changes mapping and visible source data when inputs change", () => {
    const changedEvidence: ProductEvidence = {
      ...evidence,
      product: {...evidence.product, name: "PULSE PRO"},
      assets: evidence.assets.map((asset) =>
        asset.id === "human-a" ? {...asset, path: "products/pulse/new-hero.png"} : asset,
      ),
    };
    const changedSpec: CreativeSpec = {
      ...spec,
      scenes: spec.scenes.map((item, index) =>
        index === 0
          ? {...item, overlay: {...item.overlay, text: "QUIET STARTS HERE"}}
          : item,
      ),
    };
    const props = buildProductAdProps({
      evidence: changedEvidence,
      spec: changedSpec,
      audio: "audio/pulse.m4a",
      resolveAssetPath: (asset) => `staged/${asset.path}`,
    });

    expect(props.evidence.product.name).toBe("PULSE PRO");
    expect(props.spec.scenes[0].overlay.text).toBe("QUIET STARTS HERE");
    expect(props.assets["human-a"]).toBe("staged/products/pulse/new-hero.png");
  });

  it("fails clearly instead of silently borrowing product-specific music", () => {
    expect(() => requireAudioSource(undefined)).toThrow(/--audio/i);
    expect(requireAudioSource("music/licensed-score.m4a")).toBe(
      "music/licensed-score.m4a",
    );
  });
});

