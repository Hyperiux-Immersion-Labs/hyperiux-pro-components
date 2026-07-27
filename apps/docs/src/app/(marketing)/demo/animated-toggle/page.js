import DemoHeader from "@/components/WebsiteComps/DemoHeader";


import AnimatedToggle from "@/components/animated-toggle";
import Image from "next/image";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


export default function Page() {
  return (
    <>
    <DemoHeader textColor="white" logoColor='#FFFFFF' />
      <section className="min-h-dvh w-full flex items-center relative justify-center">
        <div className="z-1 space-y-[4vw] max-md:px-[7vw] max-md:space-y-[10vw]">
          <div className="flex flex-col items-center justify-center gap-[1vw] text-center max-md:gap-[3vw]">
            <h1 className="text-[5vw] text-white max-sm:text-[11vw] max-md:text-[7vw] max-sm:text-center">
              Animated Toggle
            </h1>
            <p className="text-[1.2vw] max-md:hidden max-sm:text-[4.5vw] max-md:text-[3vw]">
              Hover over and click to see the effect for hovered and active
              state of the toggles below
            </p>
            <p className="text-[1.2vw] max-md:block hidden max-sm:text-[4.5vw] max-md:text-[3vw]">
              Click to see the effect for hovered and active
              state of the toggles below
            </p>
          </div>
          <div className="flex gap-8 justify-center">
            <AnimatedToggle/>
          </div>
        </div>
        <Image
          className="absolute w-full h-full object-cover brightness-40"
          src={
            "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-07.jpg"
          }
          alt="Pexels Image"
          width={1920}
          height={1080}
          sizes="fill"
        />
      </section>
    </>
  );
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-toggle");
}
