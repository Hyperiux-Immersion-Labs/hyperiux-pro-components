// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import { useResizeKey } from "../Animations/useResizeKey";
import LineReveal from "../Animations/LineReveal";
import Icon from "../Icon";
import { THEME, alpha } from "../../theme";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// One masked line inside a panel: it slides up into view and up out again as the layer changes
const Line = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className="overflow-hidden">
    <div data-pl-line className={className}>
      {children}
    </div>
  </div>
);

export type TourItem = { name: string; title: string; body: string; caps: string[]; spec: string[][] };

type TourProps = {
  orb: string;
  chapter: string;
  label: string;
  heading: React.ReactNode;
  items: TourItem[];
  // "tower" swaps the list for an isometric stack whose active layer slides out and lights up
  aside?: "list" | "tower";
};

const FACE = "[transform:rotateX(62deg)_rotateZ(-45deg)]";
const Z = ["z-1", "z-2", "z-3", "z-4", "z-5", "z-6", "z-7", "z-8"];

// Pinned walk-through: a list on the left tracks progress while each item's panel lines swap on the right
const Tour = ({ orb, chapter, label, heading, items, aside = "list" }: TourProps) => {
  const root = useRef<HTMLElement>(null);
  const resizeKey = useResizeKey();

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      const panels = gsap.utils.toArray<HTMLElement>("[data-pl-panel]", section);
      const rows = gsap.utils.toArray<HTMLElement>("[data-pl-item]", section);
      const slabs = gsap.utils.toArray<HTMLElement>("[data-tt-slab]", section);
      const faces = gsap.utils.toArray<HTMLElement>("[data-tt-face]", section);
      const vh = window.innerHeight / 100;
      const vw = window.innerWidth / 100;
      const place = (i: number, gap: number) => ((slabs.length - 1) / 2 - i) * gap * vh;
      const light = { backgroundColor: THEME.primary, borderColor: THEME.primary, color: THEME.ink };
      const dark = { backgroundColor: THEME.carbon, borderColor: alpha(THEME.primary, 0.35), color: THEME.ash };
      if (slabs.length) gsap.set(slabs, { xPercent: -50, yPercent: -50, y: (i) => place(i, 3.2) });
      const fills = gsap.utils.toArray<HTMLElement>("[data-pl-fill]", section);
      const lines = panels.map((p) => gsap.utils.toArray<HTMLElement>("[data-pl-line]", p));

      if (prefersReducedMotion()) {
        gsap.set(panels, { autoAlpha: 1 });
        if (rows[0]) gsap.set(rows[0], { opacity: 1 });
        if (fills[0]) gsap.set(fills[0], { scaleX: 1 });
        slabs.forEach((s, i) => gsap.set(s, { y: place(i, 6) }));
        if (faces[0]) gsap.set(faces[0], light);
        return;
      }

      gsap.set(panels, { autoAlpha: 1 });
      lines.forEach((set, i) => gsap.set(set, { yPercent: i === 0 ? 0 : 110 }));
      if (rows.length) {
        gsap.set(rows, { opacity: 0.35 });
        gsap.set(rows[0], { opacity: 1 });
      }

      // Starts a little before the pin, so the first layer is already in place as the stage locks
      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        scrollTrigger: { trigger: section, start: "top 30%", end: "bottom bottom", scrub: 0.8 },
      });

      // The tower opens up as the stage pins, then the first layer slides out lit
      if (slabs.length) {
        tl.to(slabs, { y: (i) => place(i, 6.4), duration: 0.6, ease: "expo.out" }, 0)
          .to(slabs[0], { x: 3.4 * vw, duration: 0.5, ease: "expo.out" }, 0.2)
          .to(faces[0], { ...light, duration: 0.3 }, 0.2);
      }

      lines.forEach((_, i) => {
        const at = i * 1.4;
        if (fills[i]) tl.to(fills[i], { scaleX: 1, duration: 1, ease: "none" }, at);
        if (i < lines.length - 1) {
          const out = at + 1;
          tl.to(lines[i], { yPercent: -110, duration: 0.45, stagger: 0.03 }, out)
            .to(lines[i + 1], { yPercent: 0, duration: 0.55, stagger: 0.04, ease: "expo.out" }, out + 0.2);
          if (rows.length) tl.to(rows[i], { opacity: 0.35, duration: 0.3 }, out).to(rows[i + 1], { opacity: 1, duration: 0.3 }, out);
          if (slabs.length) {
            tl.to(slabs[i], { x: 0, duration: 0.5, ease: "power3.inOut" }, out)
              .to(faces[i], { ...dark, duration: 0.3 }, out)
              .to(slabs[i + 1], { x: 3.4 * vw, duration: 0.6, ease: "expo.out" }, out + 0.15)
              .to(faces[i + 1], { ...light, duration: 0.3 }, out + 0.15);
          }
        }
      });
      tl.to({}, { duration: 0.6 });
    },
    { scope: root, dependencies: [resizeKey, items], revertOnUpdate: true },
  );

  return (
    <section ref={root} data-ord-orb={orb} data-ord-chapter={chapter} className="relative motion-reduce:h-auto!" style={{ height: `${items.length * 80 + 80}vh` }}>
      <div className="sticky top-0 flex h-screen items-center justify-between gap-12 overflow-hidden ord-container motion-reduce:static motion-reduce:h-auto motion-reduce:items-start motion-reduce:py-[14vh] max-lg:flex-col max-lg:items-start max-lg:justify-center max-lg:gap-8">
        <div className="flex w-[40%] flex-col gap-12 max-lg:w-full max-lg:gap-6">
          <LineReveal>
            <h2>{heading}</h2>
          </LineReveal>
          {aside === "tower" ? (
            <div aria-hidden className="relative h-[50vh] w-full max-lg:h-[30vh]">
              {items.map((l, i) => (
                <div key={l.name} data-tt-slab className={`absolute left-1/2 top-1/2 w-[12vw] aspect-square max-lg:w-[18vw] max-md:w-[26vw] ${Z[i]}`}>
                  <div className={`absolute inset-0 rounded-sm border border-(--ord-primary)/25 bg-[color-mix(in_srgb,var(--ord-ink),var(--ord-primary)_4%)] ${FACE} [translate:0_0.7vh]`} />
                  <div
                    data-tt-face
                    className={`absolute inset-0 flex items-end justify-between rounded-sm border border-(--ord-primary)/35 bg-(--ord-carbon) px-[0.9vw] py-[1.4vh] ord-label text-22 uppercase text-ord-ash ${FACE} max-md:px-[2vw] max-md:py-[1vh]`}
                  >
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <span>{l.name}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
          <ol className="flex flex-col max-lg:grid max-lg:grid-cols-3 max-lg:gap-x-6 max-md:grid-cols-2">
              {items.map((l, i) => (
                <li key={l.name} className="relative py-[1.6vh]">
                  <span data-pl-item className="flex items-baseline gap-5 max-md:gap-3">
                    <span className="ord-label text-14 text-ord-primary-light">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-30">{l.name}</span>
                  </span>
                  <span aria-hidden className="absolute inset-x-0 bottom-0 block h-px bg-(--ord-bone)/10">
                    <span data-pl-fill className="block h-px w-full origin-left bg-(--ord-primary-light) [transform:scaleX(0)]" />
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="relative h-[62vh] w-[56%] max-lg:h-[52vh] max-lg:w-full motion-reduce:flex motion-reduce:h-auto! motion-reduce:flex-col motion-reduce:gap-4">
          {items.map((l, i) => (
            <article
              key={l.name}
              data-pl-panel
              className="invisible absolute inset-0 flex flex-col justify-between gap-8 motion-reduce:visible motion-reduce:relative motion-reduce:inset-auto border border-(--ord-bone)/2 px-[2.4vw] py-[2.4vw] max-lg:px-[4vw] max-lg:py-[4vw] max-md:gap-4 max-md:px-[5vw] max-md:py-[5vw]"
            >
              <div className="flex flex-col gap-6 max-md:gap-3">
                <Line className="flex items-center justify-between ord-label text-14 uppercase text-ord-stone">
                  <span>
                    {label} {String(i + 1).padStart(2, "0")} / {l.name}
                  </span>
                 
                </Line>
                <Line>
                  <h3 className="text-64">{l.title}</h3>
                </Line>
                <Line className="w-[86%] max-md:w-full">
                  <p className="text-28 text-ord-ash">{l.body}</p>
                </Line>
              </div>
              <div className="flex items-end justify-between gap-10 max-md:flex-col max-md:items-stretch max-md:gap-4">
                <ul className="flex w-[52%] flex-col max-md:w-full">
                  {l.caps.map((c) => (
                    <li key={c}>
                      <Line className="flex items-center gap-3 border-b border-(--ord-bone)/10 py-[1.3vh] text-24">
                        <Icon name="check" className="h-[1.8vh] aspect-square shrink-0 text-ord-primary-light" />
                        {c}
                      </Line>
                    </li>
                  ))}
                </ul>
                <dl className="flex w-[38%] flex-col gap-2 max-md:hidden">
                  {l.spec.map(([k, v]) => (
                    <Line key={k} className="flex justify-between gap-4 border-b border-(--ord-bone)/10 pb-2 ord-label text-14 uppercase">
                      <dt className="text-ord-stone">{k}</dt>
                      <dd className="text-ord-bone">{v}</dd>
                    </Line>
                  ))}
                </dl>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Tour;
