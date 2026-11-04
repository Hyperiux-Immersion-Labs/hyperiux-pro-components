// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isMobile, prefersReducedMotion } from "./Animations/reducedMotion";
import { useResizeKey } from "./Animations/useResizeKey";
import LineReveal from "./Animations/LineReveal";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const LAYERS = [
  { name: "Runtime", body: "Durable execution that survives restarts, retries and week-long jobs." },
  { name: "Memory", body: "Vector and graph recall, scoped per agent and per customer." },
  { name: "Tools", body: "840 typed connectors, from Postgres to payroll." },
  { name: "Guard", body: "Policies that travel with every action an agent takes." },
  { name: "Evals", body: "Regression tests for model behaviour, run on every deploy." },
  { name: "Observe", body: "Traces, costs and one-click replays for every run." },
];

const Z = ["z-1", "z-2", "z-3", "z-4", "z-5", "z-6"];

const FACE = "[transform:rotateX(62deg)_rotateZ(-45deg)]";

const Stack = () => {
  const root = useRef<HTMLElement>(null);
  const resizeKey = useResizeKey();

  const lift = (i: number, on: boolean) => {
    if (prefersReducedMotion()) return;
    const lifts = root.current?.querySelectorAll<HTMLElement>("[data-ord-lift]");
    if (!lifts?.[i]) return;
    gsap.to(lifts[i], { x: on ? window.innerWidth * 0.035 : 0, duration: 0.7, ease: "expo.out", overwrite: true });
  };

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      const slabs = gsap.utils.toArray<HTMLElement>("[data-ord-slab]", section);
      const faces = gsap.utils.toArray<HTMLElement>("[data-ord-face]", section);
      const items = gsap.utils.toArray<HTMLElement>("[data-ord-layer]", section);
      const vh = window.innerHeight / 100;
      const gap = (isMobile() ? 6 : 10.5) * vh;
      const place = (i: number) => (2.5 - i) * gap;
      const last = slabs.length - 1;

      gsap.set(slabs, { xPercent: -50, yPercent: -50 });

      if (prefersReducedMotion()) {
        slabs.forEach((s, i) => gsap.set(s, { y: place(i) }));
        gsap.set(faces[last], { backgroundColor: "#73bea1", borderColor: "#73bea1", color: "#0c1218" });
        gsap.set(faces.slice(0, last), { backgroundColor: "#0c1218", borderColor: "#0c1218", color: "#e6ece4" });
        return;
      }

      slabs.forEach((s, i) => gsap.set(s, { y: place(i) - 7 * vh, opacity: 0 }));
      gsap.set(items, { opacity: 0 });

      const step = 0.9;
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: section,
          start: "top 35%",
          end: "bottom bottom",
          scrub: 0.8,
        },
      });

      slabs.forEach((s, i) => {
        const at = 0.2 + i * step;
        tl.to(s, { y: place(i), opacity: 1, duration: 0.7 }, at)
          .to(faces[i], { backgroundColor: "#73bea1", borderColor: "#73bea1", color: "#0c1218", duration: 0.3 }, at + 0.2)
          .fromTo(items[i], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, at + 0.3);
        if (i > 0) {
          tl.to(faces[i - 1], { backgroundColor: "#0c1218", borderColor: "#0c1218", color: "#e6ece4", duration: 0.3 }, at + 0.2);
        }
      });

      tl.to({}, { duration: 0.8 });
    },
    { scope: root, dependencies: [resizeKey], revertOnUpdate: true },
  );

  return (
    <section ref={root} data-ord-orb="stack" data-ord-light className="relative z-1 -mt-[100vh] h-[300vh] bg-ord-bone text-ord-ink">
      <div className="sticky top-0 flex h-screen items-center justify-between gap-10 overflow-hidden ord-container max-md:flex-col max-md:justify-center max-md:gap-4">
        <div className="relative h-[86vh] w-[46%] max-md:h-[44vh] max-md:w-full">
          {LAYERS.map((l, i) => (
            <div
              key={l.name}
              data-ord-slab
              className={`absolute left-1/2 top-1/2 w-[18vw] aspect-square max-lg:w-[24vw] max-md:w-[30vw] ${Z[i]}`}
            >
              <div data-ord-lift className="absolute inset-0">
                <div
                  aria-hidden
                  className={`absolute inset-0 rounded-sm border border-[#0c1218]/25 bg-[#bfccc1] ${FACE} [translate:0_0.8vh]`}
                />
                <div
                  data-ord-face
                  className={`absolute inset-0 flex items-end justify-between rounded-sm border border-[#0c1218]/25 bg-[#d3ddd3] px-[1.2vw] py-[2vh] ord-label text-24 uppercase text-[#7d8f8a] ${FACE} max-md:px-[2vw] max-md:py-[1vh]`}
                >
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <span>{l.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex w-[50%] flex-col gap-10 max-lg:w-[46%] max-md:w-full max-md:gap-4">
          <LineReveal>
            <h2>
              Six layers. <span className="text-ord-primary-deep">One runtime.</span>
            </h2>
          </LineReveal>
          <LineReveal className="max-md:hidden" delay={0.15}>
            <p className="text-28 text-[#4d5f5a]">
              Everything an autonomous system needs in production, in one place, so you never glue five vendors
              together with cron jobs again.
            </p>
          </LineReveal>
          <ol className="grid grid-cols-2 gap-x-8 max-md:gap-x-4">
            {LAYERS.map((l, i) => (
              <li
                key={l.name}
                data-ord-layer
                onPointerEnter={() => lift(i, true)}
                onPointerLeave={() => lift(i, false)}
                className="group/layer relative flex cursor-default flex-col gap-1 border-b border-[#0c1218]/15 py-[1.6vh]"
              >
                <span className="ord-label text-14 text-ord-primary-deep">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="text-30">{l.name}</h3>
                <p className="text-24 text-[#4d5f5a] max-md:hidden">{l.body}</p>
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-px block h-px origin-left bg-[#73bea1] [transform:scaleX(0)] transition-transform duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover/layer:[transform:scaleX(1)]"
                />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default Stack;
