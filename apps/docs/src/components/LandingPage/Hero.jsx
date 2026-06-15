'use client';

import React, { useEffect, useRef } from "react";
import RandomBlur from "../Reusable/RandomBlur";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

if (typeof window !== 'undefined') {
  gsap.registerPlugin(SplitText);
}

export default function Hero() {
  const pRef = useRef(null);

  useEffect(() => {
    const el = pRef.current;
    if (!el) return;

    const isLoaderActive = typeof document !== 'undefined' && document.body.classList.contains("loader-active");

    // Hide paragraph immediately on mount if loader is active to prevent flash
    if (isLoaderActive) {
      gsap.set(el, { opacity: 0 });
    }

    let split;
    let ctx;

    const runAnimation = () => {
      if (isLoaderActive) {
        gsap.set(el, { opacity: 1 });
      }

      // Split the description paragraph into lines
      split = SplitText.create(el, {
        type: "lines",
      });

      ctx = gsap.context(() => {
        gsap.fromTo(
          split.lines,
          {
            y: 24,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            delay: 0.4,
            duration: 0.95,
            ease: "power3.out",
            stagger: 0.08,
          }
        );
      }, el);
    };

    if (isLoaderActive) {
      const handleLoaderComplete = () => {
        runAnimation();
      };
      window.addEventListener("loaderComplete", handleLoaderComplete);
      return () => {
        window.removeEventListener("loaderComplete", handleLoaderComplete);
        if (ctx) ctx.revert();
        if (split) split.revert();
      };
    } else {
      runAnimation();
      return () => {
        if (ctx) ctx.revert();
        if (split) split.revert();
      };
    }
  }, []);

  return (
    <section className="relative z-20 pointer-events-none self-padd h-screen flex items-center w-full">
      <div className="space-y-[2vw] max-sm:space-y-[8vw] mt-[2vw] max-sm:mt-0  relative z-2">
        <p className="text24 hidden max-sm:block text-light-grey max-sm:text-center">  Hyperiux Vault</p>
        <div className="h-fit flex max-sm:flex-col max-sm:justify-center items-center w-full ">
          <h1 className="text140  max-sm:text-center max-sm:indent-[0vw]! relative w-[78vw] max-sm:w-full">
            <span className="text24 max-sm:hidden text-light-grey absolute text-justify left-[1vw] top-[3vw]">
              Hyperiux Vault
            </span>
            <RandomBlur as="span">
              <span className="opacity-0 max-md:hidden">dum</span>  Creative interaction effects for websites that need to be remembered.
            </RandomBlur>
          </h1>
        </div>
        <p ref={pRef} className="text22 max-sm:text-center">
          Creative interaction systems built with React, GSAP, Motion, Three.js,
          and WebGL.
        </p>
      </div>
    </section>
  );
}
