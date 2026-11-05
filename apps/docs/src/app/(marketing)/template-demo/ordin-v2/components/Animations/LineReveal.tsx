// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import type { ReactNode } from "react";
import OverflowTextReveal from "../effects/overflow-text-reveal";

type LineRevealProps = { children: ReactNode; className?: string; delay?: number };

export default function LineReveal({ children, className = "", delay = 0 }: LineRevealProps) {
  return (
    <OverflowTextReveal
      className={className}
      splitBy="lines"
      duration={1.4}
      stagger={0.1}
      startRotation={0}
      ease="expo.out"
      delay={delay}
    >
      {children}
    </OverflowTextReveal>
  );
}
