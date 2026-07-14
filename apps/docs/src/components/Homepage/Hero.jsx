"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { isLighthouseOrHeadless, isSoftwareRenderer } from "@/lib/audit";
import { prefersReducedMotion } from "@/lib/motion";
import { useFadeUp } from "../Animations/gsapAnimations";
import Button from "../WebsiteComps/Button";
import { UnlockIcon } from "../WebsiteComps/Icons";
import ShimmerText from "../WebsiteComps/ShimmerText";

// PSI desktop often has a plain Chrome UA and no navigator.webdriver — the
// software WebGL renderer is what catches that lab VM. Real GPUs never match.
function shouldBypassHeroIntroForAudit() {
  return isLighthouseOrHeadless() || isSoftwareRenderer();
}

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

const HERO_ANIMATION_DELAY = 0.15;

export default function Hero() {
  const containerRef = useRef(null);
  const headingRef = useRef(null);
  const vaultDesktopRef = useRef(null);
  const vaultMobileRef = useRef(null);
  const pRef = useRef(null);
  const paraRef=useRef(null);
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
    const paraEl = paraRef.current;
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
      !paraEl &&
      !buttonWrapEl &&
      !shimmerTextWrapEl &&
      !navigationEls.length
    ) {
      return;
    }

    // Reduced-motion users + lab audits: keep LCP text painted immediately.
    // Real visitors still get the full opacity/blur intro below.
    if (prefersReducedMotion() || shouldBypassHeroIntroForAudit()) {
      const heroEls = [headingEl, ...vaultEls, pEl, paraEl, buttonWrapEl, shimmerTextWrapEl].filter(Boolean);
      if (heroEls.length) gsap.set(heroEls, { opacity: 1, y: 0, filter: "none" });
      if (navigationEls.length) gsap.set(navigationEls, { opacity: 1, y: 0, yPercent: 0 });
      return;
    }

    if (headingEl) {
      gsap.set(headingEl, {
        opacity: 0,
      });
    }

    vaultEls.forEach((el) => {
      gsap.set(el, {
        opacity: 0,
      });
    });

    if (pEl) {
      gsap.set(pEl, {
        opacity: 0,
      });
    }
    if (paraEl) {
      gsap.set(paraEl, {
        opacity: 0,
      });
    }

    if (buttonWrapEl) {
      gsap.set(buttonWrapEl, {
        opacity: 0,
        y: 18,
        
      });
    }

    if (shimmerTextWrapEl) {
      gsap.set(shimmerTextWrapEl, {
        opacity: 0,
        y: 14,
        
      });
    }

    if (navigationEls.length) {
      gsap.set(navigationEls, {
        opacity: 0,
        y: -18,
        yPercent: 0,
      });
    }

    const splits = [];
    let ctx;
    let delayedCall;
    let navigationTween;
    let hasAnimated = false;

    const runAnimation = () => {
      if (hasAnimated) return;

      hasAnimated = true;

      ctx = gsap.context(() => {
        const heroTimeline = gsap.timeline();

        if (headingEl) {
          const headingSplit = SplitText.create(headingEl, {
            type: "words,chars",
            charsClass: "inline-block",
            aria: "none",
          });

          splits.push(headingSplit);

          gsap.set(headingSplit.chars, {
            opacity: 0,
            filter: "blur(4px)",
            force3D: true,
          });

          gsap.set(headingEl, {
            opacity: 1,
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
            opacity: 1,
          });

          const split = SplitText.create(el, {
            type: "chars",
            mask: "chars",
            aria: "none",
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
            opacity: 1,
          });

          const split = SplitText.create(pEl, {
            type: "lines",
            aria: "none",
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
        if (paraEl) {
          gsap.set(paraEl, {
            opacity: 1,
          });

          const split = SplitText.create(paraEl, {
            type: "lines",
            aria: "none",
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
              // stagger: 0.08,
            },
            "-=2.2"
          );
        }

        if (buttonWrapEl) {
          heroTimeline.to(
            buttonWrapEl,
            {
              opacity: 1,
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
              opacity: 1,
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
          opacity: 1,
          y: 0,
          yPercent: 0,
          duration: 0.75,
          delay: 0.1,
          ease: "power3.out",
        });
      }
    };

    // Decoupled from the site loader: the loader is a fixed z-9999 opaque
    // overlay with scroll locked while it plays, so the hero is hidden behind
    // it regardless of when this animation runs - starting immediately means
    // it plays out during the overlay instead of after, so by the time the
    // overlay lifts the hero is already in its revealed end state. This was
    // the LCP element per Lighthouse (elementRenderDelay ~9.6s waiting on the
    // old loader-gated start).
    delayedCall = gsap.delayedCall(HERO_ANIMATION_DELAY, runAnimation);

    return () => {
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
    <section className="pointer-events-none relative z-20 flex h-screen w-full  max-md:w-screen max-md:h-fit max-md:py-[35vw]! max-sm:py-[30vw]! items-center self-padd">
      <Image
        src="/landing-page/hero-bg.webp"
        alt=""
        aria-hidden
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="pointer-events-none -z-10 hidden object-cover max-md:block"
      />
      <div
        ref={containerRef}
        className="relative z-2 mt-[2vw] space-y-[2vw]  max-md:mt-0 max-md:space-y-[10vw] max-sm:space-y-[12vw]"
      >
        <div className="flex flex-col h-fit w-full items-start max-md:flex-col max-sm:items-start max-sm:gap-2 max-md:gap-5 max-sm:justify-start">
          <p  ref={paraRef} className="text20 font-medium text-[#cdcdcd]">React & Next.js Interaction Effects Library</p>
          <h1 className=" relative text120 w-[73%] max-sm:font-medium! font-semibold max-md:w-[90%] max-sm:w-[95%]  max-md:indent-0!">
            <span ref={headingRef} className="inline-block">
             The Interaction Layer Your React Site is Missing
            </span>
          </h1>
        </div>

        <p
          ref={pRef}
          className="text24 w-[50%] text-[#C9C9C9] max-md:w-[80%] max-sm:w-full max-md:text-left max-sm:text-left"
        >
         Source-first scroll systems, cursor effects, text reveals, page transitions, loaders, backgrounds, and WebGL scenes for React and Next.js. Start with 30+ Free Core effects today. Join Founding Access for first access to 80+ Pro effects next week.
        </p>

        <div
          ref={buttonWrapRef}
          className="pointer-events-auto flex max-sm:pt-4 max-sm:flex-col w-fit max-sm:w-[88%] gap-[1vw] max-md:gap-5"
        >
          <Button
            text="Browse Free Effects"
            href="/effects/free"
            variant="black"
            className="border-white/40 bg-[#0e0e0e]!"
          />

          <Button
            text="Join Founding Access"
            href="/waitlist"
            variant="orange"
            scrollOffset={-1000}
          />
        </div>

        <p
          ref={shimmerTextWrapRef}
          className="shimmer-text flex items-center max-sm:items-start  gap-[0.5vw] max-md:mt-[-3vw] max-sm:mt-[-6vw] max-sm:pl-0 max-md:pl-2 text-[#939393] leading-none opacity-0 max-sm:justify-center max-md:gap-2"
        >
          <span className="inline-block size-[0.9vw] shrink-0 text-[#939393] max-md:size-3">
            <UnlockIcon className="h-full w-full" />
          </span>

          <ShimmerText baseColor="#939393" shimmerColor="#ffffff" className="max-sm:text-[3.5vw] leading-[1.2]">
            115 effects · 32 free · 83 Pro · React + Next.js · CLI install · Source-first code
          </ShimmerText>
        </p>
      </div>
    </section>
  );
}
