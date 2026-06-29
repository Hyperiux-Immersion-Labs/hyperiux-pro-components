import { FooterParallax } from "./ParallaxFooter";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

const ParallaxFooter = () => {
 return (
 <>


 <div className="w-screen h-screen bg-[#ff6b00] relative z-2 flex justify-center items-center">
 <h1 className="text-[4vw] font-medium max-sm:text-[8.5vw] w-[70%] text-center">
 Scroll To See Parallax Effect
 </h1>
 </div>
 <FooterParallax footerClassName="bg-[#1a1a1a] text-white px-10 py-20">
 <div className="max-w-7xl mx-auto flex justify-between max-sm:flex-col max-sm:justify-start max-sm:gap-[12vw]">
 <div className="w-[40%] max-md:w-[70%] max-sm:w-[80%]">
 <h2 className="text-5xl font-semibold max-sm:text-[7.5vw]">
 Let’s build something insane
 </h2>
 <p className="mt-4 text-sm max-md:text-xl">
 Fully dynamic height. Add anything here - it just works.
 </p>
 </div>

 <div className="flex items-center justify-end w-fit">
<Link
  href="/effects"
  className="inline-flex items-center gap-1 rounded-full bg-white px-6 py-3 text-[#1a1a1a] transition-transform hover:scale-105"
>
  Browse effects
  <ArrowRight className="h-4 w-4" />
</Link>
 </div>
 </div>
 </FooterParallax>

 </>
 );
};

export default ParallaxFooter;
