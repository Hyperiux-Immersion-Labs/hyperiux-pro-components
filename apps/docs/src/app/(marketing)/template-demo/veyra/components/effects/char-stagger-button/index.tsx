// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ComponentType,
  type MouseEvent,
  type MouseEventHandler,
} from "react";

const CHAR_TRANSLATE_Y = "1.3em";
const EASE = "cubic-bezier(0.625, 0.05, 0, 1)";

export interface CharStaggerButtonOwnProps {
  text: string;
  href?: string;
  className?: string;
  textClassName?: string;
  staggerStep?: number;
  hoverColor?: string;
  icon?: ComponentType<{ className?: string }>;
  iconClassName?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export type CharStaggerButtonProps = CharStaggerButtonOwnProps &
  Omit<ComponentPropsWithoutRef<"a">, "href" | "onClick" | keyof CharStaggerButtonOwnProps>;

export default function CharStaggerButton({
  text,
  href = "#",
  className = "",
  textClassName = "",
  staggerStep = 0.012,
  hoverColor,
  icon: Icon,
  iconClassName = "",
  onClick,
  ...props
}: CharStaggerButtonProps) {
  const textRef = useRef<HTMLSpanElement | null>(null);
  const isTouchRef = useRef(false);
  const [isActive, setIsActive] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.innerHTML = "";
    [...text].forEach((char, index) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.style.display = "inline-block";
      span.style.position = "relative";
      span.style.textShadow = `0px ${CHAR_TRANSLATE_Y} currentColor`;
      span.style.transform = "translateY(0em) rotate(0.001deg)";
      span.style.transition = reduced ? "none" : `transform 0.6s ${EASE}`;
      span.style.willChange = "transform";
      span.style.transitionDelay = reduced ? "0s" : `${index * staggerStep}s`;
      if (char === " ") span.style.whiteSpace = "pre";
      el.appendChild(span);
    });
  }, [text, staggerStep, reduced]);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    Array.from(el.children).forEach((span) => {
      (span as HTMLElement).style.transform =
        isActive && !reduced ? `translateY(-${CHAR_TRANSLATE_Y}) rotate(0.001deg)` : "translateY(0em) rotate(0.001deg)";
    });
  }, [isActive, reduced]);

  const onMouseEnter = useCallback(() => {
    if (!isTouchRef.current) setIsActive(true);
  }, []);
  const onMouseLeave = useCallback(() => {
    if (!isTouchRef.current) setIsActive(false);
  }, []);
  const onTouchStart = useCallback(() => {
    isTouchRef.current = true;
  }, []);
  const onMouseDown = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    if (isTouchRef.current) e.preventDefault();
  }, []);

  return (
    <a
      href={href}
      {...props}
      aria-label={props["aria-label"] ?? text}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onMouseEnter}
      onBlur={onMouseLeave}
      onTouchStart={onTouchStart}
      onMouseDown={onMouseDown}
      style={{ ...props.style, color: isActive && hoverColor ? hoverColor : props.style?.color }}
      className={`inline-flex items-center gap-2 no-underline transition-colors duration-500 ease-[cubic-bezier(0.625,0.05,0,1)] motion-reduce:transition-none ${className}`.trim()}
    >
      <span aria-hidden ref={textRef} className={`relative inline-block overflow-hidden leading-[1.2] ${textClassName}`.trim()}>
        {text}
      </span>
      {Icon ? (
        <span aria-hidden className={`relative block shrink-0 overflow-hidden ${iconClassName}`.trim()}>
          {[0, 1].map((i) => (
            <span
              key={i}
              className="absolute inset-0 block"
              style={{
                transform: `translateX(${(isActive && !reduced ? 100 : 0) - i * 100}%)`,
                transition: reduced ? "none" : `transform 0.5s ${EASE}`,
              }}
            >
              <Icon className="h-full w-full" />
            </span>
          ))}
        </span>
      ) : null}
    </a>
  );
}
