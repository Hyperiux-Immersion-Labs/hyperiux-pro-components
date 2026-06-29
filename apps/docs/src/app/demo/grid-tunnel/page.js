import GridTunnel from "@/components/grid-tunnel";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";
import React from "react";

const page = () => {
  return (
    <>
      <DemoHeader />
      <GridTunnel />
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
        <div className="mt-16 max-w-[40vw] text-center max-sm:max-w-[80vw]">
          <h1 className="text-[10vw] font-medium leading-[1.1]! text-center! tracking-tight text-black">
            Hyperiux Vault.
          </h1>

          <p className="mx-auto mt-5 max-w-[60vw] text-[1.3vw] max-md:text-[2.5vw] font-medium leading-tight text-neutral-600 max-sm:text-[4vw] max-sm:max-w-[90vw]! max-sm:mt-10">
            A curated collection of modern UI components, smooth animations,
            creative backgrounds and premium interactions for
            <span className="text-[#ff5f00]"> Next.js developers.</span>
          </p>
        </div>
      </div>
      <ScrollBottom textColor={"text-[#111111]"} />
    </>
  );
};

export default page;
