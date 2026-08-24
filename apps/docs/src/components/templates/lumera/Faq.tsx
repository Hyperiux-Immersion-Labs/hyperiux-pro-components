"use client";

import React, { useState } from "react";

interface FaqItem {
  title: string;
  content: string;
}

const faqData: FaqItem[] = [
  {
    title: "Where is Lumera Heights located?",
    content:
      "Lumera Heights is located in Business Bay, Dubai, offering convenient access to Downtown Dubai, Dubai Mall, Burj Khalifa and the city's major business and lifestyle destinations.",
  },
  {
    title: "What types of residences are available?",
    content:
      "Lumera Heights offers a curated range of studio, one, two and three-bedroom residences, alongside an exclusive penthouse collection designed for elevated living.",
  },
  {
    title: "What amenities are available to residents?",
    content:
      "Residents enjoy access to a rooftop infinity pool, private wellness spa, fully equipped fitness studio, co-working lounge, concierge services and landscaped podium gardens.",
  },
  {
    title: "What is the starting price?",
    content:
      "Prices at Lumera Heights start from AED 4.2M+, with a range of layouts available to suit different lifestyles and budgets.",
  },
  {
    title: "Is there a payment plan available?",
    content:
      "Yes, flexible payment plans are available, including staged instalments through construction ahead of handover in Q4 2027.",
  },
];

interface SingleAccordionProps extends FaqItem {
  isOpen: boolean;
  onToggle: () => void;
}

const SingleAccordion = ({ title, content, isOpen, onToggle }: SingleAccordionProps) => {
  return (
    <div
      className={`group relative overflow-hidden rounded-md border mb-[1.1vw] transition-colors duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] mobile:rounded-[4.5vw] mobile:mb-[4vw] tablet:rounded-[2.5vw] tablet:mb-[2vw] ${
        isOpen ? "border-[#E0D4C6]" : "border-[#111111]"
      }`}
    >
      <div
        className={`absolute inset-0 bg-[#E0D4C6] origin-top transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${
          isOpen ? "scale-y-[1]" : "scale-y-0"
        }`}
      ></div>
      <button
        type="button"
        onClick={onToggle}
        className="relative z-[2] flex w-full items-center justify-between gap-[2vw] py-[1.6vw] pl-[2.2vw] pr-[1.6vw] text-left mobile:py-[5vw] mobile:pl-[6vw] mobile:pr-[5vw] tablet:py-[3vw] tablet:pl-[4vw] tablet:pr-[3vw] accordion"
      >
        <span className="text-[1.4vw] font-medium mobile:text-[5vw] tablet:text-[3.5vw]">{title}</span>
        <span className="relative flex h-[2.6vw] w-[2.6vw] shrink-0 items-center justify-center rounded-full border border-black mobile:h-[9vw] mobile:w-[9vw] tablet:h-[6vw] tablet:w-[6vw]">
          <span className="absolute top-1/2 left-1/2 h-[1.5px] w-[40%] -translate-x-1/2 -translate-y-1/2 bg-black" />
          <span
            className={`absolute top-1/2 left-1/2 h-[1.5px] w-[40%] -translate-x-1/2 -translate-y-1/2 bg-black transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${
              isOpen ? "rotate-0" : "rotate-90"
            }`}
          />
        </span>
      </button>
      <div
        className={`relative z-2 grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="w-[70%] space-y-[1.5vw] pl-[2.2vw] pb-[1.8vw] text-[1.1vw] leading-normal font-normal text-black mobile:w-full mobile:space-y-[4vw] mobile:pl-[6vw] mobile:pb-[6vw] mobile:text-[4vw] tablet:w-[90%] tablet:pl-[4vw] tablet:pb-[3vw] tablet:text-[2.7vw]">
            <p data-para-anim className="">
              {content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <section className="py-[7%] mobile:pt-[20%]" id="faq">
        <div className={`w-full ml-auto mobile:w-full tablet:w-full px-[5%] !px-[10vw] tablet:!px-[5vw] `}>
          <h2 data-para-anim className={`font-heading font-medium text-[3.8vw] leading-[1.2] max-[1025px]:text-[6.8vw] max-md:text-[8.8vw] mb-[5vw]`}>
            FAQs
          </h2>
          <div className="w-full fadeup">
            {faqData.map((item, index) => (
              <SingleAccordion
                key={index}
                title={item.title}
                content={item.content}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Faq;
