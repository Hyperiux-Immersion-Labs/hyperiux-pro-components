"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);

// Same curve as the standalone FocusText section.
const FOCUS_EASE = CustomEase.create("focusTextWrapEase", "0.16,1,0.3,1");

const REDUCED_MOTION_DURATION = 0.3;

interface FocusTextWrapProps {
  /** The heading to animate - passed through untouched, markup and all. */
  children: ReactNode;
  className?: string;
  characterStagger?: number;
  revealDuration?: number;
  /** Seconds to hold before the reveal starts. Ignored when `scrub` is on,
   * since scrub ties progress to scroll position rather than to time. */
  delay?: number;
  startScale?: number;
  blurAmount?: number;
  /** true = tie progress to scroll position; false = play once on enter. */
  scrub?: boolean;
  scrollStart?: string;
  scrollEnd?: string;
}

/**
 * Wraps an EXISTING heading and applies the focus-text reveal to it, instead of
 * rendering its own <h1> the way the standalone FocusText section does. That
 * keeps each section's own heading markup, classes and responsive type intact -
 * including <br /> and whitespace-pre-line line breaks, which a plain `text`
 * string prop cannot express.
 *
 * Characters are split with SplitText rather than by hand so nested elements
 * and line breaks survive, and the split is reverted on cleanup so React never
 * has to reconcile against DOM the plugin owns.
 */
export default function FocusTextWrap({
  children,
  className = "",
  characterStagger = 0.02,
  revealDuration = 1.1,
  delay = 0,
  startScale = 0.4,
  blurAmount = 0,
  scrub = false,
  scrollStart = "top 85%",
  scrollEnd = "bottom 55%",
}: FocusTextWrapProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const target = root.firstElementChild as HTMLElement | null;
    if (!target) return;

    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let split: SplitText | null = null;

    const ctx = gsap.context(() => {
      // "words,chars" - not "chars" alone. Splitting to characters only turns
      // every letter into its own inline-block, so the browser may wrap a line
      // in the MIDDLE of a word. Splitting words too keeps each word as one
      // unbreakable box, with the characters animated inside it.
      split = SplitText.create(target, {
        type: "words,chars",
        wordsClass: "focus-word",
      });
      const characters = split.chars;

      if (!characters.length) {
        // Nothing to animate - do not leave the heading hidden by the
        // opacity-0 it renders with.
        gsap.set(target, { opacity: 1 });
        return;
      }

      // The heading renders with `opacity-0` so the un-animated text never
      // flashes before this effect runs. Give the characters their from-state
      // FIRST, then reveal the heading - what becomes visible is already the
      // hidden start of the animation.
      gsap.set(characters, {
        opacity: 0,
        ...(prefersReducedMotion
          ? {}
          : { scale: startScale, filter: `blur(${blurAmount}px)` }),
      });
      gsap.set(target, { opacity: 1 });

      if (prefersReducedMotion) {
        // No scale, no blur, no stagger and never tied to scroll position.
        gsap.to(characters, {
          opacity: 1,
          duration: REDUCED_MOTION_DURATION,
          delay,
          ease: "none",
        });
        return;
      }

      gsap.to(characters, {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: revealDuration,
        // A delay on a scrubbed tween would offset it against scroll position
        // rather than time, which is not what a caller passing `delay` wants.
        delay: scrub ? 0 : delay,
        stagger: characterStagger,
        ease: FOCUS_EASE,
        force3D: true,
        // The trigger is the heading itself, never the wrapper: the wrapper is
        // display:contents and so has no box, which ScrollTrigger would resolve
        // to a zero-size rect and fire immediately instead of on scroll.
        scrollTrigger: scrub
          ? {
              trigger: target,
              start: scrollStart,
              end: scrollEnd,
              scrub: true,
            }
          : {
              trigger: target,
              start: scrollStart,
              once: true,
            },
      });
    }, root);

    return () => {
      ctx.revert();
      // revert() kills the tweens; the split must be undone separately so the
      // original heading markup is handed back to React intact.
      split?.revert();
      split = null;
    };
  }, [
    characterStagger,
    revealDuration,
    delay,
    startScale,
    blurAmount,
    scrub,
    scrollStart,
    scrollEnd,
  ]);

  // The wrapper is display:contents so it generates no box of its own - several
  // of these headings are direct flex/grid children whose sizing (w-[35vw],
  // justify-between spacing) would otherwise land on this div.
  //
  // NOTE: display:contents still counts as an ELEMENT child, so a parent's
  // `space-y-*` (which margins `> :not(:last-child)`) targets this div and the
  // margin is thrown away with its box. Where that matters, use `gap` on the
  // parent instead - it spaces the laid-out boxes, which display:contents
  // passes through correctly.
  //
  // The heading is cloned with `opacity-0` appended to its own className so the
  // un-animated text never flashes before this effect runs; GSAP restores the
  // opacity once the characters hold their from-state.
  const child = isValidElement<{ className?: string }>(children)
    ? cloneElement(children, {
        className: `${children.props.className ?? ""} opacity-0`.trim(),
      })
    : children;

  return (
    <div ref={rootRef} className={className} style={{ display: "contents" }}>
      {child}
    </div>
  );
}
