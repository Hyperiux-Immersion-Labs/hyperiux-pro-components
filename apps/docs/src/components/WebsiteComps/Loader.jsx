"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { HyperiuxLogo } from "@/utils/Icons";
import { HyperiuxLogoIcon } from "./Icons";
import { useLenis } from "lenis/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

export const LOADER_STORAGE_KEY = "hyperiux-loader-has-run";

const PIXEL_COLOR = "#ffffff";
const LOGO_REVEAL_DURATION = 1;
const LOGO_HIDE_DURATION = 1;
const LOGO_DELAY = 0.3;
const PIXEL_DISSOLVE_DURATION = 1;
const PIXEL_DISSOLVE_DELAY = 0.5;

function hasLoaderRun() {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(LOADER_STORAGE_KEY) === "true";
}

function markLoaderAsRun() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(LOADER_STORAGE_KEY, "true");
}

function setLoaderRuntimeState({ running, complete }) {
  if (typeof window === "undefined") return;

  window.__HYPERIUX_LOADER_RUNNING__ = running;
  window.__HYPERIUX_LOADER_COMPLETE__ = complete;
}

function dispatchLoaderComplete(skipped = false) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("loaderComplete", {
      detail: {
        skipped,
      },
    })
  );
}

function generatePixelOrder(cols, rows, seed = 42) {
  const total = cols * rows;
  const indices = Array.from({ length: total }, (_, i) => i);

  let s = seed;

  const rand = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };

  for (let i = total - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return indices;
}

function easeOutQuart(t) {
  return 1 - --t * t * t * t;
}

function getCols() {
  if (typeof window === "undefined") return 30;

  if (window.innerWidth < 640) return 12;
  if (window.innerWidth < 1025) return 24;

  return 30;
}

function getRows() {
  if (typeof window === "undefined") return 20;

  if (window.innerWidth < 640) return 22;

  if (window.innerWidth < 1025) {
    const cols = getCols();
    return Math.round(window.innerHeight / (window.innerWidth / cols));
  }

  return 20;
}

