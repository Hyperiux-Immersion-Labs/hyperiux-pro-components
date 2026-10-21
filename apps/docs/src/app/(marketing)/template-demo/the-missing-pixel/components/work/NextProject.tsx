// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { FadeUp } from "../Animations/gsapAnim";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import northway from "../../assets/w-northway.webp";
import { ROUTES } from "../../routes";

const NextProject = () => {
  const titleRef = useRef<HTMLSpanElement | null>(null);
  const zoomRef = useRef<HTMLDivElement | null>(null);

  const hover = (active: boolean) => {
    const duration = prefersReducedMotion() ? 0 : 0.8;
    gsap.to(titleRef.current, { x: active ? "1.4vw" : 0, duration, ease: "power3.out" });
    gsap.to(zoomRef.current, { scale: active ? 1.06 : 1, duration: duration * 1.4, ease: "power3.out" });
  };

  return (
    <FadeUp>
      <Link
        href={ROUTES.caseStudy}
        data-cursor="Next project"
        onMouseEnter={() => hover(true)}
        onMouseLeave={() => hover(false)}
        onFocus={() => hover(true)}
        onBlur={() => hover(false)}
        className="flex items-center justify-between gap-9 border-t border-black/10 py-[4vw] max-lg:flex-col max-lg:items-start max-lg:gap-6 max-lg:py-[7vw] max-md:py-[10vw]"
      >
        <span className="flex flex-col gap-4">
          <span className="text-28 text-mpx-muted">Next project</span>
          <span ref={titleRef} className="font-mpx-head text-128 font-medium leading-none">
            {next.title}
          </span>
        </span>
        <span className="aspect-[4/3] w-[28%] overflow-hidden rounded-2xl bg-mpx-surface max-lg:w-[60%] max-md:w-full">
          <span ref={zoomRef} className="block h-full w-full">
            <Image src={next.image} alt={next.alt} sizes="28vw" className="h-full w-full object-cover" />
          </span>
        </span>
      </Link>
    </FadeUp>
  );
};

export default NextProject;

const next = {
  title: "Northway Records",
  image: northway,
  alt: "Portrait lit by a huge orange sun",
};
