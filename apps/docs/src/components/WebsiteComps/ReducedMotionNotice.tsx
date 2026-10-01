"use client";

import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/motion";

/**
 * Demo-only: renders its children (the "this effect under reduced motion"
 * popup) only while prefers-reduced-motion is on. Lives in the demo pages so
 * the shipped effect components stay free of demo UI.
 */
export default function ReducedMotionNotice({ children }: { children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();
  if (!reducedMotion) return null;
  return <>{children}</>;
}
