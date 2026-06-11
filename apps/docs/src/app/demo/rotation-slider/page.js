
import RotationSlider from "@/components/rotation-slider";
import LenisSmoothScroll from"@/components/SmoothScroll/LenisScroll";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";

export default function Page() {
 

 return (
 <>
 <LenisSmoothScroll />
 <RotationSlider/>
 <ScrollBottom textColor={"text-black"}/>
 </>
 );
}
