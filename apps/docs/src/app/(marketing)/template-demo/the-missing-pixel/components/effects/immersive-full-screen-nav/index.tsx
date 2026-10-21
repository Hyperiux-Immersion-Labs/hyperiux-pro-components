// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "../../Animations/reducedMotion";

gsap.registerPlugin(useGSAP);

const CLIPS = {
  bottom: {
    start: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
    open: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    end: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
  },
  top: {
    start: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
    open: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    end: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
  },
};

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])';

const useTrapFocus = (active: boolean, containerRef: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!active || !container) return;

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const items = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.getClientRects().length > 0,
      );
    const frame = requestAnimationFrame(() => items()[0]?.focus());

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const list = items();
      if (!list.length) {
        event.preventDefault();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const current = document.activeElement;
      if (event.shiftKey && (current === first || !container.contains(current))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || !container.contains(current))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      if (previous && document.contains(previous)) previous.focus();
    };
  }, [active, containerRef]);
};

type ClipNavProps = {
  open: boolean;
  id?: string;
  origin?: keyof typeof CLIPS;
  openDuration?: number;
  closeDuration?: number;
  ease?: string;
  className?: string;
  innerClassName?: string;
  rootRef?: RefObject<HTMLDivElement | null>;
  onClosed?: () => void;
  children: ReactNode;
};

const ClipNav = ({
  open,
  id,
  origin = "bottom",
  openDuration = 1.15,
  closeDuration = 1.15,
  ease = "power4.inOut",
  className = "",
  innerClassName = "",
  rootRef,
  onClosed,
  children,
}: ClipNavProps) => {
  const ownRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const shownRef = useRef(false);
  const clip = CLIPS[origin];
  const ref = rootRef ?? ownRef;

  useTrapFocus(open, ref);

  useGSAP(
    () => {
      const root = ref.current;
      const inner = innerRef.current;
      if (!root || !inner) return;

      if (!open && !shownRef.current) {
        gsap.set(root, { autoAlpha: 0, clipPath: clip.start });
        return;
      }

      const reduce = prefersReducedMotion();

      if (open) {
        shownRef.current = true;
        gsap.set(root, { autoAlpha: 1, clipPath: clip.start });
        gsap.set(inner, { scale: 1, opacity: 1 });
        if (reduce) {
          gsap.set(root, { clipPath: clip.open });
          return;
        }
        gsap.to(root, { clipPath: clip.open, duration: openDuration, delay: 0.1, ease });
        return;
      }

      if (reduce) {
        gsap.set(root, { autoAlpha: 0 });
        onClosed?.();
        return;
      }

      gsap
        .timeline({
          onComplete: () => {
            gsap.set(root, { autoAlpha: 0, clipPath: clip.start });
            gsap.set(inner, { scale: 1, opacity: 1 });
            onClosed?.();
          },
        })
        .to(inner, { scale: 0.9, opacity: 0.5, duration: 0.7, ease: "power2.in" }, 0)
        .to(root, { clipPath: clip.end, duration: closeDuration, ease }, 0);
    },
    { dependencies: [open], scope: ref },
  );

  return (
    <div ref={ref} id={id} aria-hidden={!open} data-lenis-prevent className={`invisible ${className}`.trim()}>
      <div ref={innerRef} className={innerClassName}>
        {children}
      </div>
    </div>
  );
};

export default ClipNav;
