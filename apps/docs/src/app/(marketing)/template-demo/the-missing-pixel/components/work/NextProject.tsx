// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { FadeUp } from "../Animations/gsapAnim";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import PixelReveal from "../effects/pixel-reveal";
import type { StaticImageData } from "next/image";

type NextProjectProps = {
  title: string;
  image: StaticImageData;
  alt: string;
  href: string;
};

const NextProject = ({ title, image, alt, href }: NextProjectProps) => {
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
        href={href}
        data-cursor="Next project"
        onMouseEnter={() => hover(true)}
        onMouseLeave={() => hover(false)}
        onFocus={() => hover(true)}
        onBlur={() => hover(false)}
        className="flex flex-col gap-9 border-t border-(--mpx-ink)/10 py-[4vw] max-lg:gap-6 max-lg:py-[7vw] max-md:py-[10vw]"
      >
        <span className="text-24 leading-[1.3] text-mpx-muted">Next project</span>
        <span className="flex items-center justify-between gap-9 max-lg:flex-col max-lg:items-start max-lg:gap-6">
          <span ref={titleRef} className="font-mpx-head text-64  leading-none">
            {title}
          </span>
          <span className="aspect-[4/3] w-[28%] overflow-hidden rounded-lg max-lg:w-[60%] max-md:w-full">
            <span ref={zoomRef} className="block h-full w-full">
              <PixelReveal gridSize={26} edgeHeight={0.4} direction="down" start="top 85%" className="h-full w-full">
                <Image quality={95} src={image} alt={alt} sizes="28vw" className="h-full w-full object-cover" />
              </PixelReveal>
            </span>
          </span>
        </span>
      </Link>
    </FadeUp>
  );
};

export default NextProject;
