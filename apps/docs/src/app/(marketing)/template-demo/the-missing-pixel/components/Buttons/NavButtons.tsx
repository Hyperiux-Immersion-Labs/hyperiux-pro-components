// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "../Animations/reducedMotion";

gsap.registerPlugin(useGSAP);

const REST_COLOR = "#0a0a0a";
const HOVER_COLOR = "#fafafa";

type NavButtonProps = {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
};

const NavButton = ({ label, disabled = false, onClick, children }: NavButtonProps) => {
  const fillRef = useRef<HTMLSpanElement | null>(null);
  const iconRef = useRef<HTMLSpanElement | null>(null);

  useGSAP(() => {
    gsap.set(fillRef.current, { scale: 0, xPercent: -50, yPercent: -50 });
  }, []);

  useGSAP(
    () => {
      if (!disabled) return;
      gsap.to(fillRef.current, { scale: 0, duration: 0.3, ease: "power3.out" });
      gsap.to(iconRef.current, { color: REST_COLOR, duration: 0.3 });
    },
    { dependencies: [disabled] },
  );

  const moveFill = (event: MouseEvent<HTMLElement>, scale: number) => {
    const fill = fillRef.current;
    if (!fill || disabled) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const duration = prefersReducedMotion() ? 0 : 0.8;

    gsap.set(fill, { left: event.clientX - rect.left, top: event.clientY - rect.top });
    gsap.to(fill, { scale, duration, ease: "power3.out", overwrite: true });
    gsap.to(iconRef.current, {
      color: scale ? HOVER_COLOR : REST_COLOR,
      duration: prefersReducedMotion() ? 0 : 0.3,
    });
  };

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={(event) => moveFill(event, 1)}
      onMouseLeave={(event) => moveFill(event, 0)}
      className={`relative isolate flex aspect-square h-[5.6vh] select-none items-center justify-center overflow-hidden rounded-full border border-[#0a0a0a] transition-opacity duration-300 max-lg:h-[4vh] max-md:h-[6vh] ${
        disabled ? "pointer-events-none opacity-40" : "cursor-pointer"
      }`}
    >
      <span
        ref={fillRef}
        aria-hidden
        className="pointer-events-none absolute aspect-square w-[350%] rounded-full bg-[#0a0a0a]"
      />
      <span ref={iconRef} className="relative z-10 flex items-center justify-center text-[#0a0a0a]">
        {children}
      </span>
    </button>
  );
};

const ARROW_CLASS = "h-[0.9vw] w-[1vw] max-lg:h-[1.7vw] max-lg:w-[2vw] max-md:h-[3.7vw] max-md:w-[4.4vw]";

const PrevArrow = () => (
  <svg className={ARROW_CLASS} viewBox="0 0 21 18" fill="none" aria-hidden focusable="false">
    <path
      d="M0.000108719 9.05508C0.0665569 9.10795 0.141867 9.15202 0.199457 9.21371C3.08335 12.0778 5.96282 14.942 8.84229 17.8061C8.90431 17.8678 8.95304 17.9427 9.00177 18C9.54223 17.4536 10.0561 16.9337 10.5611 16.4225C8.50562 14.378 6.41468 12.2982 4.32374 10.2228C4.33703 10.2007 4.34589 10.1743 4.35918 10.1523C10.4415 10.1523 14.4645 10.1523 20.5557 10.1523C20.5557 9.38115 20.5557 8.64529 20.5557 7.88739C14.4645 7.88739 10.4459 7.88739 4.33703 7.88739C6.45455 5.78556 8.54548 3.70575 10.6187 1.64357C10.0738 1.09278 9.55552 0.577234 8.97519 0C8.94861 0.04847 8.9176 0.136597 8.85558 0.198286C5.97169 3.07124 3.08335 5.93978 0.199457 8.80832C0.141867 8.86561 0.0665569 8.91408 0.000108719 8.96695C0.000108719 8.99339 0.000108719 9.02423 0.000108719 9.05508Z"
      fill="currentColor"
    />
  </svg>
);

const NextArrow = () => (
  <svg className={ARROW_CLASS} viewBox="0 0 21 18" fill="none" aria-hidden focusable="false">
    <path
      d="M20.5556 9.05508C20.4891 9.10795 20.4138 9.15202 20.3562 9.21371C17.4723 12.0778 14.5928 14.942 11.7134 17.8061C11.6514 17.8678 11.6026 17.9427 11.5539 18C11.0134 17.4536 10.4996 16.9337 9.99455 16.4225C12.05 14.378 14.141 12.2982 16.2319 10.2228C16.2186 10.2007 16.2098 10.1743 16.1965 10.1523C10.1142 10.1523 6.09118 10.1523 0 10.1523C0 9.38115 0 8.64529 0 7.88739C6.09118 7.88739 10.1097 7.88739 16.2186 7.88739C14.1011 5.78556 12.0102 3.70575 9.93696 1.64357C10.4818 1.09278 11.0001 0.577234 11.5805 0C11.6071 0.04847 11.6381 0.136597 11.7001 0.198286C14.584 3.07124 17.4723 5.93978 20.3562 8.80832C20.4138 8.86561 20.4891 8.91408 20.5556 8.96695C20.5556 8.99339 20.5556 9.02423 20.5556 9.05508Z"
      fill="currentColor"
    />
  </svg>
);

type NavButtonsProps = {
  onPrev: () => void;
  onNext: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  prevLabel?: string;
  nextLabel?: string;
};

const NavButtons = ({ onPrev, onNext, prevDisabled = false, nextDisabled = false, prevLabel = "Previous testimonial", nextLabel = "Next testimonial" }: NavButtonsProps) => (
  <div className="flex items-center gap-3 max-lg:gap-3">
    <NavButton label={prevLabel} onClick={onPrev} disabled={prevDisabled}>
      <PrevArrow />
    </NavButton>
    <NavButton label={nextLabel} onClick={onNext} disabled={nextDisabled}>
      <NextArrow />
    </NavButton>
  </div>
);

export default NavButtons;
