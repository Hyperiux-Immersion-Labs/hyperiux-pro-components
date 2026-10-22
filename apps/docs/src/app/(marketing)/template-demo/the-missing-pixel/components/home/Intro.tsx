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
  <section id="about" className="px-[5vw] max-lg:px-[4vw] max-md:px-[5vw] py-[6vw] max-lg:py-[8vw] max-md:py-[10vw]">
    <div className="flex flex-col gap-[6vw] rounded-[2.2vw] border border-black/10 bg-white p-[3.3vw] max-lg:gap-[8vw] max-lg:rounded-[3vw] max-lg:p-[4vw] max-md:gap-[12vw] max-md:rounded-[5vw] max-md:p-[5vw]">
      <div className="flex flex-col items-start gap-5 max-md:gap-4">
       
        <MaskReveal
          as="p"
          scrub
          data-cursor-fill
          className="font-mpx-head w-[48%] text-[2.5vw] font-normal leading-[1.2] tracking-tight text-mpx-muted max-lg:w-[85%] max-lg:text-[4vw] max-md:w-full max-md:text-[6.4vw]"
        >
          <span className="text-mpx-ink">
            Sixty strategists, designers, writers and engineers in four cities,
          </span>{" "}
          obsessed with the one detail people remember.
        </MaskReveal>
        <UnderlineLink href={ROUTES.about} className="font-mpx-head text-lg font-medium text-mpx-ink">
          Meet the studio
        </UnderlineLink>
      </div>

      <ul className="grid grid-cols-3 gap-[1vw] max-lg:grid-cols-1 max-lg:gap-3">
        {FACTS.map((fact, index) => (
          <FadeUp
            as="li"
            key={fact.value}
            delay={index * 0.1}
            className="flex min-h-[19.6vw] min-w-0 flex-col justify-between gap-12 rounded-[1.4vw] bg-mpx-surface p-[1.9vw] max-lg:min-h-44 max-lg:rounded-[2.5vw] max-lg:p-[3.5vw] max-md:rounded-[4vw] max-md:p-[5vw]"
          >
            <Odometer
              value={fact.value}
              cellClassName="h-[6vw] w-[2.7vw] leading-[1.3] [clip-path:inset(0_-1em)] max-lg:h-[13vw] max-lg:w-[5.8vw] max-md:h-[20.8vw] max-md:w-[9.2vw]"
              rowClassName="h-[6vw] leading-[1.3] max-lg:h-[13vw] max-md:h-[20.8vw]"
              className="font-mpx-head text-[4.6vw] leading-none tracking-tighter max-lg:text-[10vw] max-md:text-[16vw]"
            />
            <span className="text-base leading-[1.45] text-mpx-muted">
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
