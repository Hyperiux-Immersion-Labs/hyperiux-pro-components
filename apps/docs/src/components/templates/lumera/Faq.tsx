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
      className={`group relative overflow-hidden rounded-md border mb-[1.1vw] transition-colors duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] max-md:rounded-[4.5vw] max-md:mb-[4vw] max-[1025px]:rounded-[2.5vw] max-[1025px]:mb-[2vw] ${
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
        className="relative z-2 flex w-full items-center justify-between gap-[2vw] py-[1.6vw] pl-[2.2vw] pr-[1.6vw] text-left max-md:py-[5vw] max-md:pl-[6vw] max-md:pr-[5vw] max-[1025px]:py-[3vw] max-[1025px]:pl-[4vw] max-[1025px]:pr-[3vw] accordion"
      >
        <span className="text-[1.5vw] max-md:w-[80%] font-medium max-md:text-[5vw] max-[1025px]:text-[3.5vw]">{title}</span>
        <span className="relative flex h-[2.6vw] w-[2.6vw] shrink-0 items-center justify-center rounded-full border border-black max-md:h-[9vw] max-md:w-[9vw] max-[1025px]:h-[6vw] max-[1025px]:w-[6vw]">
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
          <div className="w-[65%] space-y-[1.5vw] pl-[2.2vw] pb-[1.8vw] text-[1.15vw] leading-normal font-normal text-black max-md:w-[80%] max-md:space-y-[4vw] max-md:pl-[6vw] max-md:pb-[6vw] max-md:text-[4vw] max-[1025px]:w-[90%] max-[1025px]:pl-[4vw] max-[1025px]:pb-[3vw] max-[1025px]:text-[2.7vw]">
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
      <section className="py-[7%] max-md:pt-[20%]" id="faq">
        <div className={`w-full ml-auto max-md:w-full max-[1025px]:w-full px-[5%]  max-md:px-[6%]`}>
          <h2 data-para-anim className={`font-heading max-md:mb-[10vw] font-medium text-[3.5vw] leading-[1.2] max-[1025px]:text-[6.8vw] max-md:text-[8.8vw] mb-[5vw]`}>
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
