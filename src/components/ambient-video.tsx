"use client";

import { useEffect, useRef, useState } from "react";

type AmbientVideoProps = {
  src: string;
  poster: string;
  className?: string;
};

export function AmbientVideo({ src, poster, className }: AmbientVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) setShouldLoad(true);
      },
      { rootMargin: "240px 0px", threshold: 0.05 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;

    if (isVisible) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [isVisible, shouldLoad]);

  return (
    <video
      ref={videoRef}
      className={className}
      src={shouldLoad ? src : undefined}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
    />
  );
}
