"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const DEFAULT_HREF = "#";
const DEFAULT_STAGGER_STEP = 0.01;
const DEFAULT_HOVER_COLOR = "#ff6b00";
const CHAR_TRANSLATE_Y = "1.3em";

export default function CharStaggerButton({
  btnText = "",
  href = DEFAULT_HREF,
  className = "",
  textClassName = "",
  linkProps = {},
  children,
  staggerStep = DEFAULT_STAGGER_STEP,
  showLine = false,
  lineClassName = "",
  hoverColor = DEFAULT_HOVER_COLOR,
  showArrow = false,
  icon: Icon = ArrowRight,
  iconVariant = "stacked",
  iconClassName = "",
  onClick,
  ...props
}) {
  // Refs
  const textRef = useRef(null);
  const lineRef = useRef(null);
  const isTouchRef = useRef(false);
  const hasMountedRef = useRef(false);

  // State
  const [isActive, setIsActive] = useState(false);

  // Effects
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    const line = lineRef.current;
    if (!line || isActive) return;
    line.style.transformOrigin = "right center";
    const onEnd = () => {
      line.style.transformOrigin = "left center";
      line.removeEventListener("transitionend", onEnd);
    };
    line.addEventListener("transitionend", onEnd);
  }, [isActive]);

  useEffect(() => {
    const textElement = textRef.current;
    if (!textElement) return;

    const sourceText = btnText || textElement.getAttribute("data-text") || "";
    textElement.innerHTML = "";

    [...sourceText].forEach((char, index) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.style.display = "inline-block";
      span.style.position = "relative";
      span.style.textShadow = `0px ${CHAR_TRANSLATE_Y} currentColor`;
      span.style.transform = "translateY(0em) rotate(0.001deg)";
      span.style.transition = "transform 0.6s cubic-bezier(0.625, 0.05, 0, 1)";
      span.style.willChange = "transform";
      span.style.transitionDelay = `${index * staggerStep}s`;
      if (char === " ") span.style.whiteSpace = "pre";
      textElement.appendChild(span);
    });
  }, [btnText, staggerStep]);

  useEffect(() => {
    const textElement = textRef.current;
    if (!textElement) return;
    Array.from(textElement.children).forEach((span) => {
      span.style.transform = isActive
        ? `translateY(-${CHAR_TRANSLATE_Y}) rotate(0.001deg)`
        : "translateY(0em) rotate(0.001deg)";
    });
  }, [isActive]);

  // Event handlers
  const onMouseEnter = useCallback(() => {
    if (isTouchRef.current) return;
    setIsActive(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    if (isTouchRef.current) return;
    setIsActive(false);
  }, []);

  const onTouchStart = useCallback(() => {
    isTouchRef.current = true;
    setIsActive((prev) => !prev);
  }, []);

  const onMouseDown = useCallback((e) => {
    if (isTouchRef.current) e.preventDefault();
  }, []);

  // Derived
  const sourceText = typeof children === "string" ? children :  btnText;
  const mergedStyle = {
    ...props.style,
    color: isActive ? hoverColor : props.style?.color,
  };

  // Render
  return (
    <Link href={href}
      {...linkProps}
      {...props}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onMouseDown={onMouseDown}
      style={mergedStyle}
      className={`inline-flex items-center gap-2 no-underline transition-colors duration-500 ease-[cubic-bezier(0.625,0.05,0,1)] ${className}`.trim()}
    >
      <div className="mt-[0.3vw]">
        <span className={["inline-block relative", showLine && "w-fit", lineClassName].filter(Boolean).join(" ")}>
          <span ref={textRef} data-text={sourceText} className={`overflow-hidden relative inline-block leading-[1.2] max-xl:text-[3vw] ${textClassName}`.trim()}>
            {sourceText}
          </span>

          {showLine && (
            <span
              ref={lineRef}
              aria-hidden="true"
              className="absolute left-0 bottom-[15%] w-full bg-current"
              style={{
                height: "1.5px",
                transform: `scaleX(${isActive ? 1 : 0})`,
                transformOrigin: "left center",
                transition: "transform 0.5s cubic-bezier(0.625, 0.05, 0, 1)",
              }}
            />
          )}
        </span>
      </div>

      {showArrow && Icon && (
        <div className={`overflow-hidden flex items-center justify-start ${iconClassName}`.trim()}>
          {iconVariant === "single" ? (
            <Icon className="h-4 w-4 shrink-0" />
          ) : (
            <div
              className="flex w-max"
              style={{
                transform: isActive ? "translateX(5%)" : "translateX(-100%)",
                transition: "transform 0.5s cubic-bezier(0.625, 0.05, 0, 1)",
                willChange: "transform",
              }}
            >
              <Icon className="flex-none w-full h-full" />
              <Icon className="flex-none w-full h-full" />
            </div>
          )}
        </div>
      )}
    </Link>
  );
}
