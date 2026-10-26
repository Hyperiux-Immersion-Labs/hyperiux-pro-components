// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, type MouseEvent } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import { FadeUp, INTRO_DELAY, LineReveal } from "../Animations/gsapAnim";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import PixelButton from "../Buttons/PixelButton";
import { ROUTES } from "../../routes";
import reelPixel from "../../assets/pictures/reel-pixel.webp";
import heroFigure from "../../assets/pictures/hero-figure.webp";
import heroFigureMobile from "../../assets/pictures/hero-figure-m.webp";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const GLOW_FROM = "0 0 0.35em rgba(255,255,255,0.9), 0 0 1em rgba(255,220,180,0.6)";
const GLOW_TO = "0 0 0em rgba(255,255,255,0), 0 0 0em rgba(255,220,180,0)";

const Hero = () => {
  const lenis = useLenis();
  const heroRef = useRef<HTMLElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const photoRef = useRef<HTMLDivElement | null>(null);
  const figureRef = useRef<HTMLDivElement | null>(null);
  const lightRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const hero = heroRef.current;
      const bg = bgRef.current;
      const photo = photoRef.current;
      const figure = figureRef.current;
      const light = lightRef.current;
      if (!hero || !bg || !photo || !figure || !light) return;

      const lines = gsap.utils.toArray<HTMLElement>("[data-hero-line]", hero);
      const pixel = hero.querySelector<HTMLElement>("[data-hero-pixel]");

      if (prefersReducedMotion()) {
        gsap.set([photo, ...lines], { opacity: 1 });
        pixel?.style.setProperty("clip-path", "none");
        return;
      }

      const start = INTRO_DELAY + 0.35;
      gsap.set(lines, { filter: "blur(14px)", y: "0.12em", textShadow: GLOW_FROM });
      gsap.set(photo, { scale: 1.08 });

      gsap.to(photo, { opacity: 1, duration: 1.4, ease: "power3.out" });
      gsap.to(photo, { scale: 1, duration: 2.6, ease: "power3.out" });
      gsap.to(lines, { opacity: 1, duration: 1.4, delay: start, stagger: 0.18, ease: "power3.out" });
      gsap.to(lines, { filter: "blur(0px)", y: 0, duration: 1.8, delay: start, stagger: 0.18, ease: "power3.out" });
      gsap.to(lines, { textShadow: GLOW_TO, duration: 2.6, delay: start, stagger: 0.18, ease: "power3.out" });

      if (pixel) {
        const radius = getComputedStyle(pixel).borderTopLeftRadius;
        gsap.fromTo(
          pixel,
          { clipPath: `inset(50% round ${radius})` },
          {
            clipPath: `inset(0% round ${radius})`,
            duration: 1.2,
            delay: INTRO_DELAY + 1,
            ease: "power3.inOut",
          },
        );
      }

      gsap.to(bg, {
        y: () => hero.offsetHeight * 0.5,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      const mm = gsap.matchMedia();
      mm.add("(hover: hover) and (pointer: fine)", () => {
        const restX = () => window.innerWidth * 0.7;
        const restY = () => window.innerHeight * 0.3;

        gsap.set(light, { xPercent: -50, yPercent: -50, x: restX(), y: restY() });
        const figureX = gsap.quickTo(figure, "x", { duration: 1.2, ease: "power3.out" });
        const figureY = gsap.quickTo(figure, "y", { duration: 1.2, ease: "power3.out" });
        const figureRotate = gsap.quickTo(figure, "rotation", { duration: 1.2, ease: "power3.out" });
        const lightX = gsap.quickTo(light, "x", { duration: 1.6, ease: "power3.out" });
        const lightY = gsap.quickTo(light, "y", { duration: 1.6, ease: "power3.out" });

        const move = (event: PointerEvent) => {
          if (event.pointerType !== "mouse") return;
          const px = event.clientX / window.innerWidth;
          const py = event.clientY / window.innerHeight;
          figureX((0.5 - px) * 46);
          figureY((0.5 - py) * 26);
          figureRotate((0.5 - px) * 1);
          lightX(event.clientX);
          lightY(event.clientY);
        };

        const leave = () => {
          figureX(0);
          figureY(0);
          figureRotate(0);
          lightX(restX());
          lightY(restY());
        };

        hero.addEventListener("pointermove", move);
        hero.addEventListener("pointerleave", leave);
        return () => {
          hero.removeEventListener("pointermove", move);
          hero.removeEventListener("pointerleave", leave);
        };
      });
      mm.add("(hover: none), (pointer: coarse)", () => {
        gsap.set(light, { xPercent: -50, yPercent: -50, x: window.innerWidth * 0.7, y: window.innerHeight * 0.3 });
      });

      return () => mm.revert();
    },
    { scope: heroRef },
  );

  const handleScrollCue = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("brands");
    if (!target) return;
    event.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 2.2, force: true });
    else target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={heroRef}
      id="top"
      data-mpx-hero
      className="relative isolate h-[140vh] overflow-clip bg-[#2a0a00] text-(color:--mpx-white) motion-reduce:h-screen"
    >
      <div
        ref={bgRef}
        aria-hidden
        className="mpx-hero-bg absolute inset-x-0 top-0 -z-10 h-[120vh] overflow-hidden will-change-transform motion-reduce:h-full"
      >
        <div className="mpx-hero-gradient absolute inset-0 overflow-hidden">
          <span className="mpx-hero-blob mpx-hero-blob-glow" />
          <span className="mpx-hero-blob mpx-hero-blob-amber" />
          <span className="mpx-hero-blob mpx-hero-blob-fire" />
          <span className="mpx-hero-blob mpx-hero-blob-shade" />
        </div>
        <div
          ref={lightRef}
          className="mpx-hero-light pointer-events-none absolute left-0 top-0 size-[70vmax] rounded-full opacity-55 mix-blend-screen will-change-transform"
        />
        <div ref={figureRef} className="absolute -inset-[4%] origin-[62%_100%] will-change-transform">
          <div ref={photoRef} className="absolute inset-0 opacity-0">
            <Image
              src={heroFigure}
              alt=""
              fill
              quality={90}
              loading="eager"
              fetchPriority="high"
              sizes="108vw"
              className="object-cover object-[55%_40%] max-md:hidden"
            />
            <Image
              src={heroFigureMobile}
              alt=""
              fill
              quality={90}
              loading="eager"
              fetchPriority="high"
              sizes="108vw"
              className="hidden object-cover object-[88%_35%] max-md:block"
            />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 hidden h-[70%] bg-[linear-gradient(to_top,rgb(10_4_0/0.85),transparent)] max-md:block" />
      </div>

      <div className="relative flex min-h-screen flex-col justify-center gap-[2.6vw] px-[5vw] py-[9vh] max-lg:px-[6vw] max-md:justify-end max-md:gap-9 max-md:px-[7vw] max-md:py-[10vh]">
        <h1 className="w-[56%] max-lg:w-[85%] max-md:w-full">
          <span data-hero-line className="block opacity-0">
            Every brand has
          </span>
          <span data-hero-line className="block opacity-0">
            a missing{" "}
            <span
              data-hero-pixel
              className="relative inline-block size-[0.8em] overflow-hidden rounded-[0.1em] bg-(--mpx-ink) align-[-0.1em] [clip-path:inset(50%)] motion-reduce:[clip-path:none]"
            >
              <Image
                quality={95}
                src={reelPixel}
                alt=""
                loading="eager"
                fetchPriority="high"
                sizes="8vw"
                className="h-full w-full object-cover"
              />
            </span>{" "}
            pixel.
          </span>
          <span data-hero-line className="block opacity-0">
            We find it.
          </span>
        </h1>

        <div className="flex w-[37%] flex-col gap-8 max-lg:w-[60%] max-md:w-full">
          <LineReveal
            delay={INTRO_DELAY + 0.75}
            className="text-28 leading-[1.5] text-(color:--mpx-white)/80"
          >
            The Missing Pixel is a brand and digital studio in Delhi, London,
            Dubai and New York. We obsess over the small thing that makes the
            big thing work.
          </LineReveal>
          <FadeUp delay={INTRO_DELAY + 0.75} className="flex flex-wrap gap-3 max-lg:grid max-lg:w-fit max-lg:gap-4">
            <PixelButton label="See The Work" href={ROUTES.work} tone="media" icon />
            <PixelButton label="Start A Project" href={ROUTES.contact} tone="media" variant="outline" />
          </FadeUp>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex h-screen items-end justify-end px-[5vw] py-[4vh] max-lg:px-[6vw] max-md:px-[7vw] max-md:py-[3vh]">
        <FadeUp delay={INTRO_DELAY + 1.2} className="pointer-events-auto">
          <a
            href="#brands"
            onClick={handleScrollCue}
            className="font-mpx-head flex items-center gap-3 text-14 font-medium uppercase tracking-[0.18em] text-(color:--mpx-white)/60 transition-colors duration-300 hover:text-(color:--mpx-white)"
          >
            Scroll to explore
            <svg
              viewBox="0 0 12 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              focusable="false"
              className="mpx-scroll-cue-arrow h-[2vh] w-auto shrink-0"
            >
              <path d="M6 1v15M1.5 11.5 6 16l4.5-4.5" />
            </svg>
          </a>
        </FadeUp>
      </div>
    </section>
  );
};

export default Hero;
