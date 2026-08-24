import "@/components/templates/lumera/globals.css";
import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import Hero from "@/components/templates/lumera/Hero";
import About from "@/components/templates/lumera/About";
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

export default function Page() {
  return (
    <div>
      <LenisSmoothScroll />
      <Hero />
      <About />
      <Service />
      <Works />
      <Project />
      <ShowCase />
      <Gallery />
      <Bringing />
      <ProjectHover />
      <Faq />
      <Highlights />
      <Roi />
      <Footer />
    </div>
  );
}
