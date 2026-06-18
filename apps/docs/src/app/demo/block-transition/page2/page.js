import { ArrowFillButton } from "@/components/arrow-fill-button";
import React from "react";

export default function page() {
  return (
    <section className="flex h-screen items-center justify-center bg-white max-sm:px-[7vw] text-center">
      <div className="mx-auto max-w-5xl text-center text-black">
        <h1 className="text-[7vw] max-sm:text-[9vw]">Hyperiux Vault</h1>

        <p className="mt-8 text-[1.4vw] max-md:text-[3vw] max-sm:text-[4.5vw]">
          You&apos;ve just seen the block transition, now if you want to see
          again click on the &quot;click here&quot; button.
        </p>

        <div className="mt-12 flex justify-center gap-4 max-md:items-center max-sm:flex-col">
          <ArrowFillButton
            className="border border-[#ff5f00] text-[#ffffff] cursor-pointer"
            btnText={"Click here"}
            href={"/demo/block-transition"}
          />
          <ArrowFillButton
            className="border border-[#ff5f00] text-[#ff5f00] cursor-pointer"
            btnText={"Browse effects"}
            hoverFillTextColor={"#ffffff"}
            arrowColor={"#ffffff"}
            hoverArrowColor={"#ffffff"}
            fillBgColor={"#ff5f00"}
            hoverFillBgColor={"#ff5f00"}
            textColor={"#ff5f00"}
            bgColor={"bg-white "}
            href={"/effects"}
          />
        </div>
      </div>
    </section>
  );
}
