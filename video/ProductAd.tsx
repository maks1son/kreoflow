import type {CSSProperties, ReactNode} from "react";

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
  clamp,
  condensedFont,
  easeOutQuart,
  fullBleed,
  palette,
  safeArea,
  sansFont,
  sceneOpacity,
  trackingLabel,
} from "./styles";

export interface ProductAdMedia {
  humanContext: string;
  humanControl: string;
  cleanProduct: string;
  audio: string;
}

export interface ProductAdProps extends Record<string, unknown> {
  spec: CreativeSpec;
  media: ProductAdMedia;
}

const resolveMedia = (scene: CreativeScene, media: ProductAdMedia) => {
  if (scene.kind === "clean_product" || scene.kind === "end_card") {
    return media.cleanProduct;
  }
  if (scene.id === "control") {
    return media.humanControl;
  }
  return media.humanContext;
};

const Label = ({children, style}: {children: ReactNode; style?: CSSProperties}) => (
  <div style={{...trackingLabel, color: palette.paper, ...style}}>{children}</div>
);

const BrandMark = ({dark = false}: {dark?: boolean}) => (
  <div
    style={{
      position: "absolute",
      top: safeArea.top,
      left: safeArea.left,
      right: safeArea.right,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      color: dark ? palette.ink : palette.paper,
      zIndex: 20,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontFamily: sansFont,
        fontSize: 44,
        fontWeight: 700,
        letterSpacing: "0.14em",
      }}
    >
      <span
        style={{
          width: 11,
          height: 11,
          borderRadius: "50%",
          background: palette.electric,
          boxShadow: `0 0 28px ${palette.electric}`,
        }}
      />
      NOVA ONE
    </div>
    <div style={{...trackingLabel, color: dark ? "#27303e" : palette.muted}}>
      01
    </div>
  </div>
);

