// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { architecture } from "../content";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import { fade, lines, ready, scene, SCRUB, useResizeKey } from "./Animations/scroll";
import Icon from "./Icon";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const Architecture = () => {
  const root = useRef<HTMLElement>(null);
  const stack = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const resizeKey = useResizeKey();

  useGSAP(
    () => {
      const box = stack.current;
      const planes = gsap.utils.toArray<HTMLElement>("[data-orn-layer]", box);
      const spine = box?.querySelector("[data-orn-spine]");
      if (!box || !planes.length) return;

      const H = box.offsetHeight;
      const ph = planes[0].offsetHeight;
      const n = planes.length - 1;
      const place = (gap: number) => {
        const top = (H - (n * gap + ph)) / 2;
        planes.forEach((plane, i) => gsap.set(plane, { y: top + i * gap }));
      };
      const spread = (H - ph) / n;
      const compact = spread * 0.3;

      if (prefersReducedMotion()) {
        place(spread);
        ready(root.current);
        return;
      }

      const state = { gap: compact };
      place(compact);
      gsap.to(state, {
        gap: spread,
        ease: "power2.inOut",
        onUpdate: () => place(state.gap),
        scrollTrigger: { trigger: root.current, start: "top 70%", end: "center 45%", scrub: SCRUB },
      });
      if (spine) {
        gsap.fromTo(spine, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top 50%", end: "center 40%", scrub: SCRUB } });
      }

      const tl = scene(root.current, "top 75%", "center 55%");
      const split = lines(tl, root.current?.querySelector("h2") ?? null, 0);
      fade(tl, "[data-orn-copy]", 0.3);
      fade(tl, "[data-orn-arch-row]", 0.5, 0.12, 16);

      return () => split?.revert();
    },
    { scope: root, dependencies: [resizeKey], revertOnUpdate: true },
  );

  return (
    <section ref={root} id="architecture" data-orn-tone="light" className="orn-light relative z-[1] bg-orn-light">
      <div className="orn-container orn-section flex items-center justify-between gap-12 max-lg:flex-col-reverse max-lg:items-stretch">
        <div ref={stack} aria-hidden className="relative h-[70vh] w-[46%] max-lg:h-[54vh] max-lg:w-full max-md:hidden">
          <span data-orn-spine className="absolute inset-y-[8%] left-1/2 w-px origin-top bg-[var(--orn-accent)]/50" />
          {architecture.layers.map((layer, i) => (
            <div
              key={layer.title}
              data-orn-layer
              onPointerEnter={() => setActive(i)}
              onPointerLeave={() => setActive(null)}
              style={{ zIndex: architecture.layers.length - i }}
              className="pointer-events-auto absolute inset-x-0 top-0 flex h-[16vh] items-center justify-center max-lg:h-[12vh]"
            >
              <div
                data-active={active === i || undefined}
                className="orn-plane absolute h-[16vw] aspect-square border border-[var(--orn-accent)]/35 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--orn-mint)_70%,transparent),color-mix(in_srgb,var(--orn-mint)_30%,var(--orn-light)))] transition-colors duration-200 data-[active]:border-[var(--orn-accent)] data-[active]:bg-[var(--orn-mint)] max-lg:h-[22vw]"
              />
              <span className="relative flex items-center gap-2 text-14 font-medium text-orn-ink">
                <Icon name={layer.icon} className="h-[2vh] aspect-square text-orn-accent max-lg:h-[1.6vh]" />
                {String(i + 1).padStart(2, "0")}. {layer.title}
              </span>
            </div>
          ))}
        </div>
        <div className="flex w-[44%] flex-col gap-10 max-lg:w-full max-md:gap-8">
          <div className="flex flex-col gap-5">
            <h2 data-orn-split>
              {architecture.title.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p data-orn-copy data-orn-fade className="w-[80%] text-16 text-orn-muted max-md:w-full">
              {architecture.copy}
            </p>
          </div>
          <ol className="flex flex-col">
            {architecture.layers.map((layer, i) => (
              <li
                key={layer.title}
                data-orn-arch-row
                data-orn-fade
                data-active={active === i || undefined}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                className="group/row flex items-center gap-6 border-t border-orn-line py-[1vw] transition-colors duration-200 last:border-b data-[active]:border-[var(--orn-accent)] max-lg:py-[2vw] max-md:gap-4 max-md:py-[4vw]"
              >
                <span className="w-[8%] font-orn-mono text-12 text-orn-accent max-md:w-[10%]">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="w-[34%] text-14 font-medium">{layer.title}</h3>
                <p className="flex-1 text-14 text-orn-muted transition-colors duration-200 group-data-[active]/row:text-[var(--orn-text)]">{layer.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default Architecture;
