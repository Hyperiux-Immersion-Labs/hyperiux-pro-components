// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

type TypingVariant = "sequential" | "cascade" | "loop";
type CursorStyle = "bar" | "block" | "underline";
type TextAlign = "left" | "center" | "right";
type TypingDirection = "left-to-right" | "right-to-left";

type TypingTextProps = {
  lines?: string[];
  variant?: TypingVariant;
  textColor?: string;
  cursorColor?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: CSSProperties["fontWeight"];
  lineHeight?: number;
  letterSpacing?: number;
  charactersPerSecond?: number;
  animationDuration?: number;
  lineDelay?: number;
  holdDuration?: number;
  blur?: number;
  rotate?: number;
  scale?: number;
  perspective?: number;
  typingDirection?: TypingDirection;
  cursorWidth?: number;
  cursorStyle?: CursorStyle;
  textAlign?: TextAlign;
  maxWidth?: number;
  showCursor?: boolean;
  className?: string;
};

type TypingLineStyle = CSSProperties & {
  "--typing-target-width": string;
  "--typing-steps": number;
  "--typing-duration": string;
  "--typing-delay": string;
  "--typing-loop-duration": string;
  "--typing-cursor-color": string;
  "--typing-blur": string;
  "--typing-rotate": string;
  "--typing-scale": number;
};

const DEFAULT_LINES = [
  "Opening the vault handshake...",
  "Verifying encrypted component keys.",
  "Loading protected motion presets.",
  "Vault access granted. Hyperiux assets are ready.",
];

function getAlignmentClass(textAlign: TextAlign) {
  if (textAlign === "center") return "items-center text-center";
  if (textAlign === "right") return "items-end text-right";
  return "items-start text-left";
}

function getCursorStyles(
  cursorStyle: CursorStyle,
  cursorWidth: number,
  cursorColor: string,
  showCursor: boolean,
  typingDirection: TypingDirection
): CSSProperties {
  if (!showCursor) return {};

  if (cursorStyle === "underline") {
    return {
      borderBottom: `${cursorWidth}px solid ${cursorColor}`,
      paddingBottom: "0.08em",
    };
  }

  return {
    [typingDirection === "right-to-left" ? "borderLeft" : "borderRight"]:
      `${cursorStyle === "block" ? "0.58em" : `${cursorWidth}px`} solid ${cursorColor}`,
  };
}

