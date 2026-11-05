// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import { useReveal } from "../Animations/useReveal";
import LineReveal from "../Animations/LineReveal";
import DraggableMarquee from "../effects/draggable-marquee";
import Roll from "../Animations/Roll";
import { CONNECTORS } from "./content";
import { THEME } from "../../theme";

const LINE = "border-(--ord-ink)/12";
const ROWS = [CONNECTORS.slice(0, 8), CONNECTORS.slice(8)];

const STATS = [
  ["Data and warehouses", "212"],
  ["Business apps", "394"],
  ["Developer tools", "234"],
];

const Connectors = () => {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section ref={root} data-ord-orb="platform-connectors" data-ord-chapter="Connectors" data-ord-light className="relative bg-(--ord-paper) text-ord-ink">
      <div className="flex flex-col gap-16 ord-section max-md:gap-10">
        <div className="flex items-end justify-between gap-10 ord-container max-lg:flex-col max-lg:items-start">
          <div className="flex w-[50%] flex-col gap-6 max-lg:w-full">
            <LineReveal>
              <h2>
                Plug into the stack <span className="text-(--ord-text-muted)">you already run.</span>
              </h2>
            </LineReveal>
            <LineReveal delay={0.15} className="w-[80%] max-md:w-full">
              <p className="text-28 text-(--ord-text-muted)">
                Every connector is typed in and typed out, with short-lived credentials scoped to the one agent that
                needs them.
              </p>
            </LineReveal>
          </div>
          <div data-ord-reveal className="flex flex-col items-end gap-2 max-lg:items-start">
            <div className="flex items-end leading-none">
              <span className="text-128"><Roll reveal value="840" /></span>
              <span className="text-128 text-ord-primary-deep">+</span>
            </div>
            <p className="ord-label text-14 uppercase text-(--ord-text-muted)">Typed connectors</p>
          </div>
        </div>
        <div data-ord-reveal className={`flex flex-col border-y ${LINE}`}>
          {ROWS.map((row, r) => (
            <div key={r} className={r ? `border-t ${LINE}` : ""}>
              <DraggableMarquee
                items={row.map((title, id) => ({ id, title }))}
                speed={r ? -0.8 : 0.8}
                loopEndMultiplier={-1}
                gapClassName="gap-4"
                className="py-[2.4vh]"
                itemClassName="select-none"
                renderItem={(item) => (
                  <span
                    className={`flex items-center gap-3 whitespace-nowrap border ${LINE} bg-white/50 px-[1.4vw] py-[1.2vh] text-24 transition-colors duration-300 hover:border-(--ord-primary-deep) hover:text-ord-primary-deep max-lg:px-[2.6vw] max-md:px-[4vw]`}
                  >
                    <span aria-hidden className="h-[0.7vh] aspect-square bg-(--ord-primary)" />
                    {item.title}
                  </span>
                )}
              />
            </div>
          ))}
        </div>
        <ul className={`mx-[5vw] grid grid-cols-3 border ${LINE} max-md:grid-cols-1 max-lg:mx-[4vw]`}>
          {STATS.map(([label, value], i) => (
            <li
              key={label}
              data-ord-reveal
              className={`flex items-end justify-between gap-6 ${LINE} px-[1.6vw] py-[1.8vw] max-lg:px-[3vw] max-lg:py-[3vw] max-md:px-[5vw] max-md:py-[5vw] ${i ? "border-l max-md:border-l-0 max-md:border-t" : ""}`}
            >
              <span className="text-24 text-(--ord-text-muted)">{label}</span>
              <span className="text-64 leading-none"><Roll reveal value={value} /></span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Connectors;
