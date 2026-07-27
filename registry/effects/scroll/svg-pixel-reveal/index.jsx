// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import PixelateSvgFilter from "./PixelatedSvgFilter";

gsap.registerPlugin(ScrollTrigger);

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return prefersReducedMotion;
}

export default function SVGPixelReveal({
  src,
  alt,
  className = "",
  imageClassName = "",
  initialPixelSize = 18,
  finalPixelSize = 1,
  start = "top 35%",
  end = "bottom 35%",
  crossLayers = true,
  priority = false,
}) {
  const containerRef = useRef(null);
  const filterId = useId().replace(/:/g, "");
  const [pixelSize, setPixelSize] = useState(initialPixelSize);
  const reducedMotion = usePrefersReducedMotion();
  const shouldApplyFilter = pixelSize > finalPixelSize + 0.01;

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const animatedState = { size: initialPixelSize };

    const tween = gsap.to(animatedState, {
      size: finalPixelSize,
      duration: 1.0,
      ease: "none",
      paused: true,
      onUpdate: () => {
        setPixelSize(animatedState.size);
      },
    });

    const trigger = ScrollTrigger.create({
      trigger: container,
      start,
      end,
      animation: tween,
      invalidateOnRefresh: true,
    });

    return () => {
      trigger.kill();
      tween.kill();
    };
  }, [end, finalPixelSize, initialPixelSize, start]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <PixelateSvgFilter
        id={filterId}
        size={pixelSize}
        crossLayers={crossLayers}
      />

      <div
        className="relative h-full w-full overflow-hidden"
        style={{ filter: shouldApplyFilter ? `url(#${filterId})` : undefined }}
      >
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          className={`h-full w-full object-cover ${imageClassName}`.trim()}
        />
      </div>

      {reducedMotion && (
        <div
          aria-live="polite"
          className="fixed bottom-6 right-6 z-60 w-fit max-w-[min(90vw,26rem)] rounded-md border border-black/10 bg-[#F8F8F3] p-6 text-center shadow-sm"
        >
          <h2 className="text-[1.15vw] max-sm:text-[3.5vw] max-md:text-[2vw] leading-none text-[#111111]">
            This effect can&apos;t be reduced.
          </h2>
          <p className="mx-auto mt-4 text-sm leading-6 text-black/65">
            Reduced motion is enabled, but this effect relies on a
            continuous scroll-driven transition from pixelated to
            sharp, and can&apos;t be simplified to a fade without
            losing the effect entirely.
          </p>
        </div>
      )}
    </div>
  );
}
