"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useFadeUp } from "../Animations/gsapAnimations";
import Button from "../WebsiteComps/Button";
import { UnlockIcon } from "../WebsiteComps/Icons";
import ShimmerText from "../WebsiteComps/ShimmerText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

const LOADER_STORAGE_KEY = "hyperiux-loader-has-run";
const HERO_ANIMATION_DELAY_AFTER_LOADER = 0.15;
const HERO_ANIMATION_DELAY_WITHOUT_LOADER = 0.15;

function hasLoaderRun() {
  if (typeof window === "undefined") return false;

  return window.sessionStorage.getItem(LOADER_STORAGE_KEY) === "true";
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
  const buttonWrapRef = useRef(null);
  const shimmerTextWrapRef = useRef(null);

  useFadeUp();

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
    const buttonWrapEl = buttonWrapRef.current;
    const shimmerTextWrapEl = shimmerTextWrapRef.current;

    const navigationEls =
      typeof document !== "undefined"
        ? gsap.utils.toArray("#navigation, #mobile-navigation")
        : [];

    if (
      !headingEl &&
      !vaultEls.length &&
      !pEl &&
      !buttonWrapEl &&
      !shimmerTextWrapEl &&
      !navigationEls.length
    ) {
      return;
    }

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

    if (buttonWrapEl) {
      gsap.set(buttonWrapEl, {
        autoAlpha: 0,
        y: 18,
        filter: "blur(8px)",
      });
    }

    if (shimmerTextWrapEl) {
      gsap.set(shimmerTextWrapEl, {
        autoAlpha: 0,
        y: 14,
        filter: "blur(8px)",
      });
    }

    if (navigationEls.length) {
      gsap.set(navigationEls, {
        autoAlpha: 0,
        y: -18,
        yPercent: 0,
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
        const heroTimeline = gsap.timeline();

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

          heroTimeline.to(headingSplit.chars, {
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
            type: "chars",
            mask: "chars",
          });

          splits.push(split);

          heroTimeline.fromTo(
            split.chars,
            {
              yPercent: 100,
            },
            {
              yPercent: 0,
              duration: 0.3,
              ease: "power3.out",
              stagger: 0.02,
            },
            "-=0.65"
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

          heroTimeline.fromTo(
            split.lines,
            {
              y: 24,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.95,
              ease: "power3.out",
              stagger: 0.08,
            },
            "-=0.5"
          );
        }

        if (buttonWrapEl) {
          heroTimeline.to(
            buttonWrapEl,
            {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.75,
              ease: "power3.out",
            },
            "-=0.6"
          );
        }

        if (shimmerTextWrapEl) {
          heroTimeline.to(
            shimmerTextWrapEl,
            {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.75,
              ease: "power3.out",
            },
            "-=0.55"
          );
        }
      }, containerRef);

      if (navigationEls.length) {
        navigationTween = gsap.to(navigationEls, {
          autoAlpha: 1,
          y: 0,
          yPercent: 0,
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
    <section className="pointer-events-none relative z-20 flex h-screen w-full max-sm:h-[95vh] max-sm:w-screen items-center self-padd">
      <img
        src="/landing-page/hero-bg.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 hidden h-full w-full object-cover max-sm:block"
      />
      <div
        ref={containerRef}
        className="relative z-2 mt-[2vw] space-y-[2vw] max-md:mt-0 max-md:space-y-[8vw] max-sm:space-y-[14vw]"
      >
        <div className="flex h-fit w-full items-center max-md:flex-col max-sm:items-start max-sm:justify-start">
          <h1 className="text110 relative w-[65%] max-sm:font-medium! font-semibold max-md:w-[90%] max-sm:w-[95%]  max-md:indent-0!">
            <span ref={headingRef} className="inline-block opacity-0">
              The Interaction Layer your Website is{" "}
              <span className="italic max-md:not-italic text-[#ff5f00]">Missing</span>
            </span>
          </h1>
        </div>

        <p
          ref={pRef}
          className="text24 w-[50%] text-[#C9C9C9] opacity-0 max-md:w-full max-sm:w-[100%] max-md:text-center max-sm:text-left"
        >
          100+ copy-paste interaction effects for React & Next.js. Scroll
          systems, cursor effects, text reveals, page transitions, and WebGL
          scenes -the moments that make a site feel authored, not assembled.
          Preview them, install them with the CLI
        </p>

        <div
          ref={buttonWrapRef}
          className="pointer-events-auto flex max-sm:pt-4 max-sm:flex-col w-fit max-sm:w-full gap-[1vw] opacity-0  max-md:gap-5"
        >
          <Button
            text="Browse the effects"
            href="/effects"
            variant="black"
            className="border-white/20 bg-[#0e0e0e]!"
          />

          <Button text="Get Pro from $20/mo" href="#pricing-cards" variant="orange" />
        </div>

        <p
          ref={shimmerTextWrapRef}
          className="shimmer-text flex items-center gap-[0.5vw] max-sm:mt-[-6vw] text-[#939393] leading-none opacity-0 max-md:justify-center max-md:gap-2"
        >
          <span className="inline-block size-[0.9vw] shrink-0 text-[#939393] max-md:size-3">
            <UnlockIcon className="h-full w-full" />
          </span>

          <ShimmerText baseColor="#939393" shimmerColor="#ffffff">
            30+ effects free, forever. No credit card.
          </ShimmerText>
        </p>
      </div>
    </section>
  );
}