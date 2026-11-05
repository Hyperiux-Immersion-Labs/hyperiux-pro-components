// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import { OrdButton } from "./Buttons";
import { ENQUIRE } from "./nav";
import { FAQContent, FAQGroup, FAQTitle, FAQWrapper } from "./effects/animated-faq";
import LineReveal from "./Animations/LineReveal";
import { useReveal } from "./Animations/useReveal";

const ITEMS = [
  {
    q: "Which models does Ordin support?",
    a: "Any model with an API, plus your own weights on a private runtime. Route per agent, fall back per step, and swap providers without touching a workflow.",
  },
  {
    q: "How do policies stop an agent mid-run?",
    a: "Policies sit on the action, not the prompt. A tool call that breaks a scope, a spend ceiling or a sign-off rule is denied before it executes, and the whole run rolls back.",
  },
  {
    q: "Where does my data live?",
    a: "In the region you pick, encrypted at rest and in transit. Memory is scoped per agent and per customer, and nothing is used to train models.",
  },
  {
    q: "Can a person approve steps before they happen?",
    a: "Yes. Mark any action as outbound and it waits in a sign-off queue with the full trace attached. Approve it, edit it or send it back.",
  },
  {
    q: "What happens when a run fails?",
    a: "Every step is checkpointed. Ordin retries from the last good step, and you can replay the run with one click to see exactly what each agent saw.",
  },
];

const LINE = "border-(--ord-ink)/12";

const Faq = () => {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section ref={root} data-ord-orb="faq" data-ord-light className="relative bg-(--ord-paper) text-ord-ink">
      <div className="flex justify-between gap-12 ord-container ord-section max-lg:flex-col max-md:gap-8">
        <div className="flex w-[32%] flex-col gap-6 max-lg:w-[70%] max-md:w-full">
          <LineReveal>
            <h2>
              Questions, <span className="text-(--ord-text-muted)">answered.</span>
            </h2>
          </LineReveal>
          <LineReveal delay={0.15}>
            <p className="text-28 text-(--ord-text-muted)">
              Still deciding? An engineer can walk your team through a live run in thirty minutes.
            </p>
          </LineReveal>
          <div data-ord-reveal>
            <OrdButton href={ENQUIRE.demo} variant="inkLine">
              Book a walkthrough
            </OrdButton>
          </div>
        </div>
        <div className="flex w-[58%] flex-col max-lg:w-full">
          <FAQGroup defaultOpenItems={["faq-0"]}>
            {ITEMS.map((item, i) => (
              <div key={item.q} data-ord-reveal>
                <FAQWrapper
                  itemId={`faq-${i}`}
                  className={`group/faq border-t ${LINE} outline-none transition-colors duration-500 hover:border-(--ord-primary-deep)`}
                  iconClassName="h-[2.6vh] aspect-square text-ord-primary-deep max-lg:h-[2vh] max-md:h-[2.8vh]"
                  duration={0.4}
                >
                  <FAQTitle iconMode="plus" className="py-[1.5vw] max-lg:py-[2.6vw] max-md:py-[4.4vw]">
                    <div className="flex items-baseline gap-5 max-md:gap-3">
                      <span className="ord-label text-14 text-ord-primary-deep">{String(i + 1).padStart(2, "0")}</span>
                      <h3 className="text-28 font-medium transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover/faq:[transform:translateX(0.5vw)]">
                        {item.q}
                      </h3>
                    </div>
                  </FAQTitle>
                  <FAQContent innerClassName="w-[88%] pb-[1.4vw] text-24 text-(--ord-text-muted) max-lg:pb-[2.4vw] max-md:w-full max-md:pb-[4vw]">
                    <p>{item.a}</p>
                  </FAQContent>
                </FAQWrapper>
              </div>
            ))}
            <div aria-hidden className="h-px w-full bg-(--ord-ink)/12" />
          </FAQGroup>
        </div>
      </div>
    </section>
  );
};

export default Faq;
