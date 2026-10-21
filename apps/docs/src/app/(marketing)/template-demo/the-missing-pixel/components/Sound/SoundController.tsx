// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect } from "react";
import { playSound, readSoundPreference, setSound, suspendSound } from "./pixelSfx";

const INTERACTIVE = "a, button, summary, label";

const SoundController = () => {
  useEffect(() => {
    const resumeEvents = ["pointerdown", "keydown", "touchstart"] as const;

    const resume = (event: Event) => {
      const target = event.target as Element | null;
      if (target?.closest?.("[data-sound-toggle]")) return;
      setSound(true, false);
      resumeEvents.forEach((name) => window.removeEventListener(name, resume, true));
    };

    if (readSoundPreference()) {
      resumeEvents.forEach((name) => window.addEventListener(name, resume, true));
    }

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
      if (target.closest(INTERACTIVE)) playSound("click");
    };

    const handleVisibility = () => suspendSound(document.hidden);

    document.addEventListener("pointerover", handleOver);
    document.addEventListener("pointerout", handleOut);
    document.addEventListener("pointerdown", handleDown);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      resumeEvents.forEach((name) => window.removeEventListener(name, resume, true));
      document.removeEventListener("pointerover", handleOver);
      document.removeEventListener("pointerout", handleOut);
      document.removeEventListener("pointerdown", handleDown);
      document.removeEventListener("visibilitychange", handleVisibility);
      setSound(false, false);
    };
  }, []);

  return null;
};

export default SoundController;
