"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

interface FocusTextProps {
  text?: string;
  className?: string;
  fontSize?: number;
  characterStagger?: number;
  revealDuration?: number;
  startScale?: number;
  blurAmount?: number;
  holdDuration?: number;
  loop?: boolean;
  backgroundColor?: string;
  textColor?: string;
  showReplayButton?: boolean;
}

const DEFAULT_TEXT =
  "Built for seamless interactions.\nDesigned with thoughtful motion.\nMade to feel unforgettable.";
const DEFAULT_CHARACTER_STAGGER = 0.05;
const REDUCED_MOTION_DURATION = 0.3;

export default function FocusText({
  text = DEFAULT_TEXT,
  className = "",
  fontSize = 4.5,
  characterStagger = DEFAULT_CHARACTER_STAGGER,
  revealDuration = 3.2,
  startScale = 0.4,
  blurAmount = 18,
  holdDuration = 1.2,
  loop = false,
  backgroundColor = "#000000",
  textColor = "#ffffff",
  showReplayButton = true,
}: FocusTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const [cycle, setCycle] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const lines = useMemo(
    () =>
      text.split("\n").map((line) => {
        const words = line.split(" ");

        return words.map((word) => Array.from(word));
      }),
    [text],
  );

  const totalCharacterCount = useMemo(
    () =>
      lines.reduce(
        (lineTotal, words) =>
          lineTotal + words.reduce((wordTotal, word) => wordTotal + word.length, 0),
        0,
      ),
    [lines],
  );

  const characterDelays = useMemo(() => {
    let currentIndex = 0;

    return lines.map((words) =>
      words.map((word) =>
        word.map(() => {
          const delay = currentIndex * characterStagger;
          currentIndex += 1;
          return delay;
        }),
      ),
    );
  }, [lines, characterStagger]);

  const totalRevealDuration = useMemo(
    () => revealDuration + DEFAULT_CHARACTER_STAGGER * Math.max(totalCharacterCount - 1, 0),
    [revealDuration, totalCharacterCount],
  );

  const effectiveRevealDuration = useMemo(
    () =>
      Math.max(
        0.12,
        totalRevealDuration - characterStagger * Math.max(totalCharacterCount - 1, 0),
      ),
    [characterStagger, totalCharacterCount, totalRevealDuration],
  );

  const revealDurationMs = totalRevealDuration * 1000;
  const activeRevealDurationMs = prefersReducedMotion
    ? REDUCED_MOTION_DURATION * 1000
    : revealDurationMs;
  const cycleDuration = activeRevealDurationMs / 1000 + holdDuration;

  useEffect(() => {
    if (!loop || prefersReducedMotion) return;

    const timeout = setTimeout(() => {
      setCycle((value) => value + 1);
    }, cycleDuration * 1000);

    return () => clearTimeout(timeout);
  }, [cycle, cycleDuration, loop, prefersReducedMotion]);

  useEffect(() => {
    setIsPlaying(true);
    const timeout = setTimeout(() => setIsPlaying(false), activeRevealDurationMs);
    return () => clearTimeout(timeout);
  }, [cycle, activeRevealDurationMs]);

  const handleReplay = () => {
    setCycle((value) => value + 1);
  };

  return (
    <section
      className={`relative flex min-h-screen w-full items-center overflow-hidden px-6 ${className}`}
      style={{ backgroundColor }}
    >
      <h1
        className="m-0 w-full font-sans font-black uppercase leading-none tracking-tight"
        style={{
          fontSize: `clamp(2rem, ${fontSize}vw, 8rem)`,
          color: textColor,
        }}
      >
        {lines.map((words, lineIndex) => (
          <span key={`${cycle}-line-${lineIndex}`} className="block">
            {words.map((word, wordIndex) => (
              <span key={`${cycle}-line-${lineIndex}-word-${wordIndex}`}>
                <span className="inline-block whitespace-nowrap">
                  {word.map((character, charIndex) => (
                    <motion.span
                      key={`${cycle}-${lineIndex}-${wordIndex}-${charIndex}`}
                      className="inline-block"
                      style={{
                        willChange: "transform, filter, opacity",
                        transformOrigin: "50% 50%",
                        backfaceVisibility: "hidden",
                      }}
                      initial={{
                        opacity: 0,
                        scale: prefersReducedMotion ? 1 : startScale,
                        filter: prefersReducedMotion ? "blur(0px)" : `blur(${blurAmount}px)`,
                      }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      transition={{
                        duration: prefersReducedMotion
                          ? REDUCED_MOTION_DURATION
                          : effectiveRevealDuration,
                        delay: prefersReducedMotion
                          ? 0
                          : characterDelays[lineIndex][wordIndex][charIndex],
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      {character}
                    </motion.span>
                  ))}
                </span>
                {wordIndex < words.length - 1 ? (
                  <span aria-hidden="true" className="whitespace-pre">
                    {" "}
                  </span>
                ) : null}
              </span>
            ))}
          </span>
        ))}
      </h1>

      {showReplayButton && (
        <button
          type="button"
          onClick={handleReplay}
          className="absolute inset-x-0 bottom-8 mx-auto inline-flex w-fit items-center justify-center rounded-full border border-white/20 bg-white/8 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.28em] text-white transition hover:border-white/40 hover:bg-white/14"
        >
          Replay animation
        </button>
      )}
    </section>
  );
}
