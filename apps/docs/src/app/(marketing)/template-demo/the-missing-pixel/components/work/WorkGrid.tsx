// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { FadeUp } from "../Animations/gsapAnim";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import { useTilt } from "../Animations/useTilt";
import FilterBar from "../shared/FilterBar";
import ParallaxImage from "../effects/parallax-image";
import { workPath } from "../../routes";
import { PROJECTS, type Project } from "./projects";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "branding", label: "Branding" },
  { value: "web", label: "Web" },
  { value: "motion", label: "Motion" },
  { value: "packaging", label: "Packaging" },
];

export const WorkListCard = ({ project, offset }: { project: Project; offset: boolean }) => {
  const cardRef = useRef<HTMLAnchorElement | null>(null);
  const zoomRef = useRef<HTMLDivElement | null>(null);
  const tintRef = useRef<HTMLDivElement | null>(null);
  useTilt(cardRef);

  const hover = (active: boolean) => {
    const duration = prefersReducedMotion() ? 0 : 1;
    gsap.to(zoomRef.current, { scale: active ? 1.06 : 1, duration: duration * 1.2, ease: "power3.out" });
    gsap.to(tintRef.current, { opacity: active ? 0.1 : 0, duration: duration * 0.6, ease: "power3.out" });
  };

  return (
    <Link
      ref={cardRef}
      href={workPath(project.title)}
      data-cursor="View case"
      onMouseEnter={() => hover(true)}
      onMouseLeave={() => hover(false)}
      onFocus={() => hover(true)}
      onBlur={() => hover(false)}
      className={`flex flex-col gap-5 max-lg:gap-4 ${offset ? "translate-y-[7vw] max-lg:translate-y-0" : ""}`}
    >
      <FadeUp className="relative isolate overflow-hidden rounded-lg">
        <div ref={zoomRef} className="h-full w-full">
          <ParallaxImage
            pixel
            image={project.image}
            alt={project.alt}
            sizes="(max-width: 768px) 90vw, 45vw"
            className="aspect-[4/3]"
          />
        </div>
        <div
          ref={tintRef}
          aria-hidden
          className="pointer-events-none  absolute inset-0 bg-(--mpx-accent) opacity-0 mix-blend-multiply"
        />
      </FadeUp>
      <FadeUp className="flex justify-between gap-4 max-md:px-2">
        <div className="flex flex-col gap-1">
          <h3 className="text-30 tracking-tight">{project.title}</h3>
          <p className="text-14 max-md:text-[3.8vw]! text-mpx-muted">{project.meta}</p>
        </div>
        <span className="text-14 max-md:text-[3.8vw]! text-mpx-muted">{project.year}</span>
      </FadeUp>
    </Link>
  );
};

const WorkGrid = () => {
  const [filter, setFilter] = useState("all");
  const visible = PROJECTS.filter((project) => filter === "all" || project.cats.includes(filter));

  const options = FILTERS.map((option) => ({
    ...option,
    count:
      option.value === "all"
        ? PROJECTS.length
        : PROJECTS.filter((project) => project.cats.includes(option.value)).length,
  }));

  return (
    <div className="flex flex-col gap-14 pb-[12%] max-lg:gap-11">
      <FilterBar
        label="Filter projects by discipline"
        options={options}
        value={filter}
        onChange={setFilter}
        countText={`${visible.length} ${visible.length === 1 ? "project" : "projects"}`}
      />
      <div key={filter} className="grid grid-cols-2 gap-x-9 gap-y-14 py-[3vw] max-lg:gap-x-6 max-lg:py-0 max-md:grid-cols-1 max-md:gap-y-12">
        {visible.map((project, index) => (
          <WorkListCard key={project.title} project={project} offset={index % 2 === 1} />
        ))}
      </div>
    </div>
  );
};

export default WorkGrid;
