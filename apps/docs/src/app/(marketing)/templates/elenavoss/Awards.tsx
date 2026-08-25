"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import portfolio1Img from "./assets/hero-portfolio-1.png";
import portfolio2Img from "./assets/hero-portfolio-2.png";
import portfolio3Img from "./assets/hero-portfolio-3.png";
import portfolio4Img from "./assets/hero-portfolio-4.png";
import OverflowTextReveal from "./effects/overflow-text-reveal";

gsap.registerPlugin(ScrollTrigger);

const AWARD_ITEMS = [
  { title: "Honorable Mention", meta: "2026 - AWWARDS", imgSrc: portfolio1Img },
  { title: "Site of the Day", meta: "2026 - AWWARDS", imgSrc: portfolio2Img },
  {
    title: "The Webby Awards",
    meta: "2026 - OFFICIAL SELECTION",
    imgSrc: portfolio3Img,
  },
  { title: "FWA", meta: "2026 - FWA OF THE DAY", imgSrc: portfolio4Img },
];

// The "pill" container snaps to whichever row is hovered, using its real
// measured position (not a crude cursor-relative offset) - a springy ease
// gives it the snap/settle feel of a physical pill locking onto a tab.
const PILL_SNAP_DURATION = 0.65;
const PILL_SNAP_EASE = "back.out(1.6)";

// Each hovered block's image grows in from its own center (scale 0 -> 1),
// stacking on top of whichever ones came before rather than replacing a
// single shared element - so if you hover quickly, you genuinely see
// multiple images scaling up over one another. Every card keeps its own
// tween untouched when a different one is hovered - nothing gets killed
// or reset - so a still-growing previous image just keeps growing
// underneath the newest one instead of snapping away. Scale-only, no
// opacity - every card stays fully opaque throughout, so the growth
// itself is what's visible the whole time.
//
// Duration matters a lot here: at 0.9s, rapidly hopping across rows
// (each getting maybe 100-150ms of dwell time) meant every interrupted
// card only ever reached ~30-40% scale before the next one covered it -
// none of them ever grew large enough to cover the frame's edges, so
// only a small flickering thumbnail changed in the center while
// everything around it stayed on whatever was last fully grown, well
// before the rapid sequence even started. That reads as "static," not
// smooth. Short duration + a fast-out ease lets each reveal actually
// finish (or get close) even under quick successive hovers.
const IMAGE_REVEAL_DURATION = 0.45;
const IMAGE_REVEAL_EASE = "power2.out";

// How long the whole image-container fades in/out as the cursor
// enters/leaves the row list (.awards-container).
const CONTAINER_FADE_DURATION = 0.4;

