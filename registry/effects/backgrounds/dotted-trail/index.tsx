// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef } from "react";

type Point = {
  x: number;
  y: number;
};

type Rgba = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export interface DottedTrailProps {
  heading?: string;
  clue?: string;
  trailColorA?: string;
  trailColorB?: string;
  dotColor?: string;
  activeDotColor?: string;
  backgroundColor?: string;
  dotSpacing?: number;
  interactionRadius?: number;
  trailWidth?: number;
  trailBlur?: number;
}

function colorToRgba(color: string, fallback: Rgba): Rgba {
  const normalized = color.trim();
  const rgbaMatch = normalized.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);

  if (rgbaMatch) {
    return {
      r: Number(rgbaMatch[1]),
      g: Number(rgbaMatch[2]),
      b: Number(rgbaMatch[3]),
      a: rgbaMatch[4] ? Number(rgbaMatch[4]) : 1,
    };
  }

  const hex = normalized.replace("#", "");
  if (hex.length === 3) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
      a: 1,
    };
  }

  if (hex.length === 6) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: 1,
    };
  }

  return fallback;
}

function rgbaToString(color: Rgba, alpha = color.a) {
  return `rgba(${Math.round(color.r)},${Math.round(color.g)},${Math.round(color.b)},${alpha.toFixed(2)})`;
}

