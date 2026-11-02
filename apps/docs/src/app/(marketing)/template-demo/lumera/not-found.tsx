// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import "./lumera-styles.css";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import PrimaryButton from "./PrimaryButton";
import MaskTextReveal from "./effects/mask-text-reveal";
import heroBackground from "./assets/hero.webp";
import lumeraLogo from "./assets/icons/lumera-logo.webp";
import { prefersReducedMotion } from "./reducedMotion";

gsap.registerPlugin(useGSAP);

const HOME = "/template-demo/lumera";
const TITLE = "Page not found | Lumera Heights";

const digits = ["4", "0", "4"];

// No Loader, Header or footer here: their #section anchors point at sections a 404 doesn't have
const NotFound = () => {
  // A 404 only gets its layout's metadata title, and Next can stream that in after
  // this runs, so the tab title is set here and re-applied whenever <head> changes.
  // That rewrites the layout's own <title>, so its text is restored on the way out.
  useEffect(() => {
    const originals = new Map<HTMLTitleElement, string>();
    const apply = () => {
      const el = document.querySelector("title");
      if (!el || el.textContent === TITLE) return;
      if (!originals.has(el)) originals.set(el, el.textContent ?? "");
      el.textContent = TITLE;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      originals.forEach((text, el) => {
        if (el.isConnected && el.textContent === TITLE) el.textContent = text;
      });
    };
  }, []);
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".nf-bg", { scale: 1.15, duration: 2.4, ease: "power2.out" }, 0)
        .from(".nf-digit", { yPercent: 105, duration: 1.4, stagger: 0.12, ease: "power4.out" }, 0.2)
        .from(".nf-fadeup", { y: 24, opacity: 0, duration: 0.8, stagger: 0.12 }, 0.9)
        .from(".nf-line", { scaleX: 0, transformOrigin: "left", duration: 1.2, ease: "power4.out" }, 1);
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="lumera-page relative">

      <section className="relative isolate flex min-h-svh w-full flex-col overflow-hidden bg-[#1c1b1a] px-[5%] text-[#EEEEEE]">
        <div className="pointer-events-none absolute inset-0 z-[-1] overflow-hidden">
          <div className="nf-bg relative h-full w-full">
            <Image
              quality={65}
              src={heroBackground}
              alt=""
              fill
              sizes="100vw"
              loading="eager"
              className="h-full w-full object-cover object-top"
            />
          </div>
          <div className="absolute inset-0 bg-[#1c1b1a]/55" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(28,27,26,0.35)_0%,rgba(28,27,26,0.85)_75%)]" />
        </div>

        <header className="flex items-center justify-between pt-[2vw] max-lg:pt-[5vw] max-md:pt-[6vw]">
          <Link href={HOME} aria-label="Lumera home" className="nf-fadeup block h-fit w-40 max-md:w-30">
            <Image src={lumeraLogo} alt="Lumera" className="h-full w-full object-contain" />
          </Link>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center gap-[2vw] py-[4vw] text-center max-lg:gap-[4vw] max-lg:py-[10vw] max-md:gap-[6vw] max-md:py-[16vw]">
          <p
            aria-hidden="true"
            className="flex font-neue-montreal text-[15vw] font-medium leading-[0.8] tracking-[-0.04em] text-[#EEEEEE] max-lg:text-[24vw] max-md:text-[32vw]"
          >
            {digits.map((digit, index) => (
              <span key={index} className="block overflow-hidden pb-[0.04em]">
                <span className="nf-digit block">{digit}</span>
              </span>
            ))}
          </p>

          <MaskTextReveal animateOnScroll={false} delay={0.6} duration={3} className="max-w-[60%] max-lg:max-w-[85%] max-md:max-w-full">
            <h1 className="font-neue-montreal font-medium! text-[2.8vw] leading-[1.1] text-[#EEEEEE] max-lg:text-[4.8vw] max-md:text-[7vw]">
              This address isn&apos;t on our map
            </h1>
          </MaskTextReveal>

          <MaskTextReveal animateOnScroll={false} delay={0.9} duration={3} className="w-[46vw] max-lg:w-[80%] max-md:w-full">
            <p className="text-[1.2vw] leading-[1.6] text-white/80 max-lg:text-[2.6vw] max-md:text-[4.2vw]">
              The page you were looking for has moved, sold, or never broke ground. Every residence worth seeing is still waiting back at Lumera Heights.
            </p>
          </MaskTextReveal>

          <div className="nf-fadeup mt-[1vw] max-lg:mt-[2vw] max-md:mt-[2vw]">
            <PrimaryButton link={HOME} btnText="Return to Lumera Heights" />
          </div>
        </div>

        <div className="pb-[2vw] max-lg:pb-[5vw] max-md:pb-[7vw]">
          <div className="nf-line h-px w-full bg-white/25" />
          <div className="nf-fadeup flex items-center justify-between gap-[2vw] pt-[1.2vw] font-aeonik-pro text-[0.95vw] uppercase tracking-[0.15em] text-white/60 max-lg:pt-[3vw] max-lg:text-[2vw] max-md:text-[2.8vw]">
            <span>Lumera Heights &middot; Dubai</span>
            <span>25.2048&deg; N, 55.2708&deg; E</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotFound;
