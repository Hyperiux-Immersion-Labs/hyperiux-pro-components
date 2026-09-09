import type { Metadata } from "next";
import ogImage from "./assets/og-image.webp";
import Hero from "./Hero";
import Portfolio from "./Portfolio";
import WhyWorkWithMe from "./WhyWorkWithMe";
import Services from "./Services";
import Awards from "./Awards";
import Testimonials from "./Testimonials";
import Faq from "./Faq";
import "./elenavoss.css";
import ReactLenis from "lenis/react";
import Footer from "./Footer";
import Header from "./Header";
import SectionBreak from "./SectionBreak";
import { GetInTouchModalProvider } from "./GetInTouchModal";

const TITLE = "Elena Voss - Creative Web Designer Portfolio Template";
const DESCRIPTION =
  "A single-page portfolio template for creative web designers - award-winning work, services, testimonials, and client showcase, built with GSAP scroll animations.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,

    images: [
      {
        url: ogImage.src,
        width: ogImage.width,
        height: ogImage.height,
        alt: TITLE,
      },
    ],
  },
};

const page = () => {
  return (
    <ReactLenis root>
      <GetInTouchModalProvider>
        <div className="elenavoss-body">
          <Header/>
          <Hero />
          <Portfolio/>
          <WhyWorkWithMe/>
          <Services/>
          <Awards/>
          <SectionBreak/>
          <Testimonials/>
          <Faq/>
          <Footer/>
        </div>
      </GetInTouchModalProvider>
    </ReactLenis>
  );
};

export default page;
