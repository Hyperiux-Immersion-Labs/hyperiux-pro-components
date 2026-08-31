import "./kyntra-styles.css";
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import SectionBreak from './components/SectionBreak'
import Features from './components/Features'
import Smarter from './components/Smarter'
import HowKyntraWorks from './components/HowKyntraWorks'
import KyntraFaq from './components/KyntraFaq'
import CTA from './components/CTA'
import ParallaxFooter from './components/effects/parallax-footer'
import LenisSmoothScroll from "./components/LenisSmoothScroll";
import Trust from "./components/Trust";
import Perspective from "./components/Perspective";
import Experience from "./components/Experience";

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
        <Perspective />
        <Experience />
        <KyntraFaq />
        <CTA />
        <ParallaxFooter />
    </div>
  );
};

export default page;
