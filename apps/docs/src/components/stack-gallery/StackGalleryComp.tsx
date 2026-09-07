// Built using Hyperiux Vault: https://vault.hyperiux.com
'use client'
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/dist/Flip";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

gsap.registerPlugin(Flip);

export interface StackGalleryItem {
  id?: string | number;
  image: string;
  alt?: string;
  caption?: string;
}

export interface StackGalleryCompProps {
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
  onClose?: () => void;
  className?: string;
}

/**
 * Every card is rendered exactly once into a single absolutely-positioned layer.
 * Selecting reorders state, the layer recomputes each card's slot geometry, and
 * GSAP Flip tweens the difference — so the incoming card flies right into the
 * hero frame while the outgoing hero shrinks left into the slot it vacated.
 */
const StackGalleryComp = ({
  items = [],
  title = "Field Kit",
  meta = "VANTA / Product photography / 2026",
  description = "Six frames from one afternoon in the studio. Every piece shot on the same light, so the range reads as one family.",
  backgroundColor = "#e9e9e7",
  textColor = "#111111",
  mutedColor = "#8a8a86",
  rounded = 20,
  thumbWidth = 108,
  thumbHeight = 120,
  thumbGap = 12,
  heroWidth = 530,
  heroHeight = 670,
  duration = 0.85,
  ease = "power3.inOut",
  stackOffsetX = 3,
  stackOffsetY = 9,
  stackRotation = 0,
  showCounter = true,
  onClose,
  className = "",
}: StackGalleryCompProps) => {
  const reducedMotion = usePrefersReducedMotion();

  const [order, setOrder] = useState<number[]>(() => items.map((_, i) => i));
  const [opened, setOpened] = useState(false);
  const [stageWidth, setStageWidth] = useState(0);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Map<number, HTMLElement>>(new Map());
  const flipStateRef = useRef<Flip.FlipState | null>(null);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    setOrder(items.map((_, i) => i));
  }, [items]);

  useLayoutEffect(() => {
    const el = stageRef.current;
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
      flipStateRef.current = Flip.getState(orderedCards(), { props: "borderRadius" });
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
    [order, orderedCards]
  );

  // Play the swap forward from the captured pre-render state.
  useLayoutEffect(() => {
    const state = flipStateRef.current;
    if (!state) return;
    flipStateRef.current = null;
    if (reducedMotion) return;

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
  }, [order, duration, ease, reducedMotion]);

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
        duration: duration * 1.15,
        ease,
        absolute: true,
        props: "borderRadius",
        // Cards peel off the pile one after another into their slots.
        stagger: 0.05,
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
        duration: duration * 1.15,
        ease,
        absolute: true,
        props: "borderRadius",
        // Reverse of the open stagger: cards drop back onto the pile in order.
        stagger: { each: 0.05, from: "end" },
        onComplete: () => {
          isAnimatingRef.current = false;
        },
      });
    });
    onClose?.();
  }, [opened, reducedMotion, orderedCards, duration, ease, onClose]);

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
  const hero = items[heroItemIndex];
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

  return (
    <div
      className={`hxs-stack-gallery ${className}`}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100svh",
        background: backgroundColor,
        color: textColor,
        overflow: "hidden",
      }}
    >
      {showCounter && (
        <div
          style={{
            ...chromeStyle,
            position: "absolute",
            top: 32,
            left: 40,
            fontSize: 13,
            letterSpacing: "0.02em",
            zIndex: 60,
          }}
        >
          <span style={{ fontWeight: 600 }}>
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
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100svh",
          cursor: opened ? "pointer" : "default",
        }}
      >
        {/* Copy column, centred between rail and hero */}
        <div
          style={{
            ...chromeStyle,
            position: "absolute",
            left: railX + tW + Math.max(48, stageWidth * 0.06),
            top: "50%",
            transform: "translateY(-50%)",
            maxWidth: 320,
            // Above the travelling cards so the copy stays readable as they cross.
            zIndex: 30,
            pointerEvents: "none",
            display: isNarrow ? "none" : "block",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(28px, 3.2vw, 46px)",
              lineHeight: 1.05,
              fontWeight: 400,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            {title}
          </h2>
          <p style={{ color: mutedColor, fontSize: 13, margin: "14px 0 26px" }}>{meta}</p>
          <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0 }}>{description}</p>
          {hero?.caption && (
            <p key={hero.caption} style={{ fontSize: 13, fontWeight: 600, marginTop: 28 }}>
              {hero.caption}
            </p>
          )}
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
              style={{
                ...cardStyle(itemIndex),
                padding: 0,
                border: "none",
                background: "#d8d8d4",
                overflow: "hidden",
                cursor: !opened ? "pointer" : isHero ? "default" : "pointer",
                boxShadow: "0 18px 40px -24px rgba(0,0,0,0.45)",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <img
                src={item.image}
                alt={item.alt ?? ""}
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  borderRadius: "inherit",
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StackGalleryComp;
