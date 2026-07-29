"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useIsMobile } from "./hooks";

const BASE_SPEED = 0.6;

/** @param {{ items?: string[] }} props */
export default function TextStreamComp({ items = [] }) {
  const trackRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const contentRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const containerRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  const [copyCount, setCopyCount] = useState(2);
  const isMobile = useIsMobile();

  const metricsRef = useRef({
    currentY: 0,
    distance: 0,
    currentVelocity: BASE_SPEED,
    targetVelocity: BASE_SPEED,
    lastScrollDirection: 1,
  });

  const scrollTimeoutRef = useRef(/** @type {number | null} */ (null));

  useLayoutEffect(() => {
    const track = trackRef.current;
    const content = contentRef.current;
    const container = containerRef.current;

    if (!track || !content || !container) {
      return undefined;
    }

    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const idleSpeed = prefersReducedMotion ? 0 : BASE_SPEED;
    const velocityLerpFactor = prefersReducedMotion ? 1 : 0.14;

    metricsRef.current.currentVelocity = idleSpeed;
    metricsRef.current.targetVelocity = idleSpeed;

    const ctx = gsap.context(() => {
      const maxBoost = prefersReducedMotion ? 4 : 12;
      const boostScale = prefersReducedMotion ? 0.03 : 0.08;
      let lastScrollY = window.scrollY;

      const startAnimation = () => {
        const distance = content.offsetHeight;
        const containerHeight = container.offsetHeight;

        if (!distance || !containerHeight) return;

        const nextCopyCount = Math.max(
          2,
          Math.ceil(containerHeight / distance) + 2
        );

        setCopyCount((currentCount) =>
          currentCount === nextCopyCount ? currentCount : nextCopyCount
        );

        metricsRef.current.distance = distance;

        if (metricsRef.current.currentY <= -distance) {
          metricsRef.current.currentY += distance;
        } else if (metricsRef.current.currentY > 0) {
          metricsRef.current.currentY -= distance;
        }

        gsap.set(track, { y: metricsRef.current.currentY });
      };

      /**
       * @param {number} _
       * @param {number} deltaTime
       */
      const tick = (_, deltaTime) => {
        const { distance } = metricsRef.current;

        if (!distance) return;

        const frameFactor = deltaTime / (1000 / 60);

        metricsRef.current.currentVelocity = gsap.utils.interpolate(
          metricsRef.current.currentVelocity,
          metricsRef.current.targetVelocity,
          velocityLerpFactor
        );

        metricsRef.current.currentY +=
          metricsRef.current.currentVelocity * frameFactor;

        if (metricsRef.current.currentY <= -distance) {
          metricsRef.current.currentY += distance;
        } else if (metricsRef.current.currentY >= 0) {
          metricsRef.current.currentY -= distance;
        }

        gsap.set(track, { y: metricsRef.current.currentY });
      };

      /** @param {number} delta */
      const applyScrollMotion = (delta) => {
        if (!delta) return;

        const direction = delta > 0 ? -1 : 1;

        const boost = Math.min(
          maxBoost,
          idleSpeed + Math.pow(Math.abs(delta), 1.2) * boostScale
        );

        metricsRef.current.lastScrollDirection = direction;
        metricsRef.current.targetVelocity = direction * boost;

        window.clearTimeout(scrollTimeoutRef.current ?? undefined);

        scrollTimeoutRef.current = window.setTimeout(() => {
          metricsRef.current.targetVelocity =
            metricsRef.current.lastScrollDirection * idleSpeed;
        }, 120);
      };

      /** @param {WheelEvent} event */
      const handleWheel = (event) => {
        applyScrollMotion(event.deltaY);
      };

      const handleScroll = () => {
        const nextScrollY = window.scrollY;
        const delta = nextScrollY - lastScrollY;

        lastScrollY = nextScrollY;

        applyScrollMotion(delta);
      };

      startAnimation();

      gsap.ticker.add(tick);

      const resizeObserver = new ResizeObserver(startAnimation);

      resizeObserver.observe(content);
      resizeObserver.observe(container);

      window.addEventListener("resize", startAnimation);
      window.addEventListener("wheel", handleWheel, {
        passive: true,
      });

      window.addEventListener("scroll", handleScroll, {
        passive: true,
      });

      return () => {
        resizeObserver.disconnect();

        window.removeEventListener("resize", startAnimation);
        window.removeEventListener("wheel", handleWheel);
        window.removeEventListener("scroll", handleScroll);

        window.clearTimeout(scrollTimeoutRef.current ?? undefined);

        gsap.ticker.remove(tick);
      };
    });

    return () => ctx.revert();
  }, []);

  const revealMask = isMobile
    ? "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.2) 49%, rgba(0,0,0,1) 49%, rgba(0,0,0,1) 52%, rgba(0,0,0,0.2) 52%, rgba(0,0,0,0.2) 100%)"
    : "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.2) 48%, rgba(0,0,0,1) 48%, rgba(0,0,0,1) 53%, rgba(0,0,0,0.3) 53%, rgba(0,0,0,0.3) 100%)";

  if (!items.length) return null;

  return (
    <div className="flex h-screen">
      <div className="w-[45%] flex max-md:w-[30%] max-[1025px]:w-[35%] items-center justify-end pr-2">
        <p className="max-md:text-xl text-4xl font-extralight leading-none whitespace-nowrap">
          Hyperiux
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative w-[55%] max-[1025px]:w-[65%] max-md:w-[70%] h-full overflow-hidden "
        style={{
          maskImage: revealMask,
          WebkitMaskImage: revealMask,
        }}
      >
        <div
          ref={trackRef}
          className="absolute left-0 top-0 flex flex-col max-md:text-xl text-4xl font-extralight leading-none"
        >
          {Array.from({ length: copyCount }, (_, copyIndex) => (
            <div
              key={copyIndex}
              ref={copyIndex === 0 ? contentRef : null}
              className="flex flex-col"
              aria-hidden={copyIndex === 1}
            >
              {items.map((text, i) => (
                <div
  key={`${copyIndex}-${i}`}
  className="
    py-1
    pl-2
    whitespace-nowrap
    max-[1025px]:whitespace-normal
    max-[1025px]:wrap-break-word
    max-md:pr-3
    max-[1025px]:max-w-full
  "
>
                  {text}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
