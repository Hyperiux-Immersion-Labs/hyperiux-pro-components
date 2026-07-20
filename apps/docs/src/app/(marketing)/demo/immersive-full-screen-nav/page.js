import ImmersiveFullscreenNav from "@/components/immersive-full-screen-nav";
import Link from "next/link";
import React from "react";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
      <ImmersiveFullscreenNav />
      <main className="flex h-screen items-center justify-center bg-white max-sm:px-[7vw] text-center">
        <div className="max-w-5xl mx-auto text-center text-black">
          {/* Heading */}
          <h1 className="text-[7vw] max-md:w-[90%] max-md:mx-auto max-sm:text-[9vw]">
            Immersive Full Screen Navigation
          </h1>

          {/* Subtext */}
          <p className="mt-8 text-[1.4vw] max-sm:text-[4.5vw] max-md:text-[3vw]">
            Click on the hamburger to open the navigation
          </p>

          {/* Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 max-sm:text-[4.5vw] max-md:text-[3vw]">
            <button className=" rounded-full max-sm:min-w-[45vw] bg-black text-white font-medium ">
              <Link href={"/effects/navigation/immersive-full-screen-nav"} className="px-7 py-3 block w-full">
                Get Started
              </Link>
            </button>

            <button className=" rounded-full max-sm:min-w-[45vw] border border-black ">
              <Link href={"/effects"} className="px-7 py-3 block w-full">
                Explore Platform
              </Link>
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default page;
export async function generateMetadata() {
  return getDemoPageMetadata("immersive-full-screen-nav");
}
