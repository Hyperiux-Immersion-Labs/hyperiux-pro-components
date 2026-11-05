// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isMobile, prefersReducedMotion } from "./Animations/reducedMotion";
import { useResizeKey } from "./Animations/useResizeKey";
import { PROMPT } from "./Hero";
import LineReveal from "./Animations/LineReveal";
import { THEME, alpha } from "../theme";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const WORDS = PROMPT.split(" ");
const IDS = [48213, 1207, 30915, 7732, 2919, 927, 15204, 290, 11863, 279, 26740, 3291, 13];

const Tokens = () => {
  const root = useRef<HTMLElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const resizeKey = useResizeKey();

  useGSAP(
    () => {
      const section = root.current;
      const stage = section?.querySelector<HTMLElement>("[data-ord-stage]");
      if (!section || !stage) return;
      const chips = gsap.utils.toArray<HTMLElement>("[data-ord-chip]", section);
      const ids = gsap.utils.toArray<HTMLElement>("[data-ord-id]", section);
      const counter = { n: 0 };
      const setCount = () => {
        if (countRef.current) countRef.current.textContent = String(Math.round(counter.n)).padStart(2, "0");
      };

      if (prefersReducedMotion()) {
        gsap.set(chips, { opacity: 1, borderColor: alpha(THEME.primary, 0.3), color: THEME.bone });
        gsap.set(ids, { opacity: 1 });
        gsap.set("[data-ord-parsed]", { opacity: 1 });
        counter.n = WORDS.length;
        setCount();
        return;
      }

      // Where the globe sits once it settles in this section: viewport centre, pushed down by its pose
      const box = stage.getBoundingClientRect();
      const tx = box.width / 2;
      const ty = box.height * (isMobile() ? 0.66 : 0.7);
      const pulls = chips.map((chip) => {
        const r = chip.getBoundingClientRect();
        return { x: tx - (r.left - box.left + r.width / 2), y: ty - (r.top - box.top + r.height / 2) };
      });

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: { trigger: section, start: "top 50%", end: "bottom bottom", scrub: 0.8 },
      });

      // The words surface one by one while the globe travels in
      tl.fromTo(chips, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power3.out" }, 0)
        // Start from the same mint at zero alpha: tweening from "transparent" passes through black and looks muddy
        .fromTo(
          chips,
          { borderColor: alpha(THEME.primary, 0), color: THEME.stone },
          { borderColor: alpha(THEME.primary, 0.2), color: THEME.bone, duration: 0.7, stagger: 0.05, ease: "power1.inOut" },
          0.85,
        )
        .to(ids, { opacity: 1, duration: 0.3, stagger: 0.05 }, 1);

      // Then, with the globe in place, they dissolve into its core one after another
      chips.forEach((chip, i) => {
        tl.to(chip, { x: pulls[i].x, y: pulls[i].y, scale: 0.1, opacity: 0, duration: 0.8, ease: "power3.in" }, 1.9 + i * 0.1);
      });

      tl.to(counter, { n: WORDS.length, duration: 0.8 + WORDS.length * 0.1, ease: "none", onUpdate: setCount }, 1.9)
        .to("[data-ord-parsed]", { opacity: 1, duration: 0.4 }, ">-0.1")
        .to({}, { duration: 0.4 });
    },
    { scope: root, dependencies: [resizeKey], revertOnUpdate: true },
  );

  return (
    <section ref={root} data-ord-orb="tokens" className="relative h-[240vh] pt-[10%]">
      <div
        data-ord-stage
        className="sticky top-0 flex h-screen flex-col gap-14 overflow-hidden ord-container py-[7%] max-md:gap-10 max-md:py-[14vh]"
      >
        <div className="flex items-end justify-between gap-10 max-lg:flex-col max-lg:items-start max-lg:gap-4">
          <LineReveal className="w-[50%] max-lg:w-full">
            <h2>
            Every job starts as a sentence. <span className="text-ord-stone">Not a workflow.</span>
            </h2>
          </LineReveal>
          <LineReveal className="w-[26%] max-lg:w-[70%] max-md:w-full" delay={0.15}>
            <p className="text-28 text-ord-ash">
            Ordin reads intent, not keywords. Words are tokenized, weighed and drawn into the core before a
            single agent wakes.
            </p>
          </LineReveal>
        </div>
        <p className="flex w-[80%] flex-wrap justify-center gap-x-2 gap-y-8 self-center max-lg:w-full max-md:gap-y-6">
          {WORDS.map((w, i) => (
            <span
              key={i}
              data-ord-chip
              className="relative rounded-xs border border-transparent opacity-0 px-[1vw] py-[0.4vh] text-[1vw] text-(--ord-stone) max-lg:px-[1vw] max-md:px-[1.4vw]"
            >
              <span
                data-ord-id
                aria-hidden
                className="absolute left-0 top-0 -translate-y-full ord-label text-[0.5vw] text-ord-primary-light opacity-0"
              >
                {IDS[i % IDS.length]}
              </span>
              {w}
            </span>
          ))}
        </p>
        {/* <div className="absolute inset-x-[3vw] bottom-[6vh] flex items-end justify-between gap-6 ord-label text-14 uppercase text-ord-stone max-lg:inset-x-[4vw] max-md:inset-x-[5vw] max-md:flex-col max-md:items-start">
          <span>
            Tokens in <span ref={countRef} className="text-ord-primary-light">00</span> / {String(WORDS.length).padStart(2, "0")}
          </span>
          <span data-ord-parsed className="opacity-0">
            Intent: finance.reconcile / 3 sub-tasks / 2 tools / budget USD 0.04
          </span>
        </div> */}
      </div>
    </section>
  );
};

export default Tokens;
