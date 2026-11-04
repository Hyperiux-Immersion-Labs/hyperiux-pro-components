// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import Lines from "./Animations/Lines";
import { lineIn, useReveal } from "./Animations/scene";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import { Arrow } from "./Icons";
import { testimonials } from "../content";

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

const Testimonials = () => {
  const ref = useRef<HTMLElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const busy = useRef(false);
  const items = testimonials.items;
  const t = items[index];

  useReveal(ref, (tl, { q }) => {
    lineIn(tl, q("[data-line]"), 0, 1);
    tl.fromTo(q("[data-quote-mark]"), { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.8 }, 0.2);
    tl.fromTo(q("[data-slide] > *"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.1 }, 0.35);
    tl.fromTo(q("[data-controls]"), { autoAlpha: 0 }, { autoAlpha: 1 }, 0.8);
    tl.fromTo(q("[data-tm-wave]"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 2.4, ease: "power2.inOut" }, 0);
  });

  const go = (dir: 1 | -1) => {
    if (busy.current) return;
    const next = (index + dir + items.length) % items.length;
    const el = slideRef.current;
    if (!el || prefersReducedMotion()) {
      setIndex(next);
      return;
    }
    busy.current = true;
    gsap.to(el.children, {
      autoAlpha: 0,
      y: -16 * dir,
      duration: 0.35,
      stagger: 0.04,
      ease: "power2.in",
      onComplete: () => {
        setIndex(next);
        requestAnimationFrame(() => {
          gsap.fromTo(
            el.children,
            { autoAlpha: 0, y: 20 * dir },
            { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "power3.out", onComplete: () => void (busy.current = false) },
          );
        });
      },
    });
  };

  return (
    <section
      ref={ref}
      id="testimonials"
      aria-labelledby="testimonials-title"
      aria-roledescription="carousel"
      data-vey-tone="light"
      className="relative overflow-x-clip bg-vey-paper text-vey-ink"
    >
      <svg aria-hidden viewBox="0 0 1440 700" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
        <path
          strokeLinecap="round"
          data-tm-wave
          d="M640 700 C900 640 1100 520 1180 360 C1250 220 1340 120 1440 80"
          fill="none"
          stroke="#aeb8e8"
          strokeWidth="1.2"
        />
        <path d="M760 700 C1000 650 1180 560 1260 420 C1320 300 1380 230 1440 200 L1440 700 Z" fill="#e8eaf5" fillOpacity="0.55" />
      </svg>

      <div className="relative grid grid-cols-[1fr_2fr] gap-16 vey-container vey-section max-lg:grid-cols-1 max-md:gap-10">
        <div className="flex flex-col justify-between gap-10">
          <Lines id="testimonials-title" lines={testimonials.heading} />
          <div data-controls className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Previous testimonial"
                onClick={() => go(-1)}
                className="flex h-[6vh] aspect-square items-center justify-center rounded-md border border-[#e2e4ec] bg-white text-[#151927] transition-colors duration-300 hover:border-[#151927] max-lg:h-[4.6vh] max-md:h-[6vh]"
              >
                <Arrow className="h-[35%] w-[35%] rotate-180" />
              </button>
              <button
                type="button"
                aria-label="Next testimonial"
                onClick={() => go(1)}
                className="flex h-[6vh] aspect-square items-center justify-center rounded-md bg-[#151927] text-[#f5f6fa] transition-colors duration-300 hover:bg-[#202b4a] max-lg:h-[4.6vh] max-md:h-[6vh]"
              >
                <Arrow className="h-[35%] w-[35%]" />
              </button>
            </div>
            <span className="font-vey-mono text-14 text-vey-slate tabular-nums">
              {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        <figure className="flex flex-col gap-8">
          <span data-quote-mark aria-hidden className="text-128 leading-none text-[#aeb8e8]">
            &ldquo;
          </span>
          <div
            ref={slideRef}
            data-slide
            aria-live="polite"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${items.length}`}
            className="flex flex-col gap-10"
          >
            <blockquote className="text-40 font-medium">{t.quote}</blockquote>
            <figcaption className="flex items-center gap-4">
              <span
                aria-hidden
                className="flex h-[7vh] aspect-square items-center justify-center rounded-md bg-linear-to-br from-[#aeb8e8] to-[#202b4a] text-22 font-medium text-[#f5f6fa] max-lg:h-[5vh] max-md:h-[7vh]"
              >
                {initials(t.name)}
              </span>
              <span className="flex flex-col">
                <span className="text-24 font-medium">{t.name}</span>
                <span className="text-22 text-vey-slate">
                  {t.role}, {t.company}
                </span>
              </span>
            </figcaption>
          </div>
          <div aria-hidden className="flex gap-2">
            {items.map((item, i) => (
              <span
                key={item.name}
                className={`block h-0.5 flex-1 rounded-md transition-colors duration-500 ${i === index ? "bg-[#151927]" : "bg-[#151927]/15"}`}
              />
            ))}
          </div>
        </figure>
      </div>
    </section>
  );
};

export default Testimonials;
