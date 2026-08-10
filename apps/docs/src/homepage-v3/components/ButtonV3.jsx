"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";

const SCRAMBLE_GLYPHS = "$#&*@!_-./|<>0123456789";
const PRE_HOLD_MS = 60;
const REVEAL_DURATION_MS = 300;
const FLASH_MS = 90;
const GLYPH_SWAP_MS = 50;

function ScrambleLabel({ text, active }) {
  const charsRef = useRef([]);

  useEffect(() => {
    const chars = charsRef.current.slice(0, text.length).filter(Boolean);
    if (!chars.length) return;

    const settle = () => {
      chars.forEach((node, index) => {
        node.textContent = text[index];
        node.style.color = "";
      });
    };

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!active || prefersReducedMotion) {
      settle();
      return;
    }

    const start = performance.now();
    let previous = start;
    let frame = 0;

    const tick = (now) => {
      const elapsed = now - start;
      const swapChance = (now - previous) / GLYPH_SWAP_MS;

      previous = now;

      let running = false;

      chars.forEach((node, index) => {
        const revealAt =
          PRE_HOLD_MS + ((index + 1) / chars.length) * REVEAL_DURATION_MS;
        const final = text[index];

        if (elapsed < revealAt) {
          running = true;
          node.style.color = "var(--btn-pre)";

          if (final !== " " && Math.random() < swapChance) {
            node.textContent =
              SCRAMBLE_GLYPHS[
                Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)
              ];
          }

          return;
        }

        node.textContent = final;

        if (elapsed - revealAt < FLASH_MS) {
          running = true;
          node.style.color = "var(--btn-flash)";
        } else {
          node.style.color = "";
        }
      });

      if (running) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [active, text]);

  return (
    <span className="relative block">
      <span aria-hidden="true" className="invisible whitespace-pre">
        {text}
      </span>
      <span aria-hidden="true" className="absolute inset-0 whitespace-pre">
        {Array.from(text).map((character, index) => (
          <span
            key={index}
            ref={(node) => {
              charsRef.current[index] = node;
            }}
            className="inline-block transition-colors duration-200 ease-out motion-reduce:transition-none"
          >
            {character}
          </span>
        ))}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}

export default function ButtonV3({
  text = "Install CLI",
  href = "#",
  variant = "orange",
  className = "",
  target_blank = false,
  preventDefault = false,
  disabled = false,
  onClick,
  innerClassName = "",
  children,
  ariaLabel,
  scrollOffset = 0,
}) {
  const lenis = useLenis();
  const [hovered, setHovered] = useState(false);

  const label = children ?? text;

  const handleClick = (event) => {
    if (preventDefault || disabled) {
      event.preventDefault();
    }

    if (disabled) return;

    if (typeof window !== "undefined") {
      const targetUrl = new URL(href, window.location.href);
      const currentUrl = new URL(window.location.href);
      const isSamePageHash =
        targetUrl.origin === currentUrl.origin &&
        targetUrl.pathname === currentUrl.pathname &&
        targetUrl.hash;

      if (isSamePageHash) {
        const target = document.getElementById(
          decodeURIComponent(targetUrl.hash.slice(1))
        );

        if (target) {
          event.preventDefault();
          const resolvedScrollOffset =
            typeof scrollOffset === "function"
              ? scrollOffset(event)
              : scrollOffset;

          const targetTop =
            target.getBoundingClientRect().top +
            window.scrollY -
            resolvedScrollOffset;

          if (lenis) {
            lenis.scrollTo(targetTop, {
              force: true,
            });
          } else {
            window.scrollTo({
              top: targetTop,
              left: 0,
              behavior: "smooth",
            });
          }

          window.history.pushState(null, "", targetUrl.hash);
        }
      }
    }

    onClick?.(event);
  };

  return (
    <Link
      prefetch={false}
      href={href}
      onClick={handleClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      target={target_blank ? "_blank" : undefined}
      rel={target_blank ? "noopener noreferrer" : undefined}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      className={`group relative flex font-neue-haas shrink-0 items-center overflow-hidden text-nowrap px-(--btn-pad) py-[.8vw] text-[1.15vw] tracking-wide transition-colors duration-500 max-md:py-4 max-md:text-[2.2vw] max-sm:py-4 max-sm:text-[4vw] motion-reduce:transition-none [--btn-pad:1.2vw] [--btn-gap:.5vw] [--btn-square:.7vw] [--btn-arrow:1vw] max-md:[--btn-pad:20px] max-md:[--btn-gap:12px] max-md:[--btn-square:8px] max-md:[--btn-arrow:16px] max-sm:[--btn-pad:24px] max-sm:[--btn-gap:14px] max-sm:[--btn-square:8px] max-sm:[--btn-arrow:18px] [--btn-slot:calc(var(--btn-square)+var(--btn-gap))] [--btn-room:max(0px,var(--btn-arrow)+var(--btn-gap)-var(--btn-slot))] [--btn-inset:calc((var(--btn-pad)*1.8+var(--btn-slot)+var(--btn-room)-var(--btn-arrow)-var(--btn-gap))*.5)] [--btn-shift:calc(var(--btn-pad)+var(--btn-slot)-var(--btn-inset))] ${variant === "outline" ? "border border-current/60 bg-background text-white [--btn-flash:var(--primary)] [--btn-pre:#6f6f6f]" : "bg-primary text-black [--btn-flash:#ffffff] [--btn-pre:#ffffff]"} ${disabled ? "pointer-events-none opacity-60" : ""} ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-(--btn-pad) flex items-center"
      >
        <span className="block size-(--btn-square) bg-current transition-transform duration-500 motion-safe:group-hover:-rotate-90 motion-safe:group-hover:translate-x-[calc((100%+var(--btn-pad))*-1.2)]" />
      </span>
      <span
        className={`relative z-10 pl-(--btn-slot) pr-(--btn-room) transition-transform duration-500 motion-safe:group-hover:-translate-x-(--btn-shift) ${innerClassName}`}
      >
        {typeof label === "string" ? (
          <ScrambleLabel text={label} active={hovered} />
        ) : (
          label
        )}
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-(--btn-inset) -translate-y-1/2 size-(--btn-arrow) bg-current [mask-image:url(/homepage-v3/svgs/pixelated-arrow.svg)] mask-center mask-no-repeat mask-contain translate-x-[calc(var(--btn-inset)+100%)] opacity-0 transition-all duration-500 group-hover:opacity-100 motion-safe:group-hover:translate-x-0 motion-reduce:translate-x-0 motion-reduce:transition-none"
      />
    </Link>
  );
}
