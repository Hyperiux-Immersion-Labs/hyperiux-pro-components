// Built using Hyperiux Vault: https://vault.hyperiux.com

import { LineReveal, MaskReveal, PAGE_DELAY } from "../Animations/gsapAnim";
import Breadcrumb from "../shared/Breadcrumb";
import { ROUTES } from "../../routes";

const WorkHero = () => (
  <section className="mpx-container flex flex-col justify-center gap-11 py-[3vw] max-lg:gap-8 max-lg:py-[6vw] max-md:gap-9 h-[83vh] max-md:h-[60vh] max-md:py-[10vw]">
    
    <Breadcrumb crumbs={[{ label: "Home", href: ROUTES.home }, { label: "Work" }]} />
    <div className="flex flex-col gap-8">
      <MaskReveal as="h1" delay={PAGE_DELAY} className="w-full">
        Proof,
        <br />
        not promises.
      </MaskReveal>
      <LineReveal delay={PAGE_DELAY + 0.3} className="w-[48%] self-end max-lg:w-[70%] max-lg:self-start max-md:w-full text-28 text-mpx-muted">
          Eight projects, one obsession. Open any of them for the full story, including the bits that went sideways.
        </LineReveal>
    </div>
  </section>
);

export default WorkHero;
