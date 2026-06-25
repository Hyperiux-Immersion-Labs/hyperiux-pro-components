import ParallaxImageAnimation from"@/components/parallax-image-animation";
import React from"react";
import { ReactLenis } from"lenis/react";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";

const page = () => {
 return (
 <>
 <ReactLenis root>
    <DemoHeader textColor="#ffffff" logoColor="#ffffff" />
 <section className="w-screen h-screen bg-black text-white flex flex-col gap-[7vw] max-sm:gap-[12vw] items-center justify-center">
 <h1 className="text-[4vw] max-md:text-[5.5vw] font-medium max-sm:text-[8.5vw] w-[70%] text-center">
 Scroll To See Image Parallax Effect
 </h1>
 </section>
 <section className="w-screen h-fit flex flex-col gap-[7vw] items-center justify-center bg-black text-white max-sm:gap-[10vw]">
 <div className="w-[70%] max-md:w-[75%] flex justify-between max-sm:w-[90%] max-md:flex-col">
 <div>
 <p className="text-[1.5vw] max-md:text-[4vw]  mb-[2vw] font-medium max-sm:text-[5.5vw] max-md:mb-[5vw]">
 Only Parallax
 </p>
 <ParallaxImageAnimation
 src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-05.jpg"
 wrapperClassName="w-[27vw] h-[37vw] max-md:h-[65vh] max-md:w-full max-sm:h-[120vw]"
 imageClassName="scale-[1.4] -translate-y-[30%]"
 />
 </div>
 <div className="mt-[15vw]">
 <p className="text-[1.5vw] max-md:text-[4vw] max-md:mb-[5vw] mb-[2vw] font-medium max-sm:text-[5.5vw]">
 Scale Down with Parallax
 </p>
 <ParallaxImageAnimation
 src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-08.jpg"
 wrapperClassName="w-[32vw] h-[32vw] max-md:w-full max-md:h-[65vh] max-sm:h-[90vw]"
 scaleFrom={1.6}
 scaleTo={1.2}
 enableScale={true}
 imageClassName="scale-[1.4] -translate-y-[30%]"
 />
 </div>
 </div>
 <div className="w-[70%]  flex justify-between max-md:pt-24 max-md:w-[75%] max-sm:w-[90%] max-md:flex-col max-sm:gap-[10vw]">
 <ParallaxImageAnimation
 src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-02.jpg"
 wrapperClassName="w-[27vw] h-[37vw] rounded-[0.5vw] max-md:h-[65vh] max-md:w-full max-sm:h-[120vw] max-sm:rounded-[2vw]"
 imageClassName="scale-[1.4] -translate-y-[30%]"
 />
 <div className="mt-[17vw] max-sm:mt-0">
 <ParallaxImageAnimation
 src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-05.jpg"
 wrapperClassName="w-[38vw] h-[30vw] rounded-[1vw] max-md:w-full max-sm:rounded-[3vw] max-md:h-[65vh] max-sm:h-[100vw]"
 imageClassName="scale-[1.4] -translate-y-[30%]"
 />
 </div>
 </div>
 </section>
 <section className="w-screen h-screen max-md:h-[50vh] bg-black"></section>
 </ReactLenis>
 </>
 );
};

export default page;
