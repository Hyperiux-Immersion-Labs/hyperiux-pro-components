// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLenis } from "lenis/react";
import { X } from "lucide-react";
import AnimatedForm from "./effects/animated-form";

const CLOSE_DURATION = 300;

export interface EnquiryModalProps {
  /** Stays mounted while animating out */
  open: boolean;
  onClose: () => void;
  ariaLabel?: string;
}

const EnquiryModal: React.FC<EnquiryModalProps> = ({
  open,
  onClose,
  ariaLabel = "Kyntra enquiry form",
}) => {
  const lenis = useLenis();

  const wasOpen = useRef(false);
  const [exiting, setExiting] = useState(false);
  const [visible, setVisible] = useState(false);
  const mounted = open || exiting;

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      // Paint closed first, then transition
      const raf = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(raf);
    }

    if (!wasOpen.current) return;

    setVisible(false);
    setExiting(true);
    const timer = window.setTimeout(() => setExiting(false), CLOSE_DURATION);
    return () => window.clearTimeout(timer);
  }, [open]);

  // Lock scroll, listen for Escape
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

  if (!mounted) return null;

  return createPortal(
    <div
      className={`kyntra-page fixed inset-0 z-100 flex items-center justify-center transition-colors duration-300 max-[1025px]:py-[10vw] ${
        visible ? "bg-black/40" : "bg-black/0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      
      <div
        className={`relative mt-[5vw] pt-2 h-[75vh] w-[90vw] overflow-hidden rounded-[1.6vw] border border-[#88888880] px-[3vw] bg-[#0b1020]/10 backdrop-blur-2xl transition-[transform,opacity] duration-300 max-[1025px]:mt-[10vw] max-[1025px]:max-w-[90vw] max-[1025px]:rounded-[5vw] max-md:max-w-[92vw] ${
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : exiting
              ? "translate-y-[2vw] scale-[0.98] opacity-0"
              : "translate-y-[2vw] scale-[0.98]"
        }`}
      >
        <div
          data-lenis-prevent
          className="h-full w-full overflow-y-auto overflow-x-hidden p-[2vw] max-[1025px]:p-[7vw]"
        >
          <button
            type="button"
            aria-label="Close enquiry form"
            onClick={onClose}
            className="sticky left-full top-0 z-20 flex h-[3vw] w-[3vw] shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:rotate-90  max-[1025px]:h-[10vw] max-[1025px]:w-[10vw]"
          >
            <X
              className="h-[1.3vw] w-[1.3vw] max-[1025px]:h-[4.5vw] max-[1025px]:w-[4.5vw]"
              strokeWidth={1.5}
            />
          </button>

          <div className="  max-[1025px]:mt-[-5vw]">
            <AnimatedForm />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default EnquiryModal;
