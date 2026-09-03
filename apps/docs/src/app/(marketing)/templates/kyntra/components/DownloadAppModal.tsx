// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import { X } from "lucide-react";

import ctaScan from "../assets/cta-scan.png";
import { prefersReducedMotion } from "./Animations/reducedMotion";

gsap.registerPlugin(useGSAP);

const SLIDE_DURATION = 0.55;
const FADE_DURATION = 0.4;
const SCRIM = "rgba(0,0,0,0.4)";
const SCRIM_CLEAR = "rgba(0,0,0,0)";

export interface DownloadAppModalProps {
  /** Drives the modal. The component keeps itself mounted while it animates out. */
  open: boolean;
  onClose: () => void;
  ariaLabel?: string;
}

/**
 * QR panel for the CTA's "Download Kyntra App" button: a full-height white
 * panel that slides in from the right edge, after which the QR code, heading
 * and copy fade in. Closing reverses the order - content out, then the panel.
 */
const DownloadAppModal: React.FC<DownloadAppModalProps> = ({
  open,
  onClose,
  ariaLabel = "Download the Kyntra app",
}) => {
  const lenis = useLenis();

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // `closing` keeps the panel mounted past `open` so the exit timeline can
  // run; its onComplete clears it, so the unmount follows the tweens rather
  // than a hand-synced timer.
  const [closing, setClosing] = useState(false);

  // Adjusting state during render on a prop change - React's documented
  // alternative to a syncing effect, and it avoids a frame where the panel has
  // already unmounted before the exit plays.
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) setClosing(true);
  }

  const mounted = open || closing;

  useGSAP(
    () => {
      const overlay = overlayRef.current;
      const panel = panelRef.current;
      const content = contentRef.current;
      const closeBtn = closeBtnRef.current;
      if (!overlay || !panel || !content || !closeBtn) return;

      // The button lives on the overlay now, so it has to travel with the
      // panel rather than inheriting the panel's transform.
      const sliding = [panel, closeBtn];

      // Supersede any in-flight timeline so a fast toggle animates from
      // wherever the panel currently sits rather than snapping.
      timelineRef.current?.kill();

      if (prefersReducedMotion()) {
        gsap.set(overlay, { backgroundColor: open ? SCRIM : SCRIM_CLEAR });
        gsap.set(sliding, { xPercent: open ? 0 : 100 });
        gsap.set(closeBtn, { opacity: open ? 1 : 0 });
        gsap.set(content, { opacity: open ? 1 : 0, y: 0 });
        if (!open) setClosing(false);
        return;
      }

      if (open) {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        timelineRef.current = tl;

        tl.set(content, { opacity: 0, y: "1vw" })
          .set(closeBtn, { opacity: 0 })
          .fromTo(
            overlay,
            { backgroundColor: SCRIM_CLEAR },
            { backgroundColor: SCRIM, duration: SLIDE_DURATION },
            0,
          )
          // Sheet easing: quick off the mark, settling softly at the end.
          .fromTo(
            sliding,
            { xPercent: 100 },
            { xPercent: 0, duration: SLIDE_DURATION, ease: "expo.out" },
            0,
          )
          // Overlaps the tail of the slide so the content lands as it settles.
          .to(content, { opacity: 1, y: 0, duration: FADE_DURATION }, 0.3)
          .to(closeBtn, { opacity: 1, duration: FADE_DURATION }, 0.35);

        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power2.in" },
        onComplete: () => setClosing(false),
      });
      timelineRef.current = tl;

      // Mirror of the opening order: content leaves first, then the panel and
      // its close button slide out together.
      tl.to(content, { opacity: 0, y: "0.5vw", duration: 0.2 })
        .to(closeBtn, { opacity: 0, duration: 0.2 }, "<")
        .to(
          sliding,
          { xPercent: 100, duration: SLIDE_DURATION, ease: "power3.inOut" },
          ">-0.05",
        )
        .to(
          overlay,
          { backgroundColor: SCRIM_CLEAR, duration: SLIDE_DURATION },
          "<",
        );
    },
    { dependencies: [open, mounted], scope: overlayRef },
  );

  // Lock page scroll and listen for Escape only while the modal is on screen.
  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousBodyOverflow = document.body.style.overflow;

    lenis?.stop?.();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      lenis?.start?.();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mounted, lenis, onClose]);

  useEffect(() => () => void timelineRef.current?.kill(), []);

  const handleBackdrop = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) onClose();
    },
    [onClose],
  );

  if (!mounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="kyntra-page fixed inset-0 z-100 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onMouseDown={handleBackdrop}
    >
      {/* Sits outside the panel, centred on the viewport height and riding
          just off the panel's left edge. The right offsets mirror the panel
          widths below so it tracks the edge at every breakpoint. */}
      <button
        ref={closeBtnRef}
        type="button"
        aria-label="Close"
        onClick={onClose}
        // GSAP owns this element's transform, so the centring offsets are
        // margins rather than translate utilities it would overwrite. The
        // right offsets mirror the panel widths so it tracks the panel edge.
        className="group absolute top-1/2 right-[38vw] z-10 mt-[-1.6vw] mr-[-1.6vw] flex size-[4vw] items-center justify-center rounded-full bg-white text-black shadow-[0_2px_12px_rgba(0,0,0,0.18)] max-[1025px]:right-[62vw] max-[1025px]:mt-[-4vw] max-[1025px]:mr-[-4vw] max-[1025px]:h-[8vw] max-[1025px]:w-[8vw] max-md:right-[88vw] max-md:mt-[-5.5vw] max-md:mr-[-5.5vw] max-md:h-[11vw] max-md:w-[11vw]"
      >
        <X
          className="size-[2.2vw] transition-transform duration-300 group-hover:rotate-90 max-[1025px]:h-[3.2vw] max-[1025px]:w-[3.2vw] max-md:h-[4.5vw] max-md:w-[4.5vw]"
          strokeWidth={2}
        />
      </button>

      {/* Full-height panel pinned to the right edge. */}
      <div
        ref={panelRef}
        className="relative flex h-full p-3 w-[36vw] flex-col bg-white will-change-transform max-[1025px]:w-[62vw] max-md:w-[88vw]"
      >
        <div ref={contentRef} className="flex w-full flex-col justify-center">
          <Image
            src={ctaScan}
            alt="QR code linking to the Kyntra mobile app download"
            priority
            className="w-full"
          />

          <div className="flex flex-col items-center gap-[1.2vw] pt-[8vh] w-[85%] mx-auto text-center max-[1025px]:gap-[2vw] max-[1025px]:px-[5vw] max-[1025px]:py-[4vw] max-md:gap-[3vw] max-md:px-[7vw] max-md:py-[6vw]">
            {/* text-30 / text-20 carry their own tablet and phone steps, so no
                per-breakpoint font-size overrides here. */}
            <h3 className="font-helvetica-neue text-44 leading-[1.15] font-medium! tracking-[-0.02em] text-black ">
              Download Kyntra App
            </h3>

            <p className="text-24 leading-[1.45] font-normal text-black">
              Scan QR-code with your Smartphone to Download Kyntra Mobile App.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default DownloadAppModal;
