// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../Animations/reducedMotion";

type AutoVideoProps = {
  src: string;
  poster: string;
  label: string;
};

const AutoVideo = ({ src, poster, label }: AutoVideoProps) => {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || prefersReducedMotion()) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (video.preload === "none") {
          video.preload = "auto";
          video.load();
        }
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      aria-label={label}
      className="h-full w-full object-cover"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
};

export default AutoVideo;
