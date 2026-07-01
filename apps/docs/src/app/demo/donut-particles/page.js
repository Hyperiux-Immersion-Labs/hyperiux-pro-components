import DonutParticles from "@/components/donut-particles";
import React from "react";
import HeadAnim from '@/components/Animations/HeadAnim'
import Copy from '@/components/Animations/Copy'
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const index = () => {
  return (
    <>
      <DonutParticles />
      <div className="relative z-20 h-full w-full flex items-center max-md:items-start">
        <div className="w-full max-w-2xl px-10 absolute bottom-10 left-0 max-md:top-10 max-md:bottom-auto max-md:px-6 max-sm:px-4">
          <HeadAnim>
            <h1 className="leading-none uppercase text-[7vw] text-white font-medium max-md:text-[10vw] max-sm:text-[12vw]">
              Brands Built <span className=" text-purple-500"> Boldly</span>
            </h1>
          </HeadAnim>
        </div>
      </div>

      <div className="absolute bottom-8 right-10 z-20 max-md:bottom-10 max-w-md max-md:right-4 space-y-2 text-right  max-md:w-[50vw]">
        <Copy delay={0.5}>
          <p className="text-white max-md:text-xl max-sm:text-sm leading-[1.2] text-lg">
            From strategy to visuals, we craft branding that tells your story
            and leaves a lasting impression.
          </p>
        </Copy>
        <button className="pr-4 py-1.5 ml-auto flex items-center gap-1 rounded-full hover:text-primary  cursor-pointer  transition-all duration-300 text-white/80">
                           <Link href={"/effects"}>Explore Platform</Link>
                           <ArrowRight className='h-4 w-4' />
                        </button>
      </div>
      

      <div className="hidden max-md:flex absolute bottom-8 left-6 w-[30vw] max-sm:w-[35vw] max-sm:text-[3.5vw] justify-end text-center bg-white/20 backdrop-blur-[0.5vw] rounded-lg  text-white text-[2.5vw] p-2">
        Experience the full magic on desktop
      </div>
    </>
  );
};

export default index;

export async function generateMetadata() {
  return getDemoPageMetadata("donut-particles");
}
