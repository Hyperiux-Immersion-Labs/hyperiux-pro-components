// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../Animations/reducedMotion";
const FilmCanvas = dynamic(() => import("./FilmCanvas"), { ssr: false });
import PixelButton from "../Buttons/PixelButton";
import { ROUTES } from "../../routes";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const ReelReveal = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const shadeRef = useRef<HTMLDivElement | null>(null);
  const captionRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const frame = frameRef.current;
      const media = mediaRef.current;
      const shade = shadeRef.current;
      const caption = captionRef.current;
      if (!section || !frame || !media || !shade || !caption) return;

      if (prefersReducedMotion()) {
        gsap.set(caption, { autoAlpha: 1, y: 0 });
        return;
      }

      const mm = gsap.matchMedia();

      const build = (half: string, radius: number) => {
        const render = (progress: number) => {
          const p = easeOutCubic(progress);
          const q = 1 - p;
          const reveal = gsap.utils.clamp(0, 1, (p - 0.75) * 4);
          frame.style.clipPath = `inset(calc(${q.toFixed(4)} * (50% - ${half})) round ${(q * radius).toFixed(2)}vw)`;
          gsap.set(media, { scale: 1.3 - p * 0.3 });
          gsap.set(shade, { opacity: p });
          gsap.set(caption, { autoAlpha: reveal, y: (1 - reveal) * 20 });
        };

        render(0);

        const trigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${(section.offsetHeight - window.innerHeight) * 0.8}`,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => render(self.progress),
        });

        return () => trigger.kill();
      };

      mm.add("(min-width: 1026px)", () => build("15vh", 0.7));
      mm.add("(max-width: 1025px)", () => build("22vw", 1.2));

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Studio showreel"
      className="relative h-[230vh] max-lg:h-[170vh] motion-reduce:h-auto"
    >
      <div className="sticky top-0 h-screen overflow-hidden motion-reduce:relative motion-reduce:h-[78vh]">
        <div ref={frameRef} className="absolute inset-0 will-change-[clip-path]">
          <div ref={mediaRef} className="h-full w-full will-change-transform">
            <FilmCanvas sectionRef={sectionRef} label="Studio showreel" />
          </div>
          <div
            ref={shadeRef}
            className="absolute inset-0 bg-[linear-gradient(to_top,rgb(10_10_10/0.5),transparent_45%)] opacity-0 motion-reduce:opacity-100"
          />
        </div>

        <div
          ref={captionRef}
          className="px-[5vw] max-lg:px-[6vw] max-md:px-[7vw] pb-8 invisible absolute inset-x-0 bottom-[2vw] z-2 flex items-center justify-between gap-4  text-(color:--mpx-white) opacity-0 max-lg:bottom-[4vw] max-md:bottom-[6vw] max-lg:flex-col max-lg:items-start max-lg:gap-10 max-md:gap-10"
        >
          <p className="font-mpx-head w-[30%] text-40  max-lg:w-[80%] max-md:w-full  leading-[1.2] tracking-tight">
            Twelve years of noticing what everyone else scrolled past.
          </p>
          <PixelButton className="py-auto" label="Watch The Work" href={ROUTES.work} variant="outline" tone="media" size="sm" icon />
        </div>
      </div>
    </section>
  );
};

export default ReelReveal;
