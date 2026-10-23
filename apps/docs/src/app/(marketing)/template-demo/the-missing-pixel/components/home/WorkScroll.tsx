// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FadeUp, MaskReveal, LineReveal } from "../Animations/gsapAnim";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import { ArrowUpRight } from "../Buttons/icons";
import UnderlineLink from "../Buttons/UnderlineLink";
import PixelReveal, { type PixelRevealHandle } from "../effects/pixel-reveal";
import cloudline from "../../assets/pictures/w-cloudline.webp";
import kickflip from "../../assets/pictures/w-kickflip.webp";
import northway from "../../assets/pictures/w-northway.webp";
import drift from "../../assets/pictures/w-drift.webp";
import lumen from "../../assets/pictures/w-lumen.webp";
import bloom from "../../assets/pictures/w-bloom.webp";
import { ROUTES, workPath } from "../../routes";

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
      href={workPath(project.title)}
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
        direction="down"
        className="h-[24vw] w-full shrink-0 rounded-lg max-lg:h-[36vw] max-md:h-[62vw]"
      >
        <div data-work-scale className="h-full w-full will-change-transform">
          <div ref={zoomRef} className="h-full w-full">
            <Image
              quality={95}
              src={project.image}
              alt={project.alt}
              sizes="(max-width: 768px) 78vw, (max-width: 1025px) 45vw, 25vw"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </PixelReveal>
      <div className="flex flex-col gap-[0.8vw] max-lg:gap-[1.4vw] max-md:gap-[2vw]">
        <h3 className="text-28 leading-[1.15] tracking-tight">{project.title}</h3>
        <p className="text-22 leading-[1.2] text-mpx-muted">{project.text}</p>
        <span className="text-14 text-mpx-muted">{project.meta}</span>
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
      <div className="sticky top-0 flex h-screen flex-col justify-center gap-[6vw] overflow-hidden max-lg:relative max-lg:h-auto max-lg:gap-[10vw] max-lg:py-[12%] max-md:gap-14 max-md:py-[15%]">
        <div className="grid grid-cols-[1fr_31%] items-end gap-x-[2vw] gap-y-[1vw] px-[5vw] max-lg:grid-cols-1 max-lg:gap-y-4 max-lg:px-[6vw] max-md:px-[7vw]">
          <MaskReveal
            as="h2"
          >
            Work we’d put on the fridge
          </MaskReveal>
          <LineReveal className="w-[83%] text-24 leading-[1.55] text-mpx-muted max-lg:w-[70%] ] max-md:w-full ">
            Keep scrolling. The work moves sideways, which is how good ideas tend to arrive.
          </LineReveal>
          <FadeUp>
            <UnderlineLink
              href={ROUTES.work}
              className="font-mpx-head text-24 font-medium text-mpx-ink  "
            >
              All eight projects
            </UnderlineLink>
          </FadeUp>
        </div>

        <div className="max-lg:snap-x max-lg:snap-mandatory max-lg:scroll-px-[6vw] max-md:scroll-px-[7vw] max-lg:overflow-x-auto max-lg:py-2">
          <div
            ref={trackRef}
            className="flex w-max gap-[3.2vw] px-[5vw] will-change-transform max-lg:gap-6 max-lg:px-[6vw] max-md:gap-7 max-md:px-[7vw]"
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
              className={`group font-mpx-head relative flex shrink-0 snap-start flex-col items-start justify-center gap-4 self-start overflow-hidden rounded-lg bg-mpx-ink p-[1.7vw] h-[24vw] max-lg:h-[36vw] max-md:h-[62vw] text-30 font-medium text-mpx-paper transition-colors duration-500 hover:text-mpx-ink max-lg:p-[4vw] max-md:p-[7vw] ${CARD_WIDTH}`}
            >
              <span
                aria-hidden
                className="absolute inset-0 bg-(image:--mpx-grad) opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
              <span className="relative">All Eight Projects</span>
              <ArrowUpRight className="relative size-[1.8vw] transition-transform duration-500 group-hover:rotate-45 max-lg:size-[4vw] max-md:size-[9vw]" />
            </Link>
          </div>
        </div>

        <div className="px-[5vw] max-lg:hidden">
          <div className="h-0.5 w-full overflow-hidden rounded-full bg-(--mpx-ink)/10">
            <span ref={barRef} className="block h-full w-full origin-left bg-(--mpx-ink) [transform:scaleX(0)]" />
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
    alt: "A lilac Cloudline bottle on a pastel podium",
  },
  {
    title: "Kickflip Supply",
    text: "A skate brand that finally looks like skaters.",
    meta: "Identity, e-commerce, 2026",
    image: kickflip,
    alt: "Skater holding a patterned longboard across her shoulders under a bright sky",
  },
  {
    title: "Northway Records",
    text: "A label logo that plays along with the music.",
    meta: "Motion identity, 2025",
    image: northway,
    alt: "Studio microphone lit green and gold against a red glow",
  },
  {
    title: "Drift Campers",
    text: "Bookings doubled. The vans stayed charming.",
    meta: "Website, booking platform, 2025",
    image: drift,
    alt: "Glowing bell tent under olive trees at night",
  },
  {
    title: "Lumen Mobile",
    text: "A phone launch with actual personality.",
    meta: "Launch campaign, motion, 2025",
    image: lumen,
    alt: "Hand holding a smartphone with a dark screen that glows orange at the bottom",
  },
  {
    title: "Bloom Hours",
    text: "Fragrance photographed like a memory.",
    meta: "Campaign, art direction, 2024",
    image: bloom,
    alt: "Black-and-white close-up of a glass perfume bottle with a silver cap",
  },
];
