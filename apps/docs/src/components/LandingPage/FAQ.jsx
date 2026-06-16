"use client";

import {
  FAQContent,
  FAQGroup,
  FAQTitle,
  FAQWrapper,
} from "@/components/animated-faq";
import React from "react";
import HeadAnim from "../Animations/HeadAnim";

export default function FAQDemo({faqItems}) {
  const defaultOpenItems = faqItems
    .filter((item) => item.defaultOpen)
    .map((item) => item.id);

  return (
    <section className=" h-screen px-8 max-sm:px-4 py-20 text-white">
        <div className="mx-auto text-center text-white mb-12">
                <HeadAnim>
                <h1 className="text80 max-sm:text-[11vw] max-md:text-[8vw]">
                Frequently Asked Questions
                </h1>
                </HeadAnim>
              </div>
      <div className="mx-auto max-w-[75vw] max-md:max-w-[90vw] space-y-4 max-md:space-y-8 max-sm:space-y-6">
        <FAQGroup allowMultiple={false} defaultOpenItems={defaultOpenItems}>
          {faqItems.map((item) => (
            <FAQWrapper
              key={item.id}
              itemId={item.id}
              className="rounded-md border border-white/20 px-6 py-5 fadeup"
              titleClassName="text-[1.1rem] font-medium text-white"
              iconSize={16}
              iconStrokeWidth={2}
              duration={0.5}
            >
              <FAQTitle className="pb-0 text-[1.5vw] max-sm:text-[5vw] max-md:text-[3.2vw] max-md:leading-[1.3] max-sm:leading-[1.3]">{item.title}</FAQTitle>

              <FAQContent className="pt-4 text-neutral-400 w-[80%] max-md:w-[95%] text22 max-sm:text-[4vw]! max-md:text-[2.5vw]!">
                {item.content}
              </FAQContent>
            </FAQWrapper>
          ))}
        </FAQGroup>
      </div>
    </section>
  );
}
