// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Image, { type StaticImageData } from "next/image";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import SmoothInfiniteCarousel, {
  type KeyboardSlider,
} from "./smooth-carousel/SmoothInfiniteCarousel";
import CarouselNavButtons from "./Buttons/NavButtons";

import exp01 from "../assets/exp-a.jpg";

import exp02 from "../assets/exp02.jpg";
import exp03 from "../assets/exp03.jpg";
import exp04 from "../assets/exp04.jpg";
// Stand-in imagery for the three newest testimonials until real portraits land.
import pers01 from "../assets/exp-e.jpg";
import trustInside from "../assets/exp-f.jpg";
import trustOutside from "../assets/exp-g.jpg";

import FocusTextWrap from "./effects/focus-text/wrap";
import { ParaAnim } from "./Animations/gsapAnim";
if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

type Testimonial = {
  quote: string;
  name: string;
  meta: string;
  image: StaticImageData;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "The thing I didn't expect to love was the history. I can open the apartment and see every repair we've done since moving in. When the AC had the same problem twice, Kyntra already knew the previous technician, the unit and what had been repaired.",
    name: "Sarah Mitchell",
    meta: "Kyntra member for 18 months",
    image: exp01,
  },
  {
    quote:
      "Booking a professional used to mean three phone calls and re-explaining everything. Now I describe the problem once, Kyntra pulls the appliance record and the right person shows up with context.",
    name: "James Whitfield",
    meta: "Kyntra member for 11 months",
    image: exp02,
  },
  {
    quote:
      "We manage two properties and every warranty, invoice and service visit lives in the right place. Nothing gets lost between tenants anymore.",
    name: "Priya Nair",
    meta: "Kyntra member for 2 years",
    image: exp03,
  },
  {
    quote:
      "The maintenance reminders alone paid for the subscription. Small things get handled before they turn into the expensive kind.",
    name: "Daniel Osei",
    meta: "Kyntra member for 7 months",
    image: exp04,
  },
  {
    quote:
      "We inherited a house full of appliances nobody had paperwork for. Scanning them in took an afternoon, and now every manual and warranty date is a search away.",
    name: "Elena Volkov",
    meta: "Kyntra member for 9 months",
    image: pers01,
  },
  {
    quote:
      "What sold me was the handover. When we sold the flat, the buyers got the entire service history in one link instead of a shoebox of receipts.",
    name: "Marcus Bennett",
    meta: "Kyntra member for 14 months",
    image: trustInside,
  },
  {
    quote:
      "I used to guess whether a repair was still under warranty. Kyntra flags it before I book, and that has saved me two call-out fees already.",
    name: "Aisha Rahman",
    meta: "Kyntra member for 5 months",
    image: trustOutside,
  },
];

const FADE_IN_DELAY = 0;

const IMAGE_HIDDEN_CLIP = "inset(50%)";
const IMAGE_VISIBLE_CLIP = "inset(0%)";
const IMAGE_REVEAL_DURATION = 0.6;

// Gap between queued steps when a click skips ahead. Shorter than the reveal
// duration on purpose, so consecutive images overlap mid-iris rather than
// playing end-to-end.
const STEP_STAGGER = 0.16;

// How long the step queue keeps owning the sequence after its final step, to
// cover the strip's remaining easing.
const STEP_SETTLE = 0.7;

// How long the outgoing thumb stays painted before it is hidden - long enough
// for the strip to carry it clear of the rail, so it never sits transparent
// beside the quote card.
const THUMB_HIDE_DELAY = 0.75;

const LEFT_BLEED = 0.4;

// The carousel wraps items symmetrically around the strip's own origin (see
// symmetricMod in smooth-carousel/utils). A single pass is wide enough for the
// rail at rest and when moving forward, but stepping BACKWARD needs an item to
// place to the LEFT of the strip's first one - with one pass that item is
// wrapped to the far right instead, leaving a hole beside the quote card.
// Two passes give the wrap window slack on both sides.
const STRIP_REPEATS = 2;

// Per breakpoint: [thumb width, gap] in vw, matching the classes below.
// Capped at the grid's 3vw column gap so the bleeding thumb stays inside the
// gutter instead of painting over the quote card's right edge.
const GRID_GAP_VW = 1.5;
const bleed = (thumbVw: number, gapVw: number) =>
  `min(calc(${thumbVw}vw * ${LEFT_BLEED} + ${gapVw}vw), ${GRID_GAP_VW}vw)`;

