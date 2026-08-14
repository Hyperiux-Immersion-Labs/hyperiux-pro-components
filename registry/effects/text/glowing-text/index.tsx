"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

type GlowingTextProps = {
  eyebrow?: string;
  text?: string;
  textColor?: string;
  glowColor?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: CSSProperties["fontWeight"];
  letterSpacing?: number;
  lineHeight?: number;
  glowIntensity?: number;
  revealDuration?: number;
  characterStagger?: number;
  flickerSpeed?: number;
  scanSpeed?: number;
  showScanLine?: boolean;
  className?: string;
};

const DEFAULT_EYEBROW = "INCOMING TRANSMISSION";
const DEFAULT_TEXT =
  "This is a story, all about how,\nMy life got twisted upside down.\nSo I'd like to tell a story, just sit right there,\nAbout a signal glowing through the midnight air.";

function withAlpha(color: string, alpha: number) {
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    const red = Number.parseInt(color.slice(1, 3), 16);
    const green = Number.parseInt(color.slice(3, 5), 16);
    const blue = Number.parseInt(color.slice(5, 7), 16);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  return color;
}

function splitLines(value: string) {
  return value.split("\n").map((line) => Array.from(line));
}

export default function GlowingText({
  eyebrow = DEFAULT_EYEBROW,
  text = DEFAULT_TEXT,
  textColor = "#d8d8d8",
  glowColor = "#ffffff",
  backgroundColor = "#0b0d0e",
  fontSize = 2.2,
  fontWeight = 400,
  letterSpacing = 0.08,
  lineHeight = 1.55,
  glowIntensity = 0.7,
  revealDuration = 1.6,
  characterStagger = 0.025,
  flickerSpeed = 3.2,
  scanSpeed = 4.5,
  showScanLine = true,
  className = "",
}: GlowingTextProps) {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const lines = useMemo(() => splitLines(text), [text]);
  const eyebrowChars = useMemo(() => Array.from(eyebrow), [eyebrow]);
  const glowSoft = withAlpha(glowColor, Math.min(0.48, glowIntensity * 0.48));
  const glowHard = withAlpha(glowColor, Math.min(0.9, glowIntensity * 0.9));
  const scanColor = withAlpha(glowColor, 0.18);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setIsReducedMotion(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <section
      className={`glowing-text-root relative flex min-h-screen w-full items-center overflow-hidden px-6 py-24 ${className}`}
      style={
        {
          "--glow-text": textColor,
          "--glow-color": glowColor,
          "--glow-soft": glowSoft,
          "--glow-hard": glowHard,
          "--glow-scan": scanColor,
          "--glow-reveal-duration": `${revealDuration}s`,
          "--glow-flicker-speed": `${flickerSpeed}s`,
          "--glow-scan-speed": `${scanSpeed}s`,
          background:
            `linear-gradient(135deg, ${backgroundColor} 0%, #050607 58%, #141617 100%)`,
        } as CSSProperties
      }
    >
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.03)_28%,transparent_46%),linear-gradient(165deg,rgba(255,255,255,0.05)_0%,transparent_30%)]" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.035)_0px,rgba(255,255,255,0.035)_1px,transparent_1px,transparent_5px)] opacity-20" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[92vw]">
        <div
          className="glowing-text-eyebrow mb-8 font-mono uppercase"
          aria-label={eyebrow}
          style={{
            fontSize: `clamp(0.9rem, ${fontSize * 0.52}vw, 2.1rem)`,
            fontWeight,
            letterSpacing: `${letterSpacing + 0.28}em`,
          }}
        >
          {eyebrowChars.map((character, index) => (
            <span
              key={`${character}-${index}`}
              aria-hidden="true"
              className="glowing-text-char"
              style={
                {
                  "--glow-delay": isReducedMotion ? "0s" : `${index * characterStagger}s`,
                } as CSSProperties
              }
            >
              {character === " " ? "\u00a0" : character}
            </span>
          ))}
        </div>

        <div className="mb-9 h-px w-24 bg-[var(--glow-text)] opacity-60 shadow-[0_0_18px_var(--glow-soft)]" />

        <p
          className="glowing-text-copy m-0 whitespace-pre-wrap font-mono"
          style={{
            fontSize: `clamp(1.25rem, ${fontSize}vw, 4.75rem)`,
            fontWeight,
            letterSpacing: `${letterSpacing}em`,
            lineHeight,
          }}
        >
          {lines.map((line, lineIndex) => {
            const previousChars = lines.slice(0, lineIndex).reduce((total, current) => total + current.length, 0);

            return (
              <span key={`line-${lineIndex}`} className="block">
                {line.map((character, characterIndex) => (
                  <span
                    key={`${lineIndex}-${character}-${characterIndex}`}
                    className="glowing-text-char"
                    style={
                      {
                        "--glow-delay": isReducedMotion
                          ? "0s"
                          : `${(previousChars + characterIndex + eyebrowChars.length) * characterStagger}s`,
                      } as CSSProperties
                    }
                  >
                    {character === " " ? "\u00a0" : character}
                  </span>
                ))}
              </span>
            );
          })}
        </p>
      </div>

      {showScanLine && !isReducedMotion ? <span className="glowing-text-scan" aria-hidden="true" /> : null}

      <style>{`
        .glowing-text-root {
          color: var(--glow-text);
        }

        .glowing-text-char {
          display: inline-block;
          opacity: 0;
          filter: blur(6px);
          color: var(--glow-text);
          text-shadow:
            0 0 7px var(--glow-soft),
            0 0 18px var(--glow-soft),
            0 0 34px var(--glow-hard);
          animation:
            glowing-text-reveal var(--glow-reveal-duration) cubic-bezier(0.2, 0.8, 0.2, 1) var(--glow-delay) both,
            glowing-text-flicker var(--glow-flicker-speed) steps(1, end) calc(var(--glow-delay) + var(--glow-reveal-duration)) infinite;
          will-change: opacity, filter, text-shadow;
        }

        .glowing-text-eyebrow .glowing-text-char {
          text-shadow:
            0 0 5px var(--glow-soft),
            0 0 14px var(--glow-soft);
        }

        .glowing-text-scan {
          position: absolute;
          inset: 0 auto 0 -20%;
          width: 14%;
          pointer-events: none;
          background: linear-gradient(90deg, transparent, var(--glow-scan), transparent);
          transform: skewX(-18deg);
          animation: glowing-text-scan var(--glow-scan-speed) linear infinite;
          mix-blend-mode: screen;
        }

        @keyframes glowing-text-reveal {
          0% {
            opacity: 0;
            filter: blur(9px);
            transform: translateY(0.18em);
          }

          45% {
            opacity: 1;
            filter: blur(1px);
            text-shadow:
              0 0 12px var(--glow-hard),
              0 0 30px var(--glow-hard),
              0 0 56px var(--glow-soft);
          }

          100% {
            opacity: 0.82;
            filter: blur(0);
            transform: translateY(0);
          }
        }

        @keyframes glowing-text-flicker {
          0%, 12%, 100% {
            opacity: 0.82;
          }

          13% {
            opacity: 0.5;
          }

          14%, 52% {
            opacity: 0.9;
          }

          53% {
            opacity: 0.62;
          }

          54% {
            opacity: 0.84;
          }
        }

        @keyframes glowing-text-scan {
          0% {
            transform: translateX(0) skewX(-18deg);
            opacity: 0;
          }

          12%, 72% {
            opacity: 1;
          }

          100% {
            transform: translateX(920%) skewX(-18deg);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .glowing-text-char {
            opacity: 0.86;
            filter: none;
            transform: none;
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
