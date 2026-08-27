// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import {
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";

const KYNTRA_PRIMARY = "#134BD6";

export interface NavButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  className?: string;
  innerClassName?: string;
  /** Colour that fills the button on hover. */
  fillColor?: string;
  /** Icon / text colour at rest. */
  restColor?: string;
  ariaLabel?: string;
  style?: CSSProperties;
}

/**
 * Circular nav button with a radial fill that expands from the cursor on
 * hover (mirrors oris-dental's CircularButton). Fills with the Kyntra
 * primary colour by default.
 */
export function NavButton({
  type = "button",
  children,
  className = "",
  innerClassName = "",
  fillColor = KYNTRA_PRIMARY,
  restColor = KYNTRA_PRIMARY,
  ariaLabel,
  style,
  ...rest
}: NavButtonProps) {
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const positionFill = (e: MouseEvent<HTMLElement>, scale: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (spanRef.current) {
      spanRef.current.style.left = `${x}px`;
      spanRef.current.style.top = `${y}px`;
      spanRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
  };

  return (
    <button
      type={type}
      aria-label={ariaLabel}
      onMouseEnter={(e) => {
        setIsHovered(true);
        positionFill(e, 1);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        positionFill(e, 0);
      }}
      className={`group relative inline-flex size-[3.4vw] min-h-11 min-w-11 cursor-pointer items-center justify-center overflow-hidden rounded-full border select-none max-[1025px]:size-18 max-md:size-12 ${className}`}
      style={{ borderColor: KYNTRA_PRIMARY, ...style }}
      {...rest}
    >
      <span
        ref={spanRef}
        aria-hidden
        className="pointer-events-none absolute aspect-square rounded-full"
        style={{
          width: "350%",
          backgroundColor: fillColor,
          transform: "translate(-50%, -50%) scale(0)",
          transition: "transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)",
        }}
      />
      <span
        className={`relative z-10 flex items-center justify-center transition-colors duration-300 ${innerClassName}`}
        style={{ color: isHovered ? "#ffffff" : restColor }}
      >
        {children}
      </span>
    </button>
  );
}

function PrevArrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[1.2vw] w-[1.2vw] max-[1025px]:h-5 max-[1025px]:w-5"
      aria-hidden
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function NextArrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[1.2vw] w-[1.2vw] max-[1025px]:h-5 max-[1025px]:w-5"
      aria-hidden
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export interface CarouselNavButtonsProps {
  onPrev: () => void;
  onNext: () => void;
  className?: string;
  /** Icon colour at rest (e.g. white on a dark section). */
  restColor?: string;
  fillColor?: string;
}

/** Prev/Next pair for the smooth carousel. */
export default function CarouselNavButtons({
  onPrev,
  onNext,
  className = "",
  restColor = KYNTRA_PRIMARY,
  fillColor = KYNTRA_PRIMARY,
}: CarouselNavButtonsProps) {
  return (
    <div className={`flex items-center gap-[0.8vw] max-[1025px]:gap-3 ${className}`}>
      <NavButton
        onClick={onPrev}
        ariaLabel="Previous slide"
        restColor={restColor}
        fillColor={fillColor}
      >
        <PrevArrow />
      </NavButton>
      <NavButton
        onClick={onNext}
        ariaLabel="Next slide"
        restColor={restColor}
        fillColor={fillColor}
      >
        <NextArrow />
      </NavButton>
    </div>
  );
}
