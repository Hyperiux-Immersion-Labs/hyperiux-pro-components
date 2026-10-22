// Built using Hyperiux Vault: https://vault.hyperiux.com

import { LineReveal, MaskReveal, PAGE_DELAY } from "../Animations/gsapAnim";
import Breadcrumb from "../shared/Breadcrumb";
import { ROUTES } from "../../routes";

const BlogHero = () => (
  <section className="flex flex-col  h-[70vh] max-md:h-fit  gap-11 px-[5vw] pb-[3vw] pt-[7%] max-lg:gap-8 max-lg:px-[6vw] max-lg:py-[12%] max-md:gap-9 max-md:px-[7vw] max-md:py-[15%]">
    <Breadcrumb crumbs={[{ label: "Home", href: ROUTES.home }, { label: "Journal" }]} />
    <div className="flex flex-col items-start justify-between gap-11 max-lg:flex-col max-lg:items-start max-lg:gap-8">
      <MaskReveal as="h1" delay={PAGE_DELAY} className="w-[60%] max-lg:w-full">
        Journal
      </MaskReveal>
      <LineReveal
        delay={PAGE_DELAY + 0.3}
        className="w-[32%] ml-auto text-24 leading-[1.3] text-mpx-muted max-lg:w-[70%] max-md:w-full"
      >
        Opinions, process and the occasional confession from four studios. New essay every other Thursday.
      </LineReveal>
    </div>
  </section>
);

export default BlogHero;
