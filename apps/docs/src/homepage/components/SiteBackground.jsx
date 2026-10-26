"use client";

import { useEffect, useRef } from "react";
import { createFluidField } from "../lib/fluid-field";
import { MEDIA } from "@/lib/breakpoints";

// Cheaper solver on narrow or low-core devices; desktop keeps the defaults
// (16px cells, 14 pressure iterations).
const LOW_QUALITY_FLUID = { cell: 22, iterations: 8 };
const LOW_CORE_COUNT = 4;

// The live fluid, so page effects can splash / burst / swirl it (e.g. the Community crowd)
let siteFluid = null;
export const getSiteFluid = () => siteFluid;

function isLowQualityDevice() {
    return (
        window.matchMedia(MEDIA.mobile).matches ||
        (navigator.hardwareConcurrency || 8) <= LOW_CORE_COUNT
    );
}

// Dotted grid + fluid ink behind every page. Fixed to the viewport at
// z-index -1: that paints above the <html> background and below all in-flow
// content, so no page needs a z-index to sit on top. Dark sections are
// transparent and show it; light or opaque sections simply cover it.
export default function SiteBackground() {
    const rootRef = useRef(null);
    const dotsRef = useRef(null);
    const inkRef = useRef(null);

    useEffect(() => {
        // It mounts after load (SiteInteractions), so ease the grid in rather than pop it
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            rootRef.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, easing: "ease-out" });
        }

        const fluid = createFluidField({
            ink: inkRef.current,
            dots: dotsRef.current,
            ...(isLowQualityDevice() ? LOW_QUALITY_FLUID : null),
        }).start();
        siteFluid = fluid;
        return () => { if (siteFluid === fluid) siteFluid = null; fluid.destroy(); };
    }, []);

    return (
        // h-lvh, not inset-0: a fixed layer pinned to the bottom edge grows and shrinks
        // with a phone's address bar, and every size change reallocates the dot field
        // (a visible jump mid-scroll). The bars-hidden height never changes.
        <div ref={rootRef} className="pointer-events-none fixed inset-x-0 top-0 h-lvh -z-1" aria-hidden="true">
            <canvas ref={dotsRef} className="absolute inset-0 block size-full" />
            {/* The fluid is simulated at ~16px cells; the blur makes it silky */}
            <canvas
                ref={inkRef}
                className="absolute inset-0 block size-full opacity-95 mix-blend-screen blur-[14px] saturate-[1.2]"
            />
        </div>
    );
}
