import {Composition} from "remotion";

import creativeSpecFixture from "../samples/nova-one/creative-spec.json";
import type {CreativeSpec} from "../src/lib/ad-compiler/schema";
import {ProductAd, type ProductAdProps} from "./ProductAd";

export const PRODUCT_AD_COMPOSITION_ID = "KreoFlowProductAd";

export const defaultProductAdProps: ProductAdProps = {
  spec: creativeSpecFixture as CreativeSpec,
  media: {
    humanContext: "media/build-week/ad-compiler/nova-one-master.webp",
    humanControl: "media/build-week/ad-compiler/nova-one-control.webp",
    cleanProduct: "media/build-week/ad-compiler/nova-one-packshot.webp",
    audio: "media/build-week/ad-compiler/nova-one-score.m4a",
  },
};

export const RemotionRoot = () => (
  <Composition
    id={PRODUCT_AD_COMPOSITION_ID}
    component={ProductAd}
    durationInFrames={360}
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

