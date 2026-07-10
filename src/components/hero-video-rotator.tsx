"use client";

import { useEffect, useRef, useState } from "react";

const clips = [
  {
    src: "/media/kf-hero-style-speaker.mp4",
    poster: "/media/kf-hero-style-speaker-poster.png",
  },
  {
    src: "/media/kf-hero-style-cubes.mp4",
    poster: "/media/kf-hero-style-cubes-poster.png",
  },
  {
    src: "/media/kf-hero-style-ink.mp4",
    poster: "/media/kf-hero-style-ink-poster.png",
  },
];

type HeroVideoRotatorProps = {
  mediaBase: string;
};

export function HeroVideoRotator({ mediaBase }: HeroVideoRotatorProps) {
  const [activeClip, setActiveClip] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (!video) {
        return;
      }

      video.playbackRate = 0.75;
      void video.play().catch(() => undefined);
    });
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveClip((current) => (current + 1) % clips.length);
    }, 9000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="kf-hero-video-stack" aria-hidden="true">
      {clips.map((clip, index) => (
        <video
          key={clip.src}
          ref={(element) => {
            videoRefs.current[index] = element;
          }}
          className={`kf-hero-video ${index === activeClip ? "is-active" : ""}`}
          src={`${mediaBase}${clip.src}`}
          poster={`${mediaBase}${clip.poster}`}
          autoPlay
          muted
          loop
          playsInline
          preload={index === 0 ? "auto" : "metadata"}
          onLoadedMetadata={(event) => {
            event.currentTarget.playbackRate = 0.75;
          }}
        />
      ))}
    </div>
  );
}
