// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "../Animations/reducedMotion";

gsap.registerPlugin(useGSAP);

const CLIENTS = [
  { name: "Northway", style: "font-bold tracking-tighter" },
  { name: "Cloudline", style: "font-light tracking-wide" },
  { name: "Kickflip Supply", style: "font-semibold italic tracking-tight" },
  { name: "drift", style: "font-medium lowercase tracking-tight" },
  { name: "ORBIT", style: "font-bold tracking-tighter" },
  { name: "Fieldnote", style: "font-light tracking-wide" },
  { name: "Bloom Hours", style: "font-semibold italic tracking-tight" },
  { name: "lumen", style: "font-medium lowercase tracking-tight" },
];

const ClientMarquee = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track || prefersReducedMotion()) return;

      tweenRef.current = gsap.to(track, {
        xPercent: -50,
        duration: 48,
        ease: "none",
        repeat: -1,
      });
    },
    { scope: sectionRef },
  );

  const setSpeed = (scale: number) => {
    const tween = tweenRef.current;
    if (!tween) return;
    gsap.to(tween, { timeScale: scale, duration: 0.6, ease: "power2.out" });
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Some of the brands we work with"
      onPointerEnter={() => setSpeed(0)}
      onPointerLeave={() => setSpeed(1)}
      className="overflow-hidden pt-[7%] [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)] max-lg:py-[12%] max-md:pt-[15%]"
    >
      <div ref={trackRef} className="flex w-max">
        {[0, 1].map((group) => (
          <ul
            key={group}
            aria-hidden={group === 1 ? true : undefined}
            className="flex items-center gap-24 px-12 max-lg:gap-14 max-lg:px-7 max-md:gap-12 max-md:px-6"
          >
            {CLIENTS.map((client) => (
              <li
                key={`${group}-${client.name}`}
                className={`font-mpx-head whitespace-nowrap text-30 text-(color:--mpx-muted) transition-colors duration-300 hover:text-(color:--mpx-ink) ${client.style}`}
              >
                {client.name}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
};

export default ClientMarquee;
