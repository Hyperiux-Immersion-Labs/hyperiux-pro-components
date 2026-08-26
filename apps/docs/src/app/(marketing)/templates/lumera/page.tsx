// Built using Hyperiux Vault: https://vault.hyperiux.com
import "./lumera-styles.css";
import type { Metadata } from "next";
import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import ScrollTopOnLoad from "./ScrollTopOnLoad";
import Loader from "./Loader";
import ogImage from "./assets/og.png";
import Header from "./Header";
import Hero from "./Hero";
import About from "./About";
import HorizontalFeatureRevealSection from "./effects/horizontal-feature-reveal/HorizontalFeatureRevealSection";
import Service from "./Service";
import Works from "./Works";
import Project from "./Project";
import ShowCase from "./ShowCase";
import Gallery from "./Gallery";
import Bringing from "./Bringing";
import ProjectHover from "./ProjectHover";
import AnimatedFaq from "./effects/animated-faq";
import Highlights from "./Highlights";
import Roi from "./Roi";
import ParallaxFooter from "./effects/parallax-footer";
import CTA from "./CTA";

export const metadata: Metadata = {
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
    <div className="lumera-page relative">
      <Loader />
      <ScrollTopOnLoad />
      <LenisSmoothScroll />
      <Header />
      <Hero />
      <About />
      <HorizontalFeatureRevealSection />
      <Service />
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
