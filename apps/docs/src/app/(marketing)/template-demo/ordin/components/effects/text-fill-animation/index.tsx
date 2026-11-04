// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

type TextFillAnimationProps = {
  children: ReactNode;
  textColor?: string;
  primaryColor?: string;
  accentColor?: string;
  dimColor?: string;
  className?: string;
  sectionClassName?: string;
  innerClassName?: string;
  duration?: number;
  stagger?: number;
  fillWidth?: number;
  start?: string;
} & Record<`data-${string}`, string | boolean | undefined>;

export default function TextFillAnimation({
  children,
  textColor = "#eceefb",
  primaryColor = "#3d4dff",
  accentColor = primaryColor,
  dimColor = "#1b2150",
  className = "",
  sectionClassName = "",
  innerClassName = "",
  duration = 0.4,
  stagger = 0.05,
  fillWidth = 1,
  start = "top top",
  ...dataProps
}: TextFillAnimationProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const id = `tfa-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    const band = Math.max(0.1, fillWidth) * 0.5;
    const style = document.createElement("style");
    style.textContent = `
      @keyframes ${id}-fill { 0% { color: ${dimColor}; } 30% { color: ${primaryColor}; } 100% { color: ${textColor}; } }
      #${id} .tfa-char { transition: color ${band * 0.8}s; color: ${dimColor}; }
      #${id} .tfa-char.show { animation: ${id}-fill ${band}s; color: ${textColor}; }
      @keyframes ${id}-accent { 0% { color: ${dimColor}; } 100% { color: ${accentColor}; } }
      #${id} .tfa-accent .tfa-char.show { animation: ${id}-accent ${band}s; color: ${accentColor}; }
    `;
    document.head.appendChild(style);

    const ctx = gsap.context(() => {
      const el = textRef.current;
      if (!el) return;
      const split = SplitText.create(el, { type: "words,chars", charsClass: "tfa-char", tag: "span" });
      const chars = split.chars;
      gsap.set(el, { opacity: 1 });

      if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
        gsap.set(chars, { className: "tfa-char show" });
        return () => split.revert();
      }

      gsap
        .timeline({
          scrollTrigger: { trigger: sectionRef.current, start, end: "bottom bottom", scrub: 0.25 },
        })
        .to(chars, { className: "tfa-char show", duration, stagger, ease: "power2.inOut" }, 0);

      return () => split.revert();
    });

    return () => {
      ctx.revert();
      style.remove();
    };
  }, [id, dimColor, primaryColor, accentColor, textColor, duration, stagger, fillWidth, start]);

  return (
    <section id={id} ref={sectionRef} className={`relative ${sectionClassName}`} {...dataProps}>
      <div className={`sticky top-0 flex h-screen items-center ${innerClassName}`}>
        <p ref={textRef} className={`opacity-0 ${className}`}>
          {children}
        </p>
      </div>
    </section>
  );
}
