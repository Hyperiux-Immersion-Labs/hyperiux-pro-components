// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { usePrefersReducedMotion } from "@/lib/motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

/**
 * @typedef {Object} PixelateSvgFilterProps
 * @property {string} [id]
 * @property {number} [size]
 * @property {boolean} [crossLayers]
 */

/** @param {PixelateSvgFilterProps} props */
export function PixelateSvgFilter({
 id ="pixelate-filter",
 size: propSize = 16,
 crossLayers = false
}) {
 const size = Math.max(2, propSize);
 return (
 <svg
 aria-hidden="true"
 className="pointer-events-none absolute h-0 w-0 overflow-hidden"
 >
 <defs>
 <filter id={id} x="0" y="0" width="1" height="1">
 {/* Base pixelation */}
 <feConvolveMatrix
 kernelMatrix="1 1 1
 1 1 1
 1 1 1"
 result="AVG"
 />

 <feFlood x="1" y="1" width="1" height="1" />

 <feComposite
 operator="arithmetic"
 k1="0"
 k2="1"
 k3="0"
 k4="0"
 width={size}
 height={size}
 />

 <feTile result="TILE" />

 <feComposite
 in="AVG"
 in2="TILE"
 operator="in"
 />

 <feMorphology
 operator="dilate"
 radius={size / 2}
 result="NORMAL"
 />

 {crossLayers && (
 <>
 {/* Horizontal fallback */}
 <feConvolveMatrix
 kernelMatrix="1 1 1
 1 1 1
 1 1 1"
 result="AVG"
 />
 <feFlood x="1" y="1" width="1" height="1" />
 <feComposite
 in2="SourceGraphic"
 operator="arithmetic"
 k1="0"
 k2="1"
 k3="0"
 k4="0"
 width={size / 2}
 height={size}
 />
 <feTile result="TILE" />
 <feComposite in="AVG" in2="TILE" operator="in" />
 <feMorphology
 operator="dilate"
 radius={size / 2}
 result="FALLBACKX"
 />

 {/* Vertical fallback */}
 <feConvolveMatrix
 kernelMatrix="1 1 1
 1 1 1
 1 1 1"
 result="AVG"
 />
 <feFlood x="1" y="1" width="1" height="1" />
 <feComposite
 in2="SourceGraphic"
 operator="arithmetic"
 k1="0"
 k2="1"
 k3="0"
 k4="0"
 width={size}
 height={size / 2}
 />
 <feTile result="TILE" />
 <feComposite in="AVG" in2="TILE" operator="in" />
 <feMorphology
 operator="dilate"
 radius={size / 2}
 result="FALLBACKY"
 />

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

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_SRC =
    "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-01.jpg";
const DEFAULT_ALT = "Image";

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
    intensity?: number;
}

export default function SVGPixelReveal({
    src = DEFAULT_SRC,
    alt = DEFAULT_ALT,
    className = "h-[50vh] w-[50vw]",
    imageClassName = "",
    intensity = 22,
    crossLayers = true,
    priority = false,
}: SVGPixelRevealProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const filterId = useId().replace(/:/g, "");
    const initialPixelSize = Math.max(2, intensity);
    const finalPixelSize = 1;
    const start = "top 50%";
    const end = "bottom bottom";
    const [pixelSize, setPixelSize] = useState(initialPixelSize);
    const [prevInitialPixelSize, setPrevInitialPixelSize] = useState(initialPixelSize);
    const reducedMotion = usePrefersReducedMotion();
    const shouldApplyFilter = pixelSize > finalPixelSize + 0.01;

    // Reset the displayed pixelSize whenever the initialPixelSize prop
    // changes, without clobbering the value the GSAP tween below drives via
    // onUpdate. Pure derived state (no browser API), so it's adjusted
    // directly during render instead of via an effect.
    if (initialPixelSize !== prevInitialPixelSize) {
        setPrevInitialPixelSize(initialPixelSize);
        setPixelSize(initialPixelSize);
    }

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
            scrub: true,
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
                <Image
                    src={src}
                    alt={alt}
                    fill
                    priority={priority}
                    className={`object-cover ${imageClassName}`.trim()}
                />
            </div>

            {reducedMotion && (
                <div
                    aria-live="polite"
                    className="fixed bottom-6 right-6 z-60 w-fit max-w-[min(90vw,26rem)] rounded-md border border-black/10 bg-[#F8F8F3] p-6 text-center shadow-sm"
                >
                    <h2 className="text-[1.15vw] max-md:text-[3.5vw] max-[1025px]:text-[2vw] leading-none text-[#111111]">
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
