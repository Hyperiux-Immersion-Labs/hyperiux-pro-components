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

export const INTRO_DELAY = 1.1;
export const PAGE_DELAY = 0.5;

const FONT_WAIT_CAP = 800;
const ENTER_MARGIN = "0px 0px -8% 0px";

const onEnter = (
  el: Element,
  callback: () => void,
  rootMargin = ENTER_MARGIN,
) => {
  const rect = el.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    callback();
    return () => {};
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      callback();
    },
    { rootMargin },
  );
  observer.observe(el);
  return () => observer.disconnect();
};

const whenFontsReady = (callback: () => void) => {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    window.clearTimeout(timer);
    callback();
  };
  const timer = window.setTimeout(run, FONT_WAIT_CAP);
  if (document.fonts) document.fonts.ready.then(run, run);
  else run();
  return () => {
    done = true;
    window.clearTimeout(timer);
  };
};

type FadeUpProps<T extends ElementType> = {
  as?: T;
  children?: ReactNode;
  className?: string;
  delay?: number;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function FadeUp<T extends ElementType = "div">({
  as,
  children,
  className = "",
  delay = 0,
  ...props
}: FadeUpProps<T>) {
  const Tag = (as ?? "div") as any;
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1 });
      return;
    }

    gsap.set(el, { y: 24 });

    return onEnter(el, () => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        delay,
        ease: "power3.out",
        onComplete: () => {
          el.style.removeProperty("opacity");
          el.classList.remove("opacity-0");
        },
      });
    });
  }, []);

  return (
    <Tag ref={ref} className={`opacity-0 ${className}`.trim()} {...props}>
      {children}
    </Tag>
  );
}

type RuleDrawProps = {
  className?: string;
  delay?: number;
  syncWithFade?: boolean;
};

export function RuleDraw({ className = "", delay = 0, syncWithFade = false }: RuleDrawProps) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { scaleX: 1 });
      return;
    }

    if (syncWithFade) {
      gsap.set(el, { scaleX: 0, transformOrigin: "left" });

      return onEnter(el.parentElement ?? el, () => {
        gsap.to(el, {
          scaleX: 1,
          duration: 0.8,
          delay,
          ease: "power2.out",
        });
      });
    }

    const tween = gsap.fromTo(
      el,
      { scaleX: 0 },
      {
        scaleX: 1,
        transformOrigin: "left",
        duration: 0.8,
        delay,
        ease: "power2.out",
        scrollTrigger: { trigger: el.parentElement ?? el, start: "top 65%", once: true },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden
      className={`block origin-left [transform:scaleX(0)] ${className}`.trim()}
    />
  );
}

type MaskRevealProps<T extends ElementType> = {
  as?: T;
  children?: ReactNode;
  className?: string;
  delay?: number;
  scrub?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function MaskReveal<T extends ElementType = "h2">({
  as,
  children,
  className = "",
  delay = 0,
  scrub = false,
  ...props
}: MaskRevealProps<T>) {
  const Tag = (as ?? "h2") as any;
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1 });
      return;
    }

    if (el.dataset.mpxReveal) return;
    el.dataset.mpxReveal = "";

    let split: SplitText | null = null;
    let tween: gsap.core.Tween | null = null;

    const stopWaiting = whenFontsReady(() => {
      if (!ref.current) return;

      split = SplitText.create(el, {
        type: "lines",
        linesClass: "mpx-mask-line",
        aria: "auto",
      });
      const lines = split.lines as HTMLElement[];

      gsap.set(el, { opacity: 1 });
      gsap.set(lines, { maskPosition: "100% 100%", webkitMaskPosition: "100% 100%" });

      tween = gsap.to(lines, {
        maskPosition: "0% 100%",
        webkitMaskPosition: "0% 100%",
        duration: scrub ? 1 : 3.4,
        stagger: scrub ? 0.3 : 0.2,
        delay: scrub ? 0 : delay,
        ease: scrub ? "none" : "power3.out",
        scrollTrigger: scrub
          ? { trigger: el, start: "top 85%", end: "bottom 40%", scrub: true }
          : { trigger: el, start: "top 88%", once: true },
        onComplete: scrub
          ? undefined
          : () => {
              lines.forEach((line) => {
                line.classList.remove("mpx-mask-line");
                line.style.removeProperty("mask-position");
                line.style.removeProperty("-webkit-mask-position");
              });
            },
      });
    });

    return () => {
      window.setTimeout(() => {
        if (el.isConnected) return;
        stopWaiting();
        tween?.scrollTrigger?.kill();
        tween?.kill();
        split?.revert();
      }, 0);
    };
  }, []);

  return (
    <Tag ref={ref} className={`opacity-0 ${className}`.trim()} {...props}>
      {children}
    </Tag>
  );
}

