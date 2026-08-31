// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import {
  useRef,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { prefersReducedMotion } from "./reducedMotion";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

type FadeUpProps<T extends ElementType> = {
  /** Element to render as - defaults to a div. */
  as?: T;
  children?: ReactNode;
  className?: string;
  /** Seconds to hold before starting, for staggering siblings by hand. */
  delay?: number;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

/**
 * Fades its children up into place the first time they scroll into view.
 * Wrap any block that should animate in:
 *
 *   <FadeUp as="h2" className="..." delay={0.1}>Heading</FadeUp>
 */
export function FadeUp<T extends ElementType = "div">({
  as,
  children,
  className = "",
  delay = 0,
  ...props
}: FadeUpProps<T>) {
  const Tag = (as ?? "div") as any;
  const ref = useRef<any>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    // The element ships with `opacity-0` so it cannot flash in before this
    // effect runs; every path out of here is responsible for turning it back
    // on - including reduced motion, or the content would stay invisible.
    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1 });
      return;
    }

    // Opacity stays at 0 (already set by the class); this only adds the offset
    // the tween animates back from.
    gsap.set(el, { y: 24 });

    // An observer rather than a ScrollTrigger: this fires once, needs no
    // refresh bookkeeping, and disconnects itself the moment it has run.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay,
          ease: "power2.out",
        });
        observer.disconnect();
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`opacity-0 ${className}`.trim()} {...props}>
      {children}
    </Tag>
  );
}

export default FadeUp;

type ParaAnimProps<T extends ElementType> = {
  /** Element to render as - defaults to a div. */
  as?: T;
  children?: ReactNode;
  className?: string;
  /** Seconds to hold before starting. Ignored when `scrub` is on. */
  delay?: number;
  /** Tie the reveal to scroll position instead of playing once on enter. */
  scrub?: boolean | number;
  /** Where the trigger fires, as the ScrollTrigger `start` string. */
  top?: string;
  /** Seconds between each line. */
  stagger?: number;
  duration?: number;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

/**
 * Reveals paragraph copy line by line, each line sliding up from behind a mask
 * with a small stagger. Wrap the text itself:
 *
 *   <ParaAnim as="p" className="text-22" delay={0.2}>Long copy…</ParaAnim>
 *   <ParaAnim as="p" scrub>Tied to scroll instead of playing once.</ParaAnim>
 */
export function ParaAnim<T extends ElementType = "div">({
  as,
  children,
  className = "",
  delay = 0,
  scrub = false,
  top = "top 85%",
  stagger = 0.08,
  duration = 0.85,
  ...props
}: ParaAnimProps<T>) {
  const Tag = (as ?? "div") as any;
  const ref = useRef<any>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    // The element ships with `opacity-0` so nothing flashes before the split
    // runs. Everything below is responsible for turning it back on - including
    // the reduced-motion path, or the copy would stay invisible.
    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1 });
      return;
    }

    let split: SplitText | null = null;
    let trigger: ScrollTrigger | null = null;

    // Fonts have to be settled first: splitting before they load measures the
    // fallback face and bakes in line breaks that shift once the real one lands.
    const init = () => {
      if (!ref.current) return;

      split = SplitText.create(el, {
        type: "lines",
        linesClass: "line-wrapper",
        // Clips each line to its own box, so lines rise out of nothing rather
        // than sliding over the surrounding copy.
        mask: "lines",
      });

      const lines = split.lines;
      if (!lines || lines.length === 0) {
        gsap.set(el, { opacity: 1 });
        return;
      }

      gsap.set(el, { opacity: 1 });
      gsap.set(lines, { yPercent: 100 });

      const to = {
        yPercent: 0,
        duration,
        stagger,
        ease: "power3.out",
      };

      if (scrub) {
        gsap.to(lines, {
          ...to,
          scrollTrigger: {
            trigger: el,
            start: top,
            end: "bottom 60%",
            scrub: scrub === true ? true : scrub,
          },
        });
        return;
      }

      trigger = ScrollTrigger.create({
        trigger: el,
        start: top,
        once: true,
        onEnter: () => gsap.to(lines, { ...to, delay }),
      });
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(init);
    } else {
      init();
    }

    return () => {
      trigger?.kill();
      split?.revert();
    };
  }, []);

  return (
    <Tag ref={ref} className={`opacity-0 ${className}`.trim()} {...props}>
      {children}
    </Tag>
  );
}
