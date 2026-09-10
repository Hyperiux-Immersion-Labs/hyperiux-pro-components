import React from "react";
import ElasticAccordion from "@/components/elastic-accordion";

const page = () => {
  return (
    <main className="h-screen  max-[1025px]:flex max-[1025px]:items-center max-[1025px]:flex-col max-[1025px]:justify-center w-full bg-[#ebebe9] pb-[8vw] max-md:pb-16">
      <div className="flex max-[1025px]:h-[20vh] w-full flex-col items-center justify-center px-[4vw] pt-[7vw] max-md:px-8 max-md:pt-[14vw] max-sm:px-6">
        <h1 className="text-[5vw] font-medium text-[#101010] max-md:text-[7vw] max-sm:text-[9vw]">
          Elastic Accordion
        </h1>
      </div>
      <ElasticAccordion />
    </main>
  );
};

export default page;
