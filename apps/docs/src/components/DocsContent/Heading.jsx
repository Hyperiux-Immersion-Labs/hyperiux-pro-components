"use client";

import React from "react";
import HeadAnim from "../Animations/HeadAnim";

export default function Heading({ children, text, className, ...props }) {
  return (
    <HeadAnim>
      <h1
        className={[
          "font-display max-sm:text-3xl! text-6xl leading-[1.05] text-foreground",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children ?? text}
      </h1>
    </HeadAnim>
  );
}
