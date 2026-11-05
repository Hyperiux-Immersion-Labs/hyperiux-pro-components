// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, useState } from "react";
import { RollingNumber } from "../effects/animated-slider";

const zeros = (value: string) => value.replace(/\d/g, "0");

type RollProps = {
  value: string | number;
  // Roll up from zeros the first time it scrolls into view
  reveal?: boolean;
  // Roll from this value to `value` when it mounts (e.g. monthly to annual price)
  from?: string | number;
  className?: string;
};

// Every changing number in the template: the Animated Slider's odometer digits, which spring to each
// new value. Pass a plain number or a formatted string ("2.4", "$1,204", "05").
export default function Roll({ value, reveal = false, from, className = "" }: RollProps) {
  const text = String(value);
  const ref = useRef<HTMLSpanElement>(null);
  const [armed, setArmed] = useState(!reveal && from === undefined);

  useEffect(() => {
    if (armed) return;
    const el = ref.current;
    if (!reveal) {
      const frame = requestAnimationFrame(() => setArmed(true));
      return () => cancelAnimationFrame(frame);
    }
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setArmed(true);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [armed, reveal]);

  const shown = armed ? text : from !== undefined ? String(from) : zeros(text);
  // Taller lines give each digit column room above and below, so a rolling digit fades out instead of clipping
  return (
    <span ref={ref} className={`-my-[0.12em] inline-flex leading-[1.24] tabular-nums tracking-[0.01em] ${className}`}>
      <RollingNumber value={shown} />
    </span>
  );
}
