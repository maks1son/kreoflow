import type {CSSProperties, ReactNode} from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import {condensedFont, sansFont} from "./styles";

export const DEVPOST_DEMO_COMPOSITION_ID = "KreoFlowDevpostDemo";
export const DEVPOST_DEMO_FPS = 30;
export const DEVPOST_DEMO_DURATION_IN_FRAMES = 66 * DEVPOST_DEMO_FPS;

const color = {
  ink: "#020612",
  panel: "rgba(9, 20, 48, 0.82)",
  panelStrong: "#081633",
  paper: "#f5f7ff",
  muted: "rgba(226, 234, 255, 0.62)",
  quiet: "rgba(226, 234, 255, 0.36)",
  blue: "#6d8fff",
  blueBright: "#8ea9ff",
  coral: "#ff6f61",
  green: "#68e0b8",
  line: "rgba(126, 159, 255, 0.24)",
} as const;

const adPath = "media/build-week/ad-compiler/nova-one-accountable-ad.mp4";
const scorePath = "media/build-week/ad-compiler/nova-one-score.m4a";
const posterPath = "media/build-week/ad-compiler/nova-one-accountable-poster.jpg";
const masterPath = "media/build-week/ad-compiler/nova-one-master.webp";
const controlPath = "media/build-week/ad-compiler/nova-one-control.webp";
const packshotPath = "media/build-week/ad-compiler/nova-one-packshot.webp";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const enter = (frame: number, delay = 0, duration = 18) =>
  interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const lift = (frame: number, delay = 0, distance = 42) => {
  const amount = enter(frame, delay, 22);
  return {
    opacity: amount,
    transform: `translateY(${(1 - amount) * distance}px)`,
  };
};

const baseCard: CSSProperties = {
  background:
    "linear-gradient(145deg, rgba(16, 35, 79, 0.86), rgba(4, 10, 26, 0.88))",
  border: `1px solid ${color.line}`,
  boxShadow: "0 28px 90px rgba(0, 0, 0, 0.34)",
  backdropFilter: "blur(16px)",
};

const Scene = ({duration, children}: {duration: number; children: ReactNode}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 12, Math.max(13, duration - 12), duration],
    [0, 1, 1, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );

  return (
    <AbsoluteFill style={{opacity, padding: "126px 136px 96px"}}>
      {children}
    </AbsoluteFill>
  );
};

const Eyebrow = ({step, children}: {step: string; children: ReactNode}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 18,
      fontFamily: sansFont,
      fontSize: 21,
      fontWeight: 700,
      letterSpacing: "0.18em",
      color: color.blueBright,
      textTransform: "uppercase",
    }}
  >
    <span
      style={{
        display: "grid",
        placeItems: "center",
        width: 46,
        height: 30,
        borderRadius: 99,
        border: `1px solid ${color.line}`,
        color: color.paper,
        letterSpacing: "0.06em",
        fontSize: 15,
      }}
    >
      {step}
    </span>
    {children}
  </div>
);

const StatusPill = ({children, tone = "blue"}: {children: ReactNode; tone?: "blue" | "coral" | "green"}) => {
  const foreground = tone === "coral" ? color.coral : tone === "green" ? color.green : color.blueBright;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        border: `1px solid ${foreground}55`,
        background: `${foreground}12`,
        color: foreground,
        padding: "9px 14px",
        borderRadius: 99,
        fontFamily: sansFont,
        fontSize: 15,
        fontWeight: 700,
        letterSpacing: "0.11em",
        textTransform: "uppercase",
      }}
    >
      <span style={{width: 7, height: 7, borderRadius: 99, background: foreground, boxShadow: `0 0 18px ${foreground}`}} />
      {children}
    </span>
  );
};

