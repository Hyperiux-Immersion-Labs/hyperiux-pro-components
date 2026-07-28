"use client";

import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

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

function PixelateSvgFilter({ id, size, crossLayers }) {
  return (
    <svg aria-hidden="true" style={{ pointerEvents: "none", position: "absolute", height: 0, width: 0, overflow: "hidden" }}>
      <defs>
        <filter id={id} x="0" y="0" width="1" height="1">
          <feConvolveMatrix kernelMatrix="1 1 1 1 1 1 1 1 1" result="AVG" />
          <feFlood x="1" y="1" width="1" height="1" />
          <feComposite operator="arithmetic" k1="0" k2="1" k3="0" k4="0" width={size} height={size} />
          <feTile result="TILE" />
          <feComposite in="AVG" in2="TILE" operator="in" />
          <feMorphology operator="dilate" radius={size / 2} result="NORMAL" />

          {crossLayers && (
            <>
              <feConvolveMatrix kernelMatrix="1 1 1 1 1 1 1 1 1" result="AVG" />
              <feFlood x="1" y="1" width="1" height="1" />
              <feComposite in2="SourceGraphic" operator="arithmetic" k1="0" k2="1" k3="0" k4="0" width={size / 2} height={size} />
              <feTile result="TILE" />
              <feComposite in="AVG" in2="TILE" operator="in" />
              <feMorphology operator="dilate" radius={size / 2} result="FALLBACKX" />

              <feConvolveMatrix kernelMatrix="1 1 1 1 1 1 1 1 1" result="AVG" />
              <feFlood x="1" y="1" width="1" height="1" />
              <feComposite in2="SourceGraphic" operator="arithmetic" k1="0" k2="1" k3="0" k4="0" width={size} height={size / 2} />
              <feTile result="TILE" />
              <feComposite in="AVG" in2="TILE" operator="in" />
              <feMorphology operator="dilate" radius={size / 2} result="FALLBACKY" />

              <feMerge>
                <feMergeNode in="FALLBACKX" />
                <feMergeNode in="FALLBACKY" />
                <feMergeNode in="NORMAL" />
              </feMerge>
            </>
          )}

          {!crossLayers && <feMergeNode in="NORMAL" />}
        </filter>
      </defs>
    </svg>
  );
}

export default function SvgPixelReveal({
  src,
  alt = "Image",
  initialPixelSize = 22,
  finalPixelSize = 1,
  start = "top 50%",
  end = "bottom 35%",
  crossLayers = true,
  style = {},
}) {
  const containerRef = useRef(null);
  const filterId = useId().replace(/:/g, "");
  const [pixelSize, setPixelSize] = useState(initialPixelSize);
  const shouldApplyFilter = pixelSize > finalPixelSize + 0.01;
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const animatedState = { size: initialPixelSize };

    const tween = gsap.to(animatedState, {
      size: finalPixelSize,
      duration: 1.0,
      ease: "none",
      paused: true,
      onUpdate: () => setPixelSize(animatedState.size),
    });

    const trigger = ScrollTrigger.create({
      trigger: container,
      start,
      end,
      animation: tween,
      invalidateOnRefresh: true,
    });

    return () => { trigger.kill(); tween.kill(); };
  }, [end, finalPixelSize, initialPixelSize, start]);

  return (
    <div ref={containerRef} style={{ position: "relative", ...style }}>
      <PixelateSvgFilter id={filterId} size={pixelSize} crossLayers={crossLayers} />
      <div
        style={{
          position: "relative", height: "100%", width: "100%", overflow: "hidden",
          filter: shouldApplyFilter ? `url(#${filterId})` : undefined,
        }}
      >
        <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>

      {prefersReducedMotion && (
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
