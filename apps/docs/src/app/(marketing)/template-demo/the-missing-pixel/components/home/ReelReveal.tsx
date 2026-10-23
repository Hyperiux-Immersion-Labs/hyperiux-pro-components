// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import AutoVideo from "./AutoVideo";
import PixelButton from "../Buttons/PixelButton";
import { ROUTES } from "../../routes";
import reelPoster from "../../assets/pictures/reel-poster.webp";

const heroReelVideo = new URL("../../assets/video/hero-reel.mp4", import.meta.url).toString();

gsap.registerPlugin(useGSAP, ScrollTrigger);

const clamp = gsap.utils.clamp(0, 1);

const ReelReveal = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const circleRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const shadeRef = useRef<HTMLDivElement | null>(null);
  const captionRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const stage = stageRef.current;
      const circle = circleRef.current;
      const media = mediaRef.current;
      const shade = shadeRef.current;
      const caption = captionRef.current;
      if (!section || !stage || !circle || !media || !shade || !caption) return;

      const reduced = prefersReducedMotion();
      let top = 0;
      let vw = 0;
      let vh = 0;
      let r0 = 0;
      let pinY = 0;
      let rEnd = 0;

      const measure = () => {
        top = section.getBoundingClientRect().top + window.scrollY;
        vw = stage.clientWidth;
        vh = stage.clientHeight || window.innerHeight;
        r0 = Math.min(vh / 2, vw * 0.45);
        pinY = vh + r0 * 0.22;
        rEnd = Math.hypot(vw / 2, pinY) + 2;
        gsap.set(media, { width: vw, height: vh });
        gsap.set(circle, reduced ? { width: vw, height: vh } : { width: rEnd * 2, height: rEnd * 2 });
      };

      const render = () => {
        const y = window.scrollY;
        const s1 = top + r0 - pinY;
        let cy = r0;
        let radius = r0;
        if (y >= s1) {
          cy = pinY - Math.max(0, top - y);
          radius = Math.min(rEnd, r0 + (y - s1));
        }
        const grow = clamp((radius - r0) / (rEnd - r0));
        const scale = radius / rEnd;
        const dy = cy - vh / 2;
        const zoom = 1.12 - 0.12 * grow;
        const progress = clamp((y - (s1 + rEnd - r0)) / (vh * 0.35));
        const reveal = clamp((progress - 0.75) * 4);

        gsap.set(circle, { y: dy, scale });
        gsap.set(media, { y: -dy / scale, scale: zoom / scale });
        gsap.set(shade, { opacity: progress });
        gsap.set(caption, { autoAlpha: reveal, y: (1 - reveal) * 20 });
      };

      measure();

      if (reduced) {
        gsap.set(caption, { autoAlpha: 1, y: 0 });
        gsap.set(shade, { opacity: 1 });
        return;
      }

      render();

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        invalidateOnRefresh: true,
        onRefresh: () => {
          measure();
          render();
        },
        onUpdate: render,
      });

      return () => trigger.kill();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Studio showreel"
      className="relative h-[210vh] max-md:h-[190vh] motion-reduce:h-auto"
    >
      <div
        ref={stageRef}
        className="sticky top-0 h-screen overflow-hidden motion-reduce:relative motion-reduce:h-[78vh]"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            ref={circleRef}
            className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-(--mpx-ink) will-change-transform motion-reduce:rounded-3xl"
          >
            <div ref={mediaRef} className="relative shrink-0 will-change-transform">
              <AutoVideo src={heroReelVideo} poster={reelPoster.src} label="Studio showreel" />
              <div
                ref={shadeRef}
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgb(10_10_10/0.5),transparent_45%)] opacity-0"
              />
            </div>
          </div>
        </div>

        <div
          ref={captionRef}
          className="invisible absolute inset-x-0 bottom-0 z-2 flex items-end justify-between gap-4 px-[5vw] py-[3vw] text-(color:--mpx-white) opacity-0 max-lg:flex-col max-lg:items-start max-lg:gap-10 max-lg:px-[6vw] max-lg:py-[5vw] max-md:gap-10 max-md:px-[7vw] max-md:py-[8vw]"
        >
          <p className="font-mpx-head w-[30%] text-40 leading-[1.2] tracking-tight max-lg:w-[80%] max-md:w-full">
            Twelve years of noticing what everyone else scrolled past.
          </p>
          <PixelButton label="Watch The Work" href={ROUTES.work} variant="outline" tone="media" size="sm" icon />
        </div>
      </div>
    </section>
  );
};

export default ReelReveal;
