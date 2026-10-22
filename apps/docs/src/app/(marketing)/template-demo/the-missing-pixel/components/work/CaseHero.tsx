// Built using Hyperiux Vault: https://vault.hyperiux.com

import { LineReveal, MaskReveal, PAGE_DELAY } from "../Animations/gsapAnim";
import Breadcrumb, { type Crumb } from "../shared/Breadcrumb";
import Facts from "../shared/Facts";

type CaseHeroProps = {
  crumbs: Crumb[];
  title: string;
  text: string;
  facts: { label: string; value: string }[];
};

const CaseHero = ({ crumbs, title, text, facts }: CaseHeroProps) => (
  <section className="h-screen px-[5vw] max-lg:px-[6vw] max-md:px-[7vw] flex flex-col justify-center gap-3 pt-[7%] pb-[3vw] max-lg:gap-8 max-lg:py-[6vw] max-md:gap-9 max-md:py-[10vw]">
    <Breadcrumb crumbs={crumbs} />
    <div className="flex flex-1 flex-col gap-8 justify-center">
      <MaskReveal as="h1" delay={PAGE_DELAY} className="w-full">
        {title}
      </MaskReveal>
      <LineReveal
        delay={PAGE_DELAY + 0.3}
        className="w-[48%] self-end text-28 leading-[1.3] text-mpx-muted max-lg:w-[70%] max-lg:self-start max-md:w-full"
      >
        {text}
      </LineReveal>
    </div>
    <Facts items={facts} />
  </section>
);

export default CaseHero;
