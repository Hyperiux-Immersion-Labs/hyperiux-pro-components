// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "../../Animations/reducedMotion";
import { playSound } from "../../Sound/pixelSfx";
import { BASE, PAGE_NAMES, ROUTES } from "../../../routes";
import NumberCounter, { LOADER_COUNTER_DURATION } from "../number-counter";

gsap.registerPlugin(useGSAP);

const PIXEL_COLOR = "#ff5f00";

export const COVERED_EVENT = "mpx:covered";

const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

const drawGrid = (canvas: HTMLCanvasElement, progress: number, cover: boolean) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const mobile = w < 640;
  const cols = mobile ? 10 : 30;
  const rows = mobile ? 24 : 18;
  const cellW = w / cols;
  const cellH = h / rows;
  const total = cols + rows;

  ctx.clearRect(0, 0, w, h);
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const diagonal = cover ? c + (rows - 1 - r) : c + r;
      const delay = (diagonal / total) * 0.45;
      const speed = (c + r) % 2 === 0 ? 0.28 : 0.36;
      const local = easeInOutQuad(gsap.utils.clamp(0, 1, (progress - delay) / speed));
      const fill = cover ? local : 1 - local;
      if (fill <= 0.001) continue;
      const x1 = Math.floor(c * cellW);
      const x2 = Math.floor((c + 1) * cellW) + 1;
      const y1 = Math.floor(r * cellH);
      const y2 = Math.floor((r + 1) * cellH) + 1;
      const fillH = Math.ceil((y2 - y1) * fill);
      ctx.fillStyle = PIXEL_COLOR;
      ctx.fillRect(x1, y2 - fillH, x2 - x1, fillH);
    }
  }
};

const PixelTransition = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const labelTextRef = useRef<HTMLSpanElement | null>(null);
  const countRef = useRef<HTMLSpanElement | null>(null);
  const coveringRef = useRef(false);
  const failsafeRef = useRef<number | undefined>(undefined);
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();

  const reveal = () => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const label = labelRef.current;
    if (!root || !canvas || !label || !coveringRef.current) return;
    coveringRef.current = false;
    window.clearTimeout(failsafeRef.current);

    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    playSound("arrive");

    const grid = { p: 0 };
    drawGrid(canvas, 0, false);
    gsap.to(label, { opacity: 0, duration: 0.25 });
    gsap.to(grid, {
      p: 1,
      duration: 0.9,
      ease: "none",
      onUpdate: () => drawGrid(canvas, grid.p, false),
      onComplete: () => gsap.set(root, { display: "none" }),
    });
  };

  useGSAP(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const label = labelRef.current;
    const count = countRef.current;
    if (!root || !canvas || !label || !count) return;

    if (prefersReducedMotion() || pathname !== ROUTES.home) {
      gsap.set(root, { display: "none" });
      return;
    }

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.ceil(window.innerWidth * dpr);
      canvas.height = Math.ceil(window.innerHeight * dpr);
      canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener("resize", size);

    const grid = { p: 0 };

    const timeline = gsap
      .timeline({
        onComplete: () => gsap.set(root, { display: "none" }),
      })
      .to({}, { duration: LOADER_COUNTER_DURATION })
      .add(() => {
        drawGrid(canvas, 0, false);
        gsap.set(root, { backgroundColor: "transparent" });
        playSound("arrive");
      })
      .to([label, count], { opacity: 0, duration: 0.25 }, "<")
      .to(
        grid,
        {
          p: 1,
          duration: 0.9,
          ease: "none",
          onUpdate: () => drawGrid(canvas, grid.p, false),
        },
        "<",
      );

    return () => {
      timeline.kill();
      window.removeEventListener("resize", size);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const label = labelRef.current;
    const labelText = labelTextRef.current;
    const count = countRef.current;
    if (!root || !canvas || !label || !labelText || !count) return;

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        coveringRef.current ||
        prefersReducedMotion()
      ) {
        return;
      }

      const anchor = (event.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || !url.pathname.startsWith(BASE)) return;
      if (url.pathname === window.location.pathname) return;

      event.preventDefault();
      coveringRef.current = true;

      const target = url.pathname + url.search + url.hash;
      const slug = url.pathname.startsWith(`${ROUTES.work}/`) ? url.pathname.split("/").pop() : undefined;
      labelText.textContent =
        PAGE_NAMES[url.pathname] ??
        (slug ? slug.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ") : "Loading");
      gsap.set(root, { display: "block", backgroundColor: "transparent" });
      gsap.set([label, count], { opacity: 0 });
      playSound("leave");

      const grid = { p: 0 };
      drawGrid(canvas, 0, true);
      gsap.to(grid, {
        p: 1,
        duration: 0.85,
        ease: "none",
        onUpdate: () => drawGrid(canvas, grid.p, true),
        onComplete: () => {
          window.dispatchEvent(new Event(COVERED_EVENT));
          gsap.to(label, { opacity: 1, duration: 0.2 });
          router.push(target);
          failsafeRef.current = window.setTimeout(reveal, 3500);
        },
      });
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    if (!coveringRef.current) return;
    const timer = window.setTimeout(reveal, 250);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <noscript>
        <style>{`[data-mpx-transition]{display:none!important}`}</style>
      </noscript>
      <div
        ref={rootRef}
        data-mpx-transition
        aria-hidden
        className={`pointer-events-none fixed inset-0 z-150 bg-(--mpx-accent) ${pathname !== ROUTES.home ? "hidden" : ""}`}
      >
        <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
        <div
          ref={labelRef}
          className="font-mpx-head absolute inset-0 flex items-center justify-center text-128 font-medium text-(color:--mpx-ink)"
        >
          <span ref={labelTextRef}>Missing Pixel</span>
        </div>
        <span
          ref={countRef}
          className="font-mpx-head mpx-container absolute bottom-[2.5vw] right-0 text-64 tabular-nums text-(color:--mpx-ink) max-lg:bottom-[4vw] max-md:bottom-[6vw]"
        >
          <NumberCounter />
        </span>
      </div>
    </>
  );
};

export default PixelTransition;
