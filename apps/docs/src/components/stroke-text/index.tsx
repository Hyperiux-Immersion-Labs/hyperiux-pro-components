"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

type StrokeTextVariant =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight"
  | "radial";

type StrokeTextProps = {
  text?: string;
  variant?: StrokeTextVariant;
  characterFill?: boolean;
  fillColor?: string;
  strokeColor?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: CSSProperties["fontWeight"];
  strokeWidth?: number;
  duration?: number;
  characterStagger?: number;
  className?: string;
};

const DEFAULT_TEXT = "hover me";

function withAlpha(color: string, alpha: number) {
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    const red = Number.parseInt(color.slice(1, 3), 16);
    const green = Number.parseInt(color.slice(3, 5), 16);
    const blue = Number.parseInt(color.slice(5, 7), 16);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  return color;
}

const variantStyles: Record<
  StrokeTextVariant,
  {
    backgroundImage: string;
    backgroundPosition?: string;
    restSize: string;
    hoverSize: string;
  }
> = {
  top: {
    backgroundImage:
      "linear-gradient(180deg, var(--stroke-fill) 0%, var(--stroke-fill) 44%, var(--stroke-fill-soft) 58%, transparent 76%)",
    backgroundPosition: "50% 0%",
    restSize: "100% 0%",
    hoverSize: "100% 420%",
  },
  right: {
    backgroundImage:
      "linear-gradient(270deg, var(--stroke-fill) 0%, var(--stroke-fill) 44%, var(--stroke-fill-soft) 58%, transparent 76%)",
    backgroundPosition: "100% 50%",
    restSize: "0% 100%",
    hoverSize: "420% 100%",
  },
  bottom: {
    backgroundImage:
      "linear-gradient(0deg, var(--stroke-fill) 0%, var(--stroke-fill) 44%, var(--stroke-fill-soft) 58%, transparent 76%)",
    backgroundPosition: "50% 100%",
    restSize: "100% 0%",
    hoverSize: "100% 420%",
  },
  left: {
    backgroundImage:
      "linear-gradient(90deg, var(--stroke-fill) 0%, var(--stroke-fill) 44%, var(--stroke-fill-soft) 58%, transparent 76%)",
    backgroundPosition: "0% 50%",
    restSize: "0% 100%",
    hoverSize: "420% 100%",
  },
  topLeft: {
    backgroundImage:
      "linear-gradient(135deg, var(--stroke-fill) 0%, var(--stroke-fill) 46%, var(--stroke-fill-soft) 62%, transparent 80%)",
    backgroundPosition: "0% 0%",
    restSize: "0% 0%",
    hoverSize: "460% 460%",
  },
  topRight: {
    backgroundImage:
      "linear-gradient(225deg, var(--stroke-fill) 0%, var(--stroke-fill) 46%, var(--stroke-fill-soft) 62%, transparent 80%)",
    backgroundPosition: "100% 0%",
    restSize: "0% 0%",
    hoverSize: "460% 460%",
  },
  bottomLeft: {
    backgroundImage:
      "linear-gradient(45deg, var(--stroke-fill) 0%, var(--stroke-fill) 46%, var(--stroke-fill-soft) 62%, transparent 80%)",
    backgroundPosition: "0% 100%",
    restSize: "0% 0%",
    hoverSize: "460% 460%",
  },
  bottomRight: {
    backgroundImage:
      "linear-gradient(315deg, var(--stroke-fill) 0%, var(--stroke-fill) 46%, var(--stroke-fill-soft) 62%, transparent 80%)",
    backgroundPosition: "100% 100%",
    restSize: "0% 0%",
    hoverSize: "460% 460%",
  },
  radial: {
    backgroundImage:
      "radial-gradient(circle farthest-corner at center center, var(--stroke-fill) 0%, var(--stroke-fill) 48%, var(--stroke-fill-soft) 66%, transparent 86%)",
    backgroundPosition: "50% 50%",
    restSize: "0% 0%",
    hoverSize: "520% 520%",
  },
};

export default function StrokeText({
  text = DEFAULT_TEXT,
  variant = "top",
  characterFill = false,
  fillColor = "#ffffff",
  strokeColor = "#ffffff",
  backgroundColor = "#17191b",
  fontSize = 8,
  fontWeight = 700,
  strokeWidth = 0.01,
  duration = 0.5,
  characterStagger = 0.045,
  className = "",
}: StrokeTextProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const variantStyle = variantStyles[variant] ?? variantStyles.top;
  const characters = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    setIsHovered(false);
  }, [variant]);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mediaQuery) return;

    setPrefersReducedMotion(mediaQuery.matches);

    const onReduceMotionChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener?.("change", onReduceMotionChange);

    return () => {
      mediaQuery.removeEventListener?.("change", onReduceMotionChange);
    };
  }, []);

  const textStyle = useMemo(
    () =>
      ({
        "--stroke-fill": fillColor,
        "--stroke-fill-soft": withAlpha(fillColor, 0.18),
        color: "transparent",
        WebkitTextFillColor: "transparent",
        WebkitTextStrokeColor: strokeColor,
        WebkitTextStrokeWidth: `${strokeWidth}em`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        backgroundImage: variantStyle.backgroundImage,
        backgroundPosition: variantStyle.backgroundPosition,
        backgroundRepeat: "no-repeat",
        backgroundSize: isHovered ? variantStyle.hoverSize : variantStyle.restSize,
        fontSize: `${fontSize}vw`,
        fontWeight,
        transitionProperty: prefersReducedMotion ? "none" : "background-size, background-position",
        transitionDuration: prefersReducedMotion ? "0s" : `${duration}s`,
        transitionTimingFunction: "cubic-bezier(0.67, 0.01, 0.15, 0.98)",
      }) as CSSProperties,
    [duration, fillColor, fontSize, fontWeight, isHovered, prefersReducedMotion, strokeColor, strokeWidth, variantStyle],
  );

  return (
    <section
      className={`flex min-h-screen w-full items-center justify-center overflow-hidden px-5 py-16 ${className}`}
      style={{
        backgroundColor,
      }}
    >
      <span
        className="inline-block cursor-pointer select-none text-center leading-none tracking-[0.02em]"
        aria-label={text}
        onPointerEnter={() => setIsHovered(true)}
        onPointerMove={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
      >
        {characterFill ? (
          <span key={variant} className="flex whitespace-nowrap leading-none uppercase">
            {characters.map((character, index) => (
              <span
                key={`${character}-${index}`}
                aria-hidden="true"
                className="inline-block"
                style={{
                  ...textStyle,
                  transitionDelay: prefersReducedMotion
                    ? "0s"
                    : `${
                        (isHovered ? index : characters.length - index - 1) * characterStagger
                      }s`,
                }}
              >
                {character === " " ? "\u00a0" : character}
              </span>
            ))}
          </span>
        ) : (
          <span key={variant} className="block whitespace-nowrap uppercase" style={textStyle}>
            {text}
          </span>
        )}
      </span>
    </section>
  );
}
