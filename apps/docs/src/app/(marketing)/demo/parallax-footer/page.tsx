import ParallaxFooter from "@/components/parallax-footer";
import { ReactLenis } from "lenis/react";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <ReactLenis root>
      <ParallaxFooter />
    </ReactLenis>
  );
};

export default page;

export async function generateMetadata() {
  return getDemoPageMetadata("parallax-footer");
}