const Backdrop = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const progress = frame / durationInFrames;

  return (
    <AbsoluteFill style={{background: color.ink, overflow: "hidden"}}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 72% 20%, rgba(34, 79, 192, 0.32), transparent 37%), radial-gradient(circle at 12% 88%, rgba(35, 70, 150, 0.20), transparent 34%), linear-gradient(118deg, #02050e 0%, #05122c 48%, #020716 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -240,
          opacity: 0.22,
          backgroundImage:
            "linear-gradient(rgba(121, 151, 255, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(121, 151, 255, 0.12) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          transform: `perspective(900px) rotateX(64deg) translateY(${265 + frame * 0.08}px) scale(1.2)`,
          transformOrigin: "50% 65%",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 24%, black 88%, transparent 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 820,
          height: 820,
          right: -310 + Math.sin(frame / 95) * 36,
          top: -410 + Math.cos(frame / 110) * 24,
          borderRadius: "50%",
          border: "1px solid rgba(104, 142, 255, 0.18)",
          boxShadow: "inset 0 0 120px rgba(64, 106, 225, 0.08)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 54,
          top: 42,
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontFamily: sansFont,
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: color.paper,
          fontSize: 20,
        }}
      >
        <span style={{width: 12, height: 12, borderRadius: 3, background: color.coral, transform: "rotate(45deg)"}} />
        KreoFlow
        <span style={{color: color.quiet, fontWeight: 500}}>BUILD WEEK PROOF</span>
      </div>
      <div
        style={{
          position: "absolute",
          right: 58,
          top: 47,
          fontFamily: sansFont,
          fontSize: 14,
          letterSpacing: "0.16em",
          color: color.quiet,
        }}
      >
        NO VOICEOVER · ACTUAL ARTIFACTS
      </div>
      <div style={{position: "absolute", left: 0, right: 0, bottom: 0, height: 5, background: "rgba(109, 143, 255, 0.12)"}}>
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${color.blue}, ${color.coral})`,
            boxShadow: `0 0 20px ${color.blue}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const HookScene = () => {
  const frame = useCurrentFrame();
  const pulse = 0.7 + Math.sin(frame / 10) * 0.3;
  return (
    <Scene duration={150}>
      <div style={{...lift(frame, 4), marginTop: 30}}>
        <StatusPill tone="coral">the missing quality layer</StatusPill>
      </div>
      <div
        style={{
          ...lift(frame, 13, 58),
          marginTop: 34,
          maxWidth: 1460,
          fontFamily: condensedFont,
          fontWeight: 600,
          fontSize: 118,
          letterSpacing: "-0.025em",
          lineHeight: 0.91,
          textTransform: "uppercase",
          color: color.paper,
        }}
      >
        AI CAN MAKE AN MP4.
        <br />
        <span style={{color: color.blueBright}}>CAN IT PROVE</span> IT&apos;S READY?
      </div>
      <div
        style={{
          ...lift(frame, 27),
          marginTop: 42,
          display: "flex",
          alignItems: "center",
          gap: 28,
          fontFamily: sansFont,
          fontSize: 27,
          color: color.muted,
        }}
      >
        <span style={{width: 76, height: 2, background: color.coral, boxShadow: `0 0 ${22 * pulse}px ${color.coral}`}} />
        KreoFlow compiles evidence into an ad — then ships the receipts.
      </div>
      <div style={{...lift(frame, 44), display: "flex", gap: 14, marginTop: 56}}>
        <StatusPill>evidence-bound</StatusPill>
        <StatusPill>rendered</StatusPill>
        <StatusPill tone="green">13 checks</StatusPill>
      </div>
    </Scene>
  );
};

const Metric = ({label, value}: {label: string; value: string}) => (
  <div style={{padding: "19px 21px", borderLeft: `1px solid ${color.line}`}}>
    <div style={{fontFamily: sansFont, fontSize: 13, letterSpacing: "0.14em", color: color.quiet, textTransform: "uppercase"}}>{label}</div>
    <div style={{marginTop: 7, fontFamily: condensedFont, fontWeight: 600, fontSize: 31, color: color.paper}}>{value}</div>
  </div>
);

