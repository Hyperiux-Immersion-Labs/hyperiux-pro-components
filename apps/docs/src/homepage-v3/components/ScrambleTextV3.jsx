"use client";

import { Fragment, useEffect, useRef } from "react";

const SCRAMBLE_GLYPHS = "$#&*@!_-./|<>0123456789";
const PRE_HOLD_MS = 60;
const REVEAL_DURATION_MS = 700;
const SCRAMBLE_TAIL = 10;
const FLASH_MS = 90;
const GLYPH_SWAP_MS = 40;

const randomGlyph = () =>
  SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];

// The scramble from ButtonV3/HoverLinkV3, reworked so the line is typed out
// rather than revealed in place: a character is invisible until the write head
// reaches it, churns through glyphs while the head passes over it, then locks
// to its final letter. Characters render inline inside per-word boxes (instead
// of ButtonV3's absolute overlay) so the text can still wrap between words —
// widths hold steady because this renders in a monospace face.
export default function ScrambleTextV3({
  text,
  active,
  armed = false,
  className = "",
}) {
  const charsRef = useRef([]);

  useEffect(() => {
    const letters = Array.from(text).filter((character) => character !== " ");
    const chars = charsRef.current.slice(0, letters.length).filter(Boolean);
    if (!chars.length) return;

    const settle = () => {
      chars.forEach((node, index) => {
        node.textContent = letters[index];
        node.style.color = "";
        node.style.opacity = "";
      });
    };

    const clear = () => {
      chars.forEach((node, index) => {
        node.textContent = letters[index];
        node.style.color = "";
        node.style.opacity = "0";
      });
    };

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!active) {
      // Blank only once the section's timeline is live, so the copy stays
      // readable if the scroll animation never mounts.
      if (armed) clear();
      else settle();
      return;
    }

    if (prefersReducedMotion) {
      settle();
      return;
    }

    const tailMs = (SCRAMBLE_TAIL / chars.length) * REVEAL_DURATION_MS;
    const phases = new Array(chars.length).fill(0);

    clear();

    const start = performance.now();
    let previous = start;
    let frame = 0;

    const tick = (now) => {
      const elapsed = now - start;
      const swapChance = (now - previous) / GLYPH_SWAP_MS;

      previous = now;

      let running = false;

      chars.forEach((node, index) => {
        const revealAt =
          PRE_HOLD_MS + ((index + 1) / chars.length) * REVEAL_DURATION_MS;

        // Not written yet — stays blank so the line builds up instead of
        // scrambling in full from the first frame.
        if (elapsed < revealAt - tailMs) {
          running = true;
          return;
        }

        if (elapsed < revealAt) {
          running = true;

          if (phases[index] === 0) {
            phases[index] = 1;
            node.style.opacity = "1";
            node.style.color = "var(--scramble-pre, #4a4a4a)";
            node.textContent = randomGlyph();
            return;
          }

          if (Math.random() < swapChance) {
            node.textContent = randomGlyph();
          }

          return;
        }

        if (phases[index] !== 2) {
          phases[index] = 2;
          node.style.opacity = "1";
          node.textContent = letters[index];
        }

        if (elapsed - revealAt < FLASH_MS) {
          running = true;
          node.style.color = "var(--scramble-flash, #ffffff)";
        } else {
          node.style.color = "";
        }
      });

      if (running) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [active, armed, text]);

  let letterIndex = -1;

  return (
    <span className={className}>
      <span aria-hidden="true">
        {text.split(" ").map((word, wordIndex) => (
          <Fragment key={wordIndex}>
            {wordIndex > 0 ? " " : null}
            <span className="inline-block whitespace-pre">
              {Array.from(word).map((character) => {
                letterIndex += 1;
                const index = letterIndex;

                return (
                  <span
                    key={index}
                    ref={(node) => {
                      charsRef.current[index] = node;
                    }}
                    className="inline-block transition-colors duration-200 ease-out motion-reduce:transition-none"
                  >
                    {character}
                  </span>
                );
              })}
            </span>
          </Fragment>
        ))}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
