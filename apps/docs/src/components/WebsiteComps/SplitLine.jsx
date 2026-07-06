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

  // Loader.jsx writes sessionStorage (not localStorage) and sets the window
  // flag when it completes or is skipped.
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

function refreshScrollTriggerSafely() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh(true);
    });
  });
}

/**
 * Scroll-triggered line reveal — text lines or a decorative horizontal line.
 */
export default function SplitLine({
  children,
  as: Tag = "div",
  className = "",
  lineClassName = "",
  start = "top 92%",
  delay = 0,
  once = true,
  duration = 0.9,
  ease = "power3.out",
  origin = "0% 50%",
  stagger = 0.08,
}) {
  const wrapperRef = useRef(null);
  const lineRef = useRef(null);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const decorativeLine = lineRef.current;

    const target = children ? wrapper : decorativeLine;

    if (!target) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    let ctx;
    let split;
    let poll;
    let bootCheck;
    let hasCreatedAnimation = false;

    ctx = gsap.context(() => {
      if (children) {
        split = SplitText.create(wrapper, {
          type: "lines",
          mask: "lines",
        });

        if (reduceMotion) {
          gsap.set(wrapper, {
            autoAlpha: 1,
          });

          gsap.set(split.lines, {
            opacity: 1,
            yPercent: 0,
          });

          return;
        }

        gsap.set(wrapper, {
          autoAlpha: 1,
        });

        gsap.set(split.lines, {
          opacity: 0,
          yPercent: 100,
        });
      } else {
        if (reduceMotion) {
          gsap.set(decorativeLine, {
            opacity: 1,
            scaleX: 1,
            transformOrigin: origin,
          });

          return;
        }

        gsap.set(decorativeLine, {
          opacity: 0,
          scaleX: 0,
          transformOrigin: origin,
        });
      }
    }, target);

    if (reduceMotion) {
      return () => {
        if (ctx) ctx.revert();
        split?.revert();
      };
    }

    const createAnimation = () => {
      if (hasCreatedAnimation) return;

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
          if (children && split?.lines?.length) {
            gsap.fromTo(
              split.lines,
              {
                opacity: 0,
                yPercent: 100,
              },
              {
                opacity: 1,
                yPercent: 0,
                delay,
                duration,
                ease,
                stagger,
                scrollTrigger: {
                  trigger: wrapper,
                  start,
                  once,
                  invalidateOnRefresh: true,
                  markers: false,
                },
              }
            );
          }

          if (!children && decorativeLine) {
            gsap.fromTo(
              decorativeLine,
              {
                opacity: 0,
                scaleX: 0,
                transformOrigin: origin,
              },
              {
                opacity: 1,
                scaleX: 1,
                delay,
                duration,
                ease,
                scrollTrigger: {
                  trigger: decorativeLine,
                  start,
                  once,
                  invalidateOnRefresh: true,
                  markers: false,
                },
              }
            );
          }

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
        if (trigger.trigger === wrapper || trigger.trigger === decorativeLine) {
          trigger.kill();
        }
      });

      if (ctx) {
        ctx.revert();
      }

      split?.revert();
    };
  }, [children, start, once, duration, ease, origin, delay, stagger]);

  if (children) {
    return (
      <Tag ref={wrapperRef} className={`${className} opacity-0`}>
        {children}
      </Tag>
    );
  }

  return (
    <div className={className}>
      <div ref={lineRef} className={`${lineClassName} opacity-0`} />
    </div>
  );
}