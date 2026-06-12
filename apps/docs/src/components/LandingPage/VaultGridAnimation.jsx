"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitText from "gsap/SplitText";
gsap.registerPlugin(ScrollTrigger, SplitText);

export default function VaultGridAnimation() {
    const moveTextRef = useRef(null);
    const headingRef = useRef(null);
    const sectionRef = useRef(null);

    useEffect(() => {
        if (!moveTextRef.current || !headingRef.current || !sectionRef.current) return;

        // Arrays with ids and individual xPercent values for more translate
        const topLayer = [
            { id: 'block-top-layer-1', xPercent: 300 },
            { id: 'block-top-layer-2', xPercent: 450 },
            { id: 'block-top-layer-3', xPercent: 600 }
        ];
        const bottomLayer = [
            { id: 'block-bottom-layer-1', xPercent: 300 },
            { id: 'block-bottom-layer-2', xPercent: 450 },
            { id: 'block-bottom-layer-3', xPercent: 600 }
        ];

        // Set initial positions for each box (more translate)
        gsap.set(moveTextRef.current, { xPercent: -200 });
        topLayer.forEach(layer =>
            gsap.set(`#${layer.id}`, { xPercent: layer.xPercent })
        );
        bottomLayer.forEach(layer =>
            gsap.set(`#${layer.id}`, { xPercent: layer.xPercent })
        );

        // GSAP context for proper cleanup
        const ctx = gsap.context(() => {
            // Master timeline controlled via ScrollTrigger
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: true,
                    markers: false,
                }
            });

            tl.to(moveTextRef.current, { xPercent: 0, duration: 2, ease: "power2.out" }, 0);

            // Animate each top box with staggered timing
            topLayer.forEach((layer, i) => {
                tl.to(
                    `#${layer.id}`,
                    {
                        xPercent: 0,
                        duration: 1.2,
                        ease: "power2.out"
                    },
                    0.1 + i * 0.13 // stagger for each child
                );
            });

            // Animate each bottom box with staggered timing
            bottomLayer.forEach((layer, i) => {
                tl.to(
                    `#${layer.id}`,
                    {
                        xPercent: 0,
                        duration: 1.2,
                        ease: "power2.out"
                    },
                    0.5 + i * 0.13 // start a little later after topLayer
                );
            });
            tl.to([headingRef.current, moveTextRef.current], {
                opacity: 0,
                duration: 1.2,
                ease: "power2.out"
            });
            tl.to('#heading-container', {
                height: '2.5vw',
                transformOrigin: 'center center',
                duration: 1.2,
                ease: "power2.out"
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="h-[500vh] relative w-full bg-background">
            <div className="h-screen flex-col self-padd origin-center flex items-center justify-center sticky top-0 w-full">
                <div className="w-full relative z-10 h-[40vh] gap-[1.5vw] flex items-center justify-center ">
                    <div
                        id="block-top-layer-1"
                        className="w-[37.5%] h-full rounded-md bg-red-500"
                    />
                    <div
                        id="block-top-layer-2"
                        className="w-[25%] h-full rounded-md bg-purple-500"
                    />
                    <div
                        id="block-top-layer-3"
                        className="w-[37.5%] h-full rounded-md bg-yellow-500"
                    />
                </div>

                <div id="heading-container" className="w-full relative z-0 h-[30vh] bg-red-500 flex items-center justify-center ">
                    <p ref={moveTextRef} className="text-primary text80">
                        move
                    </p>
                    <h2 ref={headingRef} className="text80 text-center">
                        , navigate, read, and explore.
                    </h2>
                </div>
                <div className="w-full h-[40vh] relative z-10 gap-[2vw] flex items-center justify-center ">
                    <div
                        id="block-bottom-layer-1"
                        className="w-[37.5%] h-full rounded-md bg-orange-500"
                    />
                    <div
                        id="block-bottom-layer-2"
                        className="w-[25%] h-full rounded-md bg-white"
                    />
                    <div
                        id="block-bottom-layer-3"
                        className="w-[37.5%] h-full rounded-md bg-blue-500"
                    />
                </div>
            </div>
        </section>
    );
}
