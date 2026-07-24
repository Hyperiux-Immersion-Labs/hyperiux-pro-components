'use client'
import  { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

function usePrefersReducedMotion() {
 const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

 useEffect(() => {
 const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
 const update = () => setPrefersReducedMotion(mediaQuery.matches);
 update();
 mediaQuery.addEventListener("change", update);
 return () => mediaQuery.removeEventListener("change", update);
 }, []);

 return prefersReducedMotion;
}

const CircularSliderComp = ({ heading, para, data = [] }) => {
 const outerRef = useRef(null);
 const wheelRef = useRef(null);
 const reducedMotion = usePrefersReducedMotion();

 useEffect(() => {
 const ctx = gsap.context(() => {
 const wheel = wheelRef.current;
 const cards = gsap.utils.toArray(".wheel-card");

 const setup = () => {
 const radius = wheel.offsetWidth / 1.1;
 const center = wheel.offsetWidth / 2;
 const total = cards.length;
 const slice = (0.58 * Math.PI) / total;

 cards.forEach((item, i) => {
 const angle = i * slice;
 const x = center + radius * Math.sin(angle);
 const y = center - radius * Math.cos(angle);

 gsap.set(item, {
 rotation: `${angle}_rad`,
 xPercent: -50,
 yPercent: -50,
 x,
 y,
 });
 });
 };

 setup();
 window.addEventListener("resize", setup);

 gsap.to(wheel, {
 rotate: -87,
 ease:"none",
 scrollTrigger: {
 trigger: outerRef.current,
 start:"top top",
 end:"+=1500 top",
 scrub: 0.25,
 invalidateOnRefresh: true,
 },
 });

 return () => {
 window.removeEventListener("resize", setup);
 };
 }, outerRef);

 return () => ctx.revert();
 }, []);

 return (
 <>

 <section
 ref={outerRef}
 className="max-xl:hidden relative h-[250vh]"
 >
 <div
 className="sticky top-0 h-screen flex flex-col items-center justify-between pb-[3%] overflow-hidden"
 >
 <div className="w-full flex justify-center pt-[6%]">
 <h2 className="text-[2.5vw] uppercase tracking-widest text-center">
 {heading}
 </h2>
 </div>

 {/* Wheel */}
 <div className="absolute top-[65vw] w-full h-screen">
 <div
 ref={wheelRef}
 className="absolute flex items-center justify-center top-0 left-[49%] -translate-x-1/2 w-screen h-[100vw] max-w-[125vw] max-h-[125vw]"
 >
 {data.map((product, i) => (
 <div
 key={i}
 className="wheel-card absolute top-0 left-0"
 style={{ width:"23vw", height:"26vw" }}
 >
 <SliderCard
 heading={product.heading}
 text={product.text}
 link={product.link}
 bgColor={product.bgColor}
 textColor={product.textColor}
 />
 </div>
 ))}
 </div>
 </div>

 <div className="w-full flex justify-center pb-[2%]">
 <p className="font-light uppercase tracking-widest text-[2.2vw] text-center">
 {para}
 </p>
 </div>
 </div>
 </section>

 {/* Mobile / Tablet */}
 <section className="hidden max-xl:block py-[15vw] px-[5vw]">
 <h2 className="text-center max-xl:text-[3.5vw] max-md:text-[7vw] font-extralight uppercase tracking-widest mb-[10vw]">
 {heading}
 </h2>
 <div className="flex flex-col items-center gap-[5vw] max-md:gap-[10vw]">
 {data.map((product, i) => (
 <div
 key={i}
 className="w-[85vw] max-xl:w-full rounded-[5vw] overflow-hidden"
 >
 <SliderCard
 heading={product.heading}
 text={product.text}
 link={product.link}
 bgColor={product.bgColor}
 textColor={product.textColor}
 />
 </div>
 ))}
 </div>
 <p className="text-center font-light uppercase tracking-widest max-xl:text-[2.5vw] max-md:text-[6vw] mt-[10vw]">
 {para}
 </p>
 </section>

 {reducedMotion && (
 <div
 aria-live="polite"
 className="pointer-events-none fixed bottom-6 right-6 z-60 w-fit max-w-[min(90vw,26rem)] rounded-md border border-black/10 bg-white p-6 text-center shadow-sm"
 >
 <h2 className="text-[1.15vw] max-xl:text-[2vw] max-md:text-[3.5vw] leading-none text-black">
 This effect can&apos;t be reduced.
 </h2>
 <p className="mx-auto mt-4 text-sm leading-6 text-black">
 Reduced motion is enabled, but this effect relies on continuous
 scroll-driven rotation around the wheel, and can&apos;t be
 simplified to a fade without losing the effect entirely.
 </p>
 </div>
 )}
 </>
 );
};

export default CircularSliderComp;


const SliderCard = ({ heading, text, link, bgColor, textColor }) => {
 const cardContent = (
 <div
 className="w-full h-full max-xl:h-auto rounded-[1.5vw] max-xl:rounded-[5vw] max-md:rounded-2xl flex flex-col items-stretch justify-between gap-10 max-xl:gap-8 max-md:gap-6 hover:shadow-xl transition-all duration-500 px-[10%] max-xl:px-[8%] max-md:px-6 py-20 max-xl:py-12 max-md:py-10"
 style={{
 backgroundColor: bgColor ||"rgba(255,255,255,0.7)",
 color: textColor ||"inherit",
 }}
 >
 <div className="flex flex-col items-center gap-4 max-md:gap-4 justify-center">
 <h2
 className="text-center font-medium text-[1.8vw] max-xl:text-3xl max-md:text-2xl uppercase"
 style={{ color: textColor ||"inherit" }}
 >
 {heading}
 </h2>
 <p
 className="text-[1.15vw] max-md:text-lg max-xl:text-xl text-center mt-[0.5vw] max-md:mt-1"
 style={{ color: textColor ||"inherit" }}
 >
 {text}
 </p>
 </div>

 <div className="mt-[1vw] max-md:mt-2 flex items-center cursor-pointer justify-center gap-[0.5vw] max-md:gap-2 group/btn">
 <span
 className="text-[1vw] max-md:text-xs max-xl:text-lg uppercase tracking-widest"
 style={{ color: textColor ||"inherit" }}
 >
 See More
 </span>
 <ArrowRight />
 </div>
 </div>
 );

 if (!link) {
 return cardContent;
 }

 return (
 <a href={link} className="block w-full h-full max-xl:h-auto">
 {cardContent}
 </a>
 );
 };
