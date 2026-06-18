"use client";

import React from "react";
import { useFadeUp } from "../Animations/gsapAnimations";
export default function Para({ children, text, className, ...props }) {
  useFadeUp();
  return (
    <p
      className={["font-sans text-base md:text-lg leading-relaxed text-muted fadeup", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children ?? text}
    </p>
    
  );
}
