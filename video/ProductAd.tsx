import type {ReactNode} from "react";

import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import type {CreativeScene, CreativeSpec} from "../src/lib/ad-compiler/schema";
import {
  type ProductAdProps,
  resolveSceneAsset,
} from "./render-contract";
import {
  clamp,
  condensedFont,
  easeOutQuart,
  fullBleed,
  palette,
  safeArea,
  sansFont,
  sceneOpacity,
} from "./styles";

export type {ProductAdProps} from "./render-contract";

const mediaSource = (source: string) =>
  /^(?:https?:|data:|blob:)/i.test(source) ? source : staticFile(source);

const wrapOverlayText = (text: string, preferredLineLength: number) => {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && candidate.length > preferredLineLength && lines.length < 2) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
};

const BrandMark = ({productName}: {productName: string}) => (
  <div
    style={{
      position: "absolute",
      top: safeArea.top,
      left: safeArea.left,
      right: safeArea.right,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      color: palette.paper,
      zIndex: 20,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        maxWidth: 780,
        fontFamily: sansFont,
        fontSize: 44,
        fontWeight: 700,
        letterSpacing: "0.12em",
        lineHeight: 1,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      <span
        style={{
          flex: "0 0 auto",
          width: 11,
          height: 11,
          borderRadius: "50%",
          background: palette.electric,
          boxShadow: `0 0 28px ${palette.electric}`,
        }}
      />
      {productName}
    </div>
    <div
      aria-hidden
      style={{
        width: 72,
        height: 2,
        background: "rgba(244,247,251,.56)",
      }}
    />
  </div>
);

const sceneVisuals: Record<
  CreativeScene["kind"],
  {
    startScale: number;
    endScale: number;
    brightness: number;
    saturation: number;
    objectPosition: string;
  }
> = {
  human_context: {
    startScale: 1.105,
    endScale: 1.045,
    brightness: 0.76,
    saturation: 0.82,
    objectPosition: "50% 50%",
  },
  clean_product: {
    startScale: 1.055,
    endScale: 1.005,
    brightness: 0.82,
    saturation: 0.9,
    objectPosition: "50% 52%",
  },
  product_detail: {
    startScale: 1.12,
    endScale: 1.04,
    brightness: 0.78,
    saturation: 0.88,
    objectPosition: "50% 48%",
  },
  end_card: {
    startScale: 1.035,
    endScale: 1,
    brightness: 0.58,
    saturation: 0.74,
    objectPosition: "50% 52%",
  },
};

const ImageStage = ({
  src,
  alt,
  progress,
  kind,
}: {
  src: string;
  alt: string;
  progress: number;
  kind: CreativeScene["kind"];
}) => {
  const visual = sceneVisuals[kind];
  const isEndCard = kind === "end_card";

  return (
    <AbsoluteFill style={{overflow: "hidden", background: palette.ink}}>
      <Img
        src={mediaSource(src)}
        alt={alt}
        style={{
          ...fullBleed,
          objectFit: "cover",
          objectPosition: visual.objectPosition,
          transform: `translate3d(0, ${interpolate(progress, [0, 1], [14, -8])}px, 0) scale(${interpolate(
            easeOutQuart(progress),
            [0, 1],
            [visual.startScale, visual.endScale],
          )})`,
          filter: `saturate(${visual.saturation}) contrast(1.06) brightness(${visual.brightness})`,
        }}
      />
      <AbsoluteFill
        style={{
          background: isEndCard
            ? "linear-gradient(180deg, rgba(5,7,10,.18) 0%, rgba(5,7,10,.12) 38%, rgba(5,7,10,.92) 100%)"
            : "linear-gradient(180deg, rgba(5,7,10,.16) 0%, rgba(5,7,10,.02) 42%, rgba(5,7,10,.92) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 48% 38%, transparent 0 26%, rgba(3,5,8,.08) 55%, rgba(3,5,8,.58) 100%)",
          mixBlendMode: "multiply",
        }}
      />
    </AbsoluteFill>
  );
};

const HumanSignal = ({progress}: {progress: number}) => {
  const travel = interpolate(progress, [0, 1], [-240, 300]);
  return (
    <AbsoluteFill style={{overflow: "hidden", mixBlendMode: "screen"}}>
      {Array.from({length: 7}, (_, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: -180,
            right: -180,
            top: 566 + (index - 3) * 84,
            height: index === 3 ? 5 : 2,
            opacity: 0.08 + Math.abs(index - 3) * 0.018,
            background: index % 2 === 0 ? palette.signal : palette.electric,
            transform: `rotate(-8deg) translateX(${travel}px)`,
            boxShadow: `0 0 ${22 + index * 4}px currentColor`,
          }}
        />
      ))}
      <SignalRings progress={progress} />
    </AbsoluteFill>
  );
};

