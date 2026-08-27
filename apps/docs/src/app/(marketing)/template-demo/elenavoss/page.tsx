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
import Clients from "./Clients";
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
    // Imported like every other image in this template, not a public/
    // path. Next's metadata resolver looks for an item.url string, not
    // .src, so the raw import object can't be passed directly - it'd
    // resolve to undefined and get silently dropped. Building the
    // descriptor from ogImage.src/.width/.height instead resolves to the
    // real, build-generated /_next/static/media/... URL Next.js serves
    // for this file, so it's still a genuinely fetchable URL for social
    // crawlers - width/height come from the actual file, not hand-typed.
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
          <Clients/>
          <Testimonials/>
          <Faq/>
          <Footer/>
        </div>
      </GetInTouchModalProvider>
    </ReactLenis>
  );
};

export default page;
