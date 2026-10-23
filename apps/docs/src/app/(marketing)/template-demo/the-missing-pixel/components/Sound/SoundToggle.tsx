// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useMagnetic } from "../Animations/useMagnetic";
import { isSoundOn, setSound, subscribeSound } from "./pixelSfx";

gsap.registerPlugin(useGSAP);

const BAR_DELAYS = [0, -0.4, -0.7, -0.2];

type SoundToggleProps = {
  inverted?: boolean;
};

const SoundToggle = ({ inverted = false }: SoundToggleProps) => {
  const on = useSyncExternalStore(subscribeSound, isSoundOn, () => false);
  const ref = useRef<HTMLButtonElement | null>(null);
  const barRefs = useRef<(HTMLElement | null)[]>([]);
  useMagnetic(ref, 0.35);

  useGSAP(
    () => {
      const bars = barRefs.current.filter(Boolean) as HTMLElement[];
      gsap.killTweensOf(bars);
      if (!on) {
        gsap.to(bars, { height: "28%", duration: 0.3, ease: "power3.out" });
        return;
      }
      bars.forEach((bar, index) => {
        gsap.fromTo(
          bar,
          { height: "20%" },
          {
            height: "100%",
            duration: 0.55,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: BAR_DELAYS[index] + 0.7,
          },
        );
      });
    },
    { dependencies: [on] },
  );

  return (
    <button
      ref={ref}
      type="button"
      data-sound-toggle
      aria-pressed={on}
      aria-label={on ? "Turn sound off" : "Turn sound on"}
      onClick={() => setSound(!on)}
      className={`flex aspect-square h-[5vh] shrink-0 items-center justify-center rounded-full border transition-colors duration-300 max-lg:h-[5.2vh] max-md:h-[5.8vh] ${
        inverted
          ? "border-(--mpx-white)/30 text-(color:--mpx-paper) hover:bg-(--mpx-paper) hover:text-(color:--mpx-ink)"
          : "border-(--mpx-ink)/30 text-(color:--mpx-ink) hover:border-(--mpx-ink) hover:bg-(--mpx-ink) hover:text-(color:--mpx-paper)"
      }`}
    >
      <span aria-hidden className="flex h-[1.1vh] items-end gap-0.5 max-lg:h-[1.5vh] max-md:h-[1.7vh]">
        {BAR_DELAYS.map((_, index) => (
          <i
            key={index}
            ref={(el) => {
              barRefs.current[index] = el;
            }}
            className="block h-[28%] w-[0.1vw] rounded-full bg-current max-lg:w-[0.3vw] max-md:w-[0.5vw]"
          />
        ))}
      </span>
    </button>
  );
};

export default SoundToggle;
