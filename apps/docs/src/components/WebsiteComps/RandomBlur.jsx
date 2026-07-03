"use client";

import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { SplitText } from "gsap/dist/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

const LOADER_STORAGE_KEY = "hyperiux-loader-has-run";

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

function refreshScrollTriggerSafely() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh(true);
    });
  });
}

/**
 * Scroll-triggered random character blur reveal.
 */
export default function RandomBlur({
  children,
  as: Tag = "div",
  className = "",
  start = "top 90%",
  delay = 0,
  once = true,
  duration = 1,
  staggerAmount = 0.5,
  ease = "power3.out",
  blur = "10px",
}) {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    let ctx;
    let split;
    let poll;
    let bootCheck;
    let hasCreatedAnimation = false;

    ctx = gsap.context(() => {
      split = SplitText.create(container, {
        type: "words,chars",
        charsClass: "inline-block",
      });

      gsap.set(container, {
        autoAlpha: 1,
      });

      gsap.set(split.chars, {
        opacity: 0,
        filter: `blur(${blur})`,
        force3D: true,
      });
    }, container);

    const createAnimation = () => {
      if (hasCreatedAnimation) return;
      if (!split?.chars?.length) return;

      hasCreatedAnimation = true;

      if (poll) {
        window.clearInterval(poll);
        poll = null;
      }

      if (bootCheck) {
        window.clearTimeout(bootCheck);
        bootCheck = null;
      }

      refreshScrollTriggerSafely();

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          gsap.fromTo(
            split.chars,
            {
              opacity: 0,
              filter: `blur(${blur})`,
              force3D: true,
            },
            {
              opacity: 1,
              filter: "blur(0px)",
              force3D: true,
              delay,
              duration,
              ease,
              stagger: {
                amount: staggerAmount,
                from: "random",
              },
              scrollTrigger: {
                trigger: container,
                start,
                once,
                markers: false,
                invalidateOnRefresh: true,
              },
            }
          );

          ScrollTrigger.refresh(true);
        });
      });
    };

    const handleLoaderComplete = () => {
      createAnimation();
    };

    if (hasLoaderRun() && !isLoaderActive()) {
      createAnimation();
    } else {
      window.addEventListener("loaderComplete", handleLoaderComplete, {
        once: true,
      });

      poll = window.setInterval(() => {
        if (hasLoaderRun() && !isLoaderActive()) {
          createAnimation();
        }
      }, 60);

      bootCheck = window.setTimeout(() => {
        if (!isLoaderActive()) {
          createAnimation();
        }
      }, 700);
    }

    return () => {
      window.removeEventListener("loaderComplete", handleLoaderComplete);

      if (poll) {
        window.clearInterval(poll);
      }

      if (bootCheck) {
        window.clearTimeout(bootCheck);
      }

      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === container) {
          trigger.kill();
        }
      });

      if (ctx) {
        ctx.revert();
      }

      split?.revert();
    };
  }, [start, once, duration, staggerAmount, ease, delay, blur]);

  return (
    <Tag ref={containerRef} className={`${className} opacity-0`}>
      {children}
    </Tag>
  );
}