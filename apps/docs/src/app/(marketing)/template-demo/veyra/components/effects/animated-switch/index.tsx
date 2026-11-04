// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { MotionConfig, animate, motion, useMotionValue, useTransform, type MotionStyle, type Transition } from "motion/react";

function usePrefersReducedMotion() {
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduce(mq.matches);
    read();
    mq.addEventListener?.("change", read);
    return () => mq.removeEventListener?.("change", read);
  }, []);
  return reduce;
}

const FAST: Transition = { type: "spring", duration: 0.15, bounce: 0 };
const SNAP: Transition = { type: "spring", duration: 0.4, bounce: 0.5 };

type AnimatedSwitchProps = {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  trackWidth?: number;
  handle?: number;
  gap?: number;
  pressSqueeze?: number;
  duration?: number;
  bounce?: number;
  className?: string;
  onColor?: string;
  offColor?: string;
  handleColor?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

export default function AnimatedSwitch({
  checked,
  onCheckedChange,
  trackWidth = 56,
  handle = 24,
  gap = 4,
  pressSqueeze = 0.18,
  duration = 0.35,
  bounce = 0.3,
  className = "",
  onColor = "#151927",
  offColor = "#e2e4ec",
  handleColor = "#ffffff",
  ...aria
}: AnimatedSwitchProps) {
  const reduceMotion = usePrefersReducedMotion();
  const travel = trackWidth - handle - gap * 2;
  const x = useMotionValue(checked ? travel : 0);
  const scaleX = useMotionValue(1);
  const scaleY = useMotionValue(1);
  const fillOpacity = useTransform(x, [0, travel], [0, 1]);
  const ok = (t: Transition): Transition => (reduceMotion ? { duration: 0 } : t);

  const previous = React.useRef(checked);
  React.useEffect(() => {
    if (previous.current === checked) return;
    previous.current = checked;
    animate(x, checked ? travel : 0, reduceMotion ? { duration: 0 } : { type: "spring", duration, bounce });
    if (reduceMotion) return;
    animate(scaleX, 1 + pressSqueeze * 0.85, FAST).then(() => animate(scaleX, 1, SNAP));
    animate(scaleY, 1 - pressSqueeze * 0.65, FAST).then(() => animate(scaleY, 1, SNAP));
  }, [checked, travel, reduceMotion, duration, bounce, pressSqueeze, x, scaleX, scaleY]);

  React.useEffect(() => {
    x.jump(previous.current ? travel : 0);
  }, [travel, x]);

  const press = () => {
    if (reduceMotion) return;
    animate(scaleX, 1 - pressSqueeze, FAST);
    animate(scaleY, 1 + pressSqueeze * 0.55, FAST);
  };
  const release = () => {
    animate(scaleX, 1, ok(SNAP));
    animate(scaleY, 1, ok(SNAP));
  };

  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "never"}>
      <SwitchPrimitive.Root
        checked={checked}
        onCheckedChange={(next) => onCheckedChange(next)}
        onPointerDown={press}
        onPointerUp={release}
        onPointerLeave={release}
        onPointerCancel={release}
        className={`relative inline-flex shrink-0 cursor-pointer items-center rounded-md outline-none select-none focus-visible:ring-2 focus-visible:ring-[#aeb8e8] focus-visible:ring-offset-2 ${className}`}
        style={{ width: trackWidth, height: handle + gap * 2 }}
        {...aria}
      >
        <span aria-hidden className="absolute inset-0 rounded-md" style={{ backgroundColor: offColor }} />
        <motion.span aria-hidden className="absolute inset-0 rounded-md" style={{ backgroundColor: onColor, opacity: fillOpacity }} />
        <SwitchPrimitive.Thumb
          render={(thumbProps) => (
            <motion.span
              {...(thumbProps as React.ComponentProps<typeof motion.span>)}
              className="pointer-events-none z-10 block rounded-md shadow-md ring-1 ring-black/5"
              style={
                {
                  ...thumbProps.style,
                  marginLeft: gap,
                  width: handle,
                  height: handle,
                  backgroundColor: handleColor,
                  x,
                  scaleX,
                  scaleY,
                } as MotionStyle
              }
            />
          )}
        />
      </SwitchPrimitive.Root>
    </MotionConfig>
  );
}
