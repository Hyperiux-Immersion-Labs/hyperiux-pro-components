"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { isLighthouseOrHeadless, isSoftwareRenderer } from "@/lib/audit";

export const LOADER_STORAGE_KEY = "hyperiux-loader-has-run";

// 00 → 27 → 59 → 77 → 99
const LEFT_DIGITS = ["0", "2", "5", "7", "9"];
const RIGHT_DIGITS = ["0", "7", "9", "7", "9"];

function getLoaderOverride() {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get("loader");
  return v === "cold" || v === "skip" ? v : null;
}

function hasLoaderRun() {
  if (typeof window === "undefined") return false;
  const override = getLoaderOverride();
  if (override) return override === "skip";
  try {
    return window.sessionStorage.getItem(LOADER_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function shouldSkipLoader() {
  if (typeof window === "undefined") return false;
  const override = getLoaderOverride();
  if (override) return override === "skip";
  if (isLighthouseOrHeadless() || isSoftwareRenderer()) return true;
  return false;
}

function markLoaderAsRun() {
  try {
    window.sessionStorage.setItem(LOADER_STORAGE_KEY, "true");
  } catch {
    // ignore
  }
}

function setLoaderRuntimeState({ running, complete }) {
  window.__HYPERIUX_LOADER_RUNNING__ = running;
  window.__HYPERIUX_LOADER_COMPLETE__ = complete;
}

function dispatchLoaderComplete(skipped = false) {
  window.dispatchEvent(
    new CustomEvent("loaderComplete", { detail: { skipped } })
  );
  window.dispatchEvent(
    new CustomEvent("hyperiux:loader-complete", { detail: { skipped } })
  );
}

function signalLoaderComplete(skipped = false) {
  document.documentElement.classList.remove("loader-first-visit");
  document.body.classList.remove("loader-active");
  markLoaderAsRun();
  setLoaderRuntimeState({ running: false, complete: true });
  dispatchLoaderComplete(skipped);
}

function hideLoaderLayers({ root, progress, footer } = {}) {
  if (root) gsap.set(root, { autoAlpha: 0, pointerEvents: "none" });
  if (progress) gsap.set(progress, { autoAlpha: 0, pointerEvents: "none" });
  if (footer) gsap.set(footer, { autoAlpha: 0, pointerEvents: "none" });
}

const Loader2 = () => {
  const rootRef = useRef(null);
  const progressRef = useRef(null);
  const footerRef = useRef(null);
  const loadingTextRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [shouldRun, setShouldRun] = useState(false);

  useLayoutEffect(() => {
    document.documentElement.classList.remove("loader-first-visit");

    // if (hasLoaderRun() || shouldSkipLoader()) {
    //   setVisible(false);
    //   setShouldRun(false);
    //   setLoaderRuntimeState({ running: false, complete: true });
    //   document.body.classList.remove("loader-active");
    //   requestAnimationFrame(() => {
    //     dispatchLoaderComplete(true);
    //   });
    //   return;
    // }

    setVisible(true);
    setShouldRun(true);
    document.body.classList.add("loader-active");
    setLoaderRuntimeState({ running: true, complete: false });

    return () => {
      document.body.classList.remove("loader-active");
    };
  }, []);

  useEffect(() => {
    if (!shouldRun || !visible) return;

    const root = rootRef.current;
    const progress = progressRef.current;
    const footer = footerRef.current;
    const loadingText = loadingTextRef.current;
    if (!root || !progress) return;

    const ctx = gsap.context(() => {
      const sequence = root.querySelector(".sequence-container");
      const numberContainers = gsap.utils.toArray(
        root.querySelectorAll(".number-container")
      );
      const digitWidth =
        numberContainers[0]?.querySelector("span")?.offsetWidth || 0;

      if (!digitWidth || !sequence) {
        signalLoaderComplete(false);
        hideLoaderLayers({ root, progress, footer });
        setVisible(false);
        return;
      }

      const travel = root.clientWidth - sequence.offsetWidth;
      const step = travel / 4;
      const stripHeight = footer?.offsetHeight || root.clientHeight * 0.02;
      const parkedY = root.clientHeight - stripHeight;

      gsap.set(numberContainers, { x: 0 });
      gsap.set(sequence, { x: 0 });
      gsap.set(progress, {
        x: 0,
        y: parkedY,
        scaleX: 0.2,
        transformOrigin: "left top",
      });

      const tl = gsap.timeline({
        defaults: { duration: .7 },
      });

      for (let i = 1; i <= 4; i++) {
        const label = `step-${i}`;

        tl.addLabel(label)
          .to(sequence, { x: i * step }, label)
          .to(numberContainers, { x: -i * digitWidth }, label)
          .to(progress, { scaleX: (i + 1) * 0.2 }, label);
      }

      tl.to(sequence, {
        x: root.clientWidth,
        duration: 0.7,
        opacity: 0,
      });

      tl.to(
        progress,
        {
          y: 0,
          delay: .1,
          duration: 0.4,
          ease: "power2.out",
          onComplete: () => {
            gsap.set(root, { autoAlpha: 0, pointerEvents: "none" });
            signalLoaderComplete(false);
          },
        },
        "<"
      );

      if (loadingText) {
        tl.to(
          loadingText,
          {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut",
          },
          "<"
        );
      }

      tl.to(progress, {
        y: -root.clientHeight,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => {
          hideLoaderLayers({ root, progress, footer });
          setVisible(false);
        },
      });
    }, root);

    return () => ctx.revert();
  }, [shouldRun, visible]);

  if (!visible) return null;

  return (
    <>
      <div
        ref={rootRef}
        id="loader"
        className="fixed inset-0 z-1200 flex h-screen w-screen items-start justify-start overflow-hidden bg-[#0e0e0e] text-[17vw] text-white max-md:text-[22vw] max-sm:text-[28vw]"
      >
        <div className="sequence-container relative z-2 flex h-fit w-fit font-head font-medium">
          <div className="flex w-[10vw] overflow-hidden max-md:w-[14vw] max-sm:w-[16vw]">
            <div className="number-container flex w-fit">
              {LEFT_DIGITS.map((digit) => (
                <span
                  key={`l-${digit}`}
                  className="inline-block w-[10vw] shrink-0 text-center max-md:w-[14vw] max-sm:w-[16vw]"
                >
                  {digit}
                </span>
              ))}
            </div>
          </div>

          <div className="flex w-[10vw] overflow-hidden max-md:w-[14vw] max-sm:w-[16vw]">
            <div className="number-container flex w-fit">
              {RIGHT_DIGITS.map((digit, index) => (
                <span
                  key={`r-${index}-${digit}`}
                  className="inline-block w-[10vw] shrink-0 text-center max-md:w-[14vw] max-sm:w-[16vw]"
                >
                  {digit}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        ref={progressRef}
        className="loader-progress pointer-events-none fixed top-0 left-0 z-1300 h-screen w-full origin-left bg-[linear-gradient(to_right,#f16b0d,#e61216)] will-change-transform"
      />

      <div
        ref={footerRef}
        className="loader-footer pointer-events-none fixed bottom-0 left-0 z-1300 h-[2vw] w-full max-md:h-10 max-sm:h-9"
      >
        <div className="relative h-full w-full">
          <p
            ref={loadingTextRef}
            className="loader-text-loading absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[1vw] font-medium text-white max-md:text-sm max-sm:text-xs"
          >
            LOADING...
          </p>
        </div>
      </div>
    </>
  );
};

export default Loader2;
