import ArrowFillButton from "@/components/arrow-fill-button";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import React from "react";

export default function page() {
  return (
    <section className="flex h-screen items-center justify-center bg-white max-sm:px-[7vw] text-center">
      <div className="max-w-5xl mx-auto text-center text-black">
        {/* Heading */}
        <h1 className="text-[7vw] max-sm:text-[9vw]">Hyperiux Vault</h1>

        {/* Subtext */}
        <p className="mt-8 text-[1.4vw] max-md:w-[80%] max-md:mx-auto max-sm:text-[4.5vw] max-md:text-[3vw]">
          You&apos;ve just seen the chess grid transition , now if you want to see
          again click on the &quot;click here&quot; button.
        </p>

        <div className="mt-12 flex gap-4 max-sm:flex-col max-md:items-center justify-center">
          <ArrowFillButton
            className="border-[#ff5f00] max-sm:w-56! border text-[#ffffff] cursor-pointer"
            btnText={"Click here"}
            href={"/demo/chess-grid-transition"}
          />
         
        </div>
      </div>
    </section>
  );
}
export async function generateMetadata() {
  return getDemoPageMetadata("chess-grid-transition");
}
