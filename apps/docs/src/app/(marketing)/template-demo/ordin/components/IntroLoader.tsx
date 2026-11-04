// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { finishIntro, intro } from "./Animations/intro";
import { isMobile, prefersReducedMotion } from "./Animations/reducedMotion";
import { scrambleTo } from "./effects/scramble-text";
import { heroPose } from "./SignalOrb";

gsap.registerPlugin(useGSAP);

const STEPS = ["Booting runtime", "Loading memory", "Arming policies", "Waking agents"];

const IntroLoader = () => {
  const root = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const loader = root.current;
      if (!loader) return;

      const hide = () => {
        loader.style.display = "none";
      };

      if (intro.done) {
        hide();
        return;
      }

      if (prefersReducedMotion()) {
        finishIntro();
        hide();
        return;
      }

      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      window.scrollTo(0, 0);

      const html = document.documentElement;
      html.style.overflow = "hidden";
      const block = (e: Event) => {
        e.preventDefault();
        e.stopImmediatePropagation();
      };
      const blockKeys = (e: KeyboardEvent) => {
        if ([" ", "ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"].includes(e.key)) block(e);
      };
      window.addEventListener("wheel", block, { capture: true, passive: false });
      window.addEventListener("touchmove", block, { capture: true, passive: false });
      window.addEventListener("keydown", blockKeys, { capture: true });
      const unlock = () => {
        html.style.removeProperty("overflow");
        window.removeEventListener("wheel", block, { capture: true });
        window.removeEventListener("touchmove", block, { capture: true });
        window.removeEventListener("keydown", blockKeys, { capture: true });
      };

      const rule = document.querySelector<HTMLElement>("[data-ord-hero-rule]");
      if (rule && lineRef.current) {
        const r = rule.getBoundingClientRect();
        gsap.set(lineRef.current, { top: r.top, left: r.left, width: r.width });
      }

      const inner = document.querySelector<HTMLElement>("[data-ord-orb-intro]");
      const hp = heroPose();
      const lift = isMobile() ? -window.innerHeight * 0.3 : 0;
      if (inner) gsap.set(inner, { x: -hp.x / hp.scale, y: (lift - hp.y) / hp.scale, scale: 0.5 / hp.scale });

      const rows = gsap.utils.toArray<HTMLElement>("[data-ord-step]", loader);
      const texts = gsap.utils.toArray<HTMLElement>("[data-ord-loader-text]", loader);
      const progress = { p: 0 };
      let step = -1;

      const markStep = (next: number) => {
        rows.forEach((row, i) => {
          const label = row.querySelector<HTMLElement>("[data-ord-step-label]");
          const state = row.querySelector<HTMLElement>("[data-ord-step-state]");
          if (i < next) {
            gsap.to(row, { opacity: 0.45, duration: 0.3 });
            if (state && state.textContent !== "OK") scrambleTo(state, "OK", 0.4);
          } else if (i === next) {
            gsap.to(row, { opacity: 1, duration: 0.3 });
            if (label) scrambleTo(label, STEPS[i], 0.5);
            if (state) scrambleTo(state, "...", 0.3);
          }
        });
      };

      const tl = gsap.timeline({ delay: 0.2 });
      tl.fromTo(texts, { yPercent: 110, y: 0 }, { yPercent: 0, y: 0, duration: 0.9, stagger: 0.04, ease: "expo.out" })
        .to(
          progress,
          {
            p: 1,
            duration: 2.8,
            ease: "power2.inOut",
            onUpdate: () => {
              const p = progress.p;
              intro.assemble = p;
              if (countRef.current) countRef.current.textContent = String(Math.round(p * 100)).padStart(3, "0");
              if (fillRef.current) gsap.set(fillRef.current, { scaleX: p });
              const next = Math.min(STEPS.length - 1, Math.floor(p * STEPS.length));
              if (next !== step) {
                step = next;
                markStep(next);
              }
            },
            onComplete: () => markStep(STEPS.length),
          },
          0.3,
        )
        .to(texts, { yPercent: -110, duration: 0.7, stagger: 0.025, ease: "expo.in" }, "+=0.15")
        .to(inner, { x: 0, y: 0, scale: 1, duration: 1.7, ease: "expo.inOut" }, "<0.2")
        .add(() => finishIntro(), "<0.7")
        .to(fillRef.current, { backgroundColor: "rgba(115,190,161,0.4)", duration: 0.6 }, "<")
        .to(loader, { autoAlpha: 0, duration: 0.6, ease: "power2.out" }, "<0.3")
        .add(() => {
          unlock();
          hide();
        });

      return () => {
        tl.kill();
        unlock();
      };
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      data-ord-loader
      aria-hidden
      className="fixed inset-0 z-0 overflow-hidden bg-ord-ink"
    >
      <div className="flex items-start justify-between ord-container py-[2.2vw] ord-label text-14 uppercase text-ord-stone max-lg:py-[3vw] max-md:py-[6vw]">
        <span className="block overflow-hidden">
          <span data-ord-loader-text className="block">
            Ordin runtime / boot sequence
          </span>
        </span>
       
      </div>

      <div
        ref={lineRef}
        className="absolute left-[5vw] top-[74vh] w-[90vw] max-lg:left-[4vw] max-lg:w-[92vw] max-md:left-[5vw] max-md:top-[52vh] max-md:w-[90vw]"
      >
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-10 py-[3vh] max-md:flex-col-reverse max-md:items-start max-md:gap-4">
          <ul className="flex flex-col gap-2 ord-label text-14 uppercase">
            {STEPS.map((s, i) => (
              <li key={s} data-ord-step className="block overflow-hidden opacity-30">
                <span data-ord-loader-text className="flex w-[22vw] justify-between gap-6 max-lg:w-[40vw] max-md:w-[70vw]">
                  <span className="flex gap-4">
                    <span className="text-ord-primary-light">{String(i + 1).padStart(2, "0")}</span>
                    <span data-ord-step-label>{s}</span>
                  </span>
                  <span data-ord-step-state className="text-ord-primary-light">
                    --
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className="block overflow-hidden">
            <span data-ord-loader-text className="flex items-start gap-2">
              <span ref={countRef} className="text-128 leading-none font-light">
                000
              </span>
              <span className="ord-label text-14 text-ord-primary-light">%</span>
            </span>
          </p>
        </div>
        <span className="block h-px w-full bg-[#e6ece4]/10">
          <span ref={fillRef} className="block h-px w-full origin-left bg-[#73bea1] [transform:scaleX(0)]" />
        </span>
        <div className="absolute inset-x-0 top-full flex justify-between py-[2vh] ord-label text-14 uppercase text-ord-stone">
          <span className="block overflow-hidden">
            <span data-ord-loader-text className="block">
              Calibrating 1,100 neurons
            </span>
          </span>
          <span className="block overflow-hidden max-md:hidden">
            <span data-ord-loader-text className="block">
              Agents improvise. Policies don&apos;t.
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default IntroLoader;
