// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitText from "gsap/SplitText";

const TEXT_REVEAL_STYLE_PREFIX = "lumera-tfa-style-";
const SPLIT_CHARACTER_SELECTOR = ".split-chars";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

interface TextFillAnimationSectionProps {
  text?: string;
  id?: string;
}

export default function TextFillAnimationSection({
  text = "Life above the City, Where Every Moment is Framed by Sweeping Skyline Views and Natural Light.",
  id = "lumera-text-fill-animation",
}: TextFillAnimationSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const textRef = useRef<HTMLHeadingElement | null>(null);
  const splitRef = useRef<SplitText | null>(null);

  useEffect(() => {
    const styleId = `${TEXT_REVEAL_STYLE_PREFIX}${id}`;
    const styleElement = document.createElement("style");

    styleElement.id = styleId;
    styleElement.textContent = `
      @keyframes lumera-color-transition-${id} {
        0% { color: rgba(28, 27, 26, 0.18); }
        30% { color: rgba(28, 27, 26, 0.7); }
        100% { color: #1c1b1a; }
      }

      #${id} .split__wrapper ${SPLIT_CHARACTER_SELECTOR} {
        transition: color .4s;
        color: rgba(28, 27, 26, 0.18);
      }

      #${id} .split__wrapper ${SPLIT_CHARACTER_SELECTOR}.show {
        animation: lumera-color-transition-${id} .5s;
        color: #1c1b1a;
      }
    `;

    document.head.appendChild(styleElement);

    const context = gsap.context(() => {
      const textElement = textRef.current;

      if (!textElement) {
        return;
      }

      const split = SplitText.create(textElement, {
        type: "words chars",
        aria: false as never,
        tag: "span",
        charsClass: "split-chars",
      });
      splitRef.current = split;

      gsap.set(textElement, { opacity: 1 });

      const characters = Array.from(
        textElement.querySelectorAll(SPLIT_CHARACTER_SELECTOR),
      );

      const prefersReducedMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) {
        gsap.set(characters, { className: "split-chars show" });
      } else {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.3,
            },
          })
          .to(
            characters,
            {
              className: "split-chars show",
              duration: 0.4,
              stagger: 0.04,
              ease: "power2.inOut",
            },
            0,
          );
      }
    }, sectionRef);

    return () => {
      context.revert();
      splitRef.current?.revert();
      splitRef.current = null;
      document.getElementById(styleId)?.remove();
    };
  }, [id]);

  return (
    <section
      id={id}
      ref={sectionRef}
      className="relative h-[220vh] w-full bg-[#f5f1eb]"
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-[5%]">
        <div className="split__wrapper relative z-10 mx-auto w-full max-w-[85%]">
          <h2
            ref={textRef}
            className=" text-center text-[3.9vw]  leading-[1.3] font-medium text-[#1c1b1a] opacity-0 max-[1025px]:text-[5vw] max-md:text-[8.5vw] max-[1025px]:leading-[1.08] "
          >
            {text}
          </h2>
        </div>
      </div>
    </section>
  );
}