const BLEED_VARS = {
  "--exp-bleed-desktop": bleed(13, 1.6),
  "--exp-bleed-tablet": bleed(25, 1.6),
  "--exp-bleed-mobile": bleed(26, 3),
} as CSSProperties;

const STRIP = Array.from(
  { length: TESTIMONIALS.length * STRIP_REPEATS },
  (_, i) => TESTIMONIALS[i % TESTIMONIALS.length],
);

const Experience = () => {
  const sliderRef = useRef<KeyboardSlider | null>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  // Refs for the crossfading quote card
  const imageWrapRef = useRef<HTMLDivElement | null>(null);
  const prevImageWrapRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  // The outgoing photo, kept mounted for the length of one transition so the
  // image frame never goes blank between the old and new picture.
  const [prevImage, setPrevImage] = useState<Testimonial | null>(null);
  const animating = useRef(false);
  const splitRef = useRef<SplitText | null>(null);
  // Read during render to decide the initial (hidden / off-frame) state of the
  // freshly-swapped content and photo. Refs, not state: they must be current
  // in the very same render that setActive() triggers.
  // Which thumb is visually hidden. Lags `active` by the strip's travel time so
  // the outgoing thumb stays opaque while it is still moving across the rail.
  const [hiddenThumb, setHiddenThumb] = useState(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef(false);
  const pendingDirRef = useRef(1);

  // Shift applied to the strip so the centre-snapped item sits at the LEFT
  // edge instead - the active testimonial then lives just off-screen left and
  // the strip visibly starts at active + 1.
  const stripShiftRef = useRef<HTMLDivElement | null>(null);

  const count = TESTIMONIALS.length;

  // SplitText wraps text in extra DOM; revert on unmount so React does not tear
  // down nodes the plugin still owns.
  useEffect(() => {
    return () => {
      splitRef.current?.revert();
      splitRef.current = null;
      stepTimers.current.forEach(clearTimeout);
      stepTimers.current = [];
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  // GSAP crossfade of the big card. `dir` is +1 (pressed next) or -1 (prev).
  // React re-render swaps the text + image src on setActive(); GSAP only
  // fades/slides the two wrappers around that swap.
  const crossfadeTo = (idx: number, dir: number) => {
    const imageWrap = imageWrapRef.current;
    const content = contentRef.current;

    if (!imageWrap || !content) {
      setActive(idx);
      return;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      setActive(idx);
      return;
    }

    const prevWrap = prevImageWrapRef.current;
    pendingDirRef.current = dir;
    // `activeRef` has already been advanced by select(); `active` is the state
    // still rendered on screen, so that is the photo currently in the frame.
    const outgoing = TESTIMONIALS[active];

    gsap.killTweensOf([content, imageWrap, prevWrap]);
    splitRef.current?.revert();
    splitRef.current = null;
    animating.current = true;

    const tl = gsap.timeline({
      onComplete: () => {
        animating.current = false;
      },
    });

    // OUT - the old copy leaves; the old photo is handed to the `prev` layer
    // so it can slide out while the new one slides in behind it.
    tl.to(
      content,
      { autoAlpha: 0, y: dir * 14, duration: 0.24, ease: "power2.in" },
      0,
    );

    // SWAP - React renders the new quote + photo, and pins the outgoing photo
    // into the `prev` layer at its resting position.
    tl.add(() => {
      // Revert BEFORE React renders the new copy. SplitText replaces each <p>'s
      // children with its own line divs; React cannot reconcile against those,
      // so a swap while a split is live leaves the old quote frozen on screen.
      splitRef.current?.revert();
      splitRef.current = null;

      // Set before setActive: the render it triggers reads these to paint the
      // new copy hidden and the new photo already off-frame, so there is no
      // intermediate frame showing either at its resting state.
      pendingRef.current = true;

      setPrevImage(outgoing);
      setActive(idx);

      const prev = prevImageWrapRef.current;
      if (prev) gsap.set(prev, { xPercent: 0, autoAlpha: 1 });
    });

    // IN - runs after a beat so the thumbnail has visibly moved first. The
    // body is deferred one frame: tl.add fires synchronously, before React has
    // committed the setActive() above, so splitting here without the rAF would
    // split the OLD copy.
    tl.add(() => {
      requestAnimationFrame(() => {
        const c = contentRef.current;
        const img = imageWrapRef.current;
        const prev = prevImageWrapRef.current;

        // The outgoing photo holds still underneath; the incoming one opens
        // over it. Nothing moves, so there is no edge for a gap to appear at.
        if (prev) {
          gsap.set(prev, { xPercent: 0, autoAlpha: 1, zIndex: 1 });
        }

        if (img) {
          // Stack on top, clipped to nothing, then iris open. The layer renders
          // visibility:hidden so its first painted frame is already clipped -
          // GSAP alone decides when it becomes visible.
          gsap.set(img, {
            xPercent: 0,
            zIndex: 2,
            visibility: "visible",
            clipPath: IMAGE_HIDDEN_CLIP,
          });
          gsap.to(img, {
            clipPath: IMAGE_VISIBLE_CLIP,
            duration: IMAGE_REVEAL_DURATION,
            ease: "power2.inOut",
            // Drop the old photo only once the new one fully covers it.
            onComplete: () => setPrevImage(null),
          });
        } else {
          setPrevImage(null);
        }

        if (!c) {
          pendingRef.current = false;
          return;
        }

        // Split the freshly-rendered copy into masked lines and stagger them up
        // from below. Reverted on the next transition (and on unmount).
        const split = SplitText.create(c.querySelectorAll("p"), {
          type: "lines",
          mask: "lines",
        });
        splitRef.current = split;

        // Lines are parked below the mask first, THEN the container is made
        // visible - reveal it any earlier and the un-animated copy shows.
        gsap.set(split.lines, { yPercent: 100 });
        gsap.set(c, { visibility: "visible", autoAlpha: 1 });
        pendingRef.current = false;

        gsap.to(split.lines, {
          yPercent: 0,
          duration: 0.72,
          ease: "power3.out",
          stagger: 0.06,
        });
      });
    }, `+=${FADE_IN_DELAY}`);
  };

  const carouselConfig = useMemo(
    () => ({
      infinite: true,
      snap: true,
      variableWidth: true,
      dragSensitivity: 0.005,
      // Tuned so the strip settles in step with the card's 0.45s photo slide -
      // at 0.12 the thumbs arrived noticeably after the card had already
      // changed, which read as a pause between clicking and the strip moving.
      lerpFactor: 0.22,
      setOffset: () => 0,
      onSlideChange: (current: number) => {
        // While a click walks through skipped testimonials, the strip eases
        // past intermediate slots and would fire this for each one, fighting
        // the queue and snapping the card backwards. The queue owns the
        // sequence until it drains.
        if (steppingRef.current) return;
        // `current` indexes STRIP (count * STRIP_REPEATS); fold to a
        // testimonial index before comparing with `active`.
        const centre = ((current % count) + count) % count;
        const target = (centre - 1 + count) % count;
        if (target === activeRef.current) return;
        activeRef.current = target;
        crossfadeTo(target, 1);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const getBleedPx = (shiftEl: HTMLElement) => {
    // Find the widened clip window by marker class rather than counting
    // parents, so the carousel's internal DOM shape can change freely.
    const clip = shiftEl.closest<HTMLElement>(".exp-clip");
    const column = clip?.parentElement;
    if (!clip || !column) return 0;
    return Math.max(0, clip.getBoundingClientRect().width - column.clientWidth);
  };

  const syncStripShift = () => {
    const shiftEl = stripShiftRef.current;
    const slider = sliderRef.current;
    if (!shiftEl || !slider) return;
    // itemWidth includes the pr gap, so it is the full slot pitch.
    const slot = slider.viewport.itemWidth;
    // The strip's left edge sits one bleed-width left of the grid column, so
    // moving the centre-snapped item to x=0 would land it at the bleed. Add
    // the bleed back to put it flush at the column edge, leaving the previous
    // thumb to fill the widened strip to its left.
    const bleedPx = getBleedPx(shiftEl);
    const half = slider.viewport.wrapperWidth / 2 - slot / 2 - bleedPx;
    shiftEl.style.transform = `translateX(${-half}px)`;
  };

  // Make testimonial `idx` the card. Snap the strip so `idx + 1` is the first
  // visible thumb; `idx` itself scrolls off the left edge into the card.
  const select = (idx: number, dir: 1 | -1) => {
    const clamped = ((idx % count) + count) % count;
    if (clamped === activeRef.current) return;
    activeRef.current = clamped;
    // Snap to the repeat of `clamped + 1` nearest the current position so the
    // strip advances by one slot instead of jumping across a whole set.
    const slider = sliderRef.current;
    if (slider) {
      const wanted = (clamped + 1) % count;
      const stripLen = STRIP.length;
      const from = slider.currentSlide;
      // Pick the repeat of `wanted` closest to where the strip already is,
      // measured as a SIGNED ring distance so a backward step resolves to the
      // slot just behind rather than the long way forward - going the long way
      // briefly pulled the strip off the rail's left edge and opened a gap
      // beside the quote card.
      let best = wanted;
      let bestDist = Infinity;
      for (let r = 0; r < STRIP_REPEATS; r++) {
        const candidate = wanted + r * count;
        let delta = (((candidate - from) % stripLen) + stripLen) % stripLen;
        if (delta > stripLen / 2) delta -= stripLen;
        if (Math.abs(delta) < bestDist) {
          bestDist = Math.abs(delta);
          best = from + delta;
        }
      }
      slider.goToIndex(best);
    }
    syncStripShift();

    // Reveal any previously-hidden thumb immediately, then hide the new one
    // only after the strip has carried it off the rail.
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setHiddenThumb(-1);
    hideTimer.current = setTimeout(
      () => setHiddenThumb(clamped),
      THUMB_HIDE_DELAY * 1000,
    );

    crossfadeTo(clamped, dir);
  };

  // Right button -> next testimonial (the first strip thumb) slides into the
  // card. Left -> previous (wraps: from 0 -> the last testimonial).
  const go = (dir: 1 | -1) => {
    select(activeRef.current + dir, dir);
  };

  // Queue of pending steps when a click skips over intermediate testimonials.
  const stepTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  // True while a click-driven multi-step walk is in flight.
  const steppingRef = useRef(false);

  const clearStepQueue = () => {
    stepTimers.current.forEach(clearTimeout);
    stepTimers.current = [];
    steppingRef.current = false;
  };

  // Clicking a non-adjacent thumb walks through every testimonial in between
  // instead of jumping. Each step fires its own clip-path reveal, and they are
  // spaced closer than the reveal duration so the intermediate images stack
  // and overlap - the same look as hovering the reference list quickly.
  const goToThumb = (idx: number) => {
    const target = ((idx % count) + count) % count;
    const from = activeRef.current;
    if (target === from) return;

    clearStepQueue();

    // Shortest way round the ring.
    let delta = target - from;
    if (delta > count / 2) delta -= count;
    if (delta < -count / 2) delta += count;
    const dir: 1 | -1 = delta > 0 ? 1 : -1;
    const steps = Math.abs(delta);

    // One step: just go.
    if (steps === 1) {
      select(target, dir);
      return;
    }

    steppingRef.current = true;
    select((((from + dir) % count) + count) % count, dir);
    for (let i = 2; i <= steps; i++) {
      const to = (((from + dir * i) % count) + count) % count;
      const isLast = i === steps;
      stepTimers.current.push(
        setTimeout(
          () => {
            select(to, dir);
            // Keep the guard up past the last step: the strip is still easing
            // and fires onSlideChange for slots it passes, which would drag
            // the card back to an intermediate testimonial.
            if (isLast) {
              stepTimers.current.push(
                setTimeout(() => {
                  steppingRef.current = false;
                }, STEP_SETTLE * 1000),
              );
            }
          },
          (i - 1) * STEP_STAGGER * 1000,
        ),
      );
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-white py-[7%] text-black max-[1025px]:py-[10%]">
      <div className="pl-[5%]">
        <FocusTextWrap>
          <h2 className="font-helvetica-neue w-[45vw] text-[3.8vw] leading-[1.1] font-normal tracking-[-0.02em] max-[1025px]:w-full max-[1025px]:text-[6vw] max-md:text-[9vw]">
            Real Homes. Real Experiences
          </h2>
        </FocusTextWrap>
        <ParaAnim
          as="p"
          className="text-24 mt-[1.6vw] max-w-[34vw] leading-[1.6] text-black max-[1025px]:mt-[3vw] max-[1025px]:max-w-full max-[1025px]:text-[2.6vw] max-md:text-[4vw]"
        >
          Kyntra Keeps Your Appliances, Repairs, Warranties And Maintenance
          History Together So Every Future Job Starts With Context.
        </ParaAnim>
      </div>

      <div className="mt-[4vw] grid grid-cols-[minmax(0,1fr)_36vw] pl-[5%] items-start gap-[1.5vw] max-[1025px]:grid-cols-1 max-[1025px]:gap-[8vw]">
        {/* Big quote card - content + image crossfade */}
        {/* Height is pinned: quotes vary from ~125 to ~250 chars, which
            otherwise resized the card on every change. Sized to the tallest
            quote; max-md releases it since the layout stacks there. */}
        <div
          className="relative min-h-[23.5vw] overflow-hidden rounded-[1.6vw] border p-[2.6vw] max-[1025px]:min-h-0 max-md:rounded-[5vw] max-md:p-[7vw]"
          style={{ borderColor: "rgba(19,75,214,0.35)" }}
        >
          {/* items-start, not items-stretch: stretch overrides the photo's
              aspect-square and pulls it taller whenever the quote wraps to an
              extra line, so the image resized along with the content. */}
          <div className="flex items-start gap-[2.6vw] max-md:flex-col max-md:gap-[6vw]">
            {/* image */}
            {/* Static rounded frame - it never moves or resizes. The two photo
                layers inside it are what slide, so the rounded corners and the
                clip stay put through the whole transition. */}
            <div className="relative aspect-square w-[16vw] shrink-0 overflow-hidden rounded-[1.1vw] max-[1025px]:w-[26vw] max-md:w-full max-md:rounded-[4vw]">
              <div ref={prevImageWrapRef} className="absolute inset-0">
                {prevImage ? (
                  <Image
                    src={prevImage.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 84vw, 16vw"
                    className="object-cover grayscale"
                    draggable={false}
                    aria-hidden
                  />
                ) : null}
              </div>
              {/* Parked off-frame at render time when a transition is pending:
                  a gsap.set after commit lands one frame too late and the new
                  photo flickers at its resting spot first. */}
              <div
                ref={imageWrapRef}
                className="absolute inset-0"
                style={
                  pendingRef.current ? { visibility: "hidden" } : undefined
                }
              >
                <Image
                  src={TESTIMONIALS[active].image}
                  alt={TESTIMONIALS[active].name}
                  fill
                  sizes="(max-width: 768px) 84vw, 16vw"
                  className="object-cover grayscale"
                  draggable={false}
                />
              </div>
            </div>

            {/* text */}
            <div className="flex flex-1 flex-col justify-start">
              {/* shrink-0 + fixed box: the mark must not resize or shift as
                  the quote below it changes length. */}
              <svg
                viewBox="0 0 40 30"
                className="h-[2.8vw] w-[2.8vw] shrink-0 fill-kyntra-primary max-md:h-[10vw] max-md:w-[10vw]"
                aria-hidden
              >
                <path d="M0 30V16C0 7.163 7.163 0 16 0v6C10.477 6 6 10.477 6 16h10v14H0Zm24 0V16C24 7.163 31.163 0 40 0v6c-5.523 0-10 4.477-10 10h10v14H24Z" />
              </svg>

              {/* Keyed by index: SplitText rewrites these <p> children, which
                  React cannot reconcile against. Remounting the subtree on every
                  change guarantees the new quote actually lands.

                  It renders with visibility:hidden whenever a transition is in
                  flight. A fresh mount carries no inline opacity, so without
                  this the new copy paints at full opacity for the frames
                  between React's commit and SplitText hiding the lines - the
                  "appears, disappears, then animates" flash. */}
              <div
                ref={contentRef}
                key={active}
                style={
                  pendingRef.current ? { visibility: "hidden" } : undefined
                }
              >
                <p className="mt-[1.4vw] text-[1.15vw] leading-[1.7] text-black max-[1025px]:text-[2.4vw] max-md:mt-[5vw] max-md:text-[4vw]">
                  &ldquo;{TESTIMONIALS[active].quote}&rdquo;
                </p>
                <p className="mt-[1.6vw] text-[1.25vw] font-medium text-kyntra-primary max-[1025px]:text-[2.6vw] max-md:mt-[6vw] max-md:text-[4.4vw]">
                  {TESTIMONIALS[active].name}
                </p>
                <p className="mt-[0.4vw] text-[0.95vw] text-black max-[1025px]:text-[2vw] max-md:text-[3.6vw]">
                  {TESTIMONIALS[active].meta}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right rail: nav buttons + thumbnail strip.
            The active testimonial lives one slot off the left edge (it's in the
            card); the strip visibly begins at active + 1. */}
        <div className="flex w-full flex-col items-end gap-[2vw] max-[1025px]:items-start">
          <div className="pr-[7vw]">
            <CarouselNavButtons onPrev={() => go(-1)} onNext={() => go(1)} />
          </div>

          {/* The clip window is widened to the LEFT of the grid column by one
              bleed-width, so the outgoing thumb stays visible instead of being
              cut flush at the column start. The strip inside keeps the column's
              own width, so the slot pitch is unaffected. */}
          <div
            style={BLEED_VARS}
            className="exp-clip -ml-(--exp-bleed) w-[calc(100%+var(--exp-bleed))] overflow-hidden [--exp-bleed:var(--exp-bleed-desktop)] max-[1025px]:[--exp-bleed:var(--exp-bleed-tablet)] max-md:[--exp-bleed:var(--exp-bleed-mobile)]"
          >
            <div className="w-full">
              <SmoothInfiniteCarousel
                wrapperClassName="exp-strip will-change-transform"
                // The carousel root keeps its own `overflow-hidden`. The shift
                // is applied to the inner wrapper (see onReady), so this box
                // stays put and clips a bleeding thumb before it can paint
                // over the quote card to the left.
                className="w-full"
                config={carouselConfig}
                itemClassName="cursor-grab active:cursor-grabbing"
                onReady={(slider) => {
                  sliderRef.current = slider;
                  // `slider.wrapper` is the inner flex strip: shift that, not
                  // an ancestor, so the clipping root stays stationary.
                  stripShiftRef.current = slider.wrapper as HTMLDivElement;
                  requestAnimationFrame(() => {
                    // Start: testimonial 0 in the card, strip begins at 1.
                    slider.goToIndex(1);
                    syncStripShift();
                  });
                }}
              >
                {STRIP.map((t, stripIndex) => {
                  // STRIP repeats TESTIMONIALS, so map back to the real index.
                  const i = stripIndex % count;
                  return (
                    // Gap as right-padding: the carousel's width math ignores flex
                    // gap, so folding it into item width avoids overlap.
                    <div
                      key={`${t.name}-${stripIndex}`}
                      className="pr-[1.6vw] max-md:pr-[3vw]"
                    >
                      <button
                        type="button"
                        onClick={() => goToThumb(i)}
                        aria-label={`Show testimonial from ${t.name}`}
                        aria-hidden={stripIndex >= count}
                        tabIndex={stripIndex >= count ? -1 : undefined}
                        // The active thumb is hidden because its photo now
                        // lives in the quote card. It is hidden only once it
                        // has travelled off the rail: hiding it in place left a
                        // transparent thumb sitting beside the card, which read
                        // as blank space. Returning is instant (no transition)
                        // so a thumb coming back never shows a hole.
                        className={`relative block aspect-square w-[13vw] overflow-hidden rounded-[1vw] max-[1025px]:w-[25vw] max-md:w-[26vw] max-md:rounded-[3vw] ${
                          hiddenThumb === i ? "opacity-0" : "opacity-100"
                        }`}
                      >
                        <Image
                          src={t.image}
                          alt={t.name}
                          fill
                          sizes="(max-width: 768px) 26vw, 13vw"
                          className="object-cover"
                          draggable={false}
                        />
                      </button>
                    </div>
                  );
                })}
              </SmoothInfiniteCarousel>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
