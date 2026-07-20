import type {CSSProperties} from "react";

export const palette = {
  ink: "#05070a",
  paper: "#f4f7fb",
  electric: "#4f7cff",
  electricSoft: "#8eabff",
  signal: "#ff4b3e",
  muted: "rgba(244, 247, 251, 0.64)",
} as const;

export const safeArea = {
  top: 108,
  right: 88,
  bottom: 238,
  left: 88,
} as const;

export const condensedFont =
  '"Barlow Condensed", "Arial Narrow", "Helvetica Neue", Arial, sans-serif';

export const sansFont =
  '"Barlow", "Helvetica Neue", Helvetica, Arial, sans-serif';

export const fullBleed: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
};

export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export const easeOutQuart = (value: number) => 1 - (1 - clamp(value)) ** 4;

export const sceneOpacity = ({
  frame,
  startFrame,
  endFrame,
  transitionFrames,
  isFirst,
  isLast,
}: {
  frame: number;
  startFrame: number;
  endFrame: number;
  transitionFrames: number;
  isFirst: boolean;
  isLast: boolean;
}) => {
  if (frame < startFrame - transitionFrames || frame > endFrame + transitionFrames) {
    return 0;
  }

  const fadeIn = isFirst
    ? 1
    : clamp((frame - (startFrame - transitionFrames)) / (transitionFrames * 2));
  const fadeOut = isLast
    ? 1
    : clamp(((endFrame + transitionFrames) - frame) / (transitionFrames * 2));

  return Math.min(fadeIn, fadeOut);
};

export const trackingLabel: CSSProperties = {
  fontFamily: sansFont,
  fontSize: 44,
  fontWeight: 600,
  letterSpacing: "0.14em",
  lineHeight: 1,
  textTransform: "uppercase",
};
