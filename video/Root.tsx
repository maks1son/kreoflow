import {Composition} from "remotion";

import type {CreativeSpec, ProductEvidence} from "../src/lib/ad-compiler/schema";
import {ProductAd} from "./ProductAd";
import {buildProductAdProps} from "./render-contract";

export const PRODUCT_AD_COMPOSITION_ID = "KreoFlowProductAd";

const previewAsset =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><defs><radialGradient id="g"><stop stop-color="#243456"/><stop offset="1" stop-color="#05070a"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#g)"/><circle cx="540" cy="790" r="260" fill="none" stroke="#8eabff" stroke-width="5" opacity=".6"/><circle cx="540" cy="790" r="180" fill="#0c111c" stroke="#f4f7fb" stroke-width="3" opacity=".88"/></svg>`,
  );

const previewEvidence: ProductEvidence = {
  schemaVersion: "1.0.0",
  sourceMode: "fixture",
  evidenceId: "renderer-preview",
  product: {id: "preview-product", name: "PRODUCT", category: "preview"},
  claims: [
    {
      id: "preview-claim",
      text: "Verified benefit",
      status: "source_attributed",
      source: {
        type: "manual_note",
        reference: "Renderer preview fixture",
        excerpt: "Verified benefit",
      },
    },
  ],
  assets: [
    {
      id: "preview-context",
      path: "preview-context",
      role: "human_context",
      alt: "Product context preview",
    },
    {
      id: "preview-product",
      path: "preview-product",
      role: "clean_product",
      alt: "Product preview",
    },
  ],
};

const previewSpec: CreativeSpec = {
  schemaVersion: "1.0.0",
  sourceMode: "fixture",
  campaignId: "renderer-preview",
  productId: "preview-product",
  objective: "Preview the renderer",
  platform: "generic_vertical",
  audience: "Preview audience",
  angle: "Preview angle",
  visualDirection: "Dark premium product preview",
  supportedPromiseClaimId: "preview-claim",
  durationSeconds: 6,
  aspectRatio: "9:16",
  fps: 30,
  scenes: [
    {
      id: "preview-context",
      startSeconds: 0,
      endSeconds: 2,
      kind: "human_context",
      assetId: "preview-context",
      productVisible: true,
      overlay: {text: "YOUR PRODUCT", claimId: null},
      cta: null,
    },
    {
      id: "preview-benefit",
      startSeconds: 2,
      endSeconds: 4,
      kind: "clean_product",
      assetId: "preview-product",
      productVisible: true,
      overlay: {text: "VERIFIED BENEFIT", claimId: "preview-claim"},
      cta: null,
    },
    {
      id: "preview-end",
      startSeconds: 4,
      endSeconds: 6,
      kind: "end_card",
      assetId: "preview-product",
      productVisible: true,
      overlay: {text: "PRODUCT", claimId: null},
      cta: "LEARN MORE",
    },
  ],
};

export const defaultProductAdProps = buildProductAdProps({
  evidence: previewEvidence,
  spec: previewSpec,
  audio: null,
  resolveAssetPath: () => previewAsset,
});

export const RemotionRoot = () => (
  <Composition
    id={PRODUCT_AD_COMPOSITION_ID}
    component={ProductAd}
    durationInFrames={180}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={defaultProductAdProps}
    calculateMetadata={({props}) => ({
      durationInFrames: Math.round(props.spec.durationSeconds * props.spec.fps),
      fps: props.spec.fps,
      width: 1080,
      height: 1920,
    })}
  />
);

