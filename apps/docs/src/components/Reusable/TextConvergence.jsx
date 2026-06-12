"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, SplitText);

export default function TextConvergence({
    text,
    containerAnimation,
    className = "",
    start = "left 110%",
    end = "left 80%",
}) {
    const textRef = useRef(null);

    useEffect(() => {
        if (!containerAnimation || !textRef.current) return;

        let split;
        let ctx;

        const init = async () => {
            if (typeof document !== "undefined" && document.fonts) {
                await document.fonts.ready;
            }

            const textEl = textRef.current;
            if (!textEl) return;

            split = SplitText.create(textEl, {
                type: "chars",
            });

            ctx = gsap.context(() => {
                if (split.chars && Array.isArray(split.chars)) {
                    split.chars.forEach((char) => {
                        gsap.fromTo(
                            char,
                            {
                                yPercent: gsap.utils.random(-200, 200),
                                rotation: gsap.utils.random(-20, 20),
                            },
                            {
                                yPercent: 0,
                                rotation: 0,
                                ease: "linear",
                                scrollTrigger: {
                                    trigger: char,
                                    containerAnimation: containerAnimation,
                                    start: start,
                                    end: end,
                                    scrub: true,
                                    markers: false,
                                },
                            }
                        );
                    });
                }
            }, textEl);
        };

        init();

        return () => {
            split?.revert?.();
            ctx?.revert?.();
        };
    }, [containerAnimation, text, start, end]);

    return (
        <h2 ref={textRef} className={className}>
            {text}
        </h2>
    );
}
