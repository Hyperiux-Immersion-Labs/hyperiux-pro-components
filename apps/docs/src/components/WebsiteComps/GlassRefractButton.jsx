"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";

/**
 * A button whose surface refracts what sits behind it, the way a thick piece of
 * glass would. The refraction is an SVG displacement map driven by a radial
 * bitmap generated once on mount: neutral in the middle, bending harder toward
 * the rim, so the edges carry the bulge and the centre stays readable.
 *
 * Unlike a lens that follows the pointer, this one is fixed to the button and
 * only deepens on hover, so it never smears the text underneath it.
 *
 * @param {{
 *   text?: string,
 *   href?: string,
 *   className?: string,
 *   textClassName?: string,
 *   tint?: string,
 *   distortion?: number,
 *   children?: React.ReactNode,
 *   onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void,
 * }} props
 */
export default function GlassRefractButton({
  text = "",
  href = "#",
  className = "",
  textClassName = "",
  tint = "rgba(255,255,255,0.14)",
  distortion = 10,
  children,
  onClick,
  ...props
}) {
  const rawId = useId();
  const filterId = `glass-refract-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const [mapUrl, setMapUrl] = useState("");

  // Radial displacement bitmap, built once. R encodes horizontal push and G
  // vertical, both neutral (128) at the centre and ramping with a cubic falloff
  // so the distortion collects at the rim rather than washing over the label.
  useEffect(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const image = ctx.createImageData(size, size);
    const centre = size / 2;

    for (let py = 0; py < size; py++) {
      for (let px = 0; px < size; px++) {
        const dx = px - centre;
        const dy = py - centre;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const falloff = Math.min(dist / centre, 1) ** 3;
        const ux = dist > 0 ? dx / dist : 0;
        const uy = dist > 0 ? dy / dist : 0;
        const i = (py * size + px) * 4;

        image.data[i] = Math.round(255 * (0.5 - 0.5 * ux * falloff));
        image.data[i + 1] = Math.round(255 * (0.5 - 0.5 * uy * falloff));
        image.data[i + 2] = 128;
        image.data[i + 3] = 255;
      }
    }

    ctx.putImageData(image, 0, 0);
    const url = canvas.toDataURL();
    const raf = requestAnimationFrame(() => setMapUrl(url));

    return () => cancelAnimationFrame(raf);
  }, []);


  return (
    <Link
      href={href}
      onClick={onClick}
      {...props}
      className={`group relative isolate inline-flex h-[4.2vw] items-center justify-center overflow-hidden rounded-full px-[2.2vw] text-[1.05vw] font-medium tracking-tight text-white no-underline transition-transform duration-500 ease-[cubic-bezier(0.625,0.05,0,1)] motion-safe:hover:scale-[1.03] motion-reduce:transition-none max-[1025px]:h-[9vw] max-[1025px]:px-[5vw] max-[1025px]:text-[3vw] max-md:h-[15vw] max-md:px-[8vw] max-md:text-[4.2vw] ${className}`}
    >
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <defs>
          {mapUrl && (
            <filter
              id={filterId}
              x="0"
              y="0"
              width="100%"
              height="100%"
              colorInterpolationFilters="sRGB"
            >
              <feImage
                href={mapUrl}
                x="0"
                y="0"
                width="100%"
                height="100%"
                preserveAspectRatio="none"
                result="map"
              />
              {/* One displacement pass over all three channels at once. Splitting
                  them and recombining is what produces chromatic fringing, and at
                  button scale the channels land far enough apart that the gaps read
                  as hard coloured bands rather than as a glass edge. */}
              <feDisplacementMap
                in="SourceGraphic"
                in2="map"
                scale={distortion}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          )}
        </defs>
      </svg>

      {/* The refracting pane. `backdrop-filter` bends what is behind the button
          rather than the button's own pixels, so the label above stays sharp.
          The whole chain lives in one inline value - an inline `backdropFilter`
          replaces the property outright, so a Tailwind `backdrop-blur-*` class
          alongside it would simply be discarded. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-full"
        style={{
          backgroundColor: tint,
          backdropFilter: mapUrl
            ? `url(#${filterId}) blur(2px) saturate(1.4)`
            : "blur(2px) saturate(1.4)",
        }}
      />

      {/* Rim and inner highlight - the part that reads as a lit glass edge. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-full border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(255,255,255,0.12),0_0.4vw_1.4vw_rgba(0,0,0,0.18)]"
      />

      <span className={`relative z-10 leading-[1.2] ${textClassName}`}>{children ?? text}</span>
    </Link>
  );
}
