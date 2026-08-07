// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import PixelateSvgFilter from "./PixelatedSvgFilter";

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_SRC =
  "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-01.jpg";
const DEFAULT_ALT = "Image";

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

interface SVGPixelRevealProps {
  src?: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
  initialPixelSize?: number;
  finalPixelSize?: number;
  start?: string;
  end?: string;
  crossLayers?: boolean;
  priority?: boolean;
}

export default function SVGPixelReveal({
  src = DEFAULT_SRC,
  alt = DEFAULT_ALT,
  className = "h-[50vh] w-[50vw]",
  imageClassName = "",
  initialPixelSize = 18,
  finalPixelSize = 1,
  start = "top 35%",
  end = "bottom 35%",
  crossLayers = true,
  priority = false,
}: SVGPixelRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
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
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            zIndex: 60,
            width: "fit-content",
            maxWidth: "min(90vw, 26rem)",
            borderRadius: "0.375rem",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            background: "#F8F8F3",
            padding: "1.5rem",
            textAlign: "center",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          }}
        >
          <h2 style={{ fontSize: "1.15vw", lineHeight: 1, color: "#111111", margin: 0 }}>
            This effect can&apos;t be reduced.
          </h2>
          <p style={{ marginTop: "1rem", fontSize: "0.875rem", lineHeight: 1.5, color: "rgba(0, 0, 0, 0.65)" }}>
            Reduced motion is enabled, but this effect relies on a continuous
            scroll-driven transition from pixelated to sharp, and can&apos;t be
            simplified to a fade without losing the effect entirely.
          </p>
        </div>
      )}
    </div>
  );
}
