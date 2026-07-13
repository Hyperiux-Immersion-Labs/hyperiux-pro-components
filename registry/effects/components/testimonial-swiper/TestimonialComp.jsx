'use client'
import { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import NavigationButtons from "./NavigationButtons";

gsap.registerPlugin(SplitText);

export default function TestimonialComp({ testimonials = [], bgColor = "#ffffff" }) {
    const [current, setCurrent] = useState(0);
    const [displayItem, setDisplayItem] = useState(testimonials[0] ?? null);
    const [isAnimating, setIsAnimating] = useState(false);

    const quoteRef = useRef(null);
    const quoteMarkRef = useRef(null);
    const nameRef = useRef(null);
    const titleRef = useRef(null);
    const mobileNameRef = useRef(null);
    const mobileTitleRef = useRef(null);
    const desktopImageRef = useRef(null);
    const mobileImageRef = useRef(null);
    const imageRef = useRef(null);
    const splitRef = useRef(null);
    const prevCurrentRef = useRef(null);
    const pendingDirectionRef = useRef("next");
    const isAnimatingRef = useRef(false);

    const total = testimonials.length;
    const pad = (n) => String(n).padStart(2, "0");

    const animateIn = useCallback((direction) => {
        const yFrom = direction === "next" ? 110 : -110;

        if (splitRef.current) {
            splitRef.current.revert();
            splitRef.current = null;
        }
        gsap.set(quoteRef.current, { autoAlpha: 1 });

        splitRef.current = new SplitText(quoteRef.current, {
            type: "lines",
            linesClass: "split-line",
        });

        const lines = splitRef.current.lines;

        lines.forEach((line) => {
            const wrapper = document.createElement("div");
            wrapper.style.overflow = "hidden";
            wrapper.style.display = "block";
            line.parentNode.insertBefore(wrapper, line);
            wrapper.appendChild(line);
        });

        gsap.set(lines, { yPercent: yFrom });
        gsap.set([
            desktopImageRef.current,
            mobileImageRef.current,
            nameRef.current,
            titleRef.current,
            mobileNameRef.current,
            mobileTitleRef.current,
            quoteMarkRef.current,
        ], {
            autoAlpha: 0,
        });

        const tl = gsap.timeline({
            onComplete: () => {
                setIsAnimating(false);
                isAnimatingRef.current = false;
            },
        });

        tl.to(lines, {
            yPercent: 0,
            duration: 0.85,
            ease: "power2.out",
            stagger: {
                each: 0.15,
                from: direction === "next" ? "start" : "end",
            },
        }).to(
            [
                desktopImageRef.current,
                mobileImageRef.current,
                nameRef.current,
                titleRef.current,
                mobileNameRef.current,
                mobileTitleRef.current,
                quoteMarkRef.current,
            ],
            {
                autoAlpha: 1,
                y: 0,
                duration: 1,
                ease: "power2.out",
                stagger: 0.15,
            },
            "<0.5"
        );
    }, []);

    const fadeOutCurrent = useCallback(() => {
        return new Promise((resolve) => {
            const targets = [
                quoteRef.current,
                imageRef.current,
                nameRef.current,
                titleRef.current,
                mobileNameRef.current,
                mobileTitleRef.current,
                quoteMarkRef.current,
            ];
            gsap.killTweensOf(targets);
            gsap.to(targets, {
                autoAlpha: 0,
                duration: 0.2,
                ease: "power1.in",
                onComplete: resolve,
            });
        });
    }, []);

    const handlePrev = useCallback(async () => {
        if (isAnimatingRef.current || total === 0) return;
        isAnimatingRef.current = true;
        setIsAnimating(true);

        await fadeOutCurrent();

        const nextIndex = (current - 1 + total) % total;
        pendingDirectionRef.current = "prev";

        if (splitRef.current) {
            splitRef.current.revert();
            splitRef.current = null;
        }

        setDisplayItem(testimonials[nextIndex]);
        setCurrent(nextIndex);
    }, [total, current, testimonials, fadeOutCurrent]);

    const handleNext = useCallback(async () => {
        if (isAnimatingRef.current || total === 0) return;
        isAnimatingRef.current = true;
        setIsAnimating(true);

        await fadeOutCurrent();

        const nextIndex = (current + 1) % total;
        pendingDirectionRef.current = "next";

        if (splitRef.current) {
            splitRef.current.revert();
            splitRef.current = null;
        }

        setDisplayItem(testimonials[nextIndex]);
        setCurrent(nextIndex);
    }, [total, current, testimonials, fadeOutCurrent]);

    useEffect(() => {
        if (!quoteRef.current) return;
        animateIn("next");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (prevCurrentRef.current === null) {
            prevCurrentRef.current = current;
            return;
        }
        if (prevCurrentRef.current !== current) {
            prevCurrentRef.current = current;
            animateIn(pendingDirectionRef.current);
        }
    }, [current, animateIn]);

    if (!testimonials.length || !displayItem) return null;

    return (
        <section className="relative w-full min-h-screen max-md:min-h-screen bg-white flex flex-col justify-between max-md:justify-start overflow-hidden text-black py-5 max-xl:px-6 max-md:px-2"
            style={{ backgroundColor: bgColor }}
        >
            {/* Header */}
            <div className="flex items-start justify-between px-8 py-5 max-xl:px-6 max-xl:py-4 max-md:px-5 max-md:py-3">
                <div className="flex max-md:flex-row justify-between items-center max-md:items-center w-[30%] max-xl:w-full max-md:w-full max-md:justify-between">
                    <div className="flex items-center gap-2 text-[0.8vw] max-xl:text-[1.8vw] max-md:text-[4vw] font-semibold tracking-[0.12em] uppercase">
                        <span className="text-[9px] max-xl:text-[12px] max-md:text-[15px]">◆</span>
                        <span>Client Stories</span>
                    </div>
                    <span className="text-[13px] max-xl:text-[12px] max-xl:hidden max-md:pl-4 text-neutral-700 tabular-nums">
                        {pad(current + 1)}&nbsp;/&nbsp;{pad(total)}
                    </span>
                </div>

                <NavigationButtons
                    className="max-md:hidden"
                    onPrev={handlePrev}
                    onNext={handleNext}
                />
            </div>

            {/* Body */}
            <div className="flex-1 flex items-start gap-32 px-18 py-5 max-xl:flex-col max-xl:items-start max-xl:gap-10 max-xl:px-6 max-xl:py-10 max-md:px-5 max-md:py-4 max-md:gap-6">

                <div className="shrink-0 max-xl:hidden max-md:hidden">
                    <div ref={desktopImageRef} className="relative w-40 h-50">
                        <img
                            src={displayItem.image}
                            alt={displayItem.name}
                            
                            className="object-cover w-full h-full object-top grayscale"
                        />
                    </div>
                </div>

                {/* Quote area */}
                <div className="flex-1 flex flex-col relative">
                    <span
                        className="absolute -top-1.5 font-serif font-bold leading-none max-xl:top-[-3vw] text-[48px] max-xl:text-[5vw] max-md:text-[40px] max-md:relative max-md:top-0 max-md:left-0 max-md:mb-2"
                        style={{ left: 0 }}
                        ref={quoteMarkRef}
                    >
                        &quot;
                    </span>

                    <div className="flex flex-col pl-13 w-[95%] max-xl:pl-0 max-xl:w-full max-md:pl-0 max-md:w-full">
                        <blockquote
                            ref={quoteRef}
                            className="m-0 mb-10 p-0 text-[4vw] max-md:min-h-0 max-xl:min-h-[30vh] leading-[1.1] max-xl:mb-8 max-xl:w-full max-xl:max-w-full max-xl:text-[clamp(2.4rem,5vw,3.6rem)] max-xl:leading-[1.08] max-md:max-w-full max-md:text-[7.5vw] max-md:mb-4"
                        >
                            {displayItem.quote}
                        </blockquote>

                        
                        <div className="hidden max-xl:flex items-center gap-4 mt-6 max-xl:gap-5 max-md:mt-3 max-md:gap-6">
                            <div ref={mobileImageRef} className="relative max-xl:w-30 max-xl:h-36 max-md:w-22 max-md:h-26 shrink-0">
                                <img
                                    src={displayItem.image}
                                    alt={displayItem.name}
                                    
                                    className="object-cover w-full h-full object-top grayscale"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p ref={mobileNameRef} className="m-0 text-xl font-normal">
                                    {displayItem.name}
                                </p>
                                <p
                                    ref={mobileTitleRef}
                                    className="m-0 text-[11px] font-semibold tracking-[0.12em] uppercase text-[#888]"
                                >
                                    {displayItem.title}
                                </p>
                            </div>
                        </div>

                        {/* Desktop: name/title */}
                        <div className="flex flex-col gap-1 mt-2 max-xl:hidden max-md:hidden">
                            <p ref={nameRef} className="m-0 text-xl max-xl:text-lg font-normal">
                                {displayItem.name}
                            </p>
                            <p
                                ref={titleRef}
                                className="m-0 text-[11px] max-xl:text-[10px] font-semibold tracking-[0.12em] uppercase text-[#888]"
                            >
                                {displayItem.title}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
