// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { brand, nav } from "../content";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import Button from "./Button";
import { LogoMark } from "./Icon";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const Header = () => {
  const root = useRef<HTMLElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  useGSAP(() => {
    const el = root.current;
    if (!el) return;
    let light: ScrollTrigger[] = [];
    const sync = () => {
      const mode = window.scrollY < 40 ? "top" : light.some((t) => t.isActive) ? "light" : "dark";
      el.dataset.mode = mode;
    };
    light = gsap.utils.toArray<HTMLElement>("[data-orn-tone='light']").map((section) =>
      ScrollTrigger.create({ trigger: section, start: "top 4%", end: "bottom 4%", onToggle: sync }),
    );
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: sync });
    sync();

    if (!prefersReducedMotion()) {
      gsap.fromTo(bar.current, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
      gsap.from(el, { yPercent: -100, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.2 });
    }
  });

  return (
    <header
      ref={root}
      data-mode="top"
      className="group/header fixed inset-x-0 top-0 z-50 border-b border-transparent text-[var(--orn-text-on-dark)] transition-colors duration-200 data-[mode=dark]:border-[var(--orn-border-dark)] data-[mode=dark]:bg-[color-mix(in_srgb,var(--orn-forest)_80%,transparent)] data-[mode=dark]:backdrop-blur-md data-[mode=light]:border-[var(--orn-border)] data-[mode=light]:bg-[color-mix(in_srgb,var(--orn-light-alt)_88%,transparent)] data-[mode=light]:text-[var(--orn-text)] data-[mode=light]:backdrop-blur-md"
    >
      <div className="orn-container flex h-[9vh] items-center justify-between max-lg:h-[6vh] max-md:h-[8vh]">
        <a href={brand.homeHref} className="flex items-center gap-2 text-19 font-orn-display font-semibold">
          <LogoMark className="h-[3vh] aspect-square max-lg:h-[2.2vh] max-md:h-[3vh]" />
          {brand.name}
        </a>
        <nav aria-label="Main" className="flex items-center gap-10 max-md:hidden">
          {nav.links.map((link) => (
            <a key={link.label} href={link.href} className="text-14 opacity-80 transition-opacity duration-200 hover:opacity-100">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button href={nav.cta.href} className="max-md:hidden">
            {nav.cta.label}
          </Button>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="orn-menu"
            onClick={() => setOpen((v) => !v)}
            className="hidden h-[5vh] aspect-square flex-col items-center justify-center gap-1.5 border border-current/25 max-md:flex"
          >
            <span className={`h-px w-[45%] bg-current transition-transform duration-200 ${open ? "[transform:translateY(0.4vh)_rotate(45deg)]" : ""}`} />
            <span className={`h-px w-[45%] bg-current transition-transform duration-200 ${open ? "[transform:translateY(-0.4vh)_rotate(-45deg)]" : ""}`} />
          </button>
        </div>
      </div>
      <div
        id="orn-menu"
        hidden={!open}
        className="orn-container border-t border-[var(--orn-border-dark)] bg-[var(--orn-forest)] py-[6vw] text-[var(--orn-text-on-dark)]"
      >
        <nav aria-label="Mobile" className="flex flex-col gap-5">
          {nav.links.map((link) => (
            <a key={link.label} href={link.href} onClick={() => setOpen(false)} className="text-30 font-orn-display">
              {link.label}
            </a>
          ))}
          <Button href={nav.cta.href} block>
            {nav.cta.label}
          </Button>
        </nav>
      </div>
      <span ref={bar} aria-hidden className="absolute inset-x-0 bottom-0 h-px origin-left bg-[var(--orn-mint)] [transform:scaleX(0)]" />
    </header>
  );
};

export default Header;
