import ArrowFillButton from "@/components/arrow-fill-button";

import SplitLine from "@/components/WebsiteComps/SplitLine";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import Image from "next/image";
import React from "react";

export default function page() {
  return (
    <section className="relative flex h-screen items-center justify-center max-md:px-[7vw] text-center">
      <Image
        src="/assets/abs/abs2.png"
        alt="Abstract background"
        fill
        priority
        className="object-cover brightness-75"
      />

      <div className="relative z-10 space-y-8 max-w-5xl mx-auto text-center text-white">
        {/* Heading */}
        <SplitLine>
          <h1 className="text-[7vw] max-md:text-[9vw]">Hyperiux Vault</h1>
        </SplitLine>



        <SplitLine>
          <p className=" text-[1.4vw] max-[1025px]:w-[80%] max-[1025px]:mx-auto max-md:text-[4.5vw] max-[1025px]:text-[3vw]">
            You&apos;ve just seen the depth shift transition, now if you want to see
            again click on the &quot;click here&quot; button.
          </p>
        </SplitLine>


        <div className="mt-12 flex gap-4 max-md:flex-col max-[1025px]:items-center justify-center">
          <ArrowFillButton
            className="border-[#ff5f00] max-md:w-56! border text-[#ffffff] cursor-pointer"
            btnText={"Click here"}
            href={"/demo/depth-shift-transition"}
          />
        </div>
      </div>
    </section>
  );
}
export async function generateMetadata() {
  return getDemoPageMetadata("depth-shift-transition");
}
