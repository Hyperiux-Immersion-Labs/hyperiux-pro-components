"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";

const variantMap = {
  fade: { x: 0, y: 0 },
  left: { x: -40, y: 0 },
  right: { x: 40, y: 0 },
  up: { x: 0, y: -40 },
  down: { x: 0, y: 40 },
};

const REDUCED_MOTION_Y_OFFSET = 20;
const DEFAULT_TEXT = "Blur text reveals as you scroll into view.";

export default function BlurText({
  children = DEFAULT_TEXT,
  delay = 0,
  duration = 0.5,
  blur = 10,
  className = "",
  variant = "fade",
  once = false,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-100px" });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (event) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const { x, y } = variantMap[variant] ?? variantMap.fade;
  const words = typeof children === "string" ? children.split(" ") : [children];
  const animationKey = [
    typeof children === "string" ? children : "node",
    delay,
    duration,
    blur,
    variant,
    once,
    prefersReducedMotion,
  ].join("-");

  const hiddenState = prefersReducedMotion
    ? { opacity: 0, filter: "blur(0px)", x: 0, y: REDUCED_MOTION_Y_OFFSET }
    : { opacity: 0, filter: `blur(${blur}px)`, x, y };

  const shownState = { opacity: 1, filter: "blur(0px)", x: 0, y: 0 };

  return (
    <span ref={ref} className={className}>
      {words.map((word, index) => (
        <motion.span
          key={`${animationKey}-${index}-${typeof word === "string" ? word : "node"}`}
          initial={hiddenState}
          animate={isInView ? shownState : hiddenState}
          transition={{
            duration,
            delay: delay + index * 0.1,
            ease: "easeOut",
          }}
          style={{ display: "inline-block", marginRight: "0.25em" }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
