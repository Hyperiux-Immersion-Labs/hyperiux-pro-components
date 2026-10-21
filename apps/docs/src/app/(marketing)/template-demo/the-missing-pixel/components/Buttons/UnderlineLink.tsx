// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import gsap from "gsap";
import { prefersReducedMotion } from "../Animations/reducedMotion";

type UnderlineLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  persistent?: boolean;
  tabIndex?: number;
};

const UnderlineLink = ({
  href,
  children,
  className = "",
  persistent = false,
  tabIndex,
}: UnderlineLinkProps) => {
  const lineRef = useRef<HTMLSpanElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const enter = () => {
    const line = lineRef.current;
    if (!line || prefersReducedMotion()) return;
    timelineRef.current?.kill();

    if (persistent) {
      timelineRef.current = gsap
        .timeline()
        .set(line, { transformOrigin: "100% 50%" })
        .to(line, { scaleX: 0, duration: 0.35, ease: "power3.in" })
        .set(line, { transformOrigin: "0% 50%" })
        .to(line, { scaleX: 1, duration: 0.45, ease: "power3.out" });
      return;
    }

    timelineRef.current = gsap
      .timeline()
      .set(line, { transformOrigin: "0% 50%" })
      .to(line, { scaleX: 1, duration: 0.55, ease: "power3.out" });
  };

  const leave = () => {
    const line = lineRef.current;
    if (!line || persistent || prefersReducedMotion()) return;
    timelineRef.current?.kill();
    timelineRef.current = gsap
      .timeline()
      .set(line, { transformOrigin: "100% 50%" })
      .to(line, { scaleX: 0, duration: 0.45, ease: "power3.out" });
  };

  return (
    <Link
      href={href}
      tabIndex={tabIndex}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onFocus={enter}
      onBlur={leave}
      className={`relative inline-block w-fit py-[0.2vw] max-lg:py-[0.4vw] max-md:py-[0.8vw] ${className}`.trim()}
    >
      {children}
      <span
        ref={lineRef}
        aria-hidden
        className={`absolute bottom-0 left-0 h-px w-full bg-current ${persistent ? "" : "[transform:scaleX(0)]"}`}
      />
    </Link>
  );
};

export default UnderlineLink;
