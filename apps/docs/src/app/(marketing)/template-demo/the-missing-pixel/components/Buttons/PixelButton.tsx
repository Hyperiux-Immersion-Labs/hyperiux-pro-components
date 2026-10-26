// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, type MouseEvent } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import { useMagnetic } from "../Animations/useMagnetic";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import { ArrowUpRight } from "./icons";

gsap.registerPlugin(useGSAP);

type Variant = "primary" | "outline";
type Tone = "light" | "dark" | "media";
type Size = "md" | "sm";

type PixelButtonProps = {
  label: string;
  href?: string;
  variant?: Variant;
  tone?: Tone;
  size?: Size;
  icon?: boolean;
  magnetic?: number;
  className?: string;
  type?: "button" | "submit";
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

const SIZE_CLASSES: Record<Size, string> = {
  md: "h-[5.8vh] px-[2vw] text-22 max-lg:h-[5.6vh] max-lg:px-[4vw] max-md:h-[6.4vh] max-md:px-[4.6vw]",
  sm: "h-[5vh] px-[1.7vw] text-22 max-lg:h-[5.2vh] max-lg:px-[3.6vw] max-md:h-[5.8vh] max-md:px-[6.3vw]",
};

const BASE_CLASSES: Record<Tone, Record<Variant, string>> = {
  light: {
    primary: "border-transparent bg-(--mpx-ink) text-(color:--mpx-paper)",
    outline: "border-(--mpx-ink)/30 text-(color:--mpx-ink)",
  },
  dark: {
    primary: "border-transparent bg-(--mpx-paper) text-(color:--mpx-ink)",
    outline: "border-(--mpx-white)/15 text-(color:--mpx-paper)",
  },
  media: {
    primary: "border-transparent bg-(--mpx-paper) text-(color:--mpx-ink)",
    outline: "border-(--mpx-white)/50 text-(color:--mpx-white)",
  },
};

const HOVER_TEXT: Record<Tone, Record<Variant, string>> = {
  light: { primary: "#0a0a0a", outline: "#0a0a0a" },
  dark: { primary: "#0a0a0a", outline: "#0a0a0a" },
  media: { primary: "#0a0a0a", outline: "#0a0a0a" },
};

const REST_TEXT: Record<Tone, Record<Variant, string>> = {
  light: { primary: "#f5f5f5", outline: "#0a0a0a" },
  dark: { primary: "#0a0a0a", outline: "#f5f5f5" },
  media: { primary: "#0a0a0a", outline: "#ffffff" },
};

const FILL_CLASSES: Record<Tone, Record<Variant, string>> = {
  light: { primary: "bg-mpx-grad", outline: "bg-mpx-grad" },
  dark: { primary: "bg-mpx-grad", outline: "bg-mpx-grad" },
  media: { primary: "bg-mpx-grad", outline: "bg-mpx-grad" },
};

// Light buttons keep their border; the others lose it while hovered
const BORDER_FADE = "transition-[border-color] duration-500 ease-out motion-reduce:transition-none";
const BORDER_HIDE: Record<Tone, string> = {
  light: "",
  dark: `${BORDER_FADE} data-[hover]:border-transparent`,
  media: `${BORDER_FADE} data-[hover]:border-transparent`,
};

const CURVED = "50% 50% 0 0 / 60% 60% 0 0";
const FLAT = "0% 0% 0 0 / 0% 0% 0 0";

const PixelButton = ({
  label,
  href,
  variant = "primary",
  tone = "light",
  size = "md",
  icon = false,
  magnetic = 0.3,
  className = "",
  type = "button",
  onClick,
}: PixelButtonProps) => {
  const ref = useRef<HTMLElement | null>(null);
  const fillRef = useRef<HTMLSpanElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const trackRef = useRef<HTMLSpanElement | null>(null);
  const lenis = useLenis();
  useMagnetic(ref, magnetic);

  useGSAP(() => {
    const el = ref.current;
    const fill = fillRef.current;
    if (!el || !fill) return;
    gsap.set(fill, { yPercent: 2, borderRadius: CURVED });
    // The second arrow waits off to the bottom-left, ready to slide in on hover
    const arrows = trackRef.current?.querySelectorAll<SVGElement>("[data-arrow]");
    if (arrows && arrows.length === 2) gsap.set(arrows[1], { xPercent: -100, yPercent: 100 });
    // The tone can change under the button (the header's turns dark while the menu is
    // open): drop any colour a hover left inline, so the new tone's classes apply
    gsap.killTweensOf(el, "color");
    gsap.set(el, { clearProps: "color" });
  }, [tone, variant, label]);

  // Hover in and out are each their own tween from wherever things are now, both with
  // ease-out curves. Out used to be the hover timeline reversed, which runs its
  // ease-outs backwards - slow to start, then a sudden stop at rest.
  const animate = (hovered: boolean) => {
    const el = ref.current;
    const fill = fillRef.current;
    const text = textRef.current;
    if (!el || !fill || !text) return;

    const instant = prefersReducedMotion();
    // The border fades in CSS (see BORDER_FADE): the outline tones' border colour is
    // Tailwind's color-mix(), which the browser reports as oklab() - GSAP can't read
    // that, so tweening it flashed through yellow and orange on the way back
    el.toggleAttribute("data-hover", hovered);
    const time = (seconds: number) => (instant ? 0 : seconds);

    gsap.to(fill, {
      yPercent: hovered ? -100 : 2,
      borderRadius: hovered ? FLAT : CURVED,
      duration: time(hovered ? 0.6 : 0.7),
      ease: "power3.out",
      overwrite: "auto",
    });
    gsap.to(el, {
      color: hovered ? HOVER_TEXT[tone][variant] : REST_TEXT[tone][variant],
      duration: time(0.5),
      ease: "power3.out",
      overwrite: "auto",
      // Back at rest the tone's classes take over again (they show the same colours)
      onComplete: hovered ? undefined : () => gsap.set(el, { clearProps: "color" }),
    });
    gsap.to(text.querySelectorAll<HTMLElement>("[data-char]"), {
      yPercent: hovered ? -100 : 0,
      duration: time(0.6),
      ease: "expo.out",
      stagger: instant ? 0 : 0.012,
      overwrite: "auto",
    });

    const arrows = trackRef.current?.querySelectorAll<SVGElement>("[data-arrow]");
    if (arrows && arrows.length === 2) {
      gsap.to(arrows[0], { xPercent: hovered ? 100 : 0, yPercent: hovered ? -100 : 0, duration: time(0.5), ease: "expo.out", overwrite: "auto" });
      gsap.to(arrows[1], { xPercent: hovered ? 0 : -100, yPercent: hovered ? 0 : 100, duration: time(0.5), ease: "expo.out", overwrite: "auto" });
    }
  };

  const play = () => animate(true);
  const reverse = () => animate(false);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || !href || !href.startsWith("#") || href.length < 2) return;
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;
    event.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.5 });
    else target.scrollIntoView({ behavior: "smooth" });
  };

  const classes = `relative isolate inline-flex shrink-0 items-center justify-center gap-3 overflow-hidden max-lg:gap-2 whitespace-nowrap rounded-full border font-mpx-head font-medium leading-none ${SIZE_CLASSES[size]} ${BASE_CLASSES[tone][variant]} ${BORDER_HIDE[tone]} ${className}`.trim();

  const content = (
    <>
      <span
        ref={fillRef}
        aria-hidden
        className={`absolute -inset-px -z-10 translate-y-full ${FILL_CLASSES[tone][variant]}`}
      />
      <span
        ref={textRef}
        aria-hidden
        className="relative inline-block overflow-hidden align-middle leading-[1.3]"
      >
        {[...label].map((char, index) => (
          <span
            key={index}
            data-char
            data-label={char === " " ? "\u00a0" : char}
            className="relative inline-block after:absolute after:left-0 after:top-full after:content-[attr(data-label)]"
          >
            {char === " " ? " " : char}
          </span>
        ))}
      </span>
      {icon && (
        <span aria-hidden className="relative inline-flex size-[1.2vw] shrink-0 overflow-hidden max-lg:size-[3vw] max-md:size-[4.6vw]">
          <span ref={trackRef} className="relative block size-full">
            <ArrowUpRight data-arrow className="absolute inset-0 size-full" />
            <ArrowUpRight data-arrow className="absolute inset-0 size-full" />
          </span>
        </span>
      )}
    </>
  );

  const events = {
    onMouseEnter: play,
    onMouseLeave: reverse,
    onFocus: play,
    onBlur: reverse,
    onClick: handleClick,
    "aria-label": label,
  };

  if (!href) {
    return (
      <button
        ref={(el) => {
          ref.current = el;
        }}
        type={type}
        className={classes}
        {...events}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      ref={(el) => {
        ref.current = el;
      }}
      href={href}
      className={classes}
      {...events}
    >
      {content}
    </Link>
  );
};

export default PixelButton;
