"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import "./elenavoss.css";
import ElenaVossLogo from "./assets/elena-voss.svg";
import DotFillBtn from "./effects/dot-fill-button/DotFillButton";
import OverflowTextReveal from "./effects/overflow-text-reveal";
import Line from "./Line";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

// Rewritten to "/" by the packager in the downloaded app - keep this exact string.
const HOME = "/template-demo/elenavoss";
const TITLE = "Page not found | Elena Voss";

// The "404" rises first, then the copy, then the button and string line
// settle in - the same order the Hero plays its own intro in.
const HEADLINE_DELAY = 0.2;
const COPY_DELAY = 0.7;
const DETAILS_DELAY = 1.1;

// Same warm gradient as the Hero's backdrop, faded into the template's
// #070707 so the page reads as a quieter cut of the opening frame.
const BACKDROP = `
  radial-gradient(55% 45% at 92% 0%, #F0640D 0%, rgba(240,100,13,0) 65%),
  radial-gradient(50% 45% at 4% 70%, #EC690F 0%, rgba(236,105,15,0) 65%),
  radial-gradient(70% 60% at 48% 38%, #B01205 0%, rgba(176,18,5,0) 70%),
  linear-gradient(180deg, #D8470A 0%, #C0300A 22%, #B01205 40%, #7A1C08 60%, #2A1108 82%, #070707 100%)
`;

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
  const prefersReducedMotion = usePrefersReducedMotion();
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(backdropRef.current, { opacity: 1 });
        gsap.set(lineRef.current, { scaleX: 1 });
        gsap.fromTo(detailsRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power2.out", delay: DETAILS_DELAY });
        return;
      }

      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 1.5, ease: "power2.out" });
      gsap.fromTo(
        detailsRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: DETAILS_DELAY }
      );
      gsap.fromTo(
        lineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.4, ease: "power3.inOut", delay: DETAILS_DELAY }
      );
    });
    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <div className="elenavoss-body">
      <main className="relative w-full min-h-svh overflow-hidden bg-[#070707] text-white flex flex-col">
        <div ref={backdropRef} aria-hidden className="absolute inset-0 opacity-0" style={{ backgroundImage: BACKDROP }} />

        <header className="absolute inset-x-0 top-0 z-10 w-full flex items-center justify-between px-[4vw] py-[1.5vw] max-lg:px-[5vw] max-lg:py-[3vw] max-md:py-4">
          <Link href={HOME} aria-label="Elena Voss home">
            <Image
              src={ElenaVossLogo}
              width={338}
              height={172}
              alt="Logo"
              className="w-[12vw] max-lg:w-[25vw] max-md:w-[34vw]"
            />
          </Link>
        </header>

        {/* Header and footer bar sit on top, so the copy centres on the full screen */}
        <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-[4vw] py-[8vw] max-lg:px-[5vw] max-lg:py-[20vw] max-md:py-[28vw]">
          <OverflowTextReveal animateOnScroll={false} delay={HEADLINE_DELAY} stagger={0.08} duration={0.9}>
            <h1 className="text-[15vw] font-medium! leading-[0.9] tracking-[-0.04em] max-lg:text-[26vw] max-md:text-[34vw]">404</h1>
          </OverflowTextReveal>
          <OverflowTextReveal animateOnScroll={false} delay={COPY_DELAY} stagger={0.015} className="mt-[1vw] max-lg:mt-[3vw] max-md:mt-[4vw]">
            <h2 className="text-[2.6vw] leading-[1.15] max-lg:text-[4.8vw] max-md:text-[7vw]">
              This page didn&apos;t make the final cut.
            </h2>
          </OverflowTextReveal>
          <div ref={detailsRef} className="flex flex-col items-center gap-[2.5vw] mt-[1.5vw] opacity-0 max-lg:gap-[5vw] max-lg:mt-[3vw] max-md:gap-[8vw] max-md:mt-[5vw]">
            <p className="w-[32vw] text-[1.25vw] leading-[1.4] text-white/70 max-lg:w-[65%] max-lg:text-[2.6vw] max-md:w-full max-md:text-[4.2vw]">
              Like any good edit, some pages get left on the cutting-room floor. The rest of the work is still right where it should be.
            </p>
            <DotFillBtn
              btnText="Back to Home"
              href={HOME}
              textClassName="font-normal text-[1.15vw] max-lg:text-[3vw] max-md:text-[4.2vw]"
              bgColor="#ffffff"
              dotColor="#070707"
              hoverTextColor="#ffffff"
              textColor="#111111"
            />
          </div>
        </section>

        <div className="absolute inset-x-0 bottom-0 z-10 px-[4vw] pb-[2vw] max-lg:px-[5vw] max-lg:pb-[5vw] max-md:pb-[7vw]">
          <div ref={lineRef} className="relative h-px w-full origin-left scale-x-0">
            <Line strokeColor="rgba(255, 255, 255, 0.4)" />
          </div>
          <div className="flex justify-between pt-[1.5vw] text-[1.25vw] tracking-wide text-white/40 max-lg:pt-[3vw] max-lg:text-[2.2vw] max-md:pt-[5vw] max-md:text-[3.4vw]">
            <p>Creative Web Designer</p>
            <p>Elena Voss Design 2026</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