const ProofScene = () => {
  const frame = useCurrentFrame();
  const phoneIn = spring({frame: frame - 16, fps: DEVPOST_DEMO_FPS, config: {damping: 18, stiffness: 92, mass: 0.75}});
  return (
    <Scene duration={390}>
      <div style={{display: "flex", height: "100%", gap: 90}}>
        <div style={{width: 990, paddingTop: 26}}>
          <div style={lift(frame, 4)}><Eyebrow step="01">actual output</Eyebrow></div>
          <div
            style={{
              ...lift(frame, 12),
              marginTop: 30,
              fontFamily: condensedFont,
              fontSize: 89,
              fontWeight: 600,
              lineHeight: 0.92,
              textTransform: "uppercase",
              color: color.paper,
            }}
          >
            NOT A MOCKUP.
            <br />
            <span style={{color: color.blueBright}}>THE ACTUAL AD.</span>
          </div>
          <p style={{...lift(frame, 24), maxWidth: 800, margin: "34px 0 0", fontFamily: sansFont, fontSize: 26, lineHeight: 1.4, color: color.muted}}>
            A committed vertical render compiled from the NOVA ONE evidence fixture and CreativeSpec.
          </p>
          <div style={{...lift(frame, 36), ...baseCard, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", marginTop: 48, borderRadius: 20, overflow: "hidden"}}>
            <Metric label="delivery" value="1080 × 1920" />
            <Metric label="runtime" value="12.05 sec" />
            <Metric label="frame rate" value="30 fps" />
            <Metric label="video" value="H.264 High" />
            <Metric label="audio" value="AAC · 48 kHz" />
            <Metric label="loudness" value="−17.3 LUFS" />
          </div>
          <div style={{...lift(frame, 52), marginTop: 28}}><StatusPill tone="green">encoded output verified</StatusPill></div>
        </div>
        <div
          style={{
            position: "relative",
            flex: 1,
            display: "grid",
            placeItems: "center",
            transform: `translateY(${(1 - phoneIn) * 70}px) scale(${0.92 + phoneIn * 0.08})`,
            opacity: clamp(phoneIn),
          }}
        >
          <div style={{position: "absolute", width: 590, height: 590, borderRadius: "50%", border: `1px solid ${color.line}`, boxShadow: "0 0 130px rgba(67, 104, 222, 0.18)"}} />
          <div style={{position: "relative", width: 382, height: 680, padding: 13, borderRadius: 48, background: "linear-gradient(145deg, #263b70, #050a17 42%, #182957)", boxShadow: "0 46px 100px rgba(0,0,0,.62), 0 0 0 1px rgba(154,181,255,.34)"}}>
            <div style={{position: "absolute", zIndex: 4, top: 24, left: "50%", transform: "translateX(-50%)", width: 74, height: 8, borderRadius: 99, background: "rgba(0,0,0,.72)"}} />
            <div style={{position: "relative", overflow: "hidden", width: "100%", height: "100%", borderRadius: 37, background: "#05070a"}}>
              <Img src={staticFile(posterPath)} style={{width: "100%", height: "100%", objectFit: "cover"}} />
              <Sequence from={15} durationInFrames={360}>
                <OffthreadVideo src={staticFile(adPath)} muted style={{width: "100%", height: "100%", objectFit: "cover"}} />
              </Sequence>
            </div>
          </div>
          <div style={{position: "absolute", right: -6, bottom: 48, transform: "rotate(-2deg)"}}>
            <StatusPill tone="coral">actual render · 38aec32a</StatusPill>
          </div>
        </div>
      </div>
    </Scene>
  );
};

const CodeLine = ({label, value, delay}: {label: string; value: string; delay: number}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{...lift(frame, delay, 18), display: "grid", gridTemplateColumns: "230px 1fr", padding: "14px 0", borderBottom: `1px solid ${color.line}`, fontFamily: '"IBM Plex Mono", monospace', fontSize: 20}}>
      <span style={{color: color.quiet}}>{label}</span>
      <span style={{color: color.blueBright}}>{value}</span>
    </div>
  );
};