export default function Loader() {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRun, setShouldRun] = useState(false);

  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const behindLogoRef = useRef(null);
  const frontLogoRef = useRef(null);
  const bottomStripRef = useRef(null);
  const bgOverlayRef = useRef(null);

  const textWrapRef = useRef(null);
  const textOneRef = useRef(null);
  const textTwoRef = useRef(null);

  const pixelOrderRef = useRef(null);
  const canvasStateRef = useRef({ progress: 0 });
  const splitRefs = useRef([]);
  const timelineRef = useRef(null);

  const lenis = useLenis();

  const drawWhitePixels = useCallback((canvas, progress) => {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    const cols = getCols();
    const rows = getRows();
    const total = cols * rows;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PIXEL_COLOR;
    ctx.globalAlpha = 1;

    if (progress <= 0.001) {
      ctx.fillRect(0, 0, w, h);
      return;
    }

    if (progress >= 0.999) {
      ctx.clearRect(0, 0, w, h);
      return;
    }

    if (!pixelOrderRef.current || pixelOrderRef.current.length !== total) {
      pixelOrderRef.current = generatePixelOrder(cols, rows);
    }

    const order = pixelOrderRef.current;
    const cellW = w / cols;
    const cellH = h / rows;

    for (let i = 0; i < total; i++) {
      const idx = order[i];
      const c = idx % cols;
      const r = Math.floor(idx / cols);

      const normalizedPos = total <= 1 ? 0 : i / (total - 1);
      const posHash = ((c * 7 + r * 13) % 23) / 23;

      const staggerWindow = 0.14;
      const staggerStart =
        normalizedPos * (1 - staggerWindow) + posHash * 0.015;

      const safeStaggerStart = Math.min(staggerStart, 1 - staggerWindow);
      const staggerEnd = safeStaggerStart + staggerWindow;

      let local =
        (progress - safeStaggerStart) / (staggerEnd - safeStaggerStart);

      local = Math.max(0, Math.min(1, local));

      const easedLocal = easeOutQuart(local);
      const opacity = 1 - easedLocal;

      if (opacity < 0.01) continue;

      const x1 = Math.floor(c * cellW);
      const x2 = Math.ceil((c + 1) * cellW);
      const y1 = Math.floor(r * cellH);
      const y2 = Math.ceil((r + 1) * cellH);

      ctx.globalAlpha = opacity;
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
    }

    ctx.globalAlpha = 1;
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = Math.ceil(w * dpr);
    canvas.height = Math.ceil(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cols = getCols();
    const rows = getRows();

    pixelOrderRef.current = generatePixelOrder(cols, rows);

    drawWhitePixels(canvas, 0);
  }, [drawWhitePixels]);

  useEffect(() => {
    if (hasLoaderRun()) {
      document.body.classList.remove("loader-active");
      setLoaderRuntimeState({ running: false, complete: true });
      lenis?.start();

      setIsVisible(false);
      setShouldRun(false);

      requestAnimationFrame(() => {
        dispatchLoaderComplete(true);
      });

      return;
    }

    document.body.classList.add("loader-active");
    setLoaderRuntimeState({ running: true, complete: false });

    lenis?.stop();

    setShouldRun(true);
    setIsVisible(true);
  }, [lenis]);

  useEffect(() => {
    if (!shouldRun || !isVisible) return;

    lenis?.stop();
    document.body.classList.add("loader-active");
    setLoaderRuntimeState({ running: true, complete: false });

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const ctx = gsap.context(() => {
      const textOneSplit = SplitText.create(textOneRef.current, {
        type: "lines,chars",
        linesClass: "loader-text-line overflow-hidden",
      });

      const textTwoSplit = SplitText.create(textTwoRef.current, {
        type: "lines,chars",
        linesClass: "loader-text-line overflow-hidden",
      });

      splitRefs.current = [textOneSplit, textTwoSplit];

      gsap.set([textOneRef.current, textTwoRef.current, textWrapRef.current], {
        opacity: 1,
      });

      gsap.set(textOneSplit.chars, {
        yPercent: 110,
        opacity: 0,
      });

      gsap.set(textTwoSplit.chars, {
        yPercent: 110,
        opacity: 0,
      });

      const tl = gsap.timeline({
        onComplete: () => {
          markLoaderAsRun();
          gsap.set(behindLogoRef.current,{
            opacity:0,
          })
          document.body.classList.remove("loader-active");
          setLoaderRuntimeState({ running: false, complete: true });

          dispatchLoaderComplete(false);

          setIsVisible(false);
          setShouldRun(false);

          lenis?.start();
        },
      });

      timelineRef.current = tl;

      tl.set(canvasStateRef.current, {
        progress: 0,
      });

      tl.set(bgOverlayRef.current, {
        opacity: 0,
      });

      tl.set(frontLogoRef.current, {
        clipPath: "inset(0% 100% 0% 0%)",
      });

      tl.set(bottomStripRef.current, {
        scaleX: 0,
        transformOrigin: "left",
      });

      const textTimeline = gsap.timeline();

      textTimeline.to(
        textOneSplit.chars,
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.45,
          ease: "power3.out",
          stagger: {
            each: 0.022,
            from: "start",
          },
        },
        0.25
      );

      textTimeline.to(
        textOneSplit.chars,
        {
          yPercent: -110,
          opacity: 0,
          duration: 0.45,
          ease: "power3.in",
          stagger: {
            each: 0.018,
            from: "start",
          },
        },
        ">+=1"
      );

      textTimeline.to(
        textTwoSplit.chars,
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.45,
          ease: "power3.out",
          stagger: {
            each: 0.018,
            from: "start",
          },
        },
        "<+=0.18"
      );

      tl.to(
        frontLogoRef.current,
        {
          clipPath: "inset(0% 70% 0% 0%)",
          duration: LOGO_REVEAL_DURATION,
          delay: LOGO_DELAY,
          ease: "power4.inOut",
        },
        0
      );

      tl.to(
        bottomStripRef.current,
        {
          scaleX: 0.3,
          duration: LOGO_REVEAL_DURATION,
          ease: "power4.inOut",
        },
        "<="
      );

      tl.to(frontLogoRef.current, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: LOGO_REVEAL_DURATION,
        delay: LOGO_DELAY,
        ease: "power4.inOut",
      });

      tl.to(
        bottomStripRef.current,
        {
          scaleX: 1,
          duration: LOGO_REVEAL_DURATION,
          ease: "power4.inOut",
          onComplete: () => {
            gsap.set(bottomStripRef.current, {
              transformOrigin: "right",
            });
          },
        },
        "<="
      );

      tl.to(frontLogoRef.current, {
        clipPath: "inset(0% 0% 0% 100%)",
        duration: LOGO_HIDE_DURATION,
        delay: LOGO_DELAY,
        ease: "power4.inOut",
      });

      tl.to(
        bottomStripRef.current,
        {
          scaleX: 0,
          duration: LOGO_HIDE_DURATION,
          ease: "power4.inOut",
        },
        "<="
      );

      tl.to(
        textTwoSplit.chars,
        {
          yPercent: -110,
          opacity: 0,
          duration: 0.45,
          ease: "power3.in",
          stagger: {
            each: 0.014,
            from: "start",
          },
        },
        "<+=0.2"
      );

      tl.to(
        canvasStateRef.current,
        {
          progress: 1,
          duration: PIXEL_DISSOLVE_DURATION,
          delay: PIXEL_DISSOLVE_DELAY,
          ease: "none",
          onUpdate: () => {
            drawWhitePixels(canvasRef.current, canvasStateRef.current.progress);
          },
          onComplete: () => {
            drawWhitePixels(canvasRef.current, 1);
          },
        },
        "loader-exit"
      );
    }, rootRef);

    return () => {
      timelineRef.current?.kill();
      document.body.classList.remove("loader-active");

      if (!hasLoaderRun()) {
        setLoaderRuntimeState({ running: false, complete: false });
      }

      window.removeEventListener("resize", resizeCanvas);
      lenis?.start();

      splitRefs.current.forEach((split) => {
        split?.revert();
      });

      splitRefs.current = [];

      ctx.revert();
    };
  }, [shouldRun, isVisible, drawWhitePixels, resizeCanvas, lenis]);

  if (!isVisible) return null;

  return (
    <div
  id="site-loader"
  ref={rootRef}
  className="fixed inset-0 z-9999 flex h-screen w-screen items-center justify-center overflow-hidden"
>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0 h-screen w-screen"
        aria-hidden="true"
      />

      <div
        ref={behindLogoRef}
        className="behind-logo relative z-10 flex w-fit items-center gap-[1vw] text-[#0E0E0E] max-md:gap-[3vw]"
      >
        <div className="size-[4vw] max-md:size-[11vw]">
          <HyperiuxLogoIcon />
        </div>

        <div className="logo-wrapper w-[20vw] max-md:w-[50vw]">
          <HyperiuxLogo />
        </div>
      </div>

      <div
        ref={frontLogoRef}
        className="front-logo absolute left-1/2 top-1/2 z-20 flex w-fit -translate-x-1/2 -translate-y-1/2 items-center gap-[1vw] text-[#ff5f00] max-md:gap-[3vw]"
        style={{ clipPath: "inset(0% 100% 0% 0%)" }}
      >
        <div className="size-[4vw] max-md:size-[11vw]">
          <HyperiuxLogoIcon />
        </div>

        <div className="logo-wrapper w-[20vw] max-md:w-[50vw]">
          <HyperiuxLogo />
        </div>
      </div>

      <div
        ref={bottomStripRef}
        className="bottom-strip absolute bottom-0 left-0 z-30 h-[10px] w-full origin-left scale-x-0 bg-[#ff5f00]"
      />

      <div
        ref={bgOverlayRef}
        className="bg-overlay absolute inset-0 h-screen w-screen bg-white"
      />

      <div
        ref={textWrapRef}
        className="pointer-events-none absolute bottom-[5%] left-1/2 z-20 h-[3.6em] w-[26vw] -translate-x-1/2 overflow-hidden text-center text-[#111111] opacity-0 max-md:w-[70vw] max-sm:bottom-[7%] max-sm:w-[84vw]"
      >
        <p
          ref={textOneRef}
          className="absolute inset-0 flex items-center justify-center text-[1.2vw] font-medium leading-tight max-md:text-[2.5vw] max-sm:text-[4vw]"
        >
          Hold Up !!!
        </p>

        <p
          ref={textTwoRef}
          className="absolute inset-0 flex items-center justify-center text-[1.2vw] font-medium leading-tight max-md:text-[2.5vw] max-sm:text-[4vw]"
        >
          The Effects are loading under the hood...
        </p>
      </div>
    </div>
  );
}