"use client";

import Link from "next/link";
import { useLenis } from "lenis/react";
import { BtnArrow } from "../WebsiteComps/Icons";
import { tv } from "tailwind-variants";

const buttonTv = tv({
  base: "group flex overflow-hidden items-center gap-[1vw] max-md:gap-5 max-sm:gap-8 rounded-full px-[1.5vw] py-[.8vw]  max-md:px-6 max-md:py-4 text-nowrap max-sm:px-8 max-sm:py-4 relative text-[1.15vw] font-medium tracking-wide max-md:text-xl max-sm:font-normal transition-all duration-500",
  variants: {
    variant: {
      orange: "bg-primary text-white border border-primary",
      black: "bg-black text-white border border-background",
      white: "bg-white text-black border border-foreground",
      outline: "bg-transparent text-background border border-background",
      outline2: "bg-transparent text-foreground border border-foregound",
    },
  },
  defaultVariants: {
    variant: "orange",
  },
  slots: {
    circle: [
      "duration-500 transition-all rounded-full inline-block",
      "size-[.5vw] max-md:size-2 max-sm:size-2",
    ],
    text: [
      "relative z-10 duration-500 transition-all group-hover:-translate-x-[1.5vw] max-md:group-hover:-translate-x-1.5 max-sm:group-hover:-translate-x-1.5",
    ],
    arrow: [
      "size-[1.6vw] max-md:size-4 max-sm:size-4 absolute mt-[-0.1vw] right-[0.7vw] max-md:right-4 max-sm:right-4 opacity-0 group-hover:opacity-100 duration-500 transition-all inline-block",
    ],
  },
});

export default function Button({
  text = "Install CLI",
  href = "#",
  variant = "orange",
  className = "",
  target_blank = false,
  preventDefault = false,
  disabled = false,
  onClick,
  scaleClass = "group-hover:scale-[70]",
  hoverTextClassName,
  innerClassName = "",
  circleClassName = "",
  arrowClassName = "",
  children,
  ariaLabel,
  scrollOffset = 0,
}) {
  const lenis = useLenis();
  const styles = buttonTv({ variant, className });

  const circleColorClass = variant === "outline" ? "bg-background" : (variant === "white" ? "bg-black" : "bg-white");

  const hoverTextClass =
    hoverTextClassName ||
    (variant === "white" || variant === "outline" ? "group-hover:text-white" : "group-hover:text-black");

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
      target={target_blank ? "_blank" : undefined}
      rel={target_blank ? "noopener noreferrer" : undefined}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      className={`${className} ${styles.base()} ${
        disabled ? "pointer-events-none opacity-60" : ""
      }`}
    >
      <span
        className={`${styles.circle()} ${circleColorClass} ${scaleClass} ${circleClassName}`}
      />

      <p className={`${styles.text()} ${hoverTextClass} ${innerClassName}`}>
        {children ?? text}
      </p>

      <span className={`${styles.arrow()} ${hoverTextClass} ${arrowClassName}`}>
        <BtnArrow />
      </span>
    </Link>
  );
}
