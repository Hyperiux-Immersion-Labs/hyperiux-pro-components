"use client";

import { useRef } from "react";
import { useFadeUp } from "@/components/Animations/gsapAnimations";

export default function FadeUp({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
}) {
  const containerRef = useRef(null);
  useFadeUp(containerRef);

  return (
    <Tag ref={containerRef}>
      <div className={`fadeup ${className}`} data-fadeup-delay={delay}>
        {children}
      </div>
    </Tag>
  );
}
