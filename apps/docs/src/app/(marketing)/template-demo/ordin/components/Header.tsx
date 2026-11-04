// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { OrdButton, OrdMark } from "./Buttons";
import { onIntroDone } from "./Animations/intro";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import { useElementHeightKey } from "./Animations/useResizeKey";
import ScrambleLinkButton from "./effects/scramble-link-button";
import { scrambleTo } from "./effects/scramble-text";
import { LINKS } from "./nav";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CHAPTERS: Record<string, string> = {
  hero: "Overview",
  tokens: "Intake",
  swarm: "Orchestrate",
  guard: "Govern",
  stack: "Platform",
  statement: "Principle",
  metrics: "Proof",
  pricing: "Pricing",
  social: "Customers",
  faq: "Questions",
  cta: "Begin",
};

const Header = () => {
  const indexRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const chapterRef = useRef<HTMLDivElement>(null);
  const footerKey = useElementHeightKey("#ord-footer");

  useGSAP(
    () =>
      onIntroDone(() => {
        if (prefersReducedMotion()) return;
        gsap.from(headerRef.current, { yPercent: -100, opacity: 0, duration: 1.3, ease: "expo.out", delay: 0.4 });
        gsap.from(chapterRef.current, { x: -20, opacity: 0, duration: 1.1, ease: "expo.out", delay: 0.8 });
      }),
    [],
  );

  useGSAP(() => {
    const keys = Object.keys(CHAPTERS);
    const set = (key: string) => {
      const i = keys.indexOf(key);
      gsap.to(chapterRef.current, { autoAlpha: i < 0 ? 0 : 1, duration: 0.4 });
      if (i < 0 || !indexRef.current || !nameRef.current) return;
      gsap.fromTo(indexRef.current, { yPercent: 100 }, {
        yPercent: 0,
        duration: 0.6,
        ease: "expo.out",
        onStart: () => {
          if (indexRef.current) indexRef.current.textContent = String(i + 1).padStart(2, "0");
        },
      });
      scrambleTo(nameRef.current, CHAPTERS[key], 0.7);
    };

    const triggers = gsap.utils.toArray<HTMLElement>("[data-ord-orb]").map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top 50%",
        end: "bottom 50%",
        onToggle: (self) => self.isActive && set(el.dataset.ordOrb ?? ""),
      }),
    );

    const syncTone = () => {
      const light = tone.some((t) => t.isActive);
      gsap.to([headerRef.current, chapterRef.current], {
        color: light ? "#0c1218" : "#e6ece4",
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    };
    const tone: ScrollTrigger[] = gsap.utils.toArray<HTMLElement>("[data-ord-light]").map((el) =>
      ScrollTrigger.create({ trigger: el, start: "top 6%", end: "bottom 6%", onToggle: syncTone }),
    );

    const frame = requestAnimationFrame(() => {
      const mid = window.innerHeight / 2;
      const current = gsap.utils.toArray<HTMLElement>("[data-ord-orb]").find((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= mid && r.bottom >= mid;
      });
      if (current) set(current.dataset.ordOrb ?? "");
      const lightNow = gsap.utils.toArray<HTMLElement>("[data-ord-light]").some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= window.innerHeight * 0.06 && r.bottom >= window.innerHeight * 0.06;
      });
      gsap.set([headerRef.current, chapterRef.current], { color: lightNow ? "#0c1218" : "#e6ece4" });
    });

    let hidden = false;
    const progress = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        if (barRef.current) gsap.set(barRef.current, { scaleX: self.progress });
        const hide = self.direction === 1 && self.scroll() > window.innerHeight * 0.1;
        if (hide === hidden) return;
        hidden = hide;
        gsap.to(headerRef.current, {
          yPercent: hide ? -100 : 0,
          duration: prefersReducedMotion() ? 0 : 0.7,
          ease: "expo.out",
          overwrite: "auto",
        });
      },
    });

    return () => {
      triggers.forEach((t) => t.kill());
      tone.forEach((t) => t.kill());
      progress.kill();
      cancelAnimationFrame(frame);
      gsap.set(headerRef.current, { yPercent: 0 });
    };
  }, { dependencies: [footerKey], revertOnUpdate: true });

  return (
    <div data-ord-hide>
      <span aria-hidden className="fixed inset-x-0 top-0 z-50 block h-px bg-[#e6ece4]/10">
        <span ref={barRef} className="block h-px w-full origin-left bg-[#73bea1] [transform:scaleX(0)]" />
      </span>
      <header ref={headerRef} className="fixed inset-x-0 top-0 z-50 flex items-center justify-between ord-container py-[1.6vw] text-[#e6ece4] max-lg:py-[2.4vw] max-md:py-[4.4vw]">
        <a href="#" className="ord-draw group flex w-[20%] items-center gap-3 max-lg:w-auto">
          <OrdMark />
          <span className="text-30 font-medium">Ordin</span>
        </a>
        <nav className="flex items-center gap-10 max-lg:hidden">
          {LINKS.map((l) => (
            <ScrambleLinkButton
              key={l}
              href="#"
              text={l}
              hoverColor="#6ef2b1"
              showLine
              className="text-22 opacity-70 hover:opacity-100"
            />
          ))}
        </nav>
        <div className="flex w-[20%] items-center justify-end gap-8 max-lg:w-auto">
          <ScrambleLinkButton href="#" text="Sign in" hoverColor="#6ef2b1" className="text-22 max-md:hidden" />
          <OrdButton href="#">Get started</OrdButton>
        </div>
      </header>
      {/* <div
        ref={chapterRef}
        aria-hidden
        className="fixed left-[5vw] bottom-[3vh] z-50 flex items-center gap-4 ord-label text-14 uppercase text-[#e6ece4] max-lg:left-[4vw] max-md:hidden"
      >
        <span className="block overflow-hidden">
          <span ref={indexRef} className="block text-[#6ef2b1]">
            01
          </span>
        </span>
        <span className="block h-px w-[3vw] bg-[#73bea1]" />
        <span className="block overflow-hidden">
          <span ref={nameRef} className="block">
            Overview
          </span>
        </span>
      </div> */}
    </div>
  );
};

export default Header;
