"use client";

import { forwardRef, useEffect, useRef } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
} from "motion/react";

const routeFadeEase = [0.22, 1, 0.36, 1];

export const RouteFade = forwardRef(function RouteFade(
  { children, className = "", motionKey, remount = true },
  ref
) {
  const controls = useAnimationControls();
  const previousMotionKeyRef = useRef(motionKey);

  useEffect(() => {
    if (remount) return;

    if (previousMotionKeyRef.current === motionKey) {
      controls.set({ opacity: 1});
      return;
    }

    previousMotionKeyRef.current = motionKey;

    const runFade = async () => {
      await controls.start({
        opacity: 0,
        transition: { duration: 0.16, ease: routeFadeEase },
      });

      await controls.start({
        opacity: 1,
        transition: { duration: 0.24, ease: routeFadeEase },
      });
    };

    runFade();
  }, [controls, motionKey, remount]);

  if (!remount) {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0}}
        animate={controls}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={motionKey}
        ref={ref}
        initial={{ opacity: 0}}
        animate={{ opacity: 1,}}
        exit={{ opacity: 0, }}
        transition={{ duration: 0.4, ease: routeFadeEase }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
});
