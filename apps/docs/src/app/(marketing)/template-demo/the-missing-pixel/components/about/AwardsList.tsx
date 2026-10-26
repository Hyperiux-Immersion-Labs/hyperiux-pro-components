// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { FadeUp, RuleDraw } from "../Animations/gsapAnim";
import { prefersReducedMotion } from "../Animations/reducedMotion";

type Award = { year: string; name: string; project: string };

const AwardsList = () => {
  const pillRef = useRef<HTMLSpanElement | null>(null);
  const visibleRef = useRef(false);

  const moveTo = (row: HTMLElement) => {
    const pill = pillRef.current;
    if (!pill) return;
    const target = { y: row.offsetTop, height: row.offsetHeight };

    if (prefersReducedMotion()) {
      gsap.set(pill, { ...target, opacity: 1 });
      return;
    }

    if (!visibleRef.current) {
      visibleRef.current = true;
      gsap.set(pill, target);
      gsap.to(pill, { opacity: 1, duration: 0.3, ease: "power2.out", overwrite: "auto" });
      return;
    }

    gsap.to(pill, { ...target, opacity: 1, duration: 0.6, ease: "power3.out", overwrite: "auto" });
  };

  const hide = () => {
    visibleRef.current = false;
    gsap.to(pillRef.current, { opacity: 0, duration: 0.3, ease: "power2.out", overwrite: "auto" });
  };

  return (
    <ul onMouseLeave={hide} className="relative flex flex-col">
      <span
        ref={pillRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 w-full rounded-none bg-(--mpx-white) opacity-0 max-md:hidden"
      />
      <li aria-hidden className="relative flex items-baseline justify-between gap-9 px-[1vw] py-[1vw] text-14 text-mpx-muted max-md:hidden">
        <span className="w-[14%]">Year</span>
        <span className="w-[46%]">Award</span>
        <span className="w-[30%] text-right">Project</span>
      </li>
      {AWARDS.map((award) => (
        <li
          key={`${award.year}-${award.name}`}
          onMouseEnter={(event) => moveTo(event.currentTarget)}
          className="relative"
        >
          <RuleDraw syncWithFade className="absolute inset-x-0 top-0 h-px bg-(--mpx-ink)/10" />
          <FadeUp className="flex items-baseline justify-between gap-9 px-[1vw] py-[1.4vw] max-lg:py-[2.6vw] max-md:flex-col max-md:gap-1 max-md:px-0 max-md:py-[5vw]">
            <span className="w-[14%] text-24 text-mpx-muted max-md:w-full">{award.year}</span>
            <span className="font-mpx-head w-[46%] text-30 max-md:w-full">{award.name}</span>
            <span className="w-[30%] text-right text-24 text-mpx-muted max-md:w-full max-md:text-left">
              {award.project}
            </span>
          </FadeUp>
        </li>
      ))}
    </ul>
  );
};

export default AwardsList;

const AWARDS: Award[] = [
  { year: "2026", name: "Pentawards, Silver", project: "Cloudline packaging" },
  { year: "2026", name: "Awwwards, Site of the Day", project: "Drift Campers" },
  { year: "2025", name: "D&AD, Wood Pencil", project: "Northway Records" },
  { year: "2025", name: "Brand New, Best of the Year", project: "Kickflip Supply" },
  { year: "2024", name: "Cannes Lions, Bronze", project: "Lumen Mobile launch" },
  { year: "2024", name: "Type Directors Club, Excellence", project: "Orbit Labs" },
];
