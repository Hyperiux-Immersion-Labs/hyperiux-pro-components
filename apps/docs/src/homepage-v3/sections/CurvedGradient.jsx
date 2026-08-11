"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import SplitText from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

import CurvedGradientShader from "@/homepage-v3/components/CurvedGradientShader";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

export default function CurvedGradient() {
  const wrapperRef = useRef(null);
  const sectionRef = useRef(null);
  const headingRef = useRef(null);

  useGSAP(
    () => {
      const split = SplitText.create(headingRef.current, {
        type: "lines",
        linesClass: "split-line",
        // mask: "lines",
      });

      // Phase 1: lines reveal in from below
      gsap.fromTo(
        split.lines,
        { yPercent: 50, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          stagger: 0.25,
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "18% 50%",
            end: "38% 50%",
            scrub: true,
          },
        },
      );

      // Phase 2: lines drift upward and fade out, line by line
      gsap.fromTo(
        split.lines,
        { yPercent: 0, opacity: 1 },
        {
          yPercent: -50,
          opacity: 0,
          duration: 1,
          ease: "power1.in",
          stagger: 0.25,
          immediateRender: false,
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "38% 50%",
            end: "58% 50%",
            scrub: true,
          },
        },
      );
    },
    { scope: wrapperRef },
  );

  return (
    <div ref={wrapperRef} className="relative z-200 h-[150vh]">
      <section
        ref={sectionRef}
        id="curved-gradient"
        className="sticky top-0 h-screen w-full flex items-center justify-center"
      >
        <CurvedGradientShader
          overscan={1.5}
          edgeFade={false}
          dither={true}
          pixelSize={5.0}
          colorNum={8.0}
        />
        <h2
          ref={headingRef}
          id="curved-gradient-heading"
          className="t64 relative z-10 mx-auto max-w-[51.5vw] text-center text-[3.25vw] text-white max-md:max-w-[90%] max-md:text-[5vw]"
        >
          Most websites are not broken. They are forgettable. They use the same sections, the same rhythm, the same static patterns, and the same safe animations everyone else is using.
        </h2>
      </section>
    </div>
  );
}

