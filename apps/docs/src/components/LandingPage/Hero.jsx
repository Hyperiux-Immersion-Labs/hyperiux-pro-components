'use client';

import React, { useEffect, useRef } from "react";
import RandomBlur from "../Reusable/RandomBlur";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

if (typeof window !== 'undefined') {
  gsap.registerPlugin(SplitText);
}

export default function Hero() {
  const containerRef = useRef(null);
  const vaultDesktopRef = useRef(null);
  const vaultMobileRef = useRef(null);
  const pRef = useRef(null);

  useEffect(() => {
    const vaultEls = [vaultDesktopRef.current, vaultMobileRef.current].filter(Boolean);
    const pEl = pRef.current;
    if (!vaultEls.length && !pEl) return;

    const isLoaderActive =
      typeof document !== 'undefined' &&
      document.body.classList.contains("loader-active");

    if (isLoaderActive) {
      vaultEls.forEach((el) => gsap.set(el, { opacity: 0 }));
      if (pEl) gsap.set(pEl, { opacity: 0 });
    }

    const splits = [];
    let ctx;

    const runAnimation = () => {
      vaultEls.forEach((el) => gsap.set(el, { opacity: 1 }));
      if (pEl) gsap.set(pEl, { opacity: 1 });

      ctx = gsap.context(() => {
        vaultEls.forEach((el) => {
          const split = SplitText.create(el, { type: "words" });
          splits.push(split);

          gsap.fromTo(
            split.words,
            { y: 20, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              delay: 0.15,
              duration: 0.85,
              ease: "power3.out",
              stagger: 0.12,
            },
          );
        });

        if (pEl) {
          const split = SplitText.create(pEl, { type: "lines" });
          splits.push(split);

          gsap.fromTo(
            split.lines,
            { y: 24, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              delay: 0.4,
              duration: 0.95,
              ease: "power3.out",
              stagger: 0.08,
            },
          );
        }
      }, containerRef);
    };

    const cleanup = () => {
      if (ctx) ctx.revert();
      splits.forEach((split) => split.revert());
    };

    if (isLoaderActive) {
      const handleLoaderComplete = () => runAnimation();
      window.addEventListener("loaderComplete", handleLoaderComplete);
      return () => {
        window.removeEventListener("loaderComplete", handleLoaderComplete);
        cleanup();
      };
    }

    runAnimation();
    return cleanup;
  }, []);

  return (
    <section className="relative z-20 pointer-events-none self-padd h-screen flex items-center w-full">
      <div
        ref={containerRef}
        className="space-y-[2vw] max-md:space-y-[8vw] mt-[2vw] max-md:mt-0 relative z-2"
      >
        <p
          ref={vaultMobileRef}
          className="text24 hidden max-md:block text-light-grey max-md:text-center"
        >
          Hyperiux Vault
        </p>
        <div className="h-fit flex max-md:flex-col max-md:justify-center items-center w-full ">
          <h1 className="text140 max-md:text-center max-md:indent-0! relative w-[78vw] max-md:w-full">
            <span
              ref={vaultDesktopRef}
              className="text24 max-md:hidden text-light-grey absolute text-justify left-[1vw] top-[3vw]"
            >
              Hyperiux Vault
            </span>
            <RandomBlur as="span">
              <span className="opacity-0 max-md:hidden">dum</span>  Creative interaction effects for websites that need to be remembered.
            </RandomBlur>
          </h1>
        </div>
        <p ref={pRef} className="text22 max-md:text-center">
          Creative interaction systems built with React, GSAP, Motion, Three.js,
          and WebGL.
        </p>
      </div>
    </section>
  );
}
