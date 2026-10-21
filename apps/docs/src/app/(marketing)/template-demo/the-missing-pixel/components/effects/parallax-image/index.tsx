// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MediaReveal } from "../../Animations/gsapAnim";
import { prefersReducedMotion } from "../../Animations/reducedMotion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type ParallaxImageProps = {
  image: StaticImageData;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  travel?: number;
  scale?: number;
  start?: string;
  end?: string;
};

const ParallaxImage = ({
  image,
  alt,
  className = "",
  sizes = "(max-width: 768px) 90vw, 90vw",
  priority = false,
  travel = 7,
  scale = 1.2,
  start = "top bottom",
  end = "bottom top",
}: ParallaxImageProps) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const moveRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const move = moveRef.current;
      if (!move || prefersReducedMotion()) return;

      gsap.fromTo(
        move,
        { yPercent: travel, scale },
        {
          yPercent: -travel,
          scale,
          ease: "none",
          scrollTrigger: {
            trigger: wrapRef.current,
            start,
            end,
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    },
    { scope: wrapRef, dependencies: [travel, scale, start, end] },
  );

  return (
    <div ref={wrapRef} className={`relative w-full overflow-hidden bg-mpx-surface ${className}`.trim()}>
      <MediaReveal zoom={false} className="h-full w-full">
        <div ref={moveRef} className="h-full w-full will-change-transform">
          <Image
            src={image}
            alt={alt}
            sizes={sizes}
            priority={priority}
            className="h-full w-full object-cover"
          />
        </div>
      </MediaReveal>
    </div>
  );
};

export default ParallaxImage;
