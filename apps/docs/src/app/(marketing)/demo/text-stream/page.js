
import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import TextStream from "@/components/text-stream";
import HeadAnim from "@/components/Animations/HeadAnim";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";


const page = () => {
  return (
    <>
    <DemoHeader logoColor='#FFFFFF' textColor="#ffffff"/>
      <LenisSmoothScroll />
      <div className="fadeup">
      <TextStream />
      <ScrollBottom className="bottom-[3%] left-[20%]! gap-[1vw] max-sm:left-1/2!"/>

      </div>
      <div className=" px-[5vw] pt-[7%] flex flex-col gap-[2vw] text-white absolute inset-0 w-[40%] max-md:pt-[20%]">
        <HeadAnim> 
        <h1 className="text-[4vw]  max-md:text-[7vw]">
          Text Stream
        </h1>
        </HeadAnim>
        <SplitLine>
        <p className="max-md:hidden">
          &quot;Text Stream&quot; is a bi-directional Marquee of content being clipped with spotlight , scroll and see how it responds with your smooth flow of the scroll.
        </p>
        </SplitLine>

      </div>
    </>
  );
};

export default page;

export async function generateMetadata() {
  return getDemoPageMetadata("text-stream");
}
