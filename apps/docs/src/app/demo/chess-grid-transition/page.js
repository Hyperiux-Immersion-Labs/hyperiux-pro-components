import { ArrowFillButton } from "@/components/arrow-fill-button";
import React from "react";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import Link from "next/link";
// import { Link } from "lucide-react";


export default function page() {
  return (
    <section className="flex h-screen items-center justify-center bg-white max-sm:px-[7vw] text-center">
      <div className="max-w-5xl mx-auto text-center text-black">
        {/* Heading */}
        {/* <h1 className="text-[7vw] max-sm:text-[9vw]">
        Chess Grid Transition
        </h1> */}
        <h1 className="text-[7vw] max-sm:text-[9vw]">
        Hyperiux
        </h1>

        {/* Subtext */}
        {/* <p className="mt-8 text-[1.4vw] max-sm:text-[4.5vw] max-md:text-[3vw]">
          Click on the button to see the transition
        </p> */}

        {/* Buttons */}
        {/* <div className="mt-12">
          <ArrowFillButton className="border-[#ff5f00] border text-[#ffffff] cursor-pointer" btnText={"Click here"} href={"/demo/chess-grid-transition/page2"}  />
        </div> */}
        <Link href="/demo/chess-grid-transition/page2" className="absolute bottom-0 right-0">
        Click
        </Link>
      </div>
    </section>
  );
}

export async function generateMetadata() {
  return getDemoPageMetadata("chess-grid-transition");
}
