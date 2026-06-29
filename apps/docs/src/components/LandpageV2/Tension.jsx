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
    icon: "timing",
    label: "Drops frames",
  },
  {
    title: "Restraint",
    icon: "check",
    label: "Motion noise",
  },
  {
    title: "Reduced-motion",
    icon: "spark",
    label: "Inaccessible",
  },
  {
    title: "Performance budget",
    icon: "sun",
    label: "Jank + Drain",
  },
  {
    title: "Dependency clarity",
    icon: "eye",
    label: "Hidden Bundle",
  },
  {
    title: "Mobile fallbacks",
    icon: "phone",
    label: "CLS Spikes",
  },
  {
    title: "Cleanup on unmount",
    icon: "arrows",
    label: "Leaks + Ghosts",
  },
  {
    title: "Production QA",
    icon: "sun",
    label: "Motion noise",
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

        <div className="mt-[7vw] grid w-[65vw] grid-cols-4 gap-[0.9vw] max-md:mt-14 max-md:w-full max-md:grid-cols-2 max-md:gap-4 max-sm:grid-cols-1">
          {cards.map((card) => (
            <div
              key={card.title}
              className="flex min-h-[10.5vw] flex-col justify-between rounded-[0.45vw] bg-[#151515] p-[0.45vw] text-center max-md:min-h-44 max-md:rounded-xl max-md:p-2 max-sm:min-h-40"
            >
              <div className="flex flex-1 flex-col items-center justify-center gap-[1.2vw] px-[0.5vw] py-[2vw] text-[#ff5f00] max-md:gap-5 max-md:py-5">
                <p className="text24 leading-none text-white max-md:text-sm">
                  {card.title}
                </p>

                <MotionIcon type={card.icon} />
              </div>

              <div className="flex min-h-[2.6vw] py-[1.5vw] items-center justify-center rounded-md border border-white/10 bg-[#151515] px-[0.8vw] max-md:min-h-11 max-md:rounded-lg">
                <p className="text18 leading-none max-md:text-sm">
                  {card.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-[6vw] text-center text-[1.45vw] leading-[1.4] text-white/80 max-md:mt-14 max-md:text-xl max-sm:text-base">
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