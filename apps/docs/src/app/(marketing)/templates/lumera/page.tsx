// Built using Hyperiux Vault: https://vault.hyperiux.com
import "@/components/templates/lumera/globals.css";
import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import ScrollTopOnLoad from "@/components/templates/lumera/ScrollTopOnLoad";
import ogImage from "@/components/templates/lumera/assets/og.png";
import Header from "@/components/templates/lumera/Header";
import Hero from "@/components/templates/lumera/Hero";
import About from "@/components/templates/lumera/About";
import HorizontalFeatureRevealSection from "@/components/templates/lumera/VaultComp/HorizontalFeatureRevealSection";
import Service from "@/components/templates/lumera/Service";
import Works from "@/components/templates/lumera/Works";
import Project from "@/components/templates/lumera/Project";
import ShowCase from "@/components/templates/lumera/ShowCase";
import Gallery from "@/components/templates/lumera/Gallery";
import Bringing from "@/components/templates/lumera/Bringing";
import ProjectHover from "@/components/templates/lumera/ProjectHover";
import AnimatedFaq from "@/components/templates/lumera/VaultComp/animated-faq";
import Highlights from "@/components/templates/lumera/Highlights";
import Roi from "@/components/templates/lumera/Roi";
import ParallaxFooter from "@/components/templates/lumera/VaultComp/parallax-footer";
import CTA from "@/components/templates/lumera/CTA";

export const metadata = {
  title: "Lumera Heights - Luxury Dubai Real Estate Template",
  description:
    "A single-page luxury real estate template for Dubai property launches, featuring residences, amenities, gallery, nearby highlights, and enquiry flows.",
  openGraph: {
    title: "Lumera Heights - Luxury Dubai Real Estate Template",
    description:
      "A single-page luxury real estate template for Dubai property launches, featuring residences, amenities, gallery, nearby highlights, and enquiry flows.",
    images: [{ url: ogImage.src, width: ogImage.width, height: ogImage.height }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumera Heights - Luxury Dubai Real Estate Template",
    description:
      "A single-page luxury real estate template for Dubai property launches, featuring residences, amenities, gallery, nearby highlights, and enquiry flows.",
    images: [ogImage.src],
  },
};

export default function Page() {
  return (
    <div className="relative">
      <ScrollTopOnLoad />
      <LenisSmoothScroll />
      <Header />
      {/* <Hero />
      <About />
      <HorizontalFeatureRevealSection />
      <Service /> */}
      <Works />
      <Project />
      <ShowCase />
      <Gallery/>
      <Bringing />
      <ProjectHover />
      <AnimatedFaq />
      <Highlights />
      <Roi />
      <CTA />
      <ParallaxFooter />
    </div>
  );
}
