import "@/components/templates/lumera/globals.css";
import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import Header from "@/components/templates/lumera/Header";
import Hero from "@/components/templates/lumera/Hero";
import About from "@/components/templates/lumera/About";
import TextFillAnimationSection from "@/components/templates/lumera/VaultComp/TextFillAnimationSection";
import HorizontalFeatureRevealSection from "@/components/templates/lumera/VaultComp/HorizontalFeatureRevealSection";
import Service from "@/components/templates/lumera/Service";
import Works from "@/components/templates/lumera/Works";
import Project from "@/components/templates/lumera/Project";
import ShowCase from "@/components/templates/lumera/ShowCase";
import Gallery from "@/components/templates/lumera/Gallery";
import Bringing from "@/components/templates/lumera/Bringing";
import ProjectHover from "@/components/templates/lumera/ProjectHover";
import Faq from "@/components/templates/lumera/Faq";
import Highlights from "@/components/templates/lumera/Highlights";
import Roi from "@/components/templates/lumera/Roi";
import Footer from "@/components/templates/lumera/Footer";
import CTA from "@/components/templates/lumera/CTA";



export default function Page() {
  return (
    <div className="relative">
      <LenisSmoothScroll />
      <Header />
      <Hero />
      <About />
      <TextFillAnimationSection />
      <HorizontalFeatureRevealSection />
      <Service />
      <Works />
      <Project />
      <ShowCase />
      
     <Gallery/>
      <Bringing />
      <ProjectHover />
      <Faq />
      <Highlights />
      <Roi />
      <CTA />
      
      <Footer />
    </div>
  );
}
