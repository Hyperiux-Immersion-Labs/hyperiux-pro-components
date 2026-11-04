// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import { Logo } from "./Buttons";
import CharStaggerButton from "./effects/char-stagger-button";
import RollingLink from "./effects/rolling-text";
import { Arrow } from "./Icons";
import { brand, nav } from "../content";
import { prefersReducedMotion } from "./Animations/reducedMotion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const Header = () => {
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const lenis = useLenis();

  useGSAP(() => {
    const header = headerRef.current;
    if (!header) return;
    const sync = () => {
      const probe = header.offsetHeight / 2;
      let tone = "dark";
      document.querySelectorAll<HTMLElement>("[data-vey-tone]").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= probe && rect.bottom > probe) tone = el.dataset.veyTone ?? "dark";
      });
      if (header.dataset.tone !== tone) {
        header.dataset.tone = tone;
        document.documentElement.dataset.veyTone = tone;
      }
      const scrolled = window.scrollY > 24 ? "true" : "false";
      if (header.dataset.scrolled !== scrolled) header.dataset.scrolled = scrolled;
    };
    const st = ScrollTrigger.create({ start: 0, end: "max", onUpdate: sync, onRefresh: sync });
    sync();
    window.addEventListener("vey:tone", sync);

    const triggers = nav.links.map((link) =>
      ScrollTrigger.create({
        trigger: `#${link.id}`,
        start: "top 50%",
        end: "bottom 50%",
        onToggle: (self) => {
          if (self.isActive) setActive(link.id);
          else setActive((cur) => (cur === link.id ? "" : cur));
        },
      }),
    );
    return () => {
      st.kill();
      window.removeEventListener("vey:tone", sync);
      delete document.documentElement.dataset.veyTone;
      triggers.forEach((t) => t.kill());
    };
  }, []);

  useEffect(() => {
    const main = document.getElementById("vey-main");
    const footer = document.getElementById("vey-footer");
    if (open) {
      lenis?.stop();
      main?.setAttribute("inert", "");
      footer?.setAttribute("inert", "");
      const panel = panelRef.current;
      if (panel && !prefersReducedMotion()) {
        gsap.fromTo(panel, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power2.out" });
        gsap.fromTo(
          panel.querySelectorAll("[data-menu-item]"),
          { y: 24, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.05, ease: "power3.out" },
        );
      }
    } else {
      lenis?.start();
      main?.removeAttribute("inert");
      footer?.removeAttribute("inert");
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, lenis]);

  const go = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#") || href.length < 2) return;
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;
    e.preventDefault();
    setOpen(false);
    requestAnimationFrame(() => {
      if (lenis) {
        lenis.start();
        lenis.scrollTo(target, { duration: 1.4 });
      } else {
        target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
      }
      history.replaceState(null, "", href);
    });
  };

  return (
    <header
      ref={headerRef}
      data-tone="dark"
      data-scrolled="false"
      data-open={open ? "true" : "false"}
      className="vey-header vey-pre fixed inset-x-0 top-0 z-50 vey-container py-[1vw] max-lg:py-[2vw] max-md:py-[3vw]"
    >
      <div className="vey-header-bar relative flex items-center justify-between gap-6 rounded-md border border-transparent px-[1.2vw] py-[0.6vw] text-[#f5f6fa] transition-colors duration-500 max-lg:px-[2.4vw] max-lg:py-[1.2vw] max-md:px-[4vw] max-md:py-[2.4vw]">
        <a href={brand.homeHref} aria-label={`${brand.name} home`} className="relative z-10">
          <Logo />
        </a>
        <nav aria-label="Primary" className="absolute left-1/2 flex -translate-x-1/2 items-center gap-10 max-lg:hidden">
          {nav.links.map((link) => (
            <RollingLink
              key={link.id}
              href={link.href}
              text={link.label}
              onClick={(e) => go(e, link.href)}
              aria-current={active === link.id ? "true" : undefined}
              className="vey-header-link text-22 text-[rgba(245,246,250,0.62)] transition-colors duration-300 hover:text-[#f5f6fa] aria-current:text-[#f5f6fa]"
            />
          ))}
        </nav>
        <div className="flex items-center gap-6 max-md:gap-3">
          <RollingLink
            href={nav.login.href}
            text={nav.login.label}
            className="vey-header-ghost text-22 transition-opacity duration-300 hover:opacity-70 max-md:hidden"
          />
          <CharStaggerButton
            href={nav.cta.href}
            text={nav.cta.label}
            onClick={(e) => go(e, nav.cta.href)}
            icon={Arrow}
            iconClassName="h-[0.8vw] w-[0.8vw] max-lg:h-[1.6vw] max-lg:w-[1.6vw] max-md:hidden"
            className="vey-header-cta h-[4.6vh] rounded-md bg-[#f5f6fa] px-[1.2vw] text-22 font-medium text-[#0b1020] transition-colors duration-300 hover:bg-[#aeb8e8] max-lg:h-[3.6vh] max-lg:px-[2.4vw] max-md:h-[4.8vh] max-md:px-[4vw]"
          />
          <button
            type="button"
            aria-expanded={open}
            aria-controls="vey-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="relative z-10 hidden h-[4.6vh] aspect-square items-center justify-center rounded-md border border-current/20 max-lg:flex max-lg:h-[3.6vh] max-md:h-[4.8vh]"
          >
            <span
              className={`absolute block h-px w-[40%] bg-current transition-transform duration-300 ${open ? "rotate-45" : "translate-y-[-0.4vh]"}`}
            />
            <span
              className={`absolute block h-px w-[40%] bg-current transition-transform duration-300 ${open ? "-rotate-45" : "translate-y-[0.4vh]"}`}
            />
          </button>
        </div>
      </div>

      {open ? (
        <div
          ref={panelRef}
          id="vey-menu"
          className="fixed inset-0 -z-10 flex flex-col justify-end gap-10 bg-[#0b1020] vey-container py-[10vh] text-[#f5f6fa]"
        >
          <nav aria-label="Mobile" className="flex flex-col gap-4">
            {nav.links.map((link) => (
              <a
                key={link.id}
                data-menu-item
                href={link.href}
                onClick={(e) => go(e, link.href)}
                className="flex items-center justify-between border-b border-white/10 py-[2vh] text-64"
              >
                {link.label}
                <Arrow className="h-[4vw] w-[4vw] text-[#aeb8e8] max-md:h-[6vw] max-md:w-[6vw]" />
              </a>
            ))}
          </nav>
          <div data-menu-item className="flex items-center gap-4">
            <a href={nav.login.href} className="flex h-[6vh] flex-1 items-center justify-center rounded-md border border-white/15 text-22">
              {nav.login.label}
            </a>
            <a
              href={nav.cta.href}
              onClick={(e) => go(e, nav.cta.href)}
              className="flex h-[6vh] flex-1 items-center justify-center rounded-md bg-[#aeb8e8] text-22 font-medium text-[#0b1020]"
            >
              {nav.cta.label}
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Header;
