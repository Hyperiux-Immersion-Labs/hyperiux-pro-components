// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import { OrdButton, OrdMark } from "./Buttons";
import { LINKS, ROUTES } from "./nav";

gsap.registerPlugin(useGSAP);

// Below 1025px the header links move into this full-screen menu: the panel wipes down, the links rise
// in one by one, and scrolling is paused while it is open
const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const lenis = useLenis();
  const pathname = usePathname();
  const id = useId();
  // Rendered into the page root, not the header: the header moves with a transform when it hides,
  // which would trap a fixed panel inside it. The page root keeps the template's scoped styles.
  const host = useSyncExternalStore(
    () => () => {},
    () => document.querySelector(".ord-page"),
    () => null,
  );

  useGSAP(
    () => {
      const el = panel.current;
      if (!el) return;
      const reduced = prefersReducedMotion();
      tl.current = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .set(el, { visibility: "visible" })
        .fromTo(el, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: reduced ? 0 : 0.8, ease: "expo.inOut" })
        .fromTo("[data-mm-link]", { yPercent: 110 }, { yPercent: 0, duration: reduced ? 0 : 0.9, stagger: 0.06 }, reduced ? 0 : 0.35)
        .fromTo("[data-mm-foot]", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: reduced ? 0 : 0.7 }, reduced ? 0 : 0.6);
    },
    { scope: panel, dependencies: [host] },
  );

  useEffect(() => {
    if (open) {
      tl.current?.timeScale(1).play();
      lenis?.stop();
      panel.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
    } else {
      tl.current?.timeScale(1.6).reverse();
      lenis?.start();
    }
  }, [open, lenis]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
        className="hidden h-[5.6vh] aspect-square items-center justify-center border border-current/25 transition-colors duration-300 hover:border-current/60 max-lg:flex max-lg:h-[4.2vh] max-md:h-[5.6vh]"
      >
        <span className="relative block h-[1.4vh] w-[45%]">
          <span className="absolute inset-x-0 top-0 block h-px bg-current" />
          <span className="absolute inset-x-0 bottom-0 block h-px bg-current" />
        </span>
      </button>
      {host &&
        createPortal(
      <div
        ref={panel}
        id={id}
        aria-hidden={!open}
        inert={!open}
        className="invisible fixed inset-0 z-[60] hidden flex-col justify-between gap-10 bg-ord-ink px-[4vw] pb-[6vh] text-ord-bone max-lg:flex max-md:px-[5vw]"
      >
        <div className="flex items-center justify-between py-[2.4vw] max-md:py-[4.4vw]">
          <a href={ROUTES.home} onClick={() => setOpen(false)} className="flex items-center gap-3">
            <OrdMark />
            <span className="text-30 font-medium">Ordin</span>
          </a>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => {
              setOpen(false);
              button.current?.focus();
            }}
            className="flex h-[4.2vh] aspect-square items-center justify-center border border-(--ord-bone)/25 max-md:h-[5.6vh]"
          >
            <span className="relative block h-[1.4vh] w-[45%]">
              <span className="absolute inset-x-0 top-1/2 block h-px rotate-45 bg-current" />
              <span className="absolute inset-x-0 top-1/2 block h-px -rotate-45 bg-current" />
            </span>
          </button>
        </div>
        <nav aria-label="Main" className="flex flex-col">
          {LINKS.map((l, i) => (
            <span key={l.label} className="block overflow-hidden border-b border-(--ord-bone)/10">
              <a
                data-mm-link
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={pathname.endsWith(l.href) ? "page" : undefined}
                className="flex items-baseline gap-5 py-[2.2vh] text-64 transition-colors duration-300 hover:text-ord-primary-light aria-[current=page]:text-ord-primary-light"
              >
                <span className="ord-label text-14 text-ord-primary-light">{String(i + 1).padStart(2, "0")}</span>
                {l.label}
              </a>
            </span>
          ))}
        </nav>
        <div data-mm-foot className="flex items-center justify-between gap-6 max-md:flex-col max-md:items-start">
          <OrdButton href={ROUTES.pricing}>Get started</OrdButton>
          <span className="ord-label text-14 uppercase text-ord-stone">The operating layer for autonomous work.</span>
        </div>
      </div>,
          host,
        )}
    </>
  );
};

export default MobileMenu;
