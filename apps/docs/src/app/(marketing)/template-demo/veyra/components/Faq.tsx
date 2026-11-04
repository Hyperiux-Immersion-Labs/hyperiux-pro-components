// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import Lines from "./Animations/Lines";
import { lineIn, useReveal } from "./Animations/scene";
import AnimatedFAQ from "./effects/animated-faq";
import { Arrow } from "./Icons";
import { faq } from "../content";

const Faq = () => {
  const ref = useRef<HTMLElement>(null);

  useReveal(ref, (tl, { q }) => {
    lineIn(tl, q("[data-line]"), 0, 1);
    tl.fromTo(q("[data-faq-fade]"), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, stagger: 0.1 }, 0.25);
    tl.fromTo(q("[data-faq-item]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07 }, 0.35);
  });

  return (
    <section ref={ref} id="faq" aria-labelledby="faq-title" data-vey-tone="light" className="relative bg-vey-paper text-vey-ink">
      <div className="grid grid-cols-[1fr_1.6fr] gap-16 vey-container vey-section max-lg:grid-cols-1 max-md:gap-10">
        <div className="flex flex-col gap-6">
          <Lines id="faq-title" lines={faq.heading} />
          <p data-faq-fade className="w-[80%] text-28 text-vey-slate max-lg:w-[70%] max-md:w-full">
            {faq.description}
          </p>
          <a
            data-faq-fade
            href={faq.contact.href}
            className="group flex w-fit items-center gap-2 border-b border-[#151927]/20 py-[0.3vw] text-22 font-medium transition-colors duration-300 hover:border-[#151927] max-lg:py-[0.6vw] max-md:py-[1.2vw]"
          >
            {faq.contact.label}
            <Arrow className="h-[0.9vw] w-[0.9vw] transition-transform duration-300 group-hover:translate-x-1 max-lg:h-[1.8vw] max-lg:w-[1.8vw] max-md:h-[3.7vw] max-md:w-[3.7vw]" />
          </a>
        </div>

        <AnimatedFAQ.Group defaultOpenItems={["faq-0"]}>
          <ul className="flex flex-col gap-2">
            {faq.items.map((item, i) => (
              <li key={item.question} data-faq-item>
                <AnimatedFAQ.Wrapper
                  itemId={`faq-${i}`}
                  fillClassName="bg-white border border-[#e2e4ec]"
                  className="group rounded-md border border-transparent px-[1.6vw] py-[1.4vw] transition-colors duration-300 hover:border-[#e2e4ec] max-lg:px-[3vw] max-lg:py-[2.6vw] max-md:px-[5vw] max-md:py-[5vw]"
                >
                  <AnimatedFAQ.Title
                    className="text-30"
                    iconClassName="h-[1.4vw] w-[1.4vw] shrink-0 text-[#73798a] transition-colors duration-300 group-hover:text-[#151927] max-lg:h-[2.8vw] max-lg:w-[2.8vw] max-md:h-[5vw] max-md:w-[5vw]"
                  >
                    {item.question}
                  </AnimatedFAQ.Title>
                  <AnimatedFAQ.Content className="w-[88%] py-[0.8vw] text-24 text-vey-slate max-lg:py-[1.6vw] max-md:w-full max-md:py-[3vw]">
                    {item.answer}
                  </AnimatedFAQ.Content>
                </AnimatedFAQ.Wrapper>
              </li>
            ))}
          </ul>
        </AnimatedFAQ.Group>
      </div>
    </section>
  );
};

export default Faq;
