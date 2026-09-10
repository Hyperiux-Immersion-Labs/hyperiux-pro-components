// Built using Hyperiux Vault: https://vault.hyperiux.com
'use client'
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/dist/Flip";
import { SplitText } from "gsap/dist/SplitText";
import Image from "next/image";

gsap.registerPlugin(Flip, SplitText);

export interface StackGalleryItem {
  id?: string | number;
  image: string;
  alt?: string;
  caption?: string;
}

export interface StackGalleryProps {
  items?: StackGalleryItem[];
  title?: string;
  meta?: string;
  description?: string;
  backgroundColor?: string;
  textColor?: string;
  mutedColor?: string;
  rounded?: number;
  thumbWidth?: number;
  thumbHeight?: number;
  thumbGap?: number;
  heroWidth?: number;
  heroHeight?: number;
  duration?: number;
  ease?: string;
  stackOffsetX?: number;
  stackOffsetY?: number;
  stackRotation?: number;
  showCounter?: boolean;
  /** Lines of caption space to reserve so swapping never reflows the copy. */
  captionLines?: number;
  captionFadeDuration?: number;
  captionRevealDuration?: number;
  captionLineStagger?: number;
  onClose?: () => void;
  className?: string;
}



const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.(REDUCED_MOTION_QUERY)?.matches ?? false;
}

function subscribeToReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQueryList = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQueryList.addEventListener("change", callback);
  return () => mediaQueryList.removeEventListener("change", callback);
}

function getServerReducedMotionSnapshot() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    prefersReducedMotion,
    getServerReducedMotionSnapshot
  );
}


// Caption metrics are pinned rather than left to the cascade: the reserved
// slot height must be derived from the exact same line-height the text renders
// at, or the reservation drifts out of sync with the content.
// Desktop caption renders at text-[1vw] with leading-[1.3], so one line is
// 1.3vw tall. The reserved slot is derived from the same numbers — if these
// drift apart the fixed-height guarantee stops holding.
const CAPTION_FONT_VW = 1;
const CAPTION_LINE_RATIO = 1.3;
const CAPTION_LINE_VW = CAPTION_FONT_VW * CAPTION_LINE_RATIO;
// Mobile caption is sized in vw, so the reserved height is expressed in the
// same units — an `em` on the wrapper would resolve against the wrapper's own
// font-size, not the paragraph's, and under-reserve.
const CAPTION_MOBILE_LINE_RATIO = 1.5;
const CAPTION_MOBILE_LINE = `${3 * CAPTION_MOBILE_LINE_RATIO}vw`;
const CAPTION_MOBILE_LINE_SM = `${3.5 * CAPTION_MOBILE_LINE_RATIO}vw`;

