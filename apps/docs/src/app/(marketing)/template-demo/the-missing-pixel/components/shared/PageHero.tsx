// Built using Hyperiux Vault: https://vault.hyperiux.com

import type { ReactNode } from "react";
import {
  FadeUp,
  MaskReveal,
  PAGE_DELAY,
  LineReveal,
} from "../Animations/gsapAnim";
import Breadcrumb, { type Crumb } from "./Breadcrumb";

type PageHeroProps = {
  crumbs: Crumb[];
  title: ReactNode;
  text?: ReactNode;
  children?: ReactNode;
  titleClassName?: string;
  textClassName?: string;
  containerClassName?: string;
};

const PageHero = ({
  crumbs,
  title,
  text,
  children,
  titleClassName = "w-full",
  textClassName = "w-[48%]",
  containerClassName = "",
}: PageHeroProps) => (
  <section
    className={`${containerClassName} flex h-[83vh]  px-[5vw] max-md:px-[7vw] max-lg:px-[6vw] flex-col justify-center gap-11 py-[3vw] max-lg:gap-8 max-lg:py-[10vh] max-lg:h-auto max-md:min-h-[60vh] max-md:gap-9 max-md:py-[10vw]`}
  >
    <Breadcrumb crumbs={crumbs} />
    <div className="flex flex-col gap-8">
      <MaskReveal as="h1" delay={PAGE_DELAY} className={titleClassName}>
        {title}
      </MaskReveal>
      {(text || children) && (
        <div
          className={`flex flex-col gap-6 self-end max-lg:w-[70%] max-lg:self-start max-md:w-full ${textClassName}`}
        >
          {text && (
            <LineReveal
              delay={PAGE_DELAY + 0.3}
              className="text-28 text-mpx-muted"
            >
              {text}
            </LineReveal>
          )}
          {children && <FadeUp delay={PAGE_DELAY + 0.3}>{children}</FadeUp>}
        </div>
      )}
    </div>
  </section>
);

export default PageHero;
