"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";

gsap.registerPlugin(CustomEase);

// Checked at click time (not cached) rather than a render-reactive hook,
// since only the moment a flip is triggered matters here.
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

type SlideItem = { image: string; text: string };

const R2_BASE = "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images";

const ITEMS: SlideItem[] = [
  { image: `${R2_BASE}/h-06.jpg`, text: "Dimensional Switch" },
  { image: `${R2_BASE}/h-18.jpg`, text: "Hyperiux Vault" },
  { image: `${R2_BASE}/h-20.jpg`, text: "Motion Systems" },
  { image: `${R2_BASE}/h-11.jpg`, text: "Interaction Design" },
  { image: `${R2_BASE}/h-15.jpg`, text: "Source-First" },
];

const DEFAULT_EASE = "cubic-bezier(1, -0.001, 0.159, 0.838)";
const CUBIC_BEZIER_RE = /^cubic-bezier\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)$/;

// Accepts either a CSS cubic-bezier(...) string (converted into a
// registered CustomEase, cached by name so repeated renders with the same
// value don't re-register it) or a plain GSAP ease name (e.g. "power2.out"),
// passed straight through as-is.
function resolveEase(ease: string): string {
  const match = ease.match(CUBIC_BEZIER_RE);
  if (!match) return ease;

  const id = `ease-${match.slice(1, 5).join("_").replace(/[^\d.-]/g, "n")}`;
  if (!CustomEase.get(id)) {
    CustomEase.create(id, match.slice(1, 5).join(","));
  }
  return id;
}

const EASE = "power4.inOut";
const DURATION = 0.9;
// How far the outgoing text travels/tilts as it leaves, and how far the
// incoming text starts from before settling to 0/0. Horizontal mode only -
// see the VERTICAL_* block below for vertical mode's own copies of these.
const TEXT_TRANSLATE_PERCENT = 40;
const TEXT_ROTATE_DEG = 45;
// The outgoing text should read as gone well before the card finishes
// flipping, not linger for the whole rotation - so it gets its own shorter,
// front-loaded fade instead of sharing the full flip duration like the
// incoming text does.
const OUTGOING_DURATION = DURATION * 0.45;

// Vertical mode's own text tuning, kept completely separate from the
// horizontal constants above so this direction's feel can be tweaked -
// magnitude, sign, or timing - without touching horizontal mode at all.
// The two REVERSED flags are independent of each other: flip
// VERTICAL_TEXT_ROTATE_REVERSED to change which way the text tilts on
// next/prev without affecting which way it slides, and vice versa for
// VERTICAL_TEXT_TRANSLATE_REVERSED.
const VERTICAL_TEXT_TRANSLATE_PERCENT = 40;
const VERTICAL_TEXT_ROTATE_DEG = 45;
const VERTICAL_TEXT_ROTATE_REVERSED = true;
const VERTICAL_TEXT_TRANSLATE_REVERSED = true;
const VERTICAL_OUTGOING_DURATION = DURATION * 0.45;

// Fixed forward pop on the Z axis (toward the viewer), independent of the
// switchTo animation below.
const TEXT_Z = 60;

export interface DimensionalSwitchSliderProps {
  /** Wrap from the last item back to the first (and vice versa). Default true. */
  infinite?: boolean;
  /** CSS cubic-bezier(...) string or a plain GSAP ease name - drives the
   *  card flip and both text tweens. */
  ease?: string;
  /** Any valid CSS color - applied to both the prev/next text elements. */
  textColor?: string;
  /** Extra classes appended to the card's own wrapper div. */
  cardClassName?: string;
  /** Any valid CSS width/height value (e.g. "45vw", "480px"). */
  cardWidth?: string;
  cardHeight?: string;
  /** "horizontal" flips the card around the Y axis with the text sliding/
   *  tilting left-right (default). "vertical" flips it around the X axis
   *  instead, with the text sliding up-down and tilting on X rather than Y. */
  direction?: "horizontal" | "vertical";
  /** Any valid CSS font-size value (e.g. "5.5vw", "48px"). */
  textSize?: string;
  /** Any valid CSS border-radius value (e.g. "0.375rem", "24px") - applied
   *  to both card faces so the rounding stays consistent front and back. */
  cardBorderRadius?: string;
}

