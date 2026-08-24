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

export const metadata = {
  title: "Elena Voss - Creative Web Designer Portfolio Template",
  description:
    "A single-page portfolio template for creative web designers - award-winning work, services, testimonials, and client showcase, built with GSAP scroll animations.",
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
