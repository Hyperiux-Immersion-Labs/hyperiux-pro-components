// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../Animations/reducedMotion";

type AutoVideoProps = {
  src: string;
  poster: string;
  label?: string;
  className?: string;
  playing?: boolean;
};

const AutoVideo = ({
  src,
  poster,
  label,
  className = "",
  playing,
}: AutoVideoProps) => {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || playing !== undefined) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (video.preload === "none") {
            video.preload = "auto";
            video.load();
          }
          if (!prefersReducedMotion()) video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "15% 0px" },
    );
    observer.observe(video);

    return () => observer.disconnect();
  }, [playing]);

  useEffect(() => {
    const video = ref.current;
    if (!video || playing === undefined) return;

    if (playing && !prefersReducedMotion()) {
      if (video.preload === "none") {
        video.preload = "auto";
        video.load();
      }
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [playing]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`h-full w-full object-cover ${className}`.trim()}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
};

export default AutoVideo;
