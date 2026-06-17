"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

const LOADER_STORAGE_KEY = "hyperiux-loader-has-run";
const HERO_ANIMATION_DELAY_AFTER_LOADER = 0.15;
const HERO_ANIMATION_DELAY_WITHOUT_LOADER = 0.15;

function hasLoaderRun() {
  if (typeof window === "undefined") return false;

  return window.localStorage.getItem(LOADER_STORAGE_KEY) === "true";
}

function isLoaderActive() {
  if (typeof window === "undefined") return false;

  return (
    document.body.classList.contains("loader-active") ||
    window.__HYPERIUX_LOADER_RUNNING__ === true
  );
}

export default function Hero() {
  const containerRef = useRef(null);
  const headingRef = useRef(null);
  const vaultDesktopRef = useRef(null);
  const vaultMobileRef = useRef(null);
  const pRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const previousScrollRestoration = window.history.scrollRestoration;

    window.history.scrollRestoration = "manual";

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    };

    scrollToTop();

    const rafOne = requestAnimationFrame(scrollToTop);
    const rafTwo = requestAnimationFrame(() => {
      requestAnimationFrame(scrollToTop);
    });

    const timeout = window.setTimeout(scrollToTop, 120);

    return () => {
      cancelAnimationFrame(rafOne);
      cancelAnimationFrame(rafTwo);
      window.clearTimeout(timeout);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    const headingEl = headingRef.current;

    const vaultEls = [vaultDesktopRef.current, vaultMobileRef.current].filter(
      Boolean
    );

    const pEl = pRef.current;

    const navigationEl =
      typeof document !== "undefined"
        ? document.querySelector("#navigation")
        : null;

    if (!headingEl && !vaultEls.length && !pEl && !navigationEl) return;

    if (headingEl) {
      gsap.set(headingEl, {
        autoAlpha: 0,
      });
    }

    vaultEls.forEach((el) => {
      gsap.set(el, {
        autoAlpha: 0,
      });
    });

    if (pEl) {
      gsap.set(pEl, {
        autoAlpha: 0,
      });
    }

    if (navigationEl) {
      gsap.set(navigationEl, {
        autoAlpha: 0,
        y: -18,
      });
    }

    const splits = [];
    let ctx;
    let delayedCall;
    let completionPoll;
    let navigationTween;
    let hasAnimated = false;

    const runAnimation = () => {
      if (hasAnimated) return;

      hasAnimated = true;

      if (completionPoll) {
        window.clearInterval(completionPoll);
        completionPoll = null;
      }

      ctx = gsap.context(() => {
        if (headingEl) {
          const headingSplit = SplitText.create(headingEl, {
            type: "words,chars",
            charsClass: "inline-block",
          });

          splits.push(headingSplit);

          gsap.set(headingSplit.chars, {
            opacity: 0,
            filter: "blur(10px)",
            force3D: true,
          });

          gsap.set(headingEl, {
            autoAlpha: 1,
          });

          gsap.to(headingSplit.chars, {
            opacity: 1,
            filter: "blur(0px)",
            force3D: true,
            duration: 1,
            ease: "power3.out",
            stagger: {
              amount: 0.5,
              from: "random",
            },
          });
        }

        vaultEls.forEach((el) => {
          gsap.set(el, {
            autoAlpha: 1,
          });

          const split = SplitText.create(el, {
            type: "words",
          });

          splits.push(split);

          gsap.fromTo(
            split.words,
            {
              y: 20,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              delay: 0.15,
              duration: 0.85,
              ease: "power3.out",
              stagger: 0.12,
            }
          );
        });

        if (pEl) {
          gsap.set(pEl, {
            autoAlpha: 1,
          });

          const split = SplitText.create(pEl, {
            type: "lines",
          });

          splits.push(split);

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
        }
      }, containerRef);

      if (navigationEl) {
        navigationTween = gsap.to(navigationEl, {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          delay: 0.1,
          ease: "power3.out",
        });
      }
    };

    const startAfterDelay = (delay = HERO_ANIMATION_DELAY_AFTER_LOADER) => {
      if (hasAnimated) return;

      delayedCall?.kill();

      delayedCall = gsap.delayedCall(delay, runAnimation);
    };

    const handleLoaderComplete = () => {
      startAfterDelay(HERO_ANIMATION_DELAY_AFTER_LOADER);
    };

    const loaderAlreadyRan = hasLoaderRun();
    const loaderCurrentlyActive = isLoaderActive();

    if (loaderAlreadyRan && !loaderCurrentlyActive) {
      startAfterDelay(HERO_ANIMATION_DELAY_WITHOUT_LOADER);
    } else {
      window.addEventListener("loaderComplete", handleLoaderComplete, {
        once: true,
      });

      completionPoll = window.setInterval(() => {
        if (hasLoaderRun() && !isLoaderActive()) {
          window.clearInterval(completionPoll);
          completionPoll = null;

          startAfterDelay(HERO_ANIMATION_DELAY_AFTER_LOADER);
        }
      }, 80);
    }

    return () => {
      window.removeEventListener("loaderComplete", handleLoaderComplete);

      if (completionPoll) {
        window.clearInterval(completionPoll);
      }

      delayedCall?.kill();
      navigationTween?.kill();

      if (ctx) {
        ctx.revert();
      }

      splits.forEach((split) => {
        split?.revert();
      });
    };
  }, []);

  return (
    <section className="relative z-20 pointer-events-none self-padd h-screen flex items-center w-full">
      <div
        ref={containerRef}
        className="space-y-[2vw] max-md:space-y-[8vw] mt-[2vw] max-md:mt-0 relative z-2"
      >
        <p
          ref={vaultMobileRef}
          className="text24 hidden max-md:block text-light-grey max-md:text-center opacity-0"
        >
          Hyperiux Vault
        </p>

        <div className="h-fit flex max-md:flex-col max-md:justify-center items-center w-full">
          <h1 className="text140 max-md:text-center max-md:indent-0! relative w-[78vw] max-md:w-full">
            <span
              ref={vaultDesktopRef}
              className="text24 max-md:hidden text-light-grey absolute text-justify left-[1vw] top-[3vw] opacity-0"
            >
              Hyperiux Vault
            </span>

            <span ref={headingRef} className="inline-block opacity-0">
              <span className="opacity-0 max-md:hidden">sar</span>Creative
              interaction effects for websites that need to be remembered.
            </span>
          </h1>
        </div>

        <p ref={pRef} className="text22 max-md:text-center opacity-0">
          Creative interaction systems built with React, GSAP, Motion, Three.js,
          and WebGL.
        </p>
      </div>
    </section>
  );
}