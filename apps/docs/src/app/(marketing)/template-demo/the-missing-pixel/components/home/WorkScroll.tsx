// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MaskReveal } from "../Animations/gsapAnim";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import { ArrowUpRight } from "../Buttons/icons";
import UnderlineLink from "../Buttons/UnderlineLink";
import PixelReveal, { type PixelRevealHandle } from "../effects/pixel-reveal";
import cloudline from "../../assets/w-cloudline.webp";
import kickflip from "../../assets/w-kickflip.webp";
import northway from "../../assets/w-northway.webp";
import drift from "../../assets/w-drift.webp";
import { ROUTES } from "../../routes";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CARD_WIDTH = "w-[30vw] max-lg:w-[45vw] max-md:w-[78vw]";

const DESKTOP_QUERY = "(min-width: 1026px)";

type WorkCardProps = {
  project: Project;
  revealRef: (handle: PixelRevealHandle | null) => void;
  autoScrub: boolean;
};

const WorkCard = ({ project, revealRef, autoScrub }: WorkCardProps) => {
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
      className={`flex shrink-0 snap-start flex-col gap-[1.5vw] max-lg:gap-[2.5vw] max-md:gap-[4vw] ${CARD_WIDTH}`}
    >
      <PixelReveal
        ref={revealRef}
        autoScrub={autoScrub}
        gridSize={28}
        edgeHeight={0.4}
        direction="up"
        className="h-[24vw] w-full shrink-0 rounded-[1.8vw] max-lg:h-[36vw] max-lg:rounded-[2.5vw] max-md:h-[62vw] max-md:rounded-[4vw]"
      >
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
      </PixelReveal>
      <div className="flex flex-col gap-[0.8vw] max-lg:gap-[1.4vw] max-md:gap-[2vw]">
        <h3 className="text-[2vw] leading-[1.15] tracking-tight max-lg:text-[3.4vw] max-md:text-[6vw]">{project.title}</h3>
        <p className="text-[1.2vw] leading-[1.5] text-mpx-muted max-lg:text-[2.2vw] max-md:text-[4vw]">{project.text}</p>
        <span className="text-[1vw] text-mpx-muted max-lg:text-[1.9vw] max-md:text-[3.4vw]">{project.meta}</span>
      </div>
    </Link>
  );
};

const WorkScroll = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLSpanElement | null>(null);
  const revealsRef = useRef<(PixelRevealHandle | null)[]>([]);
  const [desktop, setDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches,
  );

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const sync = () => setDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      const bar = barRef.current;
      if (!section || !track || !bar) return;

      if (prefersReducedMotion()) {
        revealsRef.current.forEach((handle) => handle?.setProgress(1));
        return;
      }

      const mm = gsap.matchMedia();

      mm.add(DESKTOP_QUERY, () => {
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
        const setHeight = () => {
          section.style.height = `${window.innerHeight + distance()}px`;
        };
        setHeight();
        ScrollTrigger.addEventListener("refreshInit", setHeight);

        let entry = 0;
        const played = new Set<number>();
        const updateReveals = () => {
          const width = window.innerWidth;
          revealsRef.current.forEach((handle, index) => {
            const element = handle?.element;
            if (!handle || !element || played.has(index)) return;
            const entered = element.getBoundingClientRect().left < width * 0.9;
            if (entered && entry >= 0.5) {
              played.add(index);
              handle.play();
            }
          });
        };

        const entryTrigger = ScrollTrigger.create({
          trigger: section,
          start: "top 85%",
          end: "top 15%",
          scrub: true,
          onUpdate: (self) => {
            entry = self.progress;
            updateReveals();
          },
        });
        updateReveals();

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
            onUpdate: (self) => {
              gsap.set(bar, { scaleX: self.progress });
              updateReveals();
            },
          },
        });

        gsap.fromTo(
          track.querySelectorAll("[data-work-scale]"),
          { scale: 1.25 },
          { scale: 1, ease: "none", scrollTrigger: { ...scrollTrigger, scrub: true } },
        );

        return () => {
          entryTrigger.kill();
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
      <div className="sticky top-0 flex h-screen flex-col justify-center gap-[3.6vw] overflow-hidden max-lg:relative max-lg:h-auto max-lg:gap-10 max-lg:py-[11vw] max-md:gap-8 max-md:py-[20vw]">
        <div className="grid grid-cols-[1fr_31%] items-end gap-x-[2vw] gap-y-[1vw] px-[5vw] max-lg:grid-cols-1 max-lg:gap-y-4 max-lg:px-[4vw] max-md:px-[5vw]">
          <MaskReveal
            as="h2"
            className="[.mpx-page_&]:text-[2.9vw] [.mpx-page_&]:tracking-[-0.1vw] max-lg:[.mpx-page_&]:text-[5vw] max-md:[.mpx-page_&]:text-[8vw]"
          >
            Work we’d put on the fridge
          </MaskReveal>
          <p className="w-[83%] text-[1vw] leading-[1.55] text-mpx-muted max-lg:w-[70%] max-lg:text-[2vw] max-md:w-full max-md:text-[3.6vw]">
            Keep scrolling. The work moves sideways, which is how good ideas tend to arrive.
          </p>
          <UnderlineLink
            href={ROUTES.work}
            className="font-mpx-head text-[1vw] font-medium text-mpx-ink max-lg:text-[2vw] max-md:text-[3.6vw]"
          >
            All eight projects
          </UnderlineLink>
        </div>

        <div className="max-lg:snap-x max-lg:snap-mandatory max-lg:overflow-x-auto max-lg:py-2">
          <div
            ref={trackRef}
            className="flex w-max gap-[3.2vw] px-[5vw] will-change-transform max-lg:gap-6 max-lg:px-[4vw] max-md:gap-4 max-md:px-[5vw]"
          >
            {PROJECTS.map((project, index) => (
              <WorkCard
                key={project.title}
                project={project}
                autoScrub={!desktop}
                revealRef={(handle) => {
                  revealsRef.current[index] = handle;
                }}
              />
            ))}
            <Link
              href={ROUTES.work}
              className={`group font-mpx-head flex shrink-0 snap-start flex-col items-start justify-center gap-4 self-start rounded-[1.8vw] bg-[#0a0a0a] p-[1.7vw] h-[24vw] max-lg:h-[36vw] max-md:h-[62vw] text-30 font-medium text-[#fafafa] max-lg:p-[4vw] max-md:p-[7vw] ${CARD_WIDTH}`}
            >
              <span>All Eight Projects</span>
              <ArrowUpRight className="size-[1.8vw] transition-transform duration-500 group-hover:rotate-45 max-lg:size-[4vw] max-md:size-[9vw]" />
            </Link>
          </div>
        </div>

        <div className="px-[5vw] max-lg:hidden">
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
