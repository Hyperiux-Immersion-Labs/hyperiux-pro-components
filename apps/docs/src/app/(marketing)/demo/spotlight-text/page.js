
import SpotlightText from "@/components/spotlight-text";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import HeadAnim from "@/components/Animations/HeadAnim";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
      <DemoHeader logoColor='#FFFFFF' textColor="#ffffff" />
      <div className="h-screen max-md:h-full max-md:py-5 flex flex-col items-center mx-auto justify-center gap-25 max-md:gap-10 ">
        <div className="space-y-5 w-[40%] max-md:pt-17 max-[1025px]:w-[70%] max-md:w-[70%] mx-auto">
          <HeadAnim>
            <h1 className="text-center text-[6vw] max-[1025px]:text-[7vw] max-md:text-[8vw] opacity-90">
              Spotlight Text
            </h1>
          </HeadAnim>

          <SplitLine>
            <p className="text-center max-[1025px]:hidden text-sm max-[1025px]:text-lg font-medium uppercase tracking-[0.35em] text-white/40 max-md:px-6 max-md:text-base">
              Sweep your cursor across the words and let the spotlight find them
            </p>

            <p className="hidden max-[1025px]:block leading-[1.2] text-center max-md:text-base max-[1025px]:text-xl">
              This effect comes alive with a cursor. Try it on desktop.
            </p>
          </SplitLine>
        </div>

        <SpotlightText
          text={`Hyperiux Vault is where design meets precision - a thoughtfully crafted component library built for developers who care about performance, aesthetics, and experience. Every interaction is intentional, every animation feels alive, and every component is designed to elevate modern interfaces beyond the ordinary.`}
          size="text-3xl"
          className="max-w-4xl mx-auto max-md:w-[80%] max-[1025px]:w-[90%]"
        />
      </div>
    </>
  );
};

export default page;

export async function generateMetadata() {
  return getDemoPageMetadata("spotlight-text");
}
