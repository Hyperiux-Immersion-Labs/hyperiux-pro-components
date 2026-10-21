// Built using Hyperiux Vault: https://vault.hyperiux.com

import type { ReactNode } from "react";
import { FadeUp, MaskReveal, PAGE_DELAY } from "../Animations/gsapAnim";
import Breadcrumb, { type Crumb } from "./Breadcrumb";

type PageHeroProps = {
  crumbs: Crumb[];
  title: ReactNode;
  text?: ReactNode;
  children?: ReactNode;
  titleClassName?: string;
};

const PageHero = ({ crumbs, title, text, children, titleClassName = "w-[60%] max-lg:w-full" }: PageHeroProps) => (
  <section className="mpx-container flex flex-col gap-11 py-[3vw] max-lg:gap-8 max-lg:py-[6vw] max-md:gap-9 max-md:py-[10vw]">
    <div aria-hidden className="h-[12vh] max-lg:h-[8vh] max-md:h-[9vh]" />
    <Breadcrumb crumbs={crumbs} />
    <div className="flex items-end justify-between gap-11 max-lg:flex-col max-lg:items-start max-lg:gap-8">
      <MaskReveal as="h1" delay={PAGE_DELAY} className={titleClassName}>
        {title}
      </MaskReveal>
      {(text || children) && (
        <FadeUp
          delay={PAGE_DELAY + 0.3}
          className="flex w-[32%] flex-col gap-6 max-lg:w-[70%] max-md:w-full"
        >
          {text && <p className="text-28 text-mpx-muted">{text}</p>}
          {children}
        </FadeUp>
      )}
    </div>
  </section>
);

export default PageHero;
