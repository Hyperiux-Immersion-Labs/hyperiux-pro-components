// Built using Hyperiux Vault: https://vault.hyperiux.com

import { FadeUp, MaskReveal } from "../Animations/gsapAnim";
import PixelButton from "../Buttons/PixelButton";
import UnderlineLink from "../Buttons/UnderlineLink";
import PixelField from "./PixelField";
import { ROUTES } from "../../routes";

const FooterCta = () => (
  <section aria-label="Start a project" className="mpx-container mpx-section flex flex-col gap-[6vw] max-lg:gap-[8vw]">
    <div className="flex flex-col gap-11 max-lg:gap-10 max-md:gap-8">
      <MaskReveal as="h2" className="w-[40%] leading-none max-lg:w-[70%] max-md:w-full">
        Got a missing pixel? Let’s find it.
      </MaskReveal>
      <FadeUp className="flex flex-wrap items-center justify-between gap-6 max-md:flex-col max-md:items-start">
        <UnderlineLink href="mailto:hello@themissingpixel.studio" className="font-mpx-head text-30">
          hello@themissingpixel.studio
        </UnderlineLink>
        <PixelButton label="Start A Project" href={ROUTES.contact} icon />
      </FadeUp>
    </div>
    <PixelField />
  </section>
);

export default FooterCta;