const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=800&h=1000&fit=crop`;

const defaultItems: StackGalleryItem[] = [
  {
    id: 0,
    image: UNSPLASH('1500534623283-312aade485b7'),
    alt: 'Coastal cliffs meeting open water',
    caption: 'Late light on the headland, shot from the cliff path.',
  },
  {
    id: 1,
    image: UNSPLASH('1519681393784-d120267933ba'),
    alt: 'Mountain range under night sky',
    caption: 'The ridge holds its last colour long after the sun goes.',
  },
  {
    id: 2,
    image: UNSPLASH('1470252649378-9c29740c9fa8'),
    alt: 'Star field over a dark ridge',
    caption: 'Clear enough that night to read the whole sky at once.',
  },
  {
    id: 3,
    image: UNSPLASH('1506905925346-21bda4d32df4'),
    alt: 'Mist settling across a valley',
    caption: 'Mist gathers in the valley before the morning burns it off.',
  },
  {
    id: 4,
    image: UNSPLASH('1439066615861-d1af74d74000'),
    alt: 'Forest ridge in low cloud',
    caption: 'Cloud sits low on the treeline and refuses to lift.',
  },
  {
    id: 5,
    image: UNSPLASH('1444927714506-8492d94b4e3d'),
    alt: 'Waves breaking along a shoreline',
    caption: 'The tide works the same stretch of shore all afternoon.',
  },
];


const StackGallery = ({
  items = defaultItems,
  title = "Stack Gallery",
  meta = "Hyperiux Vault / GSAP Flip / React",
  description = "A pile of cards that fans into a hero and a rail. Tap any frame and the two trade places — same nodes, measured and tweened, never re-mounted.",
  backgroundColor = "#e9e9e7",
  textColor = "#111111",
  mutedColor = "#8a8a86",
  rounded = 20,
  thumbWidth = 108,
  thumbHeight = 120,
  thumbGap = 12,
  heroWidth = 530,
  heroHeight = 670,
  duration = 0.7,
  ease = "power3.inOut",
  stackOffsetX = 3,
  stackOffsetY = 9,
  stackRotation = 0,
  showCounter = true,
  captionLines = 2,
  captionFadeDuration = 0.25,
  captionRevealDuration = 0.55,
  captionLineStagger = 0.07,
  onClose,
  className = "",
}: StackGalleryProps) => {
  const reducedMotion = usePrefersReducedMotion();

  const [order, setOrder] = useState<number[]>(() => items.map((_, i) => i));
  const [opened, setOpened] = useState(false);
  const [stageWidth, setStageWidth] = useState(0);

  const stageRef = useRef<HTMLDivElement | null>(null);
  // Measured on the outer wrapper, which is present in BOTH the desktop and
  // mobile trees and is never padded — so the breakpoint can't feed a
  // narrowed width back into itself and oscillate.
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Map<number, HTMLElement>>(new Map());
  const flipStateRef = useRef<Flip.FlipState | null>(null);
  const isAnimatingRef = useRef(false);

  // The caption currently painted in the copy column. It lags `order` by one
  // fade so the outgoing text can leave before the incoming text is mounted.
  const [shownCaption, setShownCaption] = useState<string | undefined>(
    () => items[0]?.caption
  );
  const captionRef = useRef<HTMLParagraphElement | null>(null);
  const captionTweenRef = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null);
  const captionSplitRef = useRef<SplitText | null>(null);

  // SplitText replaces the paragraph's text node with its own line/mask
  // elements. React still holds a handle on the original node, so the split
  // MUST be reverted before React commits new text — otherwise the update
  // lands on a detached node and the stale string stays on screen.
  const revertCaptionSplit = useCallback(() => {
    captionSplitRef.current?.revert();
    captionSplitRef.current = null;
  }, []);

  useEffect(() => {
    setOrder(items.map((_, i) => i));
  }, [items]);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => setStageWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const registerCard = useCallback((index: number, node: HTMLElement | null) => {
    if (node) cardRefs.current.set(index, node);
    else cardRefs.current.delete(index);
  }, []);

  const orderedCards = useCallback(
    () => order.map((i) => cardRefs.current.get(i)).filter(Boolean) as HTMLElement[],
    [order]
  );

  // Mobile breakpoint mirrors the Tailwind `max-[1025px]:` idiom used across
  // the repo. Below it the component drops the absolutely-positioned Flip
  // stage entirely and renders a plain flow layout instead.
  const isMobile = stageWidth > 0 && stageWidth <= 1025;
  const isNarrow = stageWidth > 0 && stageWidth < 900;
  const railCount = Math.max(items.length - 1, 0);
  const scale = isNarrow ? Math.min(1, stageWidth / 900) : 1;

  const tW = thumbWidth * scale;
  const tH = thumbHeight * scale;
  const gap = thumbGap * scale;
  const hW = Math.min(heroWidth * scale, stageWidth * 0.46);
  const hH = heroHeight * (hW / heroWidth || 1);
  const railX = Math.max(24, stageWidth * 0.045);
  const heroX = stageWidth - hW - railX;

  // Resting pile size — portrait card, matching the closed state.
  const stackWidth = Math.min(215 * scale, stageWidth * 0.42);
  const stackHeight = stackWidth * 1.5;

  /** Geometry for the card currently sitting in `slot` (0 = hero). */
  const slotBox = useCallback(
    (slot: number) => {
      if (slot === 0) {
        return { x: heroX, y: 0, w: hW, h: hH, r: rounded * scale, z: items.length + 1 };
      }
      const railHeight = railCount * tH + (railCount - 1) * gap;
      const top = -railHeight / 2 + (slot - 1) * (tH + gap);
      // Depth descends with slot so the ordering is continuous with the
      // stacked state — a flat z here makes the pile reshuffle on the first
      // frame of the opening tween.
      return {
        x: railX,
        y: top + tH / 2,
        w: tW,
        h: tH,
        r: rounded * 0.6 * scale,
        z: items.length - slot,
      };
    },
    [heroX, hW, hH, railX, tW, tH, gap, railCount, rounded, scale, items.length]
  );

  const select = useCallback(
    (itemIndex: number) => {
      if (itemIndex === order[0] || isAnimatingRef.current) return;
      // On mobile there is no Flip stage — the grid reflows on its own.
      if (!isMobile) {
        flipStateRef.current = Flip.getState(orderedCards(), { props: "borderRadius" });
      }
      setOrder((prev) => {
        const next = [...prev];
        const from = next.indexOf(itemIndex);
        // Two-way exchange: clicked card takes the hero slot, old hero drops
        // into the rail slot the clicked card just vacated.
        next[from] = next[0];
        next[0] = itemIndex;
        return next;
      });
    },
    [order, orderedCards, isMobile]
  );

  // Play the swap forward from the captured pre-render state.
  useLayoutEffect(() => {
    const state = flipStateRef.current;
    if (!state) return;
    flipStateRef.current = null;
    if (reducedMotion || isMobile) return;

    isAnimatingRef.current = true;
    Flip.from(state, {
      duration,
      ease,
      absolute: true,
      props: "borderRadius",
      onEnter: (els) => gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration }),
      onComplete: () => {
        isAnimatingRef.current = false;
      },
    });
  }, [order, duration, ease, reducedMotion, isMobile]);

  // Click the pile to fan it out into hero + rail.
  const open = useCallback(() => {
    if (opened || isAnimatingRef.current || stageWidth === 0) return;

    if (reducedMotion) {
      setOpened(true);
      return;
    }

    const state = Flip.getState(orderedCards(), { props: "borderRadius" });
    setOpened(true);

    requestAnimationFrame(() => {
      isAnimatingRef.current = true;
      Flip.from(state, {
        duration: duration * 1.0,
        ease,
        absolute: true,
        props: "borderRadius",
        // Cards peel off the pile one after another into their slots.
        stagger: 0.04,
        onComplete: () => {
          isAnimatingRef.current = false;
        },
      });
    });
  }, [opened, stageWidth, reducedMotion, orderedCards, duration, ease]);

  // Collapse the fanned-out layout back into the resting pile.
  const close = useCallback(() => {
    if (!opened || isAnimatingRef.current) return;

    if (reducedMotion) {
      setOpened(false);
      onClose?.();
      return;
    }

    const state = Flip.getState(orderedCards(), { props: "borderRadius" });
    setOpened(false);

    requestAnimationFrame(() => {
      isAnimatingRef.current = true;
      Flip.from(state, {
        duration: duration * 0.9,
        ease,
        absolute: true,
        props: "borderRadius",
        // Reverse of the open stagger: cards drop back onto the pile in order.
        stagger: { each: 0.035, from: "end" },
        onComplete: () => {
          isAnimatingRef.current = false;
        },
      });
    });
    onClose?.();
  }, [opened, reducedMotion, orderedCards, duration, ease, onClose]);

  // Caption cross-fade, part 1: the hero changed, so fade the caption that is
  // on screen out and only then swap in the new string. Keeping the swap in a
  // callback is what makes the two halves read as one exchange rather than a
  // hard cut.
  const nextCaption = items[order[0]]?.caption;
  // With motion reduced there is nothing to fade, so the caption is simply
  // derived — no state hop, no cascading render.
  const activeCaption = reducedMotion ? nextCaption : shownCaption;

  useEffect(() => {
    if (reducedMotion || nextCaption === shownCaption) return;

    const el = captionRef.current;
    if (!el) {
      revertCaptionSplit();
      setShownCaption(nextCaption);
      return;
    }

    captionTweenRef.current?.kill();
    captionTweenRef.current = gsap.to(el, {
      opacity: 0,
      y: -8,
      duration: captionFadeDuration,
      ease: "power2.in",
      onComplete: () => {
        revertCaptionSplit();
        setShownCaption(nextCaption);
      },
    });
  }, [nextCaption, shownCaption, reducedMotion, captionFadeDuration, revertCaptionSplit]);

  // Caption cross-fade, part 2: the new string is mounted — split it into
  // masked lines and lift them in from below, staggered.
  useLayoutEffect(() => {
    const el = captionRef.current;
    if (!el || !activeCaption) return;

    if (reducedMotion) {
      revertCaptionSplit();
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    captionTweenRef.current?.kill();
    // Clear any split left over from the previous caption before measuring.
    revertCaptionSplit();
    gsap.set(el, { opacity: 1, y: 0 });

    const split = SplitText.create(el, {
      type: "lines",
      linesClass: "hxs-caption-line",
      mask: "lines",
    });
    captionSplitRef.current = split;

    const lines = split.lines;
    if (!lines?.length) {
      revertCaptionSplit();
      return;
    }

    gsap.set(lines, { yPercent: 100 });
    captionTweenRef.current = gsap.to(lines, {
      yPercent: 0,
      duration: captionRevealDuration,
      stagger: captionLineStagger,
      ease: "power3.out",
    });

    return () => {
      captionTweenRef.current?.kill();
      revertCaptionSplit();
    };
  }, [activeCaption, reducedMotion, captionRevealDuration, captionLineStagger, revertCaptionSplit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (!opened || items.length < 2) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") select(order[1]);
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") select(order[order.length - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [order, select, close, opened, items.length]);

  if (items.length === 0) return null;

  const heroItemIndex = order[0];
  const heroItem = items[heroItemIndex];
  // Counter reflects which source image is on screen, matching the reference.
  const heroSlotLabel = heroItemIndex + 1;

  const cardStyle = (itemIndex: number): React.CSSProperties => {
    const slot = order.indexOf(itemIndex);

    // Pre-open: the set rests centred on stage, cards squarely behind one
    // another and stepped down, so the pile reads as a physical stack.
    if (!opened) {
      const w = stackWidth;
      const h = stackHeight;
      return {
        position: "absolute",
        left: stageWidth / 2 - w / 2,
        top: "50%",
        width: w,
        height: h,
        borderRadius: rounded * 0.75 * scale,
        transform: `translateY(-50%) translate(${slot * stackOffsetX}px, ${
          slot * stackOffsetY
        }px) rotate(${slot * stackRotation}deg)`,
        // Front of the pile is the card that will become the hero.
        zIndex: items.length - slot,
      };
    }

    const box = slotBox(slot);
    return {
      position: "absolute",
      left: box.x,
      top: "50%",
      width: box.w,
      height: box.h,
      borderRadius: box.r,
      transform: `translateY(calc(-50% + ${box.y}px))`,
      zIndex: box.z,
    };
  };

  // Counter, close button and copy only exist once the pile has fanned out.
  const chromeStyle: React.CSSProperties = {
    opacity: opened ? 1 : 0,
    transition: "opacity 0.5s ease 0.25s",
    pointerEvents: opened ? undefined : "none",
  };


  if (isMobile) {
    return (
      <div
        ref={rootRef}
        className={`hxs-stack-gallery relative w-full min-h-svh overflow-hidden ${className}`}
        // Colours stay inline: they are props, so Tailwind's JIT can't see them.
        style={{ background: backgroundColor, color: textColor }}
      >
        <div className="min-h-svh px-[5vw] py-[8vw] flex flex-col gap-[6vw]">
          {showCounter && (
            <div className="text-[3vw] tracking-[0.02em]">
              <span className="font-semibold">
                {String(heroSlotLabel).padStart(2, "0")}
              </span>
              <span style={{ color: mutedColor }}>
                {" "}
                / {String(items.length).padStart(2, "0")}
              </span>
            </div>
          )}

          {/* Expanded hero */}
          {heroItem && (
            <div

              className="relative w-full flex-1 min-h-[45svh] overflow-hidden bg-[#d8d8d4] shadow-[0_18px_40px_-24px_rgba(0,0,0,0.45)]"
              style={{ borderRadius: rounded }}
            >
              <Image
                src={heroItem.image}
                alt={heroItem.alt ?? ""}
                draggable={false}
                fill
                // Hero spans the viewport minus the 5vw gutters.
                sizes="90vw"
                priority
                className="object-cover"
              />
            </div>
          )}

          {/* Copy sits below the expanded image */}
          <div className="max-[1025px]:pb-[3vh]">
            <h2
              className="text-[7vw]  max-md:text-[8.5vw] leading-[1.05] m-0 font-normal tracking-[-0.02em]"
            >
              {title}
            </h2>
            <p
              className="text-[3vw] max-md:text-[3.5vw] mt-[3vw] mb-[4vw]"
              style={{ color: mutedColor }}
            >
              {meta}
            </p>
            <p className="text-[3.2vw] max-md:text-[3.8vw] leading-[1.65] m-0">
              {description}
            </p>
            {/* Same reserved slot as desktop: keeps the grid below from
                jumping when a taller caption swaps in. */}
            <div
              className="mt-[5vw] h-[calc(var(--hxs-cap-line)*var(--hxs-cap-lines))] max-md:[--hxs-cap-line:var(--hxs-cap-line-sm)]"
              style={
                {
                  "--hxs-cap-line": CAPTION_MOBILE_LINE,
                  "--hxs-cap-line-sm": CAPTION_MOBILE_LINE_SM,
                  "--hxs-cap-lines": captionLines,
                } as React.CSSProperties
              }
            >
              <p
                ref={captionRef}
                className="text-[3vw] text-left max-md:text-left max-md:w-[80%] max-md:text-[4vw] w-[80%]  m-0  leading-normal"
              >
                {activeCaption}
              </p>
            </div>
          </div>

          {/* Remaining images, 3 per row */}
          <div className="grid grid-cols-3 gap-[3vw]">
            {order.slice(1).map((itemIndex) => {
              const item = items[itemIndex];
              if (!item) return null;
              return (
                <button
                  key={item.id ?? itemIndex}
                  type="button"
                  onClick={() => select(itemIndex)}
                  aria-label={item.alt ?? item.caption ?? `Image ${itemIndex + 1}`}
                  className="relative p-0 border-none overflow-hidden aspect-4/5 w-full bg-[#d8d8d4] [-webkit-tap-highlight-color:transparent]"
                  style={{ borderRadius: rounded * 0.6 }}
                >
                  <Image
                    src={item.image}
                    alt={item.alt ?? ""}
                    draggable={false}
                    fill
                    // Three-up grid inside the 90vw content column.
                    sizes="30vw"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={`hxs-stack-gallery relative w-full min-h-svh overflow-hidden ${className}`}
      // Colours stay inline: they are props, so Tailwind's JIT can't see them.
      style={{ background: backgroundColor, color: textColor }}
    >
      {showCounter && (
        <div
          className="absolute top-[2.22vw] left-[2.78vw] text-[0.9vw] tracking-[0.02em] z-[60]"
          // chromeStyle is state-driven (opacity/pointer-events follow `opened`).
          style={chromeStyle}
        >
          <span className="font-semibold">
            {String(heroSlotLabel).padStart(2, "0")}
          </span>
          <span style={{ color: mutedColor }}> / {String(items.length).padStart(2, "0")}</span>
        </div>
      )}

      <div
        ref={stageRef}
        // Clicking empty space (not a card) collapses back to the pile.
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className={`relative w-full min-h-svh ${opened ? "cursor-pointer" : "cursor-default"}`}
      >
        {/* Copy column, centred between rail and hero */}
        <div
          // Above the travelling cards so the copy stays readable as they cross.
          className={`absolute top-1/2 -translate-y-1/2 max-w-[22.22vw] z-30 pointer-events-none ${
            isNarrow ? "hidden" : "block"
          }`}
          // `left` is measured from the live stage width, so it stays inline.
          style={{ ...chromeStyle, left: railX + tW + Math.max(48, stageWidth * 0.06) }}
        >
          <h2
            className="text-[3.2vw] leading-[1.05] font-normal tracking-[-0.02em] m-0"
          >
            {title}
          </h2>
          <p className="text-[0.9vw] mt-[0.97vw] mb-[1.81vw] mx-0" style={{ color: mutedColor }}>
            {meta}
          </p>
          <p className="text-[0.97vw] leading-[1.65] m-0">{description}</p>
          {/* Fixed-height slot. The box is sized for `captionLines` up front so
              a one-line caption swapping to a two-line one cannot reflow the
              column — which, being translateY(-50%) centred, would otherwise
              shift every line of copy above it. */}
          <div
            className="mt-[1.94vw]"
            // Height is derived from captionLines, so it stays inline.
            style={{ height: `${CAPTION_LINE_VW * captionLines}vw` }}
          >

            <p
              ref={captionRef}
              className="text-[1vw] w-[80%] text-left leading-[1.3]  m-0 "
            >
              {activeCaption}
            </p>
          </div>
        </div>

        {/* Single persistent card layer — the Flip subjects */}
        {items.map((item, itemIndex) => {
          const isHero = itemIndex === heroItemIndex;
          return (
            <button
              key={item.id ?? itemIndex}
              type="button"
              ref={(n) => registerCard(itemIndex, n)}
              data-flip-id={`hxs-card-${item.id ?? itemIndex}`}
              onClick={() => (opened ? select(itemIndex) : open())}
              aria-label={
                opened
                  ? item.alt ?? item.caption ?? `Image ${itemIndex + 1}`
                  : `Open gallery — ${items.length} images`
              }
              aria-current={(opened && isHero) || undefined}
              tabIndex={!opened ? (itemIndex === order[0] ? 0 : -1) : isHero ? -1 : 0}
              className={`p-0 border-none bg-[#d8d8d4] overflow-hidden shadow-[0_18px_40px_-24px_rgba(0,0,0,0.45)] [-webkit-tap-highlight-color:transparent] ${
                !opened || !isHero ? "cursor-pointer" : "cursor-default"
              }`}
              // Geometry is measured per-frame and tweened by Flip — inline.
              style={cardStyle(itemIndex)}
            >
              <Image
                src={item.image}
                alt={item.alt ?? ""}
                draggable={false}
                fill
                // Widest the card ever gets is the hero frame.
                sizes={`${Math.max(Math.round(hW), 1)}px`}
                // Radius is a Flip-tweened prop on the button; inheriting keeps
                // the image clipped to it mid-tween.
                className="object-cover rounded-[inherit]"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StackGallery;
