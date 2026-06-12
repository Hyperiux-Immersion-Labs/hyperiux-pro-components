"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import Link from "next/link";
import { ArrowUpRightIcon } from "@/utils/Icons";

gsap.registerPlugin(SplitText);

const HOVER_EASE = "power3.inOut";

const VARIANT_STYLES = {
  orange: {
    pill: "bg-primary text-white",
    circle: "bg-primary",
    icon: "text-white",
  },
  black: {
    pill: "bg-black text-white",
    circle: "bg-black",
    icon: "text-white",
  },
  white: {
    pill: "bg-white text-black",
    circle: "bg-white",
    icon: "text-black",
  },
};

export default function Button({
  text = "Install CLI",
  href = "/effects",
  variant = "orange",
  className = "",
  innerClassName = "",
  pillClassName = "",
  circleWrapperClassName = "",
  circleClassName = "",
  iconClassName = "",
  showArrow = true,
}) {
  const linkRef = useRef(null);
  const textRef = useRef(null);
  const cloneRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    const link = linkRef.current;
    const textEl = textRef.current;
    if (!link || !textEl) return;
    const shouldAnimate = !window.matchMedia("(max-width: 639px)").matches;

    if (!shouldAnimate) return;

    let split;
    let splitClone;
    let ctx;

    const init = async () => {
      await document.fonts.ready;

      ctx = gsap.context(() => {
        const cloneEl = document.createElement("span");
        cloneEl.textContent = textEl.textContent;
        cloneEl.setAttribute("aria-hidden", "true");
        cloneEl.className = "absolute inset-0 block";
        cloneRef.current = cloneEl;
        textEl.parentElement?.appendChild(cloneEl);

        split = SplitText.create(textEl, {
          type: "chars",
          charsClass: "inline-block",
        });

        splitClone = SplitText.create(cloneEl, {
          type: "chars",
          charsClass: "inline-block",
        });

        gsap.set(split.chars, { yPercent: 0 });
        gsap.set(splitClone.chars, { yPercent: 100 });

        timelineRef.current = gsap
          .timeline({ paused: true })
          .to(
            split.chars,
            {
              yPercent: -100,
              duration: 0.45,
              stagger: 0.025,
              ease: HOVER_EASE,
            },
            0
          )
          .to(
            splitClone.chars,
            {
              yPercent: 0,
              duration: 0.45,
              stagger: 0.025,
              ease: HOVER_EASE,
            },
            0
          );
      }, link);
    };

    init();

    const onEnter = () => timelineRef.current?.play();
    const onLeave = () => timelineRef.current?.reverse();

    link.addEventListener("mouseenter", onEnter);
    link.addEventListener("mouseleave", onLeave);

    return () => {
      link.removeEventListener("mouseenter", onEnter);
      link.removeEventListener("mouseleave", onLeave);
      timelineRef.current?.kill();
      timelineRef.current = null;
      split?.revert();
      splitClone?.revert();
      cloneRef.current?.remove();
      cloneRef.current = null;
      ctx?.revert();
    };
  }, [text]);

  const styles = VARIANT_STYLES[variant] ?? VARIANT_STYLES.orange;

  return (
    <Link ref={linkRef} href={href} className={`group relative inline-block ${className}`}>
      <div className={`w-full translate-x-0 transition-transform duration-400 group-hover:translate-x-[-1vw] max-sm:group-hover:translate-x-0 ${innerClassName}`}>
        <div className={`relative z-2 rounded-full px-[1.5vw] py-[.5vw] text22 whitespace-nowrap max-md:px-5 max-md:py-2 max-md:text-base max-sm:px-4 max-sm:py-3 max-sm:text-sm ${styles.pill} ${pillClassName}`}>
          <p className="relative overflow-hidden">
            <span ref={textRef} className="block max-sm:text-xl">
              {text}
            </span>
          </p>
        </div>

        {showArrow && (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute left-full top-1/2 ml-[-0.35vw] -translate-y-1/2 max-sm:hidden ${circleWrapperClassName}`}
          >
            <span className={`relative flex size-[2.8vw] min-h-11 min-w-11 origin-left scale-50 translate-x-[-1vw] items-center justify-center rounded-full p-2 transition-all duration-400 ease-out group-hover:scale-100 group-hover:translate-x-0 max-md:size-11 ${styles.circle} ${circleClassName}`}>
              <div className="relative size-full overflow-hidden">
                <span className="absolute left-0 top-0 flex size-full scale-50 items-center justify-center transition-all duration-400 group-hover:scale-100 group-hover:translate-x-0 group-hover:translate-y-0">
                  <ArrowUpRightIcon className={`size-full max-sm:h-10 max-sm:w-10 ${styles.icon} ${iconClassName}`} />
                </span>
              </div>
            </span>
          </span>
        )}
      </div>
    </Link>
  );
}
