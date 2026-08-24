"use client"
import Image, { type StaticImageData } from "next/image";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import Testimonial1 from "./assets/testimonial-1.png";
import Testimonial2 from "./assets/testimonial-2.png";
import Testimonial3 from "./assets/testimonial-3.png";
import Testimonial4 from "./assets/testimonial-4.png";
import Testimonial5 from "./assets/testimonial-5.png";

gsap.registerPlugin(SplitText);

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  image: StaticImageData;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "Working with Elena completely transformed our brand's digital presence. Our conversions jumped by 87%. Her thoughtful design approach and seamless communication made the collaboration effortless. Elena doesn't just design websites, she gives your entire brand a confident new voice.",
    name: "Maria Jones",
    role: "Head of Marketing, Adobe",
    image: Testimonial1,
  },
  {
    quote:
      "Elena has an incredible eye for detail. She took a rough brand brief and turned it into a site that finally feels like us. Every scroll, every hover - it all just clicks, and our team barely had to explain what we wanted twice.",
    name: "Marcus Reed",
    role: "Founder, Northline Studio",
    image: Testimonial5,
  },
  {
    quote:
      "We came in with a tight deadline and a messy set of assets. Elena organized everything, proposed a direction we hadn't considered, and shipped a site that outperformed every launch benchmark we set for the quarter.",
    name: "Priya Nair",
    role: "VP Growth, Fielder",
    image: Testimonial3,
  },
  {
    quote:
      "The best part of working with Elena wasn't even the final product - it was how clearly she communicated trade-offs along the way. We always knew why a decision was made, and the result speaks for itself.",
    name: "Daniel Ortiz",
    role: "Creative Director, Wolfframe",
    image: Testimonial4,
  },
  {
    quote:
      "Our old site felt like a brochure. What Elena built feels like a product. Session time is up, bounce rate is down, and for the first time our design and our positioning actually agree with each other.",
    name: "Hannah Kim",
    role: "CEO, Loop & Co",
    image: Testimonial2,
  },
];

const DIMMED_BRIGHTNESS = 0.4;