const Awards = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Strictly increasing with every reveal, so the most-recently-hovered
  // card is *always* guaranteed a higher z-index than every card before
  // it - two fixed values (like "10"/"20") can tie once more than two
  // cards have been through a cycle, and ties resolve by DOM order
  // rather than recency, which is what caused the old "wrong image on
  // top" glitch. A monotonic counter makes that class of bug impossible.
  const zIndexCounterRef = useRef(AWARD_ITEMS.length);
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotionRef.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    gsap.set(containerRef.current, { y: 0 });
    gsap.set(cardRefs.current, { opacity: 1 });
    cardRefs.current.forEach((card, i) => {
      gsap.set(card, { zIndex: i + 1 });
    });
    gsap.set(cardRefs.current[0], { scale: 1 });
    cardRefs.current.slice(1).forEach((card) => {
      gsap.set(card, { scale: 0 });
    });
  }, []);

  // Each row divider draws in from the left as it individually scrolls up
  // to 70% of the viewport - a per-line trigger (not one shared trigger
  // for the whole list) so they draw one at a time as you scroll past
  // them, not all at once.
  useEffect(() => {
    const lines = lineRefs.current.filter(Boolean) as HTMLDivElement[];

    const tweens = lines.map((line) =>
      gsap.to(line, {
        scaleX: 1,
        duration: 0.8,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: line,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      })
    );

    return () => {
      tweens.forEach((tween) => tween.scrollTrigger?.kill());
      tweens.forEach((tween) => tween.kill());
    };
  }, []);

  // Gates the whole image-container behind cursor presence over the row
  // list (.awards-container) - everything inside it (pill snap, per-card
  // scale reveal) is untouched, this just fades the container itself.
  const handleListEnter = () => {
    gsap.to(imageContainerRef.current, {
      opacity: 1,
      duration: CONTAINER_FADE_DURATION,
      ease: "power2.out",
    });
  };

  const handleListLeave = () => {
    gsap.to(imageContainerRef.current, {
      opacity: 0,
      duration: CONTAINER_FADE_DURATION,
      ease: "power2.out",
    });
  };

  const handleRowEnter = (index: number) => {
    // Snap the pill to the hovered row's real position every time,
    // even re-hovering the already-active row, so the pill always
    // tracks properly rather than only reacting to a change of index.
    // The container's rest position (with y backed out) is remeasured
    // live on every hover instead of once at mount - getBoundingClientRect
    // is viewport-relative, so a stale mount-time measurement (captured
    // before the page ever scrolled to this section) would be miles off
    // once the user actually scrolls down and the viewport frame shifts.
    const rowEl = rowRefs.current[index];
    const container = containerRef.current;
    if (rowEl && container) {
      const currentY = gsap.getProperty(container, "y") as number;
      const containerRect = container.getBoundingClientRect();
      const containerRestCenterY =
        containerRect.top + containerRect.height / 2 - currentY;
      const rowRect = rowEl.getBoundingClientRect();
      const rowCenterY = rowRect.top + rowRect.height / 2;
      const targetY = rowCenterY - containerRestCenterY;
      gsap.to(container, {
        y: targetY,
        duration: PILL_SNAP_DURATION,
        ease: PILL_SNAP_EASE,
      });
    }

    const incoming = cardRefs.current[index];
    if (!incoming) return;

    zIndexCounterRef.current += 1;
    gsap.set(incoming, { zIndex: zIndexCounterRef.current });

    // Every hover (mouseenter only fires once per actual entry, so
    // this never retriggers from just moving around inside the same
    // row) restarts THIS card's reveal from scratch - scale snapped
    // back to 0 first, then regrown - regardless of whether it was
    // already fully visible or still mid-transition. That's the
    // point: entering a block should always generate its image from
    // center again, not just bring an already-grown one back to
    // front. Other cards are untouched - whatever they're doing
    // (including a previous reveal still in flight) just keeps
    // playing out underneath this one.
    gsap.killTweensOf(incoming);
    if (prefersReducedMotionRef.current) {
      gsap.set(incoming, { scale: 1 });
    } else {
      gsap.set(incoming, { scale: 0 });
      gsap.to(incoming, {
        scale: 1,
        duration: IMAGE_REVEAL_DURATION,
        ease: IMAGE_REVEAL_EASE,
      });
    }
  };

  return (
    <section
      className="relative w-screen bg-[#070707] text-white py-[7vw]"
      id="awards"
    >
      <div className="w-screen flex items-center px-[4vw] gap-[4vw] overflow-hidden max-[1025px]:px-[5vw]">
        <div className="w-full">
          <OverflowTextReveal stagger={0.015}>
            <h2 className="text-[5.5vw] leading-[1.2]  mb-[4vw] max-[1025px]:text-[7vw] max-md:text-[9vw]">
              Awards and Industry
              <br />
              Recognition
            </h2>
          </OverflowTextReveal>

          <div onMouseEnter={handleListEnter} onMouseLeave={handleListLeave}>
            {AWARD_ITEMS.map((item, i) => (
              <div
                key={item.title}
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                onMouseEnter={() => handleRowEnter(i)}
                className="relative py-8 awards-container"
              >
                {i !== 0 && (
                  <div
                    ref={(el) => {
                      lineRefs.current[i - 1] = el;
                    }}
                    className="absolute top-0 left-0 h-px w-full bg-white/40 origin-left scale-x-0"
                  />
                )}
                <OverflowTextReveal splitBy="lines">

                <h3 className="text-[1.8vw] font-normal max-[1025px]:text-[3.4vw] max-md:text-[5.5vw]">{item.title}</h3>
                </OverflowTextReveal>
                <OverflowTextReveal splitBy="lines">

                <p className="text-[1.25vw] tracking-wide text-white/30 mt-3 max-[1025px]:text-[2.2vw] max-md:text-[3.6vw]">
                  {item.meta}
                </p>
                </OverflowTextReveal>


              </div>
            ))}
            <div className="relative w-full h-px">
              <div
                ref={(el) => {
                  lineRefs.current[AWARD_ITEMS.length - 1] = el;
                }}
                className="absolute top-0 left-0 h-px w-full bg-white/40 origin-left scale-x-0"
              />
            </div>
          </div>
        </div>

        {/* Hover-to-reveal is a desktop-only interaction (nothing to hover
            on touch), and this panel is absolutely positioned overlapping
            the list - at narrower widths there isn't room for both, so it's
            hidden and the list takes the full row instead. */}
        <div
          ref={imageContainerRef}
          className="w-[40vw] flex justify-center absolute right-[10%] pointer-events-none opacity-0 max-[1025px]:hidden image-container"
        >
          <div
            ref={containerRef}
            className="w-[40vw] h-[22vw] relative bg-[#F4EFE9] rounded-lg overflow-hidden shadow-2xl will-change-transform"
          >
            {AWARD_ITEMS.map((item, i) => (
              <div
                key={item.title}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="absolute inset-0"
              >
                <Image
                  src={item.imgSrc}
                  alt="awards-image"
                  className="w-full h-full object-cover"
                  width={600}
                  height={400}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Awards;