const ClaimCard = ({status, text, delay, active}: {status: string; text: string; delay: number; active?: boolean}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        ...lift(frame, delay, 24),
        ...baseCard,
        padding: "23px 26px",
        borderRadius: 18,
        borderColor: active ? `${color.blueBright}66` : color.line,
        opacity: active ? enter(frame, delay) : enter(frame, delay) * 0.58,
      }}
    >
      <div style={{fontFamily: sansFont, fontSize: 14, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: active ? color.green : color.coral}}>{status}</div>
      <div style={{marginTop: 9, fontFamily: sansFont, fontSize: 23, lineHeight: 1.25, color: color.paper}}>{text}</div>
    </div>
  );
};

const EvidenceScene = () => {
  const frame = useCurrentFrame();
  const scan = interpolate(frame % 120, [0, 119], [0, 100]);
  return (
    <Scene duration={210}>
      <div style={lift(frame, 4)}><Eyebrow step="02">evidence contract</Eyebrow></div>
      <div style={{display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 58, marginTop: 36}}>
        <div>
          <div style={{...lift(frame, 10), fontFamily: condensedFont, fontSize: 69, fontWeight: 600, lineHeight: 0.95, textTransform: "uppercase", color: color.paper}}>
            CLAIMS ENTER<br /><span style={{color: color.blueBright}}>WITH A STATUS.</span>
          </div>
          <div style={{...lift(frame, 21), ...baseCard, position: "relative", overflow: "hidden", marginTop: 34, borderRadius: 20, padding: "24px 30px"}}>
            <div style={{position: "absolute", left: 0, right: 0, top: `${scan}%`, height: 1, background: `linear-gradient(90deg, transparent, ${color.blueBright}, transparent)`, boxShadow: `0 0 18px ${color.blue}`}} />
            <CodeLine label="source_mode" value='"fixture"' delay={22} />
            <CodeLine label="evidence_id" value='"nova-one-demo-v1"' delay={28} />
            <CodeLine label="product" value='"NOVA ONE"' delay={34} />
            <CodeLine label="claims" value="3 typed records" delay={40} />
            <CodeLine label="assets" value="3 role-bound sources" delay={46} />
          </div>
        </div>
        <div style={{paddingTop: 8}}>
          <p style={{...lift(frame, 14), margin: "0 0 22px", fontFamily: sansFont, fontSize: 22, lineHeight: 1.42, color: color.muted}}>
            The compiler can select only the source-attributed promise. Unsupported language never reaches the visible spec.
          </p>
          <div style={{display: "grid", gap: 14}}>
            <ClaimCard status="source attributed · selected" text="Adaptive noise cancelling" delay={27} active />
            <ClaimCard status="requires approval · excluded" text="Up to 40 hours of battery life" delay={39} />
            <ClaimCard status="blocked · excluded" text="Best noise cancelling in the world" delay={51} />
          </div>
        </div>
      </div>
    </Scene>
  );
};