const DimensionalSwitchSlider = ({
  infinite = true,
  ease = DEFAULT_EASE,
  textColor = "#ffffff",
  cardClassName = "max-md:w-[85vw]! max-md:h-[75vw]! max-[1024px]:w-[85vw]! max-[1024px]:h-[55vw]!",
  cardWidth = "50vw",
  cardHeight = "34vw",
  direction = "horizontal",
  textSize = "5.5vw",
  cardBorderRadius = "1rem",
}: DimensionalSwitchSliderProps = {}) => {
  const isVertical = direction === "vertical";
  // Which transform property the card flip tween below drives - the card
  // flips around X instead of Y in vertical mode. Text tweens are built
  // separately per direction further down (see the two branches in
  // switchTo), each with its own timeline and constants.
  const flipAxis = isVertical ? "rotateX" : "rotateY";
  const flipperRef = useRef<HTMLDivElement>(null);
  const prevTextRef = useRef<HTMLDivElement>(null);
  const nextTextRef = useRef<HTMLDivElement>(null);
  // Which face/text is currently showing - "next" (back face) starts false.
  const showingNextRef = useRef(false);
  const isAnimatingRef = useRef(false);
  // Cumulative rotateY applied to the flipper so far - unlike a fixed
  // 0/180 target, this keeps climbing (+180 per "next") or descending
  // (-180 per "previous") indefinitely, so repeated clicks in the same
  // direction keep spinning the card further the same way (a real circular
  // rotation) instead of oscillating back and forth between two angles.
  // Which physical face ends up visible only depends on this value mod 360
  // (0 -> front, 180 -> back), so alternation still works exactly as
  // before regardless of which direction accumulated it there.
  const rotationRef = useRef(0);

  const resolvedEase = useMemo(() => resolveEase(ease), [ease]);

  // Which array item each physical slot (front/prev face+text, back/next
  // face+text) currently holds. The two DOM slots themselves never change -
  // only which item's image/text they're populated with, ahead of the flip
  // that's about to reveal whichever one is currently hidden.
  const [frontIndex, setFrontIndex] = useState(0);
  const [backIndex, setBackIndex] = useState(1 % ITEMS.length);
  // Reactive mirror of "whichever index is currently fully visible" - only
  // needed so the prev/next buttons can disable themselves at the ends when
  // infinite=false (frontIndex/backIndex alone can't tell you which one is
  // the visible one without also reading the showingNextRef, which isn't
  // reactive).
  const [currentIndex, setCurrentIndex] = useState(0);

  // Set once via GSAP (not a plain inline style) so it merges into GSAP's
  // own transform cache for these elements and survives every subsequent
  // xPercent/rotateY tween in switchTo below, instead of being wiped out
  // the moment GSAP next rewrites the transform matrix.
  useEffect(() => {
    gsap.set([prevTextRef.current, nextTextRef.current], { z: TEXT_Z });
  }, []);

  // Switching direction (e.g. live via the Remixer panel) doesn't remount
  // the component, so whatever the flip/text tweens left behind on the
  // OTHER axis's transform properties (rotateY sitting on the flipper
  // right before switching to vertical, xPercent sitting on the text right
  // before switching to vertical, etc.) just stays there - rotateX/rotateY
  // and xPercent/yPercent are independent GSAP-tracked properties, so
  // nothing clears the old axis automatically when the new one takes over.
  // Kill anything still animating and snap every transform back to a clean
  // baseline that matches whichever item is actually showing right now, so
  // the direction switch itself never glitches.
  useEffect(() => {
    gsap.killTweensOf([flipperRef.current, prevTextRef.current, nextTextRef.current]);

    const wasShowingNext = showingNextRef.current;
    rotationRef.current = wasShowingNext ? 180 : 0;
    gsap.set(flipperRef.current, { rotateX: 0, rotateY: 0, [flipAxis]: rotationRef.current });

    const visibleRef = wasShowingNext ? nextTextRef : prevTextRef;
    const hiddenRef = wasShowingNext ? prevTextRef : nextTextRef;
    gsap.set(visibleRef.current, { xPercent: 0, yPercent: 0, rotateX: 0, rotateY: 0, opacity: 1 });
    gsap.set(hiddenRef.current, { xPercent: 0, yPercent: 0, rotateX: 0, rotateY: 0, opacity: 0 });

    isAnimatingRef.current = false;
  }, [direction, flipAxis]);

  // The shared core: flips the card and swaps its text to newIndex,
  // regardless of whether the caller is the prev/next buttons (switchTo,
  // below) stepping one item at a time, or a pagination dot (goToIndex,
  // further below) jumping straight to an arbitrary index.
  const flipTo = (direction: "prev" | "next", newIndex: number) => {
    const goingNext = direction === "next";

    // Unlike the old fixed 2-state version, a real N-item carousel has to
    // allow the same direction to be clicked over and over (there's no
    // "already showing next" to block) - only a flip already in flight is
    // ignored.
    if (isAnimatingRef.current) return;

    // Which physical face is currently visible, read BEFORE this click
    // toggles it below. The card only has two faces, so repeated clicks in
    // the same direction keep alternating between them - outgoing/incoming
    // and the flip target both have to be derived from this actual current
    // state, not from which button was clicked, or a second consecutive
    // "next" would incorrectly treat prev-text as still outgoing and try to
    // flip the card to a face it's already showing (a no-op rotateY tween).
    const wasShowingNext = showingNextRef.current;

    // Populate whichever face is about to become visible (the one NOT
    // currently showing) with that item - flushSync forces the resulting
    // Image src/text change to commit to the DOM synchronously, before the
    // GSAP timeline below is built and starts playing. Without it, React's
    // batched update could still be pending when the flip's first frame
    // renders, so the revealed face would flash its old content for a
    // moment before "popping" to the new one mid-flip.
    flushSync(() => {
      setCurrentIndex(newIndex);
      if (wasShowingNext) {
        setFrontIndex(newIndex);
      } else {
        setBackIndex(newIndex);
      }
    });

    showingNextRef.current = !wasShowingNext;

    const outgoingRef = wasShowingNext ? nextTextRef : prevTextRef;
    const incomingRef = wasShowingNext ? prevTextRef : nextTextRef;

    // Keep spinning the same way you're clicking rather than snapping back
    // and forth between 0/180 - +180 per "next", -180 per "previous",
    // accumulating indefinitely for a true circular rotation. Vertical mode
    // spins the opposite way per click, so it flips which sign goingNext
    // maps to here. This is the card flip only - untouched otherwise.
    const flipGoingNext = isVertical ? !goingNext : goingNext;
    rotationRef.current += flipGoingNext ? 180 : -180;
    const rotateValue = rotationRef.current;

    // Reduced motion: skip the flip/text tweens entirely and snap straight
    // to the settled end state - no rotation, no slide, no tilt, no fade,
    // just an instant content swap on click.
    if (prefersReducedMotion()) {
      gsap.set(flipperRef.current, { [flipAxis]: rotateValue });
      gsap.set(outgoingRef.current, {
        xPercent: 0,
        yPercent: 0,
        rotateX: 0,
        rotateY: 0,
        opacity: 0,
      });
      gsap.set(incomingRef.current, {
        xPercent: 0,
        yPercent: 0,
        rotateX: 0,
        rotateY: 0,
        opacity: 1,
      });
      isAnimatingRef.current = false;
      return;
    }

    isAnimatingRef.current = true;

    const tl = gsap.timeline({
      defaults: { duration: DURATION, ease: EASE },
      onComplete: () => {
        isAnimatingRef.current = false;
      },
    });

    // Card flip - untouched.
    tl.to(
      flipperRef.current,
      { [flipAxis]: rotateValue, ease: resolvedEase, duration: 0.7 },
      0,
    );

    // Text tweens are built as their own timeline, separate from the card
    // flip above, and branch completely per direction - each branch has
    // its own constants (see the VERTICAL_* block near the top of the
    // file) so vertical's rotation/translate can be tweaked freely without
    // touching horizontal mode's behavior at all.
    const textTl = gsap.timeline();

    if (isVertical) {
      // On "next": outgoing (current) ends at rotateX -45/yPercent -40/
      // opacity 0, incoming starts at the opposite rotateX/yPercent and
      // settles to 0/0/1 - unless the REVERSED flags above are flipped,
      // in which case that mapping inverts. Rotation and translate each
      // have their own independent REVERSED flag.
      const rotateGoingNext = VERTICAL_TEXT_ROTATE_REVERSED ? !goingNext : goingNext;
      const translateGoingNext = VERTICAL_TEXT_TRANSLATE_REVERSED ? !goingNext : goingNext;

      const outgoingEndRotate = rotateGoingNext
        ? VERTICAL_TEXT_ROTATE_DEG
        : -VERTICAL_TEXT_ROTATE_DEG;
      const outgoingEndY = translateGoingNext
        ? -VERTICAL_TEXT_TRANSLATE_PERCENT*2
        : VERTICAL_TEXT_TRANSLATE_PERCENT*2;
      const incomingStartRotate = rotateGoingNext
        ? -VERTICAL_TEXT_ROTATE_DEG
        : VERTICAL_TEXT_ROTATE_DEG;
      const incomingStartY = translateGoingNext
        ? VERTICAL_TEXT_TRANSLATE_PERCENT*2
        : -VERTICAL_TEXT_TRANSLATE_PERCENT*2;

      textTl.to(
        outgoingRef.current,
        {
          yPercent: outgoingEndY,
          rotateX: outgoingEndRotate,
          duration: VERTICAL_OUTGOING_DURATION * 1.5,
          ease: resolvedEase,
        },
        0,
      );
      textTl.to(outgoingRef.current, { opacity: 0, delay: -0.3, duration: 0 });
      textTl.fromTo(
        incomingRef.current,
        { yPercent: incomingStartY, rotateX: incomingStartRotate, opacity: 0 },
        {
          yPercent: 0,
          rotateX: 0,
          opacity: 1,
          duration: VERTICAL_OUTGOING_DURATION * 1.5,
          ease: resolvedEase,
        },
        0.15,
      );
    } else {
      // Horizontal mode - original behavior, untouched.
      const outgoingEndRotate = goingNext ? TEXT_ROTATE_DEG : -TEXT_ROTATE_DEG;
      const outgoingEndX = goingNext
        ? TEXT_TRANSLATE_PERCENT
        : -TEXT_TRANSLATE_PERCENT;
      const incomingStartRotate = goingNext ? -TEXT_ROTATE_DEG : TEXT_ROTATE_DEG;
      const incomingStartX = goingNext
        ? -TEXT_TRANSLATE_PERCENT
        : TEXT_TRANSLATE_PERCENT;

      textTl.to(
        outgoingRef.current,
        {
          xPercent: outgoingEndX,
          rotateY: outgoingEndRotate,
          duration: OUTGOING_DURATION * 1.5,
          ease: resolvedEase,
        },
        0,
      );
      textTl.to(outgoingRef.current, { opacity: 0, delay: -0.3, duration: 0 });
      textTl.fromTo(
        incomingRef.current,
        { xPercent: incomingStartX, rotateY: incomingStartRotate, opacity: 0 },
        {
          xPercent: 0,
          rotateY: 0,
          opacity: 1,
          duration: OUTGOING_DURATION * 1.5,
          ease: resolvedEase,
        },
        0.15,
      );
    }

    tl.add(textTl, 0);
  };

  // Used by the prev/next buttons - steps one item at a time, wrapping
  // (infinite) or clamping (not infinite) at the ends exactly as before.
  const switchTo = (direction: "prev" | "next") => {
    const goingNext = direction === "next";
    const wasShowingNext = showingNextRef.current;
    const currentVisibleIndex = wasShowingNext ? backIndex : frontIndex;
    const rawIndex = currentVisibleIndex + (goingNext ? 1 : -1);
    const newIndex = infinite
      ? ((rawIndex % ITEMS.length) + ITEMS.length) % ITEMS.length
      : rawIndex;

    if (!infinite && (newIndex < 0 || newIndex >= ITEMS.length)) return;

    flipTo(direction, newIndex);
  };

  // Used by the pagination dots - jumps straight to an arbitrary index in
  // one flip rather than stepping through every item in between. Picks
  // whichever of "next"/"prev" is the shorter way round when infinite
  // (wraps), or simply whichever way the target sits when not.
  const goToIndex = (targetIndex: number) => {
    if (targetIndex === currentIndex) return;

    let direction: "prev" | "next";
    if (infinite) {
      const forwardDistance =
        ((targetIndex - currentIndex) % ITEMS.length + ITEMS.length) %
        ITEMS.length;
      direction = forwardDistance <= ITEMS.length - forwardDistance ? "next" : "prev";
    } else {
      direction = targetIndex > currentIndex ? "next" : "prev";
    }

    flipTo(direction, targetIndex);
  };

  return (
    <>
      {/* perspective-distant sets how far the viewer sits from the 3D plane -
        without it on an ancestor, the card's rotateY below would have
        nothing to render into and just look like a horizontal squash. */}
      <div
        className="flex flex-col items-center justify-center w-full h-full gap-4"
      >
        <div
          className={`dimensional-card relative ${cardClassName}`}
          style={{ perspective: "1000px", width: cardWidth, height: cardHeight }}
        >
          <div ref={flipperRef} className="relative h-full w-full transform-3d">
            {/* Front face */}
            <div
              className="absolute inset-0 h-full w-full overflow-hidden backface-hidden prev-card-face"
              style={{ borderRadius: cardBorderRadius }}
            >
              <Image
                src={ITEMS[frontIndex].image}
                className="w-full h-full object-cover"
                alt={ITEMS[frontIndex].text}
                width={300}
                height={250}
              />
            </div>

            {/* Back face - pre-rotated 180deg (around whichever axis this
                slider flips on) so it faces away until the flipper above
                rotates the whole thing back around to it. */}
            <div
              className={`absolute inset-0 h-full w-full overflow-hidden backface-hidden next-card-face ${
                isVertical ? "rotate-x-180" : "rotate-y-180"
              }`}
              style={{ borderRadius: cardBorderRadius }}
            >
              <Image
                src={ITEMS[backIndex].image}
                className="w-full h-full object-cover"
                alt={ITEMS[backIndex].text}
                width={300}
                height={250}
              />
            </div>
          </div>

          {/* Nested inside the card's own relative wrapper (not the outer
              flex container) so it's actually centered over the card. */}
        </div>
        <div
          className="absolute inset-0 z-10 flex items-center justify-center w-[60%] h-[25vw] max-md:w-[90%] max-md:h-[100vw] max-[1024px]:w-[90%] max-[1024px]:h-[60vw]  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-md:text-[10vw]! max-[1024px]:text-[8vw]! "
          style={{ perspective: "1000px", fontSize: textSize }}
        >
          <div
            ref={prevTextRef}
            className="absolute w-fit text-center font-semibold prev-text"
            style={{ color: textColor }}
          >
            {ITEMS[frontIndex].text}
          </div>
          <div
            ref={nextTextRef}
            className="absolute w-fit text-center font-semibold next-text  opacity-0"
            style={{ color: textColor }}
          >
            {ITEMS[backIndex].text}
          </div>
        </div>

        <div className="flex gap-4 z-10  absolute bottom-8 max-md:bottom-40 max-[1024px]:bottom-32">
          <button
            type="button"
            onClick={() => switchTo("prev")}
            aria-label="Previous"
            disabled={!infinite && currentIndex === 0}
            className="flex h-12 w-12 max-[1024px]:h-20 max-[1024px]:w-20 max-md:h-16 max-md:w-16 items-center justify-center rounded-full border border-white/20 bg-transparent text-white backdrop-blur-[10px] transition-colors duration-300 ease-in-out hover:bg-[#ff5f00] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <ArrowLeft />
          </button>
          <button
            type="button"
            onClick={() => switchTo("next")}
            aria-label="Next"
            disabled={!infinite && currentIndex === ITEMS.length - 1}
            className="flex h-12 w-12 max-[1024px]:h-20 max-[1024px]:w-20 max-md:h-16 max-md:w-16 items-center justify-center rounded-full border border-white/20 bg-transparent text-white backdrop-blur-[10px] transition-colors duration-300 ease-in-out hover:bg-[#ff5f00] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <ArrowRight />
          </button>
        </div>

        <div className="flex gap-2 z-10 absolute bottom-30 max-[1024px]:bottom-64">
          {ITEMS.map((item, idx) => (
            <button
              key={item.text}
              type="button"
              onClick={() => goToIndex(idx)}
              aria-label={`Go to ${item.text}`}
              aria-current={idx === currentIndex}
              className={`h-2 max-[1024px]:h-4 max-md:h-3 rounded-full transition-all duration-300 ease-in-out ${
                idx === currentIndex
                  ? "w-6 max-[1024px]:w-8  bg-[#ff5f00]"
                  : "w-2 max-[1024px]:w-4 max-md:w-3 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default DimensionalSwitchSlider;
