// Built using Hyperiux Vault: https://vault.hyperiux.com
import dynamic from "next/dynamic";
import { pageMetadata } from "./metadata";
import Hero from "./components/home/Hero";
import ReelReveal from "./components/home/ReelReveal";

const ClientMarquee = dynamic(() => import("./components/home/ClientMarquee"));
const Intro = dynamic(() => import("./components/home/Intro"));
const WorkScroll = dynamic(() => import("./components/home/WorkScroll"));
const PixelProcess = dynamic(() => import("./components/home/PixelProcess"));
const Services = dynamic(() => import("./components/home/Services"));
const Testimonials = dynamic(() => import("./components/home/Testimonials"));
const Journal = dynamic(() => import("./components/home/Journal"));

export const metadata = pageMetadata(
  "The Missing Pixel - Brand and Digital Studio Template",
  "A multi-page template for a brand and digital studio, featuring a pixel page transition, a scroll-opening showreel, a horizontal work gallery, pixel scrollytelling, a playable footer and a synthesised soundtrack.",
);

const page = () => {
  return (
    <>
      <Hero />
      <ReelReveal />
      <ClientMarquee />
      <Intro />
      <WorkScroll />
      <PixelProcess />
      <Services />
      <Testimonials />
      <Journal />
    </>
  );
};

export default page;
