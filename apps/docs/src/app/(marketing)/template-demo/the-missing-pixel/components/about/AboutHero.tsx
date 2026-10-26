// Built using Hyperiux Vault: https://vault.hyperiux.com

import { ROUTES } from "../../routes";
import { LineReveal, MaskReveal, PAGE_DELAY } from "../Animations/gsapAnim";
import ParallaxImage from "../effects/parallax-image";
import Breadcrumb from "../shared/Breadcrumb";
import founder from "../../assets/pictures/founder.webp";
import studio1 from "../../assets/pictures/studio-1.webp";
import studio2 from "../../assets/pictures/studio-2.webp";

const AboutHero = () => (
  <>
    <section className="px-[5vw] max-lg:px-[6vw] max-md:px-[7vw] flex h-screen flex-col gap-11 py-[7%] max-lg:h-auto max-lg:min-h-screen max-lg:gap-8 max-lg:py-[12%] max-md:gap-9 max-md:py-[15%]">
     
      <Breadcrumb crumbs={[{ label: "Home", href: ROUTES.home }, { label: "About" }]} />
      <div className="grid flex-1 grid-cols-12 content-end items-end gap-x-12 gap-y-10 max-md:gap-y-8 max-lg:gap-x-8 max-md:gap-x-0">
        <MaskReveal as="h1" delay={PAGE_DELAY} className="col-span-8 max-lg:col-span-12 w-[70%] text-[5vw]! max-lg:w-[85%] max-lg:text-[7vw]! max-md:text-[8vw]! max-md:w-full tracking-wider">
          We noticed one <span className="text-mpx-accent">missing pixel.</span> Twelve years later, we’re still looking.
        </MaskReveal>
        <ParallaxImage
          pixel
          image={founder}
          alt="Naina Sethi, founder of The Missing Pixel"
          sizes="(max-width: 768px) 90vw, (max-width: 1025px) 56vw, 31vw"
          priority
          className="col-span-4 col-start-9 row-span-2 aspect-[4/5] self-start rounded-lg max-lg:col-span-12 max-lg:col-start-1 max-lg:row-auto max-lg:w-[56%] max-md:w-auto max-md:max-w-full"
        />
        <LineReveal delay={PAGE_DELAY + 0.3} className="col-span-6 max-lg:col-span-12 text-28 leading-[1.3] w-[90%] max-lg:w-[75%] max-md:w-full">
            Founded in Delhi in 2014 on one hunch: small, senior teams make braver work than big agencies. Four cities and sixty people later, it still holds.
          </LineReveal>
      </div>
    </section>

    <div className="px-[5vw] max-lg:px-[6vw] max-md:px-[7vw] py-[7%] max-lg:py-[12%] max-md:py-[15%]">
      <div className="grid grid-cols-[7fr_5fr] gap-12 max-lg:gap-8 max-lg:grid-cols-1 max-md:gap-5">
        <ParallaxImage
          pixel
          image={studio1}
          alt="A design review in the London studio"
          className="aspect-[16/11] rounded-lg"
          sizes="(max-width: 768px) 90vw, 56vw"
        />
        <ParallaxImage
          pixel
          image={studio2}
          alt="Three colleagues by the window in the Dubai studio"
          className="rounded-lg max-lg:aspect-[16/11]"
          sizes="(max-width: 768px) 90vw, 40vw"
        />
      </div>
    </div>
  </>
);

export default AboutHero;