export default function TypingText({
  lines = DEFAULT_LINES,
  variant = "sequential",
  textColor = "#d8d8d8",
  cursorColor = "#f59e0b",
  backgroundColor = "#121212",
  fontSize = 2.4,
  fontWeight = 500,
  lineHeight = 1.55,
  letterSpacing = 0,
  charactersPerSecond = 18,
  animationDuration = 1,
  lineDelay = 0.5,
  holdDuration = 1.4,
  blur = 0,
  rotate = 0,
  scale = 1,
  perspective = 800,
  typingDirection = "left-to-right",
  cursorWidth = 3,
  cursorStyle = "bar",
  textAlign = "left",
  maxWidth = 80,
  showCursor = true,
  className = "",
}: TypingTextProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const preparedLines = useMemo(
    () => lines.map((line) => ({ text: line, chars: Math.max(Array.from(line).length, 1) })),
    [lines]
  );
  const animationKey = [
    variant,
    charactersPerSecond,
    animationDuration,
    lineDelay,
    holdDuration,
    blur,
    rotate,
    scale,
    perspective,
    typingDirection,
  ].join("-");

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

  let elapsed = 0;

  return (
    <section
      className={`typing-text-root relative flex min-h-screen w-full items-center justify-center overflow-hidden px-6 py-24 ${className}`}
      style={{ backgroundColor, color: textColor }}
    >
      <div
        className={`relative z-10 flex w-full flex-col ${getAlignmentClass(textAlign)}`}
        style={{ maxWidth: `${maxWidth}vw`, perspective: `${perspective}px` }}
        aria-label={preparedLines.map((line) => line.text).join(" ")}
      >
        {preparedLines.map((line, index) => {
          const typingDuration = Math.max(
            0.35,
            (line.chars / Math.max(charactersPerSecond, 1)) * Math.max(animationDuration, 0.1)
          );
          const delay =
            variant === "sequential"
              ? elapsed
              : index * Math.max(lineDelay, 0);
          const loopDuration = Math.max(typingDuration * 2 + holdDuration, 2.4);

          if (variant === "sequential") {
            elapsed += typingDuration + Math.max(lineDelay, 0);
          }

          const lineStyle: TypingLineStyle = {
            ...getCursorStyles(cursorStyle, cursorWidth, cursorColor, showCursor, typingDirection),
            "--typing-target-width": `${line.chars}ch`,
            "--typing-steps": line.chars,
            "--typing-duration": `${typingDuration}s`,
            "--typing-delay": `${delay}s`,
            "--typing-loop-duration": `${loopDuration}s`,
            "--typing-cursor-color": cursorColor,
            "--typing-blur": `${blur}px`,
            "--typing-rotate": `${rotate}deg`,
            "--typing-scale": scale,
            color: textColor,
            fontSize: `clamp(1.2rem, ${fontSize}vw, 5rem)`,
            fontWeight,
            lineHeight,
            letterSpacing: `${letterSpacing}em`,
            direction: typingDirection === "right-to-left" ? "rtl" : "ltr",
            textAlign: typingDirection === "right-to-left" ? "right" : "left",
            transformOrigin: typingDirection === "right-to-left" ? "right center" : "left center",
            width: prefersReducedMotion ? "auto" : undefined,
            maxWidth: prefersReducedMotion ? "100%" : undefined,
            opacity: prefersReducedMotion ? 1 : undefined,
            animation: prefersReducedMotion
              ? "none"
              : variant === "loop"
                ? "typing-text-loop var(--typing-loop-duration) steps(var(--typing-steps), end) var(--typing-delay) infinite both, typing-text-cursor 820ms steps(1, end) infinite"
                : "typing-text-write var(--typing-duration) steps(var(--typing-steps), end) var(--typing-delay) both, typing-text-cursor-finish var(--typing-duration) linear var(--typing-delay) both",
            borderRightColor: prefersReducedMotion ? "transparent" : undefined,
            borderLeftColor: prefersReducedMotion ? "transparent" : undefined,
            borderBottomColor: prefersReducedMotion ? "transparent" : undefined,
          };

          return (
            <span
              key={`${animationKey}-${line.text}-${index}`}
              aria-hidden="true"
              className="typing-text-line mb-2 block max-w-full overflow-hidden whitespace-nowrap font-mono will-change-[width,opacity]"
              style={lineStyle}
            >
              {line.text}
            </span>
          );
        })}
      </div>

      <style>{`
        .typing-text-root {
          isolation: isolate;
        }

        .typing-text-line {
          width: 0;
          opacity: 0;
        }

        @keyframes typing-text-write {
          0% {
            width: 0;
            opacity: 0;
            filter: blur(var(--typing-blur));
            transform: rotateX(var(--typing-rotate)) scale(var(--typing-scale));
          }

          1% {
            opacity: 1;
          }

          99.9% {
            opacity: 1;
          }

          100% {
            width: min(var(--typing-target-width), 100%);
            opacity: 1;
            filter: blur(0);
            transform: rotateX(0deg) scale(1);
          }
        }

        @keyframes typing-text-loop {
          0% {
            width: 0;
            opacity: 0;
            filter: blur(var(--typing-blur));
            transform: rotateX(var(--typing-rotate)) scale(var(--typing-scale));
          }

          6% {
            opacity: 1;
          }

          46%,
          72% {
            width: min(var(--typing-target-width), 100%);
            opacity: 1;
            filter: blur(0);
            transform: rotateX(0deg) scale(1);
          }

          100% {
            width: 0;
            opacity: 0;
            filter: blur(var(--typing-blur));
            transform: rotateX(var(--typing-rotate)) scale(var(--typing-scale));
          }
        }

        @keyframes typing-text-cursor {
          0%,
          45% {
            border-right-color: var(--typing-cursor-color);
            border-left-color: var(--typing-cursor-color);
            border-bottom-color: var(--typing-cursor-color);
          }

          46%,
          100% {
            border-right-color: transparent;
            border-left-color: transparent;
            border-bottom-color: transparent;
          }
        }

        @keyframes typing-text-cursor-finish {
          0%,
          99.8% {
            border-right-color: var(--typing-cursor-color);
            border-left-color: var(--typing-cursor-color);
            border-bottom-color: var(--typing-cursor-color);
          }

          99.9%,
          100% {
            border-right-color: transparent;
            border-left-color: transparent;
            border-bottom-color: transparent;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .typing-text-line {
            width: auto !important;
            max-width: 100%;
            opacity: 1 !important;
            animation: none !important;
            border-color: transparent !important;
          }
        }
      `}</style>
    </section>
  );
}