const SpecScene = () => {
  const frame = useCurrentFrame();
  const sceneProgress = clamp((frame - 32) / 120);
  const scenes = [
    ["01", "CHAOS", "0.0–1.4"],
    ["02", "CONTROL", "1.4–4.4"],
    ["03", "FEATURE", "4.4–7.6"],
    ["04", "IDENTITY", "7.6–10.0"],
    ["05", "END CARD", "10.0–12.0"],
  ];
  return (
    <Scene duration={210}>
      <div style={lift(frame, 4)}><Eyebrow step="03">CreativeSpec</Eyebrow></div>
      <div style={{display: "grid", gridTemplateColumns: ".9fr 1.1fr", gap: 64, marginTop: 36}}>
        <div>
          <div style={{...lift(frame, 10), fontFamily: condensedFont, fontSize: 72, fontWeight: 600, lineHeight: 0.92, textTransform: "uppercase", color: color.paper}}>
            TASTE BECOMES<br /><span style={{color: color.blueBright}}>A CONTRACT.</span>
          </div>
          <p style={{...lift(frame, 22), margin: "34px 0 0", maxWidth: 690, fontFamily: sansFont, fontSize: 24, lineHeight: 1.45, color: color.muted}}>
            One typed spec binds audience, angle, claim, timing, asset role and delivery format before a frame is rendered.
          </p>
          <div style={{...lift(frame, 36), display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginTop: 34}}>
            {[["platform", "Instagram Reels"], ["format", "9:16 · 30 fps"], ["runtime", "12 seconds"], ["promise", "adaptive-anc"]].map(([key, value]) => (
              <div key={key} style={{...baseCard, padding: "17px 19px", borderRadius: 14}}>
                <div style={{fontFamily: sansFont, fontSize: 12, letterSpacing: ".13em", color: color.quiet, textTransform: "uppercase"}}>{key}</div>
                <div style={{marginTop: 5, fontFamily: sansFont, fontSize: 20, color: color.paper}}>{value}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{...lift(frame, 18), ...baseCard, borderRadius: 24, padding: "30px 32px", minHeight: 570}}>
          <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
            <div style={{fontFamily: sansFont, fontWeight: 700, fontSize: 16, letterSpacing: ".13em", color: color.blueBright}}>SCENE GRAPH · 5 NODES</div>
            <StatusPill>schema v1.0</StatusPill>
          </div>
          <div style={{position: "relative", marginTop: 26, display: "grid", gap: 13}}>
            <div style={{position: "absolute", left: 25, top: 25, bottom: 25, width: 2, background: color.line}}>
              <div style={{width: "100%", height: `${sceneProgress * 100}%`, background: color.blueBright, boxShadow: `0 0 14px ${color.blue}`}} />
            </div>
            {scenes.map(([id, label, time], index) => {
              const visible = enter(frame, 25 + index * 10, 14);
              return (
                <div key={id} style={{display: "grid", gridTemplateColumns: "52px 1fr auto", alignItems: "center", gap: 17, padding: "14px 17px", borderRadius: 14, border: `1px solid ${color.line}`, background: "rgba(5,12,31,.66)", opacity: visible, transform: `translateX(${(1 - visible) * 24}px)`}}>
                  <div style={{zIndex: 1, display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: 99, background: color.panelStrong, border: `1px solid ${color.blueBright}66`, fontFamily: sansFont, fontSize: 13, color: color.paper}}>{id}</div>
                  <div style={{fontFamily: condensedFont, fontWeight: 600, fontSize: 25, letterSpacing: ".05em", color: color.paper}}>{label}</div>
                  <div style={{fontFamily: '"IBM Plex Mono", monospace', fontSize: 16, color: color.quiet}}>{time}s</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Scene>
  );
};

const RenderScene = () => {
  const frame = useCurrentFrame();
  const images = [masterPath, controlPath, packshotPath];
  return (
    <Scene duration={210}>
      <div style={lift(frame, 4)}><Eyebrow step="04">deterministic render</Eyebrow></div>
      <div style={{...lift(frame, 10), marginTop: 30, fontFamily: condensedFont, fontSize: 73, fontWeight: 600, lineHeight: 0.94, textTransform: "uppercase", color: color.paper}}>
        THE SPEC BINDS<br /><span style={{color: color.blueBright}}>EVERY SCENE.</span>
      </div>
      <div style={{display: "grid", gridTemplateColumns: "1.15fr .85fr", gap: 50, marginTop: 39}}>
        <div style={{...lift(frame, 22), display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14}}>
          {images.map((src, index) => {
            const reveal = enter(frame, 28 + index * 11, 18);
            return (
              <div key={src} style={{...baseCard, position: "relative", height: 424, overflow: "hidden", borderRadius: 22, opacity: reveal, transform: `translateY(${(1 - reveal) * 32}px)`}}>
                <Img src={staticFile(src)} style={{width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.08 - reveal * 0.05})`}} />
                <div style={{position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(1,5,14,.92), transparent 58%)"}} />
                <div style={{position: "absolute", left: 20, bottom: 18, fontFamily: sansFont, fontSize: 15, fontWeight: 700, letterSpacing: ".1em", color: color.paper}}>
                  {index === 2 ? "CLEAN PRODUCT" : "HUMAN CONTEXT"}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{...lift(frame, 43), ...baseCard, borderRadius: 22, padding: "30px 31px"}}>
          <div style={{fontFamily: sansFont, fontWeight: 700, fontSize: 15, letterSpacing: ".14em", color: color.blueBright}}>RENDER CONTRACT</div>
          {[
            ["asset IDs", "resolved"],
            ["scene timing", "locked"],
            ["claim binding", "exact"],
            ["safe area", "applied"],
            ["audio bed", "present"],
          ].map(([label, value], index) => (
            <div key={label} style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", borderBottom: `1px solid ${color.line}`, fontFamily: sansFont, fontSize: 20, opacity: enter(frame, 50 + index * 8, 12)}}>
              <span style={{color: color.muted}}>{label}</span>
              <span style={{color: color.green, fontWeight: 700}}>✓ {value}</span>
            </div>
          ))}
          <div style={{marginTop: 23}}><StatusPill tone="coral">Remotion → FFmpeg</StatusPill></div>
        </div>
      </div>
    </Scene>
  );
};

const qaChecks = [
  ["Dimensions", "1080×1920"],
  ["Video codec", "h264"],
  ["H.264 profile", "High"],
  ["Pixel format", "yuv420p"],
  ["Frame rate", "30"],
  ["Runtime", "12.053s"],
  ["Audio stream", "present"],
  ["Audio codec", "aac"],
  ["Sample rate", "48000 Hz"],
  ["Audio channels", "stereo"],
  ["Loudness", "−17.3 LUFS"],
  ["True peak", "−3.6 dBFS"],
  ["Encoded file", "7,466,178 B"],
] as const;

const QaScene = () => {
  const frame = useCurrentFrame();
  const passedCount = Math.max(0, Math.min(13, Math.floor((frame - 34) / 10) + 1));
  return (
    <Scene duration={240}>
      <div style={{display: "grid", gridTemplateColumns: "520px 1fr", gap: 70, height: "100%"}}>
        <div style={{paddingTop: 20}}>
          <div style={lift(frame, 4)}><Eyebrow step="05">quality gate</Eyebrow></div>
          <div style={{...lift(frame, 10), marginTop: 30, fontFamily: condensedFont, fontSize: 76, fontWeight: 600, lineHeight: 0.92, textTransform: "uppercase", color: color.paper}}>
            <span style={{color: color.green}}>{passedCount}</span>/13
            <br />BLOCKING CHECKS
          </div>
          <p style={{...lift(frame, 22), margin: "31px 0 0", fontFamily: sansFont, fontSize: 23, lineHeight: 1.45, color: color.muted}}>
            The encoded file must pass the delivery contract before a QA receipt can say <span style={{color: color.paper}}>passed: true</span>.
          </p>
          <div style={{...lift(frame, 31), marginTop: 35, height: 8, overflow: "hidden", borderRadius: 99, background: "rgba(104,224,184,.12)"}}>
            <div style={{height: "100%", width: `${(passedCount / 13) * 100}%`, background: color.green, boxShadow: `0 0 20px ${color.green}`}} />
          </div>
          <div style={{...lift(frame, 48), marginTop: 28}}>
            {passedCount === qaChecks.length ? (
              <StatusPill tone="green">technical QA passed</StatusPill>
            ) : (
              <StatusPill>quality gate · {passedCount}/13</StatusPill>
            )}
          </div>
        </div>
        <div style={{...baseCard, alignSelf: "center", borderRadius: 24, padding: "25px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 32}}>
          {qaChecks.map(([label, value], index) => {
            const visible = enter(frame, 28 + index * 8, 12);
            return (
              <div key={label} style={{display: "grid", gridTemplateColumns: "25px 1fr auto", alignItems: "center", gap: 12, minHeight: 61, borderBottom: `1px solid ${color.line}`, opacity: visible, transform: `translateX(${(1 - visible) * 18}px)`, fontFamily: sansFont}}>
                <span style={{display: "grid", placeItems: "center", width: 22, height: 22, borderRadius: 99, background: `${color.green}18`, color: color.green, fontWeight: 800, fontSize: 14}}>✓</span>
                <span style={{fontSize: 18, color: color.muted}}>{label}</span>
                <span style={{fontFamily: '"IBM Plex Mono", monospace', fontSize: 15, color: color.paper}}>{value}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Scene>
  );
};

const ReceiptScene = () => {
  const frame = useCurrentFrame();
  const receipts = [
    ["EVIDENCE", "3375c3edab7b"],
    ["CREATIVE SPEC", "62f20cf47503"],
    ["RENDER", "38aec32a1f6c"],
    ["RENDER RECEIPT", "17dd8ade08be"],
  ];
  return (
    <Scene duration={210}>
      <div style={lift(frame, 4)}><Eyebrow step="06">hash-linked receipts</Eyebrow></div>
      <div style={{...lift(frame, 10), marginTop: 30, fontFamily: condensedFont, fontSize: 73, fontWeight: 600, lineHeight: 0.94, textTransform: "uppercase", color: color.paper}}>
        THE PROOF TRAVELS<br /><span style={{color: color.blueBright}}>WITH THE PIXELS.</span>
      </div>
      <div style={{display: "grid", gridTemplateColumns: "1fr 340px", alignItems: "center", gap: 56, marginTop: 44}}>
        <div style={{position: "relative", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 17}}>
          <div style={{position: "absolute", left: 85, right: 85, top: 53, height: 2, background: color.line}} />
          {receipts.map(([label, hash], index) => {
            const visible = enter(frame, 25 + index * 14, 16);
            return (
              <div key={label} style={{...baseCard, position: "relative", minHeight: 205, borderRadius: 20, padding: "24px 22px", opacity: visible, transform: `translateY(${(1 - visible) * 32}px)`}}>
                <div style={{position: "relative", zIndex: 1, display: "grid", placeItems: "center", width: 58, height: 58, borderRadius: 18, background: index === 3 ? `${color.green}1c` : color.panelStrong, border: `1px solid ${index === 3 ? color.green : color.blueBright}66`, fontFamily: condensedFont, fontSize: 27, color: index === 3 ? color.green : color.paper}}>{index === 3 ? "✓" : `0${index + 1}`}</div>
                <div style={{marginTop: 23, fontFamily: sansFont, fontSize: 14, fontWeight: 700, letterSpacing: ".12em", color: color.muted}}>{label}</div>
                <div style={{marginTop: 9, fontFamily: '"IBM Plex Mono", monospace', fontSize: 16, color: color.blueBright}}>{hash}…</div>
              </div>
            );
          })}
        </div>
        <div style={{...lift(frame, 72), ...baseCard, display: "grid", placeItems: "center", height: 260, borderRadius: 26, textAlign: "center", borderColor: `${color.green}55`}}>
          <div>
            <div style={{fontFamily: condensedFont, fontSize: 82, fontWeight: 600, lineHeight: 1, color: color.green}}>PASS</div>
            <div style={{marginTop: 12, fontFamily: sansFont, fontSize: 15, letterSpacing: ".14em", color: color.muted}}>MACHINE-READABLE JSON</div>
          </div>
        </div>
      </div>
    </Scene>
  );
};

const BoundaryScene = () => {
  const frame = useCurrentFrame();
  return (
    <Scene duration={180}>
      <div style={{...lift(frame, 4), marginTop: 34}}><StatusPill tone="coral">honest boundary</StatusPill></div>
      <div style={{...lift(frame, 12), marginTop: 34, maxWidth: 1500, fontFamily: condensedFont, fontSize: 80, fontWeight: 600, lineHeight: 0.94, textTransform: "uppercase", color: color.paper}}>
        THIS DEMO RUN USES A<br /><span style={{color: color.coral}}>COMMITTED FIXTURE STRATEGY.</span>
      </div>
      <div style={{...lift(frame, 28), ...baseCard, display: "grid", gridTemplateColumns: "1.3fr .7fr", alignItems: "center", gap: 42, marginTop: 45, padding: "31px 36px", borderRadius: 22, borderLeft: `4px solid ${color.coral}`}}>
        <div style={{fontFamily: sansFont, fontSize: 25, lineHeight: 1.45, color: color.muted}}>
          Technical QA verifies delivery readiness. It does <span style={{color: color.paper}}>not</span> prove product identity, legality, platform compliance or conversion lift.
        </div>
        <div style={{fontFamily: condensedFont, fontSize: 38, fontWeight: 600, lineHeight: 1.05, textTransform: "uppercase", color: color.paper}}>
          HUMAN REVIEW<br /><span style={{color: color.coral}}>IS STILL REQUIRED.</span>
        </div>
      </div>
      <div style={{...lift(frame, 45), display: "flex", gap: 13, marginTop: 28}}>
        <StatusPill tone="coral">fixture</StatusPill>
        <StatusPill tone="coral">review pending</StatusPill>
        <StatusPill tone="green">technical QA passed</StatusPill>
      </div>
    </Scene>
  );
};

const CtaScene = () => {
  const frame = useCurrentFrame();
  const ring = spring({frame: frame - 12, fps: DEVPOST_DEMO_FPS, config: {damping: 19, stiffness: 82}});
  return (
    <Scene duration={180}>
      <div style={{height: "100%", display: "grid", placeItems: "center", textAlign: "center"}}>
        <div>
          <div style={{position: "relative", display: "inline-grid", placeItems: "center", width: 92, height: 92, borderRadius: 27, background: `linear-gradient(145deg, ${color.blue}, #1e3c91)`, boxShadow: `0 0 ${80 * ring}px rgba(109,143,255,.52)`, transform: `scale(${0.75 + ring * 0.25}) rotate(${(1 - ring) * -8}deg)`}}>
            <span style={{width: 28, height: 28, border: "5px solid white", borderTopColor: color.coral, borderRadius: 8, transform: "rotate(45deg)"}} />
          </div>
          <div style={{...lift(frame, 13), marginTop: 23, fontFamily: condensedFont, fontSize: 106, fontWeight: 600, letterSpacing: "-.02em", lineHeight: .92, color: color.paper}}>KreoFlow</div>
          <div style={{...lift(frame, 24), marginTop: 23, fontFamily: sansFont, fontSize: 28, fontWeight: 700, letterSpacing: ".13em", color: color.blueBright}}>EVIDENCE <span style={{color: color.coral}}>→</span> VIDEO <span style={{color: color.coral}}>→</span> RECEIPT</div>
          <div style={{...lift(frame, 38), marginTop: 39, fontFamily: sansFont, fontSize: 24, color: color.muted}}>Open the live proof. Inspect every artifact.</div>
          <div style={{...lift(frame, 48), display: "inline-flex", alignItems: "center", gap: 16, marginTop: 24, padding: "17px 25px", borderRadius: 99, border: `1px solid ${color.blueBright}66`, background: "rgba(17,36,82,.68)", fontFamily: '"IBM Plex Mono", monospace', fontSize: 21, color: color.paper, boxShadow: "0 18px 60px rgba(0,0,0,.35)"}}>
            <span style={{width: 9, height: 9, borderRadius: 99, background: color.green, boxShadow: `0 0 18px ${color.green}`}} />
            maks1son.github.io/kreoflow/build-week
          </div>
        </div>
      </div>
    </Scene>
  );
};

export const DevpostDemo = () => (
  <AbsoluteFill style={{fontFamily: sansFont, color: color.paper}}>
    <Backdrop />
    <Audio src={staticFile(scorePath)} loop volume={0.34} />
    <Sequence from={0} durationInFrames={150}><HookScene /></Sequence>
    <Sequence from={150} durationInFrames={390}><ProofScene /></Sequence>
    <Sequence from={540} durationInFrames={210}><EvidenceScene /></Sequence>
    <Sequence from={750} durationInFrames={210}><SpecScene /></Sequence>
    <Sequence from={960} durationInFrames={210}><RenderScene /></Sequence>
    <Sequence from={1170} durationInFrames={240}><QaScene /></Sequence>
    <Sequence from={1410} durationInFrames={210}><ReceiptScene /></Sequence>
    <Sequence from={1620} durationInFrames={180}><BoundaryScene /></Sequence>
    <Sequence from={1800} durationInFrames={180}><CtaScene /></Sequence>
  </AbsoluteFill>
);
