// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { execution } from "../content";
import { isMobile, prefersReducedMotion } from "./Animations/reducedMotion";
import { curve, draw, fade, lines, ready, scene, useResizeKey } from "./Animations/scroll";
import Icon from "./Icon";

gsap.registerPlugin(useGSAP);

const Status = ({ status }: { status: "done" | "running" | "queued" }) => (
  <span data-orn-status={status} className="relative block h-[2.2vh] aspect-square max-lg:h-[1.6vh] max-md:h-[2.4vh]">
    <svg viewBox="0 0 20 20" className="absolute inset-0 h-full w-full" fill="none">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeOpacity="0.3" />
      {status === "done" && (
        <g data-orn-done>
          <circle cx="10" cy="10" r="9" fill="var(--orn-mint)" />
          <path d="M6 10.5l2.7 2.6L14 7.8" stroke="var(--orn-forest)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {status === "running" && (
        <circle data-orn-spin cx="10" cy="10" r="8.5" stroke="var(--orn-mint)" strokeWidth="1.5" strokeDasharray="14 60" strokeLinecap="round" />
      )}
    </svg>
  </span>
);

const Execution = () => {
  const root = useRef<HTMLElement>(null);
  const diagram = useRef<HTMLDivElement>(null);
  const resizeKey = useResizeKey();

  useGSAP(
    () => {
      const box = diagram.current;
      const card = box?.querySelector<HTMLElement>("[data-orn-card]");
      const rows = gsap.utils.toArray<HTMLElement>("[data-orn-row]", box);
      const paths = gsap.utils.toArray<SVGPathElement>("[data-orn-path]", box);
      const svg = box?.querySelector("svg[data-orn-links]");
      if (!box || !card || !svg) return;

      const b = box.getBoundingClientRect();
      const c = card.getBoundingClientRect();
      svg.setAttribute("viewBox", `0 0 ${b.width} ${b.height}`);
      const mobile = isMobile();
      rows.forEach((row, i) => {
        const r = row.getBoundingClientRect();
        const y1 = r.top + r.height / 2 - b.top;
        const x1 = r.left - b.left;
        const d = mobile
          ? `M${c.left - b.left + c.width * 0.12} ${c.bottom - b.top} V${y1} H${x1}`
          : curve(c.right - b.left, c.top + c.height / 2 - b.top, x1, y1);
        paths[i]?.setAttribute("d", d);
      });

      if (prefersReducedMotion()) {
        ready(root.current);
        return;
      }

      const tl = scene(root.current, "top 75%", "bottom 85%");
      const split = lines(tl, root.current?.querySelector("h2") ?? null, 0);
      fade(tl, "[data-orn-copy]", 0.3);
      fade(tl, card, 0.5, 0, 20);
      draw(tl, paths, 0.9, 0.15);
      fade(tl, rows, 1.3, 0.25, 16);
      tl.from("[data-orn-done]", { scale: 0, transformOrigin: "50% 50%", duration: 0.3, ease: "back.out(2)" }, 2.1);
      tl.to("[data-orn-spin]", { rotation: 540, transformOrigin: "50% 50%", duration: 2.4 }, 1.6);

      return () => split?.revert();
    },
    { scope: root, dependencies: [resizeKey], revertOnUpdate: true },
  );

  return (
    <section ref={root} id="execution" data-orn-aurora className="orn-dark relative">
      <div aria-hidden className="orn-veil absolute inset-0 -z-10" />
      <div className="orn-container orn-section flex items-center justify-between gap-12 max-lg:flex-col max-lg:items-start max-md:gap-10">
        <div className="flex w-[36%] flex-col gap-6 max-lg:w-[80%] max-md:w-full">
          <h2 data-orn-split>
            {execution.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p data-orn-copy data-orn-fade className="w-[86%] text-16 text-orn-paper-muted max-md:w-full">
            {execution.copy}
          </p>
        </div>
        <div ref={diagram} className="relative flex w-[56%] items-center justify-between max-lg:w-full max-md:flex-col max-md:items-stretch max-md:gap-8">
          <svg data-orn-links aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" fill="none">
            {execution.tasks.map((task) => (
              <path key={task.title} data-orn-path pathLength={1} strokeDasharray="1" stroke="var(--orn-accent)" strokeWidth="1" />
            ))}
          </svg>
          <div data-orn-card data-orn-fade className="relative flex w-[38%] flex-col gap-4 border border-orn-line-dark bg-orn-surface px-[1.4vw] py-[1.4vw] max-lg:px-[2.4vw] max-lg:py-[2.4vw] max-md:w-[80%] max-md:px-[5vw] max-md:py-[5vw]">
            <Icon name="doc" className="h-[2.6vh] aspect-square self-start text-orn-mint max-lg:h-[2vh] max-md:h-[2.8vh]" />
            <p className="text-14">{execution.instruction}</p>
            <span className="font-orn-mono text-12 text-orn-paper-muted">Instruction</span>
          </div>
          <div className="relative flex w-[46%] flex-col gap-6 max-md:w-[86%] max-md:self-end max-md:gap-4">
            {execution.tasks.map((task) => (
              <div
                key={task.title}
                data-orn-row
                data-orn-fade
                className="flex items-center gap-4 border border-orn-line-dark bg-orn-surface px-[1.2vw] py-[1vw] max-lg:px-[2vw] max-lg:py-[1.8vw] max-md:px-[4vw] max-md:py-[3.6vw]"
              >
                <span className="flex h-[4.4vh] aspect-square items-center justify-center border border-orn-line-dark text-orn-mint max-lg:h-[3.2vh] max-md:h-[4.6vh]">
                  <Icon name={task.icon} className="h-[55%] aspect-square" />
                </span>
                <div className="flex flex-1 flex-col">
                  <h3 className="text-14 font-medium">{task.title}</h3>
                  <p className="text-12 text-orn-paper-muted">{task.detail}</p>
                </div>
                <Status status={task.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Execution;
