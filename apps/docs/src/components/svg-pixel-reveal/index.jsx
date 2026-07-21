"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import PixelateSvgFilter from "./PixelatedSvgFilter";
import { usePrefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

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
    const renderedPixelSize = reducedMotion ? finalPixelSize : pixelSize;
    const shouldApplyFilter = !reducedMotion && renderedPixelSize > finalPixelSize + 0.01;

    useEffect(() => {
        const container = containerRef.current;

        if (!container || reducedMotion) {
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
    }, [end, finalPixelSize, initialPixelSize, start, reducedMotion]);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <PixelateSvgFilter
                id={filterId}
                size={renderedPixelSize}
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
                    <h2 className="text-[clamp(1.25rem,3vw,2rem)] leading-none text-[#111111]">
                        The image is already in focus.
                    </h2>
                    <p className="mx-auto mt-4 text-sm leading-6 text-black/65">
                        Reduced motion is enabled, so the image appears sharp
                        immediately instead of resolving from pixels as you
                        scroll. The effect depends on a continuous
                        scroll-driven transition, and your system preference
                        asks us to keep that still.
                    </p>
                </div>
            )}
        </div>
    );
}