const SignalRings = ({
  progress,
  compact = false,
}: {
  progress: number;
  compact?: boolean;
}) => {
  const expansion = interpolate(easeOutQuart(progress), [0, 1], [0.35, 1]);
  const alpha = interpolate(progress, [0, 0.14, 0.78, 1], [0, 0.72, 0.46, 0.08]);
  const size = compact ? 640 : 920;
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        left: compact ? 218 : -132,
        top: compact ? 520 : 374,
        borderRadius: "50%",
        border: `${compact ? 3 : 4}px solid ${palette.electricSoft}`,
        opacity: alpha,
        transform: `scale(${expansion})`,
        boxShadow: `0 0 90px rgba(79,124,255,${alpha * 0.62}), inset 0 0 90px rgba(79,124,255,${alpha * 0.24})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: compact ? 70 : 92,
          border: "2px solid rgba(142,171,255,.55)",
          borderRadius: "50%",
        }}
      />
    </div>
  );
};

const ProductDetailGrid = ({progress}: {progress: number}) => (
  <AbsoluteFill
    style={{
      opacity: interpolate(progress, [0, 0.18, 1], [0, 0.48, 0.12]),
      backgroundImage:
        "linear-gradient(rgba(142,171,255,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(142,171,255,.18) 1px, transparent 1px)",
      backgroundSize: "96px 96px",
      maskImage: "radial-gradient(circle at center, black, transparent 72%)",
    }}
  />
);

const WordReveal = ({
  lines,
  progress,
  accentLine,
  align = "left",
  fontSize,
}: {
  lines: string[];
  progress: number;
  accentLine: number;
  align?: "left" | "center";
  fontSize: number;
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: align === "center" ? "center" : "flex-start",
    }}
  >
    {lines.map((line, index) => {
      const local = clamp((progress - index * 0.09) / 0.34);
      const reveal = easeOutQuart(local);
      return (
        <div
          key={`${index}-${line}`}
          style={{
            fontFamily: condensedFont,
            fontSize,
            fontWeight: 600,
            letterSpacing: "-0.035em",
            lineHeight: 0.84,
            color: index === accentLine ? palette.electricSoft : palette.paper,
            opacity: reveal,
            transform: `translateY(${interpolate(reveal, [0, 1], [70, 0])}px)`,
            clipPath: `inset(0 ${interpolate(reveal, [0, 1], [100, 0])}% 0 0)`,
            textAlign: align,
            textShadow: "0 8px 32px rgba(0,0,0,.34)",
            whiteSpace: "nowrap",
          }}
        >
          {line}
        </div>
      );
    })}
  </div>
);

const InlineCta = ({children, progress}: {children: ReactNode; progress: number}) => (
  <div
    style={{
      marginTop: 42,
      display: "inline-flex",
      padding: "23px 38px 22px",
      borderRadius: 999,
      border: "2px solid rgba(244,247,251,.72)",
      color: palette.paper,
      fontFamily: sansFont,
      fontSize: 44,
      fontWeight: 700,
      letterSpacing: "0.08em",
      lineHeight: 1,
      opacity: easeOutQuart(clamp((progress - 0.18) / 0.36)),
    }}
  >
    {children}
  </div>
);

const SceneCopy = ({scene, progress}: {scene: CreativeScene; progress: number}) => {
  const productLed = scene.kind === "clean_product" || scene.kind === "product_detail";
  const lines = wrapOverlayText(scene.overlay.text, productLed ? 13 : 16);
  const fontSize =
    scene.kind === "product_detail" ? 110 : productLed ? 122 : lines.length > 2 ? 118 : 140;

  return (
    <div
      style={{
        position: "absolute",
        left: safeArea.left,
        right: safeArea.right,
        top: productLed ? 1090 : undefined,
        bottom: productLed ? undefined : 292,
        zIndex: 10,
      }}
    >
      <WordReveal
        lines={lines}
        progress={progress}
        accentLine={productLed ? lines.length - 1 : Math.min(1, lines.length - 1)}
        fontSize={fontSize}
      />
      {scene.cta ? <InlineCta progress={progress}>{scene.cta}</InlineCta> : null}
    </div>
  );
};

const EndCard = ({scene, progress}: {scene: CreativeScene; progress: number}) => {
  const reveal = easeOutQuart(clamp(progress / 0.34));
  const lines = wrapOverlayText(scene.overlay.text, 18);
  return (
    <div
      style={{
        position: "absolute",
        left: safeArea.left,
        right: safeArea.right,
        bottom: 272,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: reveal,
        transform: `translateY(${interpolate(reveal, [0, 1], [56, 0])}px)`,
      }}
    >
      <WordReveal
        lines={lines}
        progress={progress}
        accentLine={-1}
        align="center"
        fontSize={lines.length > 1 ? 132 : 164}
      />
      {scene.cta ? (
        <div
          style={{
            marginTop: 40,
            minWidth: 600,
            padding: "28px 54px 27px",
            borderRadius: 999,
            background: palette.paper,
            color: palette.ink,
            fontFamily: sansFont,
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: "0.1em",
            lineHeight: 1,
            textAlign: "center",
            boxShadow: "0 14px 48px rgba(0,0,0,.24)",
          }}
        >
          {scene.cta}
        </div>
      ) : null}
    </div>
  );
};

const ProgressRail = ({spec}: {spec: CreativeSpec}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: safeArea.left,
        right: safeArea.right,
        bottom: 174,
        height: 2,
        background: "rgba(244,247,251,.18)",
        zIndex: 30,
      }}
    >
      <div
        style={{
          width: `${clamp(frame / (spec.durationSeconds * fps)) * 100}%`,
          height: "100%",
          background: palette.electric,
          boxShadow: "0 0 18px rgba(79,124,255,.72)",
        }}
      />
    </div>
  );
};

const SceneLayer = ({
  scene,
  index,
  sceneCount,
  props,
}: {
  scene: CreativeScene;
  index: number;
  sceneCount: number;
  props: ProductAdProps;
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const startFrame = Math.round(scene.startSeconds * fps);
  const endFrame = Math.round(scene.endSeconds * fps);
  const progress = clamp((frame - startFrame) / Math.max(1, endFrame - startFrame));
  const opacity = sceneOpacity({
    frame,
    startFrame,
    endFrame,
    transitionFrames: 7,
    isFirst: index === 0,
    isLast: index === sceneCount - 1,
  });

  if (opacity <= 0) return null;

  const asset = resolveSceneAsset(scene, props);
  return (
    <AbsoluteFill style={{opacity}}>
      <ImageStage src={asset.src} alt={asset.alt} progress={progress} kind={scene.kind} />
      {scene.kind === "human_context" ? <HumanSignal progress={progress} /> : null}
      {scene.kind === "clean_product" ? <SignalRings progress={progress} compact /> : null}
      {scene.kind === "product_detail" ? <ProductDetailGrid progress={progress} /> : null}
      <BrandMark productName={props.evidence.product.name} />
      {scene.kind === "end_card" ? (
        <EndCard scene={scene} progress={progress} />
      ) : (
        <SceneCopy scene={scene} progress={progress} />
      )}
      <ProgressRail spec={props.spec} />
    </AbsoluteFill>
  );
};

export const ProductAd = (props: ProductAdProps) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  return (
    <AbsoluteFill style={{background: palette.ink, color: palette.paper, fontFamily: sansFont}}>
      {props.audio ? (
        <Audio
          src={mediaSource(props.audio)}
          volume={(audioFrame) =>
            interpolate(
              audioFrame,
              [0, 10, durationInFrames - 12, durationInFrames - 1],
              [0, 1, 1, 0],
              {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
            )
          }
        />
      ) : null}
      {props.spec.scenes.map((scene, index) => (
        <SceneLayer
          key={scene.id}
          scene={scene}
          index={index}
          sceneCount={props.spec.scenes.length}
          props={props}
        />
      ))}
      <AbsoluteFill
        aria-hidden
        style={{
          pointerEvents: "none",
          opacity: 0.055,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
          transform: `translate(${frame % 4}px, ${(frame * 3) % 4}px)`,
          mixBlendMode: "soft-light",
        }}
      />
    </AbsoluteFill>
  );
};
