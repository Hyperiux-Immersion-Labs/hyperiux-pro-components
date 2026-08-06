import HeadAnim from "@/components/Animations/HeadAnim";
import TextCloning from "@/components/text-cloning";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
      <DemoHeader logoColor='#FFFFFF' textColor="#ffffff" />

      <div className="absolute inset-0 z-1 flex h-full w-full flex-col items-center gap-[1vw] px-[5vw] pt-[7%] max-[1025px]:pt-[15%] max-md:pt-[30%]">
        <HeadAnim>
          <h1 className="text-[4vw] max-[1025px]:text-[7vw] max-md:text-[9vw]">
            Text Cloning
          </h1>
        </HeadAnim>

        <SplitLine
          as="p"
          start="top 120%"
          className="absolute bottom-[15%] w-[40%] text-center max-[1025px]:hidden"
        >
          Move your cursor anywhere on the screen to see the effect, or you can
          add characters whatever you want in the field below.
        </SplitLine>

        <SplitLine
          as="p"
          start="top 120%"
          className="absolute bottom-[15%] hidden w-[80%] text-center max-[1025px]:block max-[1025px]:text-[3vw] max-md:text-[4.5vw]"
        >
          Tap anywhere on the screen to see the effect, or you can add characters
          whatever you want in the field below.
        </SplitLine>
      </div>

      <TextCloning />
    </>
  );
};

export default page;
export async function generateMetadata() {
  return getDemoPageMetadata("text-cloning");
}
