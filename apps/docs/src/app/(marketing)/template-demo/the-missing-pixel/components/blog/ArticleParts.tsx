// Built using Hyperiux Vault: https://vault.hyperiux.com

import type { StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { FadeUp } from "../Animations/gsapAnim";
import ParallaxImage from "../effects/parallax-image";

export const P = ({ children }: { children: ReactNode }) => (
  <FadeUp as="p" className="text-24">
    {children}
  </FadeUp>
);

export const H2 = ({ id, children }: { id: string; children: ReactNode }) => (
  <FadeUp as="h2" id={id} className="text-30 tracking-normal!">
    {children}
  </FadeUp>
);

export const H3 = ({ children }: { children: ReactNode }) => (
  <FadeUp as="h3" className="text-28">
    {children}
  </FadeUp>
);

export const Quote = ({ children }: { children: ReactNode }) => (
  <FadeUp as="blockquote" className="font-mpx-head border-l-2 border-(--mpx-accent) px-[2vw] text-30 leading-[1.2] max-lg:px-[4vw] max-md:px-[5vw]">
    {children}
  </FadeUp>
);

export const Bullets = ({ items }: { items: { lead: string; text: string }[] }) => (
  <FadeUp as="ul" className="flex flex-col gap-3">
    {items.map((item) => (
      <li key={item.lead} className="flex items-start gap-3 text-24">
        <span aria-hidden className="mt-[0.9vh] aspect-square h-[1vh] shrink-0 rounded-full bg-(--mpx-accent) max-md:mt-[1.2vh]" />
        <span>
          <strong className="font-medium">{item.lead}</strong> <span className="text-mpx-muted">{item.text}</span>
        </span>
      </li>
    ))}
  </FadeUp>
);

export const Steps = ({ items }: { items: string[] }) => (
  <FadeUp as="ol" className="flex flex-col gap-3">
    {items.map((item, index) => (
      <li key={item} className="flex items-start gap-4 text-24">
        <span className="font-mpx-head text-mpx-accent tabular-nums">{String(index + 1).padStart(2, "0")}</span>
        {item}
      </li>
    ))}
  </FadeUp>
);

export const Callout = ({ title, children }: { title: string; children: ReactNode }) => (
  <FadeUp className="flex flex-col gap-3 rounded-lg border border-(--mpx-ink)/10 bg-(--mpx-white) px-[2vw] py-[2vw] max-lg:px-[4vw] max-lg:py-[4vw] max-md:px-[5vw] max-md:py-[6vw]">
    <strong className="font-mpx-head text-28 font-medium">{title}</strong>
    <p className="text-24 text-(color:--mpx-ink)">{children}</p>
  </FadeUp>
);

export const Figure = ({ image, alt, caption }: { image: StaticImageData; alt: string; caption: string }) => (
  <FadeUp as="figure" className="flex flex-col gap-3">
    <ParallaxImage pixel image={image} alt={alt} sizes="(max-width: 1025px) 90vw, 60vw" className="aspect-[4/3] rounded-lg" />
    <figcaption className="text-14 text-mpx-muted">{caption}</figcaption>
  </FadeUp>
);