const Testimonials = () => {
  const [index, setIndex] = useState(0);

  const total = testimonials.length;
  const displayItem = testimonials[index];

  const quoteRef = useRef<HTMLParagraphElement | null>(null);
  const nameRef = useRef<HTMLParagraphElement | null>(null);
  const roleRef = useRef<HTMLParagraphElement | null>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const splitRef = useRef<any>(null);
  const isAnimatingRef = useRef(false);
  const directionRef = useRef<"next" | "prev">("next");
  const prevIndexRef = useRef<number | null>(null);
  const isFirstRenderRef = useRef(true);
  const zIndexRef = useRef(1);

  const reduceMotionRef = useRef(
    typeof window !== "undefined" &&
      (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false)
  );

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const onChange = (event: MediaQueryListEvent) => {
      reduceMotionRef.current = event.matches;
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // Stack every image on top of each other. Under full motion, only the
  // active one is revealed via clip-path (rest clipped away from the
  // bottom until it's their turn). Under reduced motion, clip-path is
  // skipped entirely - every image sits fully unclipped and visibility
  // is driven by opacity alone, so transitions read as a plain crossfade.
  useEffect(() => {
    imageRefs.current.forEach((el, i) => {
      if (!el) return;
      if (reduceMotionRef.current) {
        gsap.set(el, {
          clipPath: "inset(0% 0% 0% 0%)",
          opacity: i === 0 ? 1 : 0,
          filter: "brightness(1)",
          zIndex: i === 0 ? 1 : 0,
        });
      } else {
        gsap.set(el, {
          clipPath: i === 0 ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
          filter: "brightness(1)",
          zIndex: i === 0 ? 1 : 0,
        });
      }
    });
  }, []);

  // Reduced motion: a plain opacity crossfade, no clip-path wipe at all.
  // Full motion: the outgoing image stays put and just dims (not clipped
  // away); the incoming image is raised above everything else and wipes
  // in over it via a clip-path reveal from the bottom.
  const animateImage = useCallback((nextIndex: number, prevIndex: number) => {
    const nextEl = imageRefs.current[nextIndex];
    const prevEl = imageRefs.current[prevIndex];

    if (reduceMotionRef.current) {
      const duration = 0.35;
      if (prevEl) {
        gsap.to(prevEl, { opacity: 0, duration, ease: "power2.out" });
      }
      if (!nextEl) return;
      zIndexRef.current += 1;
      gsap.set(nextEl, { opacity: 0, zIndex: zIndexRef.current });
      gsap.to(nextEl, { opacity: 1, duration, ease: "power2.out" });
      return;
    }

    const duration = 1.1;

    if (prevEl) {
      gsap.to(prevEl, {
        filter: `brightness(${DIMMED_BRIGHTNESS})`,
        duration,
        ease: "power2.out",
      });
    }

    if (!nextEl) return;

    zIndexRef.current += 1;
    gsap.set(nextEl, {
      clipPath: "inset(0% 0% 100% 0%)",
      filter: "brightness(1)",
      zIndex: zIndexRef.current,
    });
    gsap.to(nextEl, {
      clipPath: "inset(0% 0% 0% 0%)",
      duration,
      ease: "power3.inOut",
    });
  }, []);

  const animateText = useCallback(
    (direction: "next" | "prev", onComplete?: () => void) => {
      if (splitRef.current) {
        splitRef.current.revert();
        splitRef.current = null;
      }

      const meta = [nameRef.current, roleRef.current];

      if (reduceMotionRef.current || !quoteRef.current) {
        gsap.set(quoteRef.current, { autoAlpha: 1 });
        gsap.fromTo(
          meta,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.4, ease: "power2.out", stagger: 0.08, onComplete }
        );
        return;
      }

      const yFrom = direction === "next" ? 100 : -100;

      gsap.set(quoteRef.current, { autoAlpha: 1 });

      // `mask: "lines"` wraps each line in its own overflow-hidden mask so
      // lines can slide in/out without leaking outside their row.
      splitRef.current = new SplitText(quoteRef.current, {
        type: "lines",
        mask: "lines",
        linesClass: "split-line",
      });

      const lines = splitRef.current.lines;

      gsap.set(lines, { yPercent: yFrom });
      gsap.set(meta, { autoAlpha: 0, y: yFrom > 0 ? 16 : -16 });

      gsap
        .timeline({ onComplete })
        .to(lines, {
          yPercent: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: {
            each: 0.1,
            from: direction === "next" ? "start" : "end",
          },
        })
        .to(
          meta,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.1,
          },
          "<0.25"
        );
    },
    []
  );

  // Runs the entrance animation only after React has actually committed the
  // new quote/name/role text to the DOM (SplitText needs the real content -
  // splitting synchronously right after setIndex() would still see the
  // stale text, which is why the copy used to appear to "snap" instantly).
  useLayoutEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      animateText("next", () => {
        isAnimatingRef.current = false;
      });
      return;
    }

    const prevIndex = prevIndexRef.current;
    if (prevIndex !== null && prevIndex !== index) {
      animateImage(index, prevIndex);
    }

    animateText(directionRef.current, () => {
      isAnimatingRef.current = false;
    });
  }, [index, animateImage, animateText]);

  const goTo = useCallback(
    (direction: "next" | "prev") => {
      if (isAnimatingRef.current || total <= 1) return;
      isAnimatingRef.current = true;
      directionRef.current = direction;

      gsap.to([quoteRef.current, nameRef.current, roleRef.current], {
        autoAlpha: 0,
        duration: 0.18,
        ease: "power1.in",
        onComplete: () => {
          // Revert SplitText's line/mask DOM *before* React writes the new
          // quote text, so React updates the original (still-attached)
          // text node instead of one SplitText has since detached - doing
          // this after the commit (e.g. inside the entrance animation)
          // makes React's update land on a detached node, which is why the
          // copy used to appear stuck on the old testimonial.
          if (splitRef.current) {
            splitRef.current.revert();
            splitRef.current = null;
          }

          setIndex((prev) => {
            prevIndexRef.current = prev;
            return direction === "next" ? (prev + 1) % total : (prev - 1 + total) % total;
          });
        },
      });
    },
    [total]
  );

  const handlePrev = useCallback(() => goTo("prev"), [goTo]);
  const handleNext = useCallback(() => goTo("next"), [goTo]);

  return (
    <section className="w-screen py-30 px-15 relative z-0 bg-[#070707] max-[1025px]:px-10 max-[1025px]:py-20 max-md:px-5 max-md:py-16">
      <div className="w-full rounded-xl h-[40vw] bg-[#111111] border border-white/8 p-[3vw] max-md:p-8 flex items-center gap-[3vw] max-[1025px]:flex-col max-[1025px]:items-start max-[1025px]:h-[90vw] max-[1025px]:gap-6 max-[1025px]:p-8 max-md:flex-col max-md:gap-8 max-md:h-[180vw]">
        {/* Stacked, clip-path revealed portraits */}
        <div className="relative w-[18vw] h-[24vw]  shrink-0 rounded-lg overflow-hidden bg-[#1c1c1c] max-[1025px]:w-[36vw] max-[1025px]:h-[40vw] max-md:w-full max-md:h-[70vw]">
          {testimonials.map((item, i) => (
            <div
              key={item.name}
              ref={(el) => {
                imageRefs.current[i] = el;
              }}
              className="absolute inset-0"
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="260px"
                className="object-cover object-top"
              />
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col justify-between h-[24vw] min-h-[160px] max-[1025px]:h-auto max-md:h-auto">
          <p
            ref={quoteRef}
            className="text-[1.8vw] max-[1025px]:text-[2.6vw] max-md:text-xl leading-[1.5] text-white/90 max-w-[60vw] max-[1025px]:max-w-full max-md:max-w-full"
          >
            {displayItem.quote}
          </p>

          <div className="flex items-end justify-between mt-8 max-md:mt-6">
            <div className="flex flex-col gap-1 overflow-hidden">
              <p
                ref={nameRef}
                className="text-[2.5vw] max-[1025px]:text-[3.2vw] max-md:text-lg text-[#ff6b00]"
              >
                {displayItem.name}
              </p>
              <p
                ref={roleRef}
                className="text-[1.25vw] max-[1025px]:text-[2.2vw] max-md:text-sm text-white"
              >
                {displayItem.role}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous testimonial"
                className="size-12 rounded-full border border-white/20 flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer relative group overflow-hidden"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="relative z-2">
                  <path
                    d="M19 12H5M5 12L12 19M5 12L12 5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="absolute inset-0 w-full h-full bg-linear-to-r from-[#F16B0D] to-[#E61416] group-hover:opacity-100 opacity-0 duration-300"/>


              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next testimonial"
                className="size-12 rounded-full border border-white/20 flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer relative group overflow-hidden"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="relative z-2">
                  <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="absolute inset-0 w-full h-full bg-linear-to-r from-[#F16B0D] to-[#E61416] group-hover:opacity-100 opacity-0 duration-300"/>

              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
