// Built using Hyperiux Vault: https://vault.hyperiux.com

import { FadeUp, MaskReveal, Odometer } from "../Animations/gsapAnim";
import UnderlineLink from "../Buttons/UnderlineLink";
import { ROUTES } from "../../routes";

const FACTS = [
  { value: "180+", label: ["Brands launched so far,", "not one of them beige"] },
  { value: "93%", label: ["Clients who come back", "for the next project"] },
  { value: "41", label: ["Awards we pretend", "not to count"] },
];

const Intro = () => (
  <section id="about" className="px-[5vw] max-lg:px-[6vw] max-md:px-[7vw] py-[7%] max-lg:py-[12%] max-md:py-[15%]">
    <div className="flex flex-col gap-[6vw] rounded-lg border border-(--mpx-ink)/10 bg-(--mpx-white) p-[3.3vw] max-lg:gap-[8vw] max-lg:p-[4vw] max-md:gap-[12vw] max-md:p-[7vw]">
      <div className="flex flex-col items-start gap-5 max-md:gap-4">
       
        <MaskReveal
          as="p"
          scrub
          data-cursor-fill
          className="font-mpx-head w-[62%] text-64 font-normal leading-[1.2] tracking-tight text-mpx-muted max-lg:w-[85%] max-md:w-full"
        >
          <span className="text-mpx-ink">
            Sixty strategists, designers, writers and engineers in four cities,
          </span>{" "}
          obsessed with the one detail people remember.
        </MaskReveal>
        <FadeUp>
          <UnderlineLink href={ROUTES.about} className="font-mpx-head text-24 font-medium text-mpx-ink">
            Meet the studio
          </UnderlineLink>
        </FadeUp>
      </div>

      <ul className="grid grid-cols-3 gap-[1vw] max-lg:grid-cols-1 max-lg:gap-3 max-md:gap-5">
        {FACTS.map((fact, index) => (
          <FadeUp
            as="li"
            key={fact.value}
            delay={index * 0.1}
            className="flex min-h-[19.6vw] min-w-0 flex-col justify-between gap-12 rounded-lg bg-mpx-surface p-[1.9vw] max-lg:min-h-44 max-lg:p-[3.5vw] max-md:p-[5vw]"
          >
            <Odometer
              value={fact.value}
              cellClassName="h-[4.4vw] w-[2vw] leading-[1.3] [clip-path:inset(0_-1em)] max-lg:h-[9.1vw] max-lg:w-[4.1vw] max-md:h-[13.7vw] max-md:w-[6.2vw]"
              rowClassName="h-[4.4vw] leading-[1.3] max-lg:h-[9.1vw] max-md:h-[13.7vw]"
              className="font-mpx-head text-64 leading-none  "
            />
            <span className="text-24 leading-[1.45] text-mpx-muted">
              {fact.label[0]}
              <br />
              {fact.label[1]}
            </span>
          </FadeUp>
        ))}
      </ul>
    </div>
  </section>
);

export default Intro;
