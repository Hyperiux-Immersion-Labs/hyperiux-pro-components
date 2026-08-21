import Hero from "./Hero";
import Portfolio from "./Portfolio";
import WhyWorkWithMe from "./WhyWorkWithMe";
import Services from "./Services";
import Awards from "./Awards";
import ClientsBlur from "./ClientsBlur";
import Connects from "./Connects";
import Testimonials from "./Testimonials";
import Faq from "./Faq";
import "./elenavoss.css";
import ReactLenis from "lenis/react";
import Footer from "./Footer";
import Header from "./Header";

const page = () => {
  return (
    <ReactLenis root>
      <div className="elenavoss-body">
        <Header/>
        <Hero />
        <Portfolio/>
        <WhyWorkWithMe/>
        <Services/>
        <Awards/>
        <ClientsBlur/>
        <Connects/>
        <Testimonials/>
        <Faq/>
        <Footer/>
      </div>
    </ReactLenis>
  );
};

export default page;