type LineRevealProps<T extends ElementType> = {
  as?: T;
  children?: ReactNode;
  className?: string;
  delay?: number;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function LineReveal<T extends ElementType = "p">({
  as,
  children,
  className = "",
  delay = 0,
  ...props
}: LineRevealProps<T>) {
  const Tag = (as ?? "p") as any;
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1 });
      return;
    }

    if (el.dataset.mpxReveal) return;
    el.dataset.mpxReveal = "";

    let split: SplitText | null = null;
    let tween: gsap.core.Tween | null = null;

    const stopWaiting = whenFontsReady(() => {
      if (!ref.current) return;

      split = SplitText.create(el, { type: "lines", mask: "lines", aria: "auto" });

      gsap.set(el, { opacity: 1 });
      gsap.set(split.lines, { yPercent: 110 });

      tween = gsap.to(split.lines, {
        yPercent: 0,
        duration: 1.2,
        stagger: 0.1,
        delay,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    });

    return () => {
      window.setTimeout(() => {
        if (el.isConnected) return;
        stopWaiting();
        tween?.scrollTrigger?.kill();
        tween?.kill();
        split?.revert();
      }, 0);
    };
  }, []);

  return (
    <Tag ref={ref} className={`opacity-0 ${className}`.trim()} {...props}>
      {children}
    </Tag>
  );
}

type MediaRevealProps = {
  children?: ReactNode;
  className?: string;
  innerClassName?: string;
  zoom?: boolean;
};

export function MediaReveal({
  children,
  className = "",
  innerClassName = "",
  zoom = true,
}: MediaRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    const el = ref.current;
    const inner = innerRef.current;
    if (!el || !inner) return;

    if (prefersReducedMotion()) return;

    gsap.set(el, { clipPath: "inset(100% 0% 0% 0%)" });
    if (zoom) gsap.set(inner, { scale: 1.2 });

    const watched = el.parentElement ?? el;

    return onEnter(watched, () => {
      gsap.to(el, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.3,
        ease: "power3.inOut",
        onComplete: () => gsap.set(el, { clearProps: "clipPath" }),
      });
      if (zoom) {
        gsap.to(inner, { scale: 1, duration: 1.6, ease: "power3.out" });
      }
    });
  }, []);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`.trim()}>
      <div ref={innerRef} className={`h-full w-full ${innerClassName}`.trim()}>
        {children}
      </div>
    </div>
  );
}

const ODOMETER_CELL = "overflow-hidden leading-[1.1] h-[3.7vw] w-[2vw] max-lg:h-[6.6vw] max-lg:w-[3.4vw] max-md:h-[11.6vw] max-md:w-[6.2vw]";
const ODOMETER_ROW = "leading-[1.1] h-[3.7vw] max-lg:h-[6.6vw] max-md:h-[11.6vw]";

type OdometerProps = {
  value: string;
  className?: string;
  cellClassName?: string;
  rowClassName?: string;
};

export function Odometer({
  value,
  className = "",
  cellClassName = ODOMETER_CELL,
  rowClassName = ODOMETER_ROW,
}: OdometerProps) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    const strips = Array.from(el.querySelectorAll<HTMLElement>("[data-odo-strip]"));

    if (prefersReducedMotion()) {
      strips.forEach((strip) => {
        gsap.set(strip, { yPercent: -Number(strip.dataset.digit) * 10 });
      });
      return;
    }

    return onEnter(
      el,
      () => {
        strips.forEach((strip, index) => {
          gsap.to(strip, {
            yPercent: -Number(strip.dataset.digit) * 10,
            duration: 2,
            delay: index * 0.1,
            ease: "power1.out",
          });
        });
      },
      "0px 0px -15% 0px",
    );
  }, []);

  return (
    <span ref={ref} aria-label={value} className={`inline-flex items-baseline ${className}`.trim()}>
      {[...value].map((char, index) =>
        /\d/.test(char) ? (
          <span
            key={index}
            aria-hidden
            className={`inline-block text-center ${cellClassName}`}
          >
            <span data-odo-strip data-digit={char} className="flex flex-col will-change-transform">
              {Array.from({ length: 10 }, (_, digit) => (
                <span key={digit} className={`block ${rowClassName}`}>
                  {digit}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span key={index} aria-hidden>
            {char}
          </span>
        ),
      )}
    </span>
  );
}
