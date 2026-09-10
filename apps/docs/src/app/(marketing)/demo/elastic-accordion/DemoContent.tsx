"use client";

import ElasticAccordion from "@/components/elastic-accordion";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import type { RegistryLike } from "@/components/remixer-panel/types";

export default function DemoContent({ registry }: { registry: RegistryLike }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={ElasticAccordion}
      copyCodeOptions={{ propsVariableName: "elasticAccordionProps" }}
    >
      {({ values, effect }) => (
        <main
          className="min-h-screen w-full pb-16 pt-28 md:pb-[8vw]"
          style={{ backgroundColor: values.bgColor as string }}
        >
          <DemoHeader />
          <div className="flex w-full flex-col items-center justify-center px-6 md:px-[4vw]">
            <h1 className="text-[5vw] font-medium text-[#101010] max-md:text-[7vw] max-sm:text-[9vw]">
              Elastic Accordion
            </h1>
          </div>
          {effect}
        </main>
      )}
    </RegistryRemixerDemo>
  );
}
