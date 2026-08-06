import SquareTranslate from "@/components/square-translate";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import React from "react";
import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import Image from "next/image";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";


const page = () => {
  return (
    <>
      <DemoHeader />
      <LenisSmoothScroll />
      <div className="h-fit w-screen bg-[#eeeeee] px-[4vw] text-black max-[1025px]:px-8 max-md:px-6 py-[10vw] max-[1025px]:pt-[20vw] max-[1025px]:pb-[40vh]">
        <div className="h-fit py-[2vw]  max-[1025px]:py-6 w-[80%] max-[1025px]:w-full mx-auto mb-[5vw] max-[1025px]:mb-8 flex flex-col items-center justify-center text-center text-[1.5vw] max-[1025px]:text-base px-[4vw] max-[1025px]:px-4 gap-[1vw]">
          <h1 className="text-[5vw]  font-medium max-[1025px]:text-[7vw] max-md:text-[9vw]" >
             Square Translate
          </h1>
          <p>
            A scroll-driven list with a rotating square indicator that follows
            your scroll position.
          </p>
        </div>
        <h2 className="mb-[2vw] max-[1025px]:mb-4">
          <span className="text-[3.5vw] max-[1025px]:text-2xl font-medium text-black">
            What&apos;s included
          </span>
          {/* <span className="text-[#FB450F] font-mono uppercase ml-[2vw] text-[1.2vw]">// Services</span> */}
        </h2>
        <div className="h-fit w-full py-[10vh] max-[1025px]:py-6 flex max-[1025px]:flex-col items-center gap-[6vw] max-[1025px]:gap-8">
          <div className="h-[35vw] w-[40vw] max-[1025px]:w-full max-[1025px]:h-[40vw] max-md:h-[70vw] rounded-lg overflow-hidden">
            <Image
              alt="Square Translate"
              src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-03.jpg"
              width={1000}
              height={1000}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="max-[1025px]:w-full max-[1025px]:px-4">
            <SquareTranslate />
          </div>
        </div>
        <div className="h-[20vh] max-[1025px]:h-24 bg-[#eeeeee] text-white mb-[5vw] max-[1025px]:mb-8 relative flex items-center justify-center w-full">
          <div className="h-[10vw] max-[1025px]:h-20 w-[80%] max-[1025px]:w-full flex items-center justify-center text-center font-mono text-[1.5vw] max-[1025px]:text-base px-[4vw] max-[1025px]:px-4  rounded-xl bg-black translate-y-[10vw] max-[1025px]:translate-y-8">
            <p>Hope you like it!</p>
          </div>
        </div>
      </div>
      <ScrollBottom textColor="text-[#000000]" className="bottom-[2%] left-[95%] max-md:left-[90%]" />
    </>
  
  );
};

export default page;

export async function generateMetadata() {
  return getDemoPageMetadata("square-translate");
}
