// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { chapters } from "../content";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const StoryRail = () => {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rail = ref.current;
      if (!rail) return;
      const ticks = Array.from(rail.querySelectorAll<HTMLElement>("[data-tick]"));
      const label = rail.querySelector<HTMLElement>("[data-rail-label]");
      const fill = rail.querySelector<HTMLElement>("[data-rail-fill]");
      let current = -2;
      let shown = false;

      const sync = () => {
        const mid = window.innerHeight / 2;
        let chapter = -1;
        let local = 0;
        let tone = "dark";
        document.querySelectorAll<HTMLElement>("[data-vey-chapter]").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top <= mid && r.bottom > mid) {
            chapter = Number(el.dataset.veyChapter);
            tone = el.dataset.veyTone ?? "dark";
            local = Math.min(1, Math.max(0, (mid - r.top) / r.height));
          }
        });
        const visible = chapter >= 1 && tone === "dark";
        if (visible !== shown) {
          shown = visible;
          gsap.to(rail, { autoAlpha: visible ? 1 : 0, x: visible ? 0 : -12, duration: 0.4, ease: "power2.out" });
        }
        if (fill && chapter >= 1) gsap.set(fill, { scaleY: (chapter - 1 + local) / (chapters.length - 1) });
        if (chapter === current || chapter < 1) return;
        current = chapter;
        ticks.forEach((t, i) => gsap.set(t, { backgroundColor: i === chapter - 1 ? "#aeb8e8" : "rgba(255,255,255,0.25)" }));
        if (label) label.textContent = `${String(chapter).padStart(2, "0")} ${chapters[chapter]}`;
      };

      const st = ScrollTrigger.create({ start: 0, end: "max", onUpdate: sync, onRefresh: sync });
      window.addEventListener("vey:tone", sync);
      return () => {
        st.kill();
        window.removeEventListener("vey:tone", sync);
      };
    },
    { scope: ref },
  );

  return (
    <div aria-hidden className="pointer-events-none fixed left-[1.6vw] top-1/2 z-40 -translate-y-1/2 max-lg:hidden">
      <div ref={ref} className="flex items-center gap-3 opacity-0">
        <div className="relative flex flex-col gap-2">
          <span className="absolute inset-y-0 left-1/2 w-px bg-white/10">
            <span data-rail-fill className="block h-full w-px origin-top bg-[#aeb8e8]/60 [transform:scaleY(0)]" />
          </span>
          {chapters.map((c, i) =>
            i === 0 ? null : <span key={c} data-tick className="relative block h-[0.7vh] aspect-square rounded-full bg-white/25" />,
          )}
        </div>
        <span data-rail-label className="font-vey-mono text-14 text-vey-dim [writing-mode:vertical-rl] rotate-180" />
      </div>
    </div>
  );
};

export default StoryRail;
