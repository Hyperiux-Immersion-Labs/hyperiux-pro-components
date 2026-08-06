"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { usePrefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_ITEMS = [
  { id: 1, image: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-01.jpg", title: "Card 1" },
  { id: 2, image: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-02.jpg", title: "Card 2" },
  { id: 3, image: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-03.jpg", title: "Card 3" },
  { id: 4, image: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-04.jpg", title: "Card 4" },
  { id: 5, image: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-05.jpg", title: "Card 5" },
  { id: 6, image: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-06.jpg", title: "Card 6" },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

interface HelixSliderItem {
  id: string | number;
  image?: string;
  title?: string;
}

interface HelixSliderCompProps {
  items?: HelixSliderItem[];
  cardWidth?: number;
  cardHeight?: number;
  verticalSpacing?: number;
  snakeAmplitude?: number;
  snakeTightness?: number;
  depthAmplitude?: number;
  scrollDistance?: number;
  perspective?: number;
  scaleMin?: number;
  yRotateStrength?: number;
  maxYRotation?: number;
  className?: string;
}

export default function HelixSliderComp({
    items = DEFAULT_ITEMS,
    cardWidth = 220,
    cardHeight = 300,
    verticalSpacing = 110,
    snakeAmplitude = 300,
    snakeTightness = 0.95,
    depthAmplitude = 180,
    scrollDistance = 340,
    perspective = 1800,
    scaleMin = 0.74,
    yRotateStrength = 1,
    maxYRotation = 75,
    className = "",
}: HelixSliderCompProps) {
    const sectionRef = useRef<HTMLElement | null>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const reducedMotion = usePrefersReducedMotion();

    const repeatedItems = useMemo(() => {
        return [...items, ...items, ...items];
    }, [items]);

    const setCardRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
        cardRefs.current[index] = el;
    }, []);

    useLayoutEffect(() => {
        if (!sectionRef.current || !cardRefs.current.length) return;

        const ctx = gsap.context(() => {
            const cards = cardRefs.current;
            const baseCount = items.length;
            const totalTravel = baseCount * verticalSpacing;

            const render = (travel: number) => {
                const isMobile = window.innerWidth < 640;

                const currentSnakeAmplitude = isMobile
                    ? snakeAmplitude * 0.85
                    : snakeAmplitude;

                const currentDepthAmplitude = isMobile
                    ? depthAmplitude * 0.55
                    : depthAmplitude;

                cards.forEach((card, i) => {
                    const localIndex = i - baseCount;
                    const flowY = localIndex * verticalSpacing - travel;

                    const phase = (flowY / verticalSpacing) * snakeTightness;

                    const x = Math.sin(phase) * currentSnakeAmplitude;
                    const z = Math.cos(phase) * currentDepthAmplitude;
                    const y = flowY;

                    const scale = clamp(
                        gsap.utils.mapRange(
                            -currentDepthAmplitude,
                            currentDepthAmplitude,
                            scaleMin,
                            1,
                            z
                        ),
                        scaleMin,
                        1
                    );

                    const dx_dPhase = Math.cos(phase) * currentSnakeAmplitude;

                    const rotationY = clamp(
                        (-dx_dPhase / Math.max(currentSnakeAmplitude, 1)) *
                            maxYRotation *
                            yRotateStrength,
                        -maxYRotation,
                        maxYRotation
                    );

                    gsap.set(card, {
                        x,
                        y,
                        z,
                        scale,
                        opacity: 1,
                        rotationY,
                        transformPerspective: perspective,
                        transformOrigin: "center center",
                        zIndex: Math.round(1000 + z),
                    });
                });
            };

            render(0);

            const st = ScrollTrigger.create({
                trigger: sectionRef.current,
                start: "top top",
                end: `+=${scrollDistance}%`,
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                onUpdate: (self) => {
                    render(self.progress * totalTravel);
                },
            });

            return () => {
                st.kill();
            };
        }, sectionRef);

        return () => ctx.revert();
    }, [
        items,
        verticalSpacing,
        snakeAmplitude,
        snakeTightness,
        depthAmplitude,
        scrollDistance,
        perspective,
        scaleMin,
        yRotateStrength,
        maxYRotation,
    ]);

    return (
        <section
            ref={sectionRef}
            className={`relative h-screen w-full overflow-hidden bg-[#020202] before:pointer-events-none before:absolute before:left-0 before:top-0 before:z-20 before:h-[14%] before:w-full before:bg-[linear-gradient(to_bottom,#020202_0%,rgba(2,2,2,0)_100%)] after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:z-20 after:h-[14%] after:w-full after:bg-[linear-gradient(to_top,#020202_0%,rgba(2,2,2,0)_100%)] max-[1025px]:[--card-height:245px] max-[1025px]:[--card-width:180px] max-md:[--card-height:190px] max-md:[--card-width:140px] ${className}`}
            style={{
                "--card-width": `${cardWidth}px`,
                "--card-height": `${cardHeight}px`,
                "--scene-perspective": `${perspective}px`,
            } as CSSProperties & Record<string, string | number>}
        >
            <div className="relative h-screen w-full overflow-hidden perspective-(--scene-perspective,1800px) perspective-origin-[center_center]">
                <div className="relative h-full w-full transform-3d">
                    {repeatedItems.map((item, index) => (
                        <div
                            key={`${item.id}-${index}`}
                            ref={setCardRef(index)}
                            className="absolute left-1/2 top-1/2 h-(--card-height,300px) w-(--card-width,220px) opacity-0 will-change-transform ml-[calc(var(--card-width,220px)/-2)] mt-[calc(var(--card-height,300px)/-2)] transform-3d"
                        >
                            <div className="relative h-full w-full transform-3d">
                                <div className="absolute inset-0 h-full w-full overflow-hidden bg-[#f2eee2] shadow-[0_18px_40px_rgba(0,0,0,0.22),0_4px_12px_rgba(0,0,0,0.16)] backface-hidden [-webkit-backface-visibility:hidden] transform-[rotateY(0deg)_translateZ(1px)]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={item.image}
                                        alt={item.title || `Card ${index + 1}`}
                                        className="object-cover h-full w-full absolute inset-0"
                                    />
                                </div>

                                <div className="absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden bg-[#111111] shadow-[0_18px_40px_rgba(0,0,0,0.22),0_4px_12px_rgba(0,0,0,0.16)] backface-hidden [-webkit-backface-visibility:hidden] transform-[rotateY(180deg)_translateZ(1px)]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={item.image}
                                        alt={`${item.title || `Card ${index + 1}`} back`}
                                        className="object-cover h-full w-full absolute inset-0"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
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
                        Reduced motion is enabled, but this effect relies on
                        continuous scroll-driven rotation and can&apos;t be
                        reduced to a simple fade without losing the effect
                        entirely.
                    </p>
                </div>
            )}
        </section>
    );
}
