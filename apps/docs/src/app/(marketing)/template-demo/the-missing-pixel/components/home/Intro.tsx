// Built using Hyperiux Vault: https://vault.hyperiux.com

import { FadeUp, MaskReveal, Odometer } from "../Animations/gsapAnim";

const FACTS = [
  { value: "180+", label: "brands launched. Not one of them beige." },
  { value: "4", label: "studios and one ongoing time-zone argument" },
  { value: "41", label: "awards we pretend not to count" },
  { value: "93%", label: "of clients come back. The rest got acquired." },
];

const Intro = () => (
  <section
    id="about"
    className="mpx-container py-[7%]  h-screen flex flex-col justify-between gap-25 max-lg:gap-14 max-md:gap-12"
  >
    <MaskReveal
      as="p"
      scrub
      data-cursor-fill
      className="font-mpx-head w-[62%] text-64 font-normal leading-[1.1] max-lg:w-[85%] max-md:w-full tracking-widest"
    >
      We’re sixty strategists, designers, writers and engineers in four
      cities, united by one slightly unhealthy obsession: the detail that
      decides whether people remember you or scroll right past.
    </MaskReveal>

    <div className="flex flex-col gap-9 max-lg:gap-10 max-md:gap-8">
      <div className="h-px w-full bg-black/10" />
      <ul className="grid grid-cols-4 gap-9 max-lg:grid-cols-2 max-lg:gap-x-8 max-lg:gap-y-12 max-md:gap-x-5 max-md:gap-y-10">
        {FACTS.map((fact, index) => (
          <FadeUp
            as="li"
            key={fact.label}
            delay={index * 0.1}
            className="flex flex-col gap-2"
          >
            <Odometer value={fact.value} className="font-mpx-head text-64 leading-none" />
            <span className="w-[80%] text-14 text-mpx-muted max-lg:w-[90%] max-md:w-full">{fact.label}</span>
          </FadeUp>
        ))}
      </ul>
    </div>
  </section>
);

export default Intro;
