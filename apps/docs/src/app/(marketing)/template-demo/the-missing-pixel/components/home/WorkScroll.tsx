// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MaskReveal } from "../Animations/gsapAnim";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import { ArrowUpRight } from "../Buttons/icons";
import cloudline from "../../assets/w-cloudline.webp";
import kickflip from "../../assets/w-kickflip.webp";
import northway from "../../assets/w-northway.webp";
import drift from "../../assets/w-drift.webp";
import { ROUTES } from "../../routes";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CARD_WIDTH = "w-[24vw] max-lg:w-[45vw] max-md:w-[78vw]";

const WorkCard = ({ project }: { project: Project }) => {
  const zoomRef = useRef<HTMLDivElement | null>(null);

  const hover = (active: boolean) => {
    gsap.to(zoomRef.current, {
      scale: active ? 1.06 : 1,
      duration: prefersReducedMotion() ? 0 : 1.2,
      ease: "power3.out",
    });
  };

  return (
    <Link
      href={ROUTES.caseStudy}
      data-cursor="View case"
      onMouseEnter={() => hover(true)}
      onMouseLeave={() => hover(false)}
      onFocus={() => hover(true)}
      onBlur={() => hover(false)}
      className={`flex shrink-0 snap-start flex-col gap-7 h-[60vh] max-lg:gap-4 ${CARD_WIDTH}`}
    >
      <div className="h-[80%] w-full shrink-0 overflow-hidden rounded-2xl bg-mpx-surface">
        <div data-work-scale className="h-full w-full will-change-transform">
          <div ref={zoomRef} className="h-full w-full">
            <Image
              src={project.image}
              alt={project.alt}
              sizes="(max-width: 768px) 78vw, (max-width: 1025px) 45vw, 25vw"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-28 tracking-tight">{project.title}</h3>
        <p className="text-22 w-[90%] leading-[1.2]">{project.text}</p>
        <span className="text-14 text-mpx-muted">{project.meta}</span>
      </div>
    </Link>
  );
};

const WorkScroll = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLSpanElement | null>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      const bar = barRef.current;
      if (!section || !track || !bar || prefersReducedMotion()) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1026px)", () => {
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
        const setHeight = () => {
          section.style.height = `${window.innerHeight + distance()}px`;
        };
        setHeight();
        ScrollTrigger.addEventListener("refreshInit", setHeight);

        const scrollTrigger = {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          invalidateOnRefresh: true,
        };

        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            ...scrollTrigger,
            scrub: 0.6,
            onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
          },
        });

        gsap.fromTo(
          track.querySelectorAll("[data-work-scale]"),
          { scale: 1.25 },
          { scale: 1, ease: "none", scrollTrigger: { ...scrollTrigger, scrub: true } },
        );

        return () => {
          ScrollTrigger.removeEventListener("refreshInit", setHeight);
          section.style.removeProperty("height");
        };
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="work" aria-label="Selected work" className="relative">
      <div className="sticky top-0 flex h-screen flex-col justify-between  overflow-hidden pt-[5vw] max-lg:relative max-lg:h-auto max-lg:gap-10 max-lg:py-[11vw] max-md:gap-8 max-md:py-[20vw]">
        <div className="mpx-container flex items-end justify-between gap-7 max-lg:flex-col max-lg:items-start max-lg:gap-6">
          <MaskReveal as="h2" className="w-[40%]">
            Work we’d put
            
            on the fridge
          </MaskReveal>
          <p className="w-[28%] text-22 text-mpx-muted max-lg:w-[70%] max-md:w-full">
            Keep scrolling. The work moves sideways, which is how good ideas tend to arrive.
          </p>
        </div>

        <div className="max-lg:snap-x max-lg:snap-mandatory max-lg:overflow-x-auto max-lg:py-2">
          <div
            ref={trackRef}
            className="flex w-max gap-15 px-[2.5vw] will-change-transform max-lg:gap-6 max-lg:px-[4vw] max-md:gap-4 max-md:px-[5vw]"
          >
            {PROJECTS.map((project) => (
              <WorkCard key={project.title} project={project} />
            ))}
            <Link
              href={ROUTES.work}
              className={`group font-mpx-head flex shrink-0 snap-start flex-col items-start justify-center gap-4 rounded-2xl bg-[#0a0a0a] p-[1.7vw] text-30 font-medium text-[#fafafa] max-lg:p-[4vw] max-md:p-[7vw] ${CARD_WIDTH}`}
            >
              <span>All Eight Projects</span>
              <ArrowUpRight className="size-[1.8vw] transition-transform duration-500 group-hover:rotate-45 max-lg:size-[4vw] max-md:size-[9vw]" />
            </Link>
          </div>
        </div>

        <div className="mpx-container max-lg:hidden pb-3">
          <div className="h-0.5 w-full overflow-hidden rounded-full bg-black/10">
            <span ref={barRef} className="block h-full w-full origin-left bg-[#0a0a0a] [transform:scaleX(0)]" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkScroll;

type Project = {
  title: string;
  text: string;
  meta: string;
  image: StaticImageData;
  alt: string;
};

const PROJECTS: Project[] = [
  {
    title: "Cloudline",
    text: "Haircare that sells a feeling, not a formula.",
    meta: "Identity, packaging, launch, 2026",
    image: cloudline,
    alt: "Model resting in soft pink clouds",
  },
  {
    title: "Kickflip Supply",
    text: "A skate brand that finally looks like skaters.",
    meta: "Identity, e-commerce, 2026",
    image: kickflip,
    alt: "Skater mid-trick against a concrete wall",
  },
  {
    title: "Northway Records",
    text: "A label logo that plays along with the music.",
    meta: "Motion identity, 2025",
    image: northway,
    alt: "Portrait lit by a huge orange sun",
  },
  {
    title: "Drift Campers",
    text: "Bookings doubled. The vans stayed charming.",
    meta: "Website, booking platform, 2025",
    image: drift,
    alt: "Mint camper van on a desert road",
  },
  {
    title: "Lumen Mobile",
    text: "A phone launch with actual personality.",
    meta: "Launch campaign, motion, 2025",
    image: cloudline,
    alt: "Model resting in soft pink clouds",
  },
  {
    title: "Bloom Hours",
    text: "Fragrance photographed like a memory.",
    meta: "Campaign, art direction, 2024",
    image: kickflip,
    alt: "Skater mid-trick against a concrete wall",
  },
];
