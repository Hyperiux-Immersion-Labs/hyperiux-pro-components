import "./kyntra-styles.css";
import type { Metadata } from "next";
import ogImage from "./assets/kyntra-og.png";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import SectionBreak from "./components/SectionBreak";
import Features from "./components/Features";
import Smarter from "./components/Smarter";
import HowKyntraWorks from "./components/HowKyntraWorks";
import KyntraFaq from "./components/KyntraFaq";
import CTA from "./components/CTA";
import ParallaxFooter from "./components/effects/parallax-footer";
import LenisSmoothScroll from "./components/LenisSmoothScroll";
import Trust from "./components/Trust";
import Perspective from "./components/Perspective";
import Experience from "./components/Experience";

const title = "Kyntra - Smart Home Management App Template";
const description =
  "A single page app landing template for home maintenance and service booking, featuring appliance records, warranties, repair history, trusted professionals and download flows.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    images: [
      { url: ogImage.src, width: ogImage.width, height: ogImage.height },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage.src],
  },
};

const page = () => {
  return (
    <div className="kyntra-page relative">
      <LenisSmoothScroll />
      <Header />
      <Hero />
      <About />
      <SectionBreak />
      <Features />
      <Smarter />
      <HowKyntraWorks />
      <Trust />
      <Experience />
      <Perspective />
      <KyntraFaq />
      <CTA />
      <ParallaxFooter />
    </div>
  );
};

export default page;
