// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { specialists } from "../content";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import { curve, draw, fade, lines, ready, scene, useResizeKey } from "./Animations/scroll";
import Icon from "./Icon";
import ParticleGlobe, { globeDriver } from "./ParticleGlobe";

gsap.registerPlugin(useGSAP);

const Card = ({ item, side }: { item: (typeof specialists.items)[number]; side: "left" | "right" }) => (
  <div
    data-orn-specialist={side}
    data-orn-fade
    className="flex items-start gap-4 border border-orn-line-dark bg-[color-mix(in_srgb,var(--orn-surface)_70%,transparent)] px-[1.2vw] py-[1.2vw] transition-colors duration-200 hover:border-[var(--orn-accent)] max-lg:px-[2.4vw] max-lg:py-[2.4vw] max-md:flex-col max-md:gap-3 max-md:px-[4vw] max-md:py-[4vw]"
  >
    <Icon name={item.icon} className="h-[2.8vh] aspect-square shrink-0 text-orn-mint max-lg:h-[2vh] max-md:h-[3vh]" />
    <div className="flex flex-col gap-1">
      <h3 className="text-19">{item.title}</h3>
      <p className="text-14 text-orn-paper-muted">{item.detail}</p>
    </div>
  </div>
);

const Specialists = () => {
  const root = useRef<HTMLElement>(null);
  const diagram = useRef<HTMLDivElement>(null);
  const core = useRef<HTMLDivElement>(null);
  const driver = useRef(globeDriver());
  const resizeKey = useResizeKey();
  const left = specialists.items.slice(0, 3);
  const right = specialists.items.slice(3, 6);

  useGSAP(
    () => {
      const box = diagram.current;
      const globe = core.current;
      const svg = box?.querySelector("svg");
      if (!box || !globe || !svg) return;

      const b = box.getBoundingClientRect();
      const g = globe.getBoundingClientRect();
      const cards = gsap.utils.toArray<HTMLElement>("[data-orn-specialist]", box);
      const paths = gsap.utils.toArray<SVGPathElement>("path", svg);
      svg.setAttribute("viewBox", `0 0 ${b.width} ${b.height}`);
      const gx = g.left + g.width / 2 - b.left;
      const gy = g.top + g.height / 2 - b.top;
      const reach = g.width * 0.42;
      cards.forEach((card, i) => {
        const r = card.getBoundingClientRect();
        const isLeft = card.dataset.ornSpecialist === "left";
        const y = r.top + r.height / 2 - b.top;
        const offset = (y - gy) * 0.35;
        const from = isLeft ? r.right - b.left : r.left - b.left;
        const to = isLeft ? gx - reach : gx + reach;
        paths[i]?.setAttribute("d", curve(from, y, to, gy + offset));
      });

      if (prefersReducedMotion()) {
        driver.current.form = 1;
        ready(root.current);
        return;
      }

      const tl = scene(root.current, "top 75%", "bottom 80%");
      const split = lines(tl, root.current?.querySelector("h2") ?? null, 0);
      fade(tl, "[data-orn-copy]", 0.3);
      tl.to(driver.current, { form: 1, duration: 1.2, ease: "power2.out" }, 0.4);
      draw(tl, paths, 1.3, 0.12);
      fade(tl, cards, 1.6, 0.14, 16);
      tl.to(driver.current, { spin: 2, glow: 0.8, duration: 2.6 }, 0.4);

      return () => split?.revert();
    },
    { scope: root, dependencies: [resizeKey], revertOnUpdate: true },
  );

  return (
    <section ref={root} id="specialists" data-orn-aurora className="orn-dark relative">
      <div aria-hidden className="orn-veil absolute inset-0 -z-10" />
      <div className="orn-container orn-section flex flex-col items-center gap-14 max-md:gap-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 data-orn-split>{specialists.title}</h2>
          <p data-orn-copy data-orn-fade className="text-16 text-orn-paper-muted">
            {specialists.copy}
          </p>
        </div>
        <div
          ref={diagram}
          className="relative flex w-full items-center justify-between max-lg:grid max-lg:grid-cols-3 max-lg:gap-4 max-md:grid-cols-2 max-md:gap-3"
        >
          <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible max-lg:hidden" fill="none">
            {specialists.items.map((item) => (
              <path key={item.title} pathLength={1} strokeDasharray="1" stroke="var(--orn-accent)" strokeWidth="1" />
            ))}
          </svg>
          <div className="flex w-[27%] flex-col gap-6 max-lg:contents">
            {left.map((item) => (
              <Card key={item.title} item={item} side="left" />
            ))}
          </div>
          <div ref={core} className="w-[30vw] max-lg:order-first max-lg:col-span-3 max-lg:w-[44vw] max-lg:justify-self-center max-md:col-span-2 max-md:w-[60vw]">
            <ParticleGlobe driver={driver} density={0.7} />
          </div>
          <div className="flex w-[27%] flex-col gap-6 max-lg:contents">
            {right.map((item) => (
              <Card key={item.title} item={item} side="right" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Specialists;
