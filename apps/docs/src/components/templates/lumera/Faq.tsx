"use client";

import React, { useState } from "react";
import styles from "./styles.module.css";

interface FaqItem {
  title: string;
  content: string;
}

const faqData: FaqItem[] = [
  {
    title: "What does the design process look like?",
    content:
      "We begin with a discovery phase to understand your site and goals, then move through concept design, detailed drawings, and construction support.",
  },
  {
    title: "How long does a typical project take?",
    content:
      "Timelines vary by scope, but most residential projects run between six months and two years from concept to completion.",
  },
  {
    title: "Do you work outside your local area?",
    content:
      "Yes, we regularly take on projects further afield and coordinate closely with local contractors and consultants.",
  },
  {
    title: "Can you work with an existing structure?",
    content:
      "Absolutely — renovations and additions are a core part of our practice, and we enjoy working within existing constraints.",
  },
];

interface SingleAccordionProps extends FaqItem {
  isOpen: boolean;
  onToggle: () => void;
}

const SingleAccordion = ({ title, content, isOpen, onToggle }: SingleAccordionProps) => {
  return (
    <div className="group relative">
      <div className="w-full bg-black lineDraw h-[1px]  mobile:block tablet:block"></div>
      <div
        className={`absolute bg-[#E0D4C6] w-full h-full origin-top transition-all duration-500 ease-out ${
          isOpen ? "scale-y-[1]" : "scale-y-0"
        }`}
      ></div>
      <button
        type="button"
        onClick={onToggle}
        className="text-[1.5vw] font-semibold mobile:w-[70%] mobile:text-[5vw] pl-[2vw] mobile:text-left mobile:flex tablet:text-[3.5vw] relative z-[2] w-full text-left tablet:text-left ease-in py-[2%] mobile:py-[5%] accordion"
      >
        {title}
      </button>
      {isOpen && (
        <div className="text-[1.2vw] pl-[2vw] text-black font-light leading-[1.3] space-y-[1.5vw] w-[70%] mb-[20px] mobile:w-full mobile:text-[4vw] mobile:space-y-[4vw] relative z-[2] tablet:text-[2.7vw] tablet:w-[90%]">
          <p data-para-anim className="">
            {content}
          </p>
        </div>
      )}
    </div>
  );
};

const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <section className="py-[7%] mobile:pt-[20%]" id="faq">
        <div className={`w-full ml-auto mobile:w-full tablet:w-full ${styles["container-lg"]} !px-[10vw] tablet:!px-[5vw] `}>
          <h2 data-para-anim className={`${styles["title-2"]} mb-[5vw]`}>
            Frequently Asked Questions
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
          <div className="w-full bg-black lineDraw h-[1px] mobile:block tablet:block"></div>
        </div>
      </section>
    </>
  );
};

export default Faq;
