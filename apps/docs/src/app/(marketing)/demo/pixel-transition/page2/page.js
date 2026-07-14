import HeadAnim from "@/components/Animations/HeadAnim";
import ArrowFillButton from "@/components/arrow-fill-button";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import React from "react";

export default function page() {
  return (
    <section className="flex h-screen items-center justify-center bg-white px-6 text-center max-sm:px-[7vw]">
      <div className="mx-auto max-w-5xl max-sm:max-w-5xl max-md:w-[70%] max-md:mx-auto space-y-12 text-black">

        <HeadAnim>

        <h1 className="text-[7vw] max-sm:text-[9vw]">Hyperiux Vault</h1>
        </HeadAnim>

        <SplitLine>

        <p className="text-[1.4vw] leading-[1.4]  max-md:text-[3vw] max-sm:text-[4.5vw]">
          You&apos;ve just seen the Pixels Transition, now if you want to see
          it again click on the &quot;Click here&quot; button.
        </p>
        </SplitLine>

        <div className="mt-12 flex justify-center gap-4 max-md:items-center  max-sm:flex-col">
          <ArrowFillButton
            className="cursor-pointer border max-sm:w-58 border-[#ff5f00] text-[#ffffff]"
            btnText={"Click here"}
            href={"/demo/pixel-transition"}
          />
        </div>
      </div>
    </section>
  );
}
