// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { faq } from "../content";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import { fade, lines, ready, scene } from "./Animations/scroll";
import { FAQContent, FAQGroup, FAQTitle, FAQWrapper } from "./effects/animated-faq";

gsap.registerPlugin(useGSAP);

const Faq = () => {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        ready(root.current);
        return;
      }

      const tl = scene(root.current, "top 75%", "center 55%");
      const split = lines(tl, root.current?.querySelector("h2") ?? null, 0);
      fade(tl, "[data-orn-copy]", 0.3);
      fade(tl, "[data-orn-faq]", 0.4, 0.1, 14);

      return () => split?.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="faq" data-orn-tone="light" className="orn-light relative z-[1] bg-orn-light">
      <div className="orn-container orn-section flex justify-between gap-12 max-lg:flex-col max-md:gap-8">
        <div className="flex w-[32%] flex-col gap-5 max-lg:w-[70%] max-md:w-full">
          <h2 data-orn-split>{faq.title}</h2>
          <p data-orn-copy data-orn-fade className="text-16 text-orn-muted">
            {faq.copy}
          </p>
        </div>
        <div className="flex w-[58%] flex-col max-lg:w-full">
          <FAQGroup>
            {faq.items.map((item, i) => (
              <div key={item.q} data-orn-faq data-orn-fade>
                <FAQWrapper
                  itemId={`faq-${i}`}
                  duration={0.25}
                  className="border-t border-orn-line outline-none transition-colors duration-200 hover:border-[var(--orn-accent)]"
                  iconClassName="h-[2.4vh] aspect-square text-orn-accent max-lg:h-[1.8vh] max-md:h-[2.6vh]"
                >
                  <FAQTitle iconMode="plus" className="py-[1.4vw] max-lg:py-[2.4vw] max-md:py-[4.4vw]">
                    <h3 className="text-16 font-medium">{item.q}</h3>
                  </FAQTitle>
                  <FAQContent innerClassName="w-[88%] py-[0.4vw] text-14 text-orn-muted max-lg:py-[1vw] max-md:w-full max-md:py-[2vw]">
                    <p>{item.a}</p>
                  </FAQContent>
                </FAQWrapper>
              </div>
            ))}
            <div className="h-px w-full bg-[var(--orn-border)]" />
          </FAQGroup>
        </div>
      </div>
    </section>
  );
};

export default Faq;
