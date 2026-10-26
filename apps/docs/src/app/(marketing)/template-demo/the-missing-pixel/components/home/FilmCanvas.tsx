// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, type RefObject } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import { DESKTOP_FRAMES, MOBILE_FRAMES } from "../../assets/film/frames";

const FRAME_COUNT = 120;

type FilmCanvasProps = {
  sectionRef: RefObject<HTMLElement | null>;
  label?: string;
};

const FilmCanvas = ({ sectionRef, label }: FilmCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !section || !ctx) return;

    const frames: Array<HTMLImageElement | null> = new Array(FRAME_COUNT).fill(null);
    const sources = window.matchMedia("(max-width: 900px)").matches ? MOBILE_FRAMES : DESKTOP_FRAMES;
    let progress = 0;
    let cancelled = false;

    const nearest = (index: number) => {
      if (frames[index]) return index;
      for (let gap = 1; gap < FRAME_COUNT; gap += 1) {
        if (frames[index - gap]) return index - gap;
        if (frames[index + gap]) return index + gap;
      }
      return -1;
    };

    const cover = (img: HTMLImageElement, alpha: number) => {
      const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const width = img.naturalWidth * scale;
      const height = img.naturalHeight * scale;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    };

    const draw = () => {
      const position = Math.min(1, Math.max(0, progress)) * (FRAME_COUNT - 1);
      const first = Math.floor(position);
      const mix = position - first;
      const a = nearest(first);
      const b = nearest(Math.min(FRAME_COUNT - 1, first + 1));
      if (a < 0) return;
      cover(frames[a] as HTMLImageElement, 1);
      if (b >= 0 && b !== a && mix > 0.01) cover(frames[b] as HTMLImageElement, mix);
      ctx.globalAlpha = 1;
    };

    const resize = () => {
      const scale = Math.min(1, 1920 / Math.max(1, canvas.clientWidth));
      canvas.width = Math.round(canvas.clientWidth * scale);
      canvas.height = Math.round(canvas.clientHeight * scale);
      draw();
    };

    const order: number[] = [];
    for (const step of [8, 4, 2, 1]) {
      for (let i = 0; i < FRAME_COUNT; i += step) if (!order.includes(i)) order.push(i);
    }
    let next = 0;
    const worker = async () => {
      while (!cancelled && next < order.length) {
        const index = order[next++];
        const img = new Image();
        img.src = sources[index];
        try {
          await img.decode();
          frames[index] = img;
          draw();
        } catch {
          frames[index] = null;
        }
      }
    };
    for (let i = 0; i < 4; i += 1) worker();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    let trigger: ScrollTrigger | undefined;
    if (!prefersReducedMotion()) {
      trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          progress = self.progress;
          draw();
        },
      });
    }

    return () => {
      cancelled = true;
      observer.disconnect();
      trigger?.kill();
    };
  }, [sectionRef]);

  return <canvas ref={canvasRef} role="img" aria-label={label} className="h-full w-full bg-(--mpx-ink)" />;
};

export default FilmCanvas;
