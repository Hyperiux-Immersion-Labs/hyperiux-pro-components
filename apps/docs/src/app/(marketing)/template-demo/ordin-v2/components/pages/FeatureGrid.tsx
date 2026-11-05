// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import { useReveal } from "../Animations/useReveal";
import { useBuildIn } from "../Animations/useBuildIn";
import Spotlight from "../Animations/Spotlight";
import LineReveal from "../Animations/LineReveal";
import Icon, { type IconName } from "../Icon";
import Roll from "../Animations/Roll";

const LINE = "border-(--ord-ink)/12";

export type Feature = { icon: IconName; title: string; body: string };

type FeatureGridProps = {
  orb: string;
  chapter: string;
  heading: React.ReactNode;
  copy: string;
  items: Feature[];
  tone?: "bone" | "mist";
};

// Light section: a heading row and a bordered three-column grid whose icons draw on hover
const FeatureGrid = ({ orb, chapter, heading, copy, items, tone = "bone" }: FeatureGridProps) => {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  useBuildIn(root);

  return (
    <section
      ref={root}
      data-ord-orb={orb}
      data-ord-chapter={chapter}
      data-ord-light
      className={`relative text-ord-ink ${tone === "bone" ? "bg-ord-bone" : "bg-(--ord-paper)"}`}
    >
      <div className="flex flex-col gap-16 ord-container ord-section max-md:gap-10">
        <div className="flex items-end justify-between gap-10 max-lg:flex-col max-lg:items-start max-lg:gap-4">
          <LineReveal className="w-[50%] max-lg:w-full">
            <h2>{heading}</h2>
          </LineReveal>
          <LineReveal className="w-[35%] max-lg:w-[70%] max-md:w-full" delay={0.15}>
            <p className="text-28 text-(--ord-text-muted)">{copy}</p>
          </LineReveal>
        </div>
        <ul className={`grid grid-cols-3 border ${LINE} max-lg:grid-cols-2 max-md:grid-cols-1`}>
          {items.map((c, i) => (
            <Spotlight
              as="li"
              tone="light"
              key={c.title}
              data-ord-build
              className={`ord-draw group/cap relative flex flex-col gap-12 ${LINE} px-[1.8vw] py-[2vw] transition-colors duration-500 hover:bg-white/50 max-lg:px-[3vw] max-lg:py-[3.4vw] max-md:gap-6 max-md:px-[5vw] max-md:py-[6vw] ${i % 3 ? "border-l" : ""} ${i > 2 ? "border-t" : ""} max-lg:border-l-0 max-lg:border-t ${i % 2 ? "max-lg:border-l" : ""} ${i < 2 ? "max-lg:border-t-0" : ""} max-md:border-l-0 ${i === 0 ? "" : "max-md:border-t"}`}
            >
              <div className="flex items-start justify-between">
                <Icon name={c.icon} className="h-[3vh] aspect-square text-ord-primary-deep max-lg:h-[2.2vh] max-md:h-[3.2vh]" />
                <span className="ord-label text-14 text-[var(--ord-text-muted)]">
                <Roll reveal value={String(i + 1).padStart(2, "0")} />
              </span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-30">{c.title}</h3>
                <p className="text-24 text-(--ord-text-muted)">{c.body}</p>
              </div>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 block h-[2px] origin-left bg-(--ord-primary-light) [transform:scaleX(0)] transition-transform duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover/cap:[transform:scaleX(1)]"
              />
            </Spotlight>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FeatureGrid;
