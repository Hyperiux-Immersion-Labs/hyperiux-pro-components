// Built using Hyperiux Vault: https://vault.hyperiux.com

import InteractiveListPreview from "../effects/interactive-list-preview";
import { FadeUp, MaskReveal } from "../Animations/gsapAnim";
import PixelButton from "../Buttons/PixelButton";
import cloudline from "../../assets/w-cloudline.webp";
import kickflip from "../../assets/w-kickflip.webp";
import northway from "../../assets/w-northway.webp";
import drift from "../../assets/w-drift.webp";
import { ROUTES } from "../../routes";

const Services = () => (
  <section
    id="services"
    className="mpx-container mpx-section flex flex-col gap-14 max-md:gap-11"
  >
    <div className="flex flex-col gap-6 max-lg:gap-5">
      <MaskReveal as="h2">What we’re good at</MaskReveal>
      <FadeUp className="flex w-[42%] flex-col items-start gap-6 max-lg:w-[70%] max-md:w-full">
        <p className="text-28 text-mpx-muted">
          Six disciplines, one team, no hand-offs. Strategy, design and code share a table, so nothing gets lost in translation.
        </p>
        <PixelButton label="All Services" href={ROUTES.services} variant="outline" size="sm" />
      </FadeUp>
    </div>
    <FadeUp>
      <InteractiveListPreview items={SERVICES} />
    </FadeUp>
  </section>
);

export default Services;

const SERVICES = [
  {
    title: "Brand strategy",
    text: "Positioning, naming and messaging that make your whole company sound like one person.",
    image: cloudline,
    href: ROUTES.service,
  },
  {
    title: "Brand identity",
    text: "Logos, type and systems that look just as sharp on a billboard as on a favicon.",
    image: kickflip,
    href: ROUTES.service,
  },
  {
    title: "Websites and products",
    text: "Fast, accessible sites and products, designed and engineered under one roof.",
    image: northway,
    href: ROUTES.service,
  },
  {
    title: "Motion and 3D",
    text: "Identities that move, launch films and product visuals people actually replay.",
    image: drift,
    href: ROUTES.service,
  },
  {
    title: "Packaging",
    text: "Packs that win the shelf, then earn a second life on someone’s bookcase.",
    image: cloudline,
    href: ROUTES.service,
  },
  {
    title: "Content and campaigns",
    text: "Launches and social systems with something to say, and the nerve to say it.",
    image: kickflip,
    href: ROUTES.service,
  },
];