export default function DottedTrail({
  heading = "Trace the invisible",
  clue = "Move your cursor through the field.",
  trailColorA = "#ff4fd8",
  trailColorB = "#8b5cf6",
  dotColor = "#64646e",
  activeDotColor = "#ffffff",
  backgroundColor = "#ffffff",
  dotSpacing = 40,
  interactionRadius = 200,
  trailWidth = 140,
  trailBlur = 70,
}: DottedTrailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    const canvasElement = canvas;
    const context = ctx;

    // Detect Safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    // raw & smoothed mouse
    let mouse: Point | null = null;
    let smoothedMouse: Point | null = null;
    let mouseHistory: Point[] = [];
    let isMouseActive = false;
    let inactivityTimer: ReturnType<typeof window.setTimeout> | null = null;
    const inactivityTimeout = 4000; // ms

    // idle wander
    let idle = false;
    let idlePhase: "waiting" | "moving" = "waiting";
    let idleWaitTime = 0;
    const idleMinDelay = 2000;   // ms
    const idleMaxDelay = 4000;   // ms
    const idleLerpFactor = 0.02;
    let idleTarget: Point = { x: 0, y: 0 };

    // trail params
    const maxTrailLength = 30;
    const trailBaseWidth = trailWidth;
    const glowFeather = Math.max(0, trailBlur);
    const mouseLerpFactor = 0.05;
    const trailStartColor = colorToRgba(trailColorA, { r: 255, g: 79, b: 216, a: 1 });
    const trailEndColor = colorToRgba(trailColorB, { r: 139, g: 92, b: 246, a: 1 });

    // dot grid
    const dotConfig = {
      spacing: dotSpacing,
      radius: 1,
      maxRadius: 2,
      interactionRadius,
      baseColor: dotColor,
      activeColor: activeDotColor,
    };
    const canvasClearStyle = backgroundColor;
    let dots: Dot[] = [];
    let animationFrameId = 0;

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * Math.max(0, Math.min(1, t));
    }

    class Dot {
      x: number;
      y: number;
      radius: number;
      baseColor: Rgba;
      activeColor: Rgba;
      currentColor: Rgba;
      targetColor: Rgba;
      holdTime: number;
      holdDuration: number;
      radiusLerp: number;
      colorLerp: number;

      constructor(x: number, y: number) {
        const baseColor = colorToRgba(dotConfig.baseColor, { r: 100, g: 100, b: 110, a: 0.2 });
        const activeColor = colorToRgba(dotConfig.activeColor, { r: 255, g: 255, b: 255, a: 1 });

        this.x = x;
        this.y = y;
        this.radius = dotConfig.radius;
        this.baseColor = { ...baseColor, a: baseColor.a === 1 ? 0.2 : baseColor.a };
        this.activeColor = activeColor;
        this.currentColor = { ...this.baseColor };
        this.targetColor = { ...this.baseColor };
        this.holdTime = 0;
        this.holdDuration = 1000;
        this.radiusLerp = 0.5;
        this.colorLerp = 0.8;
      }

      update(delta: number, inZone: boolean) {
        if (inZone) this.holdTime = this.holdDuration;
        if (this.holdTime > 0) this.holdTime = Math.max(0, this.holdTime - delta);
        const active = this.holdTime > 0;
        this.radius = lerp(
          this.radius,
          active ? dotConfig.maxRadius : dotConfig.radius,
          this.radiusLerp
        );
        this.targetColor = active ? this.activeColor : this.baseColor;
        (["r", "g", "b", "a"] as const).forEach((ch) => {
          this.currentColor[ch] = lerp(
            this.currentColor[ch],
            this.targetColor[ch],
            this.colorLerp
          );
        });
        context.beginPath();
        context.fillStyle = `rgba(${Math.round(this.currentColor.r)},${Math.round(this.currentColor.g)},${Math.round(this.currentColor.b)},${this.currentColor.a.toFixed(2)})`;
        context.arc(this.x, this.y, Math.max(this.radius, 0.5), 0, Math.PI * 2);
        context.fill();
      }
    }

    function initCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvasElement.width = window.innerWidth * dpr;
      canvasElement.height = window.innerHeight * dpr;
      canvasElement.style.width = `${window.innerWidth}px`;
      canvasElement.style.height = `${window.innerHeight}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      const cols = Math.floor(window.innerWidth / dotConfig.spacing) + 2;
      const rows = Math.floor(window.innerHeight / dotConfig.spacing) + 2;
      const offX = (window.innerWidth - (cols - 2) * dotConfig.spacing) / 2;
      const offY = (window.innerHeight - (rows - 2) * dotConfig.spacing) / 2;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          dots.push(new Dot(
            offX + i * dotConfig.spacing,
            offY + j * dotConfig.spacing
          ));
        }
      }
    }

    function randDelay() {
      return idleMinDelay + Math.random() * (idleMaxDelay - idleMinDelay);
    }

    let lastTime = performance.now();

    function canvasLoop(now = performance.now()) {
      const delta = now - lastTime;
      lastTime = now;

      // real mouse
      if (!idle && mouse) {
        smoothedMouse = smoothedMouse
          ? {
              x: lerp(smoothedMouse.x, mouse.x, mouseLerpFactor),
              y: lerp(smoothedMouse.y, mouse.y, mouseLerpFactor),
            }
          : { ...mouse };
        mouseHistory.push({ x: smoothedMouse.x, y: smoothedMouse.y });
        if (mouseHistory.length > maxTrailLength) mouseHistory.shift();
      }

      // idle movement
      if (idle) {
        if (idlePhase === 'waiting') {
          idleWaitTime -= delta;
          if (idleWaitTime <= 0) {
            idlePhase = 'moving';
            idleTarget = {
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight
            };
          }
        }
        if (idlePhase === 'moving') {
          smoothedMouse = smoothedMouse
            ? {
                x: lerp(smoothedMouse.x, idleTarget.x, idleLerpFactor),
                y: lerp(smoothedMouse.y, idleTarget.y, idleLerpFactor),
              }
            : {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
              };
          mouseHistory.push({ x: smoothedMouse.x, y: smoothedMouse.y });
          if (mouseHistory.length > maxTrailLength) mouseHistory.shift();
          if (Math.hypot(smoothedMouse.x - idleTarget.x, smoothedMouse.y - idleTarget.y) < 5) {
            idlePhase = 'waiting';
            idleWaitTime = randDelay();
          }
        }
      }

      // clear canvas
      context.fillStyle = canvasClearStyle;
      context.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // draw smooth gradient trail
      if (!isSafari && mouseHistory.length > 1) {
        context.save();
        context.globalCompositeOperation = "source-over";
        for (let i = 0; i < mouseHistory.length; i++) {
          const age = i / (mouseHistory.length - 1);
          const point = mouseHistory[i];
          const tailProgress = age < 0.22 ? age / 0.22 : 1;
          const coreRadius = Math.max(12, trailBaseWidth * lerp(0.18, 1, tailProgress));
          const radius = coreRadius + glowFeather;
          const coreStop = Math.max(0.08, Math.min(0.82, coreRadius / radius));
          const alpha = Math.max(0.02, 0.34 * age);
          const glow = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);

          glow.addColorStop(0, rgbaToString(trailStartColor, alpha));
          glow.addColorStop(coreStop * 0.55, rgbaToString(trailStartColor, alpha * 0.76));
          glow.addColorStop(coreStop, rgbaToString(trailEndColor, alpha * 0.48));
          glow.addColorStop(1, rgbaToString(trailEndColor, 0));

          context.fillStyle = glow;
          context.beginPath();
          context.arc(point.x, point.y, radius, 0, Math.PI * 2);
          context.fill();
        }
        context.restore();
      }

      // fade history if inactive
      if (!isMouseActive && !idle && mouseHistory.length > 0) {
        mouseHistory.shift();
      }

      // update dots
      dots.forEach((dot) => {
        const dx = (smoothedMouse?.x ?? -9999) - dot.x;
        const dy = (smoothedMouse?.y ?? -9999) - dot.y;
        const inZone = Math.hypot(dx, dy) < dotConfig.interactionRadius;
        dot.update(delta, inZone);
      });

      animationFrameId = requestAnimationFrame(canvasLoop);
    }

    function handleMouseMove(e: MouseEvent) {
      mouse = { x: e.clientX, y: e.clientY };
      isMouseActive = true;
      idle = false;
      if (inactivityTimer) window.clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        isMouseActive = false;
        idle = true;
        idlePhase = "waiting";
        idleWaitTime = randDelay();
      }, inactivityTimeout);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", initCanvas);

    initCanvas();
    idle = true;
    idlePhase = "waiting";
    idleWaitTime = randDelay();
    canvasLoop();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", initCanvas);
      window.cancelAnimationFrame(animationFrameId);
      if (inactivityTimer) window.clearTimeout(inactivityTimer);
    };
  }, [
    activeDotColor,
    backgroundColor,
    dotColor,
    dotSpacing,
    interactionRadius,
    trailBlur,
    trailColorA,
    trailColorB,
    trailWidth,
  ]);

  return (
    <div
      id="canvas-18971"
      className="max-sm:hidden max-md:hidden"
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        zIndex: 0,
        overflow: "hidden",
        marginLeft: "auto",
        marginRight: "auto",
        height: "100vh",
        backgroundColor,
      }}
    >
      <div className="pointer-events-none absolute bottom-[5vw] left-[5vw] z-10 max-w-[min(760px,58vw)]">
        <h1 className="text-[clamp(48px,7vw,118px)] font-medium uppercase leading-[0.9] text-[#111111]">
          {heading}
        </h1>
      </div>
      <div className="pointer-events-none absolute bottom-[5.3vw] right-[5vw] z-10 max-w-[min(360px,28vw)] text-right">
        <p className="text-[clamp(14px,1.2vw,20px)] font-medium leading-[1.2] text-[#111111]/60">
          {clue}
        </p>
      </div>
      <canvas ref={canvasRef} className="block h-screen w-screen" />
    </div>
  );
}
