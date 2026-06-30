import { Check, X } from "lucide-react";
import React from "react";

const MotionIcon = ({ type }) => {
  if (type === "timing") {
    return (
      <svg viewBox="0 0 64 64" className="size-[7vw] max-md:size-10 max-sm:size-9">
        <rect x="28" y="8" width="8" height="8" fill="currentColor" />
        <rect x="28" y="48" width="8" height="8" fill="currentColor" />
        <rect x="8" y="28" width="8" height="8" fill="currentColor" />
        <rect x="48" y="28" width="8" height="8" fill="currentColor" />
        <rect x="20" y="20" width="8" height="8" fill="currentColor" />
        <rect x="36" y="20" width="8" height="8" fill="currentColor" />
        <rect x="20" y="36" width="8" height="8" fill="currentColor" />
        <rect x="36" y="36" width="8" height="8" fill="currentColor" />
        <rect x="28" y="28" width="8" height="8" fill="currentColor" />
      </svg>
    );
  }

  if (type === "check") {
    return (
      <svg viewBox="0 0 64 64" className="size-[7vw] max-md:size-10 max-sm:size-9">
        <rect x="12" y="32" width="8" height="8" fill="currentColor" />
        <rect x="20" y="40" width="8" height="8" fill="currentColor" />
        <rect x="28" y="32" width="8" height="8" fill="currentColor" />
        <rect x="36" y="24" width="8" height="8" fill="currentColor" />
        <rect x="44" y="16" width="8" height="8" fill="currentColor" />
      </svg>
    );
  }

  if (type === "spark") {
    return (
      <svg viewBox="0 0 64 64" className="size-[7vw] max-md:size-10 max-sm:size-9">
        <rect x="28" y="8" width="8" height="8" fill="currentColor" />
        <rect x="28" y="48" width="8" height="8" fill="currentColor" />
        <rect x="8" y="28" width="8" height="8" fill="currentColor" />
        <rect x="48" y="28" width="8" height="8" fill="currentColor" />
        <rect x="18" y="18" width="6" height="6" fill="currentColor" />
        <rect x="40" y="18" width="6" height="6" fill="currentColor" />
        <rect x="18" y="40" width="6" height="6" fill="currentColor" />
        <rect x="40" y="40" width="6" height="6" fill="currentColor" />
      </svg>
    );
  }

  if (type === "sun") {
    return (
      <svg viewBox="0 0 64 64" className="size-[7vw] max-md:size-10 max-sm:size-9">
        <rect x="28" y="8" width="8" height="8" fill="currentColor" />
        <rect x="28" y="48" width="8" height="8" fill="currentColor" />
        <rect x="8" y="28" width="8" height="8" fill="currentColor" />
        <rect x="48" y="28" width="8" height="8" fill="currentColor" />
        <rect x="20" y="20" width="8" height="8" fill="currentColor" />
        <rect x="36" y="20" width="8" height="8" fill="currentColor" />
        <rect x="20" y="36" width="8" height="8" fill="currentColor" />
        <rect x="36" y="36" width="8" height="8" fill="currentColor" />
      </svg>
    );
  }

  if (type === "eye") {
    return (
      <svg viewBox="0 0 64 64" className="size-[7vw] max-md:size-10 max-sm:size-9">
        <rect x="12" y="28" width="8" height="8" fill="currentColor" />
        <rect x="20" y="20" width="8" height="8" fill="currentColor" />
        <rect x="28" y="16" width="8" height="8" fill="currentColor" />
        <rect x="36" y="20" width="8" height="8" fill="currentColor" />
        <rect x="44" y="28" width="8" height="8" fill="currentColor" />
        <rect x="36" y="36" width="8" height="8" fill="currentColor" />
        <rect x="28" y="40" width="8" height="8" fill="currentColor" />
        <rect x="20" y="36" width="8" height="8" fill="currentColor" />
        <rect x="28" y="28" width="8" height="8" fill="currentColor" />
      </svg>
    );
  }

  if (type === "phone") {
    return (
      <svg viewBox="0 0 64 64" className="size-[7vw] max-md:size-10 max-sm:size-9">
        <rect x="22" y="8" width="20" height="8" fill="currentColor" />
        <rect x="18" y="16" width="8" height="32" fill="currentColor" />
        <rect x="38" y="16" width="8" height="32" fill="currentColor" />
        <rect x="22" y="48" width="20" height="8" fill="currentColor" />
        <rect x="28" y="12" width="8" height="4" fill="#0e0e0e" />
        <rect x="30" y="50" width="4" height="4" fill="#0e0e0e" />
      </svg>
    );
  }

  if (type === "arrows") {
    return (
      <svg viewBox="0 0 64 64" className="size-[7vw] max-md:size-10 max-sm:size-9">
        <rect x="12" y="18" width="8" height="8" fill="currentColor" />
        <rect x="20" y="26" width="8" height="8" fill="currentColor" />
        <rect x="28" y="34" width="8" height="8" fill="currentColor" />
        <rect x="36" y="26" width="8" height="8" fill="currentColor" />
        <rect x="44" y="18" width="8" height="8" fill="currentColor" />
        <rect x="12" y="38" width="8" height="8" fill="currentColor" />
        <rect x="20" y="46" width="8" height="8" fill="currentColor" />
        <rect x="28" y="54" width="8" height="8" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" className="size-[7vw] max-md:size-10 max-sm:size-9">
      <rect x="28" y="8" width="8" height="8" fill="currentColor" />
      <rect x="28" y="48" width="8" height="8" fill="currentColor" />
      <rect x="8" y="28" width="8" height="8" fill="currentColor" />
      <rect x="48" y="28" width="8" height="8" fill="currentColor" />
      <rect x="20" y="20" width="8" height="8" fill="currentColor" />
      <rect x="36" y="20" width="8" height="8" fill="currentColor" />
      <rect x="20" y="36" width="8" height="8" fill="currentColor" />
      <rect x="36" y="36" width="8" height="8" fill="currentColor" />
    </svg>
  );
};

const cards = [
  {
    title: "Timing",
    description: "Precise sequencing that feels intentional, not random.",
    label: "Drops frames",
  },
  {
    title: "Restraint",
    description: "Motion that supports content, not distracts from it.",
    label: "Motion noise",
  },
  {
    title: "Reduced-motion",
    description: "Respects user preferences and accessibility out of the box.",
    label: "Inaccessible",
  },
  {
    title: "Performance budget",
    description: "No jank, no layout jumps, no CLS spikes.",
    label: "Jank + Drain",
  },
  {
    title: "Dependency clarity",
    description: "Lightweight by default. Smooth under pressure",
    label: "Hidden Bundle",
  },
  {
    title: "Mobile fallbacks",
    description: "No mystery bundles or hidden landmines",
    label: "CLS Spikes",
  },
  {
    title: "Cleanup on unmount",
    description: "No leaks, no ghosts, no lingering listeners",
    label: "Leaks + Ghosts",
  },
];

export default function Tension() {
  return (
    <section className="relative w-full overflow-hidden bg-[#0e0e0e] px-[5vw] py-[10%] text-white max-md:px-[6vw] max-md:py-24 max-sm:px-5 max-sm:py-20">
      <div className="mx-auto flex w-full max-w-[90vw] flex-col items-center">
        <div className="w-full text-center">
          <h2 className="text110 font-normal leading-[0.95]  max-md:leading-[1.02]">
            Good Motion is{" "}
            <span className="text-[#ff5f00]">Harder</span> Than it Looks
          </h2>

          <p className="mx-auto mt-[1.6vw] max-w-[65vw] text24 font-light leading-[1.55] text-white max-md:mt-5 max-md:max-w-[82vw] max-md:text-sm max-sm:max-w-full">
            Anyone can add a fade. The hard part is everything around it:
            timing, restraint, layout awareness, responsive behavior,
            reduced-motion support, dependency clarity, and performance
            discipline. Get it wrong and your “wow moment” janks on mobile,
            tanks your Lighthouse score, or quietly breaks for the people who
            turned motion off.
          </p>
        </div>

        <div className=" h-fit w-[70vw] mt-[8vw] space-y-[1vw]">
          <div className="text24 px-[.5vw] flex w-full items-center justify-between">
            <p>Fixes</p>
            <p>Solves</p>
          </div>

          {cards.map((items, index) => (
            <div key={index} className="bg-dark-card rounded-sm flex items-center justify-between pr-[1.5vw] p-[.7vw]">
              <div className="flex items-center gap-[1vw] w-[25vw] shrink-0">
                <div className="size-[3vw] flex items-center justify-center p-1.5 bg-black rounded-sm shrink-0">
                  <Check color="#03E07C" className="h-full w-full object-cover" />
                </div>
                <p className="text34 capitalize whitespace-nowrap">{items.title}</p>
              </div>
              <p className="text-light-grey flex-1 text-left px-[2vw] text18">{items.description}</p>
              <div className="flex items-center gap-[1vw] w-[13vw] shrink-0">
                <div className="size-[3vw] flex items-center justify-center shrink-0">
                  <X color="#FF0B0B" />
                </div>
                <p className="text24 capitalize">{items.label}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-[8vw] text-center text-[1.45vw] leading-[1.4] text-white/80 max-md:mt-14 max-md:text-xl max-sm:text-base">
          That difference has a name.{" "}
          <span className="italic text-[#ff5f00]">
            It’s the interaction layer.
          </span>{" "}
          Here it is.
        </p>
      </div>
    </section>
  );
}