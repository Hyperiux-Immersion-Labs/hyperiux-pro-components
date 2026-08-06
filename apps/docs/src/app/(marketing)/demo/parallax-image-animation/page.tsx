import ParallaxImageAnimation from "@/components/parallax-image-animation";
import { ReactLenis } from "lenis/react";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import HeadAnim from "@/components/Animations/HeadAnim";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
      <ReactLenis root>
        <DemoHeader textColor="#ffffff" logoColor='#FFFFFF' />
        <section className="w-screen h-screen bg-black text-white flex flex-col gap-[7vw] max-md:gap-[12vw] items-center justify-center">

          <HeadAnim>

            <h1 className="text-[4vw] max-[1025px]:text-[5.5vw] font-medium max-md:text-[8.5vw] w-[70%] text-center">
              Scroll To See Image Parallax Effect
            </h1>
          </HeadAnim>
        </section>
        <section className="w-screen h-fit flex flex-col gap-[7vw] items-center justify-center bg-black text-white max-md:gap-[10vw]">
          <div className="w-[70%] max-[1025px]:w-[75%] flex justify-between max-md:w-[90%] max-[1025px]:flex-col">
            <div>
              <SplitLine>

                <p className="text-[1.5vw] max-[1025px]:text-[4vw]  mb-[2vw] font-medium max-md:text-[5.5vw] max-[1025px]:mb-[5vw]">
                  Only Parallax
                </p>
              </SplitLine>
              <ParallaxImageAnimation
                src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-05.jpg"
                wrapperClassName="w-[27vw] h-[37vw] max-[1025px]:h-[65vh] max-[1025px]:w-full max-md:h-[120vw]"
                imageClassName="scale-[1.4] -translate-y-[30%]"
              />
            </div>
            <div className="mt-[15vw]">

              <SplitLine>

                <p className="text-[1.5vw] max-[1025px]:text-[4vw] max-[1025px]:mb-[5vw] mb-[2vw] font-medium max-md:text-[5.5vw]">
                  Scale Down with Parallax
                </p>
              </SplitLine>
              <ParallaxImageAnimation
                src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-08.jpg"
                wrapperClassName="w-[32vw] h-[32vw] max-[1025px]:w-full max-[1025px]:h-[65vh] max-md:h-[90vw]"
                scaleFrom={1.6}
                scaleTo={1.2}
                enableScale={true}
                imageClassName="scale-[1.4] -translate-y-[30%]"
              />
            </div>
          </div>
          <div className="w-[70%]  flex justify-between max-[1025px]:pt-24 max-[1025px]:w-[75%] max-md:w-[90%] max-[1025px]:flex-col max-md:gap-[10vw]">
            <ParallaxImageAnimation
              src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-02.jpg"
              wrapperClassName="w-[27vw] h-[37vw] rounded-[0.5vw] max-[1025px]:h-[65vh] max-[1025px]:w-full max-md:h-[120vw] max-md:rounded-[2vw]"
              imageClassName="scale-[1.4] -translate-y-[30%]"
            />
            <div className="mt-[17vw] max-md:mt-0">
              <ParallaxImageAnimation
                src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-05.jpg"
                wrapperClassName="w-[38vw] h-[30vw] rounded-[1vw] max-[1025px]:w-full max-md:rounded-[3vw] max-[1025px]:h-[65vh] max-md:h-[100vw]"
                imageClassName="scale-[1.4] -translate-y-[30%]"
              />
            </div>
          </div>
        </section>
        <section className="w-screen h-screen max-[1025px]:h-[50vh] bg-black"></section>
      </ReactLenis>
    </>
  );
};

export default page;

export async function generateMetadata() {
  return getDemoPageMetadata("parallax-image-animation");
}
