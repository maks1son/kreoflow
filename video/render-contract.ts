import type {
  CreativeScene,
  CreativeSpec,
  ProductEvidence,
} from "../src/lib/ad-compiler/schema";

type EvidenceAsset = ProductEvidence["assets"][number];

export interface ProductAdProps extends Record<string, unknown> {
  evidence: ProductEvidence;
  spec: CreativeSpec;
  assets: Record<string, string>;
  audio: string | null;
}

export interface BuildProductAdPropsInput {
  evidence: ProductEvidence;
  spec: CreativeSpec;
  audio?: string | null;
  resolveAssetPath: (asset: EvidenceAsset) => string;
}

export const buildProductAdProps = ({
  evidence,
  spec,
  audio = null,
  resolveAssetPath,
}: BuildProductAdPropsInput): ProductAdProps => {
  if (spec.productId !== evidence.product.id) {
    throw new Error(
      `Render product "${spec.productId}" does not match evidence product "${evidence.product.id}"`,
    );
  }

  const assets = Object.fromEntries(
    evidence.assets.map((asset) => {
      const resolved = resolveAssetPath(asset).trim();
      if (!resolved) {
        throw new Error(`Asset "${asset.id}" resolved to an empty path`);
      }
      return [asset.id, resolved];
    }),
  );

  const props: ProductAdProps = {evidence, spec, assets, audio};
  for (const scene of spec.scenes) {
    resolveSceneAsset(scene, props);
  }
  return props;
};

export const resolveSceneAsset = (
  scene: CreativeScene,
  props: Pick<ProductAdProps, "evidence" | "assets">,
) => {
  const evidenceAsset = props.evidence.assets.find(
    (asset) => asset.id === scene.assetId,
  );
  if (!evidenceAsset) {
    throw new Error(
      `Scene "${scene.id}" references undeclared asset "${scene.assetId}"`,
    );
  }

  const src = props.assets[scene.assetId];
  if (!src) {
    throw new Error(`No rendered source exists for asset "${scene.assetId}"`);
  }

  return {src, alt: evidenceAsset.alt};
};

export const requireAudioSource = (audio: string | undefined) => {
  const value = audio?.trim();
  if (!value) {
    throw new Error(
      "Missing --audio. Supply a licensed soundtrack explicitly; KreoFlow never borrows demo music for another product.",
    );
  }
  return value;
};

export const toStaticFilePath = (path: string) => {
  const normalized = path.replaceAll("\\", "/").replace(/^\.\//, "");
  return normalized.startsWith("public/")
    ? normalized.slice("public/".length)
    : normalized;
};

