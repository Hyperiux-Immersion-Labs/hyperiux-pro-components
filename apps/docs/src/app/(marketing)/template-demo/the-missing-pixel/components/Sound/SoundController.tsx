// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect } from "react";
import { playSound, setSound, suspendSound } from "./pixelSfx";

const INTERACTIVE = "a, button, summary, label";

const SoundController = () => {
  useEffect(() => {
    let lastHover = 0;
    let lastElement: Element | null = null;

    const handleOver = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const el = (event.target as Element).closest(INTERACTIVE);
      if (!el || el === lastElement) return;
      lastElement = el;
      const now = performance.now();
      if (now - lastHover > 70) {
        lastHover = now;
        playSound("hover");
      }
    };

    const handleOut = (event: PointerEvent) => {
      const related = event.relatedTarget as Node | null;
      if (!related || !lastElement?.contains(related)) lastElement = null;
    };

    const handleDown = (event: PointerEvent) => {
      const target = event.target as Element;
      if (target.closest("[data-sound-toggle], [data-menu-toggle]")) return;
      playSound("click");
    };

    const handleVisibility = () => suspendSound(document.hidden);

    document.addEventListener("pointerover", handleOver);
    document.addEventListener("pointerout", handleOut);
    document.addEventListener("pointerdown", handleDown);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("pointerover", handleOver);
      document.removeEventListener("pointerout", handleOut);
      document.removeEventListener("pointerdown", handleDown);
      document.removeEventListener("visibilitychange", handleVisibility);
      // Silence on unmount without saving it as the visitor's choice
      setSound(false, false, false);
    };
  }, []);

  return null;
};

export default SoundController;