const ImageStage = ({
  src,
  progress,
  scene,
}: {
  src: string;
  progress: number;
  scene: CreativeScene;
}) => {
  const isPackshot = scene.kind === "clean_product" || scene.kind === "end_card";
  const startScale = isPackshot ? 1.055 : scene.id === "chaos" ? 1.105 : 1.075;
  const endScale = isPackshot ? 1.005 : scene.id === "control" ? 1.025 : 1.045;
  const xShift = scene.id === "identity" ? interpolate(progress, [0, 1], [-16, 10]) : 0;
  const yShift = isPackshot ? interpolate(progress, [0, 1], [18, -10]) : 0;

  return (
    <AbsoluteFill style={{overflow: "hidden", background: palette.ink}}>
      <Img
        src={staticFile(src)}
        style={{
          ...fullBleed,
          objectFit: "cover",
          objectPosition: isPackshot ? "50% 52%" : "50% 50%",
          transform: `translate3d(${xShift}px, ${yShift}px, 0) scale(${interpolate(
            easeOutQuart(progress),
            [0, 1],
            [startScale, endScale],
          )})`,
          filter:
            scene.id === "chaos"
              ? "saturate(0.75) contrast(1.08) brightness(0.72)"
              : scene.kind === "end_card"
                ? "saturate(0.72) contrast(1.08) brightness(0.54)"
                : "saturate(0.9) contrast(1.04) brightness(0.82)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            scene.kind === "end_card"
              ? "linear-gradient(180deg, rgba(5,7,10,.2) 0%, rgba(5,7,10,.18) 38%, rgba(5,7,10,.92) 100%)"
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

const ChaosSignal = ({progress}: {progress: number}) => {
  const pulse = interpolate(progress, [0, 1], [0.18, 1]);
  return (
    <AbsoluteFill style={{overflow: "hidden", mixBlendMode: "screen"}}>
      {Array.from({length: 7}, (_, index) => {
        const offset = (index - 3) * 84;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: -180,
              right: -180,
              top: 590 + offset,
              height: index === 3 ? 6 : 2,
              opacity: (0.1 + Math.abs(index - 3) * 0.025) * pulse,
              background: index % 2 === 0 ? palette.signal : palette.electric,
              transform: `rotate(-8deg) translateX(${interpolate(progress, [0, 1], [-240, 300])}px)`,
              boxShadow: `0 0 ${24 + index * 4}px currentColor`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const CalmSignal = ({progress, compact = false}: {progress: number; compact?: boolean}) => {
  const expansion = interpolate(easeOutQuart(progress), [0, 1], [0.35, 1]);
  const alpha = interpolate(progress, [0, 0.14, 0.78, 1], [0, 0.72, 0.46, 0.08]);
  return (
    <div
      style={{
        position: "absolute",
        width: compact ? 640 : 920,
        height: compact ? 640 : 920,
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

const WordReveal = ({
  lines,
  progress,
  accentLine,
  align = "left",
  fontSize = 132,
}: {
  lines: string[];
  progress: number;
  accentLine?: number;
  align?: "left" | "center";
  fontSize?: number;
}) => (
  <div style={{display: "flex", flexDirection: "column", alignItems: align === "center" ? "center" : "flex-start"}}>
    {lines.map((line, index) => {
      const local = clamp((progress - index * 0.09) / 0.34);
      const reveal = easeOutQuart(local);
      return (
        <div
          key={line}
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

const ChaosCopy = ({progress}: {progress: number}) => (
  <div
    style={{
      position: "absolute",
      left: safeArea.left,
      right: safeArea.right,
      bottom: 292,
      zIndex: 10,
    }}
  >
    <Label style={{marginBottom: 30, color: palette.signal}}>CITY NOISE / OVERLOAD</Label>
    <WordReveal lines={["TOO MUCH", "CITY?"]} progress={progress} accentLine={1} fontSize={150} />
  </div>
);

const ControlCopy = ({progress}: {progress: number}) => (
  <div
    style={{
      position: "absolute",
      left: safeArea.left,
      right: safeArea.right,
      bottom: 290,
      zIndex: 10,
    }}
  >
    <Label style={{marginBottom: 30, color: palette.electricSoft}}>SIGNAL RESTORED</Label>
    <WordReveal lines={["TAKE BACK", "THE SIGNAL"]} progress={progress} accentLine={1} fontSize={132} />
    <div
      style={{
        marginTop: 46,
        width: interpolate(easeOutQuart(progress), [0, 1], [0, 460]),
        height: 6,
        borderRadius: 99,
        background: `linear-gradient(90deg, ${palette.electric}, ${palette.electricSoft})`,
        boxShadow: "0 0 34px rgba(79,124,255,.72)",
      }}
    />
  </div>
);

const FeatureCopy = ({progress}: {progress: number}) => (
  <>
    <div
      style={{
        position: "absolute",
        left: safeArea.left,
        right: safeArea.right,
        top: 1110,
        zIndex: 12,
      }}
    >
      <Label style={{marginBottom: 28, color: palette.electricSoft}}>SOURCE-ATTRIBUTED FEATURE</Label>
      <WordReveal lines={["ADAPTIVE", "NOISE", "CANCELLING"]} progress={progress} accentLine={2} fontSize={122} />
    </div>
    <div
      style={{
        position: "absolute",
        right: safeArea.right,
        top: 335,
        width: 104,
        height: 104,
        border: "2px solid rgba(244,247,251,.4)",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: sansFont,
        color: palette.paper,
        fontSize: 44,
        letterSpacing: ".12em",
        opacity: interpolate(progress, [0, 0.2, 1], [0, 1, 1]),
        zIndex: 12,
      }}
    >
      ANC
    </div>
  </>
);

const IdentityCopy = ({progress}: {progress: number}) => (
  <div
    style={{
      position: "absolute",
      left: safeArea.left,
      right: safeArea.right,
      bottom: 298,
      zIndex: 10,
    }}
  >
    <Label style={{marginBottom: 30, color: palette.electricSoft}}>NOVA ONE / PERSONAL AUDIO</Label>
    <WordReveal lines={["YOUR CITY.", "YOUR VOLUME."]} progress={progress} accentLine={1} fontSize={124} />
  </div>
);

const EndCard = ({progress, cta}: {progress: number; cta: string}) => {
  const reveal = easeOutQuart(clamp(progress / 0.34));
  return (
    <>
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
        <div
          style={{
            fontFamily: condensedFont,
            fontSize: 164,
            fontWeight: 600,
            lineHeight: 0.86,
            letterSpacing: "-0.045em",
            color: palette.paper,
            textAlign: "center",
            textShadow: "0 8px 44px rgba(0,0,0,.5)",
          }}
        >
          NOVA ONE
        </div>
        <div
          style={{
            marginTop: 40,
            minWidth: 540,
            padding: "30px 54px 29px",
            borderRadius: 999,
            background: palette.paper,
            color: palette.ink,
            fontFamily: sansFont,
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: "0.14em",
            lineHeight: 1,
            textAlign: "center",
            boxShadow: "0 14px 48px rgba(0,0,0,.24)",
          }}
        >
          {cta}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 204,
          width: 8,
          height: 8,
          marginLeft: -4,
          borderRadius: "50%",
          background: palette.electric,
          boxShadow: `0 0 26px ${palette.electric}`,
          zIndex: 11,
        }}
      />
    </>
  );
};

const SceneLayer = ({
  scene,
  index,
  sceneCount,
  spec,
  media,
}: {
  scene: CreativeScene;
  index: number;
  sceneCount: number;
  spec: CreativeSpec;
  media: ProductAdMedia;
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

  return (
    <AbsoluteFill style={{opacity}}>
      <ImageStage src={resolveMedia(scene, media)} progress={progress} scene={scene} />
      {scene.id === "chaos" ? <ChaosSignal progress={progress} /> : null}
      {scene.id === "control" ? <CalmSignal progress={progress} /> : null}
      {scene.kind === "clean_product" ? <CalmSignal progress={progress} compact /> : null}
      {scene.kind !== "end_card" ? <BrandMark /> : null}
      {scene.id === "chaos" ? <ChaosCopy progress={progress} /> : null}
      {scene.id === "control" ? <ControlCopy progress={progress} /> : null}
      {scene.kind === "clean_product" ? <FeatureCopy progress={progress} /> : null}
      {scene.id === "identity" ? <IdentityCopy progress={progress} /> : null}
      {scene.kind === "end_card" && scene.cta ? <EndCard progress={progress} cta={scene.cta} /> : null}
      <div
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
    </AbsoluteFill>
  );
};

export const ProductAd = ({spec, media}: ProductAdProps) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  return (
    <AbsoluteFill style={{background: palette.ink, color: palette.paper, fontFamily: sansFont}}>
      <Audio
        src={staticFile(media.audio)}
        volume={(audioFrame) =>
          interpolate(
            audioFrame,
            [0, 10, durationInFrames - 12, durationInFrames - 1],
            [0, 1, 1, 0],
            {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
          )
        }
      />
      {spec.scenes.map((scene, index) => (
        <SceneLayer
          key={scene.id}
          scene={scene}
          index={index}
          sceneCount={spec.scenes.length}
          spec={spec}
          media={media}
        />
      ))}
      <AbsoluteFill
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
