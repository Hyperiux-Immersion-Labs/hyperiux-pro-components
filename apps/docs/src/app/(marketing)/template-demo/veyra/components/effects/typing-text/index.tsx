// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { useMemo, type CSSProperties } from "react";

type TypingTextProps = {
  text: string;
  mode?: "chars" | "words";
  charactersPerSecond?: number;
  wordsPerSecond?: number;
  showCursor?: boolean;
  play?: boolean;
  className?: string;
};

export default function TypingText({
  text,
  mode = "chars",
  charactersPerSecond = 38,
  wordsPerSecond = 14,
  showCursor = true,
  play = false,
  className = "",
}: TypingTextProps) {
  const tokens = useMemo(() => (mode === "chars" ? Array.from(text) : text.split(/(\s+)/).filter(Boolean)), [text, mode]);
  const step = 1 / (mode === "chars" ? charactersPerSecond : wordsPerSecond);
  const style = {
    "--vey-type-step": `${step}s`,
    "--vey-type-total": `${tokens.length * step}s`,
  } as CSSProperties;

  return (
    <span
      data-typing
      data-play={play ? "true" : "false"}
      data-mode={mode}
      aria-label={text}
      className={`vey-typing ${className}`}
      style={style}
    >
      <span aria-hidden>
        {tokens.map((token, i) => (
          <span key={i} className="vey-typing-token" style={{ "--i": i } as CSSProperties}>
            {token}
          </span>
        ))}
        {showCursor ? <span className="vey-typing-cursor" /> : null}
      </span>
      <style>{`
        .vey-typing-token { opacity: 0; }
        .vey-typing[data-mode="words"] .vey-typing-token { display: inline-block; white-space: pre; }
        .vey-typing[data-play="true"] .vey-typing-token {
          animation: vey-type-in 1ms linear forwards;
          animation-delay: calc(var(--i) * var(--vey-type-step));
        }
        .vey-typing[data-play="true"][data-mode="words"] .vey-typing-token {
          animation: vey-stream-in 420ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: calc(var(--i) * var(--vey-type-step));
        }
        .vey-typing-cursor {
          display: inline-block;
          width: 0.45ch;
          height: 1.05em;
          vertical-align: -0.15em;
          margin-inline-start: 0.12ch;
          background: currentColor;
          opacity: 0;
        }
        .vey-typing[data-play="true"] .vey-typing-cursor {
          animation: vey-caret-run var(--vey-type-total) linear forwards, vey-caret-blink 0.8s steps(1, end) var(--vey-type-total) 3 forwards;
        }
        @keyframes vey-type-in { to { opacity: 1; } }
        @keyframes vey-stream-in {
          from { opacity: 0; filter: blur(4px); transform: translateY(0.25em); }
          to { opacity: 1; filter: blur(0); transform: translateY(0); }
        }
        @keyframes vey-caret-run { 0%, 99.9% { opacity: 0.7; } 100% { opacity: 0; } }
        @keyframes vey-caret-blink { 0% { opacity: 0.7; } 50%, 100% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .vey-typing .vey-typing-token { opacity: 1 !important; animation: none !important; filter: none !important; transform: none !important; }
          .vey-typing .vey-typing-cursor { display: none; }
        }
      `}</style>
    </span>
  );
}

export type TypingCue = { at: number; el: Element | null | undefined };

export function syncTypingCues(cues: TypingCue[], progress: number) {
  for (const cue of cues) {
    const el = cue.el as HTMLElement | null | undefined;
    if (!el) continue;
    const next = progress >= cue.at ? "true" : "false";
    if (el.dataset.play !== next) el.dataset.play = next;
  }
}
