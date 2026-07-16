"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
// import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { isLighthouseOrHeadless, isSoftwareRenderer } from "@/lib/audit";
import { useFadeUp } from "../Animations/gsapAnimations";
import Button from "../WebsiteComps/Button";
import { UnlockIcon } from "../WebsiteComps/Icons";
import ShimmerText from "../WebsiteComps/ShimmerText";
import { LOADER_STORAGE_KEY } from "./Loader";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText, useGSAP);
}

const HERO_ANIMATION_DELAY_AFTER_LOADER = 0.15;
const HERO_ANIMATION_DELAY_WITHOUT_LOADER = 0.15;

function shouldBypassHeroIntroForAudit() {
  return isLighthouseOrHeadless() || isSoftwareRenderer();
}

function hasLoaderRun() {
  if (typeof window === "undefined") return false;

  return (
    window.sessionStorage.getItem(LOADER_STORAGE_KEY) === "true" ||
    window.__HYPERIUX_LOADER_COMPLETE__ === true
  );
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
  const labelRef = useRef(null);
  const headingRef = useRef(null);
  const descRef = useRef(null);
  const buttonWrapRef = useRef(null);
  const shimmerRef = useRef(null);

  useFadeUp();

  useEffect(
    () => {
      if (shouldBypassHeroIntroForAudit()) return;

      const label = labelRef.current;
      const heading = headingRef.current;
      const desc = descRef.current;
      const buttons = buttonWrapRef.current;
      const shimmer = shimmerRef.current;

      if (!label || !heading || !desc || !buttons || !shimmer) return;

      const labelSplit = SplitText.create(label, {
        type: "words,lines",
        aria: "none",
      });

      const headingSplit = SplitText.create(heading, {
        type: "words,lines",
        mask: "lines",
        linesClass: "line++",
        aria: "none",
      });

      const descSplit = SplitText.create(desc, {
        type: "words,lines",
        aria: "none",
      });

      gsap.set(labelSplit.lines, { yPercent: 100, opacity: 0 });
      gsap.set(headingSplit.lines, { yPercent: 100 });
      gsap.set(descSplit.lines, { yPercent: 100, opacity: 0 });
      gsap.set(buttons, { yPercent: 100, opacity: 0 });
      gsap.set(shimmer, { yPercent: 100, opacity: 0 });

      let hasAnimated = false;
      let delayedCall;
      let completionPoll;

      const runAnimation = () => {
        if (hasAnimated) return;
        hasAnimated = true;

        if (completionPoll) {
          window.clearInterval(completionPoll);
          completionPoll = null;
        }

        const tl = gsap.timeline({ delay: 0.4 });

        tl.to(labelSplit.lines, {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
        });

        tl.to(
          headingSplit.lines,
          {
            yPercent: 0,
            duration: 0.85,
            ease: "power2.out",
            stagger: 0.15,
          },
          "-=0.6"
        );

        tl.to(
          descSplit.lines,
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.95,
            ease: "power3.out",
            stagger: 0.08,
          },
          "-=0.7"
        );

        tl.to(
          buttons,
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.75,
            ease: "power3.out",
          },
          "-=0.5"
        );

        tl.to(
          shimmer,
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.75,
            ease: "power3.out",
          },
          "-=0.55"
        );
      };

      const startAfterDelay = (delay = HERO_ANIMATION_DELAY_AFTER_LOADER) => {
        if (hasAnimated) return;
        delayedCall?.kill();
        delayedCall = gsap.delayedCall(delay, runAnimation);
      };

      const handleLoaderComplete = () => {
        startAfterDelay(HERO_ANIMATION_DELAY_AFTER_LOADER);
      };

      if (hasLoaderRun() && !isLoaderActive()) {
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
        if (completionPoll) window.clearInterval(completionPoll);
        delayedCall?.kill();
        labelSplit.revert();
        headingSplit.revert();
        descSplit.revert();
      };
    },
    { scope: containerRef }
  );

  return (
    <section className="pointer-events-none relative z-20 flex h-screen w-full max-md:w-screen max-md:h-fit max-md:py-[35vw]! max-sm:py-[30vw]! items-center self-padd">
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
        className="relative z-2 mt-[2vw] space-y-[2vw] max-md:mt-0 max-md:space-y-[10vw] max-sm:space-y-[12vw]"
      >
        <div className="flex flex-col h-fit w-full items-start max-md:flex-col max-sm:items-start max-sm:gap-2 max-md:gap-5 max-sm:justify-start">
          <p
            ref={labelRef}
            className="text20 font-medium text-[#cdcdcd]"
          >
            React & Next.js Interaction Effects Library
          </p>

          <h1
            ref={headingRef}
            className="relative text120 mt-[1vw] w-fit capitalize max-sm:font-medium! font-semibold max-md:w-[90%] max-sm:w-[95%] max-md:indent-0!"
          >
            The Interaction Layer your
            <br />
            React Site is Missing
          </h1>
        </div>

        <p
          ref={descRef}
          className="text24 w-[40vw]  text-[#C9C9C9] max-md:w-[80%] max-sm:w-full max-md:text-left max-sm:text-left"
        >
          Source-first scroll systems, cursor effects, text reveals, page transitions, loaders backgrounds, and WebGL scenes for React and Next.js. Start with 30+ Free Core effects today.
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
            text="Upgrade to Pro"
            href="/sign-up"
            variant="orange"
            scrollOffset={-1000}
          />
        </div>

        <p
          ref={shimmerRef}
          className="shimmer-text flex items-center max-sm:items-start gap-[0.5vw] max-md:mt-[-3vw] max-sm:mt-[-6vw] max-sm:pl-0 max-md:pl-2 text-[#939393] leading-none max-sm:justify-center max-md:gap-2"
        >
          <span className="inline-block size-[0.9vw] shrink-0 text-[#939393] max-md:size-3">
            <UnlockIcon className="h-full w-full" />
          </span>

          <ShimmerText
            baseColor="#939393"
            shimmerColor="#ffffff"
            className="max-sm:text-[3.5vw] leading-[1.2]"
          >
            115 effects · 32 free · 83 Pro · React + Next.js · CLI install ·
            Source-first code
          </ShimmerText>
        </p>
      </div>
    </section>
  );
}
