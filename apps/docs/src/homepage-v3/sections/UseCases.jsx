"use client";
import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "@/lib/motion";
import LinkButton from "@/components/WebsiteComps/LinkButton";
import MaskTextReveal from "@/components/mask-text-reveal";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const USE_CASES = [
  {
    id: 1,
    title: "Creative Front-End Developers",
    text: "Stop rebuilding the same scroll reveal, text animation, cursor trail, and transition from scratch. Start from production-ready source and shape it to your project.",
    cta: "Browse Effects",
    link: "/effects",
  },
  {
    id: 2,
    title: "Startup Founders & Product Teams",
    text: "Make your launch page feel more premium without hiring a full motion team. Use Vault to speed up build cycles, and raise perceived product quality.",
    cta: "Start with Free Effects",
    link: "/effects/free",
  },
  {
    id: 3,
    title: "Agencies & Freelancers",
    text: "Move faster on client websites while keeping the work custom. Use Vault as a starting point for high-end interaction systems, then adapt the code for each brand.",
    cta: "See Agency Licensing",
    link: "#",
  },
  {
    id: 4,
    title: "CTOs & CPOs",
    text: "Get the creative benefit of premium motion without committing to an opaque dependency. Source-first code, clear stack choices, and a workflow your developers can own.",
    cta: "Read the Docs",
    link: "/docs",
  },
  {
    id: 5,
    title: "Marketing Teams",
    text: "Upgrade the moments that affect perception: hero sections, campaign pages, product storytelling, proof sections, and final CTAs.",
    cta: "Explore Use Cases",
    link: "#",
  },
];

const USE_CASES_X_PERCENT = [120, 140, 160, 180, 200];

const mark =
  "pointer-events-none absolute size-[0.3vw] border-primary max-md:size-2 max-sm:size-1.5";

function UseCaseBox({ item }) {
  return (
    <article className="use-case-box relative w-full -mt-px border border-grey ">
      {/* TITLE */}
      <div className="relative border-b border-grey px-[2vw] py-[2.5vw] max-md:px-[4vw] max-md:py-[5vw] max-sm:px-[6vw] max-sm:py-[7vw]">
        <span className={`${mark} -top-px -left-px border-t border-l`} />
        <span className={`${mark} -top-px -right-px border-t border-r`} />
        <span className={`${mark} -bottom-px -left-px border-b border-l`} />
        <span className={`${mark} -bottom-px -right-px border-b border-r`} />

        <h3 className="text32 font-neue-haas max-md:text-[4.4vw] max-sm:text-[6.5vw]">
          {item.title}
        </h3>
      </div>

      {/* BODY */}
      <div className="flex flex-col justify-between gap-[4vw] px-[2vw] py-[2.5vw] max-md:gap-[7vw] max-md:px-[4vw] max-md:py-[5vw] max-sm:gap-[10vw] max-sm:px-[6vw] max-sm:py-[7vw]">
        <p className="t22 font-neue-haas w-[80%] leading-[1.35] max-md:text-[2.2vw] max-sm:text-[4vw]">
          {item.text}
        </p>

        <LinkButton
          href={item.link}
          text={item.cta}
          prefetch={false}
          tilted={false}
        />
      </div>
    </article>
  );
}

export default function UseCases() {
  const container = useRef(null);

  useGSAP(
    () => {
      const boxes = gsap.utils.toArray(".use-case-box");

      if (prefersReducedMotion()) {
        gsap.set(boxes, { xPercent: 0 });
        return;
      }

      boxes.forEach((box, i) => {
        gsap.fromTo(
          box,
          { xPercent: USE_CASES_X_PERCENT[i] },
          {
            xPercent: 0,
            ease: "power1.out",
            scrollTrigger: {
              trigger: box,
              start: "top 100%",
              end: "top 35%",
              scrub: true,
              markers: false,
            },
          },
        );
      });
    },
    { scope: container },
  );

  return (
    <div
      ref={container}
      className="h-fit w-full mt-[-15vw] flex justify-between self-padd items-start overflow-x-clip text-white max-md:mt-0 max-md:flex-col max-md:gap-[8vw]"
    >
      <MaskTextReveal stagger={0.08} scrub={false} duration={2} className="w-[40vw] sticky top-[20vh] max-md:static max-md:w-full">
        <h2 className="t64 font-neue-haas max-md:text-[5.5vw] max-sm:text-[7.5vw]">
          For Developers, Founders, Agencies, and Teams That Need the Site to
          Feel as Premium as the Product.
        </h2>
      </MaskTextReveal>

      <div className="h-full w-[43vw] flex flex-col max-md:w-full max-md:gap-[8vw] max-sm:gap-[10vw]">
        {/* BOXES */}
        {USE_CASES.map((item) => (
          <UseCaseBox key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
