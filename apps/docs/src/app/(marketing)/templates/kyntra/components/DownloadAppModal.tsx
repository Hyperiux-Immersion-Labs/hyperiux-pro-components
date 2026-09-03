// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";
import { useLenis } from "lenis/react";
import { X } from "lucide-react";

import ctaScan from "../assets/cta-scan.png";
import { prefersReducedMotion } from "./Animations/reducedMotion";

gsap.registerPlugin(useGSAP, CustomEase);

// Matches EnquiryModal, which is a plain CSS transition: `duration-300` with
// Tailwind's default timing function. Same curve and length both ways, so the
// panel leaves exactly the way it arrived.
const SLIDE_DURATION = 0.5;
// Tailwind's default transition timing function, as a GSAP ease.
const EASE = CustomEase.create("downloadAppModalEase", "0.4,0,0.2,1");
// The content fades in behind the panel's arrival: it starts partway through
// the slide so the two overlap rather than running end to end.
const CONTENT_DURATION = 0.5;
const CONTENT_STAGGER = 0.09;
const CONTENT_START = SLIDE_DURATION * 0.45;
const CONTENT_SHIFT = 18;

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
 * panel that slides in from the right edge. Once it is on its way in, the QR
 * image and copy fade up in a short stagger; closing slides the panel back out
 * with its content still on it.
 */
const DownloadAppModal: React.FC<DownloadAppModalProps> = ({
  open,
  onClose,
  ariaLabel = "Download the Kyntra app",
}) => {
  const lenis = useLenis();

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
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
      const closeBtn = closeBtnRef.current;
      const content = contentRef.current;
      if (!overlay || !panel || !closeBtn || !content) return;

      // The QR image and each line of copy, in DOM order.
      const contentItems = gsap.utils.toArray<HTMLElement>(
        content.querySelectorAll("[data-modal-item]"),
      );

      // Supersede any in-flight timeline so a fast toggle animates from
      // wherever the panel currently sits rather than snapping.
      timelineRef.current?.kill();

      // The button only ever fades, so make sure no stray transform is left on
      // it - it sits on the overlay and must not drift with the panel.
      gsap.set(closeBtn, { xPercent: 0, x: 0 });

      if (prefersReducedMotion()) {
        gsap.set(overlay, { backgroundColor: open ? SCRIM : SCRIM_CLEAR });
        gsap.set(panel, { xPercent: open ? 0 : 100 });
        gsap.set(closeBtn, { opacity: open ? 1 : 0 });
        gsap.set(contentItems, { opacity: 1, y: 0 });
        if (!open) setClosing(false);
        return;
      }

      if (open) {
        // Hide the content up front rather than leaving it to the timeline's
        // first tick, which would let it paint at full opacity for a frame.
        gsap.set(contentItems, { opacity: 0, y: CONTENT_SHIFT });

        const tl = gsap.timeline({
          defaults: { duration: SLIDE_DURATION, ease: EASE },
        });
        timelineRef.current = tl;

        // Panel and scrim move together on one curve, with the close button
        // fading on the same curve. The panel's content then fades up in a
        // stagger that overlaps the tail of the slide.
        tl.fromTo(
          overlay,
          { backgroundColor: SCRIM_CLEAR },
          { backgroundColor: SCRIM },
          0,
        )
          .fromTo(panel, { xPercent: 100 }, { xPercent: 0 }, 0)
          .fromTo(closeBtn, { opacity: 0 }, { opacity: 1 }, 0)
          .fromTo(
            contentItems,
            { opacity: 0, y: CONTENT_SHIFT },
            {
              opacity: 1,
              y: 0,
              duration: CONTENT_DURATION,
              stagger: CONTENT_STAGGER,
            },
            CONTENT_START,
          );

        return;
      }

      const tl = gsap.timeline({
        defaults: { duration: SLIDE_DURATION, ease: EASE },
        onComplete: () => setClosing(false),
      });
      timelineRef.current = tl;

      // The opening move played backwards - same curve, same length.
      tl.to(panel, { xPercent: 100 }, 0)
        .to(closeBtn, { opacity: 0 }, 0)
        .to(overlay, { backgroundColor: SCRIM_CLEAR }, 0);
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
            data-modal-item
            src={ctaScan}
            alt="QR code linking to the Kyntra mobile app download"
            priority
            className="w-full"
          />

          <div className="flex flex-col items-center gap-[1.2vw] pt-[8vh] w-[85%] mx-auto text-center max-[1025px]:gap-[2vw] max-[1025px]:px-[5vw] max-[1025px]:py-[4vw] max-md:gap-[3vw] max-md:px-[7vw] max-md:py-[6vw]">
            {/* text-30 / text-20 carry their own tablet and phone steps, so no
                per-breakpoint font-size overrides here. */}
            <h3
              data-modal-item
              className="font-helvetica-neue text-44 leading-[1.15] font-medium! tracking-[-0.02em] text-black "
            >
              Download Kyntra App
            </h3>

            <p data-modal-item className="text-24 leading-[1.45] font-normal text-black">
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
