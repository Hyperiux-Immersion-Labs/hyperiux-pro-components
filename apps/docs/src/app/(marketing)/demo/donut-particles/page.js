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
      <div className="relative z-20 h-full w-full flex items-center max-[1025px]:items-start">
        <div className="w-full max-w-2xl px-10 absolute bottom-10 left-0 max-[1025px]:top-10 max-[1025px]:bottom-auto max-[1025px]:px-6 max-md:px-4">
          <HeadAnim>
            <h1 className="leading-none uppercase text-[7vw] text-white font-medium max-[1025px]:text-[10vw] max-md:text-[12vw]">
              Brands Built <span className=" text-purple-500"> Boldly</span>
            </h1>
          </HeadAnim>
        </div>
      </div>

      <div className="absolute bottom-8 right-10 z-20 max-[1025px]:bottom-10 max-w-md max-[1025px]:right-4 space-y-2 text-right  max-[1025px]:w-[50vw]">
        <p className="text-white max-[1025px]:text-[2.2vw] max-md:text-[2.8vw] text-[0.8vw] uppercase tracking-[0.28em]">
          Trace the orbit. The particles will follow.
        </p>
        <Copy delay={0.5}>
          <p className="text-white max-[1025px]:text-xl max-md:text-sm leading-[1.2] text-lg">
            From strategy to visuals, we craft branding that tells your story
            and leaves a lasting impression.
          </p>
        </Copy>
        <div className="ml-auto flex w-full items-center justify-end gap-1">
        <button className="pr-4 py-1.5  flex items-center gap-1 rounded-full hover:text-primary  cursor-pointer  transition-all duration-300 text-white/80">
                           <Link href={"/effects"}>Explore Platform</Link>
                           <ArrowRight className='h-4 w-4' />
                        </button>
                        <button className="pr-4 py-1.5 flex items-center gap-1 rounded-full hover:text-primary  cursor-pointer  transition-all duration-300 text-white/80">
                           <Link href={"/effects/webgl-effects/donut-particles"}>Read Article</Link>
                           <ArrowRight className='h-4 w-4' />
                        </button>
                        </div>
      </div>
      

      <div className="hidden max-[1025px]:flex absolute bottom-8 left-6 w-[30vw] max-md:w-[35vw] max-md:text-[3.5vw] justify-end text-center bg-white/20 backdrop-blur-[0.5vw] rounded-lg  text-white text-[2.5vw] p-2">
        Experience the full magic on desktop
      </div>
    </>
  );
};

export default index;

export async function generateMetadata() {
  return getDemoPageMetadata("donut-particles");
}
