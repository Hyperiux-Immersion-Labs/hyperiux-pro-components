"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";

gsap.registerPlugin(CustomEase);

type SlideItem = { image: string; text: string };

const R2_BASE = "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images";

const ITEMS: SlideItem[] = [
  { image: `${R2_BASE}/h-06.jpg`, text: "Dimensional Switch" },
  { image: `${R2_BASE}/h-18.jpg`, text: "Hyperiux Vault" },
  { image: `${R2_BASE}/h-01.jpg`, text: "Motion Systems" },
  { image: `${R2_BASE}/h-10.jpg`, text: "Interaction Design" },
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
// incoming text starts from before settling to 0/0.
const TEXT_TRANSLATE_PERCENT = 40;
const TEXT_ROTATE_DEG = 45;
// The outgoing text should read as gone well before the card finishes
// flipping, not linger for the whole rotation - so it gets its own shorter,
// front-loaded fade instead of sharing the full flip duration like the
// incoming text does.
const OUTGOING_DURATION = DURATION * 0.45;
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
}

const DimensionalSwitchSlider = ({
  infinite = true,
  ease = DEFAULT_EASE,
  textColor = "#ffffff",
  cardClassName = "",
  cardWidth = "45vw",
  cardHeight = "30vw",
  direction = "horizontal",
}: DimensionalSwitchSliderProps = {}) => {
  const isVertical = direction === "vertical";
  // Which transform properties the flip/text tweens below drive - swapping
  // these is all that's needed to turn the whole interaction 90 degrees:
  // the card flips around X instead of Y, and the text slides on Y and
  // tilts on X instead of sliding on X and tilting on Y.
  const flipAxis = isVertical ? "rotateX" : "rotateY";
  const textTranslateAxis = isVertical ? "yPercent" : "xPercent";
  const textRotateAxis = isVertical ? "rotateX" : "rotateY";
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

  const switchTo = (direction: "prev" | "next") => {
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

    // Advance/retreat through the array. Infinite mode wraps around;
    // non-infinite clamps at the ends and simply does nothing past them
    // (the buttons are also disabled there, see JSX below).
    const currentVisibleIndex = wasShowingNext ? backIndex : frontIndex;
    const rawIndex = currentVisibleIndex + (goingNext ? 1 : -1);
    const newIndex = infinite
      ? ((rawIndex % ITEMS.length) + ITEMS.length) % ITEMS.length
      : rawIndex;

    if (!infinite && (newIndex < 0 || newIndex >= ITEMS.length)) return;

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

    isAnimatingRef.current = true;
    showingNextRef.current = !wasShowingNext;

    const outgoingRef = wasShowingNext ? nextTextRef : prevTextRef;
    const incomingRef = wasShowingNext ? prevTextRef : nextTextRef;

    // Keep spinning the same way you're clicking rather than snapping back
    // and forth between 0/180 - +180 per "next", -180 per "previous",
    // accumulating indefinitely for a true circular rotation. Vertical mode
    // spins the opposite way per click (matches the reversed text motion
    // above), so it flips which sign goingNext maps to here.
    const flipGoingNext = isVertical ? !goingNext : goingNext;
    rotationRef.current += flipGoingNext ? 180 : -180;
    const rotateValue = rotationRef.current;

    // On "next": outgoing (current) ends at rotateY -45/xPercent -40/opacity 0,
    // incoming starts at rotateY 45/xPercent 40/opacity 0 and settles to
    // 0/0/1. On "previous" it's the exact reverse of every sign below -
    // outgoing ends at +45/+40, incoming starts at -45/-40 - so the two
    // texts always swap through opposite sides of each other. Vertical mode
    // reverses this text motion/rotation (only - the card flip direction
    // above is untouched), so it uses the opposite of goingNext here.
    const textGoingNext = isVertical ? !goingNext : goingNext;
    const outgoingEndRotate = textGoingNext ? TEXT_ROTATE_DEG : -TEXT_ROTATE_DEG;
    const outgoingEndX = textGoingNext
      ? TEXT_TRANSLATE_PERCENT
      : -TEXT_TRANSLATE_PERCENT;
    const incomingStartRotate = textGoingNext ? -TEXT_ROTATE_DEG : TEXT_ROTATE_DEG;
    const incomingStartX = textGoingNext
      ? -TEXT_TRANSLATE_PERCENT
      : TEXT_TRANSLATE_PERCENT;

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

    // Outgoing: current text rotates/translates away and fades out.
    tl.to(
      outgoingRef.current,
      {
        [textTranslateAxis]: outgoingEndX,
        [textRotateAxis]: outgoingEndRotate,
        // opacity: 0,
        duration: OUTGOING_DURATION * 1.5,
        ease: resolvedEase,
      },
      0,
    );
    tl.to(outgoingRef.current, {

      opacity: 0,
      delay: -0.3,
      duration: 0,
    });

    // Incoming: next text starts from the opposite rotation/offset, faded
    // out, and settles to center at full opacity.
    tl.fromTo(
      incomingRef.current,
      {
        [textTranslateAxis]: incomingStartX,
        [textRotateAxis]: incomingStartRotate,
        opacity: 0,
      },
      {
        [textTranslateAxis]: 0,
        [textRotateAxis]: 0,
        opacity: 1,
        duration: OUTGOING_DURATION * 1.5,
        ease: resolvedEase,
      },
      0.15,
    );
   
  };

  return (
    <>
      {/* perspective-distant sets how far the viewer sits from the 3D plane -
        without it on an ancestor, the card's rotateY below would have
        nothing to render into and just look like a horizontal squash. */}
      <div
        className="flex flex-col items-center justify-center w-full h-full gap-4"
        style={{ perspective: "800px" }}
      >
        <div
          className={`dimensional-card relative ${cardClassName}`}
          style={{ perspective: "800px", width: cardWidth, height: cardHeight }}
        >
          <div ref={flipperRef} className="relative h-full w-full transform-3d">
            {/* Front face */}
            <div className="absolute inset-0 h-full w-full rounded-md overflow-hidden backface-hidden prev-card-face">
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
              className={`absolute inset-0 h-full w-full rounded-md overflow-hidden backface-hidden next-card-face ${
                isVertical ? "rotate-x-180" : "rotate-y-180"
              }`}
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
          className="absolute inset-0 z-10 flex items-center justify-center text-[5vw] w-[60%] h-[25vw]  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 "
          style={{ perspective: "800px" }}
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

        <div className="flex gap-4 z-10  absolute bottom-12">
          <button
            type="button"
            onClick={() => switchTo("prev")}
            aria-label="Previous"
            disabled={!infinite && currentIndex === 0}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#111111] text-white backdrop-blur-[10px] transition-colors duration-300 ease-in-out hover:bg-[#ff5f00] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#111111]"
          >
            <ArrowLeft />
          </button>
          <button
            type="button"
            onClick={() => switchTo("next")}
            aria-label="Next"
            disabled={!infinite && currentIndex === ITEMS.length - 1}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#111111] text-white backdrop-blur-[10px] transition-colors duration-300 ease-in-out hover:bg-[#ff5f00] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#111111]"
          >
            <ArrowRight />
          </button>
        </div>
      </div>
    </>
  );
};

export default DimensionalSwitchSlider;